"use strict";
/**
 * Copies the canonical app shell into repo-root index.html before build.js → dist/.
 * Capacitor uses public_web/ — keep it in sync with 031726 REBUILD (or run npm run build).
 * To preview the same bundle as dist: npm run preview → http://localhost:4173/
 * preview:web serves public_web only (copy 031726 → public_web first if needed).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "031726 REBUILD", "public_web", "index.html");
const dest = path.join(root, "index.html");

if (!fs.existsSync(src)) {
  console.warn("sync-main-index: skip (missing):", src);
  process.exit(0);
}
fs.copyFileSync(src, dest);
console.log("sync-main-index: copied →", path.relative(root, dest));
