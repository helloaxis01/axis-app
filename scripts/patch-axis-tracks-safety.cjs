/**
 * One-shot content patch: The Foundation Reset (morning), Night Ease (prime) timings/copy,
 * Structural Mend + 360 Restore (ultimate_reset id) tracks. Run: node scripts/patch-axis-tracks-safety.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "public_web", "axis_data.json");

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function findExerciseInTrack(track, pred) {
  for (const sec of track.sections || []) {
    for (const ex of sec.exercises || []) {
      if (pred(ex)) return ex;
    }
  }
  return null;
}

function mustEx(track, pred, label) {
  const ex = findExerciseInTrack(track, pred);
  if (!ex) throw new Error("Missing exercise: " + label);
  return clone(ex);
}

const raw = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);
const T = data.TRACKS;
if (!T.daily || !T.travel || !T.knee || !T.screen || !T.tennis) {
  throw new Error("axis_data.json missing expected tracks");
}

const daily = T.daily;
const travel = T.travel;
const knee = T.knee;
const screen = T.screen;
const tennis = T.tennis;

const exPelvic15 = mustEx(daily, (e) => e.id === 5, "Pelvic Tilts");
exPelvic15.id = 2110;
exPelvic15.reps = "15 reps";

const exChin10 = mustEx(daily, (e) => e.id === 20, "Chin Tucks");
exChin10.id = 2111;
exChin10.type = "reps";
exChin10.reps = "10 reps";
delete exChin10.seconds;

const exBirdMod = mustEx(daily, (e) => e.id === 9, "Bird Dog");
exBirdMod.id = 2112;
exBirdMod.name = "Modified Bird-Dog";
exBirdMod.sub =
  "Shorter range of motion, optional knee stay down. Builds cross-pattern stability without loading a sensitive back.";
exBirdMod.reps = "8 per side, slow";
exBirdMod.steps = exBirdMod.steps || [];
if (exBirdMod.steps[0]) {
  exBirdMod.steps[0].cue =
    "Hands under shoulders, knees under hips. Draw navel in. If needed, keep the moving-side knee on the floor (bird-dog with tap).";
}

const exWallSlides = mustEx(travel, (e) => e.id === 1105, "Wall Slides");
exWallSlides.id = 2113;
exWallSlides.reps = "12 slow reps";
for (const st of exWallSlides.steps || []) {
  if (st && typeof st.cue === "string" && st.cue.includes("10 reps")) {
    st.cue = st.cue.replace("10 reps", "12 reps");
  }
}
if (typeof exWallSlides.tip === "string") {
  exWallSlides.tip = exWallSlides.tip.replace("10 times", "12 slow reps");
}

const exBoxSquat = {
  id: 2114,
  name: "Box Squats",
  start: "Stand with a sturdy chair or box touching the backs of your legs.",
  sub: "Hinge and sit back until you lightly touch the surface, then stand tall. Builds legs and glutes with a clear depth target.",
  type: "reps",
  reps: "15 slow reps",
  steps: [
    {
      pos: "A",
      label: "Setup",
      focus: "SETUP",
      cue: "Feet hip-width, toes forward. Brace your core. Imagine sitting into a tall chair behind you."
    },
    {
      pos: "B",
      label: "Sit Back",
      focus: "HIP HINGE",
      cue: "Send hips back first. Lower until you graze the box or chair without collapsing. Knees track over toes."
    },
    {
      pos: "C",
      label: "Stand",
      focus: "DRIVE",
      cue: "Press evenly through mid-foot and heel to stand. Stop if knees or sharp back pain appears—reduce depth or skip."
    }
  ],
  position: "Stand with a sturdy chair or box touching the backs of your legs.",
  next: "Place your feet hip-width apart. Brace your stomach lightly.",
  then: "Push your hips back and bend your knees to sit toward the chair. Touch lightly, then stand.",
  tip: "Move slowly. If balance feels unsure, use a higher surface or hand support on a wall."
};

const exWallSit = mustEx(knee, (e) => e.id === 2203, "Wall Sit");
exWallSit.id = 2115;
exWallSit.name = "Wall Sit";
exWallSit.sub =
  "Isometric legs and core while the back stays supported on the wall. Builds endurance for daily strength.";

const exDeadBug = mustEx(daily, (e) => e.id === 8, "Dead Bug");
exDeadBug.id = 2116;
exDeadBug.name = "The Dead Bug";
exDeadBug.reps = "10 per side, slow";

const exForearmPlank = {
  id: 2117,
  name: "Forearm Plank",
  start: "Lie face down, then prop on forearms with elbows under shoulders.",
  sub: "Hold 30–60 seconds as tolerated. Easier on wrists than a high plank—knees down shortens the lever.",
  type: "time",
  seconds: 60,
  steps: [
    {
      pos: "A",
      label: "Forearm Setup",
      focus: "SETUP",
      cue: "Elbows under shoulders, forearms parallel. Tuck toes and lift knees so the body forms one line from head to heels."
    },
    {
      pos: "B",
      label: "Brace",
      focus: "CORE",
      cue: "Pull belly button up, squeeze glutes gently, breathe in the ribs. Do not hold breath."
    },
    {
      cue: "If form breaks or you feel sharp low-back pain, lower knees to the floor and hold a shorter lever, or end the set."
    }
  ],
  position: "Lie face down, then prop on forearms with elbows under shoulders.",
  next: "Lift your body so only your forearms and toes touch the floor.",
  then: "Keep your hips level with your shoulders. Hold steady breathing.",
  tip: "Drop to knees for a shorter hold if needed. Quality over duration."
};

const exFigR = mustEx(daily, (e) => e.id === "16-R", "Figure Four R");
exFigR.id = "2118-R";
exFigR.name = "Figure-4 Stretch — Right";
exFigR.type = "time";
exFigR.seconds = 60;
delete exFigR.reps;

const exFigL = mustEx(daily, (e) => e.id === "16-L", "Figure Four L");
exFigL.id = "2118-L";
exFigL.name = "Figure-4 Stretch — Left";
exFigL.type = "time";
exFigL.seconds = 60;
delete exFigL.reps;

T.morning = {
  id: "morning",
  label: "The Foundation Reset",
  subtitle: "Chest · Core · Spine",
  purpose:
    "A post-cardio strength and alignment sequence. It firms the chest and core while stabilizing the spine to support weight loss goals and structural integrity.",
  duration: "~22 min",
  sections: [
    {
      label: "Foundation sequence",
      tag: "AM",
      purpose:
        "Follow the list in order after cardio or on its own. Reduce reps or range if you are new to a move, and stop if you feel sharp pain, numbness, or dizziness.",
      exercises: [
        exPelvic15,
        exChin10,
        exBirdMod,
        exWallSlides,
        exBoxSquat,
        exWallSit,
        exDeadBug,
        exForearmPlank,
        exFigR,
        exFigL
      ]
    }
  ]
};

const prime = T.prime;
prime.purpose =
  "Neurological recovery for sleep induction. Gentle positions and slow breathing cue the body toward rest.";
const pmSec = prime.sections[0];
pmSec.purpose =
  "Slow transitions only. These positions support down-regulation after a demanding day. Avoid forcing stretches; use pillows for support.";
const byId = (id) => pmSec.exercises.find((e) => e.id === id);
byId(301).seconds = 180;
byId(302).seconds = 120;
byId(302).start = "Lie on your back.";
byId(302).sub = "Soles of the feet together, knees fall wide. Let gravity open the inner thighs and hips.";
byId(303).seconds = 60;
byId("304-R").seconds = 60;
byId("304-L").seconds = 60;
byId(305).seconds = 120;
byId(305).sub =
  "Slow nasal inhales and long exhales. If your clinician has advised a different breathing pattern, follow their guidance.";
byId(305).tip =
  "If holding breath after inhale feels uncomfortable, skip the hold and use a simple 4-count in, 6-count out instead.";
prime.duration = "10 min";

const cat60 = mustEx(daily, (e) => e.id === 1, "Cat-Cow");
cat60.id = 2130;
cat60.type = "time";
cat60.seconds = 60;
delete cat60.reps;

const threadR = mustEx(screen, (e) => e.id === "505-R", "Thread R");
threadR.id = "2131-R";
threadR.seconds = 30;
threadR.type = "time";

const threadL = mustEx(screen, (e) => e.id === "505-L", "Thread L");
threadL.id = "2131-L";
threadL.seconds = 30;
threadL.type = "time";

const childSide = mustEx(tennis, (e) => e.id === 3016, "Child side reach");
childSide.id = 2132;
childSide.name = "Child's Pose + Side Reach";
childSide.seconds = 60;
childSide.type = "time";

const gentleNeck = {
  id: 2133,
  name: "Gentle Neck Glides",
  start: "Sit or stand tall with shoulders relaxed.",
  sub: "Small, controlled motions only—no full head rolls backward.",
  type: "time",
  seconds: 60,
  steps: [
    {
      pos: "A",
      label: "Chin Glide",
      focus: "CERVICAL",
      cue: "Draw the chin straight back (retraction). Hold 2 seconds. Release. Repeat 4–6 times."
    },
    {
      pos: "B",
      label: "Side Glide",
      focus: "MOBILITY",
      cue: "Ear toward shoulder in a small lateral tilt, both shoulders down—3–4 each side. Never roll the head backward in a circle."
    },
    {
      cue: "Stop if you feel dizziness, radiating arm pain, or sharp neck pain—seek professional evaluation if those persist."
    }
  ],
  position: "Sit or stand tall with shoulders relaxed.",
  next: "Keep your eyes level and shoulders heavy.",
  then: "Pull your chin straight back, hold briefly, and release.",
  tip: "Keep ranges small. Avoid snapping or forcing end range."
};

const pelvic10 = mustEx(daily, (e) => e.id === 5, "Pelvic 10");
pelvic10.id = 2134;
pelvic10.reps = "10 reps";

T.structural_mend = {
  id: "structural_mend",
  label: "Structural Mend",
  subtitle: "Spine · Mobility · Ease",
  purpose:
    "Targeted mechanical decompression to reverse daily spinal compression. Small ranges, slow breathing, no forcing.",
  duration: "~6 min",
  sections: [
    {
      label: "Evening structural pass",
      tag: "PM",
      purpose:
        "Floss tissues gently—never aggressive stretching. Use pillows for knees or head support as needed.",
      exercises: [cat60, threadR, threadL, childSide, gentleNeck, pelvic10]
    }
  ]
};

const cat2140 = clone(cat60);
cat2140.id = 2140;

const thR2141 = clone(threadR);
thR2141.id = "2141-R";
const thL2142 = clone(threadL);
thL2142.id = "2142-L";

const child2143 = clone(childSide);
child2143.id = 2143;
child2143.name = "Child's Pose + Side Reach";

const butterfly = mustEx(prime, (e) => e.id === 302, "Reclined butterfly");
butterfly.id = 2144;
butterfly.seconds = 120;

const legsUp = mustEx(prime, (e) => e.id === 301, "Legs up");
legsUp.id = 2145;
legsUp.seconds = 180;

const breath = mustEx(prime, (e) => e.id === 305, "Diaphragmatic");
breath.id = 2146;
breath.seconds = 120;
breath.start = "Remain in Legs Up the Wall, or lie on your back with legs supported.";
breath.sub =
  "Continue slow belly-led breathing for two minutes while the legs are elevated (or switch to a comfortable recline if needed).";
breath.position = "Remain in Legs Up the Wall if comfortable, or lie on your back.";
breath.next = "Keep one hand on the belly, one on the chest if helpful.";
breath.then = "Breathe in through the nose, letting the belly rise first.";
breath.tip =
  "If breath-holds feel stressful, use steady in-out pacing only. Stop if you feel lightheaded.";

T.ultimate_reset = {
  id: "ultimate_reset",
  label: "360 Restore",
  subtitle: "Alignment · Circulation · Calm",
  purpose:
    "Systemic reset combining alignment with lymphatic drainage to reduce physical bloating and inflammation.",
  duration: "~11 min",
  sections: [
    {
      label: "360 unwind",
      tag: "PM",
      purpose:
        "Mobility first, then longer restorative holds. Stay in legs-up for the final breath block when it feels right.",
      exercises: [cat2140, thR2141, thL2142, child2143, butterfly, legsUp, breath]
    }
  ]
};

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Wrote", jsonPath);
