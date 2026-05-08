"use strict";
/**
 * One-time / editorial: set exercise `sub` (card copy) from a canonical map.
 * Run: node scripts/apply-exercise-sub-editorial.cjs
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "public_web", "axis_data.json");

/** Exact `name` match → sub */
const SUB_EXACT = {
  "Cat–Cow": "Brings movement to each vertebra to help with a stiff or rigid back.",
  "Sphinx Pose": "Supports the natural curve of your lower back after long periods of sitting.",
  "Child's Pose": "Encourages the spine to lengthen and helps your back muscles finally let go.",
  "Pelvic Tilts": "Works on your lower back alignment to help you find a more comfortable posture.",
  "Glute Bridge": "Activates your glutes to help take some of the load off your lower back.",
  "Marching Bridge": "Targets hip stability to keep your pelvis level and well supported.",
  "Dead Bug": "Helps protect your spine by teaching your core how to stay steady and strong.",
  "Bird Dog": "Focuses on balance and spinal stability to help you feel more resilient.",
  "High Plank": "Works on total body tension and shoulder stability for better daily support.",
  "Supine Knee Hugs": "Provides a gentle release for the lower back and opens up the hips.",
  "Seated Forward Fold": "Targets tight hamstrings to reduce the constant pull on your lower back.",
  "Body Waves": "Promotes natural flow and eases tension in a tight or restricted spine.",
  "Wall Push-Ups": "Builds chest and arm strength while keeping things easy on your joints.",
  "Wall Pushups": "Builds chest and arm strength while keeping things easy on your joints.",
  "Wall Pushes": "Builds chest and arm strength while keeping things easy on your joints.",
  "Resistance Band Row": "Supports better posture by strengthening the muscles between your shoulder blades.",
  "Wall Angels": "Helps with shoulder mobility and opens up a tight or closed chest.",
  "Chin Tucks": "Focuses on neck alignment to help counteract the strain from looking at screens.",
  "Sun Breath": "Helps open up your chest and lungs so you can breathe a little deeper.",
  "Standing Chest Opener": "Works to reverse the hunch from desk work by stretching your pectorals.",
  "Wrist & Forearm Release": "Helps manage the repetitive strain that comes from typing or scrolling.",
  "Upper Trap Release": "Targets the top of your shoulders to help melt away the stress you carry in your neck.",
  "Thoracic Extension": "Focuses on upper back mobility to help you stand taller and move easier.",
  "Thoracic Extension (foam roller)": "Focuses on upper back mobility to help you stand taller and move easier.",
  "Median Nerve Glide": "Helps manage hand and wrist discomfort by gently stretching the nerves.",
  "Doorway Chest Stretch": "Encourages a deep opening in the chest to help with slumped shoulders.",
  "Windshield Wipers": "Helps loosen up sticky hip joints and a tight lower back.",
  "Legs Up the Wall": "Supports circulation and helps your legs feel refreshed after a long day.",
  "Isometric Wall Sits": "Focuses on knee strength and endurance for activities like stairs or hiking.",
  "Low Box Step-Ups": "Improves functional support for your knees during daily walking.",
  "Diaphragmatic Breathing": "Helps settle a racing mind and brings your heart rate back to a calm baseline.",
  "Physiological Sigh": "Works to lower your stress levels by quickly resetting your nervous system.",
  "Cold Shock (Dive Reflex)": "Helps snap you out of high stress or anxiety by triggering a natural cooling reflex.",
  "5-4-3-2-1 Sensory Scan": "Grounds you in the present moment when you start to feel overwhelmed.",
  "The Shake-Out": "Helps your body physically discharge stress so it doesn't stay stuck in your muscles.",
  "Butterfly Hug": "Provides a gentle sense of comfort and safety when you feel anxious.",
  "Plantar Fascia Stretch": "Targets the bottom of your feet to help with heel and arch discomfort.",
  "Toe Splay": "Focuses on foot alignment to give you a more natural and stable base.",
  "Arch Doming": "Strengthens the arches of your feet to help prevent fatigue and flat feet.",
  "Neck Rolls": "Gently works through stiffness in the sides and back of your neck.",
  "Neck CARs": "Gently works through stiffness in the sides and back of your neck."
};

/** Prefix before first " - " (left/right variants) → sub */
const SUB_PREFIX = {
  "Figure Four Stretch": "Targets tight glutes and helps with discomfort deep in the hip.",
  "Standing Hip Flexor Stretch": "Releases the front of your hips after you have been sitting all day.",
  "90/90 Hip Stretch": "Focuses on hip mobility to help improve how you walk and move.",
  "Pigeon Pose": "Provides a deep release for your psoas and glutes to help unlock your lower body.",
  "Supine Twist": "Helps with mid back stiffness and encourages better spinal rotation.",
  "Single-Leg Stance": "Strengthens your ankles and helps you feel more stable on your feet.",
  "Calf Release": "Targets tightness in the lower legs to help with foot and heel discomfort.",
  "Standing Quad Stretch": "Releases the front of your thigh to help take pressure off your knees.",
  "Lateral Lunges with Reach": "Builds side to side stability to help protect your knees and hips.",
  "Towel Scrunches": "Works the small muscles in your feet to help with balance and support."
};

function subForName(name) {
  if (!name || typeof name !== "string") return null;
  if (Object.prototype.hasOwnProperty.call(SUB_EXACT, name)) return SUB_EXACT[name];
  const dash = name.indexOf(" - ");
  if (dash === -1) return null;
  const prefix = name.slice(0, dash);
  if (Object.prototype.hasOwnProperty.call(SUB_PREFIX, prefix)) return SUB_PREFIX[prefix];
  return null;
}

function ensureTerminalPeriod(s) {
  if (s == null || typeof s !== "string") return s;
  const t = s.trim();
  if (!t) return s;
  if (/[.!?…]$/.test(t)) return t;
  return t + ".";
}

function main() {
  const raw = fs.readFileSync(DATA, "utf8");
  const data = JSON.parse(raw);
  let n = 0;
  for (const track of Object.values(data.TRACKS || {})) {
    for (const sec of track.sections || []) {
      for (const ex of sec.exercises || []) {
        const sub = subForName(ex.name);
        if (sub) {
          ex.sub = ensureTerminalPeriod(sub);
          n++;
        }
      }
    }
  }
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Updated sub on", n, "exercise rows in", DATA);
}

main();
