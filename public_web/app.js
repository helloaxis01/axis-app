const React = globalThis.React;
const ReactDOM = globalThis.ReactDOM;
const { useState, useEffect, useLayoutEffect, useRef, useId, useCallback } = React;

// Development flag: add ?dev=1 to the URL or set localStorage.axis_dev = "1" to enable debug UI and verbose logs.
window.AXIS_DEV = location.search.indexOf('dev=1') !== -1 || localStorage.getItem && localStorage.getItem('axis_dev') === '1';
if (window.AXIS_DEV) {
  try {
    // Minimal debug overlay
    const _dbg = document.createElement('div');
    _dbg.id = 'axis-debug-overlay';
    _dbg.style = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:rgba(0,0,0,0.6);color:var(--axis-white);padding:8px 10px;border-radius:8px;font-family:monospace;font-size:var(--text-xs);cursor:pointer';
    _dbg.textContent = 'AXIS DEV';
    _dbg.title = 'Click to toggle verbose logging (persists)';
    _dbg.onclick = () => {
      const v = localStorage.getItem('axis_verbose') === '1' ? '0' : '1';
      localStorage.setItem('axis_verbose', v);
      alert('axis_verbose = ' + v);
    };
    document.addEventListener('DOMContentLoaded', () => {document.body.appendChild(_dbg);});
    // Verbose logger if axis_verbose=1
    const origLog = console.log.bind(console);
    console.log = function (...args) {
      try {
        if (localStorage.getItem('axis_verbose') === '1') origLog('[AXIS]', ...args);
      } catch (e) {origLog('[AXIS]', ...args);}
    };
    const origError = console.error.bind(console);
    console.error = function (...args) {origError('[AXIS ERROR]', ...args);};
  } catch (e) {}
}

// Ensure a global fallback 'highlight' exists for any older references or cached builds.
try {
  if (typeof window !== 'undefined' && !window.highlight) {
    const cssAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '';
    window.highlight = (cssAccent || '').trim() || '#FF9F43';
  }
} catch (e) {}
// Ensure a global fallback 'nightMode' exists so older builds or inlined code
// that reference `nightMode` don't throw a ReferenceError.
try {
  if (typeof nightMode === 'undefined') {
    var nightMode = false;
    try {
      const docTheme = document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute('data-theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      nightMode = (docTheme === 'dark') || !!prefersDark;
      window.nightMode = nightMode;
    } catch (e) {
      // swallow and keep nightMode = false
    }
  }
} catch (e) {}

// ─────────────────────────────────────────────────────────────
//  AXIS — COMPLETE APP (Onboarding → Home → Sessions)
// ─────────────────────────────────────────────────────────────

// ── ICON RENDERER ─────────────────────────────────────────────
function AxisIcon({ size = 72, color = "#F0EEEB", className }) {
  const S = size;
  const pad = S * 0.05,usable = S - pad * 2,spacing = usable * 0.5;
  const xSize = spacing * 0.78,strokeW = S * 0.09,off = spacing / 2;
  const positions = [
  [S / 2 - off, S / 2 - off], [S / 2 + off, S / 2 - off],
  [S / 2 - off, S / 2 + off], [S / 2 + off, S / 2 + off]];

  return (/*#__PURE__*/
    React.createElement("svg", { width: S, height: S, viewBox: `0 0 ${S} ${S}`, className: className },
    positions.flatMap(([x, y]) =>
    [-45, 45].map((angle) => /*#__PURE__*/
    React.createElement("rect", { key: `${x}-${y}-${angle}`,
      x: x - xSize / 2, y: y - strokeW / 2,
      width: xSize, height: strokeW,
      fill: color,
      transform: `rotate(${angle} ${x} ${y})` }
    )
    )
    )
    ));

}

/** Minimal down chevron; add .axis-chevron-svg--collapsed to point right (rotate -90deg). */
function AxisChevronCaret({ expanded, className = "" }) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "axis-chevron-svg" + (expanded ? "" : " axis-chevron-svg--collapsed") + (className ? " " + className : ""),
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("polyline", { points: "6 9 12 15 18 9" }));
}

/** Thin right arrow (stroke) for inline CTAs — matches tab-icon stroke weight. */
function AxisThinArrowRight({ size = 14 }) {
  const S = size;
  return /*#__PURE__*/React.createElement("svg", { width: S, height: S, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), /*#__PURE__*/React.createElement("polyline", { points: "12 5 19 12 12 19" }));
}

/** LIST/GUIDED tilted pushpin — outline when unpinned, filled head when pinned (currentColor). */
function AxisSessionThumbtackGlyph({ pinned }) {
  return /*#__PURE__*/React.createElement("g", { transform: "rotate(-42 12 12)", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
    /*#__PURE__*/React.createElement("ellipse", { cx: "12", cy: "6.85", rx: "3.35", ry: "2.45", fill: pinned ? "currentColor" : "none" }),
    /*#__PURE__*/React.createElement("line", { x1: "12", y1: "9.15", x2: "12", y2: "20.35", fill: "none" }));
}

/** Forward-skip: play triangle + vertical bar (LIST/GUIDED filter + row). */
function AxisSessionSkipForwardGlyph() {
  return /*#__PURE__*/React.createElement("g", { stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
    /*#__PURE__*/React.createElement("polygon", { points: "5 5 15 12 5 19", fill: "currentColor" }),
    /*#__PURE__*/React.createElement("line", { x1: "19", y1: "5", x2: "19", y2: "19", fill: "none" }));
}

// Main app backgrounds (dark/light) — circadian dark themes reference MAIN_APP_BG.dark
const MAIN_APP_BG = {
  dark: "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)",
  light: "linear-gradient(145deg, #dce6f0 0%, #e4ebf4 35%, #eaf0f7 70%, #f0f5fa 100%)"
};

function getCircadianPeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "dawn";
  if (h >= 11 && h < 17) return "midday";
  if (h >= 17 && h < 22) return "prime";
  return "rest";
}

/** Next boundary time (today or tomorrow), period key immediately after crossing, millis until crossing. */
function axisNextCircadianBoundary(nowMs = Date.now()) {
  const now = new Date(nowMs);
  const t = now.getTime();
  const boundaries = [{ hr: 5, p: "dawn" }, { hr: 11, p: "midday" }, { hr: 17, p: "prime" }, { hr: 22, p: "rest" }];
  let bestTs = Infinity;
  let nextPeriod = "dawn";
  for (let i = 0; i < boundaries.length; i++) {
    const { hr, p } = boundaries[i];
    const cand = new Date(now);
    cand.setHours(hr, 0, 0, 0);
    if (cand.getTime() <= t) cand.setDate(cand.getDate() + 1);
    const ts = cand.getTime();
    if (ts < bestTs) {
      bestTs = ts;
      nextPeriod = p;
    }
  }
  return { msUntil: Math.max(0, bestTs - t), nextPeriod: nextPeriod, at: bestTs };
}

function axisFormatHhMmCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Locked mood from storage, or time-of-day when Auto — ignores invalid keys so theme data always exists. */
function axisResolveMoodPeriod(period) {
  if (period && CIRCADIAN_THEMES[period]) return period;
  return getCircadianPeriod();
}

const CIRCADIAN_THEMES = {
  dawn: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(255,135,55,0.72) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(255,175,75,0.50) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(205,80,20,0.60) 0%, transparent 76%)",
      accent: "#FF9F43", accentDim: "rgba(255,159,67,0.25)", accentGlow: "rgba(255,159,67,0.55)",
      accentBtnText: "#252525",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#FFF0E0",
      tabBg: "rgba(7,9,18,0.84)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(255,120,40,0.26) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(255,165,70,0.20) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(220,120,30,0.18) 0%, transparent 76%)",
      accent: "#C85A00", accentDim: "rgba(200,90,0,0.18)", accentGlow: "rgba(200,90,0,0.38)",
      accentBtnText: "#f6f7f8",
      bg: "linear-gradient(160deg, #F5F2EE 0%, #F2EFE9 50%, #F0EDE8 100%)",
      textPrimary: "#2a1200"
    }
  },
  midday: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(0,225,190,0.64) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(0,210,170,0.44) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(0,140,110,0.55) 0%, transparent 76%)",
      accent: "#00E8C0", accentDim: "rgba(0,232,192,0.20)", accentGlow: "rgba(0,232,192,0.52)",
      accentBtnText: "#252525",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#D0FFF5",
      tabBg: "rgba(0,8,4,0.78)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(0,210,175,0.30) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(0,195,155,0.22) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(0,150,125,0.22) 0%, transparent 76%)",
      accent: "#007A6A", accentDim: "rgba(0,122,106,0.16)", accentGlow: "rgba(0,122,106,0.34)",
      accentBtnText: "#f6f7f8",
      bg: "linear-gradient(160deg, #F0F3F5 0%, #EDF0F2 50%, #EBF0F3 100%)",
      textPrimary: "#00261f"
    }
  },
  prime: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(40,120,255,0.56) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(70,160,255,0.42) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 118%, rgba(20,60,170,0.52) 0%, transparent 76%)",
      accent: "#4DA8FF", accentDim: "rgba(77,168,255,0.22)", accentGlow: "rgba(77,168,255,0.55)",
      accentBtnText: "#252525",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#D8EEFF",
      tabBg: "rgba(0,6,14,0.78)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(40,120,230,0.28) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(70,160,230,0.22) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 118%, rgba(40,90,200,0.22) 0%, transparent 76%)",
      accent: "#1060C0", accentDim: "rgba(16,96,192,0.17)", accentGlow: "rgba(16,96,192,0.38)",
      accentBtnText: "#f6f7f8",
      bg: "linear-gradient(160deg, #EEEEF5 0%, #EBEBF2 50%, #E8E8F0 100%)",
      textPrimary: "#001830"
    }
  },
  rest: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(130,50,240,0.56) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(170,80,255,0.42) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 120%, rgba(90,40,180,0.52) 0%, transparent 76%)",
      accent: "#A060FF", accentDim: "rgba(160,96,255,0.22)", accentGlow: "rgba(160,96,255,0.52)",
      accentBtnText: "#252525",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#E8D8FF",
      tabBg: "rgba(3,0,8,0.80)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(120,40,220,0.26) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(150,70,230,0.20) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 120%, rgba(90,40,180,0.20) 0%, transparent 76%)",
      accent: "#6030B0", accentDim: "rgba(96,48,176,0.18)", accentGlow: "rgba(96,48,176,0.38)",
      accentBtnText: "#f6f7f8",
      bg: "linear-gradient(160deg, #EEEEF5 0%, #EAEAF2 50%, #E6E6F0 100%)",
      textPrimary: "#180030"
    }
  }
};

/** sRGB relative luminance → readable ink on solid circadian accent fills */
function inkForAccentHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const rs = (n >> 16) / 255, gs = ((n >> 8) & 255) / 255, bs = (n & 255) / 255;
  const lin = (v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(rs) + 0.7152 * lin(gs) + 0.0722 * lin(bs);
  return L < 0.43 ? "var(--axis-white)" : "var(--axis-black)";
}

/** Solid or gradient circadian `bg` → color for guided footer fade (last gradient stop). */
function axisColorFromCircadianBg(bg) {
  if (!bg || typeof bg !== "string") return "#EBF0F3";
  const hexes = bg.match(/#[0-9A-Fa-f]{6}/gi);
  if (hexes && hexes.length) return hexes[hexes.length - 1];
  const solid = bg.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(solid)) return solid;
  return "#EBF0F3";
}

/** Comma-separated R,G,B for `rgba(var(--accent-rgb), a)` (circadian + static themes). */
function axisMoodAccentRgbCsvFromHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function applyCircadianTheme(isDark, period) {
  const p = axisResolveMoodPeriod(period);
  const t = CIRCADIAN_THEMES[p][isDark ? "dark" : "light"];
  let el = document.getElementById("circadian-style");
  if (!el) { el = document.createElement("style"); el.id = "circadian-style"; document.head.appendChild(el); }
  const accentSec = t.accent && t.accent.match(/^#[0-9a-fA-F]{6}$/) ? t.accent + "99" : t.accentSecondary || t.accent;
  const accentRgbCsv = axisMoodAccentRgbCsvFromHex(t.accent);
  el.textContent = `
    [data-theme]:not([data-night="true"]) {
      --orb1: ${t.orb1} !important;
      --orb2: ${t.orb2} !important;
      --orb3: ${t.orb3} !important;
      --mood-accent: ${t.accent} !important;
      --mood-color: ${t.accent} !important;
      --accent: ${t.accent} !important;
      ${accentRgbCsv ? `--accent-rgb: ${accentRgbCsv} !important;` : ""}
      ${t.bg && isDark ? `--bg-app: ${t.bg} !important;` : ""}
      --accent-secondary: ${accentSec} !important;
      --accent-dim: ${t.accentDim} !important;
      --accent-glow: ${t.accentGlow} !important;
      --cue-bar: ${t.accentDim.replace(/[\d.]+\)$/, "0.7)")} !important;
      --cue-bar-label: ${t.accentDim.replace(/[\d.]+\)$/, "0.9)")} !important;
      ${t.textPrimary ? `--text-white: ${t.textPrimary} !important;` : ""}
      ${t.accentBtnText ? `--accent-btn-text: ${t.accentBtnText} !important;` : ""}
      ${t.tabBg ? `--tab-bg: ${t.tabBg} !important;` : ""}
    }
    @media (prefers-reduced-motion: no-preference) {
      .app-orbs { transition: background var(--motion-slow) !important; }
    }
  `;
  return { bg: t.bg };
}

const TRACKS_DATA_FALLBACK = {
  daily: {
    id: "daily",
    label: "Workout data unavailable",
    subtitle: "Check axis_data.js",
    purpose: "Could not load workout data. Ensure axis_data.js is present next to this page and defines window.AXIS_JSON, then refresh.",
    duration: "—",
    sections: []
  }
};
let TRACKS = TRACKS_DATA_FALLBACK;

/**
 * Inline SVG animation frames per exercise key (embed full <svg> strings). Cat-Cow cleared until new assets land.
 */
const EXERCISE_ANIMATION_SVGS = {
  CatCow: []
};

/** Per-step instruction graphics; keys match EXERCISE_ANIMATION_SVGS. */
const EXERCISE_INSTRUCTION_FRAMES = {
  CatCow: [],
  SphinxPose: []
};

/**
 * Maps an exercise to a key in EXERCISE_ANIMATION_SVGS, or null when no inline animation exists.
 * (Name-based; extend when new animation sets are added.)
 */
function resolveExerciseAnimationKey(trackId, exerciseId, exerciseName) {
  void trackId;
  void exerciseId;
  const compact = String(exerciseName || "").toLowerCase().replace(/[^a-z]/g, "");
  if (compact.includes("catcow")) {
    if (compact.includes("seated")) return null;
    if (EXERCISE_ASSET_VIDEOS.CatCow || EXERCISE_ASSET_SVGS.CatCow || EXERCISE_ANIMATION_SVGS.CatCow) return "CatCow";
  }
  if (compact.includes("sphinx") && EXERCISE_ASSET_VIDEOS.SphinxPose) return "SphinxPose";
  if (compact === "childspose" && EXERCISE_ASSET_VIDEOS.ChildsPose) return "ChildsPose";
  return null;
}

function exerciseAnimationStrokeColor(mode) {
  if (mode === "ultra") return "#FF3B30";
  if (mode === "light") return "#252525";
  return "#F6F7F8";
}

function exerciseAnimationModeFromTheme(theme, ultraNight) {
  if (ultraNight) return "ultra";
  return theme === "dark" ? "dark" : "light";
}

function exerciseCarouselGraphicColor(mode) {
  if (mode === "ultra") return "#CC0000";
  if (mode === "light") return "#252525";
  return "#F6F7F8";
}

/* Cat-Cow asset frames — empty until new SVGs are embedded. */
const EXERCISE_ASSET_SVGS = {
  CatCow: [],
  SphinxPose: [],
  ChildsPose: []
};
/** Baseline demo media paths — add keys with matching resolveExerciseAnimationKey + assets; LIST/GUIDED enlargement is centralized in ExerciseCarousel (native FS for video, portal for gif/webp). */
const EXERCISE_ASSET_VIDEOS = {
  CatCow: "./assets/exercise-animations/cat-cow/CatCow_Markian_Test.mp4",
  SphinxPose: "./assets/exercise-animations/sphinx-pose/SphinxPose_Markian_Test.mp4",
  ChildsPose: "./assets/exercise-animations/childs-pose/ChildsPose_Markian_Test.mp4"
};
/** document.body while carousel portal enlarge is open; portrait-lock CSS must exclude this (all such demos share one path — add new videos here, not a separate fullscreen UI). */
const AXIS_BODY_CLASS_MEDIA_EXPAND_ACTIVE = "axis-media-expand-active";
function exerciseAssetIsVideo(src) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(String(src || ""));
}
/** Carousel / guided demo: per-exercise loop clip, else axis_data `demoVideo` (name-matched only). */
function axisResolveExerciseCarouselVideoSrc({ loopVideoSrc = "", fallbackDemoVideo = "" } = {}) {
  const loopS = typeof loopVideoSrc === "string" ? loopVideoSrc.trim() : "";
  const fallbackDemo = typeof fallbackDemoVideo === "string" ? fallbackDemoVideo.trim() : "";
  if (exerciseAssetIsVideo(loopS)) return loopS;
  if (exerciseAssetIsVideo(fallbackDemo)) return fallbackDemo;
  return "";
}
/** True when carousel should offer fullscreen for Baseline demo URL (video or animated/static raster). */
function exerciseCarouselExpandableDemoSrc(src) {
  const s = String(src || "");
  if (!s) return false;
  return exerciseAssetIsVideo(s) || /\.(gif|webp)(\?|#|$)/i.test(s);
}

/** Optional loop clip: `axisLoopVideo` basename under `assets/exercise-loops/` or a path/URL. Synthetic per-track `{CODE}_{id}_{slug}.mp4` URLs are not emitted until those files ship (avoids broken <video> hiding bundled demos / “VIDEO COMING SOON”). */
const AXIS_EXERCISE_LOOP_VIDEO_BASE = "./assets/exercise-loops/";
function axisResolveExerciseLoopVideoSrc(trackId, ex) {
  if (!ex || !trackId) return "";
  const ovr = ex.axisLoopVideo;
  if (typeof ovr === "string" && ovr.trim()) {
    const t = ovr.trim();
    if (/^\.?\//.test(t) || /^https?:\/\//i.test(t)) return t;
    return AXIS_EXERCISE_LOOP_VIDEO_BASE + t.replace(/^\//, "");
  }
  return "";
}

/**
 * Lazy-loaded loop demo: intersection observer, muted autoplay + loop, playsInline (iOS).
 * ref attaches to the underlying <video> for fullscreen expand.
 */
const AxisVideoPlayer = React.forwardRef(function AxisVideoPlayer({ src, className = "", poster = "", ariaLabel = "Exercise demonstration video", lazy = true }, ref) {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(!lazy);
  useEffect(() => {
    if (!lazy) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) setInView(true);
      }
    }, { root: null, rootMargin: "80px 0px 80px 0px", threshold: 0.01 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazy, src]);
  const showVideo = inView && !!src;
  useLayoutEffect(() => {
    if (!showVideo || !src) return;
    const v = typeof ref === "function" ? null : ref && ref.current;
    if (!v || v.tagName !== "VIDEO") return;
    const p = v.play && v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [showVideo, src, ref]);
  return /*#__PURE__*/React.createElement("div", { ref: rootRef, className: "axis-video-player" + (className ? " " + className : "") }, showVideo ? /*#__PURE__*/React.createElement("video", {
    ref: ref,
    className: "axis-video-player__video",
    src: src,
    poster: poster || undefined,
    muted: true,
    loop: true,
    autoPlay: true,
    playsInline: true,
    preload: "metadata",
    disablePictureInPicture: true,
    controlsList: "nodownload noplaybackrate",
    "aria-label": ariaLabel
  }) : /*#__PURE__*/React.createElement("div", { className: "axis-video-player__ph", "aria-hidden": true }));
});

/** Best-effort native fullscreen (same path as MP4 demos); avoids portal lightbox when it succeeds. */
async function axisRequestElementFullscreen(el) {
  if (!el) return false;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
  } catch (e) {}
  try {
    if (typeof el.webkitRequestFullscreen === "function") {
      el.webkitRequestFullscreen();
      return true;
    }
  } catch (e2) {}
  return false;
}

function getInstructionFrameSvgs(animationKey) {
  if (!animationKey) return null;
  if (EXERCISE_ASSET_SVGS[animationKey] && EXERCISE_ASSET_SVGS[animationKey].length) return EXERCISE_ASSET_SVGS[animationKey];
  if (!EXERCISE_INSTRUCTION_FRAMES[animationKey]) return null;
  return EXERCISE_INSTRUCTION_FRAMES[animationKey];
}

/** Always an array for ExerciseCarousel (video-only / text-only steps use []). */
function instructionFrameArrayForCarousel(animationKey) {
  const f = animationKey ? getInstructionFrameSvgs(animationKey) : null;
  return Array.isArray(f) ? f : [];
}

function tierIndexToInstructionFrameIndex(tierIndex, frameCount, tierKey = "", animationKey = null) {
  if (frameCount <= 0) return 0;
  // Cat-Cow instruction flow: POSITION (tabletop) -> NEXT (inhale/cow) -> THEN (exhale/cat) -> END/TIP (tabletop).
  if (animationKey === "CatCow" && frameCount >= 3) {
    if (tierKey === "next") return 2;
    if (tierKey === "then") return 1;
    if (tierKey === "tip") return 0;
  }
  return Math.min(tierIndex, frameCount - 1);
}

/**
 * Horizontal instruction carousel: static pose per step, tap halves / swipe, step count + prev/next. graphicMode matches exerciseAnimationModeFromTheme.
 */
function ExerciseCarousel({ tiers, frameSvgHtml, animationKey = null, size = "medium", graphicMode = "dark", theme = "dark", ultraNight = false, bodyColorOverride = null, moveOpacity = 1, className = "", trackId = "", allowBaselineMediaExpand = false, sessionExerciseCardExpanded = false, guidedFlowFrame = false, guidedFlowVideoSoonIfNoVideo = false, loopVideoSrc = "", fallbackDemoVideo = "", loopVideoPoster = "" }) {
  const [idx, setIdx] = useState(0);
  const cardRef = useRef(null);
  const touchStartX = useRef(null);
  const carouselContentSigRef = useRef(null);
  const baselineMediaRef = useRef(null);
  const baselineRasterFsRef = useRef(null);
  const [baselineExpandOverlay, setBaselineExpandOverlay] = useState(false);
  const n = tiers.length;
  const fc = frameSvgHtml && frameSvgHtml.length ? frameSvgHtml.length : 0;
  useEffect(() => {
    const sig = (tiers || []).map((t) => t.key + ":" + String(t.body)).join("|") + "#" + String(fc);
    if (carouselContentSigRef.current !== sig) {
      carouselContentSigRef.current = sig;
      setIdx(0);
      setBaselineExpandOverlay(false);
    }
  }, [tiers, fc]);
  useEffect(() => {
    if (!baselineExpandOverlay) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add(AXIS_BODY_CLASS_MEDIA_EXPAND_ACTIVE);
    const onKey = (e) => {
      if (e.key === "Escape") setBaselineExpandOverlay(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove(AXIS_BODY_CLASS_MEDIA_EXPAND_ACTIVE);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [baselineExpandOverlay]);
  const tier = tiers[idx] || tiers[0];
  const tierKey = tier && tier.key ? tier.key : "";
  const frameIdx = tierIndexToInstructionFrameIndex(idx, fc, tierKey, animationKey);
  const svgHtml = fc ? frameSvgHtml[frameIdx] : "";
  const videoSrc = axisResolveExerciseCarouselVideoSrc({ loopVideoSrc, fallbackDemoVideo });
  const hasVideoSrc = exerciseAssetIsVideo(videoSrc);
  const showVideoSoonPlaceholder = !hasVideoSrc;
  const loopPoster = typeof loopVideoPoster === "string" ? loopVideoPoster.trim() : "";
  const showBaselineExpand = !!sessionExerciseCardExpanded && allowBaselineMediaExpand && exerciseCarouselExpandableDemoSrc(videoSrc);
  const graphicColor = exerciseCarouselGraphicColor(graphicMode);
  const isCatCowFrame = animationKey === "CatCow";
  const catCowFrameClass = isCatCowFrame ? frameIdx === 0 ? " exercise-carousel__graphic--catcow-f1" : frameIdx === 1 ? " exercise-carousel__graphic--catcow-f2" : " exercise-carousel__graphic--catcow-f3" : "";
  const isDarkMode = ultraNight || theme === "dark";
  const primary = ultraNight ? "#FF3B30" : isDarkMode ? "#F5F5F5" : "#121418";
  const accent = ultraNight ? "#FF3B30" : "var(--accent)";
  const bodyColor = bodyColorOverride || primary;
  const bodyOpacity = tier && tier.key === "next" ? moveOpacity : 1;
  const go = (delta) => {
    triggerHaptic(HAPTIC_LIGHT_TAP);
    setIdx((i) => Math.max(0, Math.min(n - 1, i + delta)));
  };
  const onCardClick = (e) => {
    if (e.target.closest(".exercise-carousel__nav")) return;
    if (e.target.closest(".exercise-carousel__expand-btn")) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < r.width / 2) go(-1);else go(1);
  };
  const onTouchStart = (e) => {
    if (e.target && e.target.closest && e.target.closest(".exercise-carousel__expand-btn")) return;
    if (e.touches && e.touches[0]) touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (e.target && e.target.closest && e.target.closest(".exercise-carousel__expand-btn")) return;
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || !e.changedTouches || !e.changedTouches[0]) return;
    const end = e.changedTouches[0].clientX;
    const d = end - start;
    if (d < -48) go(1);
    if (d > 48) go(-1);
  };
  const labelSize = size === "small" ? "10px" : size === "large" ? "12px" : "11px";
  const bodySize = size === "small" ? "var(--text-base)" : size === "large" ? "clamp(24px, 4vw, 30px)" : "clamp(22px, 3.9vw, 28px)";
  const sessionChrome = !!sessionExerciseCardExpanded;
  const sessionInstructionBodyMinPx = 96;
  const sessionBodyStyle = sessionChrome ? {
    minHeight: sessionInstructionBodyMinPx,
    height: sessionInstructionBodyMinPx,
    maxHeight: sessionInstructionBodyMinPx,
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start",
    boxSizing: "border-box",
    flexShrink: 0
  } : undefined;
  const sessionNavStyle = sessionChrome ? {
    flexShrink: 0,
    marginTop: 10,
    marginBottom: 0,
    minHeight: 36
  } : undefined;
  const sessionInstructionStackStyle = sessionChrome ? {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box"
  } : undefined;
  const labelStyle = sessionChrome ? undefined : {
    fontSize: labelSize,
    fontWeight: 600,
    fontFamily: "var(--font-ui)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: size === "small" ? 6 : 8,
    marginTop: 14
  };
  const bodyStyle = sessionChrome ? undefined : {
    fontSize: bodySize,
    fontWeight: 400,
    fontFamily: "var(--font-ui)",
    lineHeight: 1.5,
    letterSpacing: "-0.01em",
    color: bodyColor,
    opacity: bodyOpacity,
    whiteSpace: "normal"
  };
  const navDotsEl = sessionChrome && n > 1 ? /*#__PURE__*/React.createElement("div", { className: "exercise-carousel__step-dots", role: "tablist", "aria-label": "Instruction steps" }, tiers.map((_, dotIdx) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: dotIdx,
    role: "tab",
    className: "exercise-carousel__step-dot" + (dotIdx === idx ? " exercise-carousel__step-dot--active" : ""),
    "aria-selected": dotIdx === idx ? "true" : "false",
    "aria-label": `Step ${dotIdx + 1} of ${n}`,
    onClick: (e) => {e.stopPropagation();triggerHaptic(HAPTIC_LIGHT_TAP);setIdx(dotIdx);}
  }))) : null;
  const navArrowsEl = sessionChrome ? /*#__PURE__*/React.createElement("div", { className: "exercise-carousel__nav-arrows exercise-carousel__nav-arrows--glyph" }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__nav-btn",
    disabled: idx <= 0,
    "aria-label": "Previous instruction step",
    onClick: (e) => {e.stopPropagation();if (idx > 0) go(-1);}
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__nav-btn",
    disabled: idx >= n - 1,
    "aria-label": "Next instruction step",
    onClick: (e) => {e.stopPropagation();if (idx < n - 1) go(1);}
  }, "\u203A")) : /*#__PURE__*/React.createElement("div", { className: "exercise-carousel__nav-arrows" }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__nav-btn",
    disabled: idx <= 0,
    "aria-label": "Previous instruction step",
    onClick: (e) => {e.stopPropagation();if (idx > 0) go(-1);}
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M15 18l-6-6 6-6" }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__nav-btn",
    disabled: idx >= n - 1,
    "aria-label": "Next instruction step",
    onClick: (e) => {e.stopPropagation();if (idx < n - 1) go(1);}
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M9 18l6-6-6-6" }))));

  const navEl = n > 1 ? /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel__nav" + (sessionChrome ? " exercise-carousel__nav--session" : ""),
    style: sessionNavStyle,
    onClick: (e) => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("span", {
    className: "exercise-carousel__step-count",
    "aria-live": "polite"
  }, idx + 1 + "/" + n), navDotsEl, navArrowsEl) : null;
  const labelEl = /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel__label" + (sessionChrome ? " exercise-carousel__label--session" : ""),
    style: labelStyle
  }, tier.label);
  const bodyEl = /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel__body" + (sessionChrome ? " exercise-carousel__body--session" : ""),
    style: sessionChrome ? sessionBodyStyle : bodyStyle
  }, formatInstructionBodyText(tier.body));
  const instructionBlock = sessionChrome ? /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel__instruction-stack",
    style: sessionInstructionStackStyle
  }, labelEl, bodyEl, navEl) : /*#__PURE__*/React.createElement(React.Fragment, null, labelEl, bodyEl, navEl);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel" + (className ? " " + className : "") + " exercise-carousel--" + size + (sessionChrome ? " exercise-carousel--session-card" : "") + (guidedFlowFrame ? " exercise-carousel--guided-flow-frame" : ""),
    role: "region",
    "aria-label": "Exercise instructions"
  }, /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "exercise-carousel__card",
    onClick: onCardClick,
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd,
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", { className: "exercise-carousel__graphic-frame axis-surface-tmt exercise-carousel__graphic-frame--media" + (hasVideoSrc ? " exercise-carousel__graphic-frame--has-video" : " exercise-carousel__graphic-frame--no-video") }, videoSrc ? hasVideoSrc ? /*#__PURE__*/React.createElement(AxisVideoPlayer, {
    ref: baselineMediaRef,
    src: videoSrc,
    className: "exercise-carousel__media",
    poster: loopPoster,
    ariaLabel: "Exercise demonstration loop",
    lazy: true
  }) : /*#__PURE__*/React.createElement("div", {
    ref: baselineRasterFsRef,
    className: "exercise-carousel__media-fs-shell"
  }, /*#__PURE__*/React.createElement("img", {
    className: "exercise-carousel__media",
    src: videoSrc,
    alt: "",
    loading: "lazy",
    decoding: "async",
    draggable: false,
    "aria-hidden": true
  })) : null, showVideoSoonPlaceholder ? /*#__PURE__*/React.createElement("div", { className: "exercise-carousel__video-soon", "aria-hidden": true }, "VIDEO COMING SOON") : null,
  /* Expand: Baseline Protocol LIST / guided session only (allowBaselineMediaExpand); not used on intro — no carousel there. */
  showBaselineExpand ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__expand-btn",
    onClick: (e) => {
      e.stopPropagation();
      if (baselineExpandOverlay) {
        setBaselineExpandOverlay(false);
        return;
      }
      (async () => {
        try {
          const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
          if (fsEl) {
            if (document.exitFullscreen) await document.exitFullscreen();else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            return;
          }
          const el = baselineMediaRef.current;
          if (el && el.tagName === "VIDEO") {
            if (await axisRequestElementFullscreen(el)) return;
            try {
              if (typeof el.webkitEnterFullscreen === "function") {
                el.webkitEnterFullscreen();
                return;
              }
            } catch (err2) {}
            setBaselineExpandOverlay(true);
            return;
          }
          const shell = baselineRasterFsRef.current;
          if (shell) {
            if (await axisRequestElementFullscreen(shell)) return;
            const img = shell.querySelector("img");
            if (img && await axisRequestElementFullscreen(img)) return;
          }
          setBaselineExpandOverlay(true);
        } catch (err) {
          setBaselineExpandOverlay(true);
        }
      })();
    },
    "aria-label": "Enlarge demo"
  }, /*#__PURE__*/React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("path", { d: "M21 11V3h-8" }), /*#__PURE__*/React.createElement("path", { d: "M3 13v8h8" }))) : null), instructionBlock)), baselineExpandOverlay && showBaselineExpand && videoSrc ? /*#__PURE__*/ReactDOM.createPortal( /*#__PURE__*/React.createElement("div", {
    className: "exercise-carousel__media-expand-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Exercise demo enlarged",
    onClick: () => setBaselineExpandOverlay(false)
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "exercise-carousel__media-expand-close",
    "aria-label": "Close enlarged demo",
    onClick: (e) => { e.stopPropagation(); setBaselineExpandOverlay(false); }
  }, /*#__PURE__*/React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("path", { d: "M18 6L6 18M6 6l12 12" }))), hasVideoSrc ? /*#__PURE__*/React.createElement("video", {
    className: "exercise-carousel__media-expand-fill",
    src: videoSrc,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    onClick: (e) => e.stopPropagation()
  }) : /*#__PURE__*/React.createElement("img", {
    className: "exercise-carousel__media-expand-fill",
    src: videoSrc,
    alt: "",
    decoding: "async",
    draggable: false,
    onClick: (e) => e.stopPropagation()
  })), document.body) : null);

}

/** mode: dark | light | ultra — fill via #F6F7F8 / #252525 / #FF3B30 (ultra). variant: default | timer | preview */
function ExerciseAnimation({ animationKey, mode = "dark", variant = "default", className = "" }) {
  const frames = animationKey ? EXERCISE_ASSET_SVGS[animationKey] || EXERCISE_ANIMATION_SVGS[animationKey] : null;
  const videoSrc = axisResolveExerciseCarouselVideoSrc({
    fallbackDemoVideo: animationKey && EXERCISE_ASSET_VIDEOS[animationKey] ? EXERCISE_ASSET_VIDEOS[animationKey] : ""
  });
  const hasVideoSrc = exerciseAssetIsVideo(videoSrc);
  const animKeyRef = useRef(animationKey);
  const loopTimerRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const fn = () => setReducedMotion(!!mq.matches);
      fn();
      if (mq.addEventListener) mq.addEventListener("change", fn);else mq.addListener(fn);
      return () => {if (mq.removeEventListener) mq.removeEventListener("change", fn);else mq.removeListener(fn);};
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (animKeyRef.current !== animationKey) {
      animKeyRef.current = animationKey;
      setIdx(0);
    }
  }, [animationKey]);
  useEffect(() => {
    if (!frames || frames.length <= 1 || reducedMotion) return;
    let cancelled = false;
    function scheduleNext() {
      if (cancelled) return;
      const ms = 2000 + Math.floor(Math.random() * 1001);
      loopTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        setIdx((i) => (i + 1) % frames.length);
        scheduleNext();
      }, ms);
    }
    scheduleNext();
    return () => {
      cancelled = true;
      if (loopTimerRef.current != null) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
  }, [frames, reducedMotion, animationKey]);
  const stroke = exerciseAnimationStrokeColor(mode);
  if (videoSrc) {
    const cnVideo = `exercise-animation exercise-animation--${variant} exercise-animation--video${className ? ` ${className}` : ""}`;
    return /*#__PURE__*/React.createElement("div", {
      className: cnVideo,
      style: { color: stroke },
      role: "img",
      "aria-label": "Exercise demonstration animation"
    }, hasVideoSrc ? /*#__PURE__*/React.createElement("video", {
      className: "exercise-animation__media",
      src: videoSrc,
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
      preload: "metadata"
    }) : /*#__PURE__*/React.createElement("img", {
      className: "exercise-animation__media",
      src: videoSrc,
      alt: "",
      loading: "lazy",
      decoding: "async",
      draggable: false
    }));
  }
  if (!frames || frames.length === 0) {
    if (!animationKey) return null;
    const cnEmpty = `exercise-animation exercise-animation--${variant} exercise-animation--empty${className ? ` ${className}` : ""}`;
    return /*#__PURE__*/React.createElement("div", {
      className: cnEmpty,
      style: { color: stroke },
      role: "img",
      "aria-label": "Exercise demonstration animation"
    }, /*#__PURE__*/React.createElement("span", { className: "exercise-animation__video-soon", "aria-hidden": true }, "VIDEO COMING SOON"));
  }
  const active = reducedMotion ? 0 : idx;
  const cn = `exercise-animation exercise-animation--${variant}${className ? ` ${className}` : ""}`;
  return (/*#__PURE__*/
    React.createElement("div", {
      className: cn,
      style: { color: stroke },
      role: "img",
      "aria-label": "Exercise demonstration animation" },

    frames.map((svgHtml, i) => /*#__PURE__*/
    React.createElement("div", {
      key: i,
      className: "exercise-animation__layer",
      style: {
        opacity: i === active ? 1 : 0,
        transition: "opacity 0.85s ease-in-out",
        pointerEvents: "none"
      },
      "aria-hidden": i === active ? undefined : true,
      dangerouslySetInnerHTML: { __html: svgHtml } }
    ))));


}

// New Tracks: Thoracic Chest Reset Flow + Wrist & Hand Reset Flow


function getSections(trackId) {
  try {
    if (!TRACKS || !trackId || !TRACKS[trackId]) return [];
    return TRACKS[trackId].sections || [];
  } catch (e) {
    return [];
  }
}
function getAll(trackId) {
  const secs = getSections(trackId) || [];
  return secs.flatMap((s) => (s.exercises || []).map((e) => ({ ...e, sectionLabel: s.label })));
}

/** Resolve exercise display name for a history row (uses trackId when present; else scans tracks for legacy rows). */
function axisExerciseNameForHistoryEntry(entry) {
  if (!entry || !TRACKS) return "";
  const exId = entry.exerciseId;
  if (exId == null) return "";
  const tid = entry.trackId;
  if (tid && TRACKS[tid]) {
    const all = getAll(tid);
    const found = all.find((ex) => ex.id === exId || Number(ex.id) === Number(exId));
    if (found && found.name) return String(found.name);
  }
  for (const kid of Object.keys(TRACKS)) {
    const all = getAll(kid);
    const found = all.find((ex) => ex.id === exId || Number(ex.id) === Number(exId));
    if (found && found.name) return String(found.name);
  }
  return "";
}

/** LIST tab exercise title: trailing "Name (Qualifier)" → "Name, Qualifier" (ids unchanged). Normalizes Forwards/Backwards → Forward/Backward. */
function axisExerciseListParenDirectionDisplayName(raw) {
  const s = String(raw || "").trim();
  const m = /^(.+?)\s*\(([^()]+)\)\s*$/.exec(s);
  if (!m) return s;
  const base = m[1].trim();
  let dir = m[2].trim();
  if (!base || !dir) return s;
  const low = dir.toLowerCase();
  if (low === "forwards") dir = "Forward";
  else if (low === "backwards") dir = "Backward";
  return `${base}, ${dir}`;
}

/** TODAY browse: 7 categories × 24 tracks — single source for filter + tagging */
const HOME_TRACK_GROUPS = [
  { id: "foundation", label: "Foundation", ids: ["daily", "restorative"] },
  { id: "timeOfDay", label: "Time of Day", ids: ["morning", "prime", "structural_mend", "ultimate_reset"] },
  { id: "targeted", label: "Targeted", ids: ["desk", "screen", "hip", "back", "thoracic"] },
  { id: "anytime", label: "Anytime", ids: ["hourly-practice"] },
  { id: "bodyMaintenance", label: "Body Maintenance", ids: ["steady", "freely", "feet", "knee", "wrist"] },
  { id: "mentalWellness", label: "Mental Wellness", ids: ["anxiety", "stress"] },
  { id: "travel", label: "Travel", ids: ["transit", "travel"] },
  { id: "sports", label: "Sports", ids: ["walking", "running", "golf", "tennis"] }
];
const HOME_CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  ...HOME_TRACK_GROUPS.map((g) => ({ id: g.id, label: g.label }))
];
const TRACK_CATEGORY_BY_ID = Object.fromEntries(
  HOME_TRACK_GROUPS.flatMap((g) => g.ids.map((id) => [id, g.id]))
);

/** Shown above exercise copy in session detail + guided instruction overlay / sheet. */
const AXIS_SAFETY_NERVE_LABEL = "NERVE SAFETY";
const AXIS_SAFETY_NERVE_BODY = "Skip this exercise if you are experiencing active nerve pain, tingling, or traveling sharp sensations.";
const AXIS_SAFETY_CAUTION_LABEL = "USE CAUTION";
const AXIS_SAFETY_CAUTION_BODY = "This is a high-intensity movement. Ensure proper form and stop immediately if you feel sharp joint pain.";

function axisNormalizeExerciseSafetyText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function axisInferNerveRiskExercise(ex) {
  const name = String(ex && ex.name != null ? ex.name : "").trim();
  const nameL = axisNormalizeExerciseSafetyText(name);
  const blob = axisNormalizeExerciseSafetyText(`${name} ${ex && ex.sub != null ? ex.sub : ""}`);
  if (/^glute\s+bridge$/i.test(name)) return false;
  if (/^gentle\s+neck/i.test(name)) return false;
  if (/ballet\s+squat/i.test(blob)) return false;
  if (/diaphragmatic|legs\s+up|reclined\s+butterfly|butterfly\s+hug/i.test(nameL)) return false;
  if (/^child'?s?\s+pose$/i.test(name) && !/side|reach/i.test(blob)) return false;
  const needles = [
    "plank", "dead bug", "bird dog", "bird-dog", "modified bird",
    "thread the needle", "twist", "crunch", "hollow", "superman",
    "cobra", "sphinx", "marching bridge", "windshield",
    "thoracic rotation", "torso rotation", "thoracic extension", "open book", "roll-up", "roll up",
    "leg raise", "straight leg raise", "v-up", "v up", "russian twist", "bicycle crunch",
    "bicycle", "swimming", "cat-cow", "cat–cow", "wall sit", "box squat",
    "forearm plank", "high plank", "side plank", "eagle arm", "neck roll",
    "median nerve", "nerve glide", "inchworm", "push-up", "push up",
    "pull-up", "pull up", "lunge", "active hang", "camel", "wheel", "bow pose",
    "boat pose", "shoulder stand", "headstand", "handstand", "figure four", "figure-4",
    "deadlift", "good morning", "burpee", "mountain climber",
    "kettlebell", "turkish get", "get-up", "snatch", "clean and", "thruster",
    "bear crawl", "crab walk", "jackknife", "toes to bar", "hanging", "roll over"
  ];
  return needles.some((w) => blob.includes(w));
}

function axisInferCautionRiskExercise(ex) {
  const blob = axisNormalizeExerciseSafetyText(`${ex && ex.name != null ? ex.name : ""} ${ex && ex.sub != null ? ex.sub : ""}`);
  const cautionNeedles = [
    "jump", "hop", "burpee", "plyo", "sprint", "explosive", "skipping", "skip rope",
    "high knee", "skater", "bound", "star jump", "tuck jump", "box jump", "broad jump",
    "snatch", "clean and jerk", "thruster", "kettlebell swing", "battle rope",
    "advanced", "power ", " slam", "ball slam"
  ];
  if (/ballet\s+squat/i.test(blob)) return false;
  return cautionNeedles.some((w) => blob.includes(w));
}

function axisResolveExerciseSafetyFlags(ex) {
  let nerve = axisInferNerveRiskExercise(ex);
  let caution = axisInferCautionRiskExercise(ex);
  if (ex && Array.isArray(ex.axisSafetyTags)) {
    for (const raw of ex.axisSafetyTags) {
      const t = String(raw).toLowerCase();
      if (t === "nerve") nerve = true;
      if (t === "caution") caution = true;
      if (t === "no-nerve") nerve = false;
      if (t === "no-caution") caution = false;
    }
  }
  if (ex && Array.isArray(ex.axisSafetyExclude)) {
    for (const raw of ex.axisSafetyExclude) {
      const t = String(raw).toLowerCase();
      if (t === "nerve") nerve = false;
      if (t === "caution") caution = false;
    }
  }
  return { nerve, caution };
}

function AxisExerciseSafetyCallouts({ exercise, ultraNight, layout }) {
  if (!exercise) return null;
  const { caution } = axisResolveExerciseSafetyFlags(exercise);
  if (!caution) return null;
  const wrapClass = "axis-exercise-safety-wrap" + (layout === "overlay" ? " axis-exercise-safety-wrap--overlay" : " axis-exercise-safety-wrap--detail");
  return /*#__PURE__*/React.createElement("div", { className: wrapClass, role: "region", "aria-label": "Exercise safety" },
    /*#__PURE__*/React.createElement("div", { className: "axis-exercise-safety axis-exercise-safety--caution" + (ultraNight ? " axis-exercise-safety--ultra" : "") }, /*#__PURE__*/
    React.createElement("span", { className: "axis-exercise-safety__marker", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("div", { className: "axis-exercise-safety__text" }, /*#__PURE__*/
    React.createElement("div", { className: "axis-exercise-safety__label" }, AXIS_SAFETY_CAUTION_LABEL), /*#__PURE__*/
    React.createElement("div", { className: "axis-exercise-safety__body" }, AXIS_SAFETY_CAUTION_BODY)))
  );
}

function AxisExerciseSafetyInlineNote({ variant = "session", riskKind = "nerve" }) {
  const mod = (variant === "guided" ? " axis-exercise-safety-inline-note--guided" : " axis-exercise-safety-inline-note--session") + " axis-exercise-safety-inline-note--risk";
  const body = riskKind === "caution" ? " Stop if you feel sharp joint pain or cannot maintain good form." : "Skip if you feel active nerve pain or tingling.";
  if (riskKind === "nerve") {
    return /*#__PURE__*/React.createElement("div", {
      className: "axis-exercise-safety-inline-note" + mod,
      role: "note"
    }, body);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "axis-exercise-safety-inline-note" + mod,
    role: "note"
  }, /*#__PURE__*/React.createElement("span", { className: "axis-exercise-safety-inline-note__lead" }, "Note:"), body);
}

function exerciseSeconds(ex, fallbackSec) {
  const s = ex.seconds;
  const n = typeof s === 'number' ? s : typeof s === 'string' ? Number(s) : NaN;
  return n > 0 && Number.isFinite(n) ? n : fallbackSec || 45;
}
function exerciseSecondsFromSections(exId, sections, fallbackSec) {
  for (const sec of sections || []) {
    const ex = sec.exercises && sec.exercises.find((e) => e.id === exId || Number(e.id) === Number(exId));
    if (ex != null) {
      const s = ex.seconds;
      const n = typeof s === 'number' ? s : typeof s === 'string' ? Number(s) : NaN;
      if (n > 0 && Number.isFinite(n)) return n;
      return fallbackSec || 45;
    }
  }
  return fallbackSec || 45;
}

function storageGet(key, def) {
  try {const v = localStorage.getItem(key);return v !== null ? JSON.parse(v) : def;} catch (e) {return def;}
}
function storageSet(key, val) {
  try {
    const raw = JSON.stringify(val);
    localStorage.setItem(key, raw);
    if (axisIsCapacitorNative()) {
      loadAxisNativeModule().then((m) => m && typeof m.prefsSet === "function" && m.prefsSet(key, raw)).catch(() => {});
    }
  } catch (e) {}
}
function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    if (axisIsCapacitorNative()) {
      loadAxisNativeModule().then((m) => m && typeof m.prefsRemove === "function" && m.prefsRemove(key)).catch(() => {});
    }
  } catch (e) {}
}

/** First whitespace-delimited token (given name) for greetings. */
function axisWelcomeFirstName(full) {
  if (full == null || typeof full !== "string") return "";
  const t = full.trim();
  if (!t) return "";
  const w = t.split(/\s+/)[0];
  return w || "";
}

function axisNativeAuthUserFromStorage() {
  try {
    if (typeof localStorage === "undefined") return null;
    const uid = localStorage.getItem("axis_auth_uid");
    if (!uid || !String(uid).trim()) return null;
    const email = localStorage.getItem("axis_auth_email");
    return { uid: String(uid).trim(), email: email ? String(email) : null };
  } catch (_e) {
    return null;
  }
}

function axisSyncAuthUser() {
  try {
    if (typeof window !== "undefined" && window.AXIS_auth && window.AXIS_auth.currentUser) {
      return window.AXIS_auth.currentUser;
    }
  } catch (_e) {}
  try {
    if (typeof window !== "undefined" && window.AXIS_nativeAuthUser) {
      return window.AXIS_nativeAuthUser;
    }
  } catch (_e) {}
  return axisNativeAuthUserFromStorage();
}

function axisAuthHasSession() {
  return !!axisSyncAuthUser();
}

function axisAuthCapabilitiesAvailable() {
  try {
    if (typeof window !== "undefined" && window.AXIS_auth) return true;
  } catch (_e) {}
  return axisIsCapacitorNative();
}

function axisClearNativeAuthSession() {
  try {
    if (typeof window !== "undefined") window.AXIS_nativeAuthUser = null;
  } catch (_e) {}
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem("axis_auth_uid");
    localStorage.removeItem("axis_auth_email");
    localStorage.removeItem("axis_firebase_id_token");
    localStorage.removeItem("axis_firebase_refresh_token");
    localStorage.removeItem("axis_firebase_token_expires");
  } catch (_e) {}
}

function axisHydrateNativeAuthFromStorage() {
  if (!axisIsCapacitorNative()) return;
  const stored = axisNativeAuthUserFromStorage();
  if (!stored) return;
  try {
    window.AXIS_nativeAuthUser = stored;
  } catch (_e) {}
}

function axisActiveUidForStorage() {
  const user = axisSyncAuthUser();
  if (user && user.uid) return String(user.uid);
  return "";
}

/** Per-account celebration flags append `_${uid}` when a uid is available. */
function axisCelebrationScopedKey(baseKey) {
  const uid = axisActiveUidForStorage();
  return uid ? baseKey + "_" + uid : baseKey;
}

function axisPrefersReducedMotion() {
  try {
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    return false;
  }
}

function axisCelebrationFadeMs(ms) {
  return axisPrefersReducedMotion() ? Math.max(40, Math.round(ms / 2)) : ms;
}

/** Stable id for the rolling 7-day momentum window (device-local). */
function axisMomentumWeekKeyFromDates(dates) {
  if (!dates || !dates.length) return "";
  const enc = (s) => String(s).replace(/\s+/g, "_");
  return enc(dates[0]) + "__" + enc(dates[dates.length - 1]);
}

/** Matches auth-bundle `isOnboarded2`: localStorage value must be JSON `true`. */
function axisLocalOnboardingComplete() {
  try {
    if (typeof localStorage === "undefined") return false;
    const uid = axisActiveUidForStorage();
    const key = uid ? "axis_onboarded:" + uid : "axis_onboarded";
    const raw = localStorage.getItem(key);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch (e) {
    return false;
  }
}

/** If onboarding key is unset but the user already has history, avoid forcing onboarding once. */
function axisMigrateOnboardingLegacy() {
  try {
    if (typeof localStorage === "undefined") return;
    const uid = axisActiveUidForStorage();
    const key = uid ? "axis_onboarded:" + uid : "axis_onboarded";
    if (localStorage.getItem(key) !== null) return;
    const hist = storageGet("axis_history", []);
    const legacyDone = storageGet("axis_done", {});
    let listDoneM = {};
    let guidedDoneM = {};
    try {
      const rawL = localStorage.getItem(AXIS_SESSION_LIST_DONE_KEY);
      if (rawL !== null) {
        const p = JSON.parse(rawL);
        listDoneM = p && typeof p === "object" && !Array.isArray(p) ? p : {};
      }
    } catch (e) {}
    try {
      const rawG = localStorage.getItem(AXIS_SESSION_GUIDED_DONE_KEY);
      if (rawG !== null) {
        const p = JSON.parse(rawG);
        guidedDoneM = p && typeof p === "object" && !Array.isArray(p) ? p : {};
      }
    } catch (e) {}
    const hasHist = Array.isArray(hist) && hist.length > 0;
    const hasDone = Boolean(legacyDone && typeof legacyDone === "object" && Object.keys(legacyDone).length > 0 || listDoneM && typeof listDoneM === "object" && !Array.isArray(listDoneM) && Object.keys(listDoneM).length > 0 || guidedDoneM && typeof guidedDoneM === "object" && !Array.isArray(guidedDoneM) && Object.keys(guidedDoneM).length > 0);
    if (hasHist || hasDone) {
      localStorage.setItem(key, JSON.stringify(true));
    }
  } catch (e) {}
}

function axisScopedStorageGet(baseKey) {
  try {
    if (typeof localStorage === "undefined") return null;
    const uid = axisActiveUidForStorage();
    if (uid) {
      const scoped = localStorage.getItem(baseKey + ":" + uid);
      if (scoped !== null) return scoped;
    }
    return localStorage.getItem(baseKey);
  } catch (e) {
    return null;
  }
}

/** HOME greeting: first name from disclaimer (`axis_disclaimer.name`), else legacy `axisUserName`. */
function axisWelcomeDisplayNameFromStorage() {
  try {
    const raw = axisScopedStorageGet("axis_disclaimer");
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o.name === "string") {
        const t = o.name.trim();
        if (t) return axisWelcomeFirstName(t);
      }
    }
    const legacy = localStorage.getItem("axisUserName");
    if (legacy != null && String(legacy).trim()) return axisWelcomeFirstName(String(legacy));
  } catch (e) {}
  return "";
}

const AXIS_GUIDED_DETAILED_INSTRUCTIONS_KEY = "axis_guided_detailed_instructions";
const AXIS_EVER_BOOKMARKED_EXERCISE_KEY = "axis_ever_bookmarked_exercise";
const AXIS_SESSION_LIST_DONE_KEY = "axis_session_list_done";
const AXIS_SESSION_GUIDED_DONE_KEY = "axis_session_guided_done";

function axisLoadSessionListDone() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(AXIS_SESSION_LIST_DONE_KEY) : null;
    if (raw !== null) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object" && !Array.isArray(p)) return p;
      return {};
    }
  } catch (e) {}
  const legacy = storageGet("axis_done", {});
  return legacy && typeof legacy === "object" && !Array.isArray(legacy) ? { ...legacy } : {};
}

function axisLoadSessionGuidedDone() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(AXIS_SESSION_GUIDED_DONE_KEY) : null;
    if (raw !== null) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object" && !Array.isArray(p)) return p;
      return {};
    }
  } catch (e) {}
  return {};
}

/** True when session done map is legacy flat { exerciseId: true } (not per-track). */
function axisSessionDoneStoreIsLegacyFlat(store) {
  if (!store || typeof store !== "object" || Array.isArray(store)) return false;
  const keys = Object.keys(store);
  if (keys.length === 0) return true;
  return !keys.some((k) => TRACKS && TRACKS[k] && store[k] && typeof store[k] === "object" && !Array.isArray(store[k]));
}

/** Exercise completion slice for one track (LIST or GUIDED store). */
function axisSessionDoneSlice(store, trackId) {
  if (!store || typeof store !== "object" || Array.isArray(store)) return {};
  const slice = store[trackId];
  if (slice && typeof slice === "object" && !Array.isArray(slice)) return slice;
  if (axisSessionDoneStoreIsLegacyFlat(store)) return store;
  return {};
}

function axisSessionDonePruneSlice(slice) {
  const next = {};
  if (!slice || typeof slice !== "object") return next;
  for (const k of Object.keys(slice)) {
    if (slice[k]) next[k] = true;
  }
  return next;
}

function axisSessionDoneMergeTrack(store, trackId, slice) {
  const cleaned = axisSessionDonePruneSlice(slice);
  if (axisSessionDoneStoreIsLegacyFlat(store)) {
    const migrated = {};
    for (const k of Object.keys(store || {})) {
      if (TRACKS && TRACKS[k] && store[k] && typeof store[k] === "object") migrated[k] = axisSessionDonePruneSlice(store[k]);
    }
    return { ...migrated, [trackId]: cleaned };
  }
  return { ...(store || {}), [trackId]: cleaned };
}

function axisSessionDoneClearTrack(store, trackId) {
  if (!store || typeof store !== "object" || Array.isArray(store)) return {};
  const ids = new Set((getAll(trackId) || []).map((e) => String(e.id)));
  const next = { ...store };
  delete next[trackId];
  for (const key of Object.keys(next)) {
    if (ids.has(String(key))) {
      delete next[key];
      const n = Number(key);
      if (Number.isFinite(n)) delete next[n];
    }
  }
  return next;
}

function axisSessionDoneLookup(store, trackId, exerciseId) {
  const slice = axisSessionDoneSlice(store, trackId);
  return !!slice[exerciseId];
}

/** Weekly goal minutes: clamped 5–500, snapped to step 5. */
function axisSnapWeeklyGoalMinutes(m) {
  const r = Math.round(Number(m) || 0);
  const s = Math.round(r / 5) * 5;
  return Math.min(500, Math.max(5, s));
}

/** Canonical workout/session length label: "N MIN" (uppercase, no unit accent). */
function axisFormatDurationMinUpper(mins) {
  const n = Math.max(0, Math.round(Number(mins) || 0));
  return `${n} MIN`;
}

/** Session header: total length + per-move timer (e.g. "19 MIN • 45 SEC/MOVE"). */
function axisFormatSessionHeaderDuration(totalMinutes, secondsPerMove) {
  const moveSec = Math.max(0, Math.round(Number(secondsPerMove) || 45));
  const moveLabel = moveSec === 60 ? "1 MIN" : `${moveSec} SEC`;
  return `${axisFormatDurationMinUpper(totalMinutes)} • ${moveLabel}/MOVE`;
}

/** Coerce track JSON / UI strings ("12 min", "12m", "12 MIN") → "12 MIN". */
function axisNormalizeDurationLabelToMin(input) {
  const s = String(input ?? "").trim();
  if (!s || s === "\u2014" || s === "—") return "0 MIN";
  const m = s.match(/(\d+)\s*(?:min|MIN|m)\b/i) || s.match(/^(\d+)\s*$/i);
  if (m) return axisFormatDurationMinUpper(m[1]);
  return s.toUpperCase();
}

/** Guided complete backdrop: amplify circadian orb gradients by doubling rgba alphas (capped at 1). */
function axisOrbGradientDoubleOpacity(gradientStr) {
  if (!gradientStr || gradientStr === "none") return gradientStr;
  return gradientStr.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/gi, (_, r, g, b, a) => {
    const na = Math.min(1, Number.parseFloat(a) * 2);
    return `rgba(${r},${g},${b},${na})`;
  });
}

/** "12 MIN" / raw → lowercase trailing minutes label for summary lines (e.g. "12 min"). */
function axisDurationMinLowerFromTrackDuration(trackDuration) {
  const norm = axisNormalizeDurationLabelToMin(trackDuration);
  const digits = String(norm).match(/(\d+)/);
  const n = digits ? digits[1] : "0";
  return `${n} min`;
}

/** Home last-session trailing date: TODAY, YESTERDAY, or uppercase short date (e.g. APR 22). */
function axisFormatLastSessionDayUpper(loggedDate) {
  const d = loggedDate instanceof Date ? loggedDate : new Date(loggedDate);
  if (!d || Number.isNaN(d.getTime())) return "";
  const logStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((todayStart - logStart) / 86400000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

/** Stable time for sorting / dating a history row (loggedAt ms, legacy date string, etc.). */
function axisHistoryEntryTimeMs(entry) {
  if (!entry || typeof entry !== "object") return NaN;
  const n = entry.loggedAt ?? entry.timestamp ?? entry.ts ?? entry.at;
  if (typeof n === "number" && Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;
  if (typeof n === "string" && n.trim()) {
    const t = n.trim();
    if (/^\s*[\d.]+\s*$/.test(t)) {
      const v = Number(t);
      if (Number.isFinite(v)) return v < 1e12 ? v * 1000 : v;
    }
    const iso = Date.parse(t);
    if (Number.isFinite(iso)) return iso;
  }
  const ds = entry.date;
  if (typeof ds === "string" && ds.trim()) {
    const d = new Date(ds.trim());
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }
  return NaN;
}

/** Newest history row for a track (matches trackId or legacy label-only rows). */
function axisLatestHistoryEntryForTrack(trackId, historyArr) {
  if (!trackId || !Array.isArray(historyArr) || !TRACKS || !TRACKS[trackId]) return null;
  let best = null;
  let bestT = -Infinity;
  const label = TRACKS[trackId].label;
  for (let i = 0; i < historyArr.length; i++) {
    const h = historyArr[i];
    if (!h) continue;
    const tid = typeof h.trackId === "string" ? h.trackId : null;
    const byId = tid === trackId;
    const legacy = tid == null && typeof h.track === "string" && (h.track === label || h.track === trackId);
    if (!byId && !legacy) continue;
    const t = axisHistoryEntryTimeMs(h);
    if (!Number.isFinite(t)) continue;
    if (t > bestT) {
      bestT = t;
      best = h;
    }
  }
  return best;
}

function axisDateFromHistoryEntry(entry) {
  const t = axisHistoryEntryTimeMs(entry);
  return Number.isFinite(t) ? new Date(t) : null;
}

/** Resolve a session history row to a canonical track id (TRACKS key). */
function axisResolveTrackIdFromHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || !TRACKS) return null;
  const tid = typeof entry.trackId === "string" ? entry.trackId : null;
  if (tid && TRACKS[tid]) return tid;
  const tr = typeof entry.track === "string" ? entry.track.trim() : "";
  if (!tr) return null;
  if (TRACKS[tr]) return tr;
  const keys = Object.keys(TRACKS);
  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    const row = TRACKS[id];
    if (row && row.label === tr) return id;
  }
  return null;
}

/** Newest history row that maps to a known track (for Home LAST SESSION). */
function axisLatestHistoryEntryGlobal(historyArr) {
  if (!Array.isArray(historyArr) || !TRACKS) return null;
  let best = null;
  let bestT = -Infinity;
  for (let i = 0; i < historyArr.length; i++) {
    const h = historyArr[i];
    if (!h) continue;
    if (!axisResolveTrackIdFromHistoryEntry(h)) continue;
    const t = axisHistoryEntryTimeMs(h);
    if (!Number.isFinite(t)) continue;
    if (t > bestT) {
      bestT = t;
      best = h;
    }
  }
  return best;
}

function computeSessionSeconds(totalCount, fullSecondsFromLabel, activeCount) {
  if (totalCount > 0 && fullSecondsFromLabel > 0) {
    return Math.round(fullSecondsFromLabel * activeCount / totalCount);
  }
  return 0;
}

// Error capture helper — records errors and promise rejections to localStorage.
// Useful for opaque "Script error" on iOS/Safari; reproduce the issue and then
// check localStorage.getItem('axis_errors') in Safari Web Inspector.
(function installAxisErrorCapture() {
  try {
    function saveRecord(rec) {
      try {
        const existing = JSON.parse(localStorage.getItem('axis_errors') || '[]');
        existing.push(rec);
        // keep last 30
        localStorage.setItem('axis_errors', JSON.stringify(existing.slice(-30)));
        // also expose the last error for quick inspection
        window.__axis_last_error = rec;
      } catch (e) {/* swallow */}
    }

    window.addEventListener('error', function (ev) {
      try {
        const rec = {
          type: 'error',
          message: ev.message || String(ev.error || ev),
          filename: ev.filename || null,
          lineno: ev.lineno || null,
          colno: ev.colno || null,
          stack: ev.error && ev.error.stack ? ev.error.stack : ev.error && ev.error.toString ? ev.error.toString() : null,
          time: new Date().toISOString()
        };
        saveRecord(rec);
      } catch (e) {}
    }, { passive: true });

    window.addEventListener('unhandledrejection', function (ev) {
      try {
        const reason = ev.reason;
        const rec = {
          type: 'unhandledrejection',
          message: reason && reason.message ? reason.message : String(reason),
          stack: reason && reason.stack ? reason.stack : null,
          time: new Date().toISOString()
        };
        saveRecord(rec);
      } catch (e) {}
    }, { passive: true });
  } catch (e) {}
})();

// ─────────────────────────────────────────────────────────────
//  TIMER
// ─────────────────────────────────────────────────────────────
function Timer({ seconds, onDone, nextName, autoStart = false }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(Boolean(autoStart));
  const ref = useRef(null);
  useEffect(() => {
    if (running && left > 0) ref.current = setInterval(() => setLeft((l) => l - 1), 1000);else
    {clearInterval(ref.current);if (left === 0 && running) {setRunning(false);triggerHaptic(HAPTIC_TRIPLE_TAP);typeof onDone === "function" && onDone();}}
    return () => clearInterval(ref.current);
  }, [running, left]);
  const label = running ? "Pause" : left === seconds ? "Start" : "Resume";
  const display = `${Math.floor(left / 60)}:${(left % 60).toString().padStart(2, "0")}`;
  return (/*#__PURE__*/
    React.createElement("div", { className: "timer-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "timer-top" }, /*#__PURE__*/
    React.createElement("div", { className: "timer-val" }, display)
    ), /*#__PURE__*/
    React.createElement("div", { className: "timer-btns" }, /*#__PURE__*/
    React.createElement("button", { className: "tb", onClick: () => {
      if (!running && left === seconds) triggerHaptic(HAPTIC_LIGHT_TAP); else axisHapticTick();
      setRunning((r) => !r);
    } }, label), /*#__PURE__*/
    React.createElement("button", { className: "tb-g", onClick: () => {axisHapticTick();setLeft(seconds);setRunning(false);clearInterval(ref.current);} }, "Reset")
    )
    ));

}

const FOCUS_SPELL = { EXT: "Extension", FLEX: "Flexion", SETUP: "Setup", SPINE: "Spine", STRETCH: "Stretch", CORE: "Core", RELEASE: "Release", GLUTES: "Glutes", STABILITY: "Stability", CONTROL: "Control", HOLD: "Hold", ECCENTRIC: "Eccentric", PUSH: "Push", ISO: "Isometric", PULL: "Pull", RAISE: "Raise", LOWER: "Lower", ROTATE: "Rotation", TWIST: "Twist", CERVICAL: "Cervical", LATERAL: "Lateral", CIRCULATE: "Circulate", FLOW: "Flow", MOBILIZE: "Mobilize", MOMENTUM: "Momentum", ISOLATE: "Isolate", DECOMPRESS: "Decompress", FORWARD: "Forward", BACKWARD: "Backward", GROUND: "Ground", "END-RANGE": "End Range", TARGET: "Target", EXHALE: "Exhale", INHALE: "Inhale", FLEX: "Flexion" };
function spellFocus(f) {return f && FOCUS_SPELL[f.toUpperCase()] ? FOCUS_SPELL[f.toUpperCase()] : f || "";}

/** Normalize sentence boundaries into one flowing paragraph (saves vertical space in cue tiers). */
function formatInstructionBodyText(body) {
  if (typeof body !== "string" || !body.trim()) return body;
  const parts = body.replace(/([.!?])\s+/g, "$1\uE000").split("\uE000").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return body.trim();
  return parts.join(" ");
}

function buildInstructionTiers(startText, steps) {
  const normalizedStart = typeof startText === "string" ? startText.trim() : "";
  const normalizedSteps = Array.isArray(steps) ?
  steps.map((step) => typeof (step && step.cue) === "string" ? String(step.cue).trim() : "").filter(Boolean) :
  [];
  const position = normalizedStart || normalizedSteps[0] || "";
  const next = normalizedStart ? normalizedSteps[0] || "" : normalizedSteps[1] || "";
  const then = normalizedStart ? normalizedSteps[1] || "" : normalizedSteps[2] || "";
  const tip = normalizedStart ? normalizedSteps[2] || "" : normalizedSteps[3] || "";
  return ([
  { key: "position", label: "POSITION", body: position, tone: "primary" },
  { key: "next", label: "NEXT", body: next, tone: "primary" },
  { key: "then", label: "THEN", body: then, tone: "primary" },
  { key: "tip", label: "END/TIP", body: tip, tone: "primary" }].
  filter((tier) => tier.body));
}

function axisCleanInstructionLine(s) {
  if (typeof s !== "string") return "";
  return String(s).replace(/\s+/g, " ").trim();
}

function axisHasExplicitInstructionFields(ex) {
  if (!ex) return false;
  const p = axisCleanInstructionLine(ex.position);
  const n = axisCleanInstructionLine(ex.next);
  const t = axisCleanInstructionLine(ex.then);
  const tip = axisCleanInstructionLine(ex.tip);
  return Boolean(p && n && t && tip);
}

function axisInstructionSideFromId(id) {
  const s = String(id || "");
  if (/-R$/.test(s)) return "right";
  if (/-L$/.test(s)) return "left";
  return null;
}

function axisHasBilateralLanguage(text) {
  const t = String(text || "").toLowerCase();
  return /\bswitch sides?\b|\beach side\b|\bboth sides\b|\brepeat on the (left|right)\b|\bthen switch\b|\balternate\b/.test(t);
}

function axisGuessBodyPartFromExerciseName(name) {
  const n = String(name || "").toLowerCase();
  if (/\bhip\b|\bpigeon\b|\bglute\b|\bfigure four\b/.test(n)) return "Hip";
  if (/\bquad\b|\bhamstring\b|\bcalf\b|\bankle\b|\bfoot\b|\bleg\b/.test(n)) return "Leg";
  if (/\bshoulder\b|\barm\b|\bwrist\b|\belbow\b|\bpec\b|\bchest\b/.test(n)) return "Arm";
  if (/\bneck\b|\btrap\b/.test(n)) return "Neck";
  return "Side";
}

function axisMakeInstructionFields(ex, side) {
  const start = axisCleanInstructionLine(ex && ex.start);
  const cues = Array.isArray(ex && ex.steps) ? ex.steps.map((s) => axisCleanInstructionLine(s && s.cue)).filter(Boolean) : [];

  const cuesNoSwitch = cues.filter((c) => !axisHasBilateralLanguage(c));

  // Prefer cues that already mention the target side; otherwise use generic cues and inject side where safe.
  const want = side ? side.toLowerCase() : "";
  const cuesSide = want ? cuesNoSwitch.filter((c) => c.toLowerCase().includes(want)) : cuesNoSwitch;
  const pool = cuesSide.length ? cuesSide : cuesNoSwitch.length ? cuesNoSwitch : cues;

  const pick = (i) => pool[i] || "";

  let position = start || pick(0);
  let next = start ? pick(0) : pick(1);
  let then = start ? pick(1) : pick(2);
  let tip = start ? pick(2) : pick(3);

  // Ensure all four exist; fall back to remaining cues before any generic filler.
  if (!next) next = pick(0) || "";
  if (!then) then = pick(1) || pick(0) || "";
  if (!tip) tip = pick(2) || pick(1) || pick(0) || "";

  const sideWord = want ? want.toUpperCase() : "";
  const injectSide = (line) => {
    if (!want) return line;
    const lower = line.toLowerCase();
    if (lower.includes("left") || lower.includes("right")) return line;
    // If the move is clearly unilateral but not named, make it explicit.
    return line.replace(/\bone\b/gi, want).replace(/\byour leg\b/gi, `your ${want} leg`).replace(/\byour arm\b/gi, `your ${want} arm`).replace(/\byour hip\b/gi, `your ${want} hip`);
  };

  position = injectSide(position);
  next = injectSide(next);
  then = injectSide(then);
  tip = injectSide(tip);

  return {
    position: axisCleanInstructionLine(position),
    next: axisCleanInstructionLine(next),
    then: axisCleanInstructionLine(then),
    tip: axisCleanInstructionLine(tip),
    sideLabel: sideWord ? `Perform on ${sideWord} side` : ""
  };
}

function axisResolveInstructionFields(ex, sideOverride) {
  const sideFromId = axisInstructionSideFromId(ex && ex.id);
  const side = sideOverride != null && sideOverride !== "" ? sideOverride : sideFromId;
  if (axisHasExplicitInstructionFields(ex)) {
    const p = axisCleanInstructionLine(ex.position);
    const n = axisCleanInstructionLine(ex.next);
    const t = axisCleanInstructionLine(ex.then);
    const tip = axisCleanInstructionLine(ex.tip);
    const sideWord = side === "right" || side === "left" ? String(side).toUpperCase() : "";
    return {
      position: p,
      next: n,
      then: t,
      tip: tip,
      sideLabel: sideWord ? `Perform on ${sideWord} side` : ""
    };
  }
  return axisMakeInstructionFields(ex, side);
}

function axisInstructionTiersFromPack(pack) {
  if (!pack) return [];
  const tiers = [
  { key: "position", label: "POSITION", body: axisCleanInstructionLine(pack.position), tone: "primary" },
  { key: "next", label: "NEXT", body: axisCleanInstructionLine(pack.next), tone: "primary" },
  { key: "then", label: "THEN", body: axisCleanInstructionLine(pack.then), tone: "primary" },
  { key: "tip", label: "END/TIP", body: axisCleanInstructionLine(pack.tip), tone: "primary" }];

  return tiers.filter((tier) => tier.body);
}

function axisIsBilateralExercise(ex) {
  if (!ex) return false;
  if (/-(R|L)$/.test(String(ex.id))) return false;
  const blob = [ex.sub, ex.start].filter(Boolean).join(" ") + " " + (Array.isArray(ex.steps) ? ex.steps.map((s) => s && s.cue).join(" ") : "");
  if (!axisHasBilateralLanguage(blob)) return false;
  // Only duplicate when it's truly one-side-at-a-time, not alternating (e.g., Dead Bug contralateral).
  const t = blob.toLowerCase();
  if (/\balternate\b|\bopposite arm and leg\b|\bcontralateral\b/.test(t)) return false;
  return true;
}

/** Step `focus` codes to skip for list-card meta (positional / non-target). */
const AXIS_EX_META_FOCUS_SKIP = new Set(["SETUP"]);

/** Human-facing labels for step `focus` — list meta next to duration (scan targets, not pose names). */
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

/**
 * One target word for track list cards (next to duration). Keys match step `focus` (trimmed, uppercased, spaces collapsed).
 */
const AXIS_EX_META_FOCUS_TRACK_ONE_WORD = {
  "HIP HINGE": "Hips",
  "CO2 OFFLOAD": "Breath",
  "END-RANGE": "Mobility",
  "LOWER BODY": "Legs",
  "MID BODY": "Core",
  "UPPER BODY": "Shoulders",
  "T-RAISE": "Shoulders",
  "Y-RAISE": "Shoulders",
  ABDUCTOR: "Hips",
  ACTIVATE: "Shoulders",
  ALIGN: "Posture",
  ANCHOR: "Stability",
  ANKLE: "Ankles",
  ANKLES: "Ankles",
  BACKWARD: "Mobility",
  BALANCE: "Balance",
  BEND: "Mobility",
  BILATERAL: "Symmetry",
  BOUNCE: "Mobility",
  BREATH: "Breath",
  BREATHE: "Breath",
  CALM: "Calm",
  CARS: "Mobility",
  CERVICAL: "Neck",
  CIRCLE: "Mobility",
  CIRCULATE: "Circulation",
  COMPLETE: "Control",
  CONCENTRIC: "Power",
  CONNECT: "Mobility",
  CONTROL: "Control",
  COORDINATE: "Control",
  CORE: "Core",
  DECOMPRESS: "Release",
  DEEPEN: "Breath",
  DISCHARGE: "Release",
  DOWNREGULATE: "Calm",
  DRAIN: "Circulation",
  DRIVE: "Legs",
  ECCENTRIC: "Control",
  ENDURANCE: "Endurance",
  ENGAGE: "Core",
  EXERT: "Strength",
  EXHALE: "Breath",
  EXPAND: "Breath",
  EXT: "Spine",
  EXTEND: "Mobility",
  FASCIAL: "Mobility",
  FLEX: "Spine",
  FLOW: "Mobility",
  FOCUS: "Focus",
  FOREARM: "Arms",
  FORWARD: "Mobility",
  GLIDE: "Mobility",
  GLUTES: "Glutes",
  GROUND: "Stability",
  HAMSTRINGS: "Hamstrings",
  HIPS: "Hips",
  HOP: "Power",
  INHALE: "Breath",
  INTEGRATE: "Control",
  INTERNAL: "Core",
  INVERT: "Circulation",
  ISO: "Hold",
  ISOLATE: "Control",
  LATERAL: "Mobility",
  LATS: "Back",
  LIFT: "Glutes",
  LOWER: "Control",
  LUMBAR: "Back",
  MASSAGE: "Release",
  MOBILITY: "Mobility",
  MOBILIZE: "Mobility",
  MOMENTUM: "Power",
  NECK: "Neck",
  OPEN: "Mobility",
  PRESS: "Chest",
  PROGRESS: "Strength",
  PROPRIOCEPTION: "Balance",
  PULL: "Back",
  PUSH: "Chest",
  QUADS: "Quads",
  RAISE: "Shoulders",
  REACH: "Mobility",
  RELAX: "Release",
  RELEASE: "Release",
  REPEAT: "Endurance",
  RESET: "Recovery",
  REST: "Release",
  RESTORE: "Restore",
  RETRACT: "Neck",
  REVERSE: "Mobility",
  RHYTHM: "Breath",
  ROLL: "Mobility",
  ROTATE: "Twist",
  SCOOP: "Core",
  SENSORY: "Calm",
  ADDUCTORS: "Hips",
  BACK: "Back",
  CALVES: "Calves",
  CHEST: "Chest",
  COMPRESS: "Control",
  HOLD: "Hold",
  OBLIQUES: "Core",
  SCAPULAR: "Shoulders",
  SOFTEN: "Release",
  SHOULDERS: "Shoulders",
  SPINE: "Spine",
  STABILITY: "Stability",
  STIMULATE: "Activation",
  STRETCH: "Stretch",
  STRENGTHEN: "Strength",
  SWING: "Mobility",
  SWITCH: "Mobility",
  THORACIC: "Back",
  TONE: "Core",
  TUCK: "Core",
  TWIST: "Twist",
  VARIATION: "Mobility",
  VESTIBULAR: "Balance",
  VISUAL: "Focus",
  WRISTS: "Wrists"
};

function axisTitleCaseToken(raw) {
  const s = String(raw || "").trim().replace(/_/g, " ").toLowerCase();
  if (!s) return "";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Short line for exercise list meta (beside duration) + Bookmarks: body-area overview (1–2 concepts).
 * `ex.area` / `ex.targets` when set in data; else up to two unique step `focus` labels; else section label.
 */
function axisExerciseTargetMetaLine(ex, sectionFallback) {
  if (!ex) return String(sectionFallback || "").trim();
  const a = ex.area != null && String(ex.area).trim() || "";
  const t = ex.targets != null && String(ex.targets).trim() || "";
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
  if (parts.length) return parts.join(" \u00b7 ");
  return String(sectionFallback || "").trim();
}

/** Normalize step `focus` for meta lookups (trim, collapse spaces, upper case). */
function axisFocusCanonicalForMeta(raw) {
  return String(raw || "").trim().replace(/\s+/g, " ").toUpperCase();
}

/** Single token shown beside duration on in-track exercise cards. */
function axisFocusKeyToTrackOneWord(canonicalKey) {
  const k = canonicalKey;
  if (!k) return "";
  if (AXIS_EX_META_FOCUS_TRACK_ONE_WORD[k]) return AXIS_EX_META_FOCUS_TRACK_ONE_WORD[k];
  const lab = AXIS_EX_META_FOCUS_LABELS[k];
  if (lab && String(lab).trim()) {
    return String(lab).trim().split(/\s+/)[0];
  }
  const parts = k.split(/\s+/);
  if (parts.length === 1) return axisTitleCaseToken(parts[0]);
  return axisTitleCaseToken(parts[parts.length - 1]);
}

/** Priority order: first match among step focuses wins (best primary target for the card). */
const AXIS_EX_TRACK_META_ONE_WORD_PRIORITY = [
  "CORE", "RELEASE", "STRETCH", "DECOMPRESS", "GLUTES", "HIPS", "HAMSTRINGS", "QUADS", "CALVES",
  "SHOULDERS", "CHEST", "BACK", "THORACIC", "LUMBAR", "LATS", "ADDUCTORS", "OBLIQUES",
  "CERVICAL", "NECK", "SPINE", "MOBILITY", "STABILITY", "TWIST", "ROTATE", "CONTROL",
  "HOLD", "ISO", "HIP HINGE", "RESTORE", "CALM", "DOWNREGULATE", "BREATHE", "BREATH", "INHALE", "EXHALE",
  "DRAIN", "CIRCULATE", "MASSAGE", "RELAX", "REST", "ACTIVATE", "ENGAGE", "STRENGTHEN", "ENDURANCE",
  "DRIVE", "ECCENTRIC", "PUSH", "PULL", "RAISE", "LOWER", "PRESS", "LIFT", "REACH", "GLIDE",
  "FOREARM", "WRISTS", "ANKLES", "ANKLE", "PROPRIOCEPTION", "VESTIBULAR", "BALANCE", "ALIGN",
  "GROUND", "ANCHOR", "TONE", "INTERNAL", "SCOOP", "TUCK", "FLEX", "EXT", "EXPAND", "DEEPEN",
  "RHYTHM", "FLOW", "FORWARD", "BACKWARD", "LATERAL", "EXTEND", "ROLL", "SWING", "SWITCH",
  "BOUNCE", "CARS", "CIRCLE", "VARIATION", "RESET", "REPEAT", "COMPLETE", "PROGRESS", "MOMENTUM",
  "CONCENTRIC", "HOP", "EXERT", "DISCHARGE", "STIMULATE", "COORDINATE", "INTEGRATE", "ISOLATE",
  "BEND", "OPEN", "SOFTEN", "REVERSE", "BILATERAL", "ABDUCTOR", "SENSORY", "VISUAL", "FOCUS",
  "CONNECT", "FASCIAL", "MOBILIZE", "INVERT", "COMPRESS", "RETRACT", "SCAPULAR"
];

function axisExerciseTrackMetaOneWord(ex) {
  if (!ex) return "";
  const a = ex.area != null && String(ex.area).trim() || "";
  const t = ex.targets != null && String(ex.targets).trim() || "";
  if (a || t) {
    const blob = (a || t).replace(/\s*·\s*/g, " ").trim();
    const first = blob.split(/\s+/).filter(Boolean)[0];
    return first ? axisTitleCaseToken(first) : "";
  }
  const steps = Array.isArray(ex.steps) ? ex.steps : [];
  const orderedKeys = [];
  const seenK = new Set();
  for (const s of steps) {
    const raw = s && s.focus != null && String(s.focus).trim();
    if (!raw) continue;
    const canon = axisFocusCanonicalForMeta(raw);
    if (AXIS_EX_META_FOCUS_SKIP.has(canon)) continue;
    if (seenK.has(canon)) continue;
    seenK.add(canon);
    orderedKeys.push(canon);
  }
  if (!orderedKeys.length) return "";
  const set = new Set(orderedKeys);
  for (const p of AXIS_EX_TRACK_META_ONE_WORD_PRIORITY) {
    if (set.has(p)) return axisFocusKeyToTrackOneWord(p);
  }
  return axisFocusKeyToTrackOneWord(orderedKeys[0]);
}

/** Track card subtitle: tighter rhythm around middots (axis_data uses " · "). */
function axisTrackCardSubtitleDisplay(s) {
  if (s == null || s === "") return s;
  return String(s).replace(/\s*·\s*/g, "\u2009·\u2009");
}

function axisNormalizeTracks(rawTracks) {
  const src = rawTracks && typeof rawTracks === "object" ? rawTracks : {};
  const out = {};
  for (const [trackId, track] of Object.entries(src)) {
    const sections = Array.isArray(track && track.sections) ? track.sections : [];
    const nextSections = sections.map((sec) => {
      const exercises = Array.isArray(sec && sec.exercises) ? sec.exercises : [];
      const nextExercises = [];
      for (const ex of exercises) {
        const base = { ...(ex || {}) };
        base.__axisBodyPart = axisGuessBodyPartFromExerciseName(base.name);
        const sideFromId = axisInstructionSideFromId(base.id);
        if (axisIsBilateralExercise(base) && !sideFromId) {
          const part = base.__axisBodyPart || "Side";
          const idBase = base.id != null ? String(base.id) : String(Math.random()).slice(2);
          const rf = axisMakeInstructionFields(base, "right");
          const lf = axisMakeInstructionFields(base, "left");
          const right = { ...base, id: `${idBase}-R`, name: `${base.name} - Right ${part}`, __axisSide: "right", position: rf.position, next: rf.next, then: rf.then, tip: rf.tip, start: rf.position, __axisInstructions: rf };
          const left = { ...base, id: `${idBase}-L`, name: `${base.name} - Left ${part}`, __axisSide: "left", position: lf.position, next: lf.next, then: lf.then, tip: lf.tip, start: lf.position, __axisInstructions: lf };
          nextExercises.push(right, left);
        } else {
          const implicitSide = base.__axisSide || sideFromId || null;
          base.__axisSide = implicitSide || undefined;
          base.__axisInstructions = axisResolveInstructionFields(base, implicitSide);
          nextExercises.push(base);
        }
      }
      return { ...(sec || {}), exercises: nextExercises };
    });
    out[trackId] = { ...(track || {}), sections: nextSections };
  }
  return out;
}

function CueTiers({ tiers, theme = "dark", ultraNight = false, moveOpacity = 1, compact = false, bodyColorOverride = null }) {
  const isDarkMode = ultraNight || theme === "dark";
  const primary = ultraNight ? "#FF3B30" : isDarkMode ? "#F5F5F5" : "#121418";
  const accent = ultraNight ? "#FF3B30" : "var(--accent)";
  const labelSize = compact ? "10px" : "11px";
  const primarySize = compact ? "var(--text-base)" : "clamp(22px, 3.9vw, 28px)";
  return /*#__PURE__*/React.createElement("div", { className: "cue-tiers" + (compact ? " cue-tiers--compact" : ""), style: { display: "flex", flexDirection: "column", width: "100%" } },
  tiers.map((tier, idx) => {
    const bodyColor = bodyColorOverride || primary;
    const bodyOpacity = tier.key === "next" ? moveOpacity : 1;
    const bodyFontSize = primarySize;
    const bodyFontWeight = 500;
    const labelColor = accent;
    const bodyText = formatInstructionBodyText(tier.body);
    return /*#__PURE__*/React.createElement("div", {
      key: tier.key,
      className: "cue-tiers__block",
      style: {
        padding: compact ? "14px 0" : "16px 0",
        marginTop: 0,
        borderTop: idx === 0 ? "none" : "1px solid var(--instruction-step-divider)"
      }
    }, /*#__PURE__*/
    React.createElement("div", { className: "cue-tiers__label", style: {
        fontSize: labelSize,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: labelColor,
        marginBottom: compact ? 6 : 8
      } }, tier.label), /*#__PURE__*/
    React.createElement("div", { style: {
        fontSize: bodyFontSize,
        fontWeight: bodyFontWeight,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        color: bodyColor,
        opacity: bodyOpacity,
        whiteSpace: "normal",
        transition: tier.key === "next" ? "opacity 0.18s ease-out" : "none"
      } }, bodyText));
  }));
}

function buildInstructionTiersFromExercise(ex, startText, steps) {
  if (ex && axisHasExplicitInstructionFields(ex)) {
    const tiers = [
    { key: "position", label: "POSITION", body: axisCleanInstructionLine(ex.position), tone: "primary" },
    { key: "next", label: "NEXT", body: axisCleanInstructionLine(ex.next), tone: "primary" },
    { key: "then", label: "THEN", body: axisCleanInstructionLine(ex.then), tone: "primary" },
    { key: "tip", label: "END/TIP", body: axisCleanInstructionLine(ex.tip), tone: "primary" }];

    return tiers.filter((tier) => tier.body);
  }
  return buildInstructionTiers(startText, steps);
}

function Steps({ steps, small, start: startText, exerciseId, exerciseName, theme = "dark", ultraNight = false, trackId, exercise, sessionExerciseCardExpanded = false }) {
  const tiers = exercise ? buildInstructionTiersFromExercise(exercise, startText, steps) : buildInstructionTiers(startText, steps);
  const animKey = exercise ? resolveExerciseAnimationKey(trackId, exercise.id, exercise.name) : resolveExerciseAnimationKey(trackId, exerciseId, exerciseName);
  const animMode = exerciseAnimationModeFromTheme(theme, ultraNight);
  const frameArr = instructionFrameArrayForCarousel(animKey);
  const safetyEl = exercise ? /*#__PURE__*/React.createElement(AxisExerciseSafetyCallouts, { exercise, ultraNight, layout: "detail" }) : null;
  const loopVideoSrc = exercise ? axisResolveExerciseLoopVideoSrc(trackId, exercise) : "";
  const fallbackDemoVideo = exercise && exercise.demoVideo ? exercise.demoVideo : "";
  const loopVideoPoster = exercise && exercise.axisLoopVideoPoster ? String(exercise.axisLoopVideoPoster) : "";
  const safetyFlags = exercise ? axisResolveExerciseSafetyFlags(exercise) : { nerve: false, caution: false };
  const showRiskInline = !!(sessionExerciseCardExpanded && exercise && (safetyFlags.nerve || safetyFlags.caution));
  const riskKind = safetyFlags.nerve ? "nerve" : "caution";
  const inlineNoteEl = showRiskInline ? /*#__PURE__*/React.createElement(AxisExerciseSafetyInlineNote, { variant: "session", riskKind }) : null;
  if (tiers.length === 0 && !animKey && !showRiskInline) return null;
  if (tiers.length === 0 && !animKey) return /*#__PURE__*/React.createElement("div", { className: small ? "steps" : "fc-steps" }, safetyEl, inlineNoteEl);
  if (tiers.length > 0) {
    return /*#__PURE__*/React.createElement("div", { className: small ? "steps" : "fc-steps" }, safetyEl, inlineNoteEl, /*#__PURE__*/React.createElement(ExerciseCarousel, {
      tiers: tiers,
      frameSvgHtml: frameArr,
      animationKey: animKey,
      size: small ? "small" : "medium",
      graphicMode: animMode,
      theme: theme,
      ultraNight: ultraNight,
      moveOpacity: 1,
      trackId: trackId,
      allowBaselineMediaExpand: true,
      sessionExerciseCardExpanded: sessionExerciseCardExpanded,
      loopVideoSrc: loopVideoSrc,
      fallbackDemoVideo: fallbackDemoVideo,
      loopVideoPoster: loopVideoPoster
    }));
  }
  return /*#__PURE__*/React.createElement("div", { className: small ? "steps" : "fc-steps" }, safetyEl, inlineNoteEl, /*#__PURE__*/React.createElement(ExerciseAnimation, { animationKey: animKey, mode: animMode, variant: "default" }));
}

function GuidedRestTimer({ seconds = 15, accent, trackColor, hidden = false, paused = false, onComplete }) {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  const fillRef = useRef(null);
  const completedRef = useRef(false);
  const prepCountdownHapticSecRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    completedRef.current = false;
    prepCountdownHapticSecRef.current = null;
    axisGuidedRestStartCue();
    const totalMs = Math.max(0, seconds * 1000);
    let deadline = performance.now() + totalMs;
    let pausedAt = null;
    let rafId = 0;
    let lastCeil = seconds;
    const applyFill = (t) => {
      const el = fillRef.current;
      if (!el) return;
      const x = Math.min(1, Math.max(0, t));
      el.style.transform = `scaleX(${x})`;
    };
    const step = (now) => {
      if (completedRef.current) return;
      if (pausedRef.current) {
        if (pausedAt == null) pausedAt = now;
        rafId = requestAnimationFrame(step);
        return;
      }
      if (pausedAt != null) {
        deadline += now - pausedAt;
        pausedAt = null;
      }
      const remainingMs = Math.max(0, deadline - now);
      const frac = totalMs > 0 ? (totalMs - remainingMs) / totalMs : 1;
      applyFill(frac);
      const ceilSec = remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
      if (ceilSec !== lastCeil) {
        lastCeil = ceilSec;
        setRemainingSeconds(ceilSec);
      }
      if (remainingMs > 0 && ceilSec >= 1 && ceilSec <= 3 && prepCountdownHapticSecRef.current !== ceilSec) {
        prepCountdownHapticSecRef.current = ceilSec;
        axisGuidedPrepCountdownCue();
      }
      if (remainingMs <= 0 && !completedRef.current) {
        completedRef.current = true;
        applyFill(1);
        setRemainingSeconds(0);
        requestAnimationFrame(() => onCompleteRef.current && onCompleteRef.current());
        return;
      }
      rafId = requestAnimationFrame(step);
    };
    setRemainingSeconds(seconds);
    applyFill(0);
    lastCeil = seconds;
    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      applyFill(0);
    };
  }, [seconds]);
  const display = `0:${Math.max(0, remainingSeconds).toString().padStart(2, "0")}`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "guided-rest-timer__column" }, /*#__PURE__*/
    React.createElement("div", { className: "guided-rest-timer__digits", style: {
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        fontFamily: '"DM Mono", var(--font-data), ui-monospace, monospace',
        fontWeight: 400,
        color: accent,
        lineHeight: 1,
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.12s ease-out"
      } }, display), /*#__PURE__*/
    React.createElement("div", { style: {
        marginTop: 10,
        width: "100%",
        height: 4,
        borderRadius: 2,
        background: trackColor,
        overflow: "hidden",
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.12s ease-out"
      } }, /*#__PURE__*/
    React.createElement("div", {
      ref: fillRef,
      style: {
        height: 4,
        width: "100%",
        borderRadius: 2,
        background: accent,
        transformOrigin: "left center",
        transform: "scaleX(0)",
        willChange: "transform"
      }
    }))));
}

function axisGuidedExerciseTimerStartSec(seconds, initialRemainingSeconds) {
  let startSec = seconds;
  if (typeof initialRemainingSeconds === "number" && initialRemainingSeconds > 0 && initialRemainingSeconds <= seconds) {
    startSec = Math.floor(initialRemainingSeconds);
  }
  return startSec;
}

function GuidedActiveTimer({ seconds = 45, accent, trackColor, hidden = false, paused = false, onComplete, hapticMidpoint = false, initialRemainingSeconds, onRemainingSecondsChange }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => axisGuidedExerciseTimerStartSec(seconds, initialRemainingSeconds));
  const fillRef = useRef(null);
  const completedRef = useRef(false);
  const midpointTriggeredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    if (typeof onRemainingSecondsChange === "function") {
      onRemainingSecondsChange(remainingSeconds);
    }
  }, [remainingSeconds, onRemainingSecondsChange]);
  useEffect(() => {
    completedRef.current = false;
    midpointTriggeredRef.current = false;
    let startSec = axisGuidedExerciseTimerStartSec(seconds, initialRemainingSeconds);
    const totalMs = Math.max(0, seconds * 1000);
    const midpointThreshold = Math.ceil(seconds / 2);
    if (hapticMidpoint && typeof initialRemainingSeconds === "number" && initialRemainingSeconds > 0) {
      if (startSec < midpointThreshold) {
        midpointTriggeredRef.current = true;
      }
    }
    let deadline = performance.now() + startSec * 1000;
    let pausedAt = null;
    let rafId = 0;
    let lastIntegerSec = startSec;
    const applyFill = (t) => {
      const el = fillRef.current;
      if (!el) return;
      const x = Math.min(1, Math.max(0, t));
      el.style.transform = `scaleX(${x})`;
    };
    const step = (now) => {
      if (completedRef.current) return;
      if (pausedRef.current) {
        if (pausedAt == null) pausedAt = now;
        rafId = requestAnimationFrame(step);
        return;
      }
      if (pausedAt != null) {
        deadline += now - pausedAt;
        pausedAt = null;
      }
      const remainingMs = Math.max(0, deadline - now);
      const frac = totalMs > 0 ? (totalMs - remainingMs) / totalMs : 1;
      applyFill(frac);
      const intSec = remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
      if (intSec !== lastIntegerSec) {
        lastIntegerSec = intSec;
        setRemainingSeconds(intSec);
      }
      if (hapticMidpoint && !midpointTriggeredRef.current && intSec === midpointThreshold && remainingMs > 0) {
        midpointTriggeredRef.current = true;
        triggerHaptic(HAPTIC_MEDIUM);
      }
      if (remainingMs <= 0 && !completedRef.current) {
        completedRef.current = true;
        applyFill(1);
        setRemainingSeconds(0);
        requestAnimationFrame(() => onCompleteRef.current && onCompleteRef.current());
        return;
      }
      rafId = requestAnimationFrame(step);
    };
    setRemainingSeconds(startSec);
    applyFill(seconds > 0 ? (seconds - startSec) / seconds : 1);
    lastIntegerSec = startSec;
    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      applyFill(0);
    };
  }, [seconds, hapticMidpoint, initialRemainingSeconds]);
  const display = `${Math.floor(Math.max(0, remainingSeconds) / 60)}:${(Math.max(0, remainingSeconds) % 60).toString().padStart(2, "0")}`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "guided-rest-timer__column" }, /*#__PURE__*/
    React.createElement("div", { className: "guided-rest-timer__digits", style: {
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        fontFamily: '"DM Mono", var(--font-data), ui-monospace, monospace',
        fontWeight: 400,
        color: accent,
        lineHeight: 1,
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.12s ease-out"
      } }, display), /*#__PURE__*/
    React.createElement("div", { style: {
        marginTop: 10,
        width: "100%",
        height: 4,
        borderRadius: 2,
        background: trackColor,
        overflow: "hidden",
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.12s ease-out"
      } }, /*#__PURE__*/
    React.createElement("div", {
      ref: fillRef,
      style: {
        height: 4,
        width: "100%",
        borderRadius: 2,
        background: accent,
        transformOrigin: "left center",
        transform: "scaleX(0)",
        willChange: "transform"
      }
    }))));
}

function ExRow({ ex, done, onToggle, open, onExpand, skipped, onSkip, faved, onFav, note, onNote, nextName, hideTimer = false, hideDone = false, exerciseDurationSeconds, theme = "dark", ultraNight = false, trackId, listRailLayout = false, guidedPreviewLayout = false, listSectionLabel = "", firstBookmarkTooltip = false }) {
  const rowRef = useRef(null);
  const sessionDetailPanelRef = useRef(null);
  const [armed, setArmed] = React.useState(false);
  const markDoneAndCollapse = () => {
    triggerHaptic(HAPTIC_SUCCESS);
    onToggle();
    if (open) onExpand();
  };
  const listRailCompactLayout = listRailLayout && !hideDone;
  useEffect(() => {
    if (open && rowRef.current && !listRailCompactLayout) {
      setTimeout(() => rowRef.current && rowRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [open, ex && ex.id, listRailCompactLayout]);
  useEffect(() => {
    // Re-arm instructions when opening a different exercise.
    setArmed(false);
  }, [ex && ex.id, open]);
  const listDurationLabel = skipped ? null : (() => {
    const effectiveSeconds = exerciseDurationSeconds != null ? exerciseDurationSeconds : ex.seconds || 0;
    const useOverride = exerciseDurationSeconds != null;
    return useOverride ?
    effectiveSeconds === 60 ? "1 MIN" : `${effectiveSeconds} SEC` :
    ex.reps || null;
  })();
  const sessionDurRaw = listDurationLabel;
  const durationEl = sessionDurRaw ? /*#__PURE__*/React.createElement("div", { className: "ereps" }, String(sessionDurRaw)) : null;
  const metaZonePlain = String(listSectionLabel || "").trim();
  const listMetaSecondary = listRailLayout ? axisExerciseTrackMetaOneWord(ex) : axisExerciseTargetMetaLine(ex, metaZonePlain);
  const listTabExerciseTitle = listRailLayout && !hideDone ? axisExerciseListParenDirectionDisplayName(ex.name) : ex.name;
  const listRailCategoryBadge = listMetaSecondary ? String(listMetaSecondary).trim().toUpperCase() : "";
  const bookmarkTipPreferBottom = typeof window !== "undefined" && window.innerWidth < 400;
  const listRailSkipLabelEl = listRailLayout ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "er-list-skip-label" + (skipped ? " er-list-skip-label--skipped" : ""),
    onClick: (e) => {e.stopPropagation();onSkip();},
    "aria-label": skipped ? "Unskip exercise" : "Skip exercise"
  }, "SKIP") : null;
  const listRailBookmarkBtnEl = /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "er-list-icon-btn er-list-pin-btn" + (faved ? " er-list-pin-btn--pinned" : ""),
    onClick: (e) => {e.stopPropagation();triggerHaptic(HAPTIC_DOUBLE_TAP);onFav();},
    "aria-label": faved ? "Remove exercise bookmark" : "Bookmark exercise",
    "aria-pressed": faved ? "true" : "false"
  }, /*#__PURE__*/React.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, faved ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" })));
  const listRailBookmarkHostEl = /*#__PURE__*/React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
  React.createElement(AxisFirstBookmarkSavedTip, { active: firstBookmarkTooltip, preferBottom: bookmarkTipPreferBottom }),
  listRailBookmarkBtnEl);
  /* Chevron stays outside .row-actions (wrapper stopPropagation would block .er expand) */
  const rowActionsEl = /*#__PURE__*/React.createElement("div", { className: "row-actions", onClick: (e) => e.stopPropagation() },
  /*#__PURE__*/React.createElement("button", { type: "button", className: `ra-btn ${skipped ? "skip-on" : ""}`, onClick: onSkip, "aria-label": skipped ? "Unskip exercise" : "Skip exercise" }, /*#__PURE__*/React.createElement("span", { className: "ra-btn__dash", "aria-hidden": true }, "\u2014")),
  !skipped && /*#__PURE__*/React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
  React.createElement(AxisFirstBookmarkSavedTip, { active: firstBookmarkTooltip, preferBottom: bookmarkTipPreferBottom }), /*#__PURE__*/
  React.createElement("button", { type: "button", className: `ra-btn ${faved ? "fav-on" : ""}`, onClick: (e) => {e.stopPropagation();triggerHaptic(HAPTIC_DOUBLE_TAP);onFav();}, "aria-label": faved ? "Remove exercise bookmark" : "Bookmark exercise", "aria-pressed": faved ? "true" : "false" }, /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, faved ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" })))
  )
  );
  const unicodeChevronEl = /*#__PURE__*/React.createElement("div", { className: `chev ${open ? "op" : ""}`, style: guidedPreviewLayout ? {} : { marginLeft: 2 } }, "\u25BE");
  const listRailPinskipRowEl = listRailLayout ? /*#__PURE__*/React.createElement("div", { className: "er-list-pin-skip-row", onClick: (e) => e.stopPropagation() },
  listRailSkipLabelEl,
  listRailBookmarkHostEl) : null;
  const listRailCompactPinBtnEl = /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "er-list-icon-btn er-list-pin-btn" + (faved ? " er-list-pin-btn--pinned" : ""),
    onClick: (e) => {e.stopPropagation();triggerHaptic(HAPTIC_DOUBLE_TAP);onFav();},
    "aria-label": faved ? "Remove exercise bookmark" : "Bookmark exercise",
    "aria-pressed": faved ? "true" : "false"
  }, /*#__PURE__*/React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, faved ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" })));
  const listRailCompactBookmarkHostEl = /*#__PURE__*/React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
  React.createElement(AxisFirstBookmarkSavedTip, { active: firstBookmarkTooltip, preferBottom: bookmarkTipPreferBottom }),
  listRailCompactPinBtnEl);
  const listRailCompactPinSkipRowEl = listRailLayout ? /*#__PURE__*/React.createElement("div", { className: "er-list-pin-skip-row er-list-pin-skip-row--compact", onClick: (e) => e.stopPropagation() },
  listRailSkipLabelEl,
  listRailCompactBookmarkHostEl) : null;
  const listRailBadgeRowEl = listRailCategoryBadge ? /*#__PURE__*/React.createElement("div", { className: "er-list-badge-row" },
  /*#__PURE__*/React.createElement("span", { className: "er-list-category-badge" }, listRailCategoryBadge)
  ) : null;
  const listRailExpandSvgEl = /*#__PURE__*/React.createElement("div", {
    className: "er-list-expand-chev",
    "aria-hidden": true }, /*#__PURE__*/React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("polyline", { points: "6 9 12 15 18 9" })));
  const listRailCompactBadgeChevRowEl = /*#__PURE__*/React.createElement("div", { className: "er-list-badge-chev-row" },
  listRailBadgeRowEl,
  listRailExpandSvgEl);
  const listRailMetaChevRowEl = /*#__PURE__*/React.createElement("div", { className: "er-list-meta-chev-row" },
  /*#__PURE__*/React.createElement("div", { className: "er-list-meta-row-wrap" },
  listMetaSecondary ? /*#__PURE__*/React.createElement("div", { className: "er-list-meta-row" + (hideDone ? " er-list-meta-row--guided" : "") },
  /*#__PURE__*/React.createElement("span", { className: "er-list-meta-zone" }, listMetaSecondary)
  ) : null),
  listRailExpandSvgEl);

  const listRailControlsEl = /*#__PURE__*/React.createElement("div", { className: "er-list-controls" }, rowActionsEl, unicodeChevronEl);
  const guidedToolbarEl = /*#__PURE__*/React.createElement("div", { className: "er-guided-toolbar" }, /*#__PURE__*/React.createElement("div", { className: "er-guided-controls" }, rowActionsEl, unicodeChevronEl));
  const chkEl = !hideDone && /*#__PURE__*/React.createElement("div", { className: `er-list-complete ${done && !skipped ? "er-list-complete--on" : ""}`, role: "button", tabIndex: 0, "aria-label": done && !skipped ? "Mark exercise not done" : "Mark exercise done", "aria-pressed": done && !skipped ? "true" : "false", onClick: (e) => {e.stopPropagation();if (!skipped) {triggerHaptic(HAPTIC_SUCCESS);onToggle();}} }, /*#__PURE__*/
  React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true }, /*#__PURE__*/
  React.createElement("polyline", { points: "20 6 9 17 4 12", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "er-list-complete__tick" })
  )
  );
  return (/*#__PURE__*/
    React.createElement("div", { className: `er-card${open ? " er-card--open" : ""}${listRailLayout && faved ? " er-card--pinned" : ""}${listRailLayout && skipped ? " er-card--list-skipped" : ""}${listRailLayout && done && !skipped ? " er-card--complete" : ""}` }, /*#__PURE__*/
    React.createElement("div", { ref: rowRef, className: `er ${open ? "open" : ""} ${skipped ? "skipped" : ""}${listRailLayout ? " er--list-rail er--list-card-a" : ""}${listRailLayout && hideDone ? " er--list-card-a--guided" : ""}`, onClick: () => {axisHapticTick();onExpand();}, style: {} },
    listRailLayout ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { className: "er-list-sheet" + (listRailCompactLayout ? " er-list-sheet--compact" : "") + (hideDone ? " er-list-sheet--guided" : "") },
    !hideDone && chkEl,
    /*#__PURE__*/    React.createElement("div", { className: "er-list-center" },
    listRailCompactLayout ? /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { className: "er-list-title-row" }, /*#__PURE__*/
    React.createElement("div", { className: `er-list-title ${done && !skipped ? "er-list-title--done" : ""} ${skipped ? "er-list-title--skipped" : ""}` }, listTabExerciseTitle),
    listRailCompactPinSkipRowEl),
    /*#__PURE__*/React.createElement("div", { className: `er-list-desc er-list-desc--rail${done && !skipped ? " er-list-desc--done" : ""}` }, ex.sub),
    listRailCompactBadgeChevRowEl
    ) : /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { className: "er-list-title-row" }, /*#__PURE__*/
    React.createElement("div", { className: "er-list-title-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: `er-list-title ${done && !skipped ? "er-list-title--done" : ""} ${skipped ? "er-list-title--skipped" : ""}` }, listTabExerciseTitle)),
    listRailPinskipRowEl),
    /*#__PURE__*/React.createElement("div", { className: `er-list-desc er-list-desc--rail${done && !skipped ? " er-list-desc--done" : ""}` }, ex.sub),
    listRailMetaChevRowEl
    ))
    )) : /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { className: guidedPreviewLayout ? "er-top er-top--guided-preview" : "er-top" },
    /*#__PURE__*/React.createElement("div", { className: "ei er-top-title-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: `en ${done && !skipped ? "done" : ""} ${skipped ? "skipped" : ""}` }, ex.name)
    ), /*#__PURE__*/
    !guidedPreviewLayout && chkEl,
    !guidedPreviewLayout && !listRailLayout && listRailControlsEl
    ), /*#__PURE__*/
    /*#__PURE__*/React.createElement("div", { className: guidedPreviewLayout ? "er-body er-body--guided-preview" : "er-body" }, /*#__PURE__*/
    React.createElement("div", { className: "es" }, ex.sub),
    guidedPreviewLayout && guidedToolbarEl,
    !guidedPreviewLayout && durationEl
    )
    )
    ),
    open && /*#__PURE__*/
    React.createElement("div", { ref: sessionDetailPanelRef, className: "panel protocol-panel", tabIndex: -1, role: "region", "aria-label": `${listRailLayout && !hideDone ? listTabExerciseTitle : ex.name}, exercise details`, style: skipped && !listRailLayout ? { opacity: 0.45 } : {} }, /*#__PURE__*/
    React.createElement(Steps, {
      steps: ex.steps,
      small: true,
      start: ex.start || undefined,
      exerciseId: ex.id,
      exerciseName: listRailLayout && !hideDone ? listTabExerciseTitle : ex.name,
      theme: theme,
      ultraNight: ultraNight,
      trackId: trackId,
      exercise: ex,
      sessionExerciseCardExpanded: !!listRailLayout }
    ),
    !skipped && /*#__PURE__*/React.createElement(React.Fragment, null,
    (ex.type === "time" || ex.type === "flow") && !hideTimer ? !armed ? /*#__PURE__*/React.createElement("div", { className: "session-timer-cta-wrap" }, /*#__PURE__*/
    ex && ex.__axisInstructions && ex.__axisInstructions.sideLabel ? React.createElement("div", { style: { fontSize: "12px", color: "var(--text-secondary)", marginBottom: 12, textAlign: "center", width: "100%" } }, ex.__axisInstructions.sideLabel) : null,
    React.createElement("button", { className: "mark-btn ultra-filled-btn mark-btn--start-timer", onClick: (e) => {e.stopPropagation();axisHapticTick();setArmed(true);} }, "START TIMER")
    ) :
    React.createElement("div", { className: "session-timer-cta-wrap" }, /*#__PURE__*/
    ex && ex.__axisInstructions && ex.__axisInstructions.sideLabel ? React.createElement("div", { style: { fontSize: "12px", color: "var(--text-secondary)", marginBottom: 12, textAlign: "center", width: "100%" } }, ex.__axisInstructions.sideLabel) : null,
    React.createElement(Timer, { key: `t-${ex.id}`, seconds: exerciseDurationSeconds != null ? exerciseDurationSeconds : ex.seconds, onDone: markDoneAndCollapse, nextName: nextName, autoStart: true })
    ) :
    ex.reps && !hideDone && ex.id !== 5 && ex.id !== 702 ? /*#__PURE__*/
    React.createElement("div", { className: "session-timer-cta-wrap session-target-cta-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "session-target-label" }, "Target"), /*#__PURE__*/
    React.createElement("div", { className: "session-target-value" },
    ex.reps
    ), /*#__PURE__*/
    React.createElement("button", { className: "mark-btn ultra-filled-btn", onClick: (e) => {e.stopPropagation();markDoneAndCollapse();} }, "Mark Done")
    ) :
    ex.reps && (ex.id === 5 || ex.id === 702) && !hideDone ? /*#__PURE__*/
    React.createElement("div", { className: "session-timer-cta-wrap" }, /*#__PURE__*/
    React.createElement("button", { className: "mark-btn ultra-filled-btn", onClick: (e) => {e.stopPropagation();markDoneAndCollapse();} }, "Mark Done")
    ) :
    !hideDone ? /*#__PURE__*/React.createElement("div", { className: "session-timer-cta-wrap" }, /*#__PURE__*/
    React.createElement("button", { className: "mark-btn ultra-filled-btn", onClick: (e) => {e.stopPropagation();markDoneAndCollapse();} }, "Mark Done")
    ) : null

    )
    )
    ));

}


// ─────────────────────────────────────────────────────────────
//  WEEK MOMENTUM — shared 7-day window (header strip + Summary)
// ─────────────────────────────────────────────────────────────
function axisWeekMomentumFromHistory(history) {
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const sessionCounts = (history || []).reduce((acc, e) => {
    const key = axisLocalDateKey(e && e.date);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const active = dates.map((ds) => (sessionCounts[ds] || 0) > 0);
  return { dates, sessionCounts, active };
}

function axisWeekdayShortLabel(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const labels = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
  return labels[d.getDay()];
}

function AxisFirstBookmarkSavedTip({ active, preferBottom = false }) {
  const [mounted, setMounted] = React.useState(false);
  const [opaque, setOpaque] = React.useState(false);
  React.useEffect(() => {
    if (!active) {
      setMounted(false);
      setOpaque(false);
      return;
    }
    const inMs = axisCelebrationFadeMs(200);
    const hold = 1800;
    const outMs = axisCelebrationFadeMs(200);
    setMounted(true);
    setOpaque(false);
    const tIn = window.setTimeout(() => setOpaque(true), 16);
    const tOut = window.setTimeout(() => setOpaque(false), inMs + hold);
    const tDone = window.setTimeout(() => {
      setMounted(false);
    }, inMs + hold + outMs);
    return () => {
      clearTimeout(tIn);
      clearTimeout(tOut);
      clearTimeout(tDone);
    };
  }, [active]);
  if (!mounted) return null;
  return (/*#__PURE__*/
    React.createElement("span", {
      className: "axis-first-bookmark-tip" + (preferBottom ? " axis-first-bookmark-tip--bottom" : "") + " axis-first-bookmark-tip--visible",
      role: "status",
      style: { opacity: opaque ? 1 : 0, transition: `opacity ${axisCelebrationFadeMs(200)}ms ease-out` }
    }, /*#__PURE__*/
    React.createElement("span", { className: "axis-first-bookmark-tip__caret", "aria-hidden": true }), "Saved to Bookmarks.")
  );
}

// ─────────────────────────────────────────────────────────────
//  MOMENTUM — 7-day strip (device-only)
// ─────────────────────────────────────────────────────────────
function MomentumMap({ history, nightMode = false, theme = "dark", compact = false, metricsQuickGlance = false }) {
  const [detailDate, setDetailDate] = React.useState(null);
  const [perfectPulse, setPerfectPulse] = React.useState(false);
  const [perfectCaptionVisible, setPerfectCaptionVisible] = React.useState(false);
  const perfectTimersRef = React.useRef([]);
  const { dates, sessionCounts, active } = axisWeekMomentumFromHistory(history);
  const weekKey = React.useMemo(() => axisMomentumWeekKeyFromDates(dates), [dates]);
  const allSevenFilled = active.length === 7 && active.every(Boolean);
  const minutesByDate = React.useMemo(() => {
    const acc = {};
    for (const e of history || []) {
      const k = axisLocalDateKey(e && e.date);
      if (!k) continue;
      acc[k] = (acc[k] || 0) + (Number(e.duration) || 0);
    }
    return acc;
  }, [history]);
  const detailEntries = React.useMemo(() => {
    if (!detailDate) return [];
    return (history || []).filter((e) => axisLocalDateKey(e.date) === detailDate);
  }, [history, detailDate]);

  React.useEffect(() => {
    perfectTimersRef.current.forEach(clearTimeout);
    perfectTimersRef.current = [];
    if (!metricsQuickGlance) {
      setPerfectPulse(false);
      setPerfectCaptionVisible(false);
      return;
    }
    if (!allSevenFilled || !weekKey) {
      setPerfectPulse(false);
      setPerfectCaptionVisible(false);
      return;
    }
    const reduced = axisPrefersReducedMotion();
    const storageKey = `axis_perfect_week_${weekKey}`;
    const alreadyPulsed = storageGet(storageKey, false);
    const pulseMs = reduced ? 0 : 400;
    const maxStagger = reduced ? 0 : 240;
    const captionDelayAfterPulse = reduced ? axisCelebrationFadeMs(300) : 300;

    if (!alreadyPulsed) {
      try { storageSet(storageKey, true); } catch (e) {}
      setPerfectPulse(true);
      const tOff = window.setTimeout(() => setPerfectPulse(false), pulseMs + maxStagger + 40);
      perfectTimersRef.current.push(tOff);
    } else {
      setPerfectPulse(false);
    }

    const capDelay = alreadyPulsed ? 0 : pulseMs + maxStagger + captionDelayAfterPulse;
    const capIn = window.setTimeout(() => setPerfectCaptionVisible(true), capDelay);
    perfectTimersRef.current.push(capIn);

    return () => {
      perfectTimersRef.current.forEach(clearTimeout);
      perfectTimersRef.current = [];
    };
  }, [history, metricsQuickGlance, weekKey, allSevenFilled]);

  const styleDayOff = theme === "light" ? {
    background: "#9F9FA5",
    border: "1px solid rgba(15, 30, 46, 0.125)",
    boxShadow: "none",
    backdropFilter: "none",
    WebkitBackdropFilter: "none"
  } : {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    boxShadow: "inset 0 1px 0 var(--glass-specular)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)"
  };
  return (/*#__PURE__*/
    React.createElement("div", { className: "summary-momentum" + (compact ? " summary-momentum--compact" : "") + (metricsQuickGlance ? " summary-momentum--metrics-quick" : "") }, /*#__PURE__*/
    !metricsQuickGlance && /*#__PURE__*/React.createElement("div", { className: "summary-momentum-head" }, /*#__PURE__*/
    React.createElement("div", { className: "summary-title", style: { marginBottom: compact ? 0 : 6 } }, compact ? "Last 7 days" : "7-Day Momentum"), /*#__PURE__*/
    compact && /*#__PURE__*/React.createElement("div", { className: "momentum-compact-hint" }, "Click a box for detailed info."), /*#__PURE__*/
    !compact && /*#__PURE__*/React.createElement("div", { className: "momentum-explainer" }, "Each square is one day. Filled = at least one logged session that day (tap a day for minutes and sessions).")
    ),
    React.createElement("div", { className: "momentum-strip", role: "group", "aria-label": "Seven days of session activity" },
    dates.map((dateStr, i) => {
      const count = sessionCounts[dateStr] || 0;
      const on = active[i];
      const mins = minutesByDate[dateStr] || 0;
      const styleNight = {
        background: on ? "#FF3B30" : "#000000",
        boxShadow: "none",
        border: "1px solid #FF3B30"
      };
      const styleDay = on ? {
        background: "var(--mood-color)",
        border: "1px solid color-mix(in srgb, var(--mood-color) 70%, transparent)",
        boxShadow: "inset 0 1px 0 var(--glass-specular), 0 0 12px color-mix(in srgb, var(--mood-color) 35%, transparent)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none"
      } : styleDayOff;
      const selected = detailDate === dateStr;
      const staggerMs = perfectPulse && metricsQuickGlance && allSevenFilled && !axisPrefersReducedMotion() ? i * 40 : 0;
      const baseStyle = nightMode ? styleNight : styleDay;
      const mergedStyle = staggerMs ? { ...baseStyle, animationDelay: `${staggerMs}ms` } : baseStyle;
      return (/*#__PURE__*/
        React.createElement("button", {
          key: i,
          type: "button",
          className: "momentum-cell momentum-cell--btn" + (on ? " momentum-cell--on" : "") + (selected ? " momentum-cell--selected" : "") + (perfectPulse && metricsQuickGlance && allSevenFilled ? " axis-perfect-week-pulse" : ""),
          style: mergedStyle,
          "aria-label": `${dateStr}: ${count} session(s), ${mins} minutes`,
          "aria-pressed": selected ? "true" : "false",
          onClick: () => {axisHapticTick();setDetailDate((d) => d === dateStr ? null : dateStr);}
        }, /*#__PURE__*/
        React.createElement("span", { className: "momentum-cell__dow", "aria-hidden": true }, axisWeekdayShortLabel(dateStr))));

    }    )
    ), /*#__PURE__*/
    metricsQuickGlance && allSevenFilled ? /*#__PURE__*/React.createElement("div", {
      className: "axis-perfect-week-caption" + (perfectCaptionVisible ? " axis-perfect-week-caption--visible" : "")
    }, "Perfect week.") : null,
    !compact && /*#__PURE__*/React.createElement("div", { className: "momentum-labels" }, /*#__PURE__*/
    React.createElement("span", { className: "momentum-label" }, "7 days ago"), /*#__PURE__*/
    React.createElement("span", { className: "momentum-label" }, "Today")
    ), /*#__PURE__*/
    detailDate && /*#__PURE__*/React.createElement("div", { className: "momentum-day-detail", role: "region", "aria-label": "Selected day detail" }, /*#__PURE__*/
    React.createElement("div", { className: "momentum-day-detail__head" }, /*#__PURE__*/
    React.createElement("span", null, axisRelativeDayLabel(detailDate)), /*#__PURE__*/
    React.createElement("span", { className: "momentum-day-detail__tot" }, /*#__PURE__*/React.createElement("span", { className: "axis-duration-label" }, axisFormatDurationMinUpper(minutesByDate[detailDate] || 0)), " · ", detailEntries.length, " session", detailEntries.length !== 1 ? "s" : "")
    ),
    detailEntries.length === 0 ? /*#__PURE__*/React.createElement("div", { className: "momentum-day-detail__empty" }, "No entries.") : /*#__PURE__*/React.createElement("ul", { className: "momentum-day-detail__list" },
    detailEntries.map((e, idx) => {
      const exLabel = axisExerciseNameForHistoryEntry(e);
      return (/*#__PURE__*/React.createElement("li", { key: `${idx}-${e.exerciseId != null ? e.exerciseId : "x"}` }, /*#__PURE__*/
      React.createElement("span", { className: "momentum-day-detail__cell-left" }, exLabel ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", { className: "momentum-day-detail__exercise" }, exLabel), /*#__PURE__*/React.createElement("span", { className: "momentum-day-detail__track momentum-day-detail__track--sub" }, e.track)) : /*#__PURE__*/React.createElement("span", { className: "momentum-day-detail__track" }, e.track)), /*#__PURE__*/
      React.createElement("span", { className: "momentum-day-detail__dur axis-duration-label" }, axisFormatDurationMinUpper(e.duration))
      ));
    })
    ),
    React.createElement("button", { type: "button", className: "momentum-day-detail__close", onClick: () => setDetailDate(null) }, "Close")
    )
    ));

}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD HEADER (global: progress + AXIS + streak)
// ─────────────────────────────────────────────────────────────
function DashboardHeader({ progressFillPct = 0, progressOverdrive = false, history = [] }) {
  const pct = Math.max(0, Math.min(100, Number(progressFillPct) || 0));
  const { active } = axisWeekMomentumFromHistory(history);
  const activeCount = active.filter(Boolean).length;
  return /*#__PURE__*/React.createElement("header", { className: "dashboard-header", role: "banner" }, /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__row" }, /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__left" }, /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__progress-track", role: "progressbar", "aria-valuenow": Math.round(pct), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Daily goal progress" }, /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__progress-fill" + (progressOverdrive ? " dashboard-header__progress-fill--overdrive" : ""), style: { width: pct + "%" } })
  )
  ), /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__brand", "aria-label": "AXIS" }, "AXIS"), /*#__PURE__*/
  React.createElement("div", { className: "dashboard-header__right", role: "img", "aria-label": `${activeCount} of 7 days with activity` },
  Array.from({ length: 7 }, (_, i) => /*#__PURE__*/
  React.createElement("div", {
    key: i,
    className: "dashboard-header__streak-cell" + (active[i] ? " dashboard-header__streak-cell--on" : "")
  })
  )
  )
  )
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB BAR — 5 tabs: HOME · BOOKMARKS · TIMER · METRICS · SYSTEM
// ─────────────────────────────────────────────────────────────
function TabBar({ view, setView, theme, nightMode = false, onSystemTab }) {
  const gotoSystem = () => {
    axisHapticTick();
    if (typeof onSystemTab === "function") onSystemTab();
    else setView("system");
  };
  const HomeIcon = () => /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M3 22V9L12 2l9 7v13h-6v-10H9v10H3z" }));
  const MetricsIcon = () => /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("g", { transform: "translate(12 12) scale(0.87) translate(-12 -12)" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /*#__PURE__*/React.createElement("polyline", { points: "8 12.5 11 15.5 16.5 9" })));
  const TimerIcon = () => /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("g", { transform: "translate(12 12) scale(0.87) translate(-12 -12)" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /*#__PURE__*/React.createElement("path", { d: "M12 7.5 L12 12 L17 12" })));
  const BookmarkTabIcon = () => /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M6.5 3.5h11c.83 0 1.5.67 1.5 1.5v15.28l-7-5.42-7 5.42V5c0-.83.67-1.5 1.5-1.5Z" }));
  const SystemMatrixTabIcon = () => /*#__PURE__*/React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("g", { transform: "translate(12 12) scale(0.94) translate(-12 -12)", strokeWidth: "0.9" }, /*#__PURE__*/React.createElement("rect", { x: "3.5", y: "3.5", width: "6.5", height: "6.5", rx: "0.75" }), /*#__PURE__*/React.createElement("rect", { x: "14", y: "3.5", width: "6.5", height: "6.5", rx: "0.75" }), /*#__PURE__*/React.createElement("rect", { x: "3.5", y: "14", width: "6.5", height: "6.5", rx: "0.75" }), /*#__PURE__*/React.createElement("rect", { x: "14", y: "14", width: "6.5", height: "6.5", rx: "0.75" })));

  const bar = /*#__PURE__*/
  React.createElement("div", { className: "tab-bar", "data-theme": theme, "data-night": nightMode ? "true" : "false", role: "navigation", "aria-label": "Main" }, /*#__PURE__*/
  React.createElement("div", { className: "tab-bar-top-line", style: { position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--glass-border) 50%,transparent)", pointerEvents: "none" } }), /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: `tab-btn ${view === "home" ? "active" : ""}`,
    onClick: () => {axisHapticTick();setView("home");},
    "aria-label": "Home",
    "aria-current": view === "home" ? "page" : undefined }, /*#__PURE__*/

  React.createElement("span", { className: "tab-btn-stack" }, /*#__PURE__*/
  React.createElement("span", { className: "nav-tab-indicator", "aria-hidden": true }), /*#__PURE__*/
  React.createElement("span", { className: "tab-icon-shell", "aria-hidden": true }, /*#__PURE__*/React.createElement(HomeIcon, null)), /*#__PURE__*/
  React.createElement("span", { className: "tab-btn-label" }, "Home")
  )

  ), /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: `tab-btn tab-btn--nav-bookmarks ${view === "favorites" ? "active" : ""}`,
    onClick: () => {axisHapticTick();setView("favorites");},
    "aria-label": "Bookmarks",
    "aria-current": view === "favorites" ? "page" : undefined }, /*#__PURE__*/

  React.createElement("span", { className: "tab-btn-stack" }, /*#__PURE__*/
  React.createElement("span", { className: "nav-tab-indicator", "aria-hidden": true }), /*#__PURE__*/
  React.createElement("span", { className: "tab-icon-shell", "aria-hidden": true }, /*#__PURE__*/React.createElement(BookmarkTabIcon, null)), /*#__PURE__*/
  React.createElement("span", { className: "tab-btn-label" }, "Bookmarks")
  )

  ), /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: `tab-btn ${view === "timer" ? "active" : ""}`,
    onClick: () => {axisHapticTick();setView("timer");},
    "aria-label": "Timer",
    "aria-current": view === "timer" ? "page" : undefined }, /*#__PURE__*/

  React.createElement("span", { className: "tab-btn-stack" }, /*#__PURE__*/
  React.createElement("span", { className: "nav-tab-indicator", "aria-hidden": true }), /*#__PURE__*/
  React.createElement("span", { className: "tab-icon-shell", "aria-hidden": true }, /*#__PURE__*/React.createElement(TimerIcon, null)), /*#__PURE__*/
  React.createElement("span", { className: "tab-btn-label" }, "Timer")
  )

  ), /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: `tab-btn ${view === "metrics" ? "active" : ""}`,
    onClick: () => {axisHapticTick();setView("metrics");},
    "aria-label": "Metrics",
    "aria-current": view === "metrics" ? "page" : undefined },

  React.createElement("span", { className: "tab-btn-stack" }, /*#__PURE__*/
  React.createElement("span", { className: "nav-tab-indicator", "aria-hidden": true }), /*#__PURE__*/
  React.createElement("span", { className: "tab-icon-shell", "aria-hidden": true }, /*#__PURE__*/React.createElement(MetricsIcon, null)), /*#__PURE__*/
  React.createElement("span", { className: "tab-btn-label" }, "Metrics")
  )

  ), /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: `tab-btn tab-btn--nav-system ${view === "system" ? "active" : ""}`,
    onClick: gotoSystem,
    "aria-label": "System",
    "aria-current": view === "system" ? "page" : undefined }, /*#__PURE__*/

  React.createElement("span", { className: "tab-btn-stack" }, /*#__PURE__*/
  React.createElement("span", { className: "nav-tab-indicator", "aria-hidden": true }), /*#__PURE__*/
  React.createElement("span", { className: "tab-icon-shell", "aria-hidden": true }, /*#__PURE__*/React.createElement(SystemMatrixTabIcon, null)), /*#__PURE__*/
  React.createElement("span", { className: "tab-btn-label" }, "System")
  )

  )
  );


  if (typeof document === "undefined" || !document.body) {
    return bar;
  }
  return ReactDOM.createPortal(bar, document.body);
}

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  GUIDED OVERLAY — mounts directly on document.body via ref
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  EXERCISE FIGURE — renders SVG illustration if available
// ─────────────────────────────────────────────────────────────
function ExerciseFigure({ id, size = 110, aspect = 160 / 120, className, style, fillContainer, viewBox, preserveAspectRatio }) {
  let svg = FIGURES[id];
  if (!svg) return null;
  if ((viewBox || preserveAspectRatio) && typeof svg === "string") {
    if (viewBox) svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`);
    const par = preserveAspectRatio;
    if (par) {
      if (/preserveAspectRatio=/.test(svg)) svg = svg.replace(/preserveAspectRatio="[^"]*"/, `preserveAspectRatio="${par}"`);
      else svg = svg.replace(/<svg\b/, `<svg preserveAspectRatio="${par}" `);
    } else if (!/preserveAspectRatio=/.test(svg)) {
      svg = svg.replace(/<svg\b/, '<svg preserveAspectRatio="xMidYMid meet" ');
    }
  }
  const sizeStyle = fillContainer ?
  { width: "100%", maxWidth: "100%", height: "auto", boxSizing: "border-box", flexShrink: 0 } :
  { width: size, height: Math.round(size * aspect), flexShrink: 0 };
  return (/*#__PURE__*/
    React.createElement("div", {
      className: className,
      style: { ...sizeStyle, ...(style || {}) },
      dangerouslySetInnerHTML: { __html: svg } }
    ));

}

// ─────────────────────────────────────────────────────────────
//  OVERLAY TIMER — fully inlined styles, no CSS class dependency
// ─────────────────────────────────────────────────────────────
let _audioCtx = null;
let _axisNativeBeepAudio = null;
let _axisNativeBeepUnlocked = false;
let _axisNativeMod = null;
let _axisNativeLoad = null;
let _axisNativeReady = null;

function axisNativeModuleUrl() {
  const cb =
    typeof window !== "undefined" && window.AXIS_BUILD
      ? `?cb=${window.AXIS_BUILD}`
      : "";
  return `./vendor/axis-native.mjs${cb}`;
}

let _axisWorkoutAppComponent = null;
let _axisWorkoutAppLoad = null;

function axisWorkoutAppModuleUrl() {
  const cb =
    typeof window !== "undefined" && window.AXIS_BUILD
      ? `?cb=${window.AXIS_BUILD}`
      : "";
  return `./components/WorkoutApp.js${cb}`;
}

function axisLoadWorkoutApp() {
  if (_axisWorkoutAppComponent) return Promise.resolve(_axisWorkoutAppComponent);
  if (_axisWorkoutAppLoad) return _axisWorkoutAppLoad;
  _axisWorkoutAppLoad = import(axisWorkoutAppModuleUrl())
    .then((mod) => {
      _axisWorkoutAppComponent = mod && mod.WorkoutApp;
      if (!_axisWorkoutAppComponent) throw new Error("WorkoutApp export missing");
      return _axisWorkoutAppComponent;
    })
    .catch((e) => {
      _axisWorkoutAppLoad = null;
      throw e;
    });
  return _axisWorkoutAppLoad;
}

function axisIsCapacitorNative() {
  try {
    const C = typeof window !== "undefined" && window.Capacitor;
    if (C && typeof C.isNativePlatform === "function" && C.isNativePlatform()) return true;
  } catch (_e) {}
  try {
    if (typeof window === "undefined" || !window.location) return false;
    const host = String(window.location.hostname || "").toLowerCase();
    const protocol = String(window.location.protocol || "");
    if (protocol === "capacitor:") return true;
    if (protocol === "https:" && (host === "localhost" || host === "127.0.0.1")) return true;
  } catch (_e) {}
  return false;
}

function axisNativeHideSplashFallback() {
  if (!axisIsCapacitorNative()) return;
  try {
    const plugins = typeof window !== "undefined" && window.Capacitor && window.Capacitor.Plugins;
    const splash = plugins && plugins.SplashScreen;
    if (splash && typeof splash.hide === "function") {
      splash.hide().catch(() => {});
    }
  } catch (_e) {}
}

function loadAxisNativeModule() {
  if (_axisNativeLoad) return _axisNativeLoad;
  if (!axisIsCapacitorNative()) {
    _axisNativeLoad = Promise.resolve(null);
    return _axisNativeLoad;
  }
  _axisNativeLoad = import(axisNativeModuleUrl())
    .then((mod) => {
      _axisNativeMod = mod;
      return mod;
    })
    .catch((e) => {
      console.warn("[AXIS] Capacitor native bridge failed to load", e);
      return null;
    });
  return _axisNativeLoad;
}

function axisEnsureNativeReady() {
  if (!axisIsCapacitorNative()) return Promise.resolve(null);
  if (_axisNativeReady) return _axisNativeReady;
  _axisNativeReady = loadAxisNativeModule()
    .then(async (m) => {
      if (m && typeof m.init === "function") await m.init();
      return m;
    })
    .catch(() => null);
  return _axisNativeReady;
}

function primeAudio() {
  try {
    if (!_audioCtx || _audioCtx.state === "closed") {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === "suspended") {
      _audioCtx.resume().catch(() => {});
    }
  } catch (e) {}
  axisUnlockNativeBeep();
}

function axisUnlockNativeBeep() {
  if (!axisIsCapacitorNative() && !axisIsNativeShell()) return;
  if (_axisNativeBeepUnlocked) return;
  try {
    if (!_axisNativeBeepAudio) {
      _axisNativeBeepAudio = new Audio();
      _axisNativeBeepAudio.preload = "auto";
    }
    _axisNativeBeepAudio.src = axisBeepWavDataUrl(440, 0.02, 0.001, "sine");
    _axisNativeBeepAudio.volume = 0.01;
    const p = _axisNativeBeepAudio.play();
    if (p && typeof p.then === "function") {
      p.then(() => { _axisNativeBeepUnlocked = true; }).catch(() => {});
    } else {
      _axisNativeBeepUnlocked = true;
    }
  } catch (_e) {}
}

function axisPrimeAudioOnFirstGesture() {
  if (typeof document === "undefined") return;
  const once = () => {
    primeAudio();
    document.removeEventListener("touchstart", once, true);
    document.removeEventListener("click", once, true);
  };
  document.addEventListener("touchstart", once, { capture: true, passive: true });
  document.addEventListener("click", once, { capture: true, passive: true });
}

function axisNativeShellInit() {
  if (!axisIsCapacitorNative()) return Promise.resolve();
  return loadAxisNativeModule()
    .then((m) => m && typeof m.init === "function" && m.init())
    .catch(() => {})
    .finally(() => axisNativeHideSplashFallback());
}

function axisNativeShareText(payload) {
  if (axisIsCapacitorNative()) {
    return loadAxisNativeModule()
      .then((m) => m && typeof m.shareText === "function" && m.shareText(payload))
      .catch(() => false);
  }
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    return navigator.share(payload).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

function axisGuidedShareSession({ trackLabel, listTotal, streak }) {
  const label = (trackLabel || "my AXIS session").trim();
  const streakBit = streak >= 2 ? ` · ${streak}-day streak` : "";
  const text = `I completed ${label} — ${listTotal} exercises${streakBit}.`;
  axisHapticTick();
  return axisNativeShareText({
    title: "AXIS",
    text,
    url: "https://axis-app-beryl.vercel.app",
  });
}

function axisNativeSetKeepAwake(enabled) {
  if (!axisIsCapacitorNative()) return Promise.resolve();
  return loadAxisNativeModule()
    .then((m) => m && typeof m.setKeepAwake === "function" && m.setKeepAwake(!!enabled))
    .catch(() => {});
}

const HAPTIC_LIGHT_TAP = 40;
const HAPTIC_MEDIUM = 80;
const HAPTIC_STRONG = 120;
const HAPTIC_DOUBLE_TAP = [50, 150, 50];
const HAPTIC_TRIPLE_TAP = [100, 100, 100];
const HAPTIC_SUCCESS = [80, 100, 120];

function triggerHaptic(pattern) {
  if (axisIsCapacitorNative()) {
    loadAxisNativeModule()
      .then((m) => m && typeof m.vibratePattern === "function" && m.vibratePattern(pattern))
      .catch(() => {});
    return;
  }
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

function axisHapticTick() {
  if (axisIsCapacitorNative()) {
    loadAxisNativeModule()
      .then((m) => m && typeof m.tick === "function" && m.tick())
      .catch(() => {});
    return;
  }
  try {
    const w = typeof window !== "undefined" ? window : null;
    if (w && w.webkit && w.webkit.messageHandlers && w.webkit.messageHandlers.axisHaptic && w.webkit.messageHandlers.axisHaptic.postMessage) {
      w.webkit.messageHandlers.axisHaptic.postMessage({ type: "tick" });
      return;
    }
    if (w && w.AXISNative && typeof w.AXISNative.haptic === "function") {
      w.AXISNative.haptic("tick");
      return;
    }
    triggerHaptic(HAPTIC_LIGHT_TAP);
  } catch (e) {}
}

function axisHapticSuccess() {
  if (axisIsCapacitorNative()) {
    loadAxisNativeModule()
      .then((m) => m && typeof m.success === "function" && m.success())
      .catch(() => {});
    return;
  }
  try {
    const w = typeof window !== "undefined" ? window : null;
    if (w && w.webkit && w.webkit.messageHandlers && w.webkit.messageHandlers.axisHaptic && w.webkit.messageHandlers.axisHaptic.postMessage) {
      w.webkit.messageHandlers.axisHaptic.postMessage({ type: "success" });
      return;
    }
    if (w && w.AXISNative && typeof w.AXISNative.haptic === "function") {
      w.AXISNative.haptic("success");
      return;
    }
    triggerHaptic(HAPTIC_SUCCESS);
  } catch (e) {}
}

function axisBeepWavDataUrl(freq, durationSec, peakGain, waveType) {
  const sampleRate = 22050;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSec));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  const amp = Math.min(32767, Math.floor(peakGain * 32767 * 4));
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * freq * t;
    let sample = 0;
    if (waveType === "triangle") sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else sample = Math.sin(phase);
    const fade = Math.min(1, 1 - t / Math.max(durationSec, 0.01));
    view.setInt16(44 + i * 2, sample * amp * fade, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(binary);
}

function axisBeepWavFallback(freq, durationSec, peakGain, waveType) {
  try {
    if (!_axisNativeBeepAudio) {
      _axisNativeBeepAudio = new Audio();
      _axisNativeBeepAudio.preload = "auto";
    }
    const audio = _axisNativeBeepAudio;
    audio.volume = 1;
    audio.src = axisBeepWavDataUrl(freq, durationSec, peakGain, waveType);
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (_e) {}
}

function beep(freq = 880, duration = 0.3, opts) {
  const type = opts && opts.type ? opts.type : "sine";
  const peakGain = opts && typeof opts.gain === "number" ? opts.gain : 0.25;
  if (axisIsCapacitorNative() || axisIsNativeShell()) {
    axisBeepWavFallback(freq, duration, peakGain, type);
    return;
  }
  try {
    if (!_audioCtx || _audioCtx.state !== "running") {
      primeAudio();
    }
    if (!_audioCtx || _audioCtx.state !== "running") {
      axisBeepWavFallback(freq, duration, peakGain, type);
      return;
    }
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.frequency.value = freq;o.type = type;
    g.gain.setValueAtTime(peakGain, _audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
    o.start(_audioCtx.currentTime);o.stop(_audioCtx.currentTime + duration);
  } catch (e) {
    axisBeepWavFallback(freq, duration, peakGain, type);
  }
}

/** Rest & Get Ready — once when the countdown starts. */
function axisGuidedRestStartCue() {
  primeAudio();
  beep(440, 0.22, { type: "sine", gain: 0.2 });
}

/** Rest & Get Ready — low dull tone + light tap on each of 3, 2, 1. */
function axisGuidedPrepCountdownCue() {
  primeAudio();
  beep(220, 0.14, { type: "triangle", gain: 0.16 });
  axisHapticTick();
}

/** Rest countdown finished → exercise (BEGIN) phase. */
function axisGuidedBeginCue() {
  primeAudio();
  beep(880, 0.28);
  triggerHaptic(HAPTIC_MEDIUM);
}

/** Exercise finished (timer or mark done). */
function axisGuidedExerciseCompleteCue() {
  primeAudio();
  beep(660, 0.4);
  axisHapticSuccess();
}

function GuidedOverlay({ theme, activePeriod, activeAll: activeAllProp,
  onExit, onToggle, onSkip, formatTime, trackLabel = "", trackDuration = "", nightMode = false, streak = 0, onSessionComplete, exerciseDurationSeconds = 45, activeTrackId = "", showFirstAxisSessionLine = false }) {

  const isNight = nightMode;
  const isDark = isNight || theme === "dark";
  const onExerciseDurationChange = typeof (arguments[0] && arguments[0].onExerciseDurationChange) === "function" ? arguments[0].onExerciseDurationChange : null;
  const period = axisResolveMoodPeriod(activePeriod);

  // AXIS Ultra: deep red canvas + #FF3B30, no circadian bleed
  const ct = isNight ?
  {
    bg: "#000000",
    accent: "#FF3B30",
    accentDim: "rgba(211,47,47,0.35)",
    accentGlow: "rgba(211,47,47,0.45)",
    textPrimary: "#FF3B30",
    orb1: "none", orb2: "none", orb3: "none"
  } :
  CIRCADIAN_THEMES[period][isDark ? "dark" : "light"];

  const A = ct.accent;
  // AXIS Ultra: primary vs dim red — no white
  const W = isNight ? "#FF3B30" : ct.textPrimary || (isDark ? "var(--axis-white)" : "#0f1020");
  const S = isNight ? "rgba(211, 47, 47, 0.82)" : isDark ? "rgba(232,228,223,0.60)" : ct.textPrimary ? ct.textPrimary + "cc" : "rgba(15,30,46,0.75)";
  const D = isNight ? "rgba(211, 47, 47, 0.62)" : isDark ? "rgba(232,228,223,0.35)" : ct.textPrimary ? ct.textPrimary + "88" : "rgba(15,30,46,0.50)";
  /** Guided Flow UI should inherit chosen mood accent (all non-night modes). */
  const gA = A;

  // derive card/button colors from the theme background
  const CARD_BG = isNight ? "#000000" : isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.50)";
  const CARD_BDR = isNight ? "#FF3B30" : isDark ? `${ct.accent}33` : `${ct.accent}44`;
  const BTN_BG = isNight ? "#000000" : isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.65)";
  const BTN_BDR = isNight ? "#FF3B30" : isDark ? `${ct.accent}55` : `${ct.accent}66`;

  // fade colors — AXIS Ultra uses pure black
  const periodFadeMap = {
    dawn: { dark: "rgba(15,7,0,", light: "rgba(255,232,200," },
    midday: { dark: "rgba(0,8,4,", light: "rgba(224,255,248," },
    prime: { dark: "rgba(0,6,14,", light: "rgba(216,238,255," },
    rest: { dark: "rgba(3,0,8,", light: "rgba(232,220,255," }
  };
  const pf = isNight ? { dark: "rgba(20,0,0,", light: "rgba(20,0,0," } : periodFadeMap[period] || periodFadeMap.rest;
  const pfKey = isDark ? "dark" : "light";
  const fadeDark = `${pf[pfKey]}0)`;
  const fadeSolid = `${pf[pfKey]}0.97)`;
  const FADE_BOT = `linear-gradient(to bottom,${fadeDark} 0%,${fadeSolid} 28px)`;
  const BAR_BOT = fadeSolid;
  const CUE_COLOR = W;
  const NAME_DIM = D;
  const HAIRLINE = isNight ? "#FF3B30" : isDark ? "rgba(255,255,255,0.07)" : `${ct.accent}22`;

  // Glass card & control bar — light mode: crisp, soft tinted shadows (no muddy black)
  const GLASS_BG = isNight ? "#000000" :
  isDark ? "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)" :
  "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%)";
  const GLASS_BDR = isNight ? "1px solid #FF3B30" :
  isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(200,220,240,0.65)";
  const GLASS_SHAD = isNight ? "0 4px 20px rgba(211,47,47,0.22)" :
  isDark ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.12)" :
  "inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(20,50,90,0.06)";
  const BAR_BG = isNight ? "#000000" :
  isDark ? "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)" :
  "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)";
  const BAR_BDR = isNight ? "1px solid #FF3B30" :
  isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(200,220,240,0.70)";
  const BAR_SHAD = isNight ? "0 4px 24px rgba(211,47,47,0.25)" :
  isDark ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 20px rgba(0,0,0,0.15)" :
  "inset 0 1px 0 rgba(255,255,255,0.75), 0 2px 14px rgba(20,50,90,0.05)";
  const DIVIDER = isNight ? "1px solid #FF3B30" :
  isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)";
  const ROW_DIV = isNight ? "1px solid #FF3B30" :
  isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const SESS_BG = isNight ? "#000000" :
  isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)";
  const BACK_DIM = isNight ? "#FF3B30" : isDark ? "rgba(255,255,255,0.22)" : "rgba(15,30,46,0.22)";
  const NAME_SHAD = "none";

  // Guided uses the same exercise list as Session LIST/Guided tab: activeAllProp = filteredAll from getAll(track).
  // Exercise copy: position/next/then/tip on each exercise in TRACKS (fallback: derive from start + steps). Guided UI uses axisResolveInstructionFields.
  const listRef = useRef(activeAllProp);
  const list = listRef.current;
  const listTotal = list.length;
  const filteredCount = listTotal;
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(() => storageGet(AXIS_GUIDED_DETAILED_INSTRUCTIONS_KEY, true));
  const showDetailedInstructionsRef = useRef(showDetailedInstructions);
  useEffect(() => {showDetailedInstructionsRef.current = showDetailedInstructions;}, [showDetailedInstructions]);
  const [refresherOpen, setRefresherOpen] = useState(false);
  const pausedBeforeRefresherRef = useRef(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const leaveConfirmOpenRef = useRef(false);
  useEffect(() => {leaveConfirmOpenRef.current = leaveConfirmOpen;}, [leaveConfirmOpen]);

  // Own fi and resting state — self-contained continuous flow
  const [fi, setFi] = useState(0);
  const [phase, setPhase] = useState("intro"); // "intro" | "instruction" | "rest" | "exercise" | "closing"
  const [guidedFirstSessionLine, setGuidedFirstSessionLine] = useState(false);
  useEffect(() => {
    if (phase !== "closing") return;
    const k = axisCelebrationScopedKey("axis_first_session_complete");
    if (!storageGet(k, false)) {
      storageSet(k, true);
      setGuidedFirstSessionLine(true);
    }
  }, [phase]);
  const showGuidedFirstSessionLine = showFirstAxisSessionLine || guidedFirstSessionLine;
  const GETREADY_SECONDS = 15;
  const [paused, setPaused] = useState(false);
  const wakeLockRef = useRef(null);
  const titleRef = useRef(null);
  const guidedDialogRef = useRef(null);
  const guidedCloseBtnRef = useRef(null);
  const guidedFocusReturnRef = useRef(null);
  const guidedMiddleScrollRef = useRef(null);
  const cur = list.length > 0 ? list[Math.min(fi, list.length - 1)] : null;
  const guidedSafetyFlags = cur ? axisResolveExerciseSafetyFlags(cur) : { nerve: false, caution: false };
  const guidedShowRiskInlineNote = !!(guidedSafetyFlags.nerve || guidedSafetyFlags.caution);
  const guidedRiskNoteKind = guidedSafetyFlags.nerve ? "nerve" : "caution";
  const next = list[fi + 1] || null;
  const headerPoseCounterNum = fi + 1;
  const guidedMoveSeconds = typeof exerciseDurationSeconds === "number" && exerciseDurationSeconds > 0 ? exerciseDurationSeconds : 45;
  const guidedExerciseRemainingRef = useRef(guidedMoveSeconds);
  const guidedExerciseSnapshotsRef = useRef({});
  const guidedPrepIncludedInstructionRef = useRef({});
  const [guidedExerciseResumeSeconds, setGuidedExerciseResumeSeconds] = useState(null);
  const handleGuidedRemainingTick = useCallback((n) => {
    guidedExerciseRemainingRef.current = n;
  }, []);
  const guidedPack = cur ? axisResolveInstructionFields(cur, cur.__axisSide || axisInstructionSideFromId(cur.id)) : null;
  const guidedInstructionTiersFiltered = axisInstructionTiersFromPack(guidedPack);
  const guidedStepTotal = guidedInstructionTiersFiltered.length;
  const guidedAnimKey = cur ? resolveExerciseAnimationKey(activeTrackId, cur.id, cur.name) : null;
  const guidedAnimMode = exerciseAnimationModeFromTheme(theme, isNight);
  const goToPrepPhaseAt = (listIndex) => {
    const incl = !!showDetailedInstructionsRef.current;
    guidedPrepIncludedInstructionRef.current[listIndex] = incl;
    setPhase(incl ? "instruction" : "rest");
  };
  const handleRestTimerComplete = () => {
    axisGuidedBeginCue();
    const saved = guidedExerciseSnapshotsRef.current[fi];
    const canResume = typeof saved === "number" && saved > 0 && saved < guidedMoveSeconds;
    setGuidedExerciseResumeSeconds(canResume ? saved : null);
    setPhase("exercise");
  };
  const [refresherClosing, setRefresherClosing] = useState(false);
  const refresherClosingRef = useRef(false);
  const refresherCloseDoneRef = useRef(false);
  const GUIDED_REFRESHER_ANIM_MS = 250;
  const finishGuidedRefresherClose = useCallback(() => {
    setRefresherOpen(false);
    setRefresherClosing(false);
    setPaused(pausedBeforeRefresherRef.current);
  }, []);
  const openGuidedRefresher = () => {
    if (phase !== "exercise" && phase !== "rest") return;
    if (guidedStepTotal <= 0) return;
    pausedBeforeRefresherRef.current = paused;
    setPaused(true);
    setRefresherClosing(false);
    setRefresherOpen(true);
  };
  const closeGuidedRefresher = useCallback(() => {
    if (!refresherOpenRef.current || refresherClosingRef.current) return;
    setRefresherClosing(true);
  }, []);
  useEffect(() => {refresherClosingRef.current = refresherClosing;}, [refresherClosing]);
  useEffect(() => {
    if (!refresherClosing) return;
    refresherCloseDoneRef.current = false;
    const t = setTimeout(() => {
      if (refresherCloseDoneRef.current) return;
      refresherCloseDoneRef.current = true;
      finishGuidedRefresherClose();
    }, GUIDED_REFRESHER_ANIM_MS + 50);
    return () => clearTimeout(t);
  }, [refresherClosing, finishGuidedRefresherClose]);
  const onGuidedRefresherSheetAnimationEnd = (e) => {
    if (!refresherClosingRef.current || e.target !== e.currentTarget) return;
    const anim = e.animationName || "";
    if (anim !== "guidedRefresherSlideDown" && !anim.endsWith("guidedRefresherSlideDown")) return;
    if (refresherCloseDoneRef.current) return;
    refresherCloseDoneRef.current = true;
    finishGuidedRefresherClose();
  };
  const guidedRefresherTouchY0 = useRef(null);
  const onGuidedRefresherHandleStart = (e) => {
    if (e.touches && e.touches[0]) guidedRefresherTouchY0.current = e.touches[0].clientY;
  };
  const onGuidedRefresherHandleEnd = (e) => {
    if (guidedRefresherTouchY0.current == null || !e.changedTouches || !e.changedTouches[0]) return;
    const dy = e.changedTouches[0].clientY - guidedRefresherTouchY0.current;
    guidedRefresherTouchY0.current = null;
    if (dy > 48) closeGuidedRefresher();
  };
  const refresherOpenRef = useRef(false);
  useEffect(() => {refresherOpenRef.current = refresherOpen;}, [refresherOpen]);

  const exitGuidedIfConfirmed = useCallback(() => {
    if (phase === "intro" || phase === "closing") {
      onExit();
      return;
    }
    setLeaveConfirmOpen(true);
  }, [onExit, phase]);

  useEffect(() => {
    guidedFocusReturnRef.current = document.activeElement;
    let rafInner = 0;
    const rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => {
        try {guidedCloseBtnRef.current && guidedCloseBtnRef.current.focus();} catch (e) {}
      });
    });
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (leaveConfirmOpenRef.current) {
          setLeaveConfirmOpen(false);
          return;
        }
        if (refresherOpenRef.current) {
          closeGuidedRefresher();
          return;
        }
        exitGuidedIfConfirmed();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      document.removeEventListener("keydown", onKeyDown, true);
      const el = guidedFocusReturnRef.current;
      if (el && typeof el.focus === "function") {
        try {el.focus();} catch (err) {}
      }
    };
  }, [exitGuidedIfConfirmed, closeGuidedRefresher]);
  const [guidedTransitioning, setGuidedTransitioning] = useState(false);
  useEffect(() => {
    if (phase === "exercise" && guidedExerciseResumeSeconds == null) {
      guidedExerciseRemainingRef.current = guidedMoveSeconds;
    }
  }, [fi, phase, guidedMoveSeconds, guidedExerciseResumeSeconds]);
  const guidedFilledText = isNight ? "#000000" : ct.accentBtnText || "#0a0a0a";
  const guidedShellBg = isNight ? "#000000" : isDark ? "rgba(6, 10, 15, 0.94)" : axisColorFromCircadianBg(ct.bg);
  const guidedMiddleFadeGradient = isNight || isDark ?
  `linear-gradient(to top, ${guidedShellBg} 0%, rgba(0,0,0,0) 100%)` :
  `linear-gradient(to top, ${guidedShellBg} 0%, transparent 100%)`;
  const guidedLabelCaps = isNight ? "rgba(255,255,255,0.42)" : isDark ? "rgba(255,255,255,0.35)" : "rgba(15,30,46,0.35)";
  const guidedExerciseTitleColor = isDark ? "#ffffff" : "#0f1020";
  const guidedEyebrowMuted = isNight ? "rgba(255,255,255,0.38)" : isDark ? "rgba(255,255,255,0.3)" : "rgba(15,30,46,0.35)";
  const guidedTertiaryMuted = isNight ? "rgba(255,255,255,0.36)" : isDark ? "rgba(255,255,255,0.3)" : "rgba(15,30,46,0.32)";
  const guidedMonoUi = '"DM Mono", var(--font-data), ui-monospace, monospace';
  const guidedSansDisplay = '"DM Sans", var(--font-ui), system-ui, sans-serif';
  const guidedSecBtnBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,30,46,0.06)";
  const guidedSecBtnBdr = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(15,30,46,0.1)";
  const guidedSecBtnInk = isDark ? "rgba(255,255,255,0.6)" : "rgba(15,30,46,0.55)";
  const guidedCloseShellBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,30,46,0.06)";
  const guidedCloseShellBdr = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,30,46,0.1)";
  const guidedCloseIcon = isDark ? "rgba(255,255,255,0.5)" : "rgba(15,30,46,0.45)";
  const guidedMetaLine = isDark ? "rgba(255,255,255,0.4)" : "rgba(15,30,46,0.45)";
  const guidedPillBdr = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,30,46,0.12)";
  const guidedPillInk = isDark ? "rgba(255,255,255,0.5)" : "rgba(15,30,46,0.5)";
  const guidedBodyText = isNight ? "#FF3B30" : isDark ? "#E8E8E8" : "#121418";
  const guidedIntroInstructionBody = isDark ? "#ffffff" : "#252525";
  const guidedMoveOpacity = 1;

  // GUIDED phase flags
  const isExercisePhase = phase === "exercise";

  // Disable body overflow so position:fixed is never trapped
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // Keep screen on during guided flow (Capacitor KeepAwake; web Wake Lock fallback)
  useEffect(() => {
    const releaseWebWakeLock = () => {
      try {wakeLockRef.current && wakeLockRef.current.release();wakeLockRef.current = null;} catch (e) {}
    };
    if (phase === "intro") {
      axisNativeSetKeepAwake(false);
      releaseWebWakeLock();
      return;
    }
    if (phase === "closing") {
      axisNativeSetKeepAwake(false);
      releaseWebWakeLock();
      return;
    }
    axisNativeSetKeepAwake(true);
    if (!axisIsCapacitorNative() && navigator.wakeLock && typeof navigator.wakeLock.request === "function") {
      navigator.wakeLock.request("screen").then((lock) => {wakeLockRef.current = lock;}).catch(() => {});
    }
    return () => {
      axisNativeSetKeepAwake(false);
      releaseWebWakeLock();
    };
  }, [phase]);

  // Pause timers when the native app backgrounds (user switches apps / locks phone)
  useEffect(() => {
    const onBackground = () => {
      if (phase === "intro" || phase === "closing") return;
      setPaused(true);
    };
    window.addEventListener("axis-app-background", onBackground);
    return () => window.removeEventListener("axis-app-background", onBackground);
  }, [phase]);

  useEffect(() => {
    if (!titleRef.current) return;
    const el = titleRef.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(4px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.18s ease-out, transform 0.18s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [fi]);
  useEffect(() => {
    setRefresherOpen(false);
    setRefresherClosing(false);
    setLeaveConfirmOpen(false);
    setPaused(false);
    const middle = guidedMiddleScrollRef.current;
    if (middle && typeof middle.scrollTo === "function") {
      try {middle.scrollTo({ top: 0, behavior: "auto" });} catch (e) {}
    }
    const revealId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGuidedTransitioning(false);
      });
    });
    return () => cancelAnimationFrame(revealId);
  }, [fi, phase, cur && cur.id]);

  // Cat/Cow carousel is user-driven (no auto-swap).

  const snapshotGuidedExerciseProgress = () => {
    if (phase === "exercise") {
      guidedExerciseSnapshotsRef.current[fi] = guidedExerciseRemainingRef.current;
    }
  };

  const goPrevExercise = () => {
    if (fi <= 0) return;
    snapshotGuidedExerciseProgress();
    const prevIdx = fi - 1;
    const saved = guidedExerciseSnapshotsRef.current[prevIdx];
    const canResume = typeof saved === "number" && saved > 0 && saved < guidedMoveSeconds;
    setPaused(false);
    setGuidedTransitioning(true);
    setFi(prevIdx);
    if (canResume) {
      setGuidedExerciseResumeSeconds(saved);
      setPhase("exercise");
    } else {
      setGuidedExerciseResumeSeconds(null);
      goToPrepPhaseAt(prevIdx);
    }
  };

  const completeCurrent = () => {
    delete guidedExerciseSnapshotsRef.current[fi];
    setGuidedExerciseResumeSeconds(null);
    axisGuidedExerciseCompleteCue();
    onToggle(cur.id);
    if (fi >= list.length - 1) {
      setPhase("closing");
      if (onSessionComplete) onSessionComplete();
      return;
    }
    setGuidedTransitioning(true);
    setPaused(false);
    const nextFi = Math.min(fi + 1, list.length - 1);
    setFi(nextFi);
    goToPrepPhaseAt(nextFi);
  };

  const handleTimerDone = () => {
    completeCurrent();
  };

  const handleMarkDone = () => {
    completeCurrent();
  };

  const handleSkip = () => {
    onSkip(cur.id);
    beep(440, 0.2);
    setGuidedExerciseResumeSeconds(null);
    if (fi < list.length - 1) {
      snapshotGuidedExerciseProgress();
      setPaused(false);
      setGuidedTransitioning(true);
      const nextFi = fi + 1;
      setFi(nextFi);
      goToPrepPhaseAt(nextFi);
    }
  };

  const handleNext = () => {
    beep(440, 0.2);
    setGuidedExerciseResumeSeconds(null);
    if (fi < list.length - 1) {
      snapshotGuidedExerciseProgress();
      setPaused(false);
      setGuidedTransitioning(true);
      const nextFi = fi + 1;
      setFi(nextFi);
      goToPrepPhaseAt(nextFi);
    } else {
      completeCurrent();
    }
  };

  const handlePrev = () => {
    if (guidedTransitioning) return;
    if (phase === "exercise") {
      snapshotGuidedExerciseProgress();
      setGuidedExerciseResumeSeconds(null);
      setPaused(false);
      setGuidedTransitioning(true);
      setPhase("rest");
      return;
    }
    if (phase === "rest") {
      const recorded = guidedPrepIncludedInstructionRef.current[fi];
      const hadInstructionStep = recorded === undefined ? !!showDetailedInstructionsRef.current : !!recorded;
      if (hadInstructionStep) {
        setPaused(false);
        setGuidedTransitioning(true);
        setPhase("instruction");
        return;
      }
      goPrevExercise();
      return;
    }
    if (phase === "instruction") {
      goPrevExercise();
      return;
    }
  };

  const guidedTimerAccent = isNight ? A : "var(--mood-color)";
  const guidedTimerTrack = isNight ? "rgba(255, 59, 48, 0.22)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(15,30,46,0.08)";
  const guidedExerciseName = (((cur && cur.name) || "").replace(/-/g, " ")).trim().toLowerCase();
  const guidedNeedsMidpointHaptic = [
  "dead bug",
  "bird dog",
  "figure four",
  "supine hamstring stretch",
  "reclined spinal twist",
  "neck half-circles"].
  some((name) => guidedExerciseName === name);
  const guidedPhaseChipLabel = phase === "instruction" ? "INSTRUCTIONS" : phase === "rest" ? "REST & GET READY" : "BEGIN";
  const guidedPrepRecord0 = guidedPrepIncludedInstructionRef.current[0];
  const guidedPrepHadInstr0 = guidedPrepRecord0 === undefined ? showDetailedInstructions : !!guidedPrepRecord0;
  const guidedPrevDisabled = guidedTransitioning || (phase === "instruction" && fi === 0) || (phase === "rest" && fi === 0 && !guidedPrepHadInstr0);
  const guidedPrevFooterButton = () => /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: guidedPrevDisabled,
    "aria-disabled": guidedPrevDisabled ? "true" : "false",
    onClick: () => {if (guidedPrevDisabled) return;triggerHaptic(HAPTIC_LIGHT_TAP);handlePrev();},
    style: {
      flex: 1,
      minWidth: 0,
      minHeight: 52,
      height: 52,
      borderRadius: 12,
      background: guidedSecBtnBg,
      border: guidedSecBtnBdr,
      color: guidedSecBtnInk,
      fontFamily: guidedSansDisplay,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: guidedPrevDisabled ? "default" : "pointer",
      opacity: guidedPrevDisabled ? 0.38 : 1,
      WebkitTextFillColor: guidedSecBtnInk
    }
  }, "\u2190 PREV");
  const guidedPhaseBody = (phase === "instruction" || phase === "rest" || phase === "exercise") && cur ? /*#__PURE__*/React.createElement("div", {
    className: "guided-phase-body",
    style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative", zIndex: 2, overflow: "hidden" }
  }, [
  /*#__PURE__*/React.createElement("div", { key: "header", style: {
      flexShrink: 0,
      padding: "8px 16px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10
    } }, /*#__PURE__*/
  React.createElement("div", { style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 24,
      width: "100%"
    } }, /*#__PURE__*/
  React.createElement("div", { key: `${phase}-chip`, style: {
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: guidedLabelCaps,
      fontFamily: guidedMonoUi,
      lineHeight: 1,
      animation: "none"
    } }, guidedPhaseChipLabel)), /*#__PURE__*/
  React.createElement("div", {
    ref: titleRef,
    style: {
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.08,
      textTransform: "none",
      color: guidedExerciseTitleColor,
      textAlign: "center",
      fontFamily: guidedSansDisplay,
      minHeight: 40,
      width: "100%",
      boxSizing: "border-box"
    }
  }, ((cur && cur.name) || "").replace(/-/g, " ")),
  guidedPack && guidedPack.sideLabel ? /*#__PURE__*/React.createElement("div", { style: { marginTop: 6, fontSize: 12, textAlign: "center", width: "100%", alignSelf: "center", color: isNight ? "rgba(255,59,48,0.72)" : isDark ? "rgba(232,228,223,0.40)" : "rgba(15,30,46,0.50)" } }, guidedPack.sideLabel) : null,
  phase === "rest" ? /*#__PURE__*/React.createElement(GuidedRestTimer, {
    key: `rest-${fi}-${(cur && cur.id)}`,
    seconds: GETREADY_SECONDS,
    accent: guidedTimerAccent,
    trackColor: guidedTimerTrack,
    hidden: guidedTransitioning,
    paused: paused,
    onComplete: handleRestTimerComplete }) : null,
  phase === "exercise" ? /*#__PURE__*/React.createElement(GuidedActiveTimer, {
    key: `active-${(cur && cur.id)}-${fi}`,
    seconds: guidedMoveSeconds,
    accent: guidedTimerAccent,
    trackColor: guidedTimerTrack,
    hidden: guidedTransitioning,
    paused: paused,
    hapticMidpoint: guidedNeedsMidpointHaptic,
    initialRemainingSeconds: guidedExerciseResumeSeconds != null ? guidedExerciseResumeSeconds : undefined,
    onRemainingSecondsChange: handleGuidedRemainingTick,
    onComplete: handleTimerDone }) : null,
  (phase === "rest" || phase === "exercise") && guidedStepTotal > 0 ? /*#__PURE__*/React.createElement("div", { style: { width: "100%", maxWidth: 320, alignSelf: "center", paddingTop: 14, paddingBottom: 2, display: "flex", justifyContent: "center" } }, /*#__PURE__*/
  React.createElement("button", {
    type: "button",
    className: "guided-refresher-btn",
    onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);openGuidedRefresher();},
    style: {
      width: "auto",
      maxWidth: 220,
      minHeight: 44,
      height: 44,
      padding: "0 22px",
      borderRadius: 10,
      background: "transparent",
      border: isDark ? "1px dashed rgba(255,255,255,0.18)" : "1px dashed rgba(15,30,46,0.22)",
      color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,30,46,0.35)",
      fontFamily: guidedMonoUi,
      fontSize: "11px",
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent",
      opacity: 0.92
    }
  }, "INSTRUCTIONS")) : null),
  /*#__PURE__*/React.createElement("div", { key: "middle", style: { position: "relative", flex: "1 1 0%", minHeight: 0, padding: "0 20px" } }, /*#__PURE__*/
  React.createElement("div", {
    ref: guidedMiddleScrollRef,
    style: {
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      padding: "4px 0 16px",
      scrollbarWidth: "none",
      msOverflowStyle: "none"
    }
  }, /*#__PURE__*/React.createElement(React.Fragment, null,
  (phase === "instruction" || phase === "exercise") && cur ? /*#__PURE__*/React.createElement(AxisExerciseSafetyCallouts, { key: `g-safe-${fi}-${cur.id}`, exercise: cur, ultraNight: isNight, layout: "overlay" }) : null,
  phase === "instruction" && guidedStepTotal > 0 && guidedShowRiskInlineNote ? /*#__PURE__*/React.createElement(AxisExerciseSafetyInlineNote, { variant: "guided", riskKind: guidedRiskNoteKind }) : null,
  phase === "instruction" && guidedStepTotal > 0 ? /*#__PURE__*/React.createElement(ExerciseCarousel, {
    key: `g-carousel-${fi}-${(cur && cur.id)}`,
    tiers: guidedInstructionTiersFiltered,
    frameSvgHtml: instructionFrameArrayForCarousel(guidedAnimKey),
    animationKey: guidedAnimKey,
    size: "large",
    graphicMode: guidedAnimMode,
    theme: theme,
    ultraNight: isNight,
    bodyColorOverride: guidedBodyText,
    moveOpacity: guidedMoveOpacity,
    trackId: activeTrackId,
    allowBaselineMediaExpand: true,
    guidedFlowFrame: true,
    loopVideoSrc: cur ? axisResolveExerciseLoopVideoSrc(activeTrackId, cur) : "",
    fallbackDemoVideo: cur && cur.demoVideo ? cur.demoVideo : "",
    loopVideoPoster: cur && cur.axisLoopVideoPoster ? String(cur.axisLoopVideoPoster) : ""
  }) : null,
  phase === "rest" ? /*#__PURE__*/React.createElement("div", { style: { fontSize: "var(--text-xs)", color: S, textAlign: "center", lineHeight: 1.5, padding: "8px 0 0" } }, "Next exercise starts automatically after the countdown.") : null)), /*#__PURE__*/
  React.createElement("div", { "aria-hidden": true, style: {
      position: "absolute",
      top: 0,
      left: 20,
      right: 20,
      height: 0,
      pointerEvents: "none",
      background: "none",
      display: "none"
    } }), /*#__PURE__*/
  React.createElement("div", { "aria-hidden": true, className: "guided-phase-body__scroll-fade", style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 26,
      pointerEvents: "none",
      background: guidedMiddleFadeGradient
    } })),
  /*#__PURE__*/React.createElement("div", { key: "footer", style: {
      flexShrink: 0,
      position: "relative",
      minHeight: 104,
      marginLeft: 20,
      marginRight: 20,
      marginBottom: `max(22px, env(safe-area-inset-bottom, 18px))`
    } }, [
  /*#__PURE__*/React.createElement("div", { key: "rest-actions", style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      display: "flex",
      gap: 8,
      flexWrap: "nowrap",
      alignItems: "stretch",
      minHeight: 52,
      opacity: phase === "rest" && cur && !guidedTransitioning ? 1 : 0,
      pointerEvents: phase === "rest" && cur && !guidedTransitioning ? "auto" : "none"
    } }, /*#__PURE__*/guidedPrevFooterButton(), /*#__PURE__*/React.createElement("button", { type: "button", onClick: () => {handleRestTimerComplete();}, style: {
      flex: 2,
      minWidth: 0,
      minHeight: 52,
      height: 52,
      borderRadius: 12,
      background: guidedSecBtnBg,
      border: guidedSecBtnBdr,
      color: guidedSecBtnInk,
      fontFamily: guidedSansDisplay,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      WebkitTextFillColor: guidedSecBtnInk,
      boxShadow: "none"
    } }, "START NOW")),
  /*#__PURE__*/React.createElement("div", { key: "exercise-actions", style: { position: "absolute", top: 0, left: 0, right: 0, display: "flex", gap: 8, flexWrap: "nowrap", minHeight: 52, opacity: phase === "exercise" && cur && !guidedTransitioning ? 1 : 0, pointerEvents: phase === "exercise" && cur && !guidedTransitioning ? "auto" : "none" } }, /*#__PURE__*/
  guidedPrevFooterButton(), /*#__PURE__*/
  React.createElement("button", { type: "button", onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);setPaused((p) => !p);}, style: {
      flex: 1,
      minWidth: 0,
      minHeight: 52,
      height: 52,
      borderRadius: 12,
      background: guidedSecBtnBg,
      border: guidedSecBtnBdr,
      color: guidedSecBtnInk,
      fontFamily: guidedSansDisplay,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      WebkitTextFillColor: guidedSecBtnInk
    } }, paused ? "RESUME" : "PAUSE"), /*#__PURE__*/
  React.createElement("button", { type: "button", className: isNight ? "guided-cta-fill" : undefined, onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);handleNext();}, style: {
      flex: 1,
      minWidth: 0,
      minHeight: 52,
      height: 52,
      borderRadius: 12,
      background: isNight ? A : "var(--mood-color)",
      border: nightMode ? "1px solid #FF3B30" : "none",
      color: isNight ? guidedFilledText : "var(--accent-btn-text)",
      WebkitTextFillColor: isNight ? guidedFilledText : "var(--accent-btn-text)",
      fontFamily: guidedSansDisplay,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "none"
    } }, "NEXT \u2192")),
  /*#__PURE__*/React.createElement("div", { key: "instruction-actions", style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      display: "flex",
      gap: 8,
      flexWrap: "nowrap",
      alignItems: "stretch",
      minHeight: 52,
      opacity: phase === "instruction" ? 1 : 0,
      pointerEvents: phase === "instruction" ? "auto" : "none"
    } }, /*#__PURE__*/guidedPrevFooterButton(), /*#__PURE__*/React.createElement("button", { type: "button", className: isNight ? "guided-cta-fill" : undefined, onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);setPhase("rest");}, style: {
      flex: 2,
      minWidth: 0,
      minHeight: 52,
      height: 52,
      borderRadius: 12,
      background: isNight ? A : "var(--mood-color)",
      border: nightMode ? "1px solid #FF3B30" : "none",
      color: isNight ? guidedFilledText : "var(--accent-btn-text)",
      WebkitTextFillColor: isNight ? guidedFilledText : "var(--accent-btn-text)",
      fontFamily: guidedSansDisplay,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "none"
    } }, "START EXERCISE")),
  /*#__PURE__*/React.createElement("div", { key: "skip", style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      minHeight: 22,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingLeft: 2,
      paddingRight: 2,
      boxSizing: "border-box"
    } }, /*#__PURE__*/
  React.createElement("button", { type: "button", onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);handleSkip();}, style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "12px 0",
      color: guidedTertiaryMuted,
      fontFamily: guidedMonoUi,
      fontSize: "11px",
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      opacity: 1,
      flexShrink: 0,
      whiteSpace: "nowrap",
      textAlign: "center",
      WebkitTextFillColor: guidedTertiaryMuted
    } }, "SKIP EXERCISE"))])]) : null;

  // No exercises: show message and exit (avoids cur.id / cur.name access on undefined)
  if (listTotal === 0 || !cur) {
    return (/*#__PURE__*/
      React.createElement("div", { ref: guidedDialogRef, className: "guided-overlay", "data-theme": theme, "data-night": isNight ? "true" : "false", role: "dialog", "aria-modal": "true", "aria-label": "Guided session", style: {
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
          display: "flex", flexDirection: "column",
          fontFamily: "var(--font-ui)", color: W, WebkitFontSmoothing: "antialiased",
          overflow: "hidden", alignItems: "center", justifyContent: "center", padding: 48
        } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: 12, color: W } }, "No exercises in this flow"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "var(--text-sm)", color: S, marginBottom: 24 } }, "Add exercises or clear filters and try again."), /*#__PURE__*/
      React.createElement("button", { ref: guidedCloseBtnRef, type: "button", className: isNight ? "guided-cta-fill" : undefined, onClick: onExit, "aria-label": "Close", style: {
          padding: "14px 40px", borderRadius: 12, cursor: "pointer",
          background: isNight ? A : "var(--mood-color)", border: nightMode ? "1px solid #FF3B30" : "none", color: guidedFilledText,
          WebkitTextFillColor: guidedFilledText,
          fontFamily: guidedMonoUi, fontSize: "var(--text-sm)", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "none"
        } }, "Exit")
      ));

  }

  return (/*#__PURE__*/
    React.createElement("div", { ref: guidedDialogRef, className: "guided-overlay", "data-theme": theme, "data-night": isNight ? "true" : "false", "data-phase": phase, "data-refresher": refresherOpen ? "open" : "closed", role: "dialog", "aria-modal": "true", "aria-label": "Guided session", style: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
        display: "flex", flexDirection: "column",
        fontFamily: "var(--font-ui)", color: W, WebkitFontSmoothing: "antialiased",
        overflow: "hidden"
      } }, /*#__PURE__*/
    phase === "closing" && /*#__PURE__*/React.createElement("div", { className: "guided-complete-atmosphere", "aria-hidden": true },
    !isNight && ct.orb1 && ct.orb1 !== "none" ? /*#__PURE__*/React.createElement("div", {
      className: "guided-complete-atmosphere__orbs",
      style: {
        background: `${axisOrbGradientDoubleOpacity(ct.orb1)}, ${axisOrbGradientDoubleOpacity(ct.orb2)}, ${axisOrbGradientDoubleOpacity(ct.orb3)}`,
      }
    }) : null,
    isNight ? /*#__PURE__*/React.createElement("div", { className: "guided-complete-atmosphere__night-base", "aria-hidden": true }) : null,
    /*#__PURE__*/React.createElement("div", { className: "guided-complete-atmosphere__bloom", "aria-hidden": true })
    ),






    React.createElement("div", { className: "app-hdr-topbar app-hdr-topbar--spread" }, /*#__PURE__*/
    React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
        minWidth: 0
      } }, /*#__PURE__*/
    React.createElement("button", { ref: guidedCloseBtnRef, type: "button", onClick: exitGuidedIfConfirmed, "aria-label": "Leave guided session", style: {
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        border: `1px solid ${isNight ? "#FF3B30" : guidedCloseShellBdr}`,
        background: isNight ? "rgba(255,255,255,0.07)" : guidedCloseShellBg,
        cursor: "pointer",
        color: phase === "closing" ? "var(--text-secondary)" : isNight ? "rgba(255,255,255,0.5)" : guidedCloseIcon,
        WebkitTextFillColor: phase === "closing" ? "var(--text-secondary)" : undefined,
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent"
      } }, /*#__PURE__*/
    React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/
    React.createElement("path", { d: "M18 6L6 18M6 6l12 12" }))
    ), /*#__PURE__*/
    null),
    phase !== "intro" && phase !== "closing" && listTotal > 0 && (phase === "instruction" || phase === "rest" || phase === "exercise")
    ? React.createElement("div", { style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 0,
        padding: "0 8px"
      } }, /*#__PURE__*/
    React.createElement("span", { style: {
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: guidedLabelCaps,
        fontFamily: guidedMonoUi,
        lineHeight: 1.25,
        flexShrink: 0
      } }, "UP NEXT:"), /*#__PURE__*/
    React.createElement("span", { style: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "none",
        color: guidedExerciseTitleColor,
        fontFamily: guidedMonoUi,
        lineHeight: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
        marginLeft: 5
      } }, next ? `${(next.name || "").replace(/-/g, " ")}` : " —")
    )
    : React.createElement("div", { style: { flex: 1, minWidth: 0 } }),
    phase !== "intro" && phase !== "closing" && listTotal > 0
    ? React.createElement("div", { style: {
        height: 28,
        minWidth: 44,
        padding: "0 10px",
        borderRadius: 999,
        border: `1px solid ${isNight ? "#FF3B30" : guidedPillBdr}`,
        background: "transparent",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        flexShrink: 0, gap: 0,
        boxSizing: "border-box"
      } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 400, lineHeight: 1, color: isNight ? "#FF3B30" : guidedPillInk, fontFamily: guidedMonoUi, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" } }, `${headerPoseCounterNum}/${listTotal}`)
    )
    : React.createElement("div", { style: { width: 44, height: 28, flexShrink: 0 } })
    ),




    phase === "closing" && /*#__PURE__*/
    React.createElement("div", { className: "guided-complete-stack" },
    streak >= 2 ? /*#__PURE__*/React.createElement("div", { className: "guided-complete-streak" }, `${streak}-DAY STREAK`) : null,
    showGuidedFirstSessionLine ? /*#__PURE__*/React.createElement("div", { className: "guided-complete-first-session" }, "Your first AXIS session.") : null,
    /*#__PURE__*/React.createElement("div", { className: "guided-complete-title" }, "Guided complete."),
    /*#__PURE__*/React.createElement("div", { className: "guided-complete-subtitle" }, "Take a few moments to breathe or rest."),
    /*#__PURE__*/React.createElement("div", { className: "guided-complete-summary" }, `${listTotal} exercises \u00b7 ${axisDurationMinLowerFromTrackDuration(trackDuration)}`),
    /*#__PURE__*/React.createElement("div", { className: "guided-complete-actions" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "guided-complete-share", onClick: () => {axisGuidedShareSession({ trackLabel, listTotal, streak });}, "aria-label": "Share session" }, "SHARE"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "guided-complete-exit", onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);onExit();}, "aria-label": "Exit guided session" }, "EXIT"))
    ),



    phase === "intro" && /*#__PURE__*/
    React.createElement("div", { style: {
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "24px 24px 20px", textAlign: "center", position: "relative", zIndex: 2, minHeight: 0, width: "100%", boxSizing: "border-box"
      } }, /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontFamily: guidedMonoUi, fontWeight: 500, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: guidedEyebrowMuted, marginBottom: 24 } }, "GUIDED SESSION"), /*#__PURE__*/
    React.createElement("div", { style: { fontFamily: guidedSansDisplay, fontWeight: 700, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.05, color: guidedExerciseTitleColor, marginBottom: 16, textShadow: "none" } },
    trackLabel
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontFamily: guidedSansDisplay, fontSize: 16, fontWeight: 400, marginBottom: 20, color: guidedMetaLine, textAlign: "center", lineHeight: 1.4, textTransform: "none" } }, `${filteredCount} exercises \u00b7 ${String(axisNormalizeDurationLabelToMin(trackDuration)).toLowerCase()}`)
    ), /*#__PURE__*/
    React.createElement("div", { style: {
        width: "100%",
        maxWidth: "100%",
        marginTop: 32,
        marginBottom: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        boxSizing: "border-box"
      } }, /*#__PURE__*/
    React.createElement("span", { style: { fontFamily: guidedSansDisplay, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: guidedExerciseTitleColor, lineHeight: 1.35, whiteSpace: "normal", textAlign: "center", WebkitTextFillColor: guidedExerciseTitleColor, width: "100%", maxWidth: 320 } }, "Show Detailed Instructions"),
    React.createElement("button", {
      type: "button",
      role: "switch",
      "aria-checked": showDetailedInstructions ? "true" : "false",
      onClick: () => {
        triggerHaptic(HAPTIC_LIGHT_TAP);
        const v = !showDetailedInstructions;
        setShowDetailedInstructions(v);
        showDetailedInstructionsRef.current = v;
        storageSet(AXIS_GUIDED_DETAILED_INSTRUCTIONS_KEY, v);
      },
      style: {
        width: 51,
        height: 31,
        flexShrink: 0,
        borderRadius: 999,
        border: showDetailedInstructions ? (isNight ? "1px solid #FF3B30" : "1px solid var(--mood-color)") : isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(15,30,46,0.12)",
        background: showDetailedInstructions ? (isNight ? A : "var(--mood-color)") : isDark ? "rgba(255,255,255,0.12)" : "rgba(15,30,46,0.12)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s, border-color 0.2s",
        WebkitTapHighlightColor: "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", { style: {
        position: "absolute",
        top: 3,
        left: showDetailedInstructions ? 22 : 3,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#ffffff",
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
      } })),
    React.createElement("p", { style: {
        margin: 0,
        padding: 0,
        width: "100%",
        maxWidth: 320,
        boxSizing: "border-box",
        fontFamily: guidedSansDisplay,
        fontSize: 10,
        fontWeight: 400,
        letterSpacing: "0.02em",
        lineHeight: 1.45,
        minHeight: 0,
        textAlign: "center",
        textTransform: "none",
        color: guidedMetaLine,
        WebkitTextFillColor: guidedMetaLine
      } }, "Turn off for a more hands-free flow", /*#__PURE__*/React.createElement("br", null), "(timers advance automatically).")),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 8 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 10, fontFamily: guidedMonoUi, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: guidedLabelCaps, marginBottom: 10 } }, "Exercise duration"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", width: "100%", maxWidth: "100%", marginTop: 4, marginBottom: 12 } },
    [30, 45, 60].map((sec) => /*#__PURE__*/
    React.createElement("button", { type: "button", key: sec, onClick: () => {
        if (onExerciseDurationChange) {
          onExerciseDurationChange(sec);
          return;
        }
        try {
          window.dispatchEvent(new CustomEvent("axis-guided-duration-change", { detail: sec }));
        } catch (e) {}
      triggerHaptic(HAPTIC_LIGHT_TAP);
      }, style: {
        fontFamily: guidedMonoUi, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "0 14px", borderRadius: 10, border: "1px solid",
        minHeight: 44,
        boxSizing: "border-box",
        borderColor: isNight ? "#FF3B30" : exerciseDurationSeconds === sec ? "color-mix(in srgb, var(--mood-color) 60%, transparent)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(15,30,46,0.1)",
        background: isNight ? exerciseDurationSeconds === sec ? "#FF3B30" : "#000000" : exerciseDurationSeconds === sec ? "color-mix(in srgb, var(--mood-color) 15%, transparent)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(15,30,46,0.06)",
        color: isNight ? exerciseDurationSeconds === sec ? "#000000" : "#FF3B30" : exerciseDurationSeconds === sec ? "var(--mood-color)" : isDark ? "rgba(255,255,255,0.45)" : "rgba(15,30,46,0.45)",
        WebkitTextFillColor: isNight ? exerciseDurationSeconds === sec ? "#000000" : "#FF3B30" : exerciseDurationSeconds === sec ? "var(--mood-color)" : isDark ? "rgba(255,255,255,0.45)" : "rgba(15,30,46,0.45)",
        cursor: "pointer", fontWeight: 600
      } },
    sec === 60 ? "1 MIN" : `${sec} SEC`
    ))), /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: (isNight ? "guided-cta-fill " : "") + "guided-refresher-done guided-intro-start",
      onClick: () => {primeAudio();beep(880, 0.3);triggerHaptic(HAPTIC_LIGHT_TAP);setPaused(false);goToPrepPhaseAt(0);},
      "aria-label": "Start guided session",
      style: { width: "100%", maxWidth: "100%", marginTop: 16, boxSizing: "border-box" }
    }, "START"), /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: onExit, "aria-label": "Close", style: {
        marginTop: 14, background: "none", border: "none", cursor: "pointer",
        fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: guidedTertiaryMuted, fontFamily: guidedMonoUi, fontWeight: 500,
        WebkitTextFillColor: guidedTertiaryMuted
      } }, "Cancel")
    )
    ),



    guidedPhaseBody,
    refresherOpen ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", {
      className: "guided-refresher-backdrop" + (refresherClosing ? " guided-refresher-backdrop--closing" : ""),
      role: "presentation",
      "aria-hidden": true,
      onClick: closeGuidedRefresher
    }), /*#__PURE__*/
    React.createElement("div", {
      className: "guided-refresher-sheet" + (refresherClosing ? " guided-refresher-sheet--closing" : ""),
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Instructions",
      onClick: (e) => e.stopPropagation(),
      onAnimationEnd: onGuidedRefresherSheetAnimationEnd,
      style: { display: "flex", flexDirection: "column", gap: 20 }
    }, /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "guided-refresher-sheet__dismiss",
      "aria-label": "Close instructions",
      onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);closeGuidedRefresher();},
      onTouchStart: onGuidedRefresherHandleStart,
      onTouchEnd: onGuidedRefresherHandleEnd
    }, /*#__PURE__*/React.createElement("span", { className: "guided-refresher-sheet__handle", "aria-hidden": true }), /*#__PURE__*/
    React.createElement("span", { className: "guided-refresher-sheet__handle-label" }, "Close")),
    /*#__PURE__*/React.createElement("div", { className: "guided-refresher-scroll" },
    /*#__PURE__*/React.createElement(React.Fragment, null,
    cur ? /*#__PURE__*/React.createElement(AxisExerciseSafetyCallouts, { key: `ref-safe-${fi}-${cur.id}`, exercise: cur, ultraNight: isNight, layout: "overlay" }) : null,
    cur && guidedShowRiskInlineNote ? /*#__PURE__*/React.createElement(AxisExerciseSafetyInlineNote, { variant: "guided", riskKind: guidedRiskNoteKind }) : null,
    guidedStepTotal > 0 ? /*#__PURE__*/React.createElement(ExerciseCarousel, {
      tiers: guidedInstructionTiersFiltered,
      frameSvgHtml: instructionFrameArrayForCarousel(guidedAnimKey),
      animationKey: guidedAnimKey,
      size: "medium",
      graphicMode: guidedAnimMode,
      theme: theme,
      ultraNight: isNight,
      bodyColorOverride: guidedBodyText,
      moveOpacity: 1,
      trackId: activeTrackId,
      allowBaselineMediaExpand: true,
      guidedFlowFrame: true,
      guidedFlowVideoSoonIfNoVideo: true,
      sessionExerciseCardExpanded: true,
      loopVideoSrc: cur ? axisResolveExerciseLoopVideoSrc(activeTrackId, cur) : "",
      fallbackDemoVideo: cur && cur.demoVideo ? cur.demoVideo : "",
      loopVideoPoster: cur && cur.axisLoopVideoPoster ? String(cur.axisLoopVideoPoster) : ""
    }) : /*#__PURE__*/React.createElement("div", { style: { fontSize: "var(--text-sm)", color: S, textAlign: "center" } }, "No instructions for this exercise."))),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: (isNight ? "guided-cta-fill " : "") + "guided-refresher-done",
      onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);closeGuidedRefresher();}
    }, "Done"))) : null,
    leaveConfirmOpen ? /*#__PURE__*/React.createElement("div", {
      className: "guided-leave-dialog-backdrop",
      role: "presentation",
      onClick: () => setLeaveConfirmOpen(false)
    }, /*#__PURE__*/React.createElement("div", {
      className: "guided-leave-dialog-panel",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "guided-leave-title",
      onClick: (e) => e.stopPropagation(),
      style: { display: "flex", flexDirection: "column", gap: 14 }
    }, /*#__PURE__*/React.createElement("div", { id: "guided-leave-title", style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-lg)",
        fontWeight: 600,
        color: W,
        lineHeight: 1.28,
        textAlign: "center"
      } }, "Leave this guided session?"), /*#__PURE__*/React.createElement("div", { style: {
        fontSize: "var(--text-sm)",
        color: S,
        lineHeight: 1.5,
        textAlign: "center"
      } }, "You can start guided again anytime."), /*#__PURE__*/React.createElement("div", { style: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        marginTop: 2
      } }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);setLeaveConfirmOpen(false);},
      style: {
        flex: 1,
        minHeight: 52,
        height: 52,
        borderRadius: 12,
        border: guidedSecBtnBdr,
        background: guidedSecBtnBg,
        color: guidedSecBtnInk,
        fontFamily: guidedMonoUi,
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        WebkitTextFillColor: guidedSecBtnInk
      }
    }, "Stay"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: isNight ? "guided-cta-fill" : undefined,
      onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);setLeaveConfirmOpen(false);onExit();},
      style: {
        flex: 1,
        minHeight: 52,
        height: 52,
        borderRadius: 12,
        background: isNight ? A : "var(--mood-color)",
        border: nightMode ? "1px solid #FF3B30" : "none",
        color: guidedFilledText,
        WebkitTextFillColor: guidedFilledText,
        fontFamily: guidedMonoUi,
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        boxShadow: "none"
      }
    }, "Leave")))) : null
    ));

}



// ─────────────────────────────────────────────────────────────
//  CIRCADIAN THEME ENGINE
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  TIMER VIEW — standalone interval timer
// ─────────────────────────────────────────────────────────────
function TimerView({ theme, view, setView, nightMode = false, activePeriod = null, dashboardHeader = null, onSystemTab }) {
  const [mode, setMode] = useState("interval"); // "interval" | "breathe"
  // derive dark flag early so all uses below are safe
  const isDark = typeof nightMode === "boolean" && nightMode || theme === "dark";
  const moodPeriod = axisResolveMoodPeriod(activePeriod);
  const ctTimer = CIRCADIAN_THEMES[moodPeriod][isDark ? "dark" : "light"];
  const breatheAccent = nightMode ? "#FF3B30" : ctTimer && ctTimer.accent ? ctTimer.accent : "var(--mood-color)";
  const timerMoodStyle = !nightMode && ctTimer ? (() => {
    const a = ctTimer.accent;
    const accentSec = a && /^#[0-9a-fA-F]{6}$/i.test(String(a)) ? a + "99" : a;
    return {
      "--accent": a,
      "--mood-accent": a,
      "--mood-color": a,
      "--accent-dim": ctTimer.accentDim,
      "--accent-glow": ctTimer.accentGlow,
      "--accent-secondary": accentSec,
      ...(ctTimer.accentBtnText ? { "--accent-btn-text": ctTimer.accentBtnText } : {})
    };
  })() : undefined;

  // ── INTERVAL state ──
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(15);
  const [rounds, setRounds] = useState(4);
  const [iRunning, setIRunning] = useState(false);
  const [iPhase, setIPhase] = useState("idle");
  const [iRound, setIRound] = useState(1);
  const [iTime, setITime] = useState(0);
  const [intervalRingSnap, setIntervalRingSnap] = useState(false);
  const iRef = useRef(null);
  /** Wall-clock end of current work/rest segment — drives display + ring so duration matches settings (no setInterval drift). */
  const iDeadlineRef = useRef(null);
  const iPhaseRef = useRef("idle");
  const iPrevRemainingRef = useRef(null);
  /** Bumps while a segment runs so the ring re-renders and can track wall-clock progress between integer seconds. */
  const [iRingPulse, setIRingPulse] = useState(0);
  const breathHapticFlagsRef = useRef({ holdMidpoint: false });

  useEffect(() => {
    iPhaseRef.current = iPhase;
  }, [iPhase]);

  useEffect(() => {
    if (!intervalRingSnap) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIntervalRingSnap(false));
    });
    return () => cancelAnimationFrame(id);
  }, [intervalRingSnap]);

  function iReset() {
    setIntervalRingSnap(true);
    clearInterval(iRef.current);
    iDeadlineRef.current = null;
    iPrevRemainingRef.current = null;
    setIRunning(false);
    setIPhase("idle");
    setIRound(1);
    setITime(0);
  }
  function iStart() {
    triggerHaptic(HAPTIC_LIGHT_TAP);
    setIPhase("work");
    setIRound(1);
    setITime(work);
    iPhaseRef.current = "work";
    iDeadlineRef.current = Date.now() + work * 1000;
    iPrevRemainingRef.current = null;
    setIRunning(true);
  }

  useEffect(() => {
    if (iRunning) return;
    if (iPhase === "work" || iPhase === "rest") {
      iDeadlineRef.current = null;
    }
  }, [iRunning, iPhase]);

  useEffect(() => {
    if (!iRunning || iPhase === "idle" || iPhase === "done") return;
    clearInterval(iRef.current);

    if (iDeadlineRef.current == null && (iPhase === "work" || iPhase === "rest")) {
      iDeadlineRef.current = Date.now() + Math.max(0, iTime) * 1000;
    }

    const tick = () => {
      const d = iDeadlineRef.current;
      if (d == null) return;
      const msLeft = d - Date.now();
      const remaining = Math.max(0, Math.ceil(msLeft / 1000));
      setITime(remaining);
      if (msLeft > 0) setIRingPulse((n) => n + 1);

      const prevR = iPrevRemainingRef.current;
      if (prevR === 5 && remaining === 4) beep(440, 0.12);
      iPrevRemainingRef.current = remaining;

      if (msLeft > 0) return;

      iDeadlineRef.current = null;
      const ph = iPhaseRef.current;

      if (ph === "work") {
        beep(660, 0.25);
        triggerHaptic(HAPTIC_DOUBLE_TAP);
        if (rest > 0) {
          setIPhase("rest");
          iPhaseRef.current = "rest";
          iDeadlineRef.current = Date.now() + rest * 1000;
          iPrevRemainingRef.current = null;
          setITime(rest);
          return;
        }
        setIRound((r) => {
          if (r >= rounds) {
            setIPhase("done");
            iPhaseRef.current = "done";
            setIRunning(false);
            iDeadlineRef.current = null;
            beep(440, 0.5);
            return r;
          }
          setIPhase("work");
          iPhaseRef.current = "work";
          iDeadlineRef.current = Date.now() + work * 1000;
          iPrevRemainingRef.current = null;
          setITime(work);
          return r + 1;
        });
        return;
      }

      if (ph === "rest") {
        beep(880, 0.2);
        triggerHaptic(HAPTIC_DOUBLE_TAP);
        setIRound((r) => {
          if (r >= rounds) {
            setIPhase("done");
            iPhaseRef.current = "done";
            setIRunning(false);
            iDeadlineRef.current = null;
            beep(440, 0.5);
            return r;
          }
          setIPhase("work");
          iPhaseRef.current = "work";
          iDeadlineRef.current = Date.now() + work * 1000;
          iPrevRemainingRef.current = null;
          setITime(work);
          return r + 1;
        });
      }
    };

    tick();
    iRef.current = setInterval(tick, 32);
    return () => clearInterval(iRef.current);
  }, [iRunning, iPhase, work, rest, rounds]);

  // ── BREATHE state ──
  const BREATH_PATTERNS = {
    "4-2-6": [
    { label: "Inhale", dur: 4, color: "var(--mood-color)", expand: true },
    { label: "Hold", dur: 2, color: "var(--text-secondary)", expand: true },
    { label: "Exhale", dur: 6, color: "var(--text-dim)", expand: false }],

    "4-7-8": [
    { label: "Inhale", dur: 4, color: "var(--mood-color)", expand: true },
    { label: "Hold", dur: 7, color: "var(--text-secondary)", expand: true },
    { label: "Exhale", dur: 8, color: "var(--text-dim)", expand: false }],

    "Box": [
    { label: "Inhale", dur: 4, color: "var(--mood-color)", expand: true },
    { label: "Hold", dur: 4, color: "var(--text-secondary)", expand: true },
    { label: "Exhale", dur: 4, color: "var(--text-dim)", expand: false },
    { label: "Hold", dur: 4, color: "var(--text-dimmer)", expand: false }],

    "Physio Sigh": [
    { label: "Inhale", dur: 2, color: "var(--mood-color)", expand: true },
    { label: "Sniff", dur: 1, color: "var(--mood-color)", expand: true },
    { label: "Long Exhale", dur: 8, color: "var(--text-dim)", expand: false }]

  };
  const BREATH_PATTERN_CARDS = [
    { key: "4-2-6", name: "4\u20132\u20136", intent: "Regulate", desc: "A longer exhale helps your heart rate settle and tells your body you can ease off. Use it for a midday reset when stress is climbing and you need to feel steady again." },
    { key: "4-7-8", name: "4\u20137\u20138", intent: "Unwind", desc: "Slow breaths with a longer pause between inhale and exhale calm your nervous system down. Use before bed or whenever anxiety is running high and you need relief." },
    { key: "Box", name: "Box", intent: "Center", desc: "Same count in, hold, out, and hold again. Steadies your breath and clears mental noise without making you sleepy. Use before meetings, workouts, or anything that needs focus." },
    { key: "Physio Sigh", name: "Physio Sigh", intent: "Release", desc: "Take two short inhales, then one long exhale through your mouth. Releases tension fast when your chest feels tight or stress hits all at once. One of the quickest resets we offer." }
  ];
  const BREATHE_PREP_LABELS = ["3", "2", "1", "Breathe"];
  const BREATHE_PREP_STEP_HOLD_MS = 900;
  const BREATHE_PREP_FADE_MS = 150;
  const BREATHE_PREP_BREATHE_HOLD_MS = 600;
  const [breathPattern, setBreathPattern] = useState("4-7-8");
  const [breathCycles, setBreathCycles] = useState(4);
  const [bRunning, setBRunning] = useState(false);
  const [bPaused, setBPaused] = useState(false);
  const [bPhaseIdx, setBPhaseIdx] = useState(0);
  const [bCycle, setBCycle] = useState(1);
  const [bTime, setBTime] = useState(0);
  const [bPrepDisplay, setBPrepDisplay] = useState(null);
  const [bPrepOpacity, setBPrepOpacity] = useState(1);
  const [bPrepSeq, setBPrepSeq] = useState(0);
  const [breathePatternCardIdx, setBreathePatternCardIdx] = useState(0);
  const breathePatternScrollRef = useRef(null);
  const BREATHE_PATTERN_CARD_W = 215;
  const BREATHE_PATTERN_CARD_GAP = 10;
  const BREATHE_PATTERN_CARD_STEP = BREATHE_PATTERN_CARD_W + BREATHE_PATTERN_CARD_GAP;
  const breathePatternScrollBehavior = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const breathePatternIndexFromScroll = (el) => {
    const n = BREATH_PATTERN_CARDS.length;
    if (!el || n <= 1) return 0;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  };
  const scrollBreathePatternToIndex = (idx) => {
    const el = breathePatternScrollRef.current;
    if (!el || idx < 0) return;
    const child = el.children[idx];
    if (child && child.scrollIntoView) child.scrollIntoView({ inline: "center", block: "nearest", behavior: breathePatternScrollBehavior() });
  };
  const bPrepTimersRef = useRef([]);
  const bPhaseRef = useRef(0);
  const bCycleRef = useRef(1);
  const bPatternRef = useRef(BREATH_PATTERNS["4-7-8"]);
  const bCyclesRef = useRef(4);
  const bPhaseStartedMsRef = useRef(0);
  const bPhaseElapsedMsRef = useRef(0);
  const [breatheAnimTick, setBreatheAnimTick] = useState(0);
  const [intervalSettingsOpen, setIntervalSettingsOpen] = useState(false);
  const [breatheSettingsOpen, setBreatheSettingsOpen] = useState(false);

  // Keep refs in sync
  useEffect(() => {bPatternRef.current = BREATH_PATTERNS[breathPattern];}, [breathPattern]);
  useEffect(() => {bCyclesRef.current = breathCycles;}, [breathCycles]);
  useEffect(() => {
    const idx = BREATH_PATTERN_CARDS.findIndex((c) => c.key === breathPattern);
    if (idx >= 0) setBreathePatternCardIdx(idx);
  }, [breathPattern]);
  const pattern = BREATH_PATTERNS[breathPattern];
  const curBreathPhase = pattern[bPhaseIdx];
  const phaseLabel = (curBreathPhase && curBreathPhase.label) || "";
  const isInhalePhase = phaseLabel === "Inhale" || phaseLabel === "Sniff";
  const isHoldPhase = phaseLabel === "Hold";
  const isExhalePhase = phaseLabel.includes("Exhale");

  const phaseDur = Math.max(1, (curBreathPhase && curBreathPhase.dur) || 1);
  void breatheAnimTick;
  const phaseElapsedSec = Math.min(
    phaseDur,
    Math.max(
      0,
      bRunning ?
      (performance.now() - bPhaseStartedMsRef.current) / 1000 :
      bPhaseElapsedMsRef.current / 1000
    )
  );
  const progress = Math.max(0, Math.min(1, phaseElapsedSec / phaseDur));
  let breatheIntensity = 1;
  let glowOpacity = 1;
  if (isInhalePhase) {
    const lastSecondProgress = 1 - 1 / phaseDur;
    breatheIntensity = progress >= lastSecondProgress ? 1 : progress / lastSecondProgress;
    glowOpacity = 0.18 + Math.min(1, Math.max(0, breatheIntensity)) * 0.82;
  } else if (isHoldPhase) {
    breatheIntensity = 1;
    glowOpacity = 1;
  } else if (isExhalePhase) {
    breatheIntensity = 1 - progress;
    glowOpacity = 1 - Math.min(1, Math.max(0, progress)) * 0.82;
  }
  const orbOpacity = Math.max(0.18, Math.min(1, glowOpacity));
  const breatheOpacityTransition = isInhalePhase ? `${Math.max(2.5, phaseDur * 0.85)}s ease` : "0.6s ease";

  const breatheMinScale = 0.45;
  // ringSize 312 + guide r=140 (320 vb): max scale so accent stroke outer edge meets guide stroke outer edge
  const ringSize = 312;
  const breatheInset = (ringSize - 306) / 2;
  const breatheGuideStrokeVB = nightMode || isDark ? 2.5 : 3;
  const breatheInnerOuterR = 120 + 3.4 / 2;
  const breatheGuideOuterEdgePx = (ringSize / 320) * (140 + breatheGuideStrokeVB / 2);
  const breatheMaxScale = Math.max(
    breatheMinScale + 0.02,
    breatheGuideOuterEdgePx / breatheInnerOuterR
  );
  let breatheT = 0;
  if (isHoldPhase) breatheT = 1;
  else if (isInhalePhase) breatheT = progress;
  else if (isExhalePhase) breatheT = 1 - progress;
  breatheT = Math.max(0, Math.min(1, breatheT));
  const breatheScaleT = isInhalePhase ? 1 - Math.pow(1 - breatheT, 1.35) : breatheT;
  const breatheScale = breatheMinScale + breatheScaleT * (breatheMaxScale - breatheMinScale);
  const breatheScaleDisplay = breatheScale;
  // per-phase fade duration for smooth glow opacity transitions
  const breatheFadeDuration = isInhalePhase ?
  Math.max(0.8, phaseDur * 0.85) :
  isHoldPhase ?
  Math.max(0.6, phaseDur * 0.9) :
  Math.max(0.65, phaseDur * 0.72);
  const breatheOpacityDuration = `${Math.max(1, phaseDur)}s`;

  function clearBPrepTimers() {
    bPrepTimersRef.current.forEach((id) => clearTimeout(id));
    bPrepTimersRef.current = [];
  }

  function bReset() {
    clearBPrepTimers();
    setBPrepDisplay(null);
    setBPrepOpacity(1);
    setBRunning(false);setBPaused(false);setBPhaseIdx(0);setBCycle(1);setBTime(0);
    bPhaseRef.current = 0;bCycleRef.current = 1;
    bPhaseElapsedMsRef.current = 0;
    breathHapticFlagsRef.current = { holdMidpoint: false };
  }

  function bBeginActive() {
    bPhaseRef.current = 0;bCycleRef.current = 1;
    setBPhaseIdx(0);setBCycle(1);
    setBTime(bPatternRef.current[0].dur);
    bPhaseStartedMsRef.current = performance.now();
    bPhaseElapsedMsRef.current = 0;
    breathHapticFlagsRef.current = { holdMidpoint: false };
    setBPaused(false);
    setBRunning(true);
    beep(528, 0.2);
    triggerHaptic(HAPTIC_LIGHT_TAP);
  }

  function bStartPrep() {
    primeAudio();
    setBRunning(false);
    setBPaused(false);
    setBPhaseIdx(0);
    setBCycle(1);
    setBTime(0);
    bPhaseRef.current = 0;
    bCycleRef.current = 1;
    bPhaseElapsedMsRef.current = 0;
    breathHapticFlagsRef.current = { holdMidpoint: false };
    clearBPrepTimers();
    setBPrepDisplay("3");
    setBPrepOpacity(1);
    setBPrepSeq((n) => n + 1);
    beep(440, 0.1);
    triggerHaptic(HAPTIC_LIGHT_TAP);
  }

  useEffect(() => {
    if (bPrepSeq === 0) return undefined;
    clearBPrepTimers();
    const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeMs = reduced ? 0 : BREATHE_PREP_FADE_MS;
    let delay = 0;
    const schedule = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      bPrepTimersRef.current.push(id);
    };
    BREATHE_PREP_LABELS.forEach((label, i) => {
      const holdMs = label === "Breathe" ? BREATHE_PREP_BREATHE_HOLD_MS : BREATHE_PREP_STEP_HOLD_MS;
      schedule(() => {
        setBPrepDisplay(label);
        setBPrepOpacity(1);
        if (label !== "Breathe") {
          beep(440, 0.08);
          triggerHaptic(HAPTIC_LIGHT_TAP);
        }
      }, delay);
      delay += holdMs;
      if (i < BREATHE_PREP_LABELS.length - 1) {
        if (fadeMs > 0) {
          schedule(() => setBPrepOpacity(0), delay);
          delay += fadeMs;
        }
      }
    });
    schedule(() => {
      setBPrepDisplay(null);
      setBPrepOpacity(1);
      bBeginActive();
    }, delay);
    return () => clearBPrepTimers();
  }, [bPrepSeq]);

  useEffect(() => {
    if (!bRunning) return;
    bPhaseStartedMsRef.current = performance.now() - bPhaseElapsedMsRef.current;
    let rafId = 0;
    const tick = () => {
      const now = performance.now();
          const pat = bPatternRef.current;
      let phaseIdx = bPhaseRef.current;
      let cycle = bCycleRef.current;
      let phaseDurMs = Math.max(1, (pat[phaseIdx] && pat[phaseIdx].dur) || 1) * 1000;
      let elapsedMs = Math.max(0, now - bPhaseStartedMsRef.current);

      while (elapsedMs >= phaseDurMs) {
        const nextIdx = (phaseIdx + 1) % pat.length;
          const isNewCycle = nextIdx === 0;
        const nextCycle = isNewCycle ? cycle + 1 : cycle;

        if (isNewCycle && cycle >= bCyclesRef.current) {
          bPhaseRef.current = 0;
          bCycleRef.current = bCyclesRef.current + 1;
          bPhaseElapsedMsRef.current = 0;
          setBPhaseIdx(0);
          setBCycle(bCyclesRef.current + 1);
          setBTime(0);
          setBPaused(false);
          setBRunning(false);
            beep(528, 0.4);
          triggerHaptic(HAPTIC_DOUBLE_TAP);
          return;
        }

        phaseIdx = nextIdx;
        cycle = nextCycle;
        elapsedMs -= phaseDurMs;
        phaseDurMs = Math.max(1, (pat[phaseIdx] && pat[phaseIdx].dur) || 1) * 1000;
        bPhaseStartedMsRef.current = now - elapsedMs;
        beep(pat[phaseIdx].label === "Inhale" ? 528 : 440, 0.15);
        breathHapticFlagsRef.current = { holdMidpoint: false };
        if (breathPattern === "4-7-8") {
          const nextLabel = pat[phaseIdx].label;
          if (nextLabel === "Inhale") triggerHaptic(HAPTIC_LIGHT_TAP);
          else if (nextLabel.includes("Exhale")) triggerHaptic(HAPTIC_LIGHT_TAP);
        }
      }

      bPhaseRef.current = phaseIdx;
      bCycleRef.current = cycle;
      bPhaseElapsedMsRef.current = elapsedMs;
      if (phaseIdx !== bPhaseIdx) setBPhaseIdx(phaseIdx);
      if (cycle !== bCycle) setBCycle(cycle);

      const nextTime = Math.max(1, Math.ceil((phaseDurMs - elapsedMs) / 1000));
      setBTime((prev) => prev === nextTime ? prev : nextTime);
      if (breathPattern === "4-7-8" && (pat[phaseIdx] && pat[phaseIdx].label) === "Hold" && !breathHapticFlagsRef.current.holdMidpoint && elapsedMs >= 3500) {
        breathHapticFlagsRef.current.holdMidpoint = true;
        triggerHaptic(HAPTIC_MEDIUM);
      }
      setBreatheAnimTick((n) => (n + 1) % 1000000);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [bRunning, bPhaseIdx, bCycle]);

  const bCountingDown = bPrepDisplay != null;
  const bDone = !bRunning && !bPaused && !bCountingDown && bCycle > breathCycles && bTime === 0;
  const breatheShowCyclePips = breathCycles <= 8;
  const breatheUiState = bCountingDown ? "countdown" : bDone ? "done" : bRunning || bPaused ? "active" : "idle";
  const breatheSessionUi = breatheUiState === "countdown" || breatheUiState === "active";

  // switch mode → reset both
  function switchMode(m) {axisHapticTick();iReset();bReset();setMode(m);}

  let iPct = 0;
  if (iPhase === "work" || iPhase === "rest") {
    const durSec = iPhase === "work" ? work : rest;
    if (durSec > 0) {
      const d = iDeadlineRef.current;
      if (d != null) {
        const msLeft = Math.max(0, d - Date.now());
        const msDur = durSec * 1000;
        iPct = Math.min(100, Math.max(0, ((msDur - msLeft) / msDur) * 100));
      } else {
        iPct = iPhase === "work" ? (work - iTime) / work * 100 : (rest - iTime) / rest * 100;
      }
    }
  }
  void iRingPulse;
  const iRingColor = nightMode ? "#FF3B30" : iPhase === "rest" ? "var(--text-secondary)" : breatheAccent;
  // Timer crawl on the guide ring (r=140, same path as .timer-breathe-guide-outline — the larger inner ring). Clockwise from 12 via rotate(−90 160 160).
  const iCircumferenceProgress = 2 * Math.PI * 140;
  const iGuideDashOffset = iPhase === "work" || iPhase === "rest" ? iCircumferenceProgress * (1 - iPct / 100) : 0;
  const iGuideDashArray = `${iCircumferenceProgress} ${iCircumferenceProgress}`;
  // Plain seconds only — no 0: prefix (e.g. 30 not 0:30)
  const formatSecondsOnly = (s) => String(s);
  // Roboto Mono Medium for interval timer numerals; main countdown (Breathe duplicates with its own light color)
  const intervalDigitStyle = {
    fontFamily: "var(--font-data)",
    fontWeight: 500,
    letterSpacing: "-0.04em",
    minWidth: 72,
    textAlign: "center",
    fontSize: 120,
    color: nightMode ? "#FF3B30" : isDark ? "var(--text-white)" : "#252525",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    textShadow: "none"
  };
  const breatheHeroDigitStyle = {
    fontFamily: "var(--font-data)",
    fontWeight: 700,
    fontSize: 80,
    lineHeight: 1,
    minWidth: 72,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.04em",
    color: nightMode ? "#FF3B30" : isDark ? "var(--text-white)" : "#1D1D1F",
    textShadow: "none"
  };
  /** Hero ring idle label (Ready) — reuse for Done so typography matches */
  const TIMER_HERO_READY_STYLE = {
    fontSize: "var(--text-lg)",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-dimmer)",
    fontFamily: "var(--font-display)"
  };
  const BREATHE_COUNTDOWN_STYLE = {
    fontWeight: 600,
    fontFamily: "var(--font-data)",
    fontSize: bPrepDisplay === "Breathe" ? 52 : 88,
    color: nightMode ? "#FF3B30" : isDark ? "var(--text-white)" : "#1D1D1F",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
    opacity: bPrepOpacity,
    transition: "opacity 0.15s ease"
  };
  const timerNumMedium = { fontFamily: "var(--font-data)", fontWeight: 500, fontSize: "var(--text-lg)", color: "var(--text-white)", lineHeight: 1, minWidth: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" };
  const timerNumSmall = { fontFamily: "var(--font-data)", fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-dimmer)", lineHeight: 1.2 };
  const BTN = { padding: "0 28px", borderRadius: 12, cursor: "pointer", fontFamily: '"DM Sans", var(--font-ui), system-ui, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.22s", minHeight: 52, height: 52, boxSizing: "border-box" };
  const BTN_GHOST = { padding: "14px 22px", borderRadius: 16, cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", transition: "all 0.22s", minHeight: 48, boxSizing: "border-box" };
  const BTN_INTERVAL_PAUSE = { ...BTN, padding: "12px 28px", minHeight: 56, boxSizing: "border-box" };
  const BTN_INTERVAL_RESET = { ...BTN_GHOST, minHeight: 56, padding: "14px 22px", boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center" };
  // Lock INTERVAL + BREATHE layout: same ring slot, same mid slot, same button row (BREATHE as reference — no extra ring offset)
  // Circle as large as possible within column; static slot so INTERVAL/BREATHE don’t shift (ringSize / breatheInset above)
  const TIMER_RING_WRAP = { flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: ringSize, height: ringSize, minWidth: ringSize, minHeight: ringSize, marginLeft: "auto", marginRight: "auto", marginTop: 8, marginBottom: 8 };
  const TIMER_MID_MIN_IDLE = 96; // min height for tight Work/Rest/Rounds
  const TIMER_MID_IDLE_HEIGHT = 92; // INTERVAL idle mid slot
  const TIMER_PHASE_BAND = 46; // matches BREATHE phase label block height so Pause/Reset align when running
  /** Same px gap: (timer ring ↔ settings) and (settings ↔ START) on Interval/Breathe idle */
  const TIMER_IDLE_VERTICAL_GAP = 16;
  // Toggle: spacer above so INTERVAL/BREATHE sit halfway between top edge and top of circle
  const TIMER_TOGGLE_SPACER_TOP = 0;
  /* Same chrome + wrap metrics as Favorites TRACKS/EXERCISES (HOME EXPLORE/RECENTS uses marginBottom: 8). */
  const TIMER_TOGGLE_WRAP = { flexShrink: 0, display: "flex", gap: 5, marginBottom: 16, padding: 3, minHeight: 40, alignItems: "center", boxSizing: "border-box", width: "100%", maxWidth: 380, marginLeft: "auto", marginRight: "auto", justifyContent: "center" };
  // Button row: equal spacers when Pause/Reset/Again — when START only, shrink spacer above so START sits same height as Pause/RESET
  const TIMER_BTN_SPACER_ABOVE = { flex: 1, minHeight: 0, width: "100%" };
  const TIMER_BTN_SPACER_BELOW = { flex: 1, minHeight: 0, width: "100%" };
  // Idle: legacy flex spacers (running / non-idle paths)
  const TIMER_BTN_SPACER_ABOVE_IDLE = { flex: 0.1, minHeight: 0, width: "100%" };
  const TIMER_BTN_SPACER_BELOW_IDLE = { flex: 1.75, minHeight: 0, width: "100%" };
  // Interval idle: fixed gap below ring and above START (matches TIMER_IDLE_VERTICAL_GAP on mid block)
  const TIMER_BTN_SPACER_ABOVE_INTERVAL_IDLE = { flex: 0, flexGrow: 0, flexShrink: 0, minHeight: TIMER_IDLE_VERTICAL_GAP + 14, width: "100%" };
  const TIMER_BTN_SPACER_BELOW_INTERVAL_IDLE = { flex: 0, flexGrow: 0, flexShrink: 0, minHeight: 12, width: "100%" };
  // Breathe idle: match Interval — same gap (ring↔pattern/cycles ↔ START)
  const TIMER_BTN_SPACER_ABOVE_BREATHE_IDLE = { flex: 0, flexGrow: 0, flexShrink: 0, minHeight: TIMER_IDLE_VERTICAL_GAP + 14, width: "100%" };
  const TIMER_BTN_ROW = { flexShrink: 0, display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 10, width: "100%", justifyContent: "center", alignItems: "center", boxSizing: "border-box", paddingTop: 6, paddingBottom: 4, maxWidth: 380, marginTop: 28 };
  const TIMER_BTN_ROW_IDLE = { ...TIMER_BTN_ROW };
  const TIMER_BTN_ROW_BREATHE_IDLE = { ...TIMER_BTN_ROW, marginTop: 14, paddingTop: 0, marginBottom: 0, flexShrink: 0 };

  const timerFlatCss = `
  .timer-view-body,
  .timer-view-body * {
    hyphens: none !important;
    -webkit-hyphens: none !important;
    -ms-hyphens: none !important;
  }
  .timer-view-body .timer-breathe-pattern-card,
  .timer-view-body .timer-breathe-pattern-card * {
    word-break: normal !important;
    overflow-wrap: normal !important;
    word-wrap: normal !important;
    text-wrap: wrap;
  }
  .timer-view-body .timer-mode-outer-pill {
    border: 1px solid color-mix(in srgb, var(--glass-border) 65%, transparent);
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)), rgba(0, 0, 0, 0.14);
    backdrop-filter: blur(28px) saturate(1.25);
    -webkit-backdrop-filter: blur(28px) saturate(1.25);
    position: relative;
    padding: 5px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--glass-specular) 45%, transparent), 0 14px 44px rgba(0, 0, 0, 0.22);
  }
  /* Focal “stage” — class on the ring wrap (same node as TMT disc; no extra JSX wrapper) */
  .timer-view-body .timer-hero-stage.timer-interval-ring-wrap,
  .timer-view-body .timer-hero-stage.timer-breathe-ring-wrap {
    width: 100%;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
    padding: 26px 20px 30px;
    border-radius: 36px;
    background: linear-gradient(160deg, color-mix(in srgb, var(--mood-color) 14%, rgba(255, 255, 255, 0.03)) 0%, rgba(8, 14, 22, 0.55) 45%, rgba(4, 8, 14, 0.72) 100%);
    border: 1px solid color-mix(in srgb, var(--glass-border) 75%, var(--mood-color) 14%);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--mood-color) 12%, transparent),
      0 28px 64px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(22px) saturate(1.35);
    -webkit-backdrop-filter: blur(22px) saturate(1.35);
    box-sizing: border-box;
  }
  .timer-view-body .timer-secondary-block {
    width: 100%;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
    transform: translateY(-6px);
  }
  .timer-view-body .timer-glass-wrap {
    background: transparent;
    border-radius: 999px;
    position: relative;
  }
  .timer-view-body .timer-settings-disclosure {
    width: 100%;
    max-width: 380px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-settings-disclosure__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 6px;
    margin: 0;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .timer-view-body .timer-settings-disclosure__header .axis-chevron-svg {
    flex-shrink: 0;
    opacity: 0.72;
  }
  .timer-view-body .timer-settings-disclosure__body {
    width: 100%;
    box-sizing: border-box;
    padding-bottom: 4px;
  }
  .timer-view-body .timer-glass-orb {
    background: transparent;
    border-radius: 50%;
    position: relative;
  }
  .timer-view-body .timer-glass-panel {
    border: 1px solid color-mix(in srgb, var(--glass-border) 82%, transparent);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01)), rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 16px 40px rgba(0,0,0,0.04);
  }
  .timer-view-body .timer-glass-phase {
    background: transparent;
    border-radius: 0;
  }
  /* Same vertical band as .timer-secondary-block (settings): ring → gap → ~92px slot → gap → buttons */
  .timer-view-body .timer-active-mid-band {
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 0 12px;
    gap: 8px;
  }
  .timer-view-body .timer-active-mid-band .timer-glass-phase {
    margin-top: 0;
    padding-top: 8px;
    padding-bottom: 4px;
    min-height: 0;
  }
  .timer-view-body .timer-glass-btn-pri {
    background: var(--mood-color);
    color: var(--accent-btn-text);
    -webkit-text-fill-color: var(--accent-btn-text);
    border: none;
    font-family: "DM Sans", var(--font-ui), system-ui, sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: none;
  }
  .timer-view-body .timer-cta-row {
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
  }
  .timer-view-body .timer-glass-btn-pri.timer-start-cta {
    border-radius: 12px;
    min-height: 52px;
    height: 52px;
    box-shadow: none;
  }
  .timer-view-body .timer-cta-row > .timer-glass-btn-pri:first-child:last-child {
    width: 50%;
    flex: 0 1 50%;
  }
  .timer-view-body .timer-cta-row .timer-glass-btn-pri:not(:only-of-type) {
    flex: 1 1 0;
    min-width: 0;
  }
  .timer-view-body .timer-cta-row .timer-glass-btn-ghost {
    flex: 1 1 0;
    min-width: 0;
  }
  .app[data-night="true"] .timer-view-body .timer-glass-btn-pri,
  .app[data-night="true"] .timer-view-body .timer-glass-btn-pri * {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    fill: currentColor !important;
    stroke: currentColor !important;
  }
  .timer-view-body .timer-glass-btn-ghost {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.6);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    font-family: "DM Sans", var(--font-ui), system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 12px;
    min-height: 52px;
    height: 52px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-glass-pattern-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    min-height: 44px;
    box-sizing: border-box;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    transition: all 0.2s ease;
    font-family: "DM Mono", var(--font-data), ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .timer-view-body .timer-glass-pattern-btn.active {
    background: color-mix(in srgb, var(--mood-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--mood-color) 60%, transparent);
    color: var(--mood-color);
    border-radius: 10px;
    min-height: 44px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-glass-pattern-btn:not(.active) {
    color: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    min-height: 44px;
    font-family: "DM Mono", var(--font-data), ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    box-sizing: border-box;
  }
  .app[data-theme="light"] .timer-view-body .timer-glass-pattern-btn:not(.active) {
    color: rgba(15, 30, 46, 0.45);
    border-color: rgba(15, 30, 46, 0.1);
    background: rgba(15, 30, 46, 0.06);
  }
  .app[data-night="true"] .timer-view-body .timer-glass-pattern-btn:not(.active) {
    color: rgba(255, 59, 48, 0.95) !important;
    border-color: rgba(255, 59, 48, 0.5) !important;
    -webkit-text-fill-color: rgba(255, 59, 48, 0.95) !important;
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(0, 0, 0, 0.08)), rgba(0, 0, 0, 0.35) !important;
  }
  .timer-view-body .timer-breathe-orb {
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    background: radial-gradient(circle at 50% 50%, var(--mood-color) 0%, transparent 80%);
    mix-blend-mode: screen;
    filter: blur(6px);
    animation: timer-breathe-orb-loop 16s ease-in-out infinite;
  }
  .timer-view-body .timer-breathe-orb-soft {
    background: radial-gradient(circle at 50% 50%, var(--accent-glow, var(--accent-dim)) 0%, transparent 85%);
    animation-duration: 18s;
  }
  @keyframes timer-breathe-orb-loop {
    0% { opacity: 0.45; transform: scale(0.9); }
    50% { opacity: 0.8; transform: scale(1.05); }
    100% { opacity: 0.45; transform: scale(0.9); }
  }
  /* Single soft glow behind the ring — blur() bleeds past stroke; clip + inset fill keep halo inside ring */
  .timer-view-body .timer-breathe-glow {
    position: absolute;
    left: 0; top: 0;
    width: 100%;
    height: 100%;
    max-width: 306px;
    max-height: 306px;
    box-sizing: border-box;
    pointer-events: none;
    mix-blend-mode: screen;
    will-change: opacity, transform;
    filter: blur(3px);
    clip-path: circle(48% at 50% 50%);
    transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1), opacity var(--breathe-opacity-dur, 3s) linear, filter 1.2s ease;
  }
  .timer-view-body .timer-breathe-ring {
    position: absolute;
    left: 0; top: 0;
    width: 306px; height: 306px;
    pointer-events: none;
    transform-origin: center center;
    will-change: transform;
    transition: filter 1s ease-in-out;
  }
  .timer-view-body .timer-breathe-ring circle {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }
  .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="soft"] .timer-breathe-ring {
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--mood-color) 22%, transparent)) drop-shadow(0 0 2px color-mix(in srgb, var(--mood-color) 12%, transparent));
  }
  /* HOLD: no background glow pulse — mood ring pulses (see breathe-hold-ring-pulse) */
  @media (prefers-reduced-motion: no-preference) {
    .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
      animation: pulse-glow 3s ease-in-out infinite;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
      animation: none;
      filter: drop-shadow(0 0 14px color-mix(in srgb, var(--mood-color) 50%, transparent)) drop-shadow(0 0 5px color-mix(in srgb, var(--mood-color) 28%, transparent));
    }
  }
  /* HOLD: mood color ring brighter/duller once per second */
  @keyframes breathe-hold-ring-pulse {
    0%, 100% {
      filter: brightness(0.7) drop-shadow(0 0 4px color-mix(in srgb, var(--mood-color) 28%, transparent)) drop-shadow(0 0 2px color-mix(in srgb, var(--mood-color) 16%, transparent));
    }
    50% {
      filter: brightness(1.14) drop-shadow(0 0 18px color-mix(in srgb, var(--mood-color) 78%, transparent)) drop-shadow(0 0 6px color-mix(in srgb, var(--mood-color) 46%, transparent));
    }
  }
  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 8px color-mix(in srgb, var(--mood-color) 40%, transparent)) drop-shadow(0 0 3px color-mix(in srgb, var(--mood-color) 22%, transparent));
    }
    50% {
      filter: drop-shadow(0 0 22px color-mix(in srgb, var(--mood-color) 72%, transparent)) drop-shadow(0 0 10px color-mix(in srgb, var(--mood-color) 48%, transparent));
    }
  }
  /* JS drives inner-ring scale; steady glow on peak — except HOLD (ring pulses via breathe-hold-ring-pulse) */
  .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
    animation: none !important;
    transition: none !important;
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--mood-color) 32%, transparent)) drop-shadow(0 0 3px color-mix(in srgb, var(--mood-color) 16%, transparent)) !important;
  }
  /* Interval: glow on guide-ring progress stroke (r=140, same as dull outline) */
  .timer-view-body .timer-interval-ring-wrap[data-interval-glow="peak"] .timer-interval-guide-progress {
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--mood-color) 32%, transparent)) drop-shadow(0 0 3px color-mix(in srgb, var(--mood-color) 16%, transparent));
  }
  .timer-view-body .timer-breathe-hold .timer-breathe-glow {
    animation: none !important;
    will-change: auto;
    opacity: 0.34;
    filter: blur(3px) brightness(1);
  }
  @media (prefers-reduced-motion: no-preference) {
    .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"] .timer-breathe-hold .timer-breathe-ring {
      animation: breathe-hold-ring-pulse 1s ease-in-out infinite !important;
      transform: scale(1) !important;
      transition: none !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-breathe-hold .timer-breathe-glow,
    .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"] .timer-breathe-hold .timer-breathe-ring {
      animation: none !important;
    }
    .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"] .timer-breathe-hold .timer-breathe-ring {
      filter: brightness(0.95) drop-shadow(0 0 10px color-mix(in srgb, var(--mood-color) 48%, transparent)) drop-shadow(0 0 3px color-mix(in srgb, var(--mood-color) 28%, transparent)) !important;
    }
  }
  /* Work/Rest/Rounds/Cycles (INTERVAL + BREATHE): unboxed ±, 44px tap target */
  .timer-view-body .timer-glass-stepper.timer-interval-stepper,
  .timer-view-body .timer-interval-stepper {
    flex-shrink: 0;
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    padding: 0;
    margin: 0;
    border: none !important;
    border-radius: 50%;
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    outline: none;
    color: color-mix(in srgb, var(--mood-accent, var(--mood-color)) 45%, transparent) !important;
    -webkit-text-fill-color: color-mix(in srgb, var(--mood-accent, var(--mood-color)) 45%, transparent) !important;
    font-size: 20px !important;
    font-weight: 500;
    line-height: 1;
    font-family: var(--font-ui), system-ui, sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: color 0.15s ease, transform 0.12s ease, opacity 0.15s ease;
  }
  .timer-view-body .timer-interval-stepper:focus,
  .timer-view-body .timer-interval-stepper:focus-visible {
    outline: none;
    box-shadow: none;
  }
  .timer-view-body .timer-interval-stepper:active {
    color: var(--mood-accent, var(--mood-color)) !important;
    -webkit-text-fill-color: var(--mood-accent, var(--mood-color)) !important;
    transform: scale(0.92);
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-interval-stepper {
      transition: color 0.15s ease, opacity 0.15s ease;
    }
    .timer-view-body .timer-interval-stepper:active {
      transform: none;
    }
  }
  /* Interval / Breathe ring: Total Movement Time surface (circular disc behind SVG) */
  .timer-view-body .timer-interval-ring-wrap.axis-surface-tmt,
  .timer-view-body .timer-breathe-ring-wrap.axis-surface-tmt {
    border-radius: 50%;
    overflow: hidden;
    box-sizing: border-box;
    background:
      linear-gradient(180deg,
      color-mix(in srgb, var(--mood-color) 22%, transparent) 0%,
      color-mix(in srgb, var(--mood-color) 12%, transparent) 28%,
      transparent 72%),
      color-mix(in srgb, var(--glass-bg) 92%, #121822);
    border: 1px solid color-mix(in srgb, var(--mood-color) 28%, var(--glass-border));
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.055);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  /* Let mood drop-shadow on the progress stroke extend past the disc (default overflow:hidden clips it). */
  .timer-view-body .timer-interval-ring-wrap.axis-surface-tmt[data-interval-glow="peak"] {
    overflow: visible;
  }
  /* Work/Rest in same row as BREATHE pattern pills (timer-pattern-row); Rounds row matches Cycles row */
  .timer-view-body .timer-pattern-row.timer-interval-work-rest-slot {
    align-items: flex-start;
  }
  .timer-view-body .timer-pattern-row.timer-interval-work-rest-slot .timer-interval-row {
    flex: 1 1 0;
    min-width: 0;
    max-width: calc(50% - 6px);
  }
  /* Work/Rest/Rounds: minimal strip — no outer glass card; −/+ steppers keep glass styling */
  .timer-view-body .timer-glass-panel.timer-interval-rows {
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-radius: 0;
    overflow: visible;
  }
  .timer-view-body .timer-interval-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    min-width: 0;
    min-height: 0;
    padding: 5px 5px 7px;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    box-sizing: border-box;
    transition: color 0.2s ease;
  }
  .timer-view-body .timer-interval-row-label {
    flex: 0 0 auto;
    width: 100%;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(246, 247, 248, 0.38);
    font-family: var(--font-display);
  }
  .timer-view-body .timer-interval-row-value .timer-instrument-val {
    font-size: var(--text-base);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: rgba(246, 247, 248, 0.9);
    text-shadow: none;
  }
  .timer-view-body .timer-instrument-val {
    font-size: var(--text-lg);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-white);
    font-family: var(--font-display);
    text-shadow:
      0 0 20px color-mix(in srgb, var(--mood-accent) 32%, transparent),
      0 0 2px rgba(246, 247, 248, 0.12);
  }
  .timer-view-body .timer-round-pips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
  }
  .timer-view-body .timer-round-pip {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-sizing: border-box;
    flex-shrink: 0;
    border: none;
    background: rgba(255, 255, 255, 0.18);
    transition: background 0.3s ease, transform 0.3s ease;
  }
  .timer-view-body .timer-round-pip.is-done {
    background: var(--mood-accent);
    box-shadow: none;
  }
  .timer-view-body .timer-round-pip.is-active {
    background: var(--mood-accent);
    box-shadow: none;
    transform: scale(1.15);
  }
  .timer-view-body .timer-breathe-cycle-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0;
    border-radius: 0;
    border: none;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    box-sizing: border-box;
  }
  .timer-view-body .timer-interval-row-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
  }
  .timer-view-body .timer-interval-row-value {
    min-width: 36px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .timer-view-body .timer-pattern-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 12px;
    justify-content: center;
    margin-bottom: 12px;
  }
  .timer-view-body .timer-pattern-row .timer-glass-pattern-btn {
    min-height: 40px;
    padding: 10px 18px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .timer-view-body .timer-breathe-idle-column,
  .timer-view-body .timer-interval-idle-column {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    transform: none;
  }
  .timer-view-body .timer-breathe-idle-top,
  .timer-view-body .timer-interval-idle-top {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-cycles-slot,
  .timer-view-body .timer-interval-rounds-slot {
    flex: 1 1 auto;
    min-height: 52px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-idle-column .timer-cta-row,
  .timer-view-body .timer-interval-idle-column .timer-cta-row {
    flex-shrink: 0;
    width: 100%;
  }
  .timer-view-body .timer-breathe-active-column {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-active-mid {
    flex-shrink: 0;
    width: 100%;
    transform: none;
  }
  .timer-view-body .timer-breathe-session-mid {
    flex-shrink: 0;
    width: 100%;
    min-height: 92px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-active-footer,
  .timer-view-body .timer-breathe-session-footer {
    flex: 1 1 auto;
    min-height: 48px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 4px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-active-footer .timer-cta-row {
    flex-shrink: 0;
    width: 100%;
  }
  .timer-view-body .timer-breathe-hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4;
    pointer-events: none;
  }
  .timer-view-body .timer-breathe-countdown-digit {
    font-weight: 600;
    font-family: var(--font-data);
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    color: var(--text-white);
    transition: opacity 0.15s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-breathe-countdown-digit {
      transition: none;
    }
  }
  .timer-view-body .timer-breathe-active-digit {
    font-family: var(--font-data);
    font-weight: 700;
    font-size: 80px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    color: var(--text-primary);
    transition: none;
  }
  .timer-view-body .timer-breathe-phase-label {
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-family: var(--font-display);
    line-height: 1.25;
  }
  .timer-view-body .timer-breathe-prep-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dimmer);
    font-family: var(--font-display);
  }
  .timer-view-body .timer-breathe-cycle-text {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-dimmer);
    font-family: var(--font-display);
    text-align: center;
  }
  [data-theme="light"] .timer-view-body .timer-breathe-countdown-digit {
    color: #1D1D1F;
  }
  [data-night="true"] .timer-view-body .timer-breathe-countdown-digit {
    color: #FF3B30;
  }
  .timer-view-body .timer-breathe-pattern-cards-wrap {
    flex-shrink: 0;
    position: relative;
    width: 100vw;
    max-width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-pattern-cards-scroll {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: max(20px, calc((100% - 215px) / 2));
    scrollbar-width: none;
    padding: 8px 20px 8px;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-pattern-cards-scroll::-webkit-scrollbar {
    display: none;
  }
  .timer-view-body .timer-breathe-pattern-card {
    flex: 0 0 215px;
    width: 215px;
    height: 156px;
    min-height: 156px;
    max-height: 156px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    border-radius: 14px;
    padding: 12px;
    box-sizing: border-box;
    text-align: left;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: none;
    background: rgba(255, 255, 255, 0.04);
    overflow: visible;
    transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    font: inherit;
    color: inherit;
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-breathe-pattern-card {
      transition: none;
    }
  }
  .timer-view-body .timer-breathe-pattern-card.is-active {
    background: color-mix(in srgb, var(--mood-accent) 9%, transparent);
    border-color: color-mix(in srgb, var(--mood-accent) 38%, transparent);
  }
  .timer-view-body .timer-breathe-pattern-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 0;
    height: 28px;
    min-height: 28px;
    max-height: 28px;
    flex-shrink: 0;
    overflow: hidden;
  }
  .timer-view-body .timer-breathe-pattern-card-name {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text-primary);
    font-family: var(--font-display);
  }
  .timer-view-body .timer-breathe-pattern-card.is-active .timer-breathe-pattern-card-name {
    color: var(--mood-accent);
  }
  .timer-view-body .timer-breathe-pattern-card-intent {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-family: var(--font-display);
    flex: 0 0 auto;
    padding-top: 2px;
    text-align: right;
  }
  .timer-view-body .timer-breathe-pattern-card.is-active .timer-breathe-pattern-card-intent {
    color: var(--mood-accent);
  }
  .app .timer-view-body .timer-breathe-pattern-card-desc {
    flex: 1 1 auto;
    min-height: 0;
    font-size: 10px !important;
    line-height: 1.55 !important;
    font-weight: 400 !important;
    color: var(--text-dimmer) !important;
    font-family: var(--font-ui), system-ui, sans-serif !important;
    margin: 0 !important;
    letter-spacing: 0.01em;
    overflow: visible;
    text-wrap: wrap;
    hyphens: none !important;
    -webkit-hyphens: none !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
    word-wrap: normal !important;
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
  }
  .timer-view-body .timer-breathe-pattern-card-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
    min-height: 8px;
  }
  /* BREATHE idle: INTERVAL-style hero timer; pattern cards swipe in front with slight overlap */
  .timer-view-body .timer-breathe-content--idle {
    overflow: visible;
  }
  .timer-view-body .timer-breathe-content--idle .timer-ring-slot,
  .timer-view-body .timer-breathe-content--idle .timer-breathe-ring-wrap {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    margin-top: 4px;
    margin-bottom: 0 !important;
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-idle-column {
    position: relative;
    z-index: 20;
    margin-top: 0 !important;
    padding-bottom: 16px;
    transform: none;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-cards-wrap {
    position: relative;
    z-index: 21;
    margin-top: -26px;
    overflow: visible;
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-cards-scroll {
    padding-top: 6px;
    overflow-y: visible;
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card {
    position: relative;
    z-index: 1;
    background: color-mix(in srgb, var(--bg-card, #121822) 94%, rgba(255, 255, 255, 0.06));
    backdrop-filter: blur(14px) saturate(1.2);
    -webkit-backdrop-filter: blur(14px) saturate(1.2);
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card.is-active {
    background: color-mix(in srgb, var(--mood-accent) 16%, var(--bg-card, #121822) 84%);
    border-color: color-mix(in srgb, var(--mood-accent) 42%, transparent);
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card-dots {
    margin-top: 10px;
    margin-bottom: 12px;
  }
  [data-theme="light"] .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card {
    background: color-mix(in srgb, #ffffff 92%, rgba(0, 0, 0, 0.04));
  }
  [data-theme="light"] .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card.is-active {
    background: color-mix(in srgb, var(--mood-accent) 12%, #ffffff 88%);
  }
  [data-night="true"] .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card {
    background: color-mix(in srgb, #140303 94%, rgba(255, 59, 48, 0.08));
  }
  [data-night="true"] .timer-view-body .timer-breathe-content--idle .timer-breathe-pattern-card.is-active {
    background: color-mix(in srgb, #FF3B30 14%, #140303 86%);
    border-color: rgba(255, 59, 48, 0.45);
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-cycles-slot {
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;
  }
  .timer-view-body .timer-breathe-content--idle .timer-breathe-start-row {
    margin-top: 14px;
    margin-bottom: 0;
  }
  .app .timer-view-body .timer-breathe-pattern-card-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    min-width: 5px;
    min-height: 5px;
    padding: 0 !important;
    margin: 0;
    border: 0 !important;
    outline: 0 !important;
    outline-offset: 0 !important;
    box-shadow: none !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    background-color: color-mix(in srgb, var(--mood-accent) 32%, transparent) !important;
    background-image: none !important;
    border-radius: 999px;
    flex-shrink: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    box-sizing: border-box;
    line-height: 0;
    font-size: 0;
    color: transparent;
    transition: width 0.22s ease, background-color 0.22s ease;
  }
  .app .timer-view-body .timer-breathe-pattern-card-dot:focus,
  .app .timer-view-body .timer-breathe-pattern-card-dot:focus-visible,
  .app .timer-view-body .timer-breathe-pattern-card-dot:active {
    outline: none !important;
    outline-offset: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .app .timer-view-body .timer-breathe-pattern-card-dot {
      transition: none;
    }
  }
  .app .timer-view-body .timer-breathe-pattern-card-dot.is-active {
    width: 14px;
    min-width: 14px;
    background-color: var(--mood-accent) !important;
  }
  [data-theme="light"] .timer-view-body .timer-breathe-pattern-card {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }
  .timer-view-body .timer-breathe-cycles-row {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .timer-view-body .timer-breathe-cycles-row .timer-interval-row-value {
    min-width: 28px;
  }
  .timer-view-body .timer-breathe-cycles-row .timer-instrument-val {
    font-size: 15px;
  }
  .timer-view-body .timer-breathe-cycle-chip .timer-round-pip {
    width: 6px;
    height: 6px;
    transition: background 0.3s ease, transform 0.3s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .timer-view-body .timer-breathe-cycle-chip .timer-round-pip {
      transition: none;
    }
  }
  /* BREATHE: no clockwise crawl on guide ring (INTERVAL only uses stroke-dashoffset progress) */
  .timer-view-body .timer-breathe-content .timer-breathe-phase-progress,
  .timer-view-body .timer-breathe-content .timer-interval-guide-progress {
    display: none !important;
    visibility: hidden !important;
    stroke: none !important;
    pointer-events: none !important;
  }
  .timer-view-body .timer-breathe-guide-ring circle:not(.timer-interval-guide-progress) {
    stroke: var(--border);
  }
  .timer-view-body .timer-breathe-guide-ring .timer-breathe-guide-outline {
    stroke-opacity: 0.5;
  }
  [data-theme="light"] .timer-view-body .timer-mode-outer-pill {
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.04);
    backdrop-filter: blur(24px) saturate(1.35);
    -webkit-backdrop-filter: blur(24px) saturate(1.35);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
  }
  [data-theme="light"] .timer-view-body .timer-hero-stage.timer-interval-ring-wrap,
  [data-theme="light"] .timer-view-body .timer-hero-stage.timer-breathe-ring-wrap {
    background: linear-gradient(165deg, color-mix(in srgb, var(--mood-color) 10%, #ffffff) 0%, #f2f6fb 42%, #e8eef6 100%);
    border: 1px solid color-mix(in srgb, var(--mood-color) 22%, rgba(15, 30, 46, 0.12));
    box-shadow: 0 22px 50px rgba(15, 30, 46, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }
  [data-theme="light"] .timer-view-body .timer-glass-panel {
    border: 1px solid rgba(0,0,0,0.1);
    background: #FFFFFF;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 16px 40px rgba(0,0,0,0.04);
    backdrop-filter: blur(24px) saturate(1.35);
    -webkit-backdrop-filter: blur(24px) saturate(1.35);
  }
  [data-theme="light"] .timer-view-body .timer-glass-panel.timer-interval-rows {
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  [data-theme="light"] .timer-view-body .timer-interval-ring-wrap.axis-surface-tmt,
  [data-theme="light"] .timer-view-body .timer-breathe-ring-wrap.axis-surface-tmt {
    background:
      linear-gradient(180deg,
      color-mix(in srgb, var(--mood-color) 20%, transparent) 0%,
      color-mix(in srgb, var(--mood-color) 10%, transparent) 28%,
      transparent 72%),
      color-mix(in srgb, var(--glass-bg) 96%, #eef2f7);
    border: 1px solid color-mix(in srgb, var(--mood-color) 28%, rgba(15, 30, 46, 0.12));
    box-shadow: 0 12px 34px rgba(15, 30, 46, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  [data-theme="light"] .timer-view-body .timer-interval-row-label {
    color: rgba(15,30,46,0.55);
  }
  [data-theme="light"] .timer-view-body .timer-instrument-val {
    color: #1D1D1F;
    text-shadow: none;
  }
  [data-theme="light"] .timer-view-body .timer-interval-row-value .timer-instrument-val {
    color: rgba(15, 30, 46, 0.72);
  }
  [data-theme="light"] .timer-view-body .timer-interval-stepper {
    background: transparent !important;
    border: none !important;
    color: color-mix(in srgb, var(--mood-accent, var(--mood-color)) 50%, transparent) !important;
    -webkit-text-fill-color: color-mix(in srgb, var(--mood-accent, var(--mood-color)) 50%, transparent) !important;
  }
  [data-theme="light"] .timer-view-body .timer-interval-stepper:active {
    color: var(--mood-accent, var(--mood-color)) !important;
    -webkit-text-fill-color: var(--mood-accent, var(--mood-color)) !important;
  }
  [data-theme="light"] .timer-view-body .timer-glass-btn-ghost {
    color: rgba(15, 30, 46, 0.6);
    -webkit-text-fill-color: rgba(15, 30, 46, 0.6);
    border: 1px solid rgba(15, 30, 46, 0.12);
    background: rgba(15, 30, 46, 0.07);
  }
  [data-theme="light"] .timer-view-body .timer-glass-pattern-btn:not(.active) {
    background: rgba(15, 30, 46, 0.06);
    border: 1px solid rgba(15, 30, 46, 0.1);
    color: rgba(15, 30, 46, 0.45);
    box-shadow: none;
  }
  [data-theme="light"] .timer-view-body .timer-glass-pattern-btn.active {
    background: color-mix(in srgb, var(--mood-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--mood-color) 60%, transparent);
    color: var(--mood-color);
  }
  [data-theme="light"] .timer-view-body .timer-breathe-cycle-chip {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  [data-theme="light"] .timer-view-body .timer-round-pip {
    border: none;
    background: rgba(0,0,0,0.12);
  }
  [data-theme="light"] .timer-view-body .timer-round-pip.is-done,
  [data-theme="light"] .timer-view-body .timer-round-pip.is-active {
    background: var(--mood-accent);
  }
  [data-theme="light"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="soft"] .timer-breathe-ring,
  [data-theme="light"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
    filter: none;
    animation: none;
  }
  [data-theme="light"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"] .timer-breathe-hold .timer-breathe-ring {
    animation: breathe-hold-ring-pulse 1s ease-in-out infinite !important;
  }
  [data-theme="light"] .timer-view-body .timer-interval-ring-wrap[data-interval-glow="peak"] .timer-interval-guide-progress {
    filter: drop-shadow(0 0 12px color-mix(in srgb, var(--mood-accent, var(--mood-color)) 42%, transparent)) drop-shadow(0 0 4px color-mix(in srgb, var(--mood-color) 22%, transparent));
    animation: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .timer-view-body .timer-interval-ring-wrap .timer-interval-guide-progress {
      will-change: stroke-dashoffset;
      transition: stroke-dashoffset 0.14s linear, stroke 0.45s ease;
    }
    .timer-view-body .timer-interval-ring-wrap .timer-interval-guide-progress.timer-ring--snap {
      transition: stroke-dashoffset 0s linear, stroke 0s !important;
    }
  }
  `;

  const timerNightCss = nightMode ? `
  [data-night="true"] .timer-view-body .timer-hero-stage.timer-interval-ring-wrap,
  [data-night="true"] .timer-view-body .timer-hero-stage.timer-breathe-ring-wrap {
    background: linear-gradient(180deg, rgba(255, 59, 48, 0.14) 0%, #0a0000 55%, #000000 100%) !important;
    border: 1px solid rgba(255, 59, 48, 0.55) !important;
    box-shadow: 0 0 0 1px rgba(255, 59, 48, 0.12), 0 24px 56px rgba(0, 0, 0, 0.65) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-glass-panel,
  [data-night="true"] .timer-view-body .timer-glass-pattern-btn {
    background: #000000 !important;
    border: 1px solid #FF3B30 !important;
    border-color: #FF3B30 !important;
    border-top-color: #FF3B30 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-cycle-chip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-glass-panel.timer-interval-rows {
    background: transparent !important;
    border: none !important;
    border-top: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-glass-pattern-btn.active {
    background: #000000 !important;
    color: #FF3B30 !important;
    border: 1px solid #FF3B30 !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-row-label { color: #FF3B30 !important; }
  [data-night="true"] .timer-view-body .timer-instrument-val {
    color: #FF3B30 !important;
    text-shadow: none !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-row-value span:last-child { color: rgba(255, 59, 48, 0.78) !important; }
  [data-night="true"] .timer-view-body .timer-interval-stepper {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: color-mix(in srgb, #FF3B30 50%, transparent) !important;
    -webkit-text-fill-color: color-mix(in srgb, #FF3B30 50%, transparent) !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-stepper:active {
    color: #FF3B30 !important;
    -webkit-text-fill-color: #FF3B30 !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-ring-wrap.axis-surface-tmt,
  [data-night="true"] .timer-view-body .timer-breathe-ring-wrap.axis-surface-tmt {
    background:
      linear-gradient(180deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 59, 48, 0.12) 28%, transparent 72%),
      #140303 !important;
    border: 1px solid rgba(255, 59, 48, 0.48) !important;
    box-shadow: 0 0 0 1px rgba(255, 59, 48, 0.12), 0 16px 40px rgba(0, 0, 0, 0.55) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-round-pip {
    background: rgba(255, 59, 48, 0.35) !important;
    border: 1px solid rgba(255, 59, 48, 0.65) !important;
  }
  [data-night="true"] .timer-view-body .timer-round-pip.is-done,
  [data-night="true"] .timer-view-body .timer-round-pip.is-active {
    background: #FF3B30 !important;
    border-color: #FF3B30 !important;
    box-shadow: none !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-pattern-card {
    background: rgba(255, 59, 48, 0.06) !important;
    border-color: rgba(255, 59, 48, 0.22) !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-pattern-card.is-active {
    background: color-mix(in srgb, #FF3B30 12%, transparent) !important;
    border-color: rgba(255, 59, 48, 0.45) !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-pattern-card.is-active .timer-breathe-pattern-card-name,
  [data-night="true"] .timer-view-body .timer-breathe-pattern-card.is-active .timer-breathe-pattern-card-intent {
    color: #FF3B30 !important;
  }
  [data-night="true"] .app .timer-view-body .timer-breathe-pattern-card-dot {
    background-color: color-mix(in srgb, #FF3B30 32%, transparent) !important;
  }
  [data-night="true"] .app .timer-view-body .timer-breathe-pattern-card-dot.is-active {
    background-color: #FF3B30 !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-active-digit {
    color: #FF3B30 !important;
  }
  /* Ultra: steady peak ring — HOLD uses breathe-hold-ring-pulse on mood ring */
  [data-night="true"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
    animation: none !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"] .timer-breathe-hold .timer-breathe-ring {
    animation: breathe-hold-ring-pulse 1s ease-in-out infinite !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-orb,
  [data-night="true"] .timer-view-body .timer-breathe-orb-soft { display: none !important; }
  [data-night="true"] .timer-view-body .timer-breathe-glow {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    filter: none !important;
    pointer-events: none !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="soft"] .timer-breathe-ring,
  [data-night="true"] .timer-view-body .timer-breathe-ring-wrap[data-breathe-glow="peak"]:not(:has(.timer-breathe-hold)) .timer-breathe-ring {
    filter: none !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-ring-wrap[data-interval-glow="peak"] .timer-interval-guide-progress {
    filter: drop-shadow(0 0 14px rgba(255, 59, 48, 0.55)) drop-shadow(0 0 5px rgba(255, 59, 48, 0.38)) !important;
  }
  [data-night="true"] .timer-view-body .timer-glass-btn-ghost {
    color: #FF3B30 !important;
    border-color: #FF3B30 !important;
    background: #000000 !important;
  }
  [data-night="true"] .timer-view-body .timer-interval-row-value span:last-child {
    color: #FF3B30 !important;
  }
  [data-night="true"] .timer-view-body .timer-breathe-guide-ring .timer-interval-guide-progress {
    stroke-width: 2.5 !important;
    stroke-opacity: 1 !important;
  }
  ` : "";

  const renderIntervalSettingRow = ({ label, val, set, min, max, step, isRound }) => /*#__PURE__*/
  React.createElement("div", { key: label, className: "timer-interval-row" }, /*#__PURE__*/
  React.createElement("span", { className: "timer-interval-row-label" }, label), /*#__PURE__*/
  React.createElement("div", { className: "timer-interval-row-controls" }, /*#__PURE__*/
  React.createElement("button", { type: "button", "aria-label": `${label} decrease`, onClick: () => {axisHapticTick();set((v) => Math.max(min, v - step));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2212"), /*#__PURE__*/
  React.createElement("div", { className: "timer-interval-row-value", style: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 } }, /*#__PURE__*/
  React.createElement("span", { className: "timer-instrument-val" }, val),
  !isRound && /*#__PURE__*/React.createElement("span", { style: { fontSize: "var(--text-xs)", color: "var(--text-dimmer)", fontFamily: "var(--font-display)" } }, "s")
  ), /*#__PURE__*/
  React.createElement("button", { type: "button", "aria-label": `${label} increase`, onClick: () => {axisHapticTick();set((v) => Math.min(max, v + step));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
  ));

  const timerRootStyle = {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
    boxSizing: "border-box",
    ...timerMoodStyle
  };
  return (/*#__PURE__*/
    React.createElement("div", { className: "app app--timer-tab", "data-theme": theme, "data-night": nightMode ? "true" : "false", style: timerRootStyle }, /*#__PURE__*/
    React.createElement("style", null, timerFlatCss + timerNightCss), /*#__PURE__*/
    React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/

    React.createElement("div", { className: "app-body axis-app-scroll-root axis-app-scroll-root--timer" }, /*#__PURE__*/
    dashboardHeader,
    React.createElement("div", { className: "timer-view-body" }, /*#__PURE__*/

    React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 380, flex: 1, minHeight: 0 } }, /*#__PURE__*/
    React.createElement("div", { style: { flexShrink: 0, height: TIMER_TOGGLE_SPACER_TOP, width: "100%" }, "aria-hidden": true }), /*#__PURE__*/
    React.createElement("div", { className: "timer-mode-outer-pill timer-glass-wrap axis-seg-toggle-wrap", role: "tablist", "aria-label": "Timer mode", style: TIMER_TOGGLE_WRAP },
    ["interval", "breathe"].map((m) => /*#__PURE__*/
    React.createElement("button", { key: m, type: "button", role: "tab", "aria-selected": mode === m ? "true" : "false", className: "timer-glass-toggle-btn" + (mode === m ? " active" : ""), onClick: () => {axisHapticTick();switchMode(m);} }, m === "interval" ? "INTERVAL" : "BREATHE")
    )
    ),


    mode === "interval" && /*#__PURE__*/
    React.createElement("div", { className: "timer-interval-content", style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", width: "100%", maxWidth: 380, alignSelf: "center", flex: 1, minHeight: 0, boxSizing: "border-box" } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-glass-orb timer-ring-slot timer-interval-ring-wrap axis-surface-tmt timer-hero-stage", style: TIMER_RING_WRAP, "data-interval-glow": iRunning && (iPhase === "work" || iPhase === "rest") ? "peak" : undefined }, /*#__PURE__*/
    React.createElement("svg", { width: ringSize, height: ringSize, viewBox: "0 0 320 320", style: { position: "absolute", top: 0, left: 0 }, className: "timer-breathe-guide-ring" }, /*#__PURE__*/
    !isDark && React.createElement("defs", null,
      React.createElement("radialGradient", { id: "timerIntervalGrad", cx: "50%", cy: "50%", r: "50%" },
        React.createElement("stop", { offset: "0%", stopColor: breatheAccent, stopOpacity: "0.08" }),
        React.createElement("stop", { offset: "70%", stopColor: "rgba(255,255,255,0)" })
      )
    ),
    !isDark && React.createElement("circle", { cx: "160", cy: "160", r: "140", fill: "url(#timerIntervalGrad)" }),
    React.createElement("circle", { className: "timer-breathe-guide-outline", cx: "160", cy: "160", r: "140", fill: "none", stroke: nightMode ? "#FF3B30" : isDark ? "var(--border)" : "#EEEEEE", strokeWidth: nightMode || isDark ? "2.5" : "3" }),
    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/React.createElement("g", { transform: "rotate(-90 160 160)" }, /*#__PURE__*/
    React.createElement("circle", { className: "timer-interval-guide-progress" + (intervalRingSnap ? " timer-ring--snap" : ""), cx: "160", cy: "160", r: "140", fill: "none",
      stroke: iRingColor, strokeWidth: nightMode || isDark ? "2.5" : "3.4", strokeLinecap: "round",
      strokeDasharray: iGuideDashArray,
      strokeDashoffset: iGuideDashOffset,
      style: { transition: "stroke 0.3s ease" } }
    ))
    ),

    React.createElement("div", { style: { position: "absolute", left: 0, top: 0, width: ringSize, height: ringSize, pointerEvents: "none" } }, /*#__PURE__*/

    React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" } },
    iPhase === "idle" && /*#__PURE__*/
    React.createElement("div", { key: "interval-idle-" + work, style: intervalDigitStyle }, formatSecondsOnly(work)),

    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/
    React.createElement("div", { key: "interval-" + iPhase + "-" + iTime, style: { ...intervalDigitStyle, transition: "none" } }, formatSecondsOnly(iTime)),

    iPhase === "done" && /*#__PURE__*/
    React.createElement("div", { style: TIMER_HERO_READY_STYLE }, "Done")

    )

    )
    )
    , /*#__PURE__*/
    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/
    React.createElement("div", { className: "timer-active-mid-band timer-secondary-block", style: { flexShrink: 0, marginTop: TIMER_IDLE_VERTICAL_GAP, minHeight: TIMER_MID_IDLE_HEIGHT, boxSizing: "border-box" } },
    React.createElement("div", { className: "timer-glass-phase", style: { flexShrink: 0, width: "100%", textAlign: "center", padding: "10px 20px 12px", marginTop: 0, boxSizing: "border-box", minHeight: TIMER_PHASE_BAND, display: "flex", alignItems: "center", justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { style: {
        fontSize: "var(--text-xl)",
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: nightMode ? "#FF3B30" : isDark ? "var(--app-white)" : "#1D1D1F",
        opacity: 1,
        fontFamily: "var(--font-display)",
        transition: "none",
        lineHeight: 1.25
      } }, iPhase === "rest" ? "Rest" : "Work")
    ),
    React.createElement("div", { style: { display: "flex", width: "100%", maxWidth: 360, marginLeft: "auto", marginRight: "auto", justifyContent: "center", marginTop: 0, marginBottom: 0, boxSizing: "border-box" } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-cycle-chip", role: "group", "aria-label": `Round ${iRound} of ${rounds}` }, /*#__PURE__*/
    React.createElement("div", { className: "timer-round-pips" }, Array.from({ length: rounds }, (_, i) => {
      const activeIdx = iRound - 1;
      const done = (iPhase === "work" || iPhase === "rest") && i < iRound - 1;
      const active = i === activeIdx;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "timer-round-pip" + (done ? " is-done" : "") + (active ? " is-active" : ""),
        "aria-hidden": true
      });
    }))
    ))
    )
    , /*#__PURE__*/


    iPhase === "idle" && /*#__PURE__*/React.createElement("div", { className: "timer-secondary-block timer-interval-idle-column", style: { flex: 1, minHeight: 0, width: "100%", marginTop: TIMER_IDLE_VERTICAL_GAP, marginBottom: 0, boxSizing: "border-box" } },
    React.createElement("div", { className: "timer-interval-idle-top" },
    React.createElement("div", { className: "timer-pattern-row timer-interval-work-rest-slot", style: { width: "100%", maxWidth: 360 } },
    renderIntervalSettingRow({ label: "Work", val: work, set: setWork, min: 5, max: 300, step: 5, isRound: false }),
    renderIntervalSettingRow({ label: "Rest", val: rest, set: setRest, min: 0, max: 120, step: 5, isRound: false })
    )
    ),
    React.createElement("div", { className: "timer-interval-rounds-slot" },
    React.createElement("div", { className: "timer-breathe-cycles-row", style: { width: "100%", maxWidth: 360 } }, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dimmer)", fontFamily: "var(--font-display)", marginRight: 6 } }, "Rounds"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /*#__PURE__*/
    React.createElement("button", { type: "button", "aria-label": "Rounds decrease", onClick: () => {axisHapticTick();setRounds((v) => Math.max(1, v - 1));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "−"), /*#__PURE__*/
    React.createElement("div", { className: "timer-interval-row-value", style: { textAlign: "center", fontVariantNumeric: "tabular-nums" } }, /*#__PURE__*/React.createElement("span", { className: "timer-instrument-val" }, rounds)), /*#__PURE__*/
    React.createElement("button", { type: "button", "aria-label": "Rounds increase", onClick: () => {axisHapticTick();setRounds((v) => Math.min(20, v + 1));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
    )
    )
    )
    ),
    React.createElement("div", { className: "timer-cta-row timer-interval-start-row", style: TIMER_BTN_ROW_BREATHE_IDLE },
    /*#__PURE__*/React.createElement("button", { type: "button", onClick: () => {primeAudio();iStart();}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta timer-session-primary-cta", style: BTN }, "Start")
    )
    )
    , /*#__PURE__*/

    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/React.createElement("div", { className: "timer-interval-active-footer" },
    React.createElement("div", { style: TIMER_BTN_SPACER_ABOVE, "aria-hidden": true }),
    React.createElement("div", { className: "timer-cta-row timer-interval-active-cta", style: TIMER_BTN_ROW_IDLE }, /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {axisHapticTick();setIRunning((r) => !r);}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta", style: BTN }, iRunning ? "Pause" : "Resume"), /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {axisHapticTick();iReset();}, className: "timer-glass-btn-ghost", style: BTN_GHOST }, "Reset")
    )
    ),
    iPhase === "done" && /*#__PURE__*/
    React.createElement("div", { style: { flexShrink: 0, width: "100%", minHeight: TIMER_PHASE_BAND, boxSizing: "border-box" }, "aria-hidden": true }),
    iPhase === "done" && /*#__PURE__*/React.createElement("div", { style: TIMER_BTN_SPACER_ABOVE, "aria-hidden": true }),
    iPhase === "done" && /*#__PURE__*/React.createElement("div", { className: "timer-cta-row", style: TIMER_BTN_ROW_IDLE }, /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);iReset();}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta timer-session-primary-cta", style: BTN }, "Again")
    ), /*#__PURE__*/
    React.createElement("div", { style: TIMER_BTN_SPACER_BELOW_INTERVAL_IDLE, "aria-hidden": true })
    ),

    mode === "breathe" && /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-content timer-breathe-content--" + breatheUiState, "data-breathe-state": breatheUiState, style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", width: "100%", maxWidth: 380, alignSelf: "center", flex: 1, minHeight: 0, boxSizing: "border-box" } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-glass-orb timer-breathe-ring-wrap timer-ring-slot axis-surface-tmt timer-hero-stage", style: TIMER_RING_WRAP, "data-breathe-glow": breatheUiState === "active" ? "peak" : undefined }, /*#__PURE__*/
    React.createElement("svg", { width: ringSize, height: ringSize, viewBox: "0 0 320 320", style: { position: "absolute", top: 0, left: 0 }, className: "timer-breathe-guide-ring" }, /*#__PURE__*/
    !isDark && React.createElement("defs", null,
      React.createElement("radialGradient", { id: "timerBreatheGrad", cx: "50%", cy: "50%", r: "50%" },
        React.createElement("stop", { offset: "0%", stopColor: breatheAccent, stopOpacity: "0.08" }),
        React.createElement("stop", { offset: "70%", stopColor: "rgba(255,255,255,0)" })
      )
    ),
    !isDark && React.createElement("circle", { cx: "160", cy: "160", r: "140", fill: "url(#timerBreatheGrad)" }),
    React.createElement("circle", { className: "timer-breathe-guide-outline", cx: "160", cy: "160", r: "140", fill: "none", stroke: nightMode ? "#FF3B30" : isDark ? "var(--border)" : "#EEEEEE", strokeWidth: nightMode || isDark ? "2.5" : "3" })
    ),
    breatheUiState === "active" && /*#__PURE__*/
    React.createElement("div", { className: isHoldPhase ? "timer-breathe-hold" : "", style: {
        position: "absolute", left: breatheInset, top: breatheInset, width: 306, height: 306, borderRadius: "50%", overflow: "visible", pointerEvents: "none",
        // scale max: accent stroke outer edge = guide stroke outer edge (see breatheMaxScale)
        transform: `translateZ(0) scale(${breatheScaleDisplay})`,
        transformOrigin: "center center",
        transition: !bRunning && !bPaused ? "transform 0.6s ease" : "none",
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden"
      } }, /*#__PURE__*/

    breatheUiState === "active" && !nightMode && /*#__PURE__*/ React.createElement("svg", { className: "timer-breathe-glow", width: "306", height: "306", viewBox: "0 0 320 320", style: { position: "absolute", left: 0, top: 0, transform: "scale(1)", opacity: isDark ? Math.max(orbOpacity || 0, 0.18) : 0, ['--breathe-fade']: `${breatheFadeDuration}s`, ['--breathe-opacity-dur']: breatheOpacityDuration } }, /*#__PURE__*/
    React.createElement("defs", null, /*#__PURE__*/
    React.createElement("radialGradient", { id: "breatheGlow", cx: "50%", cy: "50%", r: "50%" }, /*#__PURE__*/
    React.createElement("stop", { offset: "0%", stopColor: breatheAccent, stopOpacity: "0.32" }), /*#__PURE__*/
    React.createElement("stop", { offset: "48%", stopColor: breatheAccent, stopOpacity: "0.08" }), /*#__PURE__*/
    React.createElement("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
    )
    ), /*#__PURE__*/
    React.createElement("circle", { cx: "160", cy: "160", r: "128", fill: "url(#breatheGlow)" })
    ), /*#__PURE__*/


    React.createElement("svg", { className: "timer-breathe-ring timer-breathe-expand-ring", width: "306", height: "306", viewBox: "0 0 306 306", style: { position: "absolute", left: 0, top: 0, pointerEvents: "none" } }, /*#__PURE__*/
    React.createElement("circle", {
      cx: "153",
      cy: "153",
      r: "120",
      fill: "none",
      stroke: breatheAccent,
      strokeWidth: "3.4",
      strokeLinecap: "round",
      style: { transition: "stroke 0.3s ease", strokeDasharray: "none", strokeDashoffset: 0 } }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { position: "absolute", left: 0, top: 0, width: ringSize, height: ringSize, pointerEvents: "none" } }, /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" } },
    breatheUiState === "idle" && /*#__PURE__*/
    React.createElement("div", { style: TIMER_HERO_READY_STYLE }, "Ready"),

    breatheUiState === "countdown" && bPrepDisplay && /*#__PURE__*/
    React.createElement("div", { key: "prep-" + bPrepDisplay, className: "timer-breathe-countdown-digit", style: BREATHE_COUNTDOWN_STYLE, "aria-live": "assertive", "aria-label": bPrepDisplay === "Breathe" ? "Breathe" : bPrepDisplay + " seconds" }, bPrepDisplay),

    breatheUiState === "active" && /*#__PURE__*/
    React.createElement("div", { key: "breathe-" + bPhaseIdx + "-" + bTime, className: "timer-breathe-active-digit", style: breatheHeroDigitStyle, "aria-live": "off", "aria-label": phaseLabel + " " + bTime + " seconds" }, formatSecondsOnly(bTime)),

    breatheUiState === "done" && /*#__PURE__*/
    React.createElement("div", { style: TIMER_HERO_READY_STYLE }, "Done")

    )

    )
    )
    ,

    breatheSessionUi && /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-session-mid", style: { marginTop: TIMER_IDLE_VERTICAL_GAP, boxSizing: "border-box" } },
    breatheUiState === "countdown" && /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-prep-mid timer-secondary-block", style: { flexShrink: 0, width: "100%", boxSizing: "border-box" } },
    React.createElement("div", { className: "timer-glass-phase", style: { flexShrink: 0, width: "100%", textAlign: "center", padding: "10px 20px 8px", marginTop: 0, boxSizing: "border-box", minHeight: TIMER_PHASE_BAND, display: "flex", alignItems: "center", justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-prep-eyebrow" }, breathPattern)
    )
    ),
    breatheUiState === "active" && /*#__PURE__*/
    React.createElement("div", { className: "timer-active-mid-band timer-breathe-active-mid timer-secondary-block", style: { flexShrink: 0, width: "100%", boxSizing: "border-box" } },
    React.createElement("div", { className: "timer-glass-phase", style: { flexShrink: 0, width: "100%", textAlign: "center", padding: "10px 20px 12px", marginTop: 0, boxSizing: "border-box", minHeight: TIMER_PHASE_BAND, display: "flex", alignItems: "center", justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { key: `${bPhaseIdx}-${phaseLabel}-${bCycle}`, className: "timer-breathe-phase-label", style: {
        color: nightMode ? "#FF3B30" : isDark ? "var(--app-white)" : "#1D1D1F",
        transition: "none"
      } }, curBreathPhase.label)
    ),
    React.createElement("div", { style: { display: "flex", width: "100%", maxWidth: 360, marginLeft: "auto", marginRight: "auto", justifyContent: "center", marginTop: 0, marginBottom: 0, boxSizing: "border-box" } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-breathe-cycle-chip", role: "group", "aria-label": `Cycle ${bCycle} of ${breathCycles}` }, /*#__PURE__*/
    breatheShowCyclePips ? /*#__PURE__*/React.createElement("div", { className: "timer-round-pips" }, Array.from({ length: breathCycles }, (_, i) => {
      const done = i < bCycle - 1;
      const active = i === bCycle - 1;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "timer-round-pip" + (done ? " is-done" : "") + (active ? " is-active" : ""),
        "aria-hidden": true
      });
    })) : /*#__PURE__*/React.createElement("div", { className: "timer-breathe-cycle-text" }, "CYCLE ", bCycle, " / ", breathCycles)
    ))
    )
    )
    ,


    breatheUiState === "idle" && /*#__PURE__*/React.createElement("div", { className: "timer-secondary-block timer-breathe-idle-column", style: { flex: 1, minHeight: 0, width: "100%", marginTop: 0, marginBottom: 0, boxSizing: "border-box" } },
    React.createElement("div", { className: "timer-breathe-idle-top" },
    React.createElement("div", { className: "timer-breathe-pattern-cards-wrap" },
    React.createElement("div", { ref: breathePatternScrollRef, className: "timer-breathe-pattern-cards-scroll", onScroll: () => {
      const el = breathePatternScrollRef.current;
      if (!el) return;
      const cardIdx = breathePatternIndexFromScroll(el);
      setBreathePatternCardIdx(cardIdx);
      const card = BREATH_PATTERN_CARDS[cardIdx];
      if (card && card.key !== breathPattern) setBreathPattern(card.key);
    } },
    BREATH_PATTERN_CARDS.map((card, cardIdx) => /*#__PURE__*/
    React.createElement("button", { key: card.key, type: "button", className: "timer-breathe-pattern-card" + (breathPattern === card.key ? " is-active" : ""), onClick: () => {
      axisHapticTick();
      setBreathPattern(card.key);
      setBreathePatternCardIdx(cardIdx);
      scrollBreathePatternToIndex(cardIdx);
    } },
    React.createElement("div", { className: "timer-breathe-pattern-card-head" },
    React.createElement("span", { className: "timer-breathe-pattern-card-name" }, card.name),
    React.createElement("span", { className: "timer-breathe-pattern-card-intent" }, card.intent)
    ),
    React.createElement("p", { className: "timer-breathe-pattern-card-desc" }, card.desc)
    ))
    ),
    React.createElement("div", { className: "timer-breathe-pattern-card-dots", role: "tablist", "aria-label": "Breathing patterns" },
    BREATH_PATTERN_CARDS.map((card, dotIdx) => /*#__PURE__*/
    React.createElement("span", { key: card.key, role: "tab", tabIndex: 0, "aria-selected": breathePatternCardIdx === dotIdx ? "true" : "false", className: "timer-breathe-pattern-card-dot" + (breathePatternCardIdx === dotIdx ? " is-active" : ""), onClick: () => {
      axisHapticTick();
      setBreathPattern(card.key);
      setBreathePatternCardIdx(dotIdx);
      scrollBreathePatternToIndex(dotIdx);
    }, onKeyDown: (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      axisHapticTick();
      setBreathPattern(card.key);
      setBreathePatternCardIdx(dotIdx);
      scrollBreathePatternToIndex(dotIdx);
    }, "aria-label": card.name })
    ))
    )
    ),
    React.createElement("div", { className: "timer-breathe-cycles-slot" },
    React.createElement("div", { className: "timer-breathe-cycles-row" }, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dimmer)", fontFamily: "var(--font-display)", marginRight: 6 } }, "Cycles"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /*#__PURE__*/
    React.createElement("button", { type: "button", "aria-label": "Cycles decrease", onClick: () => {axisHapticTick();setBreathCycles((v) => Math.max(1, v - 1));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2212"), /*#__PURE__*/
    React.createElement("div", { className: "timer-interval-row-value", style: { textAlign: "center", fontVariantNumeric: "tabular-nums" } }, /*#__PURE__*/React.createElement("span", { className: "timer-instrument-val" }, breathCycles)), /*#__PURE__*/
    React.createElement("button", { type: "button", "aria-label": "Cycles increase", onClick: () => {axisHapticTick();setBreathCycles((v) => Math.min(12, v + 1));}, className: "timer-glass-stepper timer-interval-stepper", style: { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
    )
    )
    )
    ),
    React.createElement("div", { className: "timer-cta-row timer-breathe-start-row", style: TIMER_BTN_ROW_BREATHE_IDLE },
    /*#__PURE__*/React.createElement("button", { type: "button", onClick: () => {bStartPrep();}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta timer-session-primary-cta", style: BTN }, "Start")
    )
    )
    , /*#__PURE__*/

    breatheSessionUi && /*#__PURE__*/React.createElement("div", { className: "timer-breathe-active-footer timer-breathe-session-footer" },
    React.createElement("div", { style: TIMER_BTN_SPACER_ABOVE, "aria-hidden": true }),
    React.createElement("div", { className: "timer-cta-row timer-breathe-active-cta", style: TIMER_BTN_ROW_IDLE }, /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {if (breatheUiState === "countdown") {axisHapticTick();bReset();} else {axisHapticTick();if (bRunning) {setBPaused(true);setBRunning(false);} else {setBPaused(false);setBRunning(true);}}}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta", style: BTN }, breatheUiState === "countdown" ? "Pause" : bRunning ? "Pause" : "Resume"), /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {axisHapticTick();bReset();}, className: "timer-glass-btn-ghost", style: BTN_GHOST }, "Reset")
    )
    ),
    breatheUiState === "done" && /*#__PURE__*/React.createElement("div", { style: { flexShrink: 0, width: "100%", minHeight: TIMER_PHASE_BAND, boxSizing: "border-box" }, "aria-hidden": true }),
    breatheUiState === "done" && /*#__PURE__*/React.createElement("div", { style: TIMER_BTN_SPACER_ABOVE, "aria-hidden": true }),
    breatheUiState === "done" && /*#__PURE__*/React.createElement("div", { className: "timer-cta-row", style: TIMER_BTN_ROW_IDLE }, /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: () => {triggerHaptic(HAPTIC_LIGHT_TAP);bReset();}, className: "timer-glass-btn-pri ultra-filled-btn timer-start-cta timer-session-primary-cta", style: BTN }, "Again")
    ), /*#__PURE__*/
    React.createElement("div", { style: TIMER_BTN_SPACER_BELOW_INTERVAL_IDLE, "aria-hidden": true })

    )
    )
    )
    ), /*#__PURE__*/
    React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: onSystemTab })
    ));

}

/** Settings › Account: Email row + Log In / Log Out driven by auth listener (Firebase often resolves after first paint). */
function SettingsAccountRows() {
  const useState = React.useState;
  const useEffect = React.useEffect;
  const syncUser = () => axisSyncAuthUser();
  const [user, setUser] = useState(syncUser);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    axisHydrateNativeAuthFromStorage();
    setUser(syncUser());
    const auth = typeof window !== "undefined" && window.AXIS_auth;
    const onAuth = typeof window !== "undefined" && window.AXIS_onAuthStateChanged;
    if (!auth || !onAuth) {
      setReady(true);
      return undefined;
    }
    const unsub = onAuth(auth, (u) => {
      if (u) {
        setUser(u);
        try {
          if (u.uid) localStorage.setItem("axis_auth_uid", String(u.uid));
          if (u.email) localStorage.setItem("axis_auth_email", String(u.email));
        } catch (e) {}
      } else if (!axisAuthHasSession()) {
        setUser(null);
      }
      setReady(true);
    });
    setReady(true);
    return () => {
      try {
        unsub();
      } catch (e) {}
    };
  }, []);
  const hasAuth = axisAuthCapabilitiesAvailable();
  const signedIn = axisAuthHasSession();
  const email = user && user.email ? String(user.email) : null;
  const emailMeta = !ready ? "…" : !hasAuth ? "—" : email || (signedIn ? "Signed in" : "Not signed in");
  const emailRow = /*#__PURE__*/React.createElement("div", { className: "settings-ios-row" }, /*#__PURE__*/React.createElement("span", { className: "settings-ios-label" }, "Email"), /*#__PURE__*/React.createElement("span", { className: "settings-ios-meta settings-ios-meta--muted" }, emailMeta));
  const authMissingRow = ready && !hasAuth ? /*#__PURE__*/React.createElement("div", { className: "settings-ios-row settings-ios-row--stack" }, /*#__PURE__*/React.createElement("span", { style: { fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.45 } }, "Account sign-in is unavailable because the auth script did not load.")) : null;
  const logInRow = ready && hasAuth && !signedIn ? /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-row", onClick: () => {axisHapticTick();window.location.href = "./login.html";} }, /*#__PURE__*/React.createElement("span", { className: "settings-ios-label" }, "Log In")) : null;
  const logOutRow = ready && hasAuth && signedIn ? /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-row settings-ios-row--danger", onClick: () => {axisHapticTick();axisClearNativeAuthSession();if (window.AXIS_signOut) window.AXIS_signOut().catch(() => {});} }, /*#__PURE__*/React.createElement("span", { className: "settings-ios-label" }, "Log Out")) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, emailRow, authMissingRow, logInRow, logOutRow);
}

function axisIsNativeShell() {
  try {
    if (axisIsCapacitorNative()) return true;
    return !!(typeof document !== "undefined" && document.documentElement.classList.contains("axis-native-shell"));
  } catch (_e) {
    return false;
  }
}

function axisSetDailyReminder(enabled) {
  const on = !!enabled;
  storageSet("axis_daily_reminder", on);
  if (!axisIsNativeShell()) return Promise.resolve();
  return loadAxisNativeModule()
    .then((m) => {
      if (!m) return;
      if (on && typeof m.scheduleDailyReminder === "function") return m.scheduleDailyReminder();
      if (!on && typeof m.cancelDailyReminder === "function") return m.cancelDailyReminder();
    })
    .catch(() => {});
}

function AxisOfflineBanner() {
  const useState = React.useState;
  const useEffect = React.useEffect;
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" ? !navigator.onLine : false);
  useEffect(() => {
    const setOn = () => setOffline(false);
    const setOff = () => setOffline(true);
    window.addEventListener("axis-network-online", setOn);
    window.addEventListener("axis-network-offline", setOff);
    window.addEventListener("online", setOn);
    window.addEventListener("offline", setOff);
    if (axisIsCapacitorNative()) {
      loadAxisNativeModule()
        .then((m) => m && typeof m.getNetworkOnline === "function" && m.getNetworkOnline())
        .then((online) => {if (typeof online === "boolean") setOffline(!online);})
        .catch(() => {});
    }
    return () => {
      window.removeEventListener("axis-network-online", setOn);
      window.removeEventListener("axis-network-offline", setOff);
      window.removeEventListener("online", setOn);
      window.removeEventListener("offline", setOff);
    };
  }, []);
  if (!offline) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "axis-offline-banner",
    role: "status",
    "aria-live": "polite"
  }, "You're offline — workouts and history stay on this device. Cloud sync resumes when you're back online.");
}

function FeedbackButton() {
  const [revealed, setRevealed] = React.useState ? React.useState(false) : useState(false);
  const envelope = /*#__PURE__*/React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), /*#__PURE__*/React.createElement("polyline", { points: "22,6 12,13 2,6" }));
  return (/*#__PURE__*/
    React.createElement("div", { style: { width: "100%", maxWidth: "100%" } },
    !revealed ? /*#__PURE__*/
    React.createElement("button", { type: "button", className: "settings-outline-btn settings-outline-btn--icon", onClick: () => setRevealed(true) }, envelope, "Send feedback") : /*#__PURE__*/

    React.createElement("a", { href: "mailto:hello@adamlorber.com", className: "settings-outline-btn settings-outline-btn--icon", style: { textDecoration: "none" } }, envelope, "hello@adamlorber.com")

    ));

}

/** Local calendar day key for history rows (handles ISO strings and toDateString). */
function axisLocalDateKey(raw) {
  if (raw == null || raw === "") return "";
  try {
    const t = new Date(raw);
    if (Number.isNaN(t.getTime())) return "";
    return t.toDateString();
  } catch (e) {
    return "";
  }
}

/** “Today” / “Yesterday” / short date for history group headers. */
function axisRelativeDayLabel(dateKey) {
  if (!dateKey) return "";
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const d = new Date(dateKey);
  if (Number.isNaN(d.getTime())) return dateKey;
  const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((t0 - d0) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === 2) return "2 days ago";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/** Total minutes — sums every history entry whose date falls on the same local day as todayKey. */
function axisSumMinutesOnLocalDay(history, todayKey) {
  let sum = 0;
  for (const e of history || []) {
    if (!e) continue;
    if (axisLocalDateKey(e.date) !== todayKey) continue;
    const m = Number(e.duration);
    if (Number.isFinite(m) && m >= 0) sum += m;
  }
  return sum;
}

function axisHistoryForDailyTotals(stateHistory) {
  const fromStorage = storageGet("axis_history", []);
  const st = Array.isArray(stateHistory) ? stateHistory : [];
  const fs = Array.isArray(fromStorage) ? fromStorage : [];
  if (fs.length === 0) return st;
  if (st.length === 0) return fs;
  return fs.length >= st.length ? fs : st;
}

/** Consecutive local calendar days with at least one movement entry, counting backward from today (0 if none today). */
function axisMovementStreakDays(history) {
  const merged = Array.isArray(history) ? history : [];
  const daysWith = new Set();
  for (const e of merged) {
    if (!e) continue;
    const m = Number(e.duration);
    if (!Number.isFinite(m) || m <= 0) continue;
    const k = axisLocalDateKey(e.date);
    if (k) daysWith.add(k);
  }
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const key = d.toDateString();
    if (daysWith.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const AXIS_METRICS_WEIGHT_KEY = "axis_metrics_weight_v1";
const AXIS_METRICS_PAIN_KEY = "axis_metrics_pain_v1";
const AXIS_PAIN_LOG_KEY = "axis_pain_log";
const AXIS_WEIGHT_ARCHIVE_KEY = "axis_history_archive";
const AXIS_PAIN_ARCHIVE_KEY = "axis_pain_log_archive";
const AXIS_RETENTION_DAYS = 90;

function axisRetentionCutoffTs() {
  return Date.now() - AXIS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function axisMetricsMergeWeightArchive(existing, older) {
  const base = Array.isArray(existing) ? axisMetricsNormalizeWeightList(existing) : [];
  const add = Array.isArray(older) ? axisMetricsNormalizeWeightList(older) : [];
  const byTs = new Map();
  for (const e of base) byTs.set(e.ts, e);
  for (const e of add) byTs.set(e.ts, e);
  return Array.from(byTs.values()).sort((a, b) => a.ts - b.ts);
}

function axisMetricsNormalizePainArchive(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const x of raw) {
    const dateKey = x && typeof x.dateKey === "string" ? x.dateKey : "";
    if (!dateKey) continue;
    const t = new Date(dateKey).getTime();
    if (Number.isNaN(t)) continue;
    const level = axisMetricsPainGetLevel(x);
    if (level == null) continue;
    const note = axisMetricsPainGetNote(x);
    out.push({ dateKey, level, note });
  }
  out.sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime());
  return out;
}

function axisMetricsMergePainArchive(existing, older) {
  const base = axisMetricsNormalizePainArchive(existing);
  const add = axisMetricsNormalizePainArchive(older);
  const byKey = new Map();
  for (const e of base) byKey.set(e.dateKey, e);
  for (const e of add) byKey.set(e.dateKey, e);
  return Array.from(byKey.values()).sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime());
}

function axisMetricsApplyRetention(weightSamples, painByDay) {
  const cutoffTs = axisRetentionCutoffTs();
  const weights = axisMetricsNormalizeWeightList(weightSamples);
  const keepWeight = [];
  const olderWeight = [];
  for (const e of weights) {
    if (e.ts >= cutoffTs) keepWeight.push(e);else olderWeight.push(e);
  }
  const painMap = axisMetricsMigratePainMap(painByDay);
  const keepPain = {};
  const olderPain = [];
  for (const dateKey of Object.keys(painMap)) {
    const t = new Date(dateKey).getTime();
    if (Number.isNaN(t)) continue;
    const level = axisMetricsPainGetLevel(painMap[dateKey]);
    if (level == null) continue;
    const note = axisMetricsPainGetNote(painMap[dateKey]);
    if (t >= cutoffTs) keepPain[dateKey] = note ? { level, note } : { level };else olderPain.push({ dateKey, level, note });
  }
  const mergedWeightArchive = axisMetricsMergeWeightArchive(storageGet(AXIS_WEIGHT_ARCHIVE_KEY, []), olderWeight);
  const mergedPainArchive = axisMetricsMergePainArchive(storageGet(AXIS_PAIN_ARCHIVE_KEY, []), olderPain);
  return { keepWeight, keepPain, mergedWeightArchive, mergedPainArchive, hadPurge: olderWeight.length > 0 || olderPain.length > 0 };
}

function axisMetricsHistoryBucketLabelForTs(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "OLDER";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((today.getTime() - dayStart) / 86400000);
  if (diff <= 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  if (diff === 2) return "2 DAYS AGO";
  if (diff <= 7) return "LAST WEEK";
  if (diff <= 30) return "LAST MONTH";
  return "OLDER";
}

function axisMetricsMigratePainMap(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return {};
  const out = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === "number" && v >= 1 && v <= 10) out[k] = { level: v };
    else if (v && typeof v === "object" && typeof v.level === "number") {
      const note = typeof v.note === "string" && v.note.trim() ? v.note.trim().slice(0, 48) : undefined;
      out[k] = note ? { level: Math.min(10, Math.max(1, v.level)), note } : { level: Math.min(10, Math.max(1, v.level)) };
    }
  }
  return out;
}

function axisMetricsPainGetLevel(entry) {
  if (entry == null) return null;
  if (typeof entry === "number") return entry >= 1 && entry <= 10 ? entry : null;
  if (typeof entry === "object" && typeof entry.level === "number") return entry.level >= 1 && entry.level <= 10 ? entry.level : null;
  return null;
}

function axisMetricsPainGetNote(entry) {
  if (entry && typeof entry === "object" && typeof entry.note === "string") return entry.note.trim().slice(0, 48);
  return "";
}

function axisMetricsNormalizeWeightList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => ({
    ts: Number(x.ts) || 0,
    lbs: Math.max(1, Number(x.lbs)) || 0,
    source: x.source === "health" ? "health" : "manual"
  })).filter((x) => x.ts > 0 && x.lbs > 0).sort((a, b) => a.ts - b.ts);
}

function axisMetricsMergeWeightByTs(local, imported) {
  const map = new Map();
  for (const x of local) map.set(x.ts, x);
  for (const x of imported) {
    const prev = map.get(x.ts);
    if (!prev || x.source === "health") map.set(x.ts, { ...x, source: x.source || "health" });
  }
  return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
}

async function axisHealthNativeModule() {
  if (!axisIsCapacitorNative()) return null;
  try {
    return await axisEnsureNativeReady();
  } catch (_e) {
    return null;
  }
}

function axisHealthFailureMessage(reason) {
  const r = String(reason || "").toLowerCase();
  if (!r) return "Allow in Settings → Health → AXIS";
  if (/unavailable|not available|health data|ios_only|web_stub|not implemented|unimplemented|bridge/.test(r)) {
    return "Health not available";
  }
  if (/could not get permission|denied|permission/.test(r)) {
    return "Allow in Settings → Health → AXIS";
  }
  return "Could not connect";
}

/** Settings → Connect Apple Health: permissions + first sync. */
async function axisConnectAppleHealth() {
  if (!axisIsCapacitorNative()) {
    return { ok: false, message: "Health not available", weights: 0, steps: null };
  }
  await axisEnsureNativeReady();
  const perm = await axisHealthRequestReadPermissions();
  if (!perm || !perm.granted) {
    const reason = perm && perm.reason ? String(perm.reason) : "";
    const message = axisHealthFailureMessage(reason);
    try {
      console.warn("[AXIS] Apple Health connect failed:", reason || message);
    } catch (_e) {}
    return { ok: false, message, weights: 0, steps: null, reason };
  }
  const imported = await axisHealthFetchWeightSamplesNative();
  const steps = await axisHealthFetchTodayStepsNative();
  const message =
    imported.length > 0 || (steps != null && steps > 0)
      ? "Connected"
      : "Allowed — no data in Health yet";
  return { ok: true, message, weights: imported.length, steps, imported };
}

/** Native bridge: request HealthKit read access (steps + weight). */
async function axisHealthRequestReadPermissions() {
  try {
    const m = await axisHealthNativeModule();
    if (m && typeof m.healthRequestPermissions === "function") {
      return await m.healthRequestPermissions({ read: ["weight", "steps"] });
    }
    if (typeof window.axisHealthRequestPermissions === "function") {
      return await window.axisHealthRequestPermissions({ read: ["weight", "steps"] });
    }
  } catch (e) {
    return { granted: false, reason: e && e.message ? e.message : String(e) };
  }
  return { granted: false, reason: "unavailable" };
}

/** Native bridge: weight samples from Apple Health. */
async function axisHealthFetchWeightSamplesNative() {
  try {
    const m = await axisHealthNativeModule();
    if (m && typeof m.healthFetchWeightSamples === "function") {
      const r = await m.healthFetchWeightSamples();
      if (Array.isArray(r)) return axisMetricsNormalizeWeightList(r);
    }
    if (typeof window.axisFetchHealthWeightSamples === "function") {
      const r = await window.axisFetchHealthWeightSamples();
      if (Array.isArray(r)) return axisMetricsNormalizeWeightList(r);
    }
  } catch (_e) {}
  return [];
}

/** Native bridge: today's step count from Apple Health. */
async function axisHealthFetchTodayStepsNative() {
  try {
    const m = await axisHealthNativeModule();
    if (m && typeof m.healthFetchTodaySteps === "function") {
      const n = await m.healthFetchTodaySteps();
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    if (typeof window.axisFetchTodayStepCount === "function") {
      const n = await window.axisFetchTodayStepCount();
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
  } catch (_e) {}
  return null;
}

function axisMetricsLast7DateKeys() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toDateString());
  }
  return out;
}

function axisMetricsFormatWeightLogLine(ts) {
  const dk = new Date(ts).toDateString();
  const day = axisRelativeDayLabel(dk);
  const time = new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

/** e.g. "Today, 6:23 PM" or "Yesterday, 10:15 AM" */
function axisMetricsFormatWeightLastLogFriendly(ts) {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((t0 - d0) / 86400000);
    let dayPart;
    if (diff === 0) dayPart = "Today";
    else if (diff === 1) dayPart = "Yesterday";
    else {
      dayPart = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
    }
    const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${dayPart}, ${timePart}`;
  } catch (e) {
    return "";
  }
}

/** Paginated + collapsed history lists (Weight / Pain). */
function axisMetricLogPagerSlice(list, pageIndex, expanded, options) {
  const pageSize = options && Number(options.pageSize) > 0 ? Number(options.pageSize) : 15;
  const collapsedCount = options && Number(options.collapsedCount) > 0 ? Number(options.collapsedCount) : 5;
  const total = list.length;
  const pageCount = total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, pageIndex), pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const pageSlice = list.slice(pageStart, pageStart + pageSize);
  const visible = expanded ? pageSlice : pageSlice.slice(0, Math.min(collapsedCount, pageSlice.length));
  const showMoreToggle = pageSlice.length > collapsedCount;
  return { visible, pageSlice, pageCount, page: safePage, showMoreToggle, total, pageSize, collapsedCount };
}

function axisMetricsCombineLocalDateTime(dateStr, timeStr) {
  if (!dateStr || typeof dateStr !== "string") return Date.now();
  const dateParts = dateStr.split("-").map((x) => parseInt(x, 10));
  if (dateParts.length < 3 || dateParts.some((n) => !Number.isFinite(n))) return Date.now();
  const y = dateParts[0];
  const mo = dateParts[1];
  const da = dateParts[2];
  let hh = 0;
  let mm = 0;
  if (timeStr && typeof timeStr === "string") {
    const tp = timeStr.split(":");
    hh = parseInt(tp[0], 10) || 0;
    mm = parseInt(tp[1], 10) || 0;
  }
  return new Date(y, mo - 1, da, hh, mm, 0, 0).getTime();
}

function axisMetricsWeightSparklineEntries(samples) {
  const arr = axisMetricsNormalizeWeightList(samples);
  if (arr.length === 0) return [];
  return arr.slice(-4);
}

function axisMetricsWeightTwoWeekTrend(samples) {
  const arr = axisMetricsNormalizeWeightList(samples);
  const now = Date.now();
  const ms14 = 14 * 86400000;
  const recent = arr.filter((x) => now - x.ts <= ms14);
  if (recent.length < 2) return null;
  const d = recent[recent.length - 1].lbs - recent[0].lbs;
  if (Math.abs(d) < 0.08) return "flat";
  return d < 0 ? "down" : "up";
}

const AXIS_METRICS_WEIGHT_FACTS = [
  "Each 1 lb of weight loss can reduce knee joint load by about 4 lbs per step taken.",
  "Every 1 lb lost reduces pressure on your lower back by 4 lbs, significantly lowering the risk of disc herniation.",
  "Losing 10% of body weight slows knee cartilage degeneration, preserving joint function and potentially delaying the need for future surgeries.",
  "Fat cells release pro-inflammatory cytokines like IL-6, which circulate through the body and worsen chronic pain in distant joints.",
  "A 5% weight reduction can improve sleep apnea symptoms, leading to better rest and reduced systemic sensitivity to pain.",
  "Weight loss reduces levels of C-reactive protein in the blood, a primary marker for chronic inflammation and physical discomfort.",
  "Lower body mass reduces the metabolic demand on your heart, allowing for more oxygen-rich blood to reach healing tissues.",
  "Shedding pounds decreases the load on the plantar fascia, often resolving chronic heel pain and morning foot stiffness naturally.",
  "Obesity is linked to increased skin friction and moisture, leading to chronic skin-fold irritation and painful bacterial infections.",
  "Losing weight reduces the mechanical compression of pelvic nerves, which can alleviate certain types of chronic lower body neuralgia.",
  "Reducing caloric intake triggers cellular autophagy, a process that clears out damaged cells that would otherwise contribute to inflammation."
];
const AXIS_METRICS_PAIN_FACTS = [
  "Pain is often higher on weekends.",
  "One night of poor sleep increases pain sensitivity by 15-30%, as the brain's pain-killing dopamine centers become less responsive.",
  "Pain and stiffness often peak in the morning because natural anti-inflammatory cortisol levels are at their lowest during the night.",
  "The brain cannot distinguish between physical and social pain, as both activate the same region, the anterior cingulate cortex.",
  "Dehydration shrinks spinal discs, which are 80% water, causing increased back pain and reduced shock absorption throughout the day.",
  "Chronic pain can physically shrink gray matter in the prefrontal cortex, but regular exercise helps the brain regrow this tissue.",
  "Anticipating pain can be as physically taxing as the pain itself, triggering a stress response that increases overall muscle tension.",
  "Consistent movement acts as natural WD-40 for joints by circulating synovial fluid, which provides essential nutrients to the cartilage.",
  "Pain perception is subjective; your emotional state and environment can act as a volume knob, making sensations feel louder.",
  "The gate control theory explains why rubbing a bumped elbow helps; the touch signals travel faster and block pain.",
  "Falling barometric pressure allows body tissues to expand, putting more pressure on sensitive, inflamed joints, which increases perceived pain."
];
function axisMetricsFactAt(list, index) {
  if (!Array.isArray(list) || list.length === 0) return "";
  const safe = Number.isFinite(index) ? index : 0;
  const i = ((safe % list.length) + list.length) % list.length;
  return list[i];
}

function axisMetricsShortDateFromDateKey(dateKey) {
  try {
    const d = new Date(dateKey);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return "";
  }
}
function axisMetricsHistoryBucketFromTs(ts) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(ts);
  if (Number.isNaN(t.getTime())) return "OLDER";
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((now - t) / 86400000);
  if (diff === 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  if (diff >= 2 && diff <= 6) return "LAST WEEK";
  return "OLDER";
}
function axisMetricsHistoryBucketFromDateKey(dateKey) {
  try {
    return axisMetricsHistoryBucketFromTs(new Date(dateKey).getTime());
  } catch (e) {
    return "OLDER";
  }
}
function axisMetricsFormatTimeLocal(ts) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

/** Allow digits and one decimal point for weight fields. */
function axisMetricsSanitizeDecimalInput(raw) {
  let out = "";
  let dot = false;
  for (const c of String(raw || "")) {
    if (c >= "0" && c <= "9") out += c;
    else if (c === "." && !dot) {
      dot = true;
      out += ".";
    }
  }
  return out;
}

function axisMetricsFormatSessionDurationShort(mins) {
  return axisFormatDurationMinUpper(mins);
}

/** Pain entries newest first. */
function axisMetricsPainEntriesDescending(painByDay) {
  const out = [];
  const o = painByDay && typeof painByDay === "object" ? painByDay : {};
  for (const dateKey of Object.keys(o)) {
    const raw = o[dateKey];
    const level = axisMetricsPainGetLevel(raw);
    if (level == null) continue;
    const t = new Date(dateKey).getTime();
    if (Number.isNaN(t)) continue;
    const note = axisMetricsPainGetNote(raw);
    out.push({ dateKey, level, t, note });
  }
  out.sort((a, b) => b.t - a.t);
  return out;
}

/** Newest-first rows: each step <= prior => stabilizing / trending down. */
function axisPainTrendingDownLastThree(painByDay) {
  const rows = axisMetricsPainEntriesDescending(painByDay);
  if (rows.length < 3) return false;
  const a = rows[0].level;
  const b = rows[1].level;
  const c = rows[2].level;
  return a <= b && b <= c;
}

function axisMetricsPainLast28DateKeys() {
  const out = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toDateString());
  }
  return out;
}

function axisMetricsWeightTrendPhrase(samples) {
  const arr = axisMetricsNormalizeWeightList(samples);
  const now = Date.now();
  const ms14 = 14 * 86400000;
  const recent = arr.filter((x) => now - x.ts <= ms14);
  if (recent.length < 3) return null;
  const first = recent[0].lbs;
  const last = recent[recent.length - 1].lbs;
  const d = last - first;
  if (Math.abs(d) < 0.2) return "Trend: steady over the last 2 weeks";
  if (d < 0) return "Trend: slight decline over 2 weeks";
  return "Trend: up slightly over 2 weeks";
}

/** One-line copy for Metrics v2: "↓ 1.0 lbs (past 2 weeks)" */
function axisMetricsWeightDelta2WeeksLine(samples) {
  const arr = axisMetricsNormalizeWeightList(samples);
  const now = Date.now();
  const ms14 = 14 * 86400000;
  const recent = arr.filter((x) => now - x.ts <= ms14);
  if (recent.length < 2) return null;
  const first = recent[0].lbs;
  const last = recent[recent.length - 1].lbs;
  const d = last - first;
  if (Math.abs(d) < 0.08) return "Flat (past 2 weeks)";
  const arrow = d < 0 ? "\u2193" : "\u2191";
  return `${arrow} ${Math.abs(d).toFixed(1)} lbs (past 2 weeks)`;
}

function axisMetricsPainMondayInsight(painByDay) {
  const o = painByDay && typeof painByDay === "object" ? painByDay : {};
  const mon = [];
  const other = [];
  for (const k of Object.keys(o)) {
    const lv = axisMetricsPainGetLevel(o[k]);
    if (lv == null) continue;
    if (new Date(k).getDay() === 1) mon.push(lv);
    else other.push(lv);
  }
  if (mon.length < 2 || other.length < 3) return null;
  const ma = mon.reduce((a, b) => a + b, 0) / mon.length;
  const oa = other.reduce((a, b) => a + b, 0) / other.length;
  if (ma > oa + 0.75) return "You often report higher pain on Mondays.";
  return null;
}

function axisMetricsPainImprovementInsight(painByDay) {
  const list = axisMetricsPainEntriesDescending(painByDay);
  if (list.length < 4) return null;
  const oldest = list[list.length - 1];
  const newest = list[0];
  const imp = oldest.level - newest.level;
  if (imp >= 1) return `Pain has improved ${imp} pt since you started logging.`;
  return null;
}

function axisPainFormatTodayContextLine(dateKey) {
  try {
    const d = new Date(dateKey);
    if (Number.isNaN(d.getTime())) return "";
    return "Today, " + d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return "";
  }
}

function axisPainFormatDetailDate(dateKey) {
  try {
    return new Date(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateKey;
  }
}

function axisMetricsPainWeekendInsight(painByDay) {
  const o = painByDay && typeof painByDay === "object" ? painByDay : {};
  const wd = [];
  const we = [];
  for (const k of Object.keys(o)) {
    const lv = axisMetricsPainGetLevel(o[k]);
    if (lv == null) continue;
    const day = new Date(k).getDay();
    if (day === 0 || day === 6) we.push(lv);
    else wd.push(lv);
  }
  if (wd.length < 2 || we.length < 1) return null;
  const awd = wd.reduce((a, b) => a + b, 0) / wd.length;
  const awe = we.reduce((a, b) => a + b, 0) / we.length;
  if (awe > awd + 0.65) return "Often higher on weekends.";
  return null;
}

function axisMetricsPainSundayInsight(painByDay) {
  const o = painByDay && typeof painByDay === "object" ? painByDay : {};
  const sun = [];
  const other = [];
  for (const k of Object.keys(o)) {
    const lv = axisMetricsPainGetLevel(o[k]);
    if (lv == null) continue;
    if (new Date(k).getDay() === 0) sun.push(lv);
    else other.push(lv);
  }
  if (sun.length < 1 || other.length < 3) return null;
  const ms = sun.reduce((a, b) => a + b, 0) / sun.length;
  const mo = other.reduce((a, b) => a + b, 0) / other.length;
  if (ms > mo + 0.75) return "Often higher on Sundays.";
  return null;
}

function axisMetricsPainConsistentInsight(painByDay) {
  const keys = axisMetricsLast7DateKeys();
  const vals = [];
  for (const k of keys) {
    const lv = axisMetricsPainGetLevel(painByDay && painByDay[k]);
    if (lv != null) vals.push(lv);
  }
  if (vals.length < 4) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (max - min <= 1.5) return "Consistent throughout the week.";
  return null;
}

function painHeatmapCellTone(level) {
  if (level == null) return "empty";
  if (level <= 3) return "low";
  if (level <= 6) return "mid";
  return "high";
}

function axisMetricsPainHasAnyEntry(painByDay) {
  const o = painByDay && typeof painByDay === "object" ? painByDay : {};
  return Object.keys(o).some((k) => axisMetricsPainGetLevel(o[k]) != null);
}

function WeightSectionSparkline({ entries }) {
  const [activeTs, setActiveTs] = React.useState(null);
  const sparkGradId = React.useId().replace(/:/g, "");
  const W = 120;
  const H = 48;
  const padL = 0;
  const padR = 0;
  const padT = 8;
  const padB = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baselineY = H - padB;
  const topRuleY = padT;
  const n = entries.length;
  if (n === 0) return null;
  const lbsArr = entries.map((e) => e.lbs);
  let minW = Math.min(...lbsArr);
  let maxW = Math.max(...lbsArr);
  let range = maxW - minW;
  if (range === 0) { minW -= 1; maxW += 1; range = maxW - minW; }
  minW -= range * 0.1;
  maxW += range * 0.1;
  const span = maxW - minW || 1;
  const plotPadX = 6;
  const xPlot0 = plotPadX;
  const xPlot1 = W - plotPadX;
  const xAt = (i) => n <= 1 ? xPlot1 : xPlot0 + (i / (n - 1)) * (xPlot1 - xPlot0);
  const yAt = (lbs) => padT + (1 - (lbs - minW) / span) * plotH;
  const pts = entries.map((e, i) => `${xAt(i)},${yAt(e.lbs)}`).join(" ");
  const yMid = padT + plotH * 0.5;
  let areaPath = "";
  if (n >= 2) {
    areaPath = `M ${xAt(0)} ${baselineY}`;
    for (let i = 0; i < n; i++) {
      areaPath += ` L ${xAt(i)} ${yAt(entries[i].lbs)}`;
    }
    areaPath += ` L ${xAt(n - 1)} ${baselineY} Z`;
  }
  const activeEntry = entries.find((e) => e.ts === activeTs) || null;
  const activeIndex = activeEntry ? entries.findIndex((e) => e.ts === activeEntry.ts) : -1;
  const tipX = activeIndex >= 0 ? (xAt(activeIndex) / W) * 100 : 50;
  const tipYPct = activeEntry ? (yAt(activeEntry.lbs) / H) * 100 : 0;
  return /*#__PURE__*/React.createElement("div", { className: "weight-section__chart-wrap" }, /*#__PURE__*/
  React.createElement("div", {
    className: "weight-section__chart-stack",
    role: "group",
    "aria-label": "Weight trend from oldest to latest entry"
  }, /*#__PURE__*/
  React.createElement("svg", {
    className: "weight-section__chart-svg",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    "aria-hidden": true
  }, /*#__PURE__*/
  React.createElement("defs", null, /*#__PURE__*/
  React.createElement("linearGradient", { id: sparkGradId, x1: "0", y1: "0", x2: "0", y2: "1" }, /*#__PURE__*/
  React.createElement("stop", { offset: "0%", stopColor: "var(--weight-mood-accent)", stopOpacity: "0.4" }),
  React.createElement("stop", { offset: "100%", stopColor: "var(--weight-mood-accent)", stopOpacity: "0.03" })
  )),
  areaPath ? /*#__PURE__*/React.createElement("path", { className: "weight-section__chart-area", d: areaPath, fill: `url(#${sparkGradId})` }) : null,
  React.createElement("line", { className: "weight-section__chart-baseline", x1: xPlot0, x2: xPlot1, y1: topRuleY, y2: topRuleY }),
  React.createElement("line", { className: "weight-section__chart-baseline", x1: xPlot0, x2: xPlot1, y1: baselineY, y2: baselineY }),
  n >= 2 ? /*#__PURE__*/React.createElement("line", { className: "weight-section__chart-grid-mid", x1: xPlot0, x2: xPlot1, y1: yMid, y2: yMid }) : null,
  n >= 2 ? /*#__PURE__*/React.createElement("polyline", { className: "weight-section__chart-line", points: pts }) : null
  ),
  /*#__PURE__*/React.createElement("div", { className: "weight-section__chart-dots" }, entries.map((e, i) => /*#__PURE__*/React.createElement("button", {
    key: e.ts,
    type: "button",
    className: "weight-section__chart-dot-hit",
    style: { left: `${(xAt(i) / W) * 100}%`, top: `${(yAt(e.lbs) / H) * 100}%` },
    onMouseEnter: () => setActiveTs(e.ts),
    onFocus: () => setActiveTs(e.ts),
    onClick: () => setActiveTs((cur) => cur === e.ts ? null : e.ts),
    onKeyDown: (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        setActiveTs((cur) => cur === e.ts ? null : e.ts);
      }
    },
    "aria-label": `${e.lbs.toFixed(1)} pounds, ${axisMetricsFormatWeightLastLogFriendly(e.ts)}`
  }))),
  activeEntry && /*#__PURE__*/React.createElement("div", { className: "metric-chart-tooltip", style: { left: `${tipX}%`, top: `${tipYPct}%` } }, /*#__PURE__*/
  React.createElement("div", { className: "metric-chart-tooltip__value" }, `${activeEntry.lbs.toFixed(1)} lbs`),
  /*#__PURE__*/React.createElement("div", { className: "metric-chart-tooltip__date" }, axisMetricsFormatWeightLastLogFriendly(activeEntry.ts))
  )
  ),
  /*#__PURE__*/React.createElement("div", { className: "weight-section__chart-axis" }, /*#__PURE__*/
  React.createElement("span", null, "Oldest"),
  React.createElement("span", null, "Latest")
  ));
}

function MetricsWeightCard({ theme, nightMode, activePeriod, samples, stepsToday, healthHint, onLogWeight, onEditWeightEntry, onDeleteWeightEntry, factsCycle }) {
  const [manualOpen, setManualOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [draftLbs, setDraftLbs] = React.useState("");
  const [editingTs, setEditingTs] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState("");
  const logBodyRef = React.useRef(null);
  const periodW = axisResolveMoodPeriod(activePeriod);
  const ctW = CIRCADIAN_THEMES[periodW][theme === "dark" ? "dark" : "light"];
  const moodColor = nightMode ? "#FF3B30" : (ctW && ctW.accent ? ctW.accent : "#4DA8FF");
  const arr = axisMetricsNormalizeWeightList(samples);
  const current = arr.length ? arr[arr.length - 1].lbs : null;
  const lastSample = arr.length ? arr[arr.length - 1] : null;
  const prevSample = arr.length > 1 ? arr[arr.length - 2] : null;
  const deltaLbs = lastSample && prevSample ? lastSample.lbs - prevSample.lbs : null;
  const deltaText = deltaLbs == null ? "" : `${deltaLbs > 0 ? "+" : deltaLbs < 0 ? "-" : ""}${Math.abs(deltaLbs).toFixed(1)} lbs`;
  const deltaTone = deltaLbs == null ? "" : deltaLbs < 0 ? "loss" : deltaLbs > 0 ? "gain" : "flat";
  const emptyWeight = arr.length === 0;
  const sparkEntries = axisMetricsWeightSparklineEntries(samples);
  const trend2w = axisMetricsWeightTwoWeekTrend(samples);
  const insightText = axisMetricsFactAt(AXIS_METRICS_WEIGHT_FACTS, factsCycle);
  const contextLine = lastSample ? "Last logged: " + axisMetricsFormatWeightLastLogFriendly(lastSample.ts) : null;
  const heroWarm = trend2w === "up";
  const graphBlock = emptyWeight ? /*#__PURE__*/React.createElement("p", { className: "weight-section__graph-placeholder" }, "No entries yet. Tap LOG WEIGHT to start.") : /*#__PURE__*/React.createElement(WeightSectionSparkline, { entries: sparkEntries });
  React.useEffect(() => {
    if (!manualOpen) return;
    const last = arr.length ? arr[arr.length - 1].lbs : null;
    setDraftLbs(last != null ? String(last.toFixed(1)) : "");
  }, [manualOpen, samples]);
  const saveManual = () => {
    const n = parseFloat(draftLbs);
    if (!Number.isFinite(n) || n <= 0 || n >= 2000) return;
    axisHapticTick();
    onLogWeight({ lbs: n, ts: Date.now() });
    setManualOpen(false);
    if (logOpen && logBodyRef.current) requestAnimationFrame(() => { logBodyRef.current.scrollTop = 0; });
  };
  const rowsSorted = arr.slice().sort((a, b) => b.ts - a.ts);
  const hasAnyWeight = rowsSorted.length > 0;
  const renderWeightLogRow = (e) => {
    const isEdit = editingTs === e.ts;
    return /*#__PURE__*/React.createElement("div", { key: e.ts, className: "metric-inline-log__list-item" }, isEdit ? /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__new-row" }, /*#__PURE__*/
    React.createElement("input", { type: "text", className: "metrics-inline-form__input metric-inline-log__input-grow", value: editDraft, onChange: (ev) => setEditDraft(axisMetricsSanitizeDecimalInput(ev.target.value)) }),
    /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__btns-inline" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "metrics-inline-form__btn", onClick: () => { setEditingTs(null); setEditDraft(""); } }, "Cancel"),
    /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-form__btn metrics-inline-form__btn--primary", onClick: () => { const n = parseFloat(editDraft);if (Number.isFinite(n) && n > 0) onEditWeightEntry(e.ts, n);setEditingTs(null);setEditDraft(""); } }, "Save")
    )) : /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__row-read" }, /*#__PURE__*/
    React.createElement("div", { className: "metric-inline-log__row-meta" }, `${e.lbs.toFixed(1)} lbs • ${axisMetricsFormatWeightLastLogFriendly(e.ts)}`),
    /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__row-actions" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "metrics-inline-row-action", onClick: () => { setEditingTs(e.ts); setEditDraft(String(e.lbs.toFixed(1))); } }, "Edit"),
    /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-row-action metrics-inline-row-action--danger", onClick: () => { if (window.confirm("Delete this weight entry?")) onDeleteWeightEntry(e.ts); } }, "Delete"))));
  };
  const weightLogBody = !hasAnyWeight ? /*#__PURE__*/React.createElement("p", { className: "metrics-inline-log-empty" }, "No weight entries yet. Tap Log Weight to add one.") : rowsSorted.map(renderWeightLogRow);
  return /*#__PURE__*/React.createElement("div", { className: "weight-section", style: { "--weight-mood-accent": moodColor } }, /*#__PURE__*/
  React.createElement("div", { className: "weight-section__header" }, "Weight"),
  !emptyWeight && /*#__PURE__*/React.createElement("div", { className: "weight-section__hero-row" }, /*#__PURE__*/
  React.createElement("span", { className: "weight-section__hero-num" + (heroWarm ? " weight-section__hero-num--warm" : "") }, current.toFixed(1)),
  React.createElement("span", { className: "weight-section__hero-unit" }, "lbs"),
  deltaLbs != null && /*#__PURE__*/React.createElement("span", { className: `weight-section__hero-delta weight-section__hero-delta--${deltaTone}` }, /*#__PURE__*/
  React.createElement("span", { className: "weight-section__hero-delta-num" }, deltaText),
  /*#__PURE__*/React.createElement("span", null, deltaLbs < 0 ? "loss" : deltaLbs > 0 ? "gain" : "no change")
  )
  ),
  contextLine ? /*#__PURE__*/React.createElement("div", { className: "weight-section__context" }, contextLine) : null,
  /*#__PURE__*/React.createElement("div", { className: "weight-section__weight-insight" }, insightText),
  graphBlock,
  /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "weight-section__btn weight-section__btn--expand",
    title: manualOpen ? "Close log weight" : "Log weight",
    onClick: () => { axisHapticTick(); setManualOpen((o) => !o); }
  }, /*#__PURE__*/React.createElement("span", null, "LOG WEIGHT")),
  manualOpen && /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form" }, /*#__PURE__*/
  React.createElement("label", { className: "metrics-inline-form__label", htmlFor: "metrics-weight-manual-lbs" }, "WEIGHT"),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__input-actions-row" }, /*#__PURE__*/
  React.createElement("input", {
    id: "metrics-weight-manual-lbs",
    type: "text",
    inputMode: "decimal",
    autoComplete: "off",
    className: "metrics-inline-form__input",
    placeholder: "Enter weight (lbs)",
    value: draftLbs,
    onChange: (e) => setDraftLbs(axisMetricsSanitizeDecimalInput(e.target.value))
  }),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__actions" }, /*#__PURE__*/
  React.createElement("button", { type: "button", className: "metrics-inline-form__btn", onClick: () => { axisHapticTick(); setManualOpen(false); } }, "Cancel"),
  /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-form__btn metrics-inline-form__btn--primary", onClick: saveManual }, "Save")
  ))),
  /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "metrics-inline-log-toggle-link",
    "aria-expanded": logOpen ? "true" : "false",
    onClick: () => { axisHapticTick(); setLogOpen((o) => !o); }
  }, "VIEW WEIGHT LOG"),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-collapsible" + (logOpen ? " metrics-inline-collapsible--open" : ""), "aria-hidden": logOpen ? "false" : "true" }, /*#__PURE__*/
  React.createElement("div", { className: "metrics-inline-collapsible__inner" }, /*#__PURE__*/
  React.createElement("div", { className: "metrics-inline-collapsible__body", ref: logBodyRef }, weightLogBody)
  ))
  );
}

function axisMetricsPainWeekRangeLabel(dkFirst, dkLast) {
  if (!dkFirst || !dkLast) return "";
  try {
    const a = new Date(dkFirst);
    const b = new Date(dkLast);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
    const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const same = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (same) return `${mo[a.getMonth()]} ${a.getDate()}\u2013${b.getDate()}`;
    return `${mo[a.getMonth()]} ${a.getDate()}\u2013${mo[b.getMonth()]} ${b.getDate()}`;
  } catch (e) {
    return "";
  }
}

function MetricsPainGrid({ painByDay, mode, dkToday }) {
  const [activeDateKey, setActiveDateKey] = React.useState(null);
  const dowShort = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
  const cell = (dk, showDow) => {
    const raw = painByDay && painByDay[dk];
    const level = axisMetricsPainGetLevel(raw);
    const note = axisMetricsPainGetNote(raw);
    const isToday = dk === dkToday;
    const tone = painHeatmapCellTone(level);
    const isOpen = activeDateKey === dk;
    const cls = "pain-heat__cell pain-heat__cell--" + tone + (isToday ? " pain-heat__cell--today" : "") + (isOpen ? " pain-heat__cell--open" : "");
    const label = level != null ? `${axisRelativeDayLabel(dk)} · ${level}/10` : `${axisRelativeDayLabel(dk)} · no entry`;
    const btn = /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: cls,
      onClick: () => setActiveDateKey((cur) => cur === dk ? null : dk),
      "aria-label": label
    }, level != null ? level : "\u2014");
    const tooltip = isOpen ? /*#__PURE__*/React.createElement("div", { className: "metric-chart-tooltip", style: { left: "50%", top: "0px" } }, /*#__PURE__*/
    React.createElement("div", { className: "metric-chart-tooltip__value" }, `${axisMetricsShortDateFromDateKey(dk)} • ${level != null ? `${level}/10` : "No entry"}${note ? ` • ${note}` : ""}`)) : null;
    if (!showDow) return /*#__PURE__*/React.createElement("div", { className: "pain-heat__cell-wrap" }, tooltip, btn);
    return /*#__PURE__*/React.createElement("div", { key: dk, className: "pain-heat__col" }, /*#__PURE__*/
    React.createElement("div", { className: "pain-heat__cell-wrap" }, tooltip, btn),
    /*#__PURE__*/React.createElement("div", { className: "pain-heat__dow" }, dowShort[new Date(dk).getDay()]));
  };
  if (mode === "7d") {
    const keys = axisMetricsLast7DateKeys();
    return /*#__PURE__*/React.createElement("div", { className: "pain-heat__grid pain-heat__grid--7d" }, keys.map((dk) => cell(dk, true)));
  }
  const k28 = axisMetricsPainLast28DateKeys();
  return /*#__PURE__*/React.createElement("div", { className: "pain-heat__grid-28" }, [0, 1, 2, 3].map((row) => {
    const slice = k28.slice(row * 7, row * 7 + 7);
    const rangeLbl = axisMetricsPainWeekRangeLabel(slice[0], slice[6]);
    return /*#__PURE__*/React.createElement("div", { key: row, className: "pain-heat__week-row" }, /*#__PURE__*/
    rangeLbl ? /*#__PURE__*/React.createElement("div", { className: "pain-heat__week-label" }, rangeLbl) : /*#__PURE__*/React.createElement("div", { className: "pain-heat__week-label pain-heat__week-label--spacer", "aria-hidden": true }),
    /*#__PURE__*/React.createElement("div", { className: "pain-heat__week-cells" }, slice.map((dk) => /*#__PURE__*/React.createElement("div", { key: dk, className: "pain-heat__col" }, cell(dk, false)))));
  }));
}

function MetricsPainCard({ theme, nightMode, activePeriod, painByDay, onLogPain, onEditPainEntry, onDeletePainEntry, factsCycle }) {
  const [painGridMode, setPainGridMode] = React.useState("7d");
  const [formOpen, setFormOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [v, setV] = React.useState(5);
  const [draftNote, setDraftNote] = React.useState("");
  const [editingDateKey, setEditingDateKey] = React.useState(null);
  const [editV, setEditV] = React.useState(5);
  const [editNote, setEditNote] = React.useState("");
  const logBodyRef = React.useRef(null);
  const [painTrendMounted, setPainTrendMounted] = React.useState(false);
  const [painTrendOpaque, setPainTrendOpaque] = React.useState(false);
  const periodPain = axisResolveMoodPeriod(activePeriod);
  const ctPain = CIRCADIAN_THEMES[periodPain][theme === "dark" ? "dark" : "light"];
  const moodAccent = nightMode ? "#FF3B30" : (ctPain && ctPain.accent ? ctPain.accent : "#4DA8FF");
  const dkToday = new Date().toDateString();
  const painTodayVal = axisMetricsPainGetLevel(painByDay && painByDay[dkToday]);
  const hasAnyEntry = axisMetricsPainHasAnyEntry(painByDay);
  const contextLine = painTodayVal != null ? "Last logged: " + axisMetricsShortDateFromDateKey(dkToday) : null;
  const painCallout = axisMetricsFactAt(AXIS_METRICS_PAIN_FACTS, factsCycle);
  const gridMode = painGridMode === "7d" ? "7d" : "28d";
  const trendingDown = axisPainTrendingDownLastThree(painByDay);
  const heatmapBlock = !hasAnyEntry ? /*#__PURE__*/React.createElement("p", { className: "pain-heat__placeholder" }, "No entries yet. Tap LOG PAIN to start.") : /*#__PURE__*/React.createElement(MetricsPainGrid, {
    painByDay: painByDay,
    mode: gridMode,
    dkToday: dkToday
  });
  React.useEffect(() => {
    if (!formOpen) return;
    const ex = axisMetricsPainGetLevel(painByDay && painByDay[dkToday]);
    setV(ex != null ? ex : 5);
    const n = painByDay && painByDay[dkToday] && axisMetricsPainGetNote(painByDay[dkToday]);
    setDraftNote(n || "");
  }, [formOpen, dkToday, painByDay]);
  React.useEffect(() => {
    if (!trendingDown) {
      if (!painTrendMounted) return;
      setPainTrendOpaque(false);
      const outMs = axisPrefersReducedMotion() ? 150 : 300;
      const t = window.setTimeout(() => setPainTrendMounted(false), outMs);
      return () => clearTimeout(t);
    }
    setPainTrendMounted(true);
    const rid = requestAnimationFrame(() => setPainTrendOpaque(true));
    return () => cancelAnimationFrame(rid);
  }, [trendingDown]);
  const savePainForm = () => {
    axisHapticTick();
    const note = draftNote.trim().slice(0, 48);
    onLogPain({ level: v, ...(note ? { note } : {}) });
    setFormOpen(false);
    if (logOpen && logBodyRef.current) requestAnimationFrame(() => { logBodyRef.current.scrollTop = 0; });
  };
  const painRows = axisMetricsPainEntriesDescending(painByDay);
  const hasAnyPain = painRows.length > 0;
  const renderPainLogRow = (e) => {
    const isEdit = editingDateKey === e.dateKey;
    return /*#__PURE__*/React.createElement("div", { key: e.dateKey, className: "metric-inline-log__list-item" }, isEdit ? /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__pain-add-stack" }, /*#__PURE__*/
    React.createElement("div", { className: "metric-inline-log__pain-slider-row" }, /*#__PURE__*/React.createElement("input", { className: "metric-inline-log__pain-range", type: "range", min: 1, max: 10, step: 1, value: editV, onChange: (ev) => setEditV(Number(ev.target.value)) }), /*#__PURE__*/React.createElement("span", { className: "metric-inline-log__pain-val metric-inline-log__pain-val--accent" }, editV, "/10")),
    /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__input-actions-row", style: { marginTop: 10 } }, /*#__PURE__*/React.createElement("input", { type: "text", className: "metrics-inline-form__input metric-inline-log__input-grow", value: editNote, onChange: (ev) => setEditNote(ev.target.value), maxLength: 48, placeholder: "E.g., lower back, neck..." }),
    /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__actions" }, /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-form__btn", onClick: () => { setEditingDateKey(null); setEditNote(""); } }, "Cancel"), /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-form__btn metrics-inline-form__btn--primary", onClick: () => { onEditPainEntry(e.dateKey, { level: editV, note: editNote.trim().slice(0, 48) });setEditingDateKey(null); } }, "Save")))) : /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__row-read" }, /*#__PURE__*/
    React.createElement("div", { className: "metric-inline-log__row-meta" }, `${e.level}/10 • ${axisMetricsShortDateFromDateKey(e.dateKey)}${e.note ? ` • ${e.note}` : ""}`),
    /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__row-actions" }, /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-row-action", onClick: () => { setEditingDateKey(e.dateKey); setEditV(e.level); setEditNote(e.note || ""); } }, "Edit"), /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-row-action metrics-inline-row-action--danger", onClick: () => { if (window.confirm("Delete this pain entry?")) onDeletePainEntry(e.dateKey); } }, "Delete"))));
  };
  const painLogBody = !hasAnyPain ? /*#__PURE__*/React.createElement("p", { className: "metrics-inline-log-empty" }, "No pain entries yet. Tap Log pain to add one.") : painRows.map(renderPainLogRow);
  return /*#__PURE__*/React.createElement("div", { className: "weight-section pain-section", style: { "--weight-mood-accent": moodAccent } }, /*#__PURE__*/
  React.createElement("div", { className: "weight-section__header" }, "Pain"),
  /*#__PURE__*/React.createElement("div", { className: "weight-section__hero-row" }, painTodayVal != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
  React.createElement("span", { className: "weight-section__hero-num" }, String(painTodayVal)),
  React.createElement("span", { className: "pain-section__denom" }, "/10")
  ) : /*#__PURE__*/React.createElement("span", { className: "pain-section__hero-empty" }, "No entry")),
  contextLine ? /*#__PURE__*/React.createElement("div", { className: "weight-section__context" }, contextLine) : null,
  /*#__PURE__*/React.createElement("div", { className: "pain-section__toggles", role: "tablist", "aria-label": "Pain heatmap range" }, /*#__PURE__*/
  React.createElement("button", { type: "button", role: "tab", "aria-selected": painGridMode === "7d", className: "pain-section__toggle" + (painGridMode === "7d" ? " pain-section__toggle--active" : ""), onClick: () => { axisHapticTick(); setPainGridMode("7d"); } }, "7 Days"),
  React.createElement("button", { type: "button", role: "tab", "aria-selected": painGridMode === "28d", className: "pain-section__toggle" + (painGridMode === "28d" ? " pain-section__toggle--active" : ""), onClick: () => { axisHapticTick(); setPainGridMode("28d"); } }, "4 Weeks")
  ),
  heatmapBlock,
  painTrendMounted ? /*#__PURE__*/React.createElement("div", {
    className: "axis-pain-trend-insight" + (painTrendOpaque ? " axis-pain-trend-insight--show" : " axis-pain-trend-insight--hiding")
  }, "Pain trending down. Keep going.") : null,
  painCallout ? /*#__PURE__*/React.createElement("div", { className: "weight-section__insight" }, painCallout) : null,
  /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "weight-section__btn weight-section__btn--expand",
    title: formOpen ? "Close pain log form" : "Log pain for today",
    onClick: () => { axisHapticTick(); setFormOpen((o) => !o); }
  }, /*#__PURE__*/React.createElement("span", null, "LOG PAIN")),
  formOpen && /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form" }, /*#__PURE__*/
  React.createElement("div", { className: "metrics-inline-form__label" }, "LEVEL"),
  /*#__PURE__*/React.createElement("div", { className: "metric-inline-log__pain-slider-row", style: { marginBottom: 12 } }, /*#__PURE__*/
  React.createElement("input", { id: "metrics-pain-inline-level", className: "metric-inline-log__pain-range", type: "range", min: 1, max: 10, step: 1, value: v, onChange: (e) => setV(Number(e.target.value)) }),
  /*#__PURE__*/React.createElement("span", { className: "metric-inline-log__pain-val metric-inline-log__pain-val--accent", "aria-live": "polite" }, v, "/10")
  ),
  /*#__PURE__*/React.createElement("label", { className: "metrics-inline-form__label", htmlFor: "metrics-pain-inline-note" }, "NOTES (optional)"),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__input-actions-row" }, /*#__PURE__*/
  React.createElement("input", {
    id: "metrics-pain-inline-note",
    type: "text",
    className: "metrics-inline-form__input",
    placeholder: "E.g., lower back, neck...",
    maxLength: 48,
    value: draftNote,
    onChange: (e) => setDraftNote(e.target.value)
  }),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-form__actions" }, /*#__PURE__*/
  React.createElement("button", { type: "button", className: "metrics-inline-form__btn", onClick: () => { axisHapticTick(); setFormOpen(false); } }, "Cancel"),
  /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-inline-form__btn metrics-inline-form__btn--primary", onClick: savePainForm }, "Save")
  ))),
  /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "metrics-inline-log-toggle-link",
    "aria-expanded": logOpen ? "true" : "false",
    onClick: () => { axisHapticTick(); setLogOpen((o) => !o); }
  }, "VIEW PAIN LOG"),
  /*#__PURE__*/React.createElement("div", { className: "metrics-inline-collapsible" + (logOpen ? " metrics-inline-collapsible--open" : ""), "aria-hidden": logOpen ? "false" : "true" }, /*#__PURE__*/
  React.createElement("div", { className: "metrics-inline-collapsible__inner" }, /*#__PURE__*/
  React.createElement("div", { className: "metrics-inline-collapsible__body", ref: logBodyRef }, painLogBody)
  ))
  );
}

function axisMetricsGroupByAge(items, tsGetter) {
  const order = ["TODAY", "YESTERDAY", "2 DAYS AGO", "LAST WEEK", "LAST MONTH", "OLDER"];
  const map = {};
  for (const k of order) map[k] = [];
  for (const item of items || []) {
    const t = Number(tsGetter(item)) || 0;
    const bucket = axisMetricsHistoryBucketLabelForTs(t);
    if (!map[bucket]) map[bucket] = [];
    map[bucket].push(item);
  }
  return order.map((k) => ({ label: k, rows: map[k] || [] }));
}

function axisMetricsGroupByAgeNonEmpty(items, tsGetter) {
  return axisMetricsGroupByAge(items, tsGetter).filter((g) => g.rows.length > 0);
}

let __axisMetricsSheetOpenCount = 0;

function MetricsLogModalFrame({ title, onClose, children }) {
  const titleId = React.useId();
  const touchY0 = React.useRef(null);
  React.useEffect(() => {
    __axisMetricsSheetOpenCount++;
    if (__axisMetricsSheetOpenCount === 1) document.body.style.overflow = "hidden";
    return () => {
      __axisMetricsSheetOpenCount = Math.max(0, __axisMetricsSheetOpenCount - 1);
      if (__axisMetricsSheetOpenCount === 0) document.body.style.overflow = "";
    };
  }, []);
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const onHandleStart = (e) => {
    touchY0.current = e.touches[0].clientY;
  };
  const onHandleEnd = (e) => {
    if (touchY0.current == null) return;
    const dy = e.changedTouches[0].clientY - touchY0.current;
    touchY0.current = null;
    if (dy > 64) onClose();
  };
  return /*#__PURE__*/React.createElement("div", { className: "weight-log-modal-backdrop weight-log-modal-backdrop--sheet", onClick: (e) => { if (e.target === e.currentTarget) onClose(); } }, /*#__PURE__*/
  React.createElement("div", { className: "weight-log-modal weight-log-modal--sheet", role: "dialog", "aria-modal": true, "aria-labelledby": titleId }, /*#__PURE__*/
  React.createElement("div", { className: "weight-log-modal__sheet-handle", onTouchStart: onHandleStart, onTouchEnd: onHandleEnd }),
  /*#__PURE__*/React.createElement("div", { className: "weight-log-modal__header" }, /*#__PURE__*/
  React.createElement("h2", { id: titleId, className: "weight-log-modal__title--sheet" }, title),
  /*#__PURE__*/React.createElement("button", { type: "button", className: "weight-log-modal__close-x", "aria-label": "Close", onClick: onClose }, "\u2715")
  ),
  /*#__PURE__*/React.createElement("div", { className: "weight-log-modal__scroll" }, children)
  ));
}

function MetricsArchivedDataModal({ open, onClose, weightArchive, painArchive }) {
  if (!open) return null;
  const w = axisMetricsNormalizeWeightList(weightArchive || []).slice().sort((a, b) => b.ts - a.ts);
  const p = axisMetricsMergePainArchive([], painArchive || []).slice().sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime());
  const wGroups = axisMetricsGroupByAgeNonEmpty(w, (x) => x.ts);
  const pGroups = axisMetricsGroupByAgeNonEmpty(p, (x) => new Date(x.dateKey).getTime());
  const empty = w.length === 0 && p.length === 0;
  const parts = [];
  if (!empty) {
    if (w.length > 0) {
      for (const g of wGroups) {
        parts.push(/*#__PURE__*/React.createElement("div", { key: "wg-" + g.label, className: "metric-inline-log__bucket-wrap" }, /*#__PURE__*/
        React.createElement("div", { className: "metric-inline-log__bucket-label" }, g.label),
        g.rows.map((e) => /*#__PURE__*/React.createElement("div", { key: e.ts, className: "metric-inline-log__list-item metric-inline-log__list-item--readonly" }, `${e.lbs.toFixed(1)} lbs • ${axisMetricsFormatWeightLastLogFriendly(e.ts)}`))
        ));
      }
    }
    if (p.length > 0) {
      if (w.length > 0) {
        parts.push(/*#__PURE__*/React.createElement("hr", { key: "arch-div", className: "metrics-archived-section-divider", "aria-hidden": true }));
      }
      for (const g of pGroups) {
        parts.push(/*#__PURE__*/React.createElement("div", { key: "pg-" + g.label, className: "metric-inline-log__bucket-wrap" }, /*#__PURE__*/
        React.createElement("div", { className: "metric-inline-log__bucket-label" }, g.label),
        g.rows.map((e) => /*#__PURE__*/React.createElement("div", { key: e.dateKey, className: "metric-inline-log__list-item metric-inline-log__list-item--readonly" }, `${e.level}/10 • ${axisMetricsShortDateFromDateKey(e.dateKey)}${e.note ? ` • ${e.note}` : ""}`))
        ));
      }
    }
  }
  const content = empty ? /*#__PURE__*/React.createElement("p", { className: "metric-inline-log__empty" }, "No archived entries. All your data is current.") : /*#__PURE__*/React.createElement(React.Fragment, null, parts);
  return /*#__PURE__*/React.createElement(MetricsLogModalFrame, { title: "Archived Data", onClose: onClose }, content);
}

// ── ES module exports (for components/WorkoutApp.js) ──
export {
  AXIS_EVER_BOOKMARKED_EXERCISE_KEY,
  AXIS_METRICS_PAIN_KEY,
  AXIS_METRICS_WEIGHT_KEY,
  AXIS_PAIN_ARCHIVE_KEY,
  AXIS_PAIN_LOG_KEY,
  AXIS_SESSION_GUIDED_DONE_KEY,
  AXIS_SESSION_LIST_DONE_KEY,
  AXIS_WEIGHT_ARCHIVE_KEY,
  AxisChevronCaret,
  AxisFirstBookmarkSavedTip,
  AxisThinArrowRight,
  CIRCADIAN_THEMES,
  DashboardHeader,
  ExRow,
  GuidedOverlay,
  HAPTIC_LIGHT_TAP,
  HOME_CATEGORY_FILTERS,
  HOME_TRACK_GROUPS,
  MetricsArchivedDataModal,
  MetricsPainCard,
  MetricsWeightCard,
  MomentumMap,
  React,
  ReactDOM,
  SettingsAccountRows,
  axisSetDailyReminder,
  AxisOfflineBanner,
  TRACKS,
  TRACKS_DATA_FALLBACK,
  TRACK_CATEGORY_BY_ID,
  TabBar,
  Timer,
  TimerView,
  applyCircadianTheme,
  axisActiveUidForStorage,
  axisCelebrationFadeMs,
  axisCelebrationScopedKey,
  axisDateFromHistoryEntry,
  axisExerciseListParenDirectionDisplayName,
  axisExerciseNameForHistoryEntry,
  axisExerciseTargetMetaLine,
  axisFormatDurationMinUpper,
  axisFormatSessionHeaderDuration,
  axisFormatLastSessionDayUpper,
  axisHapticTick,
  axisConnectAppleHealth,
  axisHealthFetchTodayStepsNative,
  axisHealthFetchWeightSamplesNative,
  axisHealthRequestReadPermissions,
  axisHistoryForDailyTotals,
  axisLatestHistoryEntryForTrack,
  axisLatestHistoryEntryGlobal,
  axisLoadSessionGuidedDone,
  axisLoadSessionListDone,
  axisLocalDateKey,
  axisMetricsApplyRetention,
  axisMetricsFormatSessionDurationShort,
  axisMetricsMergePainArchive,
  axisMetricsMergeWeightArchive,
  axisMetricsMergeWeightByTs,
  axisMetricsMigratePainMap,
  axisMetricsNormalizeWeightList,
  axisMetricsPainEntriesDescending,
  axisMovementStreakDays,
  axisPrefersReducedMotion,
  axisRelativeDayLabel,
  axisResolveMoodPeriod,
  axisResolveTrackIdFromHistoryEntry,
  axisSessionDoneClearTrack,
  axisSessionDoneLookup,
  axisSessionDoneMergeTrack,
  axisSessionDoneSlice,
  axisSnapWeeklyGoalMinutes,
  axisSumMinutesOnLocalDay,
  axisTrackCardSubtitleDisplay,
  axisWeekMomentumFromHistory,
  axisWelcomeDisplayNameFromStorage,
  beep,
  getAll,
  getCircadianPeriod,
  getSections,
  primeAudio,
  storageGet,
  storageSet,
  triggerHaptic,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
};

// ─────────────────────────────────────────────────────────────
//  ROOT — onboarding: public_web/onboarding.html (gate in bootstrapAxisApp); ?noboard=1 skips redirect
// ─────────────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState(() => storageGet("axis_theme", "dark"));
  const [nightMode, setNightMode] = useState(() => storageGet("axis_night", false));
  const [onboardingBloomMounted, setOnboardingBloomMounted] = useState(false);
  const [onboardingBloomOpaque, setOnboardingBloomOpaque] = useState(false);
  const [WorkoutApp, setWorkoutApp] = useState(() => _axisWorkoutAppComponent);

  useEffect(() => {
    if (WorkoutApp) return;
    let cancelled = false;
    axisLoadWorkoutApp()
      .then((comp) => {
        if (!cancelled) setWorkoutApp(() => comp);
      })
      .catch((e) => {
        if (!cancelled) {
          showLoadErr("Workout UI failed to load: " + (e && e.message ? e.message : String(e)) + (e && e.stack ? "\n\n" + e.stack : ""));
        }
      });
    return () => { cancelled = true; };
  }, [WorkoutApp]);

  const toggleNight = () => setNightMode((n) => {const v = !n;storageSet("axis_night", v);return v;});
  const toggleTheme = () => setTheme((t) => {const n = t === "dark" ? "light" : "dark";storageSet("axis_theme", n);return n;});

  useEffect(() => {
    axisMigrateOnboardingLegacy();
  }, []);

  useEffect(() => {
    let tFadeOut = 0;
    let tUnmount = 0;
    let cancelled = false;
    try {
      if (typeof sessionStorage === "undefined" || sessionStorage.getItem("axis_ob_visual_handoff") !== "1") return;
      sessionStorage.removeItem("axis_ob_visual_handoff");
      const key = axisCelebrationScopedKey("axis_onboarding_transition_played");
      if (storageGet(key, false)) return;
      if (axisPrefersReducedMotion()) {
        storageSet(key, true);
        return;
      }
      storageSet(key, true);
      const fade = axisCelebrationFadeMs(400);
      setOnboardingBloomMounted(true);
      setOnboardingBloomOpaque(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setOnboardingBloomOpaque(true);
        });
      });
      tFadeOut = window.setTimeout(() => {
        if (cancelled) return;
        setOnboardingBloomOpaque(false);
      }, fade + fade);
      tUnmount = window.setTimeout(() => {
        if (cancelled) return;
        setOnboardingBloomMounted(false);
      }, fade + fade + fade);
    } catch (e) {}
    return () => {
      cancelled = true;
      clearTimeout(tFadeOut);
      clearTimeout(tUnmount);
    };
  }, []);

  // Tab bar “end of scroll” affordance: slightly more transparent pill + shimmer when nothing is hidden beneath
  useEffect(() => {
    let raf = 0;
    const EPS = 24;
    function updateTabBarScrollEnd() {
      raf = 0;
      const wrap = document.querySelector(".tab-bar-wrap");
      if (!wrap) return;
      const seen = new Set();
      const els = [];
      document.querySelectorAll(".axis-app-scroll-root, .app .app-body, .app .content").forEach((el) => {
        if (!seen.has(el)) {seen.add(el);els.push(el);}
      });
      let anyScrollable = false;
      let allAtEnd = true;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const sh = el.scrollHeight;
        const ch = el.clientHeight;
        if (sh <= ch + 2) continue;
        anyScrollable = true;
        if (el.scrollTop + ch < sh - EPS) allAtEnd = false;
      }
      const atEnd = !anyScrollable || allAtEnd;
      wrap.classList.toggle("tab-bar-wrap--scroll-end", atEnd);
    }
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(updateTabBarScrollEnd);
    }
    document.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      document.querySelectorAll(".axis-app-scroll-root, .app, .app-body, .content").forEach((n) => ro.observe(n));
    }
    schedule();
    return () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const appShellStyle = {
    height: "100dvh",
    minHeight: "100dvh",
    width: "100%",
    maxWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    background: "var(--bg-gradient)",
    opacity: 1,
    transition: "opacity 300ms ease"
  };

  const appContentStyle = {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: "100vw",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch"
  };

  const onboardingBloomFadeMs = axisCelebrationFadeMs(400);

  const dataLoadWarn = typeof window !== "undefined" && window.__AXIS_DATA_LOAD_ERROR;

  if (!WorkoutApp) {
    return (/*#__PURE__*/
    React.createElement("div", {
      style: {
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080d18",
        color: "#f6f7f8",
        fontFamily: "var(--font-ui, system-ui, sans-serif)",
        fontSize: "16px",
        letterSpacing: "0.04em"
      } },
    "Loading AXIS…")
    );
  }

  return (/*#__PURE__*/
    React.createElement("div", { style: appShellStyle }, /*#__PURE__*/
    onboardingBloomMounted ? /*#__PURE__*/React.createElement("div", {
      className: "axis-onboarding-bloom-overlay",
      "aria-hidden": true,
      style: {
        opacity: onboardingBloomOpaque ? 1 : 0,
        transition: `opacity ${onboardingBloomFadeMs}ms ease-out`
      }
    }, /*#__PURE__*/
    React.createElement("div", { className: "axis-onboarding-bloom-overlay__wash" }),
    React.createElement("div", { className: "axis-onboarding-bloom-overlay__mark" }, "AXIS")) :
    null,
    dataLoadWarn && /*#__PURE__*/React.createElement("div", {
      role: "alert",
      style: {
        flexShrink: 0,
        padding: "10px 16px",
        fontSize: "var(--text-sm)",
        lineHeight: 1.35,
        textAlign: "center",
        background: "rgba(255, 80, 80, 0.15)",
        borderBottom: "1px solid rgba(255, 80, 80, 0.45)",
        color: "var(--text-primary, #f6f7f8)"
      } },
    dataLoadWarn),
    /*#__PURE__*/React.createElement(AxisOfflineBanner, null),
    React.createElement("div", { className: "axis-app-scroll-root", style: appContentStyle }, /*#__PURE__*/
    React.createElement(WorkoutApp, {
      theme: theme,
      toggleTheme: toggleTheme,
      nightMode: nightMode,
      toggleNight: toggleNight,
      onGuidedOpen: () => {} }
    )
    )
    ));

}

function axisBootstrapRenderApp() {
  try {
    if (typeof location !== "undefined" && !/[?&]noboard=1(?:&|$)/.test(String(location.search || ""))) {
      axisMigrateOnboardingLegacy();
      // Capacitor WKWebView: skip web onboarding redirect (Babel-onboarding is unreliable in the native shell).
      if (!axisIsCapacitorNative() && !axisLocalOnboardingComplete()) {
        let ob = "./onboarding";
        try {
          ob = typeof window.axisOnboardingHref === "function" ? window.axisOnboardingHref() : "./onboarding";
        } catch (e) {}
        window.location.replace(ob);
        return;
      }
    }
  } catch (e) {}
  try {
    const data = window.AXIS_JSON;
    if (!data || typeof data !== "object") throw new Error("AXIS_JSON missing: ensure axis_data.js loaded in <head> before this script");
    if (data.TRACKS && Object.keys(data.TRACKS).length) {
      TRACKS = axisNormalizeTracks(data.TRACKS);
    } else {
      throw new Error("AXIS_JSON: missing TRACKS");
    }
  } catch (err) {
    console.error("AXIS: workout data load failed", err);
    TRACKS = TRACKS_DATA_FALLBACK;
    window.__AXIS_DATA_LOAD_ERROR = "Workout library could not be read from window.AXIS_JSON (axis_data.js). Sessions will use fallback data until fixed. (" + (err && err.message ? err.message : String(err)) + ")";
  }
  try {
    if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
      showLoadErr("App libraries did not load. Check your connection and refresh.");
      return;
    }
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
    try {
      if (typeof window !== "undefined" && typeof window.axisDismissBootOverlay === "function") {
        window.axisDismissBootOverlay();
      }
    } catch (_e) {}
  } catch (e) {
    showLoadErr("Error: " + (e && e.message ? e.message : String(e)) + (e && e.stack ? "\n\n" + e.stack : ""));
  }
}

function bootstrapAxisApp() {
  window.__AXIS_DATA_LOAD_ERROR = "";
  axisHydrateNativeAuthFromStorage();
  axisPrimeAudioOnFirstGesture();
  axisNativeHideSplashFallback();
  axisBootstrapRenderApp();
  axisNativeShellInit().catch(() => {}).finally(() => axisNativeHideSplashFallback());
}
bootstrapAxisApp();
  