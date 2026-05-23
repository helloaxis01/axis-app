"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const appJs = path.join(root, "public_web", "app.js");
const workoutJs = path.join(root, "public_web", "components", "WorkoutApp.js");
const code = fs.readFileSync(appJs, "utf8");
const startMarker = "// Development flag:";
if (!code.includes(startMarker)) {
  console.error("verify-inline-syntax: start marker not found in", appJs);
  process.exit(1);
}

function checkModuleSyntax(filePath) {
  execSync(`node --check "${filePath}"`, { stdio: "pipe" });
}

try {
  checkModuleSyntax(appJs);
  checkModuleSyntax(workoutJs);
} catch (e) {
  console.error("verify-inline-syntax: ES module syntax check failed");
  console.error(e && (e.stderr ? e.stderr.toString() : e.message));
  process.exit(1);
}
console.log("verify-inline-syntax: ok (" + code.length + " bytes app.js)");

/* Guard: Vercel must deploy public_web/onboarding.html, not a legacy/preview copy (e.g. preview-2006cb5) */
const obFile = path.join(root, "public_web", "onboarding.html");
const ob = fs.readFileSync(obFile, "utf8");
if (!ob.includes("ob-ultra-eye-mark")) {
  console.error(
    "verify-inline-syntax: public_web/onboarding.html must include Ultra slide marker ob-ultra-eye-mark",
    "(wrong onboarding.html being deployed?)"
  );
  process.exit(1);
}
if (!ob.includes("ob-appearance-mood-rail")) {
  console.error(
    "verify-inline-syntax: public_web/onboarding.html must include Appearance/Mood rail ob-appearance-mood-rail"
  );
  process.exit(1);
}
console.log("verify-inline-syntax: onboarding.html canonical markers ok");
