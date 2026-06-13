"use strict";
/**
 * Stamp deploy cache-bust tokens from git SHA (Vercel) before static output is published.
 * Run on Vercel via buildCommand; locally: npm run build
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const publicWeb = path.join(root, "public_web");
const indexPath = path.join(publicWeb, "index.html");
const appJsPath = path.join(publicWeb, "app.js");
const manifestPath = path.join(publicWeb, "manifest.webmanifest");
const buildIdPath = path.join(publicWeb, "build-id.txt");
const buildLockPath = path.join(publicWeb, "build-lock.json");

function gitOutput(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (_e) {
    return "";
  }
}

function writeBuildLock(buildId) {
  const lock = {
    buildId,
    lockedAt: new Date().toISOString(),
    branch: gitOutput("rev-parse --abbrev-ref HEAD"),
    commit: gitOutput("rev-parse HEAD"),
    webRoot: "public_web",
    vercel: {
      buildCommand: "npm run build",
      outputDirectory: "public_web",
      productionBranch: "sync/axis-static-desktop",
    },
    capacitor: {
      webDir: "public_web",
      appId: "com.helloaxis.app",
    },
  };
  fs.writeFileSync(buildLockPath, JSON.stringify(lock, null, 2) + "\n", "utf8");
}

function resolveBuildId() {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CF_PAGES_COMMIT_SHA;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().slice(0, 12);
  }
  try {
    const base = execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const dirtyDiff = execSync(
      "git diff -- public_web scripts package.json ios android",
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 1024 * 1024 * 20,
      }
    );
    if (dirtyDiff && dirtyDiff.trim()) {
      const dirtyHash = crypto.createHash("sha1").update(dirtyDiff).digest("hex").slice(0, 7);
      return `${base}-${dirtyHash}`;
    }
    return base;
  } catch (e) {
    return Date.now().toString(36);
  }
}

function stampScriptSrc(html, file, buildId) {
  const escaped = file.replace(/\./g, "\\.");
  const re = new RegExp(
    `(src="(?:\\./)?${escaped})(?:\\?[^"]*)?"`,
    "g"
  );
  return html.replace(re, `$1?cb=${buildId}"`);
}

function stampStylesheetHref(html, file, buildId) {
  const escaped = file.replace(/\./g, "\\.");
  const re = new RegExp(
    `(href="(?:\\./)?${escaped})(?:\\?[^"]*)?"`,
    "g"
  );
  return html.replace(re, `$1?cb=${buildId}"`);
}

function stampModuleAppJs(html, buildId) {
  return html.replace(/(\.\/app\.js)\?cb=[^"']+/g, `$1?cb=${buildId}`);
}

/** Cache-bust ES module imports inside app.js (Capacitor WKWebView caches aggressively). */
function stampAppJsModuleImports(appJs, buildId) {
  let s = appJs;
  s = s.replace(
    /from ['"]\.\/components\/WorkoutApp\.js(?:\?[^'"]*)?['"]/g,
    `from './components/WorkoutApp.js?cb=${buildId}'`
  );
  s = s.replace(
    /import\(['"]\.\/components\/WorkoutApp\.js(?:\?[^'"]*)?['"]\)/g,
    `import("./components/WorkoutApp.js?cb=${buildId}")`
  );
  s = s.replace(
    /import\(['"]\.\/vendor\/axis-native\.mjs(?:\?[^'"]*)?['"]\)/g,
    `import("./vendor/axis-native.mjs?cb=${buildId}")`
  );
  return s;
}

function stampManifestHref(html, buildId) {
  return html.replace(
    /(href="\.\/manifest\.webmanifest)(?:\?[^"]*)?"/g,
    `$1?v=${buildId}"`
  );
}

function ensureBuildScripts(html, buildId) {
  const buildAssign = `window.AXIS_BUILD="${buildId}";`;
  const block = [
    "<script>",
    buildAssign,
    "(function(){",
    '  var b=window.AXIS_BUILD||"";',
    "  if(!b)return;",
    "  try{",
    '    var k="axis_app_build",p=localStorage.getItem(k);',
    "    if(p&&p!==b){",
    "      localStorage.setItem(k,b);",
    '      if(!/[?&]_=/.test(location.search)){',
    "        var u=new URL(location.href);",
    '        u.searchParams.set("_",b);',
    "        location.replace(u.href);",
    "        return;",
    "      }",
    "    }",
    "    if(!p)localStorage.setItem(k,b);",
    "  }catch(e){}",
    "})();",
    "</script>",
  ].join("\n");

  const marker = "<!-- axis-build-stamp -->";
  if (html.includes(marker)) {
    return html.replace(
      /<!-- axis-build-stamp -->[\s\S]*?<!-- \/axis-build-stamp -->/,
      `${marker}\n${block}\n<!-- /axis-build-stamp -->`
    );
  }
  return html.replace(
    "<meta charset=\"UTF-8\" />",
    `<meta charset="UTF-8" />\n  ${marker}\n  ${block}\n  <!-- /axis-build-stamp -->`
  );
}

function stampManifestJson(manifest, buildId) {
  const data = JSON.parse(manifest);
  data.start_url = `./index.html?v=${buildId}`;
  return JSON.stringify(data, null, 2) + "\n";
}

function main() {
  const buildId = resolveBuildId();
  if (!buildId) {
    console.error("stamp-build: could not resolve build id");
    process.exit(1);
  }

  let indexHtml = fs.readFileSync(indexPath, "utf8");
  indexHtml = stampModuleAppJs(indexHtml, buildId);
  indexHtml = stampStylesheetHref(indexHtml, "app.css", buildId);
  indexHtml = stampScriptSrc(indexHtml, "auth-bundle.js", buildId);
  indexHtml = stampScriptSrc(indexHtml, "axis_data_runtime.js", buildId);
  indexHtml = stampManifestHref(indexHtml, buildId);
  indexHtml = ensureBuildScripts(indexHtml, buildId);
  fs.writeFileSync(indexPath, indexHtml, "utf8");

  if (fs.existsSync(appJsPath)) {
    const appJs = fs.readFileSync(appJsPath, "utf8");
    fs.writeFileSync(appJsPath, stampAppJsModuleImports(appJs, buildId), "utf8");
  }

  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, "utf8");
    fs.writeFileSync(manifestPath, stampManifestJson(manifest, buildId), "utf8");
  }

  fs.writeFileSync(buildIdPath, buildId + "\n", "utf8");
  writeBuildLock(buildId);

  console.log("stamp-build:", buildId, "| index.html, app.js, manifest.webmanifest, build-id.txt, build-lock.json");
}

main();
