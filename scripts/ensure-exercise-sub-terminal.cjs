"use strict";
/**
 * Ensure every exercise `sub` ends with . ! ? or … (append . if missing).
 * Run: node scripts/ensure-exercise-sub-terminal.cjs
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "public_web", "axis_data.json");

function ensureTerminalPeriod(s) {
  if (s == null || typeof s !== "string") return s;
  const t = s.trim();
  if (!t) return s;
  if (/[.!?…]$/.test(t)) return t;
  return t + ".";
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
  let n = 0;
  for (const track of Object.values(data.TRACKS || {})) {
    for (const sec of track.sections || []) {
      for (const ex of sec.exercises || []) {
        if (ex.sub == null || typeof ex.sub !== "string") continue;
        const next = ensureTerminalPeriod(ex.sub);
        if (next !== ex.sub) {
          ex.sub = next;
          n++;
        }
      }
    }
  }
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("ensure-exercise-sub-terminal:", n, "subs updated");
}

main();
