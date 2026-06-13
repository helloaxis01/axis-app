"use strict";
/**
 * Compile onboarding JSX once at build time so onboarding.html does not need
 * runtime Babel in the browser.
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "public_web", "onboarding.js");
const out = path.join(root, "public_web", "onboarding.compiled.js");
const react = path.join(root, "public_web", "vendor", "react.production.min.js");
const reactDom = path.join(root, "public_web", "vendor", "react-dom.production.min.js");

const input = fs.readFileSync(src, "utf8");
const result = esbuild.transformSync(input, {
  loader: "jsx",
  target: "es2019",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  sourcemap: false,
});

const bundled = [
  "/* AXIS onboarding compiled bundle: React + ReactDOM + onboarding app. */",
  fs.readFileSync(react, "utf8"),
  fs.readFileSync(reactDom, "utf8"),
  result.code,
  "",
].join("\n");

fs.writeFileSync(out, bundled, "utf8");
console.log("compile-onboarding:", path.relative(root, out));
