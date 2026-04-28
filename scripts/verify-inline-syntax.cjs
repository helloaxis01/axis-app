"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "public_web", "index.html");
const s = fs.readFileSync(file, "utf8");
const startMarker = "<script>// Development flag:";
const startIndex = s.indexOf(startMarker);
if (startIndex === -1) {
  console.error("verify-inline-syntax: start marker not found in", file);
  process.exit(1);
}
const afterScriptIdx = s.indexOf(">", startIndex) + 1;
const closeIdx = s.indexOf("</script>", afterScriptIdx);
if (closeIdx === -1) {
  console.error("verify-inline-syntax: closing </script> not found");
  process.exit(1);
}
const code = s.slice(afterScriptIdx, closeIdx);
try {
  new Function(code);
} catch (e) {
  console.error("verify-inline-syntax: main inline script is invalid JavaScript");
  console.error(e && e.message);
  process.exit(1);
}
console.log("verify-inline-syntax: ok (" + code.length + " bytes)");
