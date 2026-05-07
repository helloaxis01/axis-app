"use strict";
/**
 * Run `npm run cap:sync` from the parent folder when this rebuild lives inside a full AXIS clone
 * (e.g. …/AXIS/031726 REBUILD → …/AXIS/package.json has cap:sync).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rebuildRoot = path.resolve(__dirname, "..");
const axisRoot = path.resolve(rebuildRoot, "..");
const pkgPath = path.join(axisRoot, "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error(
    "cap:sync: no parent package.json found.\n" +
      `  Expected something like: ${path.join(axisRoot, "package.json")}\n` +
      "  Use your full AXIS clone (the repo that contains build.js and capacitor), then:\n" +
      "    cd <that-folder>\n" +
      "    npm run cap:sync\n"
  );
  process.exit(1);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
} catch {
  console.error("cap:sync: could not read", pkgPath);
  process.exit(1);
}

const script = pkg.scripts && pkg.scripts["cap:sync"];
if (!script) {
  console.error(
    `cap:sync: parent package "${pkg.name || "(unknown)"}" has no cap:sync script.\n` +
      `  ${pkgPath}\n` +
      "  Open that repo and run npm run cap:sync there.\n"
  );
  process.exit(1);
}

console.log("Running npm run cap:sync in:\n  ", axisRoot);
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const r = spawnSync(npmCmd, ["run", "cap:sync"], {
  cwd: axisRoot,
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status !== null && r.status !== undefined ? r.status : 1);
