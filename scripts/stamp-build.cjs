"use strict";
/**
 * Stamp deploy cache-bust tokens from git SHA (Vercel) before static output is published.
 * Run on Vercel via buildCommand; locally: npm run build
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const publicWeb = path.join(root, "public_web");
const indexPath = path.join(publicWeb, "index.html");
const manifestPath = path.join(publicWeb, "manifest.webmanifest");
const buildIdPath = path.join(publicWeb, "build-id.txt");

function resolveBuildId() {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CF_PAGES_COMMIT_SHA;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().slice(0, 12);
  }
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
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

function stampAppJs(html, buildId) {
  return html.replace(/(\.\/app\.js)\?cb=[^"']+/g, `$1?cb=${buildId}`);
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
  indexHtml = stampAppJs(indexHtml, buildId);
  indexHtml = stampScriptSrc(indexHtml, "auth-bundle.js", buildId);
  indexHtml = stampScriptSrc(indexHtml, "axis_data.js", buildId);
  indexHtml = stampManifestHref(indexHtml, buildId);
  indexHtml = ensureBuildScripts(indexHtml, buildId);
  fs.writeFileSync(indexPath, indexHtml, "utf8");

  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, "utf8");
    fs.writeFileSync(manifestPath, stampManifestJson(manifest, buildId), "utf8");
  }

  fs.writeFileSync(buildIdPath, buildId + "\n", "utf8");

  console.log("stamp-build:", buildId, "| index.html, manifest.webmanifest, build-id.txt");
}

main();
