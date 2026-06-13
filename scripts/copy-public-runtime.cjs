"use strict";
/**
 * Keep critical runtime libraries outside public_web/vendor/ so local preview
 * servers and Cursor tooling can serve them even when vendor/ is ignored.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicWeb = path.join(root, "public_web");

const copies = [
  ["vendor/react.production.min.js", "react.production.min.js"],
  ["vendor/react-dom.production.min.js", "react-dom.production.min.js"],
];

for (const [fromRel, toRel] of copies) {
  const from = path.join(publicWeb, fromRel);
  const to = path.join(publicWeb, toRel);
  if (!fs.existsSync(from)) {
    console.error("copy-public-runtime: missing", fromRel);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log("copy-public-runtime:", toRel);
}
