"use strict";
/**
 * Remove heavy web-only files from Capacitor copies to cut launch memory / watchdog risk.
 * Run after `npx cap sync`.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicRoots = [
  path.join(root, "ios", "App", "App", "public"),
  path.join(root, "android", "app", "src", "main", "assets", "public"),
];

const removeRelPaths = [
  "auth-bundle.js",
  "vendor/babel.min.js",
  "vendor/three.module.js",
  "components/WorkoutApp.js.orig",
  "components/WorkoutApp.js.bak",
];

function rm(target) {
  try {
    if (!fs.existsSync(target)) return;
    fs.rmSync(target, { force: true, recursive: true });
    console.log("prune-native-public: removed", path.relative(root, target));
  } catch (e) {
    console.warn("prune-native-public: could not remove", target, e.message);
  }
}

for (const publicRoot of publicRoots) {
  if (!fs.existsSync(publicRoot)) continue;
  for (const rel of removeRelPaths) {
    rm(path.join(publicRoot, rel));
  }
  try {
    for (const name of fs.readdirSync(publicRoot)) {
      if (/ \d+\./.test(name)) {
        rm(path.join(publicRoot, name));
      }
    }
  } catch (_e) {}
}

console.log("prune-native-public: done");
