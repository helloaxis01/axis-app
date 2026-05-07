#!/usr/bin/env node
"use strict";
/**
 * Copy public_web onboarding assets into axis-app/dist (or AXIS_DIST) so edits here
 * show up when you run npm run preview from the full axis-app repo.
 */
const fs = require("fs");
const path = require("path");

const rebuildRoot = path.resolve(__dirname, "..");
const publicWeb = path.join(rebuildRoot, "public_web");
const onboardingDir = path.join(publicWeb, "onboarding");

const destRaw = process.env.AXIS_DIST;
let destRoot = destRaw ? path.resolve(rebuildRoot, destRaw) : null;

function findAxisDist(start) {
  let dir = path.resolve(start);
  for (let i = 0; i < 14; i++) {
    const candidate = path.join(dir, "dist");
    const idx = path.join(candidate, "index.html");
    if (fs.existsSync(idx)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

if (!destRoot) destRoot = findAxisDist(rebuildRoot) || findAxisDist(path.join(rebuildRoot, ".."));

function copyMust(src, dst) {
  if (!fs.existsSync(src)) {
    console.error("Missing:", src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log("→", dst);
}

if (!destRoot || !fs.existsSync(destRoot)) {
  console.error(
    "Could not resolve dist folder. Set AXIS_DIST to absolute or relative-to-repo path, or run from inside a checkout where ../axis-app/dist exists.\n",
    `  Example: AXIS_DIST=../axis-app/dist node scripts/sync-onboarding-to-dist.cjs`
  );
  process.exit(1);
}

console.log("Target dist:", destRoot);
copyMust(path.join(publicWeb, "onboarding.html"), path.join(destRoot, "onboarding.html"));
copyMust(path.join(publicWeb, "onboarding.css"), path.join(destRoot, "onboarding.css"));
if (fs.existsSync(onboardingDir)) fs.cpSync(onboardingDir, path.join(destRoot, "onboarding"), { recursive: true });
console.log("\nCopied onboarding.html / onboarding.css / onboarding/");
console.log("(Also copy app-icons, axis-icon.png if dist is missing assets you need.)");
