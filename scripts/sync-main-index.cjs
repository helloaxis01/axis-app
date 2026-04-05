"use strict";
/**
 * Copies the canonical app shell into repo-root index.html before build.js → dist/.
 * Capacitor uses public_web/ — keep it in sync with 031726 REBUILD (or run npm run build).
 * To preview the same bundle as dist: npm run preview → http://localhost:4173/
 * Repo-root public_web/index.html is kept in sync for Capacitor / serve public_web.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "031726 REBUILD", "public_web", "index.html");
const dest = path.join(root, "index.html");
const destPublic = path.join(root, "public", "index.html");
const destPublicWeb = path.join(root, "public_web", "index.html");

if (!fs.existsSync(src)) {
  console.warn("sync-main-index: skip (missing):", src);
  process.exit(0);
}
fs.copyFileSync(src, dest);
console.log("sync-main-index: copied →", path.relative(root, dest));
fs.copyFileSync(src, destPublic);
console.log("sync-main-index: copied →", path.relative(root, destPublic));
fs.copyFileSync(src, destPublicWeb);
console.log("sync-main-index: copied →", path.relative(root, destPublicWeb));
