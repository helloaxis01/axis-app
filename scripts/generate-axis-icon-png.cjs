"use strict";
/**
 * Rasterize public_web/axis-icon.svg → public_web/axis-icon.png (180×180, iOS touch icon).
 * Requires: npm install sharp --save-dev   OR   npx (downloads sharp)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public_web", "axis-icon.svg");
const pngPath = path.join(root, "public_web", "axis-icon.png");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp: npm install sharp --save-dev");
    process.exit(1);
  }
  const buf = fs.readFileSync(svgPath);
  await sharp(buf).resize(180, 180).png().toFile(pngPath);
  console.log("Wrote", pngPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
