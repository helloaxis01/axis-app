"use strict";
const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawnSync, spawn } = require("child_process");

/** Folder that contains this script's package.json (031726 REBUILD root). */
const rebuildRoot = path.resolve(__dirname, "..");
const PORT = Number(process.env.PREVIEW_PORT) || 4173;

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Walk up from startDir to find the full AXIS repo (axis-app + build.js + sync script).
 */
function findFullAxisRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const pkgPath = path.join(dir, "package.json");
    const buildJs = path.join(dir, "build.js");
    const sync = path.join(dir, "scripts", "sync-main-index.cjs");
    const pkg = fs.existsSync(pkgPath) ? readJson(pkgPath) : null;
    const name = pkg && pkg.name;
    if (name === "axis-app" && fs.existsSync(buildJs) && fs.existsSync(sync)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function portInUse(p) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", (err) => resolve(err.code === "EADDRINUSE"));
    s.listen(p, "0.0.0.0", () => {
      s.close(() => resolve(false));
    });
  });
}

async function main() {
  const busy = await portInUse(PORT);
  if (busy) {
    console.error(
      `\nPreview port ${PORT} is already in use.\n` +
        `  lsof -nP -iTCP:${PORT} -sTCP:LISTEN\n` +
        `  kill <PID>\n` +
        `Or: PREVIEW_PORT=4174 npm run preview\n`
    );
    process.exit(1);
  }

  const forcePublicWeb =
    process.env.PREVIEW_PUBLIC_WEB === "1" || /^true$/i.test(String(process.env.PREVIEW_PUBLIC_WEB || ""));
  const fullRoot = forcePublicWeb ? null : findFullAxisRoot(rebuildRoot);
  const publicWeb = path.join(rebuildRoot, "public_web");
  const publicWebIndex = path.join(publicWeb, "index.html");
  const distRoot = path.join(rebuildRoot, "dist");
  const distIndex = path.join(distRoot, "index.html");
  const hasStaticShell = fs.existsSync(publicWebIndex);
  const hasDistBuild = fs.existsSync(distIndex);

  if (fullRoot) {
    console.log("axis-app root:", fullRoot);
    const build = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
      cwd: fullRoot,
      stdio: "inherit",
      env: process.env,
    });
    if (build.status !== 0) process.exit(build.status ?? 1);

    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(npx, ["--yes", "serve", "-l", String(PORT), "dist"], {
      cwd: fullRoot,
      stdio: "inherit",
      env: process.env,
    });
    console.warn(
      "\nNote: Serving the parent axis-app dist/ folder, not public_web/. " +
        "Onboarding edits in public_web won’t appear until you run npm run sync:onboarding-dist here (or PREVIEW_PUBLIC_WEB=1 npm run preview to force public_web).\n"
    );
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  if (hasStaticShell) {
    console.warn(
      "No parent axis-app repo found (expected a folder above this one with package.json name \"axis-app\", build.js, and scripts/sync-main-index.cjs).\n" +
        "Serving public_web/ only (no Babel dist build). For full preview run from the complete AXIS clone or restore package.json at the repo root.\n"
    );
    // Run serve with cwd = public_web so ./serve.json is picked up (Cache-Control / rewrites).
    // Serving "public_web" from repo root often ignores nested serve.json → stale HTML/JS in browsers.
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(npx, ["--yes", "serve", "-l", String(PORT), "."], {
      cwd: publicWeb,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  if (hasDistBuild) {
    console.warn(
      `Serving dist/ (built bundle): ${distRoot}\n` +
        `  public_web/index.html was missing; using ${distIndex}\n` +
        "  Run npm run cap:sync or sync-main-index from your full axis-app clone to refresh public_web/index.html.\n"
    );
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(npx, ["--yes", "serve", "-l", String(PORT), "dist"], {
      cwd: rebuildRoot,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  console.error(
    "Cannot start preview.\n" +
      `  Repo root: ${rebuildRoot}\n` +
      `  Missing: ${publicWebIndex}\n` +
      `  Missing: ${distIndex}\n` +
      "\nFix:\n" +
      "  • From the full AXIS repo that has build.js + scripts/sync-main-index.cjs, run npm run build && npm run cap:sync (or your sync script) so public_web/index.html is copied here.\n" +
      "  • Or run npm from this folder only: cd \"…/031726 REBUILD\" && npm run preview\n" +
      "    (npm commands must run where package.json exists — not from ~ or a parent folder without package.json.)\n"
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
