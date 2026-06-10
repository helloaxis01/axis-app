"use strict";
/**
 * Bundle Capacitor haptics bridge for the vanilla ES-module shell (no Vite).
 * Output: public_web/vendor/axis-native.mjs
 */
const esbuild = require("esbuild");
const path = require("path");

const root = path.resolve(__dirname, "..");
const entry = path.join(__dirname, "axis-native-entry.mjs");
const outfile = path.join(root, "public_web", "vendor", "axis-native.mjs");

async function main() {
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020", "safari14"],
    outfile,
    sourcemap: false,
    minify: true,
    logLevel: "info",
  });
  console.log("bundle-axis-native:", outfile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
