"use strict";
/**
 * Writes public_web/exercise-descriptions.txt with copy shown on exercise rows/cards
 * within a track (LIST / list-rail layout): `sub` plus the compact meta line next to duration.
 * Mirrors axisExerciseTargetMetaLine() in public_web/index.html.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "public_web", "axis_data.json");
const outPath = path.join(root, "public_web", "exercise-descriptions.txt");

const AXIS_EX_META_FOCUS_SKIP = new Set(["SETUP"]);

const AXIS_EX_META_FOCUS_LABELS = {
  SPINE: "Spine",
  FLEX: "Spine flexion",
  EXT: "Back extension",
  CORE: "Core",
  GLUTES: "Glutes",
  HIPS: "Hips",
  HAMSTRINGS: "Hamstrings",
  QUADS: "Quads",
  CALVES: "Calves",
  SHOULDERS: "Shoulders",
  CHEST: "Chest",
  BACK: "Back",
  NECK: "Neck",
  CERVICAL: "Neck",
  LATS: "Lats",
  ADDUCTORS: "Adductors",
  OBLIQUES: "Obliques",
  ANKLES: "Ankles",
  WRISTS: "Wrists",
  FOREARMS: "Forearms",
  STRETCH: "Stretch",
  RELEASE: "Release",
  STABILITY: "Stability",
  CONTROL: "Control",
  MOBILITY: "Mobility",
  ROTATE: "Rotation",
  TWIST: "Rotation",
  FORWARD: "Forward",
  BACKWARD: "Backward",
  HOLD: "Hold",
  ISO: "Isometric hold",
  ECCENTRIC: "Eccentric",
  PUSH: "Push",
  PULL: "Pull",
  RAISE: "Raise",
  LOWER: "Lower",
  RETRACT: "Neck retraction",
  DECOMPRESS: "Decompress",
  THORACIC: "Thoracic spine",
  LUMBAR: "Low back",
  SCAPULAR: "Shoulder blade",
  HIP: "Hip"
};

function axisTitleCaseToken(raw) {
  const s = String(raw || "")
    .trim()
    .replace(/_/g, " ")
    .toLowerCase();
  if (!s) return "";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function axisExerciseTargetMetaLine(ex, sectionFallback) {
  if (!ex) return String(sectionFallback || "").trim();
  const a = (ex.area != null && String(ex.area).trim()) || "";
  const t = (ex.targets != null && String(ex.targets).trim()) || "";
  if (a || t) return a || t;
  const steps = Array.isArray(ex.steps) ? ex.steps : [];
  const seen = new Set();
  const parts = [];
  for (const s of steps) {
    const raw = s && s.focus != null && String(s.focus).trim();
    if (!raw) continue;
    const key = raw.toUpperCase();
    if (AXIS_EX_META_FOCUS_SKIP.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = AXIS_EX_META_FOCUS_LABELS[key] || axisTitleCaseToken(key);
    if (label && parts.indexOf(label) === -1) parts.push(label);
    if (parts.length >= 2) break;
  }
  if (parts.length) return parts.join(" · ");
  return String(sectionFallback || "").trim();
}

function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const lines = [];
  const hr = "-".repeat(78);
  lines.push("AXIS — Copy shown on exercise cards within a track (LIST / session list)");
  lines.push("Per exercise: card description = JSON `sub`; meta line = small text beside duration in app.");
  lines.push("Source: public_web/axis_data.json · Regenerate: node scripts/export-exercise-card-copy.cjs");
  lines.push("Generated: " + new Date().toISOString());
  lines.push("");

  const TRACKS = data.TRACKS || {};
  for (const trackId of Object.keys(TRACKS)) {
    const track = TRACKS[trackId];
    const trackLabel = track.label || trackId;
    for (const sec of track.sections || []) {
      const secLabel = sec.label || "";
      for (const ex of sec.exercises || []) {
        const meta = axisExerciseTargetMetaLine(ex, secLabel);
        lines.push(hr);
        lines.push(`Track: ${trackLabel}  [${trackId}]`);
        lines.push(`Section: ${secLabel}`);
        lines.push(`Exercise: ${ex.name}  [exercise id: ${ex.id}]`);
        lines.push(`Card description (sub): ${ex.sub != null && String(ex.sub).trim() ? ex.sub : "—"}`);
        lines.push(`Meta line (beside duration): ${meta || "—"}`);
        lines.push("");
      }
    }
  }
  lines.push(hr);
  lines.push("End of list.");

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log("Wrote", outPath, "(" + fs.statSync(outPath).size + " bytes)");
}

main();
