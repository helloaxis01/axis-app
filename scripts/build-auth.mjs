import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const outRoot = join(root, "auth-bundle.js");

await esbuild.build({
  entryPoints: [join(root, "src", "auth-entry.js")],
  bundle: true,
  outfile: outRoot,
  format: "iife",
  platform: "browser",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  legalComments: "none",
});
console.log("Built auth-bundle.js (repo root)");
