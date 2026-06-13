/**
 * Wire Markian demo MP4s to exercises by name in axis_data.json.
 * Copies from Videos/ → public_web/assets/exercise-animations/<slug>/ when source is newer.
 * Regenerates public_web/axis_data.js. Run: node scripts/patch-exercise-demo-videos.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "public_web", "axis_data.json");
const jsPath = path.join(root, "public_web", "axis_data.js");
const runtimeJsPath = path.join(root, "public_web", "axis_data_runtime.js");
const videosDir = path.join(root, "Videos");

/** Exercise display name (exact match) → asset folder + filename */
const VIDEO_BY_NAME = {
  "Cat-Cow": { dir: "cat-cow", file: "CatCow_Markian_Test.mp4" },
  "Cat–Cow": { dir: "cat-cow", file: "CatCow_Markian_Test.mp4" },
  "Sphinx Pose": { dir: "sphinx-pose", file: "SphinxPose_Markian_Test.mp4" },
  "Child's Pose": { dir: "childs-pose", file: "ChildsPose_Markian_Test.mp4" },
  "Arm Circles (Forwards)": {
    dir: "arm-circles-forward",
    file: "ArmCirclesForward_Markian_Test.mp4",
  },
  "Arm Circles (Backwards)": {
    dir: "arm-circles-backward",
    file: "ArmCirclesBackwards_Markian_Test.mp4",
  },
  "Forward / Backward Arm Circles": {
    dir: "arm-circles-forward",
    file: "ArmCirclesForward_Markian_Test.mp4",
  },
  "Pelvic Tilts": { dir: "pelvic-tilts", file: "PelvicTilts_Markian_Test.mp4" },
  "Supine Pelvic Tilts": { dir: "pelvic-tilts", file: "PelvicTilts_Markian_Test.mp4" },
  "Glute Bridge": { dir: "glute-bridge", file: "GluteBridge_Markian_Test.mp4" },
  "Marching Bridge": { dir: "marching-bridge", file: "MarchingBridge_Markian_Test.mp4" },
  "Dead Bug": { dir: "dead-bug", file: "DeadBug_Markian_Test.mp4" },
  "Bird Dog": { dir: "bird-dog", file: "BirdDog_Markian_Test.mp4" },
  "Modified Bird-Dog": { dir: "bird-dog", file: "BirdDog_Markian_Test.mp4" },
  "High Plank": { dir: "high-plank", file: "HighPlank_Markian_Test.mp4" },
  "Wall Push-Ups": { dir: "wall-push-up", file: "WallPushUp_Markian_Test.mp4" },
  "Wall Pushups": { dir: "wall-push-up", file: "WallPushUp_Markian_Test.mp4" },
  "Wall Pushes": { dir: "wall-push-up", file: "WallPushUp_Markian_Test.mp4" },
  "Forearm Plank": { dir: "forearm-plank", file: "ForearmPlank_Markian_Test.mp4" },
  "Isometric Wall Push Hold": {
    dir: "isometric-wall-push-hold",
    file: "IsometricWallPushHold_Markian_Test.mp4",
  },
  "Chin Tucks": { dir: "chin-tucks", file: "ChinTucks_Markian_Test.mp4" },
  "Neck Rolls": { dir: "neck-rolls", file: "NeckRolls_Markian_Test.mp4" },
  "Resistance Band Row": { dir: "resistance-band-row", file: "ResistanceBandRow_Markian_Test.mp4" },
  "Wall Angels": { dir: "wall-angels", file: "WallAngels_Markian_Test.mp4" },
  "Seated Forward Fold": { dir: "seated-forward-fold", file: "SeatedForwardFold_Markian_Test.mp4" },
  "Windshield Wipers": { dir: "windshield-wipers", file: "WindshieldWipers_Markian_Test.mp4" },
  "Supine Hamstring Stretch - Right Leg": {
    dir: "supine-hamstring-stretch-right",
    file: "SupineHamstringStretch-Right_Markian_Test.mp4",
  },
  "Supine Hamstring Stretch - Left Leg": {
    dir: "supine-hamstring-stretch-left",
    file: "SupineHamstringStretch-Left_Markian_Test.mp4",
  },
  "Figure Four Stretch - Right": {
    dir: "figure-four-right",
    file: "FigureFour-Right_Markian_Test.mp4",
  },
  "Figure Four Stretch - Left": {
    dir: "figure-four-left",
    file: "FigureFour-Left_Markian_Test.mp4",
  },
  "Supine Figure Four - Right Hip": {
    dir: "figure-four-right",
    file: "FigureFour-Right_Markian_Test.mp4",
  },
  "Supine Figure Four - Left Hip": {
    dir: "figure-four-left",
    file: "FigureFour-Left_Markian_Test.mp4",
  },
  "Reclined Spinal Twist - Right Side": {
    dir: "reclined-spinal-twist-right",
    file: "ReclinedSpinalTwist-Right_Markian_Test.mp4",
  },
  "Reclined Spinal Twist - Left Side": {
    dir: "reclined-spinal-twist-left",
    file: "ReclinedSpinalTwist-Left_Markian_Test.mp4",
  },
};

const SOURCE_FILE_BY_BASENAME = Object.fromEntries(
  Object.values(VIDEO_BY_NAME).map((v) => [v.file, v])
);

function copyVideoAssets() {
  if (!fs.existsSync(videosDir)) return { copied: 0, skipped: 0 };
  let copied = 0;
  let skipped = 0;
  const seen = new Set();
  for (const ent of fs.readdirSync(videosDir)) {
    if (!ent.endsWith(".mp4")) continue;
    const spec = SOURCE_FILE_BY_BASENAME[ent];
    if (!spec || seen.has(ent)) continue;
    seen.add(ent);
    const destDir = path.join(root, "public_web", "assets", "exercise-animations", spec.dir);
    const dest = path.join(destDir, spec.file);
    fs.mkdirSync(destDir, { recursive: true });
    const src = path.join(videosDir, ent);
    const srcStat = fs.statSync(src);
    let destStat = null;
    try {
      destStat = fs.statSync(dest);
    } catch (e) {}
    if (!destStat || srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size) {
      fs.copyFileSync(src, dest);
      copied++;
    } else {
      skipped++;
    }
  }
  return { copied, skipped };
}

function demoPath(spec) {
  return `/assets/exercise-animations/${spec.dir}/${spec.file}`;
}

function patchTracks(tracks) {
  let updated = 0;
  let cleared = 0;
  const names = new Set();
  for (const track of Object.values(tracks || {})) {
    for (const sec of track.sections || []) {
      for (const ex of sec.exercises || []) {
        const spec = VIDEO_BY_NAME[ex.name];
        if (spec) {
          const next = demoPath(spec);
          if (ex.demoVideo !== next) {
            ex.demoVideo = next;
            updated++;
          }
          names.add(ex.name);
        } else if (ex.demoVideo) {
          delete ex.demoVideo;
          cleared++;
        }
      }
    }
  }
  return { updated, cleared, names: [...names].sort() };
}

function writeAxisDataJs(data) {
  const body = "window.AXIS_JSON = " + JSON.stringify(data, null, 2) + ";\n";
  fs.writeFileSync(jsPath, body, "utf8");
  fs.writeFileSync(runtimeJsPath, body, "utf8");
}

const { copied, skipped } = copyVideoAssets();
const raw = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);
const { updated, cleared, names } = patchTracks(data.TRACKS);
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
writeAxisDataJs(data);

console.log("Videos copied:", copied, "unchanged:", skipped);
console.log("Exercises patched:", updated, "cleared stale demoVideo:", cleared);
console.log("Names:", names.join(", "));
