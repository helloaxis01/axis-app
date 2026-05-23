"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "public_web", "app.js");
const outPath = path.join(root, "public_web", "components", "WorkoutApp.js");
const appSrc = fs.readFileSync(appPath, "utf8");
const lines = appSrc.split("\n");

const exportFnStart = lines.findIndex((l) => l.startsWith("function axisExportAxisLocalData"));
const workoutStart = lines.findIndex((l) => l.startsWith("function WorkoutApp("));
const rootCommentIdx = lines.findIndex(
  (l, i) => i > workoutStart && l.includes("ROOT — onboarding")
);
if (exportFnStart < 0 || workoutStart < 0 || rootCommentIdx < 0) {
  console.error("markers not found", { exportFnStart, workoutStart, rootCommentIdx });
  process.exit(1);
}
const workoutEndLine = rootCommentIdx - 2;
const extracted = lines.slice(exportFnStart, workoutEndLine + 1).join("\n");
const preWorkout = lines.slice(0, exportFnStart).join("\n");
const postWorkout = lines.slice(workoutEndLine + 1).join("\n");

const bindingNames = new Set([
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useRef",
  "useId",
  "useCallback",
  "React",
  "ReactDOM",
]);
const bindingRe =
  /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^const\s+([A-Za-z_$][\w$]*)\s*=|^let\s+([A-Za-z_$][\w$]*)\s*=|^var\s+([A-Za-z_$][\w$]*)\s*=/gm;
let m;
while ((m = bindingRe.exec(preWorkout))) {
  bindingNames.add(m[1] || m[2] || m[3] || m[4]);
}

const reserved = new Set([
  "true", "false", "null", "undefined", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "new", "typeof", "instanceof", "in", "of",
  "const", "let", "var", "function", "async", "await", "try", "catch", "finally",
  "throw", "default", "this", "arguments", "void", "delete", "export", "import", "from",
]);
const used = new Set();
const idRe = /\b([A-Za-z_$][\w$]*)\b/g;
let im;
while ((im = idRe.exec(extracted))) {
  if (!reserved.has(im[1])) used.add(im[1]);
}

const exportNames = [...bindingNames]
  .filter((n) => used.has(n))
  .sort();

const importBlock =
  "import {\n  " +
  exportNames.join(",\n  ") +
  "\n} from '../app.js';\n\n";

const workoutFile =
  importBlock +
  extracted.replace(/^function WorkoutApp/, "export function WorkoutApp") +
  "\n";

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, workoutFile, "utf8");

const exportBlock =
  "\n// ── ES module exports (for components/WorkoutApp.js) ──\nexport {\n  " +
  exportNames.join(",\n  ") +
  "\n};\n";

const importLine = "import { WorkoutApp } from './components/WorkoutApp.js';\n\n";
const hookLine = "const { useState, useEffect, useLayoutEffect, useRef, useId, useCallback } = React;\n";
const preWithImport = preWorkout.replace(
  hookLine,
  importLine + hookLine
);

const newApp = preWithImport + exportBlock + "\n" + postWorkout;
fs.writeFileSync(appPath, newApp, "utf8");

console.log("Wrote", outPath);
console.log("Exports:", exportNames.length);
console.log("app.js lines:", newApp.split("\n").length);
