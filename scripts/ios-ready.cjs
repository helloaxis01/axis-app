"use strict";
/**
 * Prepare iOS for Xcode Run: stamp web, bundle haptics bridge, cap sync, resolve SPM.
 */
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const iosApp = path.join(root, "ios", "App");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

function run(cmd, args, cwd = root) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status !== null ? r.status : 1);
}

console.log("AXIS iOS — syncing web + native plugins…\n");
run(npmCmd, ["run", "cap:sync"]);

console.log("\nResolving Swift packages…\n");
run("/usr/bin/xcodebuild", [
  "-project",
  path.join(iosApp, "App.xcodeproj"),
  "-scheme",
  "App",
  "-resolvePackageDependencies",
]);

console.log("\nDone. Opening Xcode (031726 REBUILD → ios/App/App.xcodeproj)…\n");
run(npxCmd, ["cap", "open", "ios"]);

console.log(
  "In Xcode:\n" +
    "  1. Device menu → your iPhone\n" +
    "  2. If signing fails: App target → Signing → pick your Team\n" +
    "  3. Press ▶ Run\n" +
    "  4. On phone: tap once, start a guided session (sound + haptics)\n"
);
