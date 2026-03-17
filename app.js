alert("SCRIPT EXECUTING");
console.log("APP.JS IS RUNNING");
const { useState, useEffect, useRef } = React;

// ---------------------------------------------------------------------
//  AXIS - COMPLETE APP (Onboarding -> Home -> Sessions)
// ---------------------------------------------------------------------

// ── ICON RENDERER ─────────────────────────────────────────────
function AxisIcon({ size = 72, color = "#F0EEEB" }) {
  const S = size;
  const pad = S * 0.05,usable = S - pad * 2,spacing = usable * 0.5;
  const xSize = spacing * 0.78,strokeW = S * 0.09,off = spacing / 2;
  const positions = [
  [S / 2 - off, S / 2 - off], [S / 2 + off, S / 2 - off],
  [S / 2 - off, S / 2 + off], [S / 2 + off, S / 2 + off]];

  return (/*#__PURE__*/
    React.createElement("svg", { width: S, height: S, viewBox: `0 0 ${S} ${S}` },
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

// ── ONBOARDING ────────────────────────────────────────────────
const obCss = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
  html,body,#root{width:100%;margin:0;padding:0;}
  .ob-wrap {
    min-height:100%; width:100%; display:flex; flex-direction:column; position:relative; overflow:clip;
    background:var(--ob-page-bg); font-family:'Barlow',sans-serif; font-weight:300;
    box-sizing:border-box;
  }
  /* orbs — match main app orbFloat + sheen when in color mode */
  @keyframes orbFloat { 0%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.06) translate(12px,-10px)} 100%{transform:scale(0.96) translate(-8px,14px)} }
  .ob-orbs-layer { position:fixed; inset:0; z-index:0; pointer-events:none; }
  .ob-orbs-layer::after { content:''; position:absolute; inset:0; pointer-events:none; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(255,255,255,0.02) 60%, transparent 100%); }
  .ob-label { display:none; }
  .ob-shell { width:100%; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; position:relative; z-index:1; flex:1; display:flex; flex-direction:column; box-sizing:border-box; }
  .ob-screen { width:100%; min-height:100vh; display:flex; flex-direction:column; position:relative; box-sizing:border-box; animation:obFadeIn 0.3s ease; }
  @keyframes obFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes obColorFadeIn { from { opacity:0; } to { opacity:1; } }
  .ob-color-reveal { animation: obColorFadeIn 2.5s ease-out forwards; }
  .ob-pad { padding:calc(env(safe-area-inset-top, 0px) + 72px) 32px 140px; flex:1; box-sizing:border-box; width:100%; }
  .ob-s0 {
    display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center;
    min-height:100vh; padding:60px 32px 80px; box-sizing:border-box;
  }
  .ob-s0-top { flex:1.4; display:flex; align-items:center; justify-content:center; width:100%; min-height:0; }
  .ob-s0-bottom { flex:1; display:flex; align-items:center; justify-content:center; width:100%; min-height:0; padding-top:24px; }
  .ob-splash-icon {
    width:110px; height:110px; border-radius:28px; margin-bottom:32px;
    background:var(--ob-nav-bg); border-top:1px solid var(--ob-box-border);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .ob-splash-name { font-size:48px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--ob-text-head); line-height:1; margin-top:44px; }
  .ob-splash-tag { margin-top:24px; font-size:13px; letter-spacing:0.28em; text-transform:uppercase; color:var(--ob-text-sec); }
  .ob-eyebrow { font-size:13px; font-weight:500; letter-spacing:0.26em; text-transform:uppercase; color:var(--ob-accent); margin-bottom:16px; }
  .ob-heading { font-size:42px; font-weight:600; letter-spacing:-0.03em; line-height:1.05; color:var(--ob-text-head); margin-bottom:20px; }
  .ob-heading em { font-style:italic; font-weight:300; color:var(--ob-accent); }
  .ob-body { font-size:15px; line-height:1.78; color:var(--ob-text-body); font-weight:400; }
  :root { --ob-box-bg: rgba(255,255,255,0.08); --ob-box-border: rgba(255,255,255,0.13); }
  .ob-sci-blocks { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
  .ob-sci {
    padding:14px 16px; border-radius:14px;
    background:var(--ob-box-bg); border:1px solid var(--ob-box-border);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-sci-label { font-size:13px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--ob-text-sec); margin-bottom:6px; }
  .ob-sci-text { font-size:15px; line-height:1.75; color:var(--ob-text-body); font-weight:400; }
  .ob-sci-text strong { color:var(--ob-text-head); font-weight:500; }
  .ob-benefits { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
  .ob-benefit {
    display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border-radius:14px;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-bi { flex-shrink:0; opacity:0.9; display:flex; align-items:center; padding-top:1px; }
  .ob-bt { font-size:15px; color:var(--ob-text-body); line-height:1.68; font-weight:300; }
  .ob-bt strong { color:var(--ob-text-head); font-weight:500; }
  .ob-disc { margin-top:20px; }
  .ob-disc-box {
    padding:14px 16px; border-radius:14px; margin-top:12px;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-disc-label { font-size:13px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--ob-text-sec); margin-bottom:8px; }
  .ob-disc-text { font-size:15px; line-height:1.78; color:var(--ob-text-body); font-weight:400; }
  .ob-disc-text strong { color:var(--ob-text-head); font-weight:500; }
  .ob-cal-glass {
    padding:20px 20px 24px; border-radius:20px; margin:16px 0 24px;
    background:var(--ob-box-bg); border:1px solid var(--ob-box-border);
    backdrop-filter:blur(24px) saturate(1.2); -webkit-backdrop-filter:blur(24px) saturate(1.2);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.12);
  }
  .ob-cta { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:100vh; padding:calc(env(safe-area-inset-top, 0px) + 60px) 32px 60px; }
  .ob-cta-icon {
    width:80px; height:80px; border-radius:22px; margin-bottom:32px;
    background:var(--ob-nav-bg); border-top:1px solid var(--ob-box-border);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .ob-cta-head { font-size:42px; font-weight:600; letter-spacing:-0.03em; line-height:1.05; color:var(--ob-text-head); margin-bottom:16px; }
  .ob-cta-head em { font-style:italic; font-weight:300; color:var(--ob-accent); }
  .ob-cta-sub { font-size:15px; color:var(--ob-text-body); line-height:1.78; margin-bottom:40px; font-weight:400; }
  .ob-btn-primary {
    width:100%; padding:16px; border-radius:14px; border:none; cursor:pointer;
    background:var(--ob-accent); color:var(--ob-accent-btn-text, #ffffff);
    font-family:'Barlow',sans-serif; font-weight:700; font-size:13px;
    letter-spacing:0.22em; text-transform:uppercase;
    transition:opacity 0.2s; margin-bottom:10px; display:block;
    box-shadow:0 4px 20px var(--ob-accent-glow);
  }
  .ob-btn-outline {
    width:100%; padding:16px; border-radius:14px; cursor:pointer;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    color:var(--ob-text-body); font-family:'Barlow',sans-serif; font-weight:500;
    font-size:13px; letter-spacing:0.22em; text-transform:uppercase;
    transition:all 0.2s; margin-bottom:16px; display:block;
  }
  .ob-btn-outline:hover { border-color:var(--ob-accent); color:var(--ob-accent); }
  .ob-btn-ghost { background:none; border:none; font-family:'Barlow',sans-serif; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:var(--ob-text-sec); cursor:pointer; transition:color 0.15s; }
  .ob-btn-ghost:hover { color:var(--ob-text-body); }
  .ob-ndots { display:flex; gap:6px; align-items:center; }
  .ob-nd { width:6px; height:6px; border-radius:50%; background:var(--ob-dot-bg); transition:all 0.3s; }
  .ob-nd.a { background:var(--ob-accent); transform:scale(1.3); box-shadow:0 0 8px var(--ob-accent-glow); }
  .ob-nav-bar {
    position:fixed; bottom:0; left:0; right:0;
    padding:16px 32px calc(env(safe-area-inset-bottom, 0px) + 20px);
    display:flex; justify-content:space-between; align-items:center; z-index:100;
    background:var(--ob-nav-bg);
    backdrop-filter:blur(40px) saturate(1.8); -webkit-backdrop-filter:blur(40px) saturate(1.8);
    border-top:1px solid rgba(255,255,255,0.14);
  }
  .ob-nav-next {
    padding:10px 24px; border-radius:20px; cursor:pointer; transition:all 0.15s;
    background:var(--ob-accent-dim); border:1px solid var(--ob-accent);
    color:var(--ob-accent); font-family:'Barlow',sans-serif; font-size:13px;
    font-weight:600; letter-spacing:0.18em; text-transform:uppercase;
  }
  .ob-nav-next:hover { background:var(--ob-accent); color:var(--ob-accent-btn-text, #ffffff); }
  .ob-nav-back {
    background:none; border:none; cursor:pointer; padding:8px 12px;
    font-family:'Barlow',sans-serif; font-size:18px; color:var(--ob-text-sec);
    opacity:0.6; transition:opacity 0.15s; line-height:1;
  }
  .ob-nav-back:hover { opacity:1; }
  .ob-nav-skip { background:none; border:none; font-family:'Barlow',sans-serif; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; color:var(--ob-text-sec); cursor:pointer; }
  .ob-ext-nav { display:none; }
  .ob-en-btn { display:none; }
`;

const obDarkVars = `
  --ob-page-bg: radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%);
  --ob-orb1: radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,179,237,0.18) 0%, transparent 70%);
  --ob-orb2: radial-gradient(ellipse 50% 60% at 80% 70%, rgba(167,139,250,0.15) 0%, transparent 70%);
  --ob-orb3: radial-gradient(ellipse 40% 40% at 60% 10%, rgba(251,191,36,0.10) 0%, transparent 70%);
  --ob-text-head:#ffffff; --ob-text-body:rgba(255,255,255,0.78); --ob-text-sec:rgba(255,255,255,0.50); --ob-text-dim:rgba(255,255,255,0.32);
  --ob-accent:#FFBF65; --ob-accent-text:#0a0e1a; --ob-accent-dim:rgba(255,191,101,0.18); --ob-accent-glow:rgba(255,191,101,0.30);
  --ob-nav-bg:rgba(8,13,24,0.80); --ob-dot-bg:rgba(255,255,255,0.20);
`;
const obLightVars = `
  --ob-page-bg: linear-gradient(145deg, #c8d8e8 0%, #d0dcea 35%, #dce4ec 70%, #e8eef4 100%);
  --ob-orb1: radial-gradient(ellipse 65% 55% at 10% 15%, rgba(80,140,200,0.13) 0%, transparent 65%);
  --ob-orb2: radial-gradient(ellipse 55% 65% at 90% 75%, rgba(100,160,210,0.10) 0%, transparent 65%);
  --ob-orb3: radial-gradient(ellipse 50% 45% at 55% 5%,  rgba(140,180,220,0.08) 0%, transparent 65%);
  --ob-text-head:#0f1e2e; --ob-text-body:rgba(15,30,46,0.88); --ob-text-sec:rgba(15,30,46,0.68); --ob-text-dim:rgba(15,30,46,0.50);
  --ob-accent:#1a4f7a; --ob-accent-text:#ffffff; --ob-accent-btn-text:#ffffff; --ob-accent-dim:rgba(26,79,122,0.14); --ob-accent-glow:rgba(26,79,122,0.28);
  --ob-nav-bg:rgba(220,232,244,0.92); --ob-dot-bg:rgba(15,30,46,0.22);
`;

// Main app backgrounds (dark/light) — onboarding uses these when in color mode so it matches the app
const MAIN_APP_BG = {
  dark: "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)",
  light: "linear-gradient(145deg, #dce6f0 0%, #e4ebf4 35%, #eaf0f7 70%, #f0f5fa 100%)"
};

// Brand logo PNGs: 02 = black on light (light theme), 05 = white on dark (dark theme)
const AXIS_LOGO_LIGHT = "Logo - Vector/AXIS_Branding_LightMode_Outlined.svg";
const AXIS_LOGO_DARK = "Logo - Vector/AXIS_Branding_DarkMode_Outlined.svg";

// Grey/monochrome theme for onboarding intro (screens 0–4) — color appears at Appearance
const OB_GREY = {
  dark: {
    bg: "radial-gradient(ellipse at 50% 40%, #1a1a1f 0%, #121218 45%, #0c0c10 100%)",
    orb1: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,255,255,0.04) 0%, transparent 70%)",
    orb2: "radial-gradient(ellipse 50% 60% at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 70%)",
    orb3: "radial-gradient(ellipse 40% 40% at 60% 10%, rgba(255,255,255,0.02) 0%, transparent 70%)",
    accent: "#9ca3af", accentDim: "rgba(156,163,175,0.2)", accentGlow: "rgba(156,163,175,0.15)",
    accentBtnText: "#0f0f12", textPrimary: "#f4f4f5", tabBg: "rgba(12,12,16,0.88)"
  },
  light: {
    bg: "linear-gradient(145deg, #e5e7eb 0%, #d1d5db 35%, #e5e7eb 70%, #f3f4f6 100%)",
    orb1: "radial-gradient(ellipse 65% 55% at 10% 15%, rgba(0,0,0,0.03) 0%, transparent 65%)",
    orb2: "radial-gradient(ellipse 55% 65% at 90% 75%, rgba(0,0,0,0.02) 0%, transparent 65%)",
    orb3: "radial-gradient(ellipse 50% 45% at 55% 5%, rgba(0,0,0,0.02) 0%, transparent 65%)",
    accent: "#4b5563", accentDim: "rgba(75,85,99,0.18)", accentGlow: "rgba(75,85,99,0.2)",
    accentBtnText: "#ffffff", textPrimary: "#111827", tabBg: "rgba(243,244,246,0.92)"
  }
};


function getCircadianPeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "dawn";
  if (h >= 11 && h < 17) return "midday";
  if (h >= 17 && h < 22) return "prime";
  return "rest";
}

const CIRCADIAN_THEMES = {
  // ── DAWN 5–11am — warm orange/amber, sunrise ──
  dawn: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 100% at 5% 20%, rgba(255,100,30,0.65) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 120% at 95% 80%, rgba(255,150,50,0.55) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(255,190,70,0.38) 0%, transparent 75%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(180,60,0,0.34) 0%, transparent 70%)",
      accent: "#FF8C35", accentDim: "rgba(255,140,53,0.25)", accentGlow: "rgba(255,140,53,0.55)",
      accentBtnText: "#1a0800",
      bg: "radial-gradient(ellipse at 30% 60%, #2d1200 0%, #1a0c00 50%, #0f0700 100%)",
      textPrimary: "#FFF0E0",
      tabBg: "rgba(15,7,0,0.88)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 100% at 5% 20%, rgba(255,120,40,0.28) 0%, transparent 72%)",
      orb2: "radial-gradient(ellipse 110% 120% at 95% 80%, rgba(255,165,70,0.22) 0%, transparent 74%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(255,200,90,0.17) 0%, transparent 76%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(220,120,30,0.14) 0%, transparent 72%)",
      accent: "#C85A00", accentDim: "rgba(200,90,0,0.18)", accentGlow: "rgba(200,90,0,0.38)",
      accentBtnText: "#ffffff",
      bg: "linear-gradient(160deg, #ffe8c8 0%, #ffd4a0 35%, #ffbf78 70%, #ffd4a8 100%)",
      textPrimary: "#2a1200"
    }
  },
  // ── MIDDAY 11–5pm — mint/teal, crisp and clear ──
  midday: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 100% at 10% 15%, rgba(0,220,180,0.65) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 120% at 90% 85%, rgba(0,200,160,0.55) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(40,240,200,0.38) 0%, transparent 75%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(0,120,100,0.34) 0%, transparent 70%)",
      accent: "#00E8C0", accentDim: "rgba(0,232,192,0.20)", accentGlow: "rgba(0,232,192,0.52)",
      accentBtnText: "#001f1a",
      bg: "radial-gradient(ellipse at 50% 30%, #001a14 0%, #001008 50%, #000a05 100%)",
      textPrimary: "#D0FFF5",
      tabBg: "rgba(0,8,4,0.88)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 100% at 10% 15%, rgba(0,200,160,0.20) 0%, transparent 72%)",
      orb2: "radial-gradient(ellipse 110% 120% at 90% 85%, rgba(0,180,140,0.15) 0%, transparent 74%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(40,220,180,0.12) 0%, transparent 76%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(0,140,110,0.10) 0%, transparent 72%)",
      accent: "#007A6A", accentDim: "rgba(0,122,106,0.16)", accentGlow: "rgba(0,122,106,0.34)",
      accentBtnText: "#ffffff",
      bg: "linear-gradient(160deg, #f0fffc 0%, #e0fff8 35%, #d0fff4 70%, #e8fff9 100%)",
      textPrimary: "#00261f"
    }
  },
  // ── PRIME 5–10pm — cool blue, winding down ──
  prime: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 100% at 10% 25%, rgba(30,100,255,0.35) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 120% at 90% 80%, rgba(60,150,240,0.32) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 90% 80% at 50% -10%, rgba(100,180,255,0.22) 0%, transparent 75%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(10,40,140,0.20) 0%, transparent 70%)",
      accent: "#4DA8FF", accentDim: "rgba(77,168,255,0.22)", accentGlow: "rgba(77,168,255,0.55)",
      accentBtnText: "#00102a",
      bg: "radial-gradient(ellipse at 50% 40%, #001428 0%, #000e1e 50%, #000810 100%)",
      textPrimary: "#D8EEFF",
      tabBg: "rgba(0,6,14,0.88)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 100% at 10% 25%, rgba(30,110,220,0.24) 0%, transparent 72%)",
      orb2: "radial-gradient(ellipse 110% 120% at 90% 80%, rgba(60,160,230,0.19) 0%, transparent 74%)",
      orb3: "radial-gradient(ellipse 90% 80% at 50% -10%, rgba(100,190,255,0.15) 0%, transparent 76%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(30,80,180,0.12) 0%, transparent 72%)",
      accent: "#1060C0", accentDim: "rgba(16,96,192,0.17)", accentGlow: "rgba(16,96,192,0.38)",
      accentBtnText: "#ffffff",
      bg: "linear-gradient(160deg, #d8eeff 0%, #c0e0ff 35%, #a8d4ff 70%, #c8e8ff 100%)",
      textPrimary: "#001830"
    }
  },
  // ── REST 10–5am — deep purple/indigo, calm and dim ──
  rest: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 100% at 15% 25%, rgba(100,30,220,0.35) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 120% at 85% 80%, rgba(140,50,255,0.32) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(80,20,160,0.22) 0%, transparent 75%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(50,0,100,0.20) 0%, transparent 70%)",
      accent: "#A060FF", accentDim: "rgba(160,96,255,0.22)", accentGlow: "rgba(160,96,255,0.52)",
      accentBtnText: "#0a0020",
      bg: "radial-gradient(ellipse at 50% 40%, #0a0018 0%, #060010 50%, #030008 100%)",
      textPrimary: "#E8D8FF",
      tabBg: "rgba(3,0,8,0.90)"
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 100% at 15% 25%, rgba(100,30,200,0.20) 0%, transparent 72%)",
      orb2: "radial-gradient(ellipse 110% 120% at 85% 80%, rgba(130,50,230,0.16) 0%, transparent 74%)",
      orb3: "radial-gradient(ellipse 90% 80% at 55% -10%, rgba(80,20,160,0.12) 0%, transparent 76%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(60,20,120,0.10) 0%, transparent 72%)",
      accent: "#6030B0", accentDim: "rgba(96,48,176,0.18)", accentGlow: "rgba(96,48,176,0.38)",
      accentBtnText: "#ffffff",
      bg: "linear-gradient(160deg, #ece0ff 0%, #ddd0ff 35%, #cec0ff 70%, #e0d4ff 100%)",
      textPrimary: "#180030"
    }
  }
};

function applyCircadianTheme(isDark, period) {
  const p = period || getCircadianPeriod();
  // Defensive: ensure we always have a valid theme object
  const themeEntry = CIRCADIAN_THEMES[p] || CIRCADIAN_THEMES["rest"] || Object.values(CIRCADIAN_THEMES)[0];
  const t = (themeEntry && themeEntry[isDark ? "dark" : "light"]) || themeEntry?.dark || CIRCADIAN_THEMES.rest.dark;
  let el = document.getElementById("circadian-style");
  if (!el) { el = document.createElement("style"); el.id = "circadian-style"; document.head.appendChild(el); }
  // Safely derive values with fallbacks
  try {
    const safe = (v, fallback) => (typeof v !== "undefined" && v !== null ? v : fallback);
    const accent = safe(t.accent, "#FFBF65");
    const accentDim = safe(t.accentDim, "rgba(255,191,101,0.18)");
    const accentGlow = safe(t.accentGlow, "rgba(255,191,101,0.30)");
    const orb1 = safe(t.orb1, "none");
    const orb2 = safe(t.orb2, "none");
    const orb3 = safe(t.orb3, "none");
    const tabBg = safe(t.tabBg, "rgba(8,12,18,0.85)");
    const textPrimary = safe(t.textPrimary, (isDark ? "#f6f7f8" : "#252525"));
    const accentBtnText = safe(t.accentBtnText, "#0a0e1a");
    const accentSecondary = (typeof accent === "string" && /^#[0-9a-fA-F]{6}$/.test(accent)) ? accent + "99" : (t.accentSecondary || accent);
    // guard accentDim replace usage
    const cueBar = typeof accentDim === "string" ? accentDim.replace(/[\d.]+\)$/, "0.7)") : accentDim;
    const cueBarLabel = typeof accentDim === "string" ? accentDim.replace(/[\d.]+\)$/, "0.9)") : accentDim;

    el.textContent = `
      [data-theme]:not([data-night="true"]) {
        --orb1: ${orb1} !important;
        --orb2: ${orb2} !important;
        --orb3: ${orb3} !important;
        --accent: ${accent} !important;
        --accent-secondary: ${accentSecondary} !important;
        --accent-dim: ${accentDim} !important;
        --accent-glow: ${accentGlow} !important;
        --cue-bar: ${cueBar} !important;
        --cue-bar-label: ${cueBarLabel} !important;
        --text-white: ${textPrimary} !important;
        --accent-btn-text: ${accentBtnText} !important;
        --tab-bg: ${tabBg} !important;
      }
      .app-orbs { transition: background 2s ease !important; }
    `;
  } catch (err) {
    // fallback minimal style to avoid breaking the script/runtime
    el.textContent = `
      :root { --accent: #FFBF65; --accent-dim: rgba(255,191,101,0.18); --tab-bg: rgba(8,12,18,0.85); --text-white: #f6f7f8; }
      .app-orbs { transition: background 2s ease !important; }
    `;
    console.error("applyCircadianTheme fallback:", err);
  }
  return { bg: t.bg || MAIN_APP_BG.dark };
}

function Onboarding({ theme, onComplete }) {
  const [cur, setCur] = useState(0);
  const total = 7;
  const [disclaimerName, setDisclaimerName] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [disclaimerWarning, setDisclaimerWarning] = useState(false);
  const todayStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const go = (n) => setCur(Math.max(0, Math.min(total - 1, n)));
  // Live circadian — onboarding matches the app color at time of signup
  const [obPeriod, setObPeriod] = useState(null); // null = none selected; first mood user picks lights up
  const [obTheme, setObTheme] = useState(theme || "dark");
  const [obAutoTime, setObAutoTime] = useState(false); // false = user picks mood/color; true = set and forget (follow time of day)
  const [obReason, setObReason] = useState(null); // "tightness" | "stress" | "routine" for calibration / Start here
  const [obArea, setObArea] = useState(null); // back / neck / hips / knees / feet / general
  const [obTime, setObTime] = useState(null); // 5 | 10 | 15 | 20 (minutes) for calibration
  const [hasChosenMood, setHasChosenMood] = useState(false); // Grey until user picks a mood on Appearance
  const [colorRevealed, setColorRevealed] = useState(false); // true after fade-in completes so we switch theme
  const iconColor = obTheme === "dark" ? "#ffffff" : "#111111";
  const periodForTheme = obPeriod ?? getCircadianPeriod();
  const ct = CIRCADIAN_THEMES[periodForTheme][obTheme === "dark" ? "dark" : "light"];
  const useGrey = cur < 4 || cur === 4 && !colorRevealed; // Grey until color fade-in completes after Appearance
  const t = useGrey ?
  OB_GREY[obTheme === "dark" ? "dark" : "light"] :
  { ...ct, bg: MAIN_APP_BG[obTheme === "dark" ? "dark" : "light"] };
  const colorTheme = { ...ct, bg: MAIN_APP_BG[obTheme === "dark" ? "dark" : "light"] };
  // After color overlay animation (2.5s), switch main theme to color
  useEffect(() => {
    if (!hasChosenMood) return;
    const done = setTimeout(() => setColorRevealed(true), 2600);
    return () => clearTimeout(done);
  }, [hasChosenMood]);
  const vars = `
    --ob-page-bg: ${t.bg};
    --ob-orb1: ${t.orb1};
    --ob-orb2: ${t.orb2};
    --ob-orb3: ${t.orb3};
    --ob-accent: ${t.accent};
    --ob-accent-dim: ${t.accentDim};
    --ob-accent-glow: ${t.accentGlow};
    --ob-accent-btn-text: ${t.accentBtnText || "#0a0e1a"};
    --ob-text-head: ${t.textPrimary || (obTheme === "dark" ? "#ffffff" : "#0f1e2e")};
    --ob-text-body: ${obTheme === "dark" ? "rgba(232,228,223,0.82)" : "rgba(15,30,46,0.78)"};
    --ob-text-sec: ${obTheme === "dark" ? "rgba(232,228,223,0.55)" : "rgba(15,30,46,0.55)"};
    --ob-text-dim: ${obTheme === "dark" ? "rgba(232,228,223,0.35)" : "rgba(15,30,46,0.38)"};
    --ob-dot-bg: ${obTheme === "dark" ? "rgba(232,228,223,0.20)" : "rgba(15,30,46,0.18)"};
    --ob-nav-bg: ${t.tabBg || (obTheme === "dark" ? "rgba(10,14,26,0.88)" : "rgba(255,255,255,0.80)")};
    --ob-box-bg: ${obTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
    --ob-box-border: ${obTheme === "dark" ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.12)"};
  `.replace(/\n\s*/g, ' ');

  const dots = (active) => /*#__PURE__*/
  React.createElement("div", { className: "ob-ndots" },
  Array.from({ length: total }).map((_, i) => /*#__PURE__*/
  React.createElement("div", { key: i, className: `ob-nd${i === active ? " a" : ""}` })
  )
  );


  return (/*#__PURE__*/
    React.createElement("div", { className: "ob-wrap", style: { background: t.bg, transition: "background 0.6s ease" } }, /*#__PURE__*/
    React.createElement("style", null, obCss, `:root,body,[data-ob]{${vars}}.ob-wrap{${vars}}`), /*#__PURE__*/
    React.createElement("div", { className: "ob-orbs-layer", style: {
        background: `${t.orb1}, ${t.orb2}, ${t.orb3}`,
        animation: "orbFloat 24s cubic-bezier(0.37,0,0.63,1) infinite alternate",
        transition: "background 0.6s ease"
      } }),
    hasChosenMood && !colorRevealed && /*#__PURE__*/
    React.createElement("div", {
      className: "ob-color-reveal",
      style: {
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0.5,
        background: colorTheme.bg,
        opacity: 0
      } }
    ),

    hasChosenMood && !colorRevealed && /*#__PURE__*/
    React.createElement("div", {
      className: "ob-color-reveal",
      style: {
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0.5,
        background: `${colorTheme.orb1}, ${colorTheme.orb2}, ${colorTheme.orb3}`,
        opacity: 0,
        animation: "obColorFadeIn 2.5s ease-out forwards, orbFloat 24s cubic-bezier(0.37,0,0.63,1) infinite alternate"
      } }
    ), /*#__PURE__*/

    React.createElement("div", { className: "ob-shell", onClick: (e) => {if (cur === 6) return;if (!e.target.closest("button") && !e.target.closest("input") && !e.target.closest(".ob-disclaimer-check")) go(cur + 1);} },
    cur === 0 && /*#__PURE__*/
    React.createElement("div", { className: "ob-screen ob-s0" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-s0-top" }, /*#__PURE__*/
    React.createElement("img", { src: obTheme === "dark" ? AXIS_LOGO_DARK : AXIS_LOGO_LIGHT, alt: "AXIS", style: { height: 200, width: "auto", objectFit: "contain" } })
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-s0-bottom" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-splash-tag" }, "X \xA0MOVE \xA0X\xA0 MEND \xA0X\xA0 MAINTAIN \xA0X"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ob-text-sec)", marginTop: 20, opacity: 0.9 } }, "Swipe to begin")
    )
    ),



    cur === 1 && /*#__PURE__*/React.createElement("div", { className: "ob-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow" }, "Alpha Build"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading", style: { fontSize: 32, fontWeight: 700, color: "var(--ob-text-head)" } }, "You're using AXIS Alpha"), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 20 } }, "Still a web prototype \u2014 a few rough edges, but ready to try."

    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 24 } }, "Thanks for helping us shape the final app!"

    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(0) }, "\u2190"),
    dots(1), /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-next", onClick: () => go(2) }, "Next")
    )
    ),

    cur === 2 && /*#__PURE__*/React.createElement("div", { className: "ob-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow" }, "The Perspective"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading" }, "Modern life beats up your ", /*#__PURE__*/React.createElement("em", null, "body.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 16 } }, "Screens, desks, and stress are just some of the things that contribute to back pain and \"tech neck.\" AXIS is your reset button."

    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-sci-blocks" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-sci" }, /*#__PURE__*/React.createElement("div", { className: "ob-sci-text" }, "80% of us get back pain.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-sci" }, /*#__PURE__*/React.createElement("div", { className: "ob-sci-text" }, "70% of desk workers fight neck tension.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-sci" }, /*#__PURE__*/React.createElement("div", { className: "ob-sci-text" }, "100% feel better moving smarter."))
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow", style: { marginTop: 24 } }, "The Foundation"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading" }, "Movement equals ", /*#__PURE__*/React.createElement("em", null, "medicine.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 20 } }, "AXIS isn't a workout. It's a nervous system reboot with research-backed moves that dial down pain and wake up your core."

    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(1) }, "\u2190"),
    dots(2), /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-next", onClick: () => go(3) }, "Next")
    )
    ),


    cur === 3 && /*#__PURE__*/React.createElement("div", { className: "ob-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow" }, "The Science"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading" }, "Movement is the signal your body needs to ", /*#__PURE__*/React.createElement("em", null, "repair.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 20, fontSize: 14, color: "var(--ob-text-sec)" } }, "Exercise therapy beats pills and passive fixes for chronic pain."

    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow", style: { marginTop: 24 } }, "The Method"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading" }, "One session. Total ", /*#__PURE__*/React.createElement("em", null, "reset.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 16 } }, "8 minute morning boost or evening deep release. AXIS fits your day. We handle the cues so you can stay in the flow."

    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-sci-blocks" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-sci" }, /*#__PURE__*/React.createElement("div", { className: "ob-sci-text", style: { fontStyle: "italic", opacity: 0.9 } }, "Show up and move. Your body does the rest."))
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(2) }, "\u2190"),
    dots(3), /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-next", onClick: () => go(4) }, "Next")
    )
    ),


    cur === 4 && /*#__PURE__*/React.createElement("div", { className: "ob-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad", style: { paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 80px)" } }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow" }, "Appearance"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading", style: { fontSize: 36 } }, "Set your ", /*#__PURE__*/React.createElement("em", null, "mood.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 28, fontSize: 14 } }, "Pick a mood; you can change it anytime in the app."

    ), /*#__PURE__*/


    React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 24 } },
    [{ val: "dark", label: "Dark" }, { val: "light", label: "Light" }].map(({ val, label }) => /*#__PURE__*/
    React.createElement("button", { key: val, onClick: () => setObTheme(val), style: {
        flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer",
        fontFamily: "'Barlow',sans-serif", fontSize: 12, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        border: obTheme === val ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)",
        background: obTheme === val ? "var(--ob-accent-dim)" : "var(--ob-box-bg)",
        color: obTheme === val ? "var(--ob-accent)" : "var(--ob-text-sec)",
        transition: "all 0.18s"
      } }, label)
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { marginBottom: 20 } }, /*#__PURE__*/
    React.createElement("div", { style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px", borderRadius: 14,
        background: obAutoTime ? "var(--ob-accent-dim)" : "var(--ob-box-bg)",
        border: obAutoTime ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)",
        transition: "all 0.2s"
      } }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 15, color: obAutoTime ? "var(--ob-accent)" : "var(--ob-text-head)", fontWeight: 600, marginBottom: 2 } }, "Auto"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 12, color: "var(--ob-text-sec)" } }, "Set and forget \u2014 colors follow the time of day")
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", role: "switch", "aria-checked": obAutoTime, onClick: () => setObAutoTime((v) => !v), style: {
        width: 48, height: 28, border: "1px solid", borderColor: obAutoTime ? "var(--ob-accent)" : "var(--ob-box-border)",
        borderRadius: 14, background: obAutoTime ? "var(--ob-accent)" : "var(--ob-box-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s"
      } }, /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", top: 3, left: obAutoTime ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: obTheme === "dark" ? "#fff" : "#111", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ob-text-sec)", marginBottom: 10 } },
    obAutoTime ? "Or choose a fixed mood" : "Choose a mood"
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, opacity: obAutoTime ? 0.85 : 1 } },
    [
    { p: "dawn", label: "Dawn", time: "5–11am", desc: "Warm amber",
      icon: /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M4 16 A 8 8 0 0 1 20 16" }), /*#__PURE__*/React.createElement("line", { x1: "0", y1: "16", x2: "24", y2: "16" })) },
    { p: "midday", label: "Midday", time: "11am–5pm", desc: "Cool mint",
      icon: /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "5" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "19", x2: "12", y2: "22" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "4.22", x2: "6.34", y2: "6.34" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "17.66", x2: "19.78", y2: "19.78" }), /*#__PURE__*/React.createElement("line", { x1: "2", y1: "12", x2: "5", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "19", y1: "12", x2: "22", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "19.78", x2: "6.34", y2: "17.66" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "6.34", x2: "19.78", y2: "4.22" })) },
    { p: "prime", label: "Prime", time: "5–10pm", desc: "Deep blue",
      icon: /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })) },
    { p: "rest", label: "Rest", time: "10pm–5am", desc: "Soft violet",
      icon: /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M12 3l1.5 5.5 6 .5-4.5 4 1.5 5.5L12 16l-4.5 2 1.5-5.5-4.5-4 6-.5L12 3z" })) }].
    map(({ p, label, time, desc, icon }) => {
      const pCt = CIRCADIAN_THEMES[p][obTheme === "dark" ? "dark" : "light"];
      const isNow = getCircadianPeriod() === p;
      const isSel = obPeriod === p;
      return (/*#__PURE__*/
        React.createElement("button", { key: p, onClick: () => {setObPeriod(p);setHasChosenMood(true);}, style: {
            display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
            borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
            border: isSel ? `1.5px solid ${pCt.accent}` : "1px solid var(--ob-box-border)",
            background: isSel ? pCt.accentDim : "var(--ob-box-bg)",
            transition: "all 0.18s"
          } }, /*#__PURE__*/
        React.createElement("div", { style: {
            width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: pCt.bg.includes("gradient") ? pCt.bg : pCt.accentDim,
            border: `1px solid ${pCt.accent}`,
            color: pCt.accent
          } }, icon), /*#__PURE__*/
        React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: "15px", fontWeight: 500, color: isSel ? pCt.accent : "var(--ob-text-head)", fontFamily: "'Barlow',sans-serif" } }, label), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: "12px", color: "var(--ob-text-dim)" } }, time),
        isNow && /*#__PURE__*/React.createElement("span", { style: { fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ob-accent)", opacity: 0.7 } }, "now")
        ), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: "12px", color: "var(--ob-text-sec)" } }, desc)
        ),
        isSel && /*#__PURE__*/React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: pCt.accent, flexShrink: 0 } })
        ));

    })

    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(3) }, "\u2190"),
    dots(4), /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-next", onClick: () => {if (obPeriod == null) {setObPeriod(getCircadianPeriod());setHasChosenMood(true);}go(5);} }, "Next")
    )
    ),


    cur === 5 && /*#__PURE__*/React.createElement("div", { className: "ob-screen ob-cta-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad", style: { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" } }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 6 } }, "Almost there"), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 20, fontSize: 14, color: "var(--ob-text-sec)" } }, "One quick setup, then you're in."

    ), /*#__PURE__*/

    React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 8 } }, "The Ethics"), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 24 } }, "No account. No tracking. Your data stays on your device."

    ), /*#__PURE__*/

    React.createElement("div", { className: "ob-cal-glass" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 6 } }, "Calibration"), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 8, fontSize: 15 } }, "Let's get you feeling better."), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 16, fontSize: 13, color: "var(--ob-text-sec)" } }, "We'll suggest a session that fits."), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 10, fontSize: 13 } }, "What are you feeling?"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 } },
    [{ val: "tightness", label: "I'm tight" }, { val: "stress", label: "I'm stressed" }, { val: "routine", label: "I'm pretty good" }].map(({ val, label }) => /*#__PURE__*/
    React.createElement("button", { key: val, onClick: () => setObReason(val), style: {
        padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: 13, fontWeight: 500,
        border: obReason === val ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)",
        background: obReason === val ? "var(--ob-accent-dim)" : "var(--ob-box-bg)",
        color: obReason === val ? "var(--ob-accent)" : "var(--ob-text-sec)",
        transition: "all 0.18s"
      } }, label)
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 10, fontSize: 13 } }, "Where do you feel it?"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 } },
    [
    { val: "back", label: "Back" }, { val: "neck", label: "Neck" }, { val: "shoulders", label: "Shoulders" }, { val: "hips", label: "Hips" },
    { val: "knees", label: "Knees" }, { val: "feet", label: "Feet" }, { val: "general", label: "Head" }].
    map(({ val, label }) => /*#__PURE__*/
    React.createElement("button", { key: val, onClick: () => setObArea(val), style: {
        padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: 13, fontWeight: 500,
        border: obArea === val ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)",
        background: obArea === val ? "var(--ob-accent-dim)" : "var(--ob-box-bg)",
        color: obArea === val ? "var(--ob-accent)" : "var(--ob-text-sec)",
        transition: "all 0.18s", width: "calc(25% - 6px)", minWidth: 72, boxSizing: "border-box"
      } }, label)
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 10, fontSize: 13 } }, "How much time do you have?"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
    [{ val: 5, label: "5 min." }, { val: 10, label: "10 min." }, { val: 15, label: "15 min." }, { val: 20, label: "20 min." }].map(({ val, label }) => /*#__PURE__*/
    React.createElement("button", { key: val, onClick: () => setObTime(val), style: {
        padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: 13, fontWeight: 500,
        border: obTime === val ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)",
        background: obTime === val ? "var(--ob-accent-dim)" : "var(--ob-box-bg)",
        color: obTime === val ? "var(--ob-accent)" : "var(--ob-text-sec)",
        transition: "all 0.18s"
      } }, label)
    )
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(4) }, "\u2190"),
    dots(5), /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-next", onClick: () => go(6) }, "Next")
    )
    ),


    cur === 6 && /*#__PURE__*/React.createElement("div", { className: "ob-screen ob-cta-screen" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-pad", style: { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" } }, /*#__PURE__*/
    React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 8 } }, "The Safety"), /*#__PURE__*/
    React.createElement("div", { className: "ob-heading", style: { fontSize: 36, marginBottom: 12 } }, "A note on your ", /*#__PURE__*/React.createElement("em", null, "safety.")), /*#__PURE__*/
    React.createElement("div", { className: "ob-body", style: { marginBottom: 16 } }, "AXIS provides movement guidance for general wellness. We are a supportive partner, not a substitute for medical advice. Listen to your body and stop if something hurts."

    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-sci-blocks", style: { marginBottom: 28 } }, /*#__PURE__*/
    React.createElement("div", { className: "ob-sci" }, /*#__PURE__*/
    React.createElement("div", { className: "ob-sci-text" }, "By continuing, you are taking responsibility for your journey. ", /*#__PURE__*/React.createElement("strong", null, "Let's move."))
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 8 } }, "Medical Disclaimer"), /*#__PURE__*/
    React.createElement("div", { style: {
        fontSize: 13, lineHeight: 1.72, color: "var(--ob-text-body)", fontWeight: 300,
        marginBottom: 24, padding: "16px", borderRadius: 14,
        background: "var(--ob-box-bg)", border: "1px solid var(--ob-box-border)"
      } }, "AXIS provides movement guidance for general wellness purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. The exercises and routines in this app are not designed to treat any medical condition.", /*#__PURE__*/

    React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "If you have any injury, chronic pain, cardiovascular condition, or other health concern, consult a qualified healthcare professional before beginning any exercise program. Stop immediately and seek medical attention if you experience pain, dizziness, shortness of breath, or discomfort during any movement.", /*#__PURE__*/

    React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "By continuing, you acknowledge that you are participating voluntarily and assume full responsibility for your use of this app."

    ), /*#__PURE__*/

    React.createElement("div", { style: { width: "100%", marginBottom: 20 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ob-text-sec)", marginBottom: 8, fontWeight: 500 } }, "Your Name"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "Full name",
      value: disclaimerName,
      onChange: (e) => {setDisclaimerName(e.target.value);setDisclaimerWarning(false);},
      style: {
        width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
        fontFamily: "'Barlow',sans-serif", fontWeight: 400,
        background: "var(--ob-box-bg)", border: disclaimerWarning && !disclaimerName ? "1.5px solid rgba(255,100,100,0.7)" : "1px solid var(--ob-box-border)",
        color: "var(--ob-text-head)", outline: "none", boxSizing: "border-box",
        WebkitAppearance: "none"
      } }
    )
    ), /*#__PURE__*/

    React.createElement("div", { style: { width: "100%", marginBottom: 24 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ob-text-sec)", marginBottom: 8, fontWeight: 500 } }, "Date"), /*#__PURE__*/
    React.createElement("div", { style: {
        padding: "12px 16px", borderRadius: 12, fontSize: 15,
        fontFamily: "'Barlow',sans-serif", fontWeight: 400,
        background: "var(--ob-box-bg)", border: "1px solid var(--ob-box-border)",
        color: "var(--ob-text-sec)"
      } }, todayStr)
    ), /*#__PURE__*/

    React.createElement("div", {
      className: "ob-disclaimer-check",
      onClick: () => {setDisclaimerChecked((c) => !c);setDisclaimerWarning(false);},
      style: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28, cursor: "pointer", width: "100%" } }, /*#__PURE__*/

    React.createElement("div", { style: {
        flexShrink: 0, width: 22, height: 22, borderRadius: 6, marginTop: 1,
        border: disclaimerWarning && !disclaimerChecked ? "1.5px solid rgba(255,100,100,0.7)" : "1.5px solid var(--ob-box-border)",
        background: disclaimerChecked ? "var(--ob-accent)" : "var(--ob-box-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.18s"
      } },
    disclaimerChecked && /*#__PURE__*/React.createElement("svg", { width: "12", height: "10", viewBox: "0 0 12 10", fill: "none" }, /*#__PURE__*/
    React.createElement("path", { d: "M1 5L4.5 8.5L11 1.5", stroke: "#0a0e1a", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 13, lineHeight: 1.65, color: "var(--ob-text-body)", fontWeight: 300 } }, "I have read and understand the disclaimer above. I confirm I am using this app at my own risk and will consult a healthcare professional if I have any concerns."

    )
    ),

    disclaimerWarning && /*#__PURE__*/
    React.createElement("div", { style: {
        width: "100%", marginBottom: 16, padding: "10px 14px", borderRadius: 10,
        background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)",
        fontSize: 12, color: "rgba(255,160,160,0.9)", lineHeight: 1.5
      } },
    !disclaimerName && !disclaimerChecked ?
    "Please enter your name and check the box to continue." :
    !disclaimerName ?
    "Please enter your name to continue." :
    "Please check the box to confirm you've read the disclaimer."
    ), /*#__PURE__*/


    React.createElement("button", {
      className: "ob-btn-primary",
      style: {
        width: "100%",
        opacity: disclaimerName.trim() && disclaimerChecked ? 1 : 0.35,
        cursor: disclaimerName.trim() && disclaimerChecked ? "pointer" : "not-allowed"
      },
      onClick: () => {
        if (!disclaimerName.trim() || !disclaimerChecked) {
          setDisclaimerWarning(true);
          return;
        }
        const record = {
          name: disclaimerName.trim(),
          date: new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          accepted: true
        };
        try {localStorage.setItem("axis_disclaimer", JSON.stringify(record));} catch (e) {}
        storageSet("axis_period", obAutoTime ? null : periodForTheme);
        storageSet("axis_theme", obTheme);
        storageSet("axis_calibration_reason", obReason || "routine");
        storageSet("axis_calibration_time", obTime != null ? obTime : 10);
        if (obArea != null) storageSet("axis_calibration_area", obArea);
        onComplete({ period: periodForTheme, theme: obTheme });
      } },
    "Let's Go")
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-nav-bar" }, /*#__PURE__*/
    React.createElement("button", { className: "ob-nav-back", onClick: () => go(5) }, "\u2190"),
    dots(6)
    )
    )

    ), /*#__PURE__*/

    React.createElement("div", { className: "ob-ext-nav" },
    ["Splash", "Alpha", "Perspective+Found", "Science+Method", "Appearance", "Ethics+Cal", "Safety+Disclaimer"].map((l, i) => /*#__PURE__*/
    React.createElement("button", { key: l, className: "ob-en-btn", onClick: () => go(i) }, l)
    ), /*#__PURE__*/
    React.createElement("button", { className: "ob-en-btn", style: { borderColor: "#FFBF65", color: "#FFBF65" }, onClick: onComplete }, "\u2192 Launch App")
    ), /*#__PURE__*/
    React.createElement("div", { className: "ob-label" }, "Tap screen or use controls \xB7 Begin buttons launch the app")
    ));

}

// ─────────────────────────────────────────────────────────────
//  TRACK DATA
// ─────────────────────────────────────────────────────────────

const DAILY_SECTIONS = [
{
  label: "Warm-up & Mobility", tag: "01",
  purpose: "Prepare the spine and joints for load. These movements are not a formality. They set the neurological tone for everything that follows. Move slowly and with full attention.",
  exercises: [
  { id: 1, name: "Cat–Cow", start: "On all fours — hands under shoulders, knees under hips.", sub: "Segmental Spinal Flexion/Extension", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Tabletop", focus: "SPINE", cue: "Hands under shoulders, knees under hips. Spine flat and parallel to floor. Neck long." },
    { pos: "B", label: "Cat — Exhale", focus: "FLEX", cue: "Round spine toward ceiling. Tuck chin to chest, tuck pelvis under. Breathe out fully." },
    { pos: "C", label: "Cow — Inhale", focus: "EXT", cue: "Let belly drop toward floor. Lift gaze and tailbone gently. Do not compress the lower back." }]
  },
  { id: 2, name: "Sphinx Pose", start: "Lying face down on the floor.", sub: "Low Prone Back Extension", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Prone Start", focus: "SETUP", cue: "Lie face down. Legs long, tops of feet flat. Elbows directly under shoulders." },
    { pos: "B", label: "Lift", focus: "EXT", cue: "Press forearms into floor. Lift chest and head. Shoulders away from ears. Hold 5–10s." }]
  },
  { id: 3, name: "Child's Pose", start: "Kneeling on the floor, sitting back toward your heels.", sub: "Rest & lengthen spine", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Kneel Upright", focus: "SETUP", cue: "Kneel with big toes together, knees hip-width apart. Sit back toward heels." },
    { pos: "B", label: "Fold Forward", focus: "STRETCH", cue: "Walk hands forward, forehead to floor. Arms extended or alongside body. Breathe into the back." }]
  },
  { id: 4, name: "Arm Circles", start: "Standing, feet hip-width apart.", sub: "Fwd & Bwd · Small to Large", type: "flow", seconds: 45, reps: "10 each direction", steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Feet hip-width. Arms extended at sides at shoulder height. Thumbs up, palms face forward." },
    { pos: "B", label: "Forward Circles", focus: "FORWARD", cue: "Start small — wrist-sized circles moving forward. Gradually increase to full arm sweeps. Keep shoulders down and relaxed. 10 reps." },
    { pos: "C", label: "Backward Circles", focus: "BACKWARD", cue: "Reverse direction. Same progression — small to large. Squeeze shoulder blades slightly on the back swing. 10 reps." }]
  }]

},
{
  label: "Core & Posterior Chain", tag: "02",
  purpose: "Build the deep stability that protects the spine under load. Quality over quantity. Slow, controlled reps with full awareness of position do more than fast repetitions ever will.",
  exercises: [
  { id: 5, name: "Pelvic Tilts", start: "Lying on your back, knees bent, feet flat on the floor.", sub: "Supine Posterior/Anterior Tilt", reps: "10–12 reps", type: "reps", steps: [
    { pos: "A", label: "Supine Neutral", focus: "SETUP", cue: "Lie on back. Knees bent, feet flat. Small natural arch in lower back. Arms at sides." },
    { pos: "B", label: "Posterior Tilt", focus: "CORE", cue: "Gently press lower back into floor. Engage deep abdominals. Hold 2s. Do not hold breath." },
    { pos: "C", label: "Anterior Tilt", focus: "RELEASE", cue: "Let the lower back arch slightly away from floor. Pelvis tips forward. Move slowly between B and C." }]
  },
  { id: 6, name: "Glute Bridge", start: "Lying on your back, knees bent, feet flat on the floor.", sub: "Bodyweight", reps: "12–15 reps", type: "reps", steps: [
    { pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on back. Feet flat, hip-width, heels 6 inches from glutes. Arms flat at sides." },
    { pos: "B", label: "Bridge Up", focus: "GLUTES", cue: "Drive through heels. Lift hips until shoulders, hips, knees form a straight line. Squeeze glutes at top." }]
  },
  { id: 7, name: "Marching Bridge", start: "Lying on your back with hips lifted in a glute bridge.", sub: "Keep hips level", reps: "6–8 alternating", type: "reps", steps: [
    { pos: "A", label: "Hold Bridge", focus: "SETUP", cue: "Perform a full Glute Bridge and hold at the top. Engage core. Do not let hips drop." },
    { pos: "B", label: "Lift One Foot", focus: "STABILITY", cue: "Slowly lift one foot off floor, knee to 90°. Hips stay perfectly level. Hold 2s." },
    { pos: "C", label: "Alternate", focus: "CONTROL", cue: "Lower foot, repeat other side. Think of balancing a glass of water on each hip." }]
  },
  { id: 8, name: "Dead Bug", start: "Lying on your back, arms reaching toward the ceiling.", sub: "Contralateral Arm/Leg", reps: "6–8 per side, slow", type: "reps", steps: [
    { pos: "A", label: "Supine Tabletop", focus: "SETUP", cue: "Lie on back. Arms reach to ceiling. Hips and knees at 90°. Press lower back firmly into floor." },
    { pos: "B", label: "Extend Opposite Limbs", focus: "CORE", cue: "Slowly lower right arm overhead and extend left leg toward floor. Keep back flat. Exhale throughout." },
    { pos: "C", label: "Return & Switch", focus: "CONTROL", cue: "Return to tabletop position. Repeat with left arm and right leg. Move in 4-second counts each way." }]
  },
  { id: 9, name: "Bird Dog", start: "On all fours — hands under shoulders, knees under hips.", sub: "Paused Extension", reps: "6–8 per side, 2–3s pause", type: "reps", steps: [
    { pos: "A", label: "Neutral Tabletop", focus: "SETUP", cue: "Hands under shoulders, knees under hips. Spine neutral. Brace core lightly before moving." },
    { pos: "B", label: "Extend & Pause", focus: "STABILITY", cue: "Reach right arm forward, left leg back. Both parallel to floor. Pause 2–3s. Do not rotate hips." },
    { pos: "C", label: "Return Controlled", focus: "CONTROL", cue: "Draw elbow to knee beneath the body (optional crunch). Reset to neutral. Switch sides." }]
  }]

},
{
  label: "Upper Body", tag: "03",
  purpose: "Restore strength and control to the shoulder girdle and chest. These movements rebuild the pushing and pulling patterns that daily life often imbalances. Keep the neck and jaw soft throughout.",
  exercises: [
  { id: 10, name: "High Plank", start: "Facing down, hands flat on the floor, body in a straight line.", sub: "Core tight, body straight", reps: "30 seconds", type: "time", seconds: 30, steps: [
    { pos: "A", label: "Hand Position", focus: "SETUP", cue: "Hands flat, shoulder-width. Fingers spread. Wrists stacked under shoulders." },
    { pos: "B", label: "Full Plank", focus: "HOLD", cue: "Body forms one straight line: head to heels. Squeeze glutes. Pull navel toward spine. Breathe." }]
  },
  { id: 11, name: "Wall Push-Ups", start: "Standing an arm's length from a wall.", sub: "Controlled tempo", reps: "10 reps", type: "reps", steps: [
    { pos: "A", label: "Wall Setup", focus: "SETUP", cue: "Stand arm's length from wall. Hands flat at shoulder height and width. Body straight." },
    { pos: "B", label: "Lower", focus: "ECCENTRIC", cue: "Bend elbows, lower chest toward wall. Take 2–3 seconds. Keep body rigid, no sagging hips." },
    { pos: "C", label: "Press Back", focus: "PUSH", cue: "Push through palms to return to start. Fully extend arms. 1-second pause at top." }]
  },
  { id: 12, name: "Isometric Wall Push Hold", start: "Standing an arm's length from a wall.", sub: "Halfway down position", reps: "30s hold", type: "time", seconds: 30, steps: [
    { pos: "A", label: "Wall Setup", focus: "SETUP", cue: "Same as Wall Push-Up starting position. Body straight, hands at shoulder height." },
    { pos: "B", label: "Halfway Hold", focus: "ISO", cue: "Lower to the midpoint — elbows at roughly 90°. Hold completely still. Do not let arms drift further." }]
  },
  { id: 13, name: "Resistance Band Row", start: "Standing, band anchored at chest height in front of you.", sub: "Elbows pull back, chest relaxed", reps: "10–15 reps", type: "reps", steps: [
    { pos: "A", label: "Band Setup", focus: "SETUP", cue: "Anchor band at chest height. Stand tall, holding one end in each hand. Slight tension at arm's length." },
    { pos: "B", label: "Row Back", focus: "PULL", cue: "Drive elbows straight back, hugging ribs. Shoulder blades squeeze together. Pause 1s at chest." },
    { pos: "C", label: "Controlled Return", focus: "RELEASE", cue: "Extend arms slowly — 2–3 seconds. Do not let shoulders roll forward at full extension." }]
  },
  { id: 14, name: "Wall Angels", start: "Standing with your back flat against a wall.", sub: "Or Floor Angels", reps: "6–10 slow reps", type: "reps", steps: [
    { pos: "A", label: "Wall Contact", focus: "SETUP", cue: "Stand with back, head, and glutes against wall. Arms bent at 90°, backs of hands touching wall." },
    { pos: "B", label: "Slide Up", focus: "RAISE", cue: "Slowly slide arms upward, maintaining contact with wall at all times. Go only as far as contact allows." },
    { pos: "C", label: "Slide Down", focus: "LOWER", cue: "Return to start position in 3s. If wall contact is lost, reduce range. Quality over range." }]
  }]

},
{
  label: "Lower Body & Rotation", tag: "04",
  purpose: "Release tension accumulated in the hips, hamstrings, and lumbar spine. Let gravity and breath do the work. These are passive holds. There is nothing to push through.",
  exercises: [
  { id: 15, name: "Supine Hamstring Stretch", start: "Lying on your back, both legs extended.", sub: "Straight-Leg Raise", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Supine Start", focus: "SETUP", cue: "Lie on back. Both legs extended flat. Lower back in neutral. Arms at sides." },
    { pos: "B", label: "Raise One Leg", focus: "STRETCH", cue: "Lift one leg with knee straight. Hold behind thigh or calf. Feel stretch in hamstring, not knee." }]
  },
  { id: 16, name: "Figure Four Stretch", start: "Lying on your back, knees bent, feet flat.", sub: "Supine Piriformis Stretch", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on back, knees bent, feet flat. Cross right ankle over left knee. Flex right foot." },
    { pos: "B", label: "Draw In", focus: "STRETCH", cue: "Clasp hands behind left thigh and gently draw both legs toward chest. Feel stretch in right outer hip." }]
  },
  { id: 17, name: "Windshield Wipers", start: "Lying on your back, knees bent, arms out in a T.", sub: "Supine Hip Rotation", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Supine, Feet Flat", focus: "SETUP", cue: "Lie on back. Knees bent, feet flat and hip-width. Arms in T, palms down for stability." },
    { pos: "B", label: "Lower Knees Right", focus: "ROTATE", cue: "Let both knees fall slowly to the right toward the floor. Keep shoulders flat. Breathe out." },
    { pos: "C", label: "Lower Knees Left", focus: "ROTATE", cue: "Sweep knees back through center and lower to the left. Move at a slow, windshield-wiper pace." }]
  },
  { id: 18, name: "Reclined Spinal Twist", start: "Lying on your back, one knee drawn to your chest.", sub: "Arms in T position", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Supine Start", focus: "SETUP", cue: "Lie on back. Draw right knee to chest. Arms out in a T, shoulders heavy on the floor." },
    { pos: "B", label: "Cross & Hold", focus: "TWIST", cue: "Guide right knee across body to the left with left hand. Turn gaze right if comfortable. Hold 20–30s each side." }]
  }]

},
{
  label: "Finish", tag: "05",
  purpose: "Signal to the nervous system that the work is done. These are decompression movements: not stretches to force, but positions to rest in. Take your time. There is no next thing.",
  exercises: [
  { id: 19, name: "Seated Forward Fold", start: "Seated on the floor, legs extended in front of you.", sub: "Relaxed Spine", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Seated Tall", focus: "SETUP", cue: "Sit with legs extended or slightly bent. Spine long. Hands on thighs. Breathe in." },
    { pos: "B", label: "Fold Forward", focus: "RELEASE", cue: "Hinge at hips, walk hands toward feet. Let spine round naturally. Head heavy. Hold 30–60s." }]
  },
  { id: 20, name: "Chin Tucks", start: "Seated or standing upright, eyes level with the horizon.", sub: "Cervical Retractions", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Head", focus: "SETUP", cue: "Sit or stand tall. Eyes level with horizon. Shoulders relaxed. No tension in jaw." },
    { pos: "B", label: "Retract", focus: "CERVICAL", cue: "Draw chin straight back — not down. Create a slight double chin. Hold 2s. Feel a gentle stretch at base of skull." }]
  },
  { id: 21, name: "Neck Half-Circles", start: "Seated upright, shoulders relaxed, eyes forward.", sub: "Controlled Tilts", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Start", focus: "SETUP", cue: "Sit tall, shoulders relaxed. Eyes forward. Do not perform full circles — avoid rolling the head back." },
    { pos: "B", label: "Right Tilt", focus: "LATERAL", cue: "Drop right ear toward right shoulder. Keep left shoulder down. Hold 3s. Return through center." },
    { pos: "C", label: "Left Tilt", focus: "LATERAL", cue: "Drop left ear toward left shoulder. Smooth arc only from ear to ear through chin. Never through the back." }]
  }]

}];


const RESTORATIVE_SECTIONS = [
{
  label: "Full Reset", tag: "RM",
  purpose: "Warm-up, circulation, and mobility. Each movement is 1 minute. This should feel easy, not tiring. Let the body move, not the mind.",
  exercises: [
  { id: 101, name: "Lymph Hops", start: "Standing, feet hip-width apart, knees soft.", sub: "Gentle rebounding to stimulate circulation", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Soft Stand", focus: "SETUP", cue: "Feet hip-width. Knees soft, never locked. Arms relaxed at sides. Jaw loose. Breathe naturally." },
    { pos: "B", label: "Micro Bounce", focus: "CIRCULATE", cue: "Rise gently onto the balls of your feet and let your heels drop back down. Barely leave the ground. Think: soft vibration, not jumps." },
    { pos: "C", label: "Rhythm", focus: "FLOW", cue: "Find a relaxed 1–2 beat. Let arms dangle and bounce passively. Face and shoulders stay completely soft. This should feel effortless." }]
  },
  { id: 102, name: "Body Waves", start: "Standing, feet hip-width, knees slightly bent.", sub: "Spinal undulation, head to tailbone", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Stand Loose", focus: "SETUP", cue: "Feet hip-width, knees slightly bent. Arms at sides. Imagine your spine is a string of loose beads." },
    { pos: "B", label: "Initiate Wave", focus: "MOBILIZE", cue: "Begin the wave at the top: let your head nod gently forward, then ripple the movement down through neck, chest, belly." },
    { pos: "C", label: "Full Undulation", focus: "FLOW", cue: "As the wave reaches the pelvis, let it curl forward then rise back up. Continuous, fluid figure-8. No forcing — gravity does the work." }]
  },
  { id: 103, name: "Arm Swings", start: "Standing, feet slightly wider than hips, arms relaxed.", sub: "Pendulum swings, shoulders passive", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Loose Stance", focus: "SETUP", cue: "Feet slightly wider than hips. Knees soft. Let arms hang completely relaxed from the shoulders." },
    { pos: "B", label: "Initiate Swing", focus: "MOMENTUM", cue: "Turn torso gently left — arms swing right passively, carried by momentum. Do not muscle the arms. They follow the body." },
    { pos: "C", label: "Continuous Turn", focus: "FLOW", cue: "Turn right — arms swing left. Find a pendulum rhythm. Arms may tap your sides lightly. Increase range gradually as you warm up." }]
  },
  { id: 108, name: "Forward / Backward Arm Circles", start: "Standing, feet hip-width apart.", sub: "Full shoulder rotation, both directions", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Feet hip-width. Arms at sides. Shoulders relaxed down. Begin with small circles and gradually increase the range." },
    { pos: "B", label: "Forward Circles", focus: "MOBILIZE", cue: "Both arms circle forward simultaneously — 15 slow rotations. Feel the shoulder joint moving through its full range." },
    { pos: "C", label: "Backward Circles", focus: "MOBILIZE", cue: "Reverse direction — 15 slow rotations backward. Backward circles open the chest and counteract forward shoulder posture." }]
  },
  { id: 109, name: "Dead Arms", start: "Standing, hinged slightly forward at the hips.", sub: "Passive shoulder release", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Slight Forward Lean", focus: "SETUP", cue: "Hinge slightly at the hips. Let both arms hang completely dead — no muscle engagement. Jaw loose." },
    { pos: "B", label: "Gentle Sway", focus: "RELEASE", cue: "Let the arms sway passively as you shift your weight side to side. Do not initiate any movement with the shoulder muscles. Gravity only." },
    { pos: "C", label: "Small Circles", focus: "DECOMPRESS", cue: "Let the arms trace small passive circles — clockwise, then counter-clockwise. This gently tractions the shoulder joints." }]
  },
  { id: 110, name: "Bent Over Back Shakes", start: "Standing, bent forward at the hips, upper body hanging down.", sub: "Spinal decompression, gravity assist", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Hinge Forward", focus: "SETUP", cue: "Hinge at the hips, knees soft. Let the upper body hang forward — arms dangling, head heavy. Let gravity decompress the spine." },
    { pos: "B", label: "Gentle Shake", focus: "RELEASE", cue: "Softly shake the upper body — small, effortless oscillations. Let the spine wobble freely. This releases the erectors and multifidus." },
    { pos: "C", label: "Side Sway", focus: "MOBILIZE", cue: "Add a gentle side-to-side sway. Let the arms swing. Stay loose. This is pure release — nothing to engage." }]
  },
  { id: 104, name: "Trunk Twists", start: "Standing, feet shoulder-width apart, arms loose at sides.", sub: "Rotational swing, arms passive", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Loose Stance", focus: "SETUP", cue: "Feet shoulder-width, knees soft. Arms hang at sides. Spine tall but not stiff." },
    { pos: "B", label: "Twist Right", focus: "ROTATE", cue: "Rotate torso to the right. Arms swing passively — left arm wraps across the front, right swings behind. Pivot on left ball of foot." },
    { pos: "C", label: "Twist Left", focus: "ROTATE", cue: "Swing back through center and rotate left. Right arm wraps front, left swings behind. Find a loose, rhythmic pendulum pace." }]
  },
  { id: 111, name: "Golf Swings", start: "Standing, feet shoulder-width, slight forward hinge at hips.", sub: "Full rotation with follow-through", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Address Position", focus: "SETUP", cue: "Feet shoulder-width. Slight hip hinge. Arms hang loose. Imagine holding a club — but keep the grip soft." },
    { pos: "B", label: "Backswing", focus: "ROTATE", cue: "Rotate through the hips and torso to the right, letting the arms follow passively. Left heel can lift slightly. No forcing." },
    { pos: "C", label: "Through Swing", focus: "RELEASE", cue: "Swing through to the left in one fluid motion. Arms follow the torso — do not lead with the arms. Alternate sides for 1 minute." }]
  },
  { id: 112, name: "Twist the Waist", start: "Standing, feet hip-width, hands on hips.", sub: "Isolated hip rotation, upper body still", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Feet hip-width. Hands on hips. Eyes forward. Upper body completely still throughout — only the hips move." },
    { pos: "B", label: "Hip Rotation", focus: "ISOLATE", cue: "Rotate the pelvis to the right, then sweep left in a continuous figure-8 or side-to-side motion. Upper body stays square." },
    { pos: "C", label: "Find Rhythm", focus: "MOBILIZE", cue: "Increase the range gradually. Feel the lumbar spine rotating freely. This is the movement that desk work robs you of most." }]
  },
  { id: 113, name: "March Taps", start: "Standing upright, shoulders relaxed.", sub: "Alternating knee lifts, arms opposite", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Upright Stance", focus: "SETUP", cue: "Stand tall. Shoulders relaxed. This is a gentle march — not a high-knee drill. Pace is easy and rhythmic." },
    { pos: "B", label: "Lift & Tap", focus: "CIRCULATE", cue: "Lift right knee to comfortable height, tap with left hand. Lower. Lift left knee, tap with right hand. Alternate continuously." },
    { pos: "C", label: "Add Arm Swing", focus: "FLOW", cue: "Let the opposite arm swing naturally with each step — just like walking. This cross-body pattern activates lymphatic flow bilaterally." }]
  },
  { id: 114, name: "Wide Arm Step Backs", start: "Standing, feet together, arms at sides.", sub: "Lateral step with full arm opening", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Neutral Start", focus: "SETUP", cue: "Feet together, arms at sides. Soft knees. This movement is slow and deliberate — not aerobic." },
    { pos: "B", label: "Step & Open", focus: "EXPAND", cue: "Step right foot back and wide as both arms sweep out to the sides and overhead — like opening a large book. Inhale." },
    { pos: "C", label: "Return & Close", focus: "FLOW", cue: "Step feet back together, arms return to sides. Exhale. Alternate sides. The arm sweep opens the chest and axillary lymph nodes." }]
  },
  { id: 105, name: "Ballet Squats", start: "Standing, feet wide, toes turned outward.", sub: "Wide stance pliés, toes turned out", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Wide Stance", focus: "SETUP", cue: "Feet wider than hips, toes turned out to roughly 10 and 2 o'clock. Arms out at sides or hands at heart center." },
    { pos: "B", label: "Plié Down", focus: "LOWER", cue: "Bend knees, tracking them over toes. Lower slowly — 3 seconds down. Keep torso upright, tailbone dropping straight down." },
    { pos: "C", label: "Rise Up", focus: "LIFT", cue: "Press through the full foot to return to standing — 2 seconds up. Gently squeeze inner thighs at the top. Do not lock knees." }]
  },
  { id: 106, name: "Tip Toe Arm Swings", start: "Standing, feet hip-width apart.", sub: "Rising onto toes with overhead reach", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Flat Foot", focus: "SETUP", cue: "Feet hip-width. Arms relaxed at sides. Soft knees. This is the low point of the movement." },
    { pos: "B", label: "Rise & Reach", focus: "LIFT", cue: "Rise onto tiptoes as arms sweep upward and forward to shoulder height or overhead. Inhale on the rise." },
    { pos: "C", label: "Lower & Swing", focus: "DRAIN", cue: "Lower heels as arms swing back down and behind. Exhale. The arm swing is passive — gravity-assisted. Continuous and flowing." }]
  },
  { id: 107, name: "Doorway Pec Stretch", start: "Standing in a doorway, arms at 90° on the frame.", sub: "Chest opening, shoulder mobility", reps: "30–60s hold", type: "time", seconds: 45, steps: [
    { pos: "A", label: "Doorway Position", focus: "SETUP", cue: "Stand in a doorway. Place both forearms on the frame at 90° — elbows at shoulder height, upper arms parallel to floor." },
    { pos: "B", label: "Step Through", focus: "STRETCH", cue: "Step one foot forward through the doorway. Let your body lean gently into the opening. Feel the chest and front shoulders open." },
    { pos: "C", label: "Hold & Breathe", focus: "RELEASE", cue: "Hold without forcing. Take 3 slow, deep breaths — each exhale, let the chest open a little more. Do not shrug shoulders." }]
  },
  { id: 115, name: "Wall Pushups", start: "Standing an arm's length from a wall.", sub: "Upper body close, standing", reps: "1 minute", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Hands on Wall", focus: "SETUP", cue: "Stand an arm's length from the wall. Place hands at shoulder height, slightly wider than shoulder-width. Body in a straight line." },
    { pos: "B", label: "Lower In", focus: "PUSH", cue: "Bend elbows and lean chest toward the wall. Keep the body rigid — no sagging hips. Elbows track at roughly 45° from the torso." },
    { pos: "C", label: "Press Out", focus: "EXTEND", cue: "Push back to start. Exhale on the push. Move slowly and with control. This is not about speed — it's about reactivating the chest and shoulders." }]
  }]

}];


const MORNING_SECTIONS = [
{
  label: "Morning Refresh", tag: "AM",
  purpose: "Wake the spine and nervous system gently. These seven movements take under 8 minutes and set the tone for how your body moves all day. Do them before you look at your phone.",
  exercises: [
  { id: 201, name: "Supine Knee Hugs", start: "Lying on your back, legs extended.", sub: "Gentle lumbar decompression", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Flat on Back", focus: "SETUP", cue: "Lie on your back. Let the body be completely heavy. Take two slow breaths before moving." },
    { pos: "B", label: "Hug Both Knees", focus: "DECOMPRESS", cue: "Draw both knees to chest. Wrap arms around shins. Rock gently side to side 5–8 times. Release lower back." }]
  },
  { id: 202, name: "Supine Twist", start: "Lying on your back, knees bent and together.", sub: "Both sides, 30s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Knees to Chest", focus: "SETUP", cue: "Lie on back, knees bent and together. Arms out in a T. Shoulders heavy." },
    { pos: "B", label: "Drop Right", focus: "ROTATE", cue: "Let both knees fall to the right. Turn gaze left if comfortable. Breathe and let gravity do the work for 30 seconds." },
    { pos: "C", label: "Drop Left", focus: "ROTATE", cue: "Return knees through center, drop left. Hold another 30 seconds. No forcing — just releasing." }]
  },
  { id: 203, name: "Cat–Cow", start: "On all fours — hands under shoulders, knees under hips.", sub: "Segmental spinal warm-up", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Tabletop", focus: "SETUP", cue: "Hands under shoulders, knees under hips. Spine flat. Take one breath here before moving." },
    { pos: "B", label: "Cat", focus: "FLEX", cue: "Round spine to ceiling, tuck pelvis and chin. Full exhale." },
    { pos: "C", label: "Cow", focus: "EXT", cue: "Let belly drop, lift gaze and tailbone gently. Full inhale. 8–10 slow cycles." }]
  },
  { id: 204, name: "Standing Hip Circles", start: "Standing, feet hip-width, hands on hips.", sub: "Hands on hips, full rotation", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Feet hip-width. Hands on hips. Soft knees. Eyes forward or closed." },
    { pos: "B", label: "Circle Right", focus: "MOBILIZE", cue: "Make slow, large circles with the pelvis — forward, right, back, left. 6 circles clockwise." },
    { pos: "C", label: "Circle Left", focus: "MOBILIZE", cue: "Reverse direction. 6 circles counter-clockwise. Let the hips move freely without rushing." }]
  },
  { id: 205, name: "Shoulder Rolls", start: "Standing or seated upright, arms relaxed at sides.", sub: "Forward then backward, slow", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Arms at Sides", focus: "SETUP", cue: "Stand or sit tall. Arms completely relaxed. Jaw soft." },
    { pos: "B", label: "Roll Forward", focus: "ANTERIOR", cue: "Shrug shoulders up toward ears, then roll them forward and down. 6 slow rolls." },
    { pos: "C", label: "Roll Back", focus: "POSTERIOR", cue: "Reverse — shrug up, roll back and down. 6 rolls. Feel the shoulder blades move and the chest open." }]
  },
  { id: 206, name: "Sun Breath", start: "Standing, feet hip-width, arms at sides.", sub: "Arms overhead with breath, 6 cycles", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Stand Grounded", focus: "SETUP", cue: "Feet hip-width. Arms at sides. Close the eyes. Feel the weight of the body through the soles of the feet." },
    { pos: "B", label: "Inhale & Rise", focus: "EXPAND", cue: "Breathe in slowly for 4 counts as arms sweep out to the sides and overhead. Palms meet or stay wide." },
    { pos: "C", label: "Exhale & Lower", focus: "GROUND", cue: "Breathe out for 6 counts as arms float back down. Feel the chest and ribcage expand on the inhale. 6 full cycles." }]
  }]

}];


const PRIME_SECTIONS = [
{
  label: "Better Sleep Stretch", tag: "PM",
  purpose: "A deliberate transition from doing to being. These movements lower cortisol, decompress the spine after a day of load, and prepare the nervous system for sleep. Move slowly. There is nothing left to do.",
  exercises: [
  { id: 301, name: "Legs Up the Wall", start: "Lying on your back, scooted close to a wall.", sub: "Passive inversion, 2–3 minutes", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Sit sideways against the wall, then swing legs up. Hips as close to the wall as comfortable. Arms out at sides, palms up." },
    { pos: "B", label: "Hold & Breathe", focus: "RESTORE", cue: "Let gravity drain the legs. Close the eyes. Breathe naturally. This posture reverses venous pooling and calms the nervous system." }]
  },
  { id: 302, name: "Reclined Butterfly", start: "Lying on your back, soles of feet together.", sub: "Supine bound angle, hips open", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Soles Together", focus: "SETUP", cue: "Lie on back. Bring the soles of your feet together and let knees fall wide. Place hands on belly or out at sides." },
    { pos: "B", label: "Gravity Hold", focus: "RELEASE", cue: "Let the inner thighs and groin soften completely. Do not push. Hold 60–90s." }]
  },
  { id: 303, name: "Knees to Chest Rock", start: "Lying on your back, knees hugged to chest.", sub: "Gentle lumbar massage", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Hug Knees", focus: "SETUP", cue: "Lie on back. Hug both knees to chest. Interlock fingers over shins." },
    { pos: "B", label: "Rock Side to Side", focus: "MASSAGE", cue: "Rock gently left and right. Let the lower back release against the floor. 10–15 slow rocks." }]
  },
  { id: 304, name: "Supine Twist", start: "Lying on your back, one knee drawn to chest.", sub: "Extended hold, both sides", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Lie on back. Draw right knee to chest. Arms in a T, shoulders grounded." },
    { pos: "B", label: "Cross Right", focus: "TWIST", cue: "Guide right knee across to the left with left hand. Turn gaze right. Hold for 45–60s." },
    { pos: "C", label: "Cross Left", focus: "TWIST", cue: "Return through center. Draw left knee across right. Gaze left. Hold another 45–60s." }]
  },
  { id: 305, name: "4-7-8 Breath", start: "Seated comfortably or lying down.", sub: "Parasympathetic activation", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Comfortable Position", focus: "SETUP", cue: "Lie flat or sit upright. Eyes closed. Place one hand on the chest, one on the belly." },
    { pos: "B", label: "Inhale 4", focus: "INHALE", cue: "Breathe in through the nose for 4 slow counts. Feel the belly rise before the chest." },
    { pos: "C", label: "Hold 7, Exhale 8", focus: "EXHALE", cue: "Hold for 7 counts. Exhale completely through the mouth for 8 counts. Repeat 4–6 cycles." }]
  }]

}];


const DESK_SECTIONS = [
{
  label: "The Desk Break", tag: "QR",
  purpose: "Six movements to undo an hour of sitting. Stand up and do it now — don't wait for a better time.",
  exercises: [
  { id: 401, name: "Standing Chest Opener", start: "Standing upright.", sub: "Hands clasped behind back", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Stand away from your chair. Feet hip-width. Interlace fingers behind your back." },
    { pos: "B", label: "Open & Lift", focus: "STRETCH", cue: "Straighten arms, draw shoulder blades together, lift hands slightly. Open chest toward ceiling. Hold 20–30s." }]
  },
  { id: 402, name: "Chin Tucks", start: "Seated upright in a chair, eyes level.", sub: "Cervical retractions", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Head", focus: "SETUP", cue: "Sit or stand tall. Eyes level. Shoulders relaxed." },
    { pos: "B", label: "Retract", focus: "CERVICAL", cue: "Draw chin straight back — not down. Create a slight double chin. Hold 2s. 10 reps." }]
  },
  { id: 403, name: "Thoracic Rotations", start: "Seated in a chair, hands behind your head.", sub: "Seated, hands behind head", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Sit Tall", focus: "SETUP", cue: "Sit at edge of chair. Feet flat. Interlace hands behind head. Elbows wide. Spine long." },
    { pos: "B", label: "Rotate Right", focus: "THORACIC", cue: "Rotate upper body to the right — elbows leading. Keep hips square. Hold 2s at end range." },
    { pos: "C", label: "Rotate Left", focus: "THORACIC", cue: "Return through center, rotate left. Equal range each side. The rotation comes from the mid-back, not the neck." }]
  },
  { id: 404, name: "Standing Hip Flexor Stretch", start: "Standing, about to step into a lunge.", sub: "Kneeling lunge, 30s each side", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Half Kneel", focus: "SETUP", cue: "Kneel on right knee, left foot forward. Hips square. Hands on left thigh for support." },
    { pos: "B", label: "Shift Forward", focus: "STRETCH", cue: "Gently shift weight forward until you feel a stretch in the right hip flexor. Keep torso upright. Hold 30s each side." }]
  },
  { id: 405, name: "Wrist & Forearm Release", start: "Standing or seated, one arm extended in front of you.", sub: "Both directions, 30s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Extend Arm", focus: "SETUP", cue: "Extend one arm forward, palm facing down. Use other hand to gently pull fingers back toward you." },
    { pos: "B", label: "Flex Stretch", focus: "FOREARM", cue: "Hold 15–20s. Feel the forearm extensors lengthen. Reverse — palm up, pull fingers down. Hold 15–20s. Switch arms." }]
  },
  { id: 406, name: "Neck Side Tilts", start: "Seated or standing upright, shoulders relaxed.", sub: "Gravity only, 20s each side", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Sit Tall", focus: "SETUP", cue: "Sit at edge of chair. Spine long. Shoulders down and relaxed." },
    { pos: "B", label: "Drop Right", focus: "STRETCH", cue: "Let right ear fall toward right shoulder. Gravity only — no forcing. Left shoulder stays grounded. 20s." },
    { pos: "C", label: "Drop Left", focus: "STRETCH", cue: "Return through center. Drop left ear. 20s. Return slowly." }]
  }]

}];


const SCREEN_SECTIONS = [
{
  label: "Digital Detox", tag: "SR",
  purpose: "The neck and upper traps absorb everything — hours of screen time, stress, poor posture, shallow breathing. This session undoes it. Move slowly and without urgency. This area responds to patience, not force.",
  exercises: [
  { id: 501, name: "Chin Tucks", start: "Seated upright, eyes level with the horizon.", sub: "Cervical retraction, 10 reps", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Sit or Stand Tall", focus: "SETUP", cue: "Eyes level with horizon. Shoulders relaxed down. Jaw soft. This is the single most important correction for forward head posture." },
    { pos: "B", label: "Retract", focus: "CERVICAL", cue: "Draw chin straight back — not down. Create a slight double chin. Hold 2s. Feel a stretch at the base of the skull. Release slowly. 10 reps." }]
  },
  { id: 502, name: "Neck Side Tilt", start: "Seated upright, shoulders relaxed and level.", sub: "Gravity only, 30s each side", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Sit Tall", focus: "SETUP", cue: "Sit or stand. Spine long. Shoulders relaxed down away from ears. Eyes forward." },
    { pos: "B", label: "Right Ear Down", focus: "STRETCH", cue: "Let the right ear fall toward the right shoulder. Do not force — use gravity only. Hold 30s. Left shoulder stays down." },
    { pos: "C", label: "Left Ear Down", focus: "STRETCH", cue: "Return through center, drop left ear. Hold 30s. For deeper release, rest hand lightly on top of head — do not pull." }]
  },
  { id: 503, name: "Levator Scapulae Stretch", start: "Seated, one hand anchoring the shoulder down.", sub: "Corner neck stretch, 30s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Turn & Tilt", focus: "SETUP", cue: "Turn head 45° to the right and tilt chin toward the right armpit. Feel the stretch from the base of the skull toward the left shoulder blade." },
    { pos: "B", label: "Add Weight", focus: "DEEPEN", cue: "Rest the right hand gently on the back of the head — do not pull. Hold 30s. Switch sides. This targets the levator scapulae, the most screen-tension muscle." }]
  },
  { id: 504, name: "Upper Trap Release", start: "Seated, one hand holding the seat edge for traction.", sub: "Seated hand hold, 30s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Anchor Shoulder", focus: "SETUP", cue: "Sit on right hand to anchor the right shoulder down. Sit tall. This prevents the shoulder from shrugging up and reduces the stretch." },
    { pos: "B", label: "Lean Left", focus: "STRETCH", cue: "With right shoulder anchored, slowly tilt the head to the left and slightly forward. Feel the right upper trap lengthen. Hold 30s. Switch." }]
  },
  { id: 505, name: "Thread the Needle", start: "On all fours — hands under shoulders, knees under hips.", sub: "Thoracic rotation from tabletop", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Tabletop", focus: "SETUP", cue: "Hands under shoulders, knees under hips. Spine neutral. Take a breath before moving." },
    { pos: "B", label: "Thread Right", focus: "ROTATE", cue: "Slide right arm along the floor under the left arm. Right shoulder and ear rest on floor. Hold 30s. Feel the mid-back open." },
    { pos: "C", label: "Thread Left", focus: "ROTATE", cue: "Return to tabletop. Left arm threads under right. Hold 30s each side. This releases the thoracic spine that screen time locks up." }]
  },
  { id: 506, name: "Eagle Arms", start: "Seated or standing upright, arms at your sides.", sub: "Shoulder blade separation, 30s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Cross Arms", focus: "SETUP", cue: "Sit or stand tall. Cross right arm over left at the elbows. Wrap forearms and try to bring palms together." },
    { pos: "B", label: "Lift & Hold", focus: "STRETCH", cue: "Lift elbows to shoulder height. Feel the space between the shoulder blades open. Hold 30s. Switch arm cross. Targets the rhomboids." }]
  },
  { id: 507, name: "Chest Opener with Clasp", start: "Standing upright, hands clasped behind your back.", sub: "Behind-back retraction, 30s", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Clasp Behind", focus: "SETUP", cue: "Stand tall. Interlace fingers behind the back. Straighten arms. Draw shoulder blades together gently." },
    { pos: "B", label: "Lift & Open", focus: "EXPAND", cue: "Lift clasped hands slightly away from the body. Open the chest. Chin slightly up. Hold 30s. This directly counters the forward curl of screen posture." }]
  }]

}];


const HIP_SECTIONS = [
{
  label: "Happy Hips", tag: "HM",
  purpose: "The hips are the body's centre of power — and the first thing to tighten from sitting. Restricted hips pull on the lower back, destabilise the knees, and shorten the stride. These holds release the hip flexors, rotators, and adductors. Stay in each position. Let gravity and breath do the work.",
  exercises: [
  { id: 601, name: "90/90 Hip Stretch", start: "Seated on the floor, both knees bent at 90°.", sub: "Both sides, 60s each", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Sit to Floor", focus: "SETUP", cue: "Sit on the floor. Right leg bent in front at 90°, knee and ankle on the ground. Left leg bent behind at 90°. Both shins parallel." },
    { pos: "B", label: "Sit Tall Over Front Leg", focus: "INTERNAL", cue: "Sit upright over the front (right) shin. Feel the external rotation of the right hip. Press the right knee gently toward the floor. Hold 60s." },
    { pos: "C", label: "Hinge Forward", focus: "DEEPEN", cue: "Hinge at the hips and walk hands forward over the front shin. Keep spine long — do not round. Hold 30s additional. Switch sides." }]
  },
  { id: 602, name: "Kneeling Hip Flexor Stretch", start: "In a half-kneeling lunge, one knee on the floor.", sub: "Low lunge, 60s each side", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Half Kneel", focus: "SETUP", cue: "Kneel on right knee, left foot forward. Hips square. Stack left knee over left ankle. Place hands on left thigh." },
    { pos: "B", label: "Shift & Tuck", focus: "STRETCH", cue: "Shift hips forward until you feel a deep stretch in the right hip flexor and front of the right thigh. Tuck the pelvis slightly under — do not arch the lower back." },
    { pos: "C", label: "Arm Reach", focus: "DEEPEN", cue: "Reach right arm overhead and lean slightly left. This lengthens the hip flexor through the full chain to the ribcage. Hold 60s. Switch sides." }]
  },
  { id: 603, name: "Pigeon Pose", start: "On the floor, front shin angled across the body.", sub: "Supported, 90s each side", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "From tabletop, slide right knee forward behind right wrist. Extend left leg straight back. Right ankle moves toward left hip — the sharper the angle, the more intense. Important: the stretch should always be felt in the outer hip, never in the knee. If you feel any sensation in the knee joint, back the ankle closer to your body." },
    { pos: "B", label: "Square Hips", focus: "ALIGN", cue: "Place a folded blanket or block under the right glute if the hip doesn't reach the floor. Hips stay as square as possible — do not let the pelvis tilt to one side." },
    { pos: "C", label: "Fold Forward", focus: "RELEASE", cue: "Walk hands forward and lower chest toward the floor. Rest on forearms or forehead. Let the right hip surrender completely. Breathe into the outer right hip. Hold 90s." }]
  },
  { id: 604, name: "Supine Figure Four", start: "Lying on your back, knees bent, feet flat.", sub: "Piriformis release, 60s each", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Lie on back, knees bent, feet flat. Cross right ankle over left knee. Flex the right foot to protect the knee joint." },
    { pos: "B", label: "Draw In", focus: "STRETCH", cue: "Clasp hands behind left thigh and draw both legs toward chest. Feel the stretch deep in the right outer hip and glute. This targets the piriformis — the primary sciatic nerve compressor." },
    { pos: "C", label: "Rock Gently", focus: "RELEASE", cue: "Rock slowly left and right to find the deepest point of tension. Hold 60s. Switch sides. Do not pull aggressively — let the muscle release on its own timeline." }]
  },
  { id: 605, name: "Butterfly Stretch", start: "Seated on the floor, soles of feet together.", sub: "Soles together, gravity hold", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Sit Tall", focus: "SETUP", cue: "Sit on the floor. Bring soles of feet together, letting knees fall wide. Hold feet with both hands. Sit on a folded blanket if the lower back rounds." },
    { pos: "B", label: "Let Knees Drop", focus: "ADDUCTORS", cue: "Do not press the knees down. Let gravity do the work. The inner thighs and groin will release over time — not through force. Hold 60s." },
    { pos: "C", label: "Hinge Forward", focus: "DEEPEN", cue: "Hinge forward at the hips — spine long, not rounded. Walk hands forward. Feel the inner groin deepen. Hold 30s. Return upright slowly." }]
  },
  { id: 606, name: "Lateral Hip Opener", start: "Lying on your side, legs stacked.", sub: "Side-lying stretch, 45s each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Side Lie", focus: "SETUP", cue: "Lie on your right side. Right arm extended, right ear resting on it. Stack hips and shoulders. Both knees bent at 90°." },
    { pos: "B", label: "Open Top Knee", focus: "ABDUCTOR", cue: "Keeping feet together, lift the left knee toward the ceiling like a clamshell opening. Do not let the pelvis roll back. Hold at the top 2s." },
    { pos: "C", label: "Hip Circle", focus: "MOBILIZE", cue: "From open, draw a slow circle with the left knee — forward, down, back, up. 5 circles each direction. Feel the femoral head moving freely in the socket. Switch sides." }]
  },
  { id: 607, name: "Standing Hip Circles", start: "Standing, feet hip-width, hands on hips.", sub: "Full rotation, both directions", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Feet hip-width. Hands on hips. Soft knees. Eyes forward or closed. This is the integration movement — done last to bring range into a standing pattern." },
    { pos: "B", label: "Slow Circles", focus: "MOBILIZE", cue: "Make large, slow circles with the pelvis — forward, right, back, left. Exaggerate the range in each direction. 8 circles clockwise." },
    { pos: "C", label: "Reverse", focus: "MOBILIZE", cue: "8 circles counter-clockwise. Move deliberately through any stiff points rather than skipping past them. The goal is a smooth, continuous arc." }]
  }]

}];


const BACK_SECTIONS = [
{
  label: "Lower Back Soother", tag: "BP",
  purpose: "For days when the lower back is tight, achy, or recovering. These movements decompress, not strengthen — gravity and breath do the work. Nothing here should hurt. If something does, skip it and rest in Child's Pose. This is not the session to push through.",
  exercises: [
  { id: 701, name: "Knee Hugs", start: "Lying on your back.", sub: "Lumbar decompression, 60s", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Flat on Back", focus: "SETUP", cue: "Lie on your back. Let the whole body be heavy. Take two slow breaths before moving — this releases baseline tension before you begin." },
    { pos: "B", label: "Hug Both Knees", focus: "DECOMPRESS", cue: "Draw both knees to chest. Wrap arms around shins. Rock gently side to side. Feel the lower back lengthen and release against the floor." },
    { pos: "C", label: "Hold Still", focus: "RELEASE", cue: "Find the position of most ease and hold completely still. Breathe into the lower back. Feel the lumbar vertebrae gently separate with each inhale. 60s total." }]
  },
  { id: 702, name: "Supine Pelvic Tilts", start: "Lying on your back, knees bent, feet flat.", sub: "10–12 slow reps", type: "reps", reps: "10–12 reps", steps: [
    { pos: "A", label: "Lie on Back", focus: "SETUP", cue: "Knees bent, feet flat. Small natural arch in lower back — this is neutral. Arms flat at sides. Do not flatten the back before you begin." },
    { pos: "B", label: "Posterior Tilt", focus: "CORE", cue: "Gently press the lower back into the floor by engaging the deep abdominals. Hold 2s. The movement is subtle — this is not a crunch." },
    { pos: "C", label: "Return to Neutral", focus: "RELEASE", cue: "Let the arch return. Move slowly and smoothly between positions. This re-educates the muscles that stabilise the lumbar spine." }]
  },
  { id: 703, name: "Cat–Cow", start: "On all fours — hands under shoulders, knees under hips.", sub: "Slow and segmental, 10 cycles", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Neutral Tabletop", focus: "SETUP", cue: "Hands under shoulders, knees under hips. Spine neutral. Take one full breath here before moving. This is the most therapeutic movement for the lumbar spine." },
    { pos: "B", label: "Cat — Exhale", focus: "FLEX", cue: "Round the spine segment by segment toward the ceiling. Tuck chin and pelvis. Exhale fully. Move slowly — feel each vertebra." },
    { pos: "C", label: "Cow — Inhale", focus: "EXT", cue: "Let the belly drop, lift gaze and tailbone gently. Do not compress — open. Inhale fully. 10 slow cycles. Increase the range gradually as the back warms." }]
  },
  { id: 704, name: "Child's Pose", start: "Kneeling, about to sit back toward your heels.", sub: "Extended hold, 90s", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Kneel Back", focus: "SETUP", cue: "From tabletop, sit hips back toward heels. Knees hip-width or wider. Toes together. Arms extend forward or rest alongside the body." },
    { pos: "B", label: "Forehead Down", focus: "DECOMPRESS", cue: "Rest forehead on floor or hands. Let the whole spine lengthen. Breathe into the back body — feel the ribcage expand outward with each inhale." },
    { pos: "C", label: "Side Reach", focus: "LATERAL", cue: "Walk both hands to the right. Feel the left side of the body lengthen. Hold 30s. Return through center. Walk hands left. Hold 30s. Return." }]
  },
  { id: 705, name: "Windshield Wipers", start: "Lying on your back, knees bent, arms in a T.", sub: "Slow rotation, 10 reps each", type: "flow", seconds: 45, steps: [
    { pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on back. Knees bent, feet flat and hip-width. Arms in a T, palms down. Shoulders stay grounded throughout." },
    { pos: "B", label: "Lower Right", focus: "ROTATE", cue: "Let both knees fall slowly to the right — only as far as comfortable. Breathe out. Feel the lumbar spine rotate and release. Shoulders do not lift." },
    { pos: "C", label: "Lower Left", focus: "ROTATE", cue: "Sweep knees back through center and lower to the left. Slow, windshield-wiper pace. This is traction for the lumbar vertebrae — gravity does the work." }]
  },
  { id: 706, name: "Reclined Spinal Twist", start: "Lying on your back.", sub: "Extended hold, 60s each side", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Lie on back. Draw right knee to chest. Arms in a T, shoulders heavy. This passively rotates the lumbar spine and releases the QL — the deepest lower back muscle." },
    { pos: "B", label: "Cross Right", focus: "TWIST", cue: "Guide right knee across to the left with left hand. Right arm extends, turn gaze right. Let gravity take the knee toward the floor — do not force it. Hold 60s." },
    { pos: "C", label: "Cross Left", focus: "TWIST", cue: "Return through center slowly. Draw left knee across to the right. Gaze left. Hold 60s. Equal time each side. The release often comes in the final 20 seconds." }]
  },
  { id: 707, name: "Legs Up the Wall", start: "Lying on your back, scooted close to a wall.", sub: "Passive inversion, 2 minutes", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Sit sideways against a wall, then swing legs up. Hips as close to the wall as comfortable — it is fine to have a slight bend in the knees." },
    { pos: "B", label: "Settle & Breathe", focus: "RESTORE", cue: "Let the lower back release toward the floor. Arms out at sides, palms up. Eyes closed. This drains venous pooling from the legs and decompresses the lumbar spine passively." },
    { pos: "C", label: "Stay", focus: "RELEASE", cue: "Simply remain here. Breathe slowly. Each exhale, let the body get heavier. This is the most restorative position for a fatigued lower back. Two full minutes." }]
  }]

}];



// ─────────────────────────────────────────────────────────────
//  STAY STEADY — Balance & Proprioception
// ─────────────────────────────────────────────────────────────
const STEADY_SECTIONS = [
{
  label: "Foundation", tag: "01",
  purpose: "Train the systems your body uses to prevent falls — the vestibular system, ankle strategy, and glute activation. These movements feel simple and are deceptively hard to do well. Slow down.",
  exercises: [
  { id: 801, name: "Weight Shifts", start: "Standing, feet hip-width, near a wall for safety.", sub: "Ankle strategy training, standing", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Neutral Stance", focus: "SETUP", cue: "Stand feet hip-width. Arms relaxed at sides. Soft knees — never locked. Eyes on a fixed point at eye level." },
    { pos: "B", label: "Side-to-Side Shifts", focus: "ANKLE", cue: "Slowly shift your weight to the right until the left foot is nearly unloaded. Pause 2 seconds. Shift left. Use your ankles, not your hips — think of yourself as a pendulum, not a seesaw." },
    { pos: "C", label: "Forward & Back", focus: "PROPRIOCEPTION", cue: "Shift weight forward toward the balls of your feet, then back toward the heels. Stay within a comfortable range. Feel the floor through your feet — this is your sensory feedback loop." }]
  },
  { id: 802, name: "Single-Leg Stance", start: "Standing near a wall, balanced on one foot.", sub: "Vestibular & glute med activation", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Stand Tall", focus: "SETUP", cue: "Stand near a wall or sturdy chair within arm's reach — use it for safety, not support. Find a fixed point at eye level to focus on — this is your visual anchor. Arms at sides or lightly touching the wall." },
    { pos: "B", label: "Lift One Foot", focus: "BALANCE", cue: "Lift one foot a few inches off the floor. Keep the stance leg slightly bent — never lock the knee. The hip of the lifted leg should drop slightly, which means the standing glute med is working. Hold 20–30 seconds each side." },
    { pos: "C", label: "Eyes Closed Progression", focus: "VESTIBULAR", cue: "Once stable with eyes open, close them. This removes visual compensation and forces the vestibular and somatosensory systems to do the work. Even 5–10 seconds eyes-closed is a meaningful challenge." }]
  }]

},
{
  label: "Dynamic Balance", tag: "02",
  purpose: "Moving balance is harder than standing still. These patterns train the brain to manage balance during locomotion — the context where most real-world stumbles happen.",
  exercises: [
  { id: 803, name: "Tandem Walking", start: "Standing at one end of a clear path.", sub: "Heel-to-toe, narrow base of support", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Starting Position", focus: "SETUP", cue: "Stand tall. Heel of one foot touching the toes of the other. Find a line on the floor or imagine a tightrope. Arms out at sides for balance assist if needed." },
    { pos: "B", label: "Walk Forward", focus: "BALANCE", cue: "Step forward, placing the heel of the leading foot directly against the toes of the back foot. Take 10 slow, deliberate steps forward. Eyes forward — not down at your feet." },
    { pos: "C", label: "Walk Backward", focus: "VESTIBULAR", cue: "Reverse direction — 10 steps back, toe touching heel. Walking backward is a separate vestibular challenge. Move slowly. This is a clinical tool used in fall prevention programs." }]
  },
  { id: 804, name: "Grapevine Walk", start: "Standing with space to move laterally.", sub: "Lateral crossover steps, hip coordination", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Side Start", focus: "SETUP", cue: "Stand tall, feet together. You will move laterally. Clear enough space for 8–10 sideways steps. Arms out slightly for balance." },
    { pos: "B", label: "Cross & Step", focus: "COORDINATE", cue: "Step right with the right foot. Cross the left foot in front of the right. Step right again. Cross left foot behind the right. Repeat continuously. The alternating front/back crossover is the key pattern — it requires the brain to sequence hip abductor and adductor firing." },
    { pos: "C", label: "Reverse Direction", focus: "BILATERAL", cue: "Lead with the left foot back across the same path. Each direction uses a different motor pattern. Aim for smooth, continuous movement — choppy steps mean the brain is still learning the sequence." }]
  }]

},
{
  label: "Strength & Control", tag: "03",
  purpose: "Eccentric control — the ability to decelerate your own bodyweight — is the single most important physical factor in fall prevention for adults over 40. Most injuries happen on the way down, not up.",
  exercises: [
  { id: 805, name: "Lateral Step-Downs", start: "Standing on a low step or curb, one foot at the edge.", sub: "Eccentric quad loading, 4-inch step", type: "reps", reps: "8–10 reps each side", steps: [
    { pos: "A", label: "Find Your Step", focus: "SETUP", cue: "Stand on the edge of a bottom stair, curb, or low stool (4–6 inches high). Stand sideways so one foot is on the edge. The other foot hangs free over the side. Hold a wall lightly for safety — not for support." },
    { pos: "B", label: "Slow Descent", focus: "ECCENTRIC", cue: "Bend the standing leg to slowly lower the hanging foot toward the floor. Take 3–4 full seconds to descend. The standing knee should track directly over the second toe — not collapsing inward. This slow lowering is the entire point: you are training the quad to control deceleration." },
    { pos: "C", label: "Return to Top", focus: "CONTROL", cue: "Before the hanging foot touches the floor, reverse direction and press back to standing. Do not push off the lower foot — all the work comes from the standing leg. Switch sides after all reps." }]
  }]

}];


// ─────────────────────────────────────────────────────────────
//  MOVE FREELY — Joint Integrity & Synovial Fluid Flow
// ─────────────────────────────────────────────────────────────
const FREELY_SECTIONS = [
{
  label: "Spine", tag: "01",
  purpose: "Most adults over 40 have lost thoracic extension without knowing it. This single deficit drives frozen shoulder, neck strain, and lower back compensation. Address it directly.",
  exercises: [
  { id: 901, name: "Thoracic Extension", start: "Seated in a chair, hands behind your head.", sub: "Over chair back — mid-spine mobilization", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Chair Setup", focus: "SETUP", cue: "Sit at the edge of a firm chair. Place both hands behind your head, fingers interlaced, supporting the weight of your head. Identify the middle of your back — the thoracic spine, roughly between your shoulder blades. This is the target." },
    { pos: "B", label: "Arch Back", focus: "EXTEND", cue: "Lean back so the top edge of the chair back contacts your mid-spine. Let the upper back gently arch over the support. Do not extend the lower back or neck — this is a thoracic-only movement. Breathe out as you arch. Feel the front of the chest opening." },
    { pos: "C", label: "Segment & Breathe", focus: "MOBILIZE", cue: "Hold for 2–3 breaths at each level. Then shift slightly up or down the chair back to target adjacent segments. 3–5 positions across the thoracic spine. Never force — the weight of your head is sufficient traction." }]
  }]

},
{
  label: "Upper Body", tag: "02",
  purpose: "CARS — Controlled Articular Rotations — are the gold standard for joint health. Each rep moves the joint through its full available range under active muscular tension. Think: moving through thick honey. No momentum. The resistance comes entirely from you.",
  exercises: [
  { id: 902, name: "Neck CARs", start: "Seated or standing upright, spine long.", sub: "Controlled Articular Rotation — cervical spine", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Setup & Brace", focus: "SETUP", cue: "Sit or stand tall. Pack the shoulders down away from ears. Engage the muscles of the neck lightly — imagine you are trying to make a double chin. This pre-tension is what makes CARs different from a regular neck stretch: the joint moves, the surrounding tissues stay engaged." },
    { pos: "B", label: "The Half-Arc", focus: "CARS", cue: "Begin by drawing your chin toward your chest. Slowly arc the head to the right — ear toward right shoulder, continuing the arc until the ear moves toward the left shoulder, then chin returns to chest. One full half-arc takes 8–10 seconds. Move as if carving through resistance. Never tilt the head back — the arc travels chin to chest only, never through the back of the neck." },
    { pos: "C", label: "Reverse & Repeat", focus: "END-RANGE", cue: "At any point where you feel stiffness or reduced range, slow down further and breathe into that position. Do not push through pain or any sharp sensation. Reverse direction for one full arc. 2–3 rotations each direction is sufficient. If you feel dizziness at any point, stop immediately and rest." }]
  },
  { id: 903, name: "Shoulder CARs", start: "Standing, one arm at your side.", sub: "Controlled Articular Rotation — glenohumeral joint", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Setup & Lock Down", focus: "SETUP", cue: "Stand tall. Work one arm at a time. Before moving, engage the lat on the working side — imagine trying to crush a walnut in your armpit. This stabilizes the scapula so the ball-and-socket joint does the work, not the whole shoulder blade." },
    { pos: "B", label: "Full Arc Forward", focus: "CARS", cue: "Keeping the arm straight and under tension, lift it forward and up overhead in a large circle. As it passes overhead, rotate the palm to face behind you, then continue the circle down behind your back as far as your range allows. Move through thick resistance. The entire arc should take 10–12 seconds." },
    { pos: "C", label: "Reverse Arc", focus: "END-RANGE", cue: "At the limit of your range behind the body, pause and breathe. Reverse the circle — same path, same resistance, same slow pace. Switch arms after 2 full rotations. The shoulder that feels stuck is the one that needs this most." }]
  },
  { id: 904, name: "Wrist CARs", start: "Seated or standing, forearms resting or extended.", sub: "Controlled Articular Rotation — radiocarpal joint", type: "time", seconds: 45, steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Sit or stand. Extend both arms in front at shoulder height. Make loose fists. Engage the forearm muscles lightly — you should feel mild tension in the forearm, not the fingers. This active tension is what makes this therapeutic rather than passive." },
    { pos: "B", label: "Full Rotation", focus: "CARS", cue: "Slowly rotate both wrists simultaneously through their full available range: flex down, rotate toward the little finger side, extend back, rotate toward the thumb side. One full circle takes 6–8 seconds. Move as if drawing large circles in the air with your knuckles." },
    { pos: "C", label: "Reverse & Isolate", focus: "END-RANGE", cue: "Reverse direction for equal rotations. If one wrist has less range in a particular direction, slow down there — that is where the synovial fluid is most restricted. 4–5 rotations each direction is a complete set." }]
  }]

},
{
  label: "Lower Body", tag: "03",
  purpose: "The hip and ankle are the most neglected joints for adults who sit. Synovial fluid only reaches cartilage during movement — compression from sitting drives it out. These rotations restore joint space and end-range control.",
  exercises: [
  { id: 905, name: "Hip CARs", start: "Standing, one hand lightly on a wall for balance.", sub: "Controlled Articular Rotation — hip joint", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Setup & Stabilize", focus: "SETUP", cue: "Stand on one leg. Hold a wall lightly with one hand for safety only — not for balance support. Engage the standing glute to keep the pelvis completely still. The entire point of Hip CARs is that the pelvis does not move — only the femur in the hip socket. Squeeze the core before lifting the leg." },
    { pos: "B", label: "Full Circumduction", focus: "CARS", cue: "Lift the free knee and begin rotating the hip: knee lifts forward, swings out to the side, extends behind the body, sweeps back to center. One full rotation takes 8–10 seconds. Keep the circle as large as your range allows while the pelvis stays completely still. If the hip hikes or the lower back twists, you have exceeded your available range — make the circle smaller." },
    { pos: "C", label: "Reverse & Switch", focus: "END-RANGE", cue: "Reverse direction for the same number of rotations. At any restricted point in the arc, slow further and breathe. 2–3 rotations each direction, each side. The hip that feels grinding or clicking is the one that needs the most consistent attention." }]
  },
  { id: 906, name: "Ankle CARs", start: "Seated or standing, one foot lifted off the floor.", sub: "Controlled Articular Rotation — talocrural joint", type: "time", seconds: 45, steps: [
    { pos: "A", label: "Seated Setup", focus: "SETUP", cue: "Sit in a chair. Cross one ankle over the opposite knee so the foot is free in the air. Hold the lower leg just above the ankle to stabilize the shin — you want the foot to move, not the whole leg. Engage the muscles of the lower leg lightly." },
    { pos: "B", label: "Full Rotation", focus: "CARS", cue: "Draw the largest circle possible with your big toe. Move clockwise: point the foot forward, rotate out, flex back, rotate in. Take 5–6 seconds per full rotation. Most people discover significant restriction when moving into dorsiflexion (toes pulled back) — this is the direction that matters most for walking and balance." },
    { pos: "C", label: "Reverse & Switch", focus: "END-RANGE", cue: "Reverse direction. 4–5 rotations each way per foot. If the ankle feels stiff or crunchy, this is synovial fluid restriction — not a reason to stop, but a reason to go slower and breathe through the range." }]
  },
  { id: 907, name: "Adductor Rock-Back", start: "On all fours, one knee wide to the side.", sub: "Posterior hip capsule & inner thigh release", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Quadruped Setup", focus: "SETUP", cue: "Begin on hands and knees. Hands under shoulders, knees under hips. Spine neutral. Extend one leg directly out to the side — keep it straight, toes pointing forward or slightly down. The extended leg forms a 90-degree angle with your body." },
    { pos: "B", label: "Rock Back", focus: "STRETCH", cue: "Slowly shift your hips back toward your heels, keeping the extended leg in place. You will feel a deep stretch along the inner thigh and the back of the hip on the extended side. Take 3–4 seconds to rock back. Breathe out during the descent. Do not round the lower back." },
    { pos: "C", label: "Rock Forward & Repeat", focus: "RELEASE", cue: "Rock forward to the starting position. Pause briefly, then rock back again. 8–10 slow repetitions, then switch sides. This movement targets the posterior hip capsule and adductors — two structures that chronic sitting locks into permanent shortening." }]
  }]

}];



// ─────────────────────────────────────────────────────────────
//  FEET FIRST — Plantar Fasciitis & Foot Health
// ─────────────────────────────────────────────────────────────
const FEET_SECTIONS = [
{
  label: "Release", tag: "01",
  purpose: "Start here, especially on pain days. The plantar fascia and calf complex are often tight and compressed before you've taken your first step. These movements soften the tissue and restore blood flow before asking anything of it.",
  exercises: [
  { id: 1001, name: "Plantar Fascia Stretch", start: "Seated in a chair, one foot crossed over the opposite knee.", sub: "Seated toe extension hold", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Seated Setup", focus: "SETUP", cue: "Sit in a chair. Cross one foot over the opposite knee so the sole faces you. Hold the base of the toes with one hand. This is the windlass mechanism — the same tissue that loads with every walking step." },
    { pos: "B", label: "Extend the Toes", focus: "STRETCH", cue: "Gently pull all toes back toward the shin until you feel a firm stretch along the arch. You should feel the plantar fascia tighten into a cord-like band. Hold this position — do not bounce. 30 seconds minimum. Research shows this specific stretch reduces morning pain more effectively than calf stretching alone." },
    { pos: "C", label: "Massage the Arch", focus: "RELEASE", cue: "While holding the toe extension with one hand, use the thumb of the other hand to apply firm, slow strokes along the arch from heel to ball of foot. 5–6 strokes per set. Switch feet." }]
  },
  { id: 1002, name: "Seated Foot Roll", start: "Seated in a chair, a ball or bottle under one foot.", sub: "Plantar fascia myofascial release", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Find Your Tool", focus: "SETUP", cue: "A frozen water bottle is ideal — the cold provides additional anti-inflammatory benefit. A tennis ball or smooth water bottle at room temperature also works. Place it on the floor in front of your chair." },
    { pos: "B", label: "Roll the Arch", focus: "RELEASE", cue: "Place the arch of one foot on the bottle. Apply moderate downward pressure — enough to feel it, not enough to cause sharp pain. Slowly roll from the heel to the ball of the foot and back. 30 seconds per foot. Pause on any tender spots for 5–10 seconds rather than rolling through them." },
    { pos: "C", label: "Target the Heel", focus: "FASCIAL", cue: "Shift pressure toward the heel — specifically the medial tubercle of the calcaneus, where the fascia attaches. This is typically the most sensitive spot. Use lighter pressure here. Slow, sustained pressure is more effective than rolling speed." }]
  },
  { id: 1003, name: "Gastroc Stretch", start: "Standing, hands on a wall, one foot stepped back.", sub: "Standing calf stretch, straight knee", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Wall Setup", focus: "SETUP", cue: "Stand facing a wall, hands flat at shoulder height for support. Step one foot back about 18–24 inches, keeping both feet pointing straight forward. The back knee stays completely straight throughout — this targets the gastrocnemius, the larger calf muscle that crosses the knee." },
    { pos: "B", label: "Lunge Forward", focus: "STRETCH", cue: "Bend the front knee and shift your weight forward until you feel a deep stretch in the calf of the back leg. Keep the back heel firmly on the floor — if it lifts, step the foot closer. Hold for 30–45 seconds. The gastroc is directly connected to the Achilles tendon, which loads the plantar fascia." },
    { pos: "C", label: "Switch & Repeat", focus: "BILATERAL", cue: "Switch sides. If one side is significantly tighter, spend an extra round there. Tight calves are among the most common contributing factors to plantar fasciitis — they increase load on the fascia with every step." }]
  },
  { id: 1004, name: "Soleus Stretch", start: "Standing at a wall, back knee bent, rear heel down.", sub: "Bent-knee calf stretch — deeper target", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Wall Setup", focus: "SETUP", cue: "Same starting position as the Gastroc Stretch — one foot stepped back, hands on wall. But this time, bend the back knee slightly. This small change completely shifts the stretch from the gastrocnemius to the soleus — the deeper, shorter calf muscle that attaches below the knee." },
    { pos: "B", label: "Sink Into It", focus: "STRETCH", cue: "With the back knee bent, shift weight gently forward. The stretch will feel lower and deeper than the gastroc stretch — closer to the Achilles and heel. Keep the back heel on the floor. Hold 30–45 seconds. The soleus is often the tighter of the two calf muscles and the more overlooked." },
    { pos: "C", label: "Switch Sides", focus: "BILATERAL", cue: "Repeat on the other side. If you have one-sided plantar fasciitis, pay particular attention to the soleus on that side. This stretch is often prescribed alone for cases where standard calf stretching hasn't helped." }]
  }]

},
{
  label: "Activation", tag: "02",
  purpose: "Years of supportive footwear have switched off the intrinsic muscles of the foot — the small muscles that create and maintain the arch. These exercises wake them back up. This is not quick or dramatic work. It is foundational.",
  exercises: [
  { id: 1005, name: "Toe Splay", start: "Seated or standing barefoot on a firm surface.", sub: "Intrinsic foot muscle activation", type: "reps", reps: "10–12 reps", steps: [
    { pos: "A", label: "Seated or Standing", focus: "SETUP", cue: "Sit or stand barefoot on a firm surface. Place both feet flat on the floor, parallel, hip-width apart. Relax everything from the ankle down — no gripping or curling of toes. Feel the full footprint on the floor." },
    { pos: "B", label: "Spread All Toes", focus: "ACTIVATE", cue: "Actively spread all five toes as wide apart as possible without lifting the foot. Hold for 2 seconds. Most people discover they cannot independently move their toes much at all — this is normal and is exactly why this exercise exists. The abductor hallucis and the interossei are the target muscles." },
    { pos: "C", label: "Release & Repeat", focus: "CONTROL", cue: "Slowly release the spread. Pause 1 second. Repeat. If only some toes move, that is useful information — work with what you have. Over days and weeks, the range and independence improves noticeably." }]
  },
  { id: 1006, name: "Arch Doming", start: "Seated, one foot flat on the floor.", sub: "Short foot exercise — intrinsic arch activation", type: "reps", reps: "10 reps each foot", steps: [
    { pos: "A", label: "Setup", focus: "SETUP", cue: "Sit with one foot flat on the floor. The goal is to shorten the foot from heel to ball — creating a dome shape in the arch — without curling the toes. This is called the short foot exercise. It directly activates the flexor digitorum brevis and abductor hallucis, the primary arch-supporting muscles." },
    { pos: "B", label: "Draw Heel to Ball", focus: "ACTIVATE", cue: "Without lifting the heel or curling the toes, try to drag the ball of the foot toward the heel. The arch should visibly rise. Hold for 3 seconds. This movement is subtle and mentally demanding. If the toes curl, relax them — the arch lift must come from the intrinsic muscles, not the long toe flexors." },
    { pos: "C", label: "Release & Build", focus: "PROGRESS", cue: "Slowly release the arch. 10 reps per foot. As this becomes easier, progress to performing it standing, then standing on one leg. The short foot exercise is the single most prescribed intrinsic foot strengthening movement in sports PT and orthopedic rehabilitation." }]
  },
  { id: 1007, name: "Big Toe Extension", start: "Seated, foot flat on the floor.", sub: "Windlass mechanism mobilization", type: "reps", reps: "10 reps each side", steps: [
    { pos: "A", label: "Seated Setup", focus: "SETUP", cue: "Sit with foot flat on the floor. Place two fingers lightly under the big toe. The big toe is the most mechanically important digit in walking — its extension during push-off is what tightens the plantar fascia like a winch (the windlass mechanism). Restricted big toe extension is a direct cause of arch strain." },
    { pos: "B", label: "Lift Only the Big Toe", focus: "ISOLATE", cue: "Lift only the big toe as high as possible, keeping the other four toes on the floor. Hold for 2 seconds. Then reverse — press the big toe down and lift the other four. This isolation trains the extensor hallucis and establishes independent toe control." },
    { pos: "C", label: "Assisted Extension", focus: "MOBILIZE", cue: "Using your fingers, gently assist the big toe into full extension — past where it goes on its own. Hold for 5 seconds. This passively mobilizes the first metatarsophalangeal joint and stretches the intrinsic flexors. Restricted range here correlates directly with plantar fasciitis severity." }]
  }]

},
{
  label: "Strengthening", tag: "03",
  purpose: "Eccentric loading — slow, controlled lengthening under tension — has the strongest evidence base of any intervention for plantar fasciitis and Achilles tendinopathy. These are not stretches. The calf-heel complex must work under load to remodel the tissue.",
  exercises: [
  { id: 1008, name: "Eccentric Heel Drops", start: "Standing on the edge of a step, heels hanging off the back.", sub: "Alfredson protocol — straight knee", type: "reps", reps: "15 reps, 3 sets", steps: [
    { pos: "A", label: "Step Edge Setup", focus: "SETUP", cue: "Stand on the edge of a step or curb with both feet, heels hanging off the back. Rise up onto both forefeet to the top position. This is the Alfredson protocol — the most evidence-backed exercise for plantar fasciitis and Achilles tendinopathy. Keep the working knee straight throughout." },
    { pos: "B", label: "Single-Leg Lower", focus: "ECCENTRIC", cue: "Shift weight to one foot. Slowly lower the heel below the step level — taking a full 3 seconds to descend. You are loading the calf eccentrically: it is contracting while lengthening. This is the specific stimulus that promotes tendon and fascial remodeling. Do not rush." },
    { pos: "C", label: "Two-Leg Return", focus: "RESET", cue: "Use both feet to rise back to the top position. Switch the working leg. 15 reps each side. If this is painless, add load over time — a backpack with a book is sufficient. Mild discomfort during the movement is acceptable; sharp pain is not." }]
  },
  { id: 1009, name: "Eccentric Soleus Drops", start: "Standing on the edge of a step, heels hanging off the back.", sub: "Bent-knee heel drops — deeper calf loading", type: "reps", reps: "15 reps, 3 sets", steps: [
    { pos: "A", label: "Step Edge, Knee Bent", focus: "SETUP", cue: "Same starting position as Eccentric Heel Drops — on a step edge, heels hanging. But this time, bend the working knee to approximately 30–40 degrees. This simple change shifts the load from the gastrocnemius to the soleus. The soleus attaches below the knee and is the primary load-bearing muscle of the calf during walking." },
    { pos: "B", label: "Slow Descent", focus: "ECCENTRIC", cue: "Lower the heel slowly on the bent-knee leg — 3 full seconds down. Maintain the same knee angle throughout the descent. Do not let the knee straighten during the lowering phase or you shift back to the gastrocnemius. Feel the load deep in the lower calf, just above the heel." },
    { pos: "C", label: "Two-Leg Return", focus: "RESET", cue: "Use both feet to return to the top. Switch sides. 15 reps each side. These two eccentric exercises — straight knee and bent knee — together cover the full calf-Achilles-fascia chain. Done consistently 3 days a week, clinical improvement is typically measurable within 6–8 weeks." }]
  },
  { id: 1010, name: "Towel Scrunches", start: "Seated barefoot, a small towel flat under one foot.", sub: "Flexor digitorum brevis strengthening", type: "reps", reps: "3 sets of 20 seconds", steps: [
    { pos: "A", label: "Towel Setup", focus: "SETUP", cue: "Sit barefoot with a small towel flat on the floor under one foot. The towel should be thin enough that you can feel the floor texture through it. No towel? Use a sock or work on a textured surface — the goal is toe flexion against mild resistance." },
    { pos: "B", label: "Scrunch & Hold", focus: "STRENGTHEN", cue: "Curl all five toes to scrunch the towel toward you. Use only the toes — do not slide the whole foot. Hold the scrunch for 2 seconds, then release fully. This targets the flexor digitorum brevis and the lumbricals — the small muscles that support the metatarsal arch, the often-overlooked transverse arch of the foot." },
    { pos: "C", label: "Repeat & Switch", focus: "ENDURANCE", cue: "Continue for 20 seconds, then switch feet. 3 sets per side. As strength builds, progress to standing on one leg while performing the scrunch — this adds the balance challenge and integrates the intrinsic work into functional loading." }]
  }]

}];



// ─────────────────────────────────────────────────────────────
//  TRAVEL TUNE-UP — In-Transit & Post-Arrival
// ─────────────────────────────────────────────────────────────
const TRANSIT_SECTIONS = [
{
  label: "In-Transit", tag: "01",
  purpose: "Designed for a seat. Zero equipment, minimal space. These four movements keep circulation moving, prevent stiffness, and down-regulate the nervous system during long flights or drives.",
  exercises: [
  { id: 1100, name: "Ankle Pumps & Circles", start: "Seated in your seat, feet flat on the floor.", sub: "Circulation — prevents swelling and blood pooling", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Seated Start", focus: "SETUP", cue: "Sit upright, feet flat on the floor. Lift both feet slightly so heels rest lightly. No need to remove shoes." },
    { pos: "B", label: "Pump Up & Down", focus: "CIRCULATE", cue: "Flex feet up (toes toward shins) then point down — 20 slow repetitions. This activates the soleus muscle, which acts as a second heart to pump blood back from the legs." },
    { pos: "C", label: "Slow Circles", focus: "MOBILIZE", cue: "Rotate each ankle in slow, full circles — 10 clockwise, 10 counter-clockwise per foot. Imagine drawing large, smooth circles in the air with your big toe." }]
  },
  { id: 1101, name: "Seated Glute Squeezes", start: "Seated in your seat, feet flat.", sub: "Prevents gluteal amnesia from prolonged pressure", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Neutral Sit", focus: "SETUP", cue: "Sit tall, feet flat. No leaning — weight distributed evenly through both sit bones. Shoulders relaxed." },
    { pos: "B", label: "Squeeze & Hold", focus: "ACTIVATE", cue: "Squeeze both glutes firmly together. Hold for 5 seconds. Breathe normally — do not hold your breath or brace the upper body." },
    { pos: "C", label: "Release & Repeat", focus: "RESET", cue: "Release completely for 5 seconds. 10 repetitions. Prolonged pressure switches off the glutes over time — this keeps the tissue and motor signal alive." }]
  },
  { id: 1102, name: "Seated Cat-Cow", start: "Seated upright in your seat, hands on knees.", sub: "Lubricates intervertebral discs compressed under cabin pressure", type: "flow", seconds: 60, steps: [
    { pos: "A", label: "Hands on Knees", focus: "SETUP", cue: "Sit at the front third of your seat. Hands resting on knees. Spine neutral. Take one breath here." },
    { pos: "B", label: "Arch — Inhale", focus: "EXT", cue: "Inhale as you arch the low back, lift the chest, and gently look upward. Let the spine extend segmentally from tailbone to neck." },
    { pos: "C", label: "Round — Exhale", focus: "FLEX", cue: "Exhale fully as you round the spine, tuck the chin, and pull the navel in. Feel each vertebra flex. 8–10 slow cycles." }]
  },
  { id: 1103, name: "Peripheral Vision Softening", start: "Seated, eyes open and gaze forward.", sub: "Down-regulates the nervous system during stress or turbulence", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Soft Gaze Forward", focus: "SETUP", cue: "Let your eyes relax and unfocus slightly. Do not look at a screen or read. Allow the gaze to become wide and diffuse." },
    { pos: "B", label: "Expand Peripheral Awareness", focus: "DOWNREGULATE", cue: "Without moving your eyes, softly notice the full width of your visual field — the edges of the cabin, movement in your periphery. This is panoramic vision, the same visual state predators use when resting." },
    { pos: "C", label: "Hold & Breathe", focus: "CALM", cue: "Maintain this soft, wide gaze for 60–90 seconds. Breathe slowly. This activates the parasympathetic nervous system and reduces the threat-detection response that makes turbulence feel dangerous." }]
  }]

},
{
  label: "Post-Arrival", tag: "02",
  purpose: "Do these as soon as you reach your hotel or home. They undo the posture of travel — compressed hip flexors, locked thoracic spine, forward shoulders — and signal the body that you have arrived.",
  exercises: [
  { id: 1104, name: "Standing Psoas Release", start: "Standing, about to step into a shallow lunge.", sub: "Long-axis stretch for hip flexors shortened during travel", type: "flow", seconds: 60, steps: [
    { pos: "A", label: "Shallow Lunge", focus: "SETUP", cue: "Step forward into a shallow lunge — not a deep split. Back knee can be raised or lowered. Both feet point forward. Keep torso upright." },
    { pos: "B", label: "Pelvic Tuck & Lean", focus: "STRETCH", cue: "Tuck the pelvis slightly (posterior tilt) to flatten the low back. Gently lean the torso toward the front leg. You will feel a deep stretch at the front of the back hip — this is the psoas." },
    { pos: "C", label: "Hold & Breathe", focus: "RELEASE", cue: "Hold 30–45 seconds each side. With each exhale, allow the hip to sink a little further. Do not force — the psoas responds to patience, not pressure." }]
  },
  { id: 1105, name: "Wall Slides (W to Y)", start: "Standing with your back flat against a wall.", sub: "Activates lower trapezius to fix 'luggage shoulder'", type: "reps", reps: "10 slow reps", steps: [
    { pos: "A", label: "Wall Contact", focus: "SETUP", cue: "Stand with head, upper back, and glutes touching the wall. Arms in a W shape — elbows bent, backs of hands against the wall. This is your baseline." },
    { pos: "B", label: "Slide to Y", focus: "ACTIVATE", cue: "Keeping the backs of hands and elbows touching the wall, slowly slide arms upward until they form a Y overhead. If contact is lost, reduce range. The lower trapezius must fire to keep the shoulder blades down and in." },
    { pos: "C", label: "Slow Return", focus: "CONTROL", cue: "Lower arms back to W in 3 seconds. Do not shrug or let shoulders elevate. 10 reps. This directly reverses the upper trap dominance that carrying luggage creates." }]
  },
  { id: 1106, name: "Open Book Stretch", start: "Lying on your side, knees stacked at 90°.", sub: "Restores thoracic rotation — the first thing to lock after travel", type: "flow", seconds: 60, steps: [
    { pos: "A", label: "Side-Lying Setup", focus: "SETUP", cue: "Lie on your side with hips and knees bent to 90°. Stack knees together. Extend both arms forward at shoulder height. Place top hand on top knee to keep hips anchored." },
    { pos: "B", label: "Open the Top Arm", focus: "ROTATE", cue: "Keeping the bottom knee stack stable, slowly rotate the top arm up, back, and toward the floor behind you — like opening a book. Let the chest and thoracic spine follow the arm." },
    { pos: "C", label: "Hold & Return", focus: "RELEASE", cue: "Hold for 3–5 breaths at the end range. Do not force the shoulder to the floor — let gravity do it gradually. Return slowly. 5 reps each side." }]
  },
  { id: 1107, name: "Physiological Sigh", start: "Seated or lying down — any comfortable position.", sub: "Rapidly offloads CO₂ and signals the brain you have arrived safely", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Relax Completely", focus: "SETUP", cue: "Sit or lie comfortably. Let the body be heavy. Close the eyes. This is not just breathing — it is a signal to the nervous system that the travel phase is over." },
    { pos: "B", label: "Double Inhale", focus: "CO2 OFFLOAD", cue: "Breathe in through the nose to about 80% capacity, then sniff in a second short inhale to fully inflate the lungs. This pops collapsed air sacs (alveoli) and maximizes surface area for CO₂ exchange." },
    { pos: "C", label: "Long Exhale", focus: "DOWNREGULATE", cue: "Release a long, slow exhale through the mouth — twice as long as the inhale. 3–5 rounds. Each cycle measurably reduces physiological arousal. You will feel the nervous system shift." }]
  },
  { id: 1108, name: "Doorway Pec Stretch", start: "Standing in a doorway, forearms on the frame.", sub: "Counteracts internal shoulder rotation from carrying bags", type: "flow", seconds: 60, steps: [
    { pos: "A", label: "Doorway Setup", focus: "SETUP", cue: "Stand in a doorway. Place both forearms on the door frame at 90° — elbows at shoulder height, upper arms parallel to floor. Step one foot forward." },
    { pos: "B", label: "Lean Through", focus: "STRETCH", cue: "Gently shift your weight forward through the doorway. Let the chest open. You should feel a stretch across the pectorals and front of the shoulders." },
    { pos: "C", label: "Hold & Breathe", focus: "RELEASE", cue: "Hold 30–45 seconds. On each exhale, allow the chest to open a fraction more. Do not shrug the shoulders up. Switch foot position halfway through." }]
  },
  { id: 1109, name: "Glute Bridge", start: "Lying on your back, knees bent, feet flat on the floor.", sub: "Re-engages the posterior chain after hours of sitting", type: "reps", reps: "12–15 reps", steps: [
    { pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on your back. Feet flat, hip-width, heels 6 inches from glutes. Arms flat at sides. This is your reset position after travel." },
    { pos: "B", label: "Drive & Lift", focus: "ENGAGE", cue: "Press through the heels and lift the hips until shoulders, hips, and knees form a straight line. Squeeze the glutes firmly at the top. Hold 2 seconds." },
    { pos: "C", label: "Lower Slowly", focus: "CONTROL", cue: "Lower with control — 3 seconds down. Do not let the hips crash. The slow descent builds the posterior chain that sitting disengages." }]
  }]

}];



// ─────────────────────────────────────────────────────────────
//  ANXIETY RELIEF — Nervous System Reset
// ─────────────────────────────────────────────────────────────
const ANXIETY_SECTIONS = [
{
  label: "Immediate Nervous System Reset", tag: "01",
  purpose: "Anxiety floods the system with adrenaline and cortisol, shifting the nervous system into sympathetic overdrive. These first four techniques work fast — each one has a direct, measurable effect on heart rate, vagal tone, or the threat-detection centers of the brain. Use them as soon as you feel the activation rising.",
  exercises: [
  { id: 2001, name: "Cold Shock (Dive Reflex)", start: "Standing or seated near a sink or bowl of cold water.", sub: "Rapid parasympathetic activation via the mammalian dive reflex", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Prepare Cold Water", focus: "SETUP", cue: "Fill a sink or bowl with cold water — as cold as possible, ideally with ice. The mammalian dive reflex is one of the fastest known parasympathetic pathways: cold water on the face instantly slows the heart via the vagus nerve. Athletes and therapists use this for acute anxiety." },
    { pos: "B", label: "Submerge Face or Wrists", focus: "ACTIVATE", cue: "Submerge your face for 15–30 seconds (hold breath), or hold both wrists under cold running water. If face submersion isn't possible, press a cold wet cloth firmly to the forehead and cheeks. The trigeminal nerve responds immediately." },
    { pos: "C", label: "Surface and Breathe", focus: "INTEGRATE", cue: "Come up slowly and take a long, slow exhale. You will notice a distinct drop in heart rate and a shift in mental clarity — the hallmark of the dive reflex activating. Repeat 1–2 times if needed. This technique is a first-line DBT skill for acute emotional dysregulation." }]
  },
  { id: 2002, name: "Legs Up the Wall", start: "Seated on the floor close to a wall, about to lie back.", sub: "Passive inversion that shifts blood pooling and calms the heart", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Scoot to the Wall", focus: "SETUP", cue: "Sit sideways next to a wall, then swing the legs up as you lie back. Legs rest against the wall, hips as close to the baseboard as comfortable. A folded blanket under the hips creates more traction if you have tight hamstrings. The key is legs above heart level." },
    { pos: "B", label: "Settle and Release", focus: "REST", cue: "Let the legs go heavy against the wall. Arms rest wide at 30°, palms up. Close the eyes. Passive inversion shifts venous return and activates baroreceptors in the neck and chest — the brain interprets this as cardiovascular calm. Heart rate measurably decreases within 2 minutes." },
    { pos: "C", label: "Breathe Into the Belly", focus: "RESTORE", cue: "With gravity assisting, the diaphragm moves more freely here. Each breath goes deeper without effort. Stay for the full 2 minutes — anxiety often lifts noticeably within that window. When you come down, roll to one side and pause for 30 seconds before sitting up." }]
  },
  { id: 2003, name: "Voo Sounding", start: "Seated or lying down, eyes closed, spine supported.", sub: "Sub-diaphragmatic resonance for vagal nerve toning", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Settle and Find the Tone", focus: "SETUP", cue: "Sit or lie comfortably. Take a full belly breath in. As you exhale, produce a slow, deep 'VooooOOOOO' sound — like a foghorn or a ship's horn. The key is that it resonates in the chest and belly, not just the throat. You should feel the vibration in the sternum and upper abdomen." },
    { pos: "B", label: "Sustain for Full Exhale", focus: "TONE", cue: "Make the Voo last the entire exhale — 6–8 seconds minimum. The low-frequency vibration directly stimulates the vagus nerve through thoracic resonance. Dr. Peter Levine, founder of Somatic Experiencing, uses this as a primary nervous system regulation tool." },
    { pos: "C", label: "Pause and Inhale", focus: "INTEGRATE", cue: "After each Voo, rest for 2 breaths before the next one. Notice the quality of stillness between sounds — this is the parasympathetic response deepening. 6–8 rounds is a complete cycle. The effect is cumulative: each round deepens the shift." }]
  },
  { id: 2004, name: "5-4-3-2-1 Sensory Scan", start: "Seated upright, both feet flat on the floor.", sub: "Sensory grounding that interrupts anxious cognitive loops", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Name 5 Things You See", focus: "VISUAL", cue: "Look around the room slowly. Name 5 distinct things you can see — out loud or in your mind. Describe them specifically: not just 'a chair' but 'a dark wooden chair with a cracked armrest.' Specificity matters. This engages the prefrontal cortex and begins to quiet the amygdala's alarm." },
    { pos: "B", label: "4 Touch · 3 Sound · 2 Smell", focus: "SENSORY", cue: "4: Notice 4 physical sensations — the weight of your body, the texture of your clothing, the temperature of your hands, the floor under your feet. 3: Identify 3 distinct sounds in the environment. 2: Find 2 things you can smell, or recall 2 scents you know well." },
    { pos: "C", label: "1 Taste — Then Return", focus: "GROUND", cue: "Notice 1 thing you can taste, or take a sip of water and pay full attention to the sensation. Then take 3 slow breaths. The full 5-4-3-2-1 protocol has been shown in clinical settings to reduce acute anxiety within 5 minutes by shifting attention from internal threat-monitoring to direct sensory experience." }]
  }]

},
{
  label: "Somatic Grounding & Release", tag: "02",
  purpose: "Once the initial spike is addressed, these four techniques work deeper — using body awareness, gentle movement, and self-touch to consolidate the shift from fight-or-flight to safety. Each one communicates directly with the nervous system through proprioception, the breath, or social engagement cues.",
  exercises: [
  { id: 2005, name: "Grounding Roots", start: "Standing, feet hip-width, weight evenly distributed.", sub: "Proprioceptive grounding through deliberate body awareness", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Feel the Ground", focus: "SETUP", cue: "Stand barefoot if possible. Plant the feet firmly — feel the heel, the ball of the foot, and all five toes in contact with the floor. Press down slightly and feel the floor pressing back. This proprioceptive feedback tells the nervous system: you are standing on solid ground. You are not falling." },
    { pos: "B", label: "Roots Down, Rise Up", focus: "ANCHOR", cue: "Imagine roots growing downward from the soles of your feet — through the floor, into the earth. With each exhale, let the roots grow deeper. With each inhale, let the crown of the head rise slightly. The body lengthens in two directions. Anxiety contracts the body. This counters that." },
    { pos: "C", label: "Breathe and Notice Weight", focus: "INTEGRATE", cue: "Feel the full weight of the body supported. The floor is holding you — you do not have to hold yourself up. Notice the hips, belly, chest — all simply resting on the skeletal frame, which is resting on the earth. Stay for the full duration. Anxiety requires you to be in your head; this practice puts you back in your body." }]
  },
  { id: 2006, name: "Forward Fold", start: "Standing, feet hip-width, knees soft.", sub: "Mild inversion activating baroreceptors, reducing sympathetic tone", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Hinge at the Hips", focus: "SETUP", cue: "Stand with feet hip-width apart. Soften the knees generously. Hinge forward from the hips — not the waist — and let the upper body hang. Arms dangle. Head is heavy. If hamstrings pull, bend the knees more. The goal is full upper body release, not straight legs." },
    { pos: "B", label: "Let the Head Hang Heavy", focus: "INVERT", cue: "Let gravity take the weight of the skull. The mild inversion — head below heart — activates baroreceptors in the neck and chest. The brain interprets this as blood pressure rising and slows the heart to compensate. This is a direct cardiovascular pathway to calm. Breathe slowly." },
    { pos: "C", label: "Sway and Release", focus: "RESTORE", cue: "Gently sway side to side — tiny movements, like seaweed in slow current. This bilateral movement, even small, helps discharge residual nervous energy. After 45–60 seconds, slowly roll up one vertebra at a time — head comes up last. Take 3 breaths at the top before continuing." }]
  },
  { id: 2007, name: "Hand on Heart", start: "Seated or lying down, in any comfortable position.", sub: "Self-compassion activation through physical self-touch", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Place Both Hands", focus: "SETUP", cue: "Place one or both hands flat on the center of the chest, over the heart. Close the eyes. Physically feel the warmth of your own hands through the fabric. This simple gesture activates the same neurological pathway as receiving care from another person — the body does not fully distinguish the source of the touch." },
    { pos: "B", label: "Feel the Heartbeat", focus: "CONNECT", cue: "Press gently until you can feel your heartbeat — or simply feel the rise and fall of the chest with the breath. Acknowledge: this heart has been beating for your entire life without your asking it to. It does not need you to be anxious on its behalf. Let it do its work." },
    { pos: "C", label: "Breathe Into the Hands", focus: "SOFTEN", cue: "Breathe slowly, imagining the breath flowing to and from the hands. With each exhale, consciously soften the area beneath the palms. Dr. Kristin Neff's research on self-compassion shows this gesture measurably reduces cortisol and activates the caregiving system — the same system that calms an anxious child also calms an anxious adult." }]
  },
  { id: 2008, name: "Earlobe Circles", start: "Seated, both hands raised to the ears.", sub: "Auricular vagal branch stimulation through ear massage", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Find the Earlobes", focus: "SETUP", cue: "Reach up and gently take both earlobes between the thumb and index finger. The ear — specifically the concha and tragus — contains a branch of the vagus nerve called the auricular branch. Gentle stimulation here has been shown in clinical studies to increase heart rate variability, a direct marker of parasympathetic tone." },
    { pos: "B", label: "Slow Circles and Gentle Pulls", focus: "STIMULATE", cue: "Make slow, gentle circles with the earlobes. Then gently pull the lobes downward — a slow, steady traction. Move to the outer ear rim (helix) and trace it slowly from bottom to top with the thumb. Take your time. This is not massage — it is gentle, deliberate stimulation." },
    { pos: "C", label: "Continue and Breathe", focus: "TONE", cue: "Continue for the full minute, working both ears simultaneously. Breathe slowly — long exhales enhance the effect. You may notice a warmth in the ears, a softening of tension in the jaw, or a gentle heaviness behind the eyes. These are signs of vagal activation. This technique is used in integrative medicine for acute anxiety and insomnia." }]
  }]

}];


// ─────────────────────────────────────────────────────────────
//  STRESS RELIEF — Cortisol Reset
// ─────────────────────────────────────────────────────────────
const STRESS_SECTIONS = [
{
  label: "Physical Discharge", tag: "01",
  purpose: "Stress primes the body to fight or flee — cortisol and adrenaline flood the bloodstream, muscles tense, heart rate climbs. But modern stressors rarely let us move. These four exercises complete the stress cycle the body started: they give the nervous system the physical discharge it was primed for, which is the only pathway through — not around — the stress response.",
  exercises: [
  { id: 2101, name: "Progressive Muscle Relaxation", start: "Lying on your back on the floor or a firm surface, arms at sides.", sub: "Systematic tension-release that discharges stored muscular stress", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Feet, Calves & Thighs", focus: "LOWER BODY", cue: "Starting at the feet: curl the toes and tense the feet hard for 5 seconds, then release completely. Next, contract the calves and thighs simultaneously — hold 5 seconds, then let go. The contrast between maximal tension and release is the mechanism. Stress stores muscular holding patterns below conscious awareness; PMR makes them visible and clears them." },
    { pos: "B", label: "Core, Hands & Arms", focus: "MID BODY", cue: "Tense the glutes and core together — hold 5 seconds, release. Then make tight fists and tense the forearms, biceps, and shoulders all at once — hold 5 seconds, release fully. Let the arms go completely heavy. Notice the warmth in the released muscles — this is increased blood flow returning." },
    { pos: "C", label: "Shoulders, Jaw & Face", focus: "UPPER BODY", cue: "Shrug the shoulders to the ears — hold 5 seconds, release. Clench the jaw and scrunch the face — hold 5 seconds, release. Finally, take a full breath, tense the entire body from feet to face simultaneously — hold 5 seconds, then release everything at once and exhale fully. One complete cycle is enough; repeat if time allows." }]
  },
  { id: 2102, name: "Rhythmic Walking", start: "Standing, with enough space to walk or march in place.", sub: "Bilateral gait cycle that metabolizes cortisol and adrenaline", type: "time", seconds: 120, steps: [
    { pos: "A", label: "March in Place", focus: "SETUP", cue: "Begin marching — knees lifting high, arms swinging in opposition (right arm forward as left knee rises). The gait cycle is the body's natural stress-metabolism mechanism. Research shows a brisk 10-minute walk reduces cortisol by 15–20%. Even 2 minutes of deliberate marching initiates this response." },
    { pos: "B", label: "Cross-Body Pattern", focus: "BILATERAL", cue: "Exaggerate the cross-body swing: right elbow drives back as the left knee lifts, and vice versa. This bilateral, alternating pattern activates both brain hemispheres simultaneously and has a measurable organizing effect on a dysregulated nervous system — the same mechanism that makes walking after an argument feel instinctively helpful." },
    { pos: "C", label: "Audible Exhale with Each Step", focus: "DISCHARGE", cue: "Breathe out with each step — a short, deliberate exhale through the mouth, like punctuation. Make it audible. Lift the knees higher, let the arms swing wider. After 2 minutes you will notice a shift: the quality of mental activity changes. Stress rumination is harder to sustain when the body is engaged bilaterally." }]
  },
  { id: 2103, name: "Thoracic Extension", start: "Seated in a firm chair, hands clasped behind the head.", sub: "Opens the chest compressed by stress posture, restores full breathing", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Hands Behind Head", focus: "SETUP", cue: "Sit at the edge of a firm chair. Interlace the fingers behind the head, elbows wide. Chronic stress collapses the chest inward and forward — shoulders round, the thoracic spine flexes, and the breath shortens. This position is the direct reversal of that pattern." },
    { pos: "B", label: "Extend Over the Chair Back", focus: "OPEN", cue: "Lean back gently over the top edge of the chair back — let it act as a fulcrum for the mid-thoracic spine. Allow the head to drop back, elbows flare open, chest lifts toward the ceiling. Hold 10–15 seconds. Breathe into the stretch. You may feel or hear gentle cracking — this is normal joint cavitation." },
    { pos: "C", label: "Repeat at Different Levels", focus: "MOBILIZE", cue: "Come up slowly, shift position up slightly on the chair, and extend again at a different vertebral level. 3–4 extensions across the mid and upper thoracic. Each one opens the anterior chest, stretches the intercostals, and restores full lung volume — all of which are mechanically restricted during the stress posture." }]
  },
  { id: 2104, name: "The Shake-Out", start: "Standing, feet hip-width, knees soft.", sub: "TRE — Tension/Trauma Releasing Exercises via natural tremor", type: "time", seconds: 120, steps: [
    { pos: "A", label: "Soft Knees, Begin Bouncing", focus: "SETUP", cue: "Stand with feet hip-width, knees softly bent. Let the arms hang completely loose. Begin gentle heel-drops — heels barely lifting, dropping with gravity, letting the body bounce passively. Do not force anything. Animals in the wild tremble after a stressful encounter to discharge the activation; this is the same reflex." },
    { pos: "B", label: "Let the Shake Travel Up", focus: "DISCHARGE", cue: "Let the tremoring move up from the feet — through the knees, hips, belly, chest, arms. If the body wants to shake more, let it. If natural tremor doesn't arrive, gentle deliberate bouncing is still effective. The goal is movement without muscular control — surrendering the body to its own discharge mechanism." },
    { pos: "C", label: "Gradually Still, Then Rest", focus: "INTEGRATE", cue: "After 90 seconds, let the shaking slow naturally — do not stop it abruptly. Stand completely still for 20 seconds and notice the quality of the body: warmth, tingling, a sense of weight and softness. This is parasympathetic activation. Used in trauma-informed therapy worldwide (TRE, Somatic Experiencing)." }]
  }]

},
{
  label: "Release & Downshift", tag: "02",
  purpose: "After physical discharge, the nervous system is receptive to deep parasympathetic recovery. These four movements work through compression, posture, breath, and bilateral stimulation to consolidate the shift from reactive to resting — from stress to safety.",
  exercises: [
  { id: 2105, name: "Child's Pose", start: "Kneeling on the floor, knees wide, big toes together.", sub: "Vagal toning through forward fold and abdominal compression", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Kneel and Fold Forward", focus: "SETUP", cue: "Kneel with knees wide or together, big toes touching. Fold the torso forward over the thighs and rest the forehead on the floor, or on stacked hands or a folded blanket. Arms can extend forward or rest alongside the body. Let the entire torso go heavy." },
    { pos: "B", label: "Abdomen Against Thighs", focus: "COMPRESS", cue: "The mild compression of the abdomen against the thighs in this position applies gentle pressure on the gut wall — which in turn stimulates the vagus nerve via the enteric nervous system. This is part of why forward folds feel intrinsically calming. Allow each exhale to press the belly more firmly against the thighs." },
    { pos: "C", label: "Breathe Into the Back Body", focus: "RESTORE", cue: "Direct the breath into the back: feel the ribs widen laterally on the inhale, then settle on the exhale. Stay for the full 90 seconds. If the mind returns to the stressor, acknowledge it and redirect to the sensation of the forehead on the ground. You do not have to solve anything right now." }]
  },
  { id: 2106, name: "Chin Tucks", start: "Seated upright or standing against a wall.", sub: "Cervical decompression that releases the suboccipital muscles", type: "time", seconds: 45, steps: [
    { pos: "A", label: "Upright Posture", focus: "SETUP", cue: "Sit or stand tall. During stress, the head juts forward as the body prepares for action — this compresses the upper cervical spine, restricts blood flow to the brain, and contributes to tension headaches. The chin tuck is a direct reset of this pattern. Think: 'tall spine, double chin.'" },
    { pos: "B", label: "Draw the Chin Straight Back", focus: "RETRACT", cue: "Without tilting the head, draw the chin straight back — creating a 'double chin.' The head should feel like it's gliding back on a level track, not tucking downward. Hold the retraction gently for 3–5 seconds. You should feel a mild stretch at the base of the skull — this is the suboccipital release." },
    { pos: "C", label: "10 Slow Reps", focus: "DECOMPRESS", cue: "Release and repeat — 10 slow, deliberate reps. Each one creates traction in the upper cervical joints, decompresses the C1-C2 region, and releases the muscles that clamp tight under stress. Combined with slow nasal breathing throughout, this produces a rapid drop in perceived tension." }]
  },
  { id: 2107, name: "Wall Pushes", start: "Standing an arm's length from a solid wall.", sub: "Isometric exertion that completes the stress activation cycle", type: "time", seconds: 60, steps: [
    { pos: "A", label: "Hands on Wall at Shoulder Height", focus: "SETUP", cue: "Place both palms flat against the wall at shoulder height, arms nearly straight. Step the feet back slightly. The stress response contracts muscles and primes them for exertion — this exercise uses that primed energy deliberately rather than letting it sit unspent in the body." },
    { pos: "B", label: "Push with Maximum Effort", focus: "EXERT", cue: "Press into the wall as hard as you can — as if you intend to push it over. Engage the entire kinetic chain: push through the feet, brace the core, press with the chest, shoulders, and arms simultaneously. Hold 10 seconds of maximal effort. Breathe out slowly during the push." },
    { pos: "C", label: "Release and Exhale Fully", focus: "COMPLETE", cue: "Release suddenly and exhale completely. The abrupt shift from maximum tension to release signals the nervous system that the threat response is complete. Repeat 3–5 times. This is the physical completion of the fight-or-flight cycle — the body gets the exertion it was primed to perform, and can now down-regulate." }]
  },
  { id: 2108, name: "Butterfly Hug", start: "Seated or standing, arms crossed over the chest.", sub: "Bilateral stimulation (EMDR technique) that integrates the stress response", type: "time", seconds: 90, steps: [
    { pos: "A", label: "Cross Arms Over Chest", focus: "SETUP", cue: "Cross both arms over the chest — right hand to the left shoulder area, left hand to the right — like hugging yourself. Fingertips rest near the collarbones or upper arms. Close the eyes. This position was developed by Lucina Artigas for trauma survivors and is a core technique in EMDR (Eye Movement Desensitization and Reprocessing) therapy." },
    { pos: "B", label: "Alternating Taps", focus: "BILATERAL", cue: "Begin alternating gentle taps — right hand taps, then left hand taps — at a slow, rhythmic pace, like a slow heartbeat. The alternating bilateral stimulation mimics REM sleep processing and activates both brain hemispheres simultaneously. This helps the nervous system integrate and file the stress experience rather than holding it." },
    { pos: "C", label: "Continue and Breathe", focus: "INTEGRATE", cue: "Continue for the full 90 seconds. Breathe slowly and naturally. You may notice images, sensations, or memories arising — let them pass without engagement. The bilateral rhythm is doing the work. Many people find this position produces an immediate sense of comfort and safety — the same circuits activated by human contact are recruited through self-administered bilateral touch." }]
  }]

}];


const KNEE_SECTIONS = [
{ label: "Knee Resilience", tag: "KR", purpose: "Bulletproof the joint by strengthening the muscles that support it while using low-load, high-precision movements to lubricate the joint and offload pressure. Motion is lotion — it's normal for arthritic or cranky knees to feel stiff for the first few repetitions; as the joint warms up and synovial fluid flows, discomfort usually gives way to ease.", exercises: [
  { id: 2201, name: "Wall-Press TKE (Terminal Knee Extension)", start: "Standing, facing a wall with one foot slightly behind the other. The front knee is slightly bent.", sub: "Quad activation without compression", type: "reps", reps: "10–12 each leg", steps: [{ pos: "A", label: "Wall Setup", focus: "SETUP", cue: "Stand facing a wall. Place one foot slightly behind the other. The front knee is slightly bent. Keep the front heel grounded." }, { pos: "B", label: "Press & Lock Out", focus: "ACTIVATE", cue: "Press the front heel into the floor and squeeze the quadriceps hard to 'lock out' the knee. Hold the squeeze for 2 seconds." }, { pos: "C", label: "Release & Repeat", focus: "CONTROL", cue: "Release and repeat 10–12 times per leg. Switch sides." }] },
  { id: 2202, name: "Straight Leg Raises", start: "Lying on your back: one leg bent with foot flat, the other leg straight out.", sub: "Quad strength without joint load", type: "reps", reps: "10–12 each leg", steps: [{ pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on your back. One leg bent, foot flat; the other leg extended straight." }, { pos: "B", label: "Lift to Opposite Knee Height", focus: "STRENGTHEN", cue: "Lift the straight leg to the height of the opposite bent knee. Squeeze the quad at the top. Lower slowly." }, { pos: "C", label: "Controlled Lower", focus: "ECCENTRIC", cue: "Lower in 3 seconds. 10–12 reps per leg." }] },
  { id: 2203, name: "Isometric Wall Sits", start: "Standing: back flat against a wall, feet shoulder-width apart and 12 inches forward.", sub: "Pain-numbing isometric hold", type: "time", seconds: 45, steps: [{ pos: "A", label: "Wall Contact", focus: "SETUP", cue: "Stand with back flat against a wall. Feet shoulder-width, about 12 inches in front." }, { pos: "B", label: "Slide Down", focus: "HOLD", cue: "Slide down into a partial squat. Hold. Isometric holds have a pain-numbing effect on joints." }, { pos: "C", label: "Breathe", focus: "RELEASE", cue: "Hold 45 seconds. Breathe normally." }] },
  { id: 2204, name: "Towel Heel Slides", start: "Lying on your back: one heel resting on a towel or smooth surface.", sub: "Joint oiling for arthritis stiffness", type: "flow", seconds: 45, steps: [{ pos: "A", label: "Supine, Heel on Towel", focus: "SETUP", cue: "Lie on your back. One heel on a towel or smooth floor." }, { pos: "B", label: "Slide Heel Toward Glutes", focus: "MOBILIZE", cue: "Slowly slide the heel toward your glutes, then back out. Joint oiling for stiffness." }, { pos: "C", label: "Smooth & Slow", focus: "REPEAT", cue: "Continue 45 seconds. Repeat other side if time allows." }] },
  { id: 2205, name: "Self-Resisted Clamshells", start: "Lying on your side: knees bent at 90 degrees and stacked. Top hand on outside of top knee.", sub: "Hip strength to prevent knee cave", type: "reps", reps: "10–12 each side", steps: [{ pos: "A", label: "Side-Lying Setup", focus: "SETUP", cue: "Lie on your side. Knees bent 90°, stacked. Top hand on outside of top knee." }, { pos: "B", label: "Lift Against Resistance", focus: "STRENGTHEN", cue: "Lift the top knee while pressing down with your hand. Stronger hips prevent the knee from caving inward." }, { pos: "C", label: "Lower & Repeat", focus: "CONTROL", cue: "Lower slowly. 10–12 reps per side." }] },
  { id: 2206, name: "Seated Knee Extensions", start: "Seated: sitting tall in a chair with feet dangling.", sub: "Thigh strength without weight-bearing", type: "reps", reps: "10–12 each leg", steps: [{ pos: "A", label: "Chair Setup", focus: "SETUP", cue: "Sit tall in a chair, feet dangling. Hands on chair or thighs." }, { pos: "B", label: "Straighten Leg", focus: "EXTEND", cue: "Slowly straighten one leg until horizontal. Squeeze the quad at the top. Maintains thigh muscle mass when weight-bearing is painful." }, { pos: "C", label: "Lower Slowly", focus: "CONTROL", cue: "Lower in 3 seconds. 10–12 reps per leg." }] },
  { id: 2207, name: "Low Box Step-Ups", start: "Standing: facing a low step or the bottom stair.", sub: "Eccentric strength, slow descent", type: "reps", reps: "8–10 each leg", steps: [{ pos: "A", label: "Step Setup", focus: "SETUP", cue: "Stand facing a low step or bottom stair. 4–6 inches is enough to start." }, { pos: "B", label: "Step Up", focus: "CONCENTRIC", cue: "Step up slowly with one foot. Bring the other foot to meet it." }, { pos: "C", label: "Slow Descent", focus: "ECCENTRIC", cue: "Step down slowly — 3–4 seconds to lower. Builds eccentric strength that protects the knee. 8–10 reps each leg." }] }]
}];


const TRACKS = {
  daily: { id: "daily", label: "Daily Feel Good", subtitle: "Spine · Core · Chain", purpose: "Spine, core, and posterior chain. The foundation session.", sections: DAILY_SECTIONS, duration: "~25 min" },
  restorative: { id: "restorative", label: "Full Reset", subtitle: "Flow · Circulation · Recovery", purpose: "Gentle continuous movement for circulation, joint lubrication, and recovery.", sections: RESTORATIVE_SECTIONS, duration: "~15 min" },
  morning: { id: "morning", label: "Morning Refresh", subtitle: "Gentle · Spinal · Mobilization", purpose: "Seven movements to wake the spine before you look at your phone.", sections: MORNING_SECTIONS, duration: "~8 min" },
  prime: { id: "prime", label: "Better Sleep Stretch", subtitle: "Restore · Decompress · Downtime", purpose: "Lower cortisol, decompress the spine, prepare for sleep.", sections: PRIME_SECTIONS, duration: "~12 min" },
  desk: { id: "desk", label: "The Desk Break", subtitle: "Posture · Reset · 5 min", purpose: "Six movements to undo an hour of sitting. Stand up. Do it now.", sections: DESK_SECTIONS, duration: "~5 min" },
  screen: { id: "screen", label: "Digital Detox", subtitle: "Neck · Traps · Thoracic", purpose: "Undo the forward pull of screen time. Seven targeted releases for the neck and shoulder girdle.", sections: SCREEN_SECTIONS, duration: "~12 min" },
  hip: { id: "hip", label: "Happy Hips", subtitle: "Flexors · Rotators · Release", purpose: "Open the hips, free the lower back, restore the range that sitting steals.", sections: HIP_SECTIONS, duration: "~18 min" },
  back: { id: "back", label: "Lower Back Soother", subtitle: "Decompress · Release · Restore", purpose: "For days when the lower back needs care, not challenge. Gentle traction and release.", sections: BACK_SECTIONS, duration: "~15 min" },
  steady: { id: "steady", label: "Stay Steady", subtitle: "Balance · Proprioception · Control", purpose: "Train the systems that prevent falls. Simple movements that are deceptively hard to do well.", sections: STEADY_SECTIONS, duration: "~15 min" },
  freely: { id: "freely", label: "Move Freely", subtitle: "CARS · Synovial · Joints", purpose: "Controlled Articular Rotations and mobility work for every major joint. The WD-40 session.", sections: FREELY_SECTIONS, duration: "~20 min" },
  transit: { id: "transit", label: "In-Transit", subtitle: "Seated · Circulation · Calm", purpose: "Four exercises designed for your seat. Keep circulation moving and the nervous system calm during any long journey.", sections: TRANSIT_SECTIONS, duration: "~8 min" },
  travel: { id: "travel", label: "Post-Arrival Reset", subtitle: "Travel · Decompress · Reset", purpose: "Six movements to undo the posture of travel. Do these as soon as you arrive.", sections: [{ label: "Post-Arrival", tag: "PA", purpose: "Six movements to undo the posture of travel. Do these as soon as you reach your hotel or home.", exercises: [{ id: 1104, name: "Standing Psoas Release", start: "Standing, about to step into a shallow lunge.", sub: "Hip flexors shortened during travel", type: "flow", seconds: 60, steps: [{ pos: "A", label: "Shallow Lunge", focus: "SETUP", cue: "Step forward into a shallow lunge. Back knee raised or lowered. Torso upright, feet forward." }, { pos: "B", label: "Pelvic Tuck & Lean", focus: "STRETCH", cue: "Tuck the pelvis slightly, lean torso toward the front leg. Feel the stretch at the front of the back hip — this is the psoas." }, { pos: "C", label: "Hold & Breathe", focus: "RELEASE", cue: "Hold 30–45 seconds each side. With each exhale, allow the hip to sink further. Switch sides." }] }, { id: 1105, name: "Wall Slides (W to Y)", start: "Standing with your back flat against a wall.", sub: "Activates lower trapezius — fixes luggage shoulder", type: "reps", reps: "10 slow reps", steps: [{ pos: "A", label: "Wall Contact", focus: "SETUP", cue: "Head, upper back, and glutes touching the wall. Arms in a W shape — elbows bent, backs of hands against wall." }, { pos: "B", label: "Slide to Y", focus: "ACTIVATE", cue: "Keep backs of hands and elbows on the wall and slowly slide arms up to a Y overhead. Do not let contact break." }, { pos: "C", label: "Slow Return", focus: "CONTROL", cue: "Lower to W in 3 seconds. Do not shrug. 10 reps. This reverses upper trap dominance from carrying luggage." }] }, { id: 1106, name: "Open Book Stretch", start: "Lying on your side, knees stacked at 90°.", sub: "Restores thoracic rotation locked after travel", type: "flow", seconds: 60, steps: [{ pos: "A", label: "Side-Lying Setup", focus: "SETUP", cue: "Lie on your side, hips and knees at 90°, knees stacked. Both arms extended forward at shoulder height." }, { pos: "B", label: "Open the Top Arm", focus: "ROTATE", cue: "Rotate the top arm up, back, and toward the floor behind you — like opening a book. Let the chest follow." }, { pos: "C", label: "Hold & Return", focus: "RELEASE", cue: "Hold 3–5 breaths. Let gravity do the work. Return slowly. 5 reps each side." }] }, { id: 1107, name: "Physiological Sigh", start: "Seated or lying down.", sub: "Rapidly offloads CO₂ — signals arrival to the brain", type: "time", seconds: 90, steps: [{ pos: "A", label: "Relax Completely", focus: "SETUP", cue: "Sit or lie comfortably. Body heavy, eyes closed." }, { pos: "B", label: "Double Inhale", focus: "CO2 OFFLOAD", cue: "Breathe in to 80% capacity, then sniff in a second short inhale to fully inflate. This pops collapsed air sacs." }, { pos: "C", label: "Long Exhale", focus: "DOWNREGULATE", cue: "Long slow exhale through the mouth — twice the inhale length. 3–5 rounds. Each cycle measurably reduces arousal." }] }, { id: 1108, name: "Doorway Pec Stretch", start: "Standing in a doorway, forearms on the frame.", sub: "Counteracts shoulder rotation from carrying bags", type: "flow", seconds: 60, steps: [{ pos: "A", label: "Doorway Setup", focus: "SETUP", cue: "Forearms on door frame at 90°, elbows at shoulder height. Step one foot forward." }, { pos: "B", label: "Lean Through", focus: "STRETCH", cue: "Shift weight forward gently. Feel the stretch across the chest and front shoulders." }, { pos: "C", label: "Hold & Breathe", focus: "RELEASE", cue: "30–45 seconds. Exhale into the stretch. Do not shrug. Switch foot halfway." }] }, { id: 1109, name: "Glute Bridge", start: "Lying on your back, knees bent, feet flat.", sub: "Re-engages the posterior chain after hours of sitting", type: "reps", reps: "12–15 reps", steps: [{ pos: "A", label: "Supine Setup", focus: "SETUP", cue: "Lie on back. Feet flat, hip-width, heels 6 inches from glutes." }, { pos: "B", label: "Drive & Lift", focus: "ENGAGE", cue: "Press through heels, lift hips to a straight line — shoulders, hips, knees. Squeeze glutes at top. Hold 2s." }, { pos: "C", label: "Lower Slowly", focus: "CONTROL", cue: "Lower in 3 seconds. Do not crash the hips. Controlled descent rebuilds what sitting disengages." }] }] }], duration: "~15 min" },
  anxiety: { id: "anxiety", label: "Calm Circuit", subtitle: "Breathe · Ground · Vagal", purpose: "Evidence-based techniques that directly shift the nervous system from fight-or-flight to rest and digest.", sections: ANXIETY_SECTIONS, duration: "~15 min" },
  stress: { id: "stress", label: "Tension Release", subtitle: "Discharge · Release · Downshift", purpose: "Complete the stress cycle the body started. Move the cortisol through. Then downshift.", sections: STRESS_SECTIONS, duration: "~18 min" },
  feet: { id: "feet", label: "Feet First", subtitle: "Plantar · Release · Load", purpose: "PT-backed protocol for plantar fasciitis and foot pain. Release the tissue, wake the muscles, load the chain.", sections: FEET_SECTIONS, duration: "~18 min" },
  knee: { id: "knee", label: "Knee Resilience", subtitle: "Strengthen · Lubricate · Support", purpose: "Bulletproof the joint: strengthen the muscles that support it and use low-load movements to lubricate and offload pressure. Motion is lotion.", sections: KNEE_SECTIONS, duration: "~18 min" }
};


// ─────────────────────────────────────────────────────────────
//  EXERCISE FIGURES — Stay Steady pilot
// ─────────────────────────────────────────────────────────────
const FIGURES = {
  801: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="28" r="10" stroke="#E8E4DF" stroke-width="2"/>
  <line x1="60" y1="38" x2="60" y2="48" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="48" x2="60" y2="88" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="60" y1="54" x2="42" y2="76" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="54" x2="78" y2="76" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="88" x2="48" y2="128" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="48" y1="128" x2="42" y2="144" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="60" y1="88" x2="72" y2="128" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="72" y1="128" x2="78" y2="144" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="148" x2="92" y2="148" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M54 108 Q68 100 74 108" stroke="#FFBF65" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M70 104 L74 108 L70 112" stroke="#FFBF65" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="78" cy="144" r="3" fill="#FFBF65"/>
  <circle cx="42" cy="144" r="3" fill="rgba(255,255,255,0.3)"/>
</svg>`,
  802: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="26" r="10" stroke="#E8E4DF" stroke-width="2"/>
  <line x1="70" y1="24" x2="84" y2="22" stroke="#FFBF65" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 2"/>
  <circle cx="86" cy="21" r="2" fill="#FFBF65"/>
  <line x1="60" y1="36" x2="60" y2="46" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="46" x2="60" y2="86" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="60" y1="52" x2="40" y2="70" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="52" x2="80" y2="70" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="60" y1="86" x2="56" y2="126" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="56" y1="126" x2="52" y2="144" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="60" y1="86" x2="74" y2="106" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="74" y1="106" x2="68" y2="124" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M52 86 Q60 83 68 86" stroke="#FFBF65" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="28" y1="148" x2="92" y2="148" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="52" cy="144" r="3" fill="#FFBF65"/>
</svg>`,
  803: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="52" cy="26" r="10" stroke="#E8E4DF" stroke-width="2"/>
  <line x1="52" y1="36" x2="52" y2="46" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="52" y1="46" x2="54" y2="86" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="52" y1="56" x2="28" y2="64" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="52" y1="56" x2="76" y2="64" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="54" y1="86" x2="44" y2="126" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="44" y1="126" x2="38" y2="144" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="54" y1="86" x2="66" y2="116" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="66" y1="116" x2="72" y2="134" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="20" y1="148" x2="100" y2="148" stroke="#FFBF65" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 3"/>
  <circle cx="38" cy="144" r="3.5" fill="rgba(255,255,255,0.4)"/>
  <circle cx="72" cy="134" r="3.5" fill="#FFBF65"/>
  <path d="M72 134 Q74 141 72 144" stroke="#FFBF65" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <circle cx="72" cy="146" r="1.5" fill="#FFBF65"/>
</svg>`,
  804: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="58" cy="26" r="10" stroke="#E8E4DF" stroke-width="2"/>
  <line x1="58" y1="36" x2="58" y2="46" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="58" y1="46" x2="58" y2="84" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="58" y1="54" x2="34" y2="62" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="58" y1="54" x2="82" y2="62" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="58" y1="84" x2="70" y2="124" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="70" y1="124" x2="76" y2="142" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="58" y1="84" x2="46" y2="110" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="46" y1="110" x2="58" y2="130" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="58" y1="130" x2="58" y2="142" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <path d="M88 100 L100 100 L96 96 M100 100 L96 104" stroke="#FFBF65" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="20" y1="148" x2="100" y2="148" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="76" cy="142" r="3" fill="rgba(255,255,255,0.35)"/>
  <circle cx="58" cy="142" r="3" fill="#FFBF65"/>
</svg>`,
  805: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="114" width="58" height="10" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
  <line x1="20" y1="124" x2="20" y2="148" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <line x1="78" y1="124" x2="78" y2="148" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <line x1="20" y1="148" x2="100" y2="148" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="46" cy="24" r="10" stroke="#E8E4DF" stroke-width="2"/>
  <line x1="46" y1="34" x2="46" y2="44" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="46" y1="44" x2="48" y2="82" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="46" y1="54" x2="24" y2="62" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <circle cx="22" cy="62" r="3" stroke="#FFBF65" stroke-width="1.5" fill="none"/>
  <line x1="46" y1="54" x2="64" y2="58" stroke="#E8E4DF" stroke-width="2" stroke-linecap="round"/>
  <line x1="48" y1="82" x2="42" y2="114" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="42" y1="114" x2="38" y2="122" stroke="#FFBF65" stroke-width="3" stroke-linecap="round"/>
  <line x1="48" y1="82" x2="62" y2="112" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="62" y1="112" x2="68" y2="138" stroke="#E8E4DF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M74 118 L80 130 L76 128 M80 130 L76 134" stroke="#FFBF65" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="38" cy="122" r="3" fill="#FFBF65"/>
  <circle cx="68" cy="138" r="3.5" fill="rgba(232,228,223,0.4)"/>
</svg>`
};

function getSections(trackId) {return TRACKS[trackId].sections;}
function getAll(trackId) {return getSections(trackId).flatMap((s) => s.exercises.map((e) => ({ ...e, sectionLabel: s.label })));}

function storageGet(key, def) {
  try {const v = localStorage.getItem(key);return v !== null ? JSON.parse(v) : def;} catch {return def;}
}
function storageSet(key, val) {
  try {localStorage.setItem(key, JSON.stringify(val));} catch {}
}

// ─────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
  html, body, #root { width:100%; max-width:100vw; min-height:100%; min-height:100dvh; height:100dvh; margin:0; padding:0; box-sizing:border-box; background:#080d18; overflow-x:hidden; -webkit-text-size-adjust:100%; }
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:0px; } * { scrollbar-width:none; }
  /* ── LAYOUT TOKENS (one source of truth for safe area + page padding) ── */
  :root, [data-theme="dark"], [data-theme="light"] {
    --safe-top: calc(env(safe-area-inset-top, 0px) + 72px);
    --safe-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
    --page-padding: 24px;
    --font-display: 'Barlow', sans-serif;
    --font-text: 'Barlow', sans-serif;
    --label-spacing: 0.24em;
  }
  .app-page-header { padding: var(--safe-top) var(--page-padding) 0; width: 100%; max-width: 100%; box-sizing: border-box; }
  .app-page-bottom-pad { padding-bottom: var(--safe-bottom); }
  .app-label { letter-spacing: var(--label-spacing); }
  /* ── LIQUID GLASS (one card, one bar; same blur/saturation) ── */
  .glass-card { background: var(--glass-bg); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4); border: 1px solid var(--glass-border); border-radius: 20px; box-shadow: var(--glass-shadow); }
  .glass-bar { background: var(--tab-bg); backdrop-filter: blur(28px) saturate(1.4); -webkit-backdrop-filter: blur(28px) saturate(1.4); border: 1px solid var(--border); }
  /* ── LIQUID GLASS VARIABLES ── */
  [data-theme="dark"] {
    --bg-gradient: radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%);
    --orb1: radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,179,237,0.18) 0%, transparent 70%);
    --orb2: radial-gradient(ellipse 50% 60% at 80% 70%, rgba(167,139,250,0.15) 0%, transparent 70%);
    --orb3: radial-gradient(ellipse 40% 40% at 60% 10%, rgba(251,191,36,0.10) 0%, transparent 70%);
    --glass-bg: rgba(255,255,255,0.06);
    --glass-bg-hover: rgba(255,255,255,0.10);
    --glass-border: rgba(255,255,255,0.12);
    --glass-border-strong: rgba(255,255,255,0.24);
    --glass-specular: rgba(255,255,255,0.08);
    --glass-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
    --glass-shadow-lg: 0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4);
    --tab-bg: rgba(8,12,18,0.85);
    --hdr-bg: rgba(10,14,26,0.72);
    --text-primary: #f6f7f8;
    --text-secondary: rgba(255,255,255,0.75);
    --text-tertiary: rgba(255,255,255,0.50);
    --text-dim: rgba(255,255,255,0.42);
    --text-dimmer: rgba(255,255,255,0.32);
    --text-white: #f6f7f8;
    --accent: #FFBF65;
    --accent-secondary: rgba(255,191,101,0.62);
    --accent-dim: rgba(255,191,101,0.18);
    --accent-glow: rgba(255,191,101,0.30);
    --cue-bar: rgba(255,191,101,0.7);
    --cue-bar-label: rgba(255,191,101,0.8);
    --border: rgba(255,255,255,0.08);
    --border-card: rgba(255,255,255,0.10);
    --text-teal: #4a9fd4;
    --text-done: rgba(255,255,255,0.20);
    --dot-bg: rgba(255,255,255,0.14);
    --dot-done: rgba(255,255,255,0.32);
    --step-connector: rgba(255,255,255,0.08);
    --accent-btn-text: #0a0e1a;
    --bg-hover: rgba(255,255,255,0.05);
    --summary-grid-bg: rgba(255,255,255,0.04);
    --eol-color: rgba(255,255,255,0.30);
  }
  [data-theme="light"] {
    --bg-gradient: linear-gradient(145deg, #dce6f0 0%, #e4ebf4 35%, #eaf0f7 70%, #f0f5fa 100%);
    --orb1: radial-gradient(ellipse 65% 55% at 10% 15%, rgba(80,140,200,0.12) 0%, transparent 65%);
    --orb2: radial-gradient(ellipse 55% 65% at 90% 75%, rgba(100,160,210,0.09) 0%, transparent 65%);
    --orb3: radial-gradient(ellipse 50% 45% at 55% 5%,  rgba(140,180,220,0.07) 0%, transparent 65%);
    --glass-bg: rgba(255,255,255,0.55);
    --glass-bg-hover: rgba(255,255,255,0.72);
    --glass-border: rgba(200,220,240,0.68);
    --glass-border-strong: rgba(160,195,225,0.78);
    --glass-specular: rgba(255,255,255,0.88);
    --glass-shadow: 0 2px 12px rgba(20,50,90,0.11), 0 1px 4px rgba(20,50,90,0.06);
    --glass-shadow-lg: 0 10px 32px rgba(20,50,90,0.13), 0 2px 10px rgba(20,50,90,0.07);
    --tab-bg: rgba(255,255,255,0.62);
    --hdr-bg: rgba(235,243,250,0.75);
    --text-primary: #252525;
    --text-secondary: rgba(15,30,46,0.82);
    --text-tertiary: rgba(15,30,46,0.72);
    --text-dim: rgba(15,30,46,0.65);
    --text-dimmer: rgba(15,30,46,0.52);
    --text-white: #252525;
    --accent: #2a5f8f;
    --accent-secondary: rgba(42,95,143,0.58);
    --accent-dim: rgba(42,95,143,0.12);
    --accent-glow: rgba(42,95,143,0.22);
    --cue-bar: rgba(42,95,143,0.65);
    --cue-bar-label: rgba(42,95,143,0.85);
    --border: rgba(160,195,225,0.30);
    --border-card: rgba(160,195,225,0.40);
    --text-teal: #2a5f8f;
    --text-done: rgba(15,30,46,0.30);
    --dot-bg: rgba(15,30,46,0.12);
    --dot-done: rgba(15,30,46,0.38);
    --accent-btn-text: #ffffff;
    --step-connector: rgba(160,195,225,0.40);
    --bg-hover: rgba(255,255,255,0.38);
    --summary-grid-bg: rgba(255,255,255,0.32);
    --eol-color: rgba(0,0,0,0.30);
    --text-dim: rgba(15,30,46,0.68);
    --text-dimmer: rgba(15,30,46,0.58);
    --text-tertiary: rgba(15,30,46,0.75);
  }

  /* ── LIGHT MODE TEXT WEIGHT BOOST ── */
  [data-theme="light"] .es,
  [data-theme="light"] .step-cue,
  [data-theme="light"] .track-card-purpose,
  [data-theme="light"] .hdr-subtitle,
  [data-theme="light"] .purpose-text,
  [data-theme="light"] .ob-body,
  [data-theme="light"] .ob-sci-text {
    font-weight: 400;
  }
  /* Light mode small text accessibility */
  [data-theme="light"] .track-group-label,
  [data-theme="light"] .track-card-dur,
  [data-theme="light"] .hdr-dur {
    color: rgba(15,30,46,0.65);
    font-weight: 500;
  }
  [data-theme="light"] .sh-name,
  [data-theme="light"] .session-time,
  [data-theme="light"] .ereps,
  [data-theme="light"] .track-card-sub {
    font-weight: 500;
  }
  /* Light mode: stronger glass edge and primary button depth */
  [data-theme="light"] .track-card::before {
    background: linear-gradient(90deg, transparent, var(--glass-specular) 35%, rgba(255,255,255,0.35) 50%, var(--glass-specular) 65%, transparent);
  }
  [data-theme="light"] .begin-btn {
    box-shadow: 0 2px 12px var(--accent-glow), 0 4px 20px rgba(42,95,143,0.18);
  }
  [data-theme="light"] .begin-btn:hover {
    box-shadow: 0 4px 16px var(--accent-glow), 0 6px 24px rgba(42,95,143,0.22);
  }
  /* Light mode: breathing timer rings more visible */
  [data-theme="light"] .timer-breathe-guide-ring circle {
    stroke: rgba(15,30,46,0.28);
    stroke-width: 2px;
  }
  [data-theme="light"] .timer-interval-ring circle:first-of-type {
    stroke: rgba(15,30,46,0.35);
    stroke-width: 3px;
  }
  [data-theme="light"] .timer-breathe-expand-ring {
    border-color: rgba(42,95,143,0.45) !important;
    box-shadow: 0 0 0 1px rgba(42,95,143,0.12);
  }
  [data-theme="light"] .timer-breathe-expand-ring.breathe-idle {
    opacity: 0.35 !important;
    border-color: rgba(42,95,143,0.5) !important;
  }

  /* ── NIGHT MODE — Apple Watch Ultra style: #000000 + vibrant red only ── */
  [data-night="true"] {
    --bg-gradient: #000000;
    --orb1: none; --orb2: none; --orb3: none;
    --glass-bg: #000000;
    --glass-bg-hover: rgba(255,59,48,0.08);
    --glass-border: rgba(255,59,48,0.18);
    --glass-border-strong: rgba(255,59,48,0.35);
    --glass-specular: transparent;
    --glass-shadow: none;
    --glass-shadow-lg: none;
    --tab-bg: #000000;
    --hdr-bg: #000000;
    --text-primary: #FF3B30;
    --text-secondary: rgba(255,59,48,0.85);
    --text-tertiary: rgba(255,59,48,0.65);
    --text-dim: rgba(255,59,48,0.45);
    --text-dimmer: rgba(255,59,48,0.35);
    --text-white: #FF3B30;
    --accent: #FF3B30;
    --accent-secondary: rgba(255,59,48,0.65);
    --accent-dim: rgba(255,59,48,0.12);
    --accent-glow: rgba(255,59,48,0.4);
    --cue-bar: rgba(255,59,48,0.7);
    --cue-bar-label: #FF3B30;
    --border: rgba(255,59,48,0.12);
    --border-card: rgba(255,59,48,0.15);
    --text-done: rgba(255,59,48,0.25);
    --dot-bg: rgba(255,59,48,0.15);
    --dot-done: rgba(255,59,48,0.4);
    --step-connector: rgba(255,59,48,0.12);
    --accent-btn-text: #000000;
    --bg-hover: rgba(255,59,48,0.06);
    --summary-grid-bg: #000000;
    --text-teal: #FF3B30;
    --eol-color: rgba(255,59,48,0.4);
  }
  [data-night="true"] .app { background: #000000 !important; }
  [data-night="true"] .app-orbs { background: none !important; display: none !important; }
  [data-night="true"] .app-body { background: #000000 !important; }
  [data-night="true"] .hdr-wrap,
  [data-night="true"] .tab-subbar,
  [data-night="true"] .tab-bar,
  [data-night="true"] .tab-bar-spacer { background: #000000 !important; border-color: rgba(255,59,48,0.12) !important; }
  [data-night="true"] .tab-subbar { box-shadow: none !important; border-top: 1px solid rgba(255,59,48,0.12) !important; }
  [data-night="true"] .track-card,
  [data-night="true"] .er,
  [data-night="true"] .panel,
  [data-night="true"] .sg { background: #000000 !important; border-color: rgba(255,59,48,0.12) !important; }
  [data-night="true"] .tab-btn.active { color: #FF3B30 !important; }
  [data-night="true"] .tab-btn { color: rgba(255,59,48,0.45) !important; }
  [data-night="true"] .prog-fill { background: #FF3B30 !important; box-shadow: 0 0 10px rgba(255,59,48,0.5) !important; }
  [data-night="true"] .prog-bar { background: #000000 !important; border: 1px solid rgba(255,59,48,0.2) !important; }
  [data-night="true"] .fav-toggle { background: #000000 !important; border-color: rgba(255,59,48,0.2) !important; }
  [data-night="true"] .fav-toggle.on { background: #000000 !important; border-color: #FF3B30 !important; color: #FF3B30 !important; }
  [data-night="true"] .chk { background: #000000 !important; border-color: rgba(255,59,48,0.25) !important; }
  [data-night="true"] .chk.on { background: #FF3B30 !important; border-color: #FF3B30 !important; }
  [data-night="true"] .hdr-dur { background: #000000 !important; border-color: rgba(255,59,48,0.12) !important; }
  [data-night="true"] .tab { color: rgba(255,59,48,0.4) !important; }
  [data-night="true"] .tab.on { color: #FF3B30 !important; }
  [data-night="true"] .tab.on::after { background: #FF3B30 !important; }
  [data-night="true"] .purpose-note { background: #000000 !important; border-color: rgba(255,59,48,0.12) !important; }
  /* ── BASE ── */
  .app {
    min-height:100vh;
    min-height:100dvh;
    height:100%;
    width:100%;
    max-width:100vw;
    min-width:0;
    display:flex;
    flex-direction:column;
    overflow-y:auto;
    overflow-x:hidden;
    -webkit-overflow-scrolling:touch;
    background: var(--bg-gradient);
    color:var(--text-primary);
    font-family:'Barlow',sans-serif;
    font-weight:300;
    position:relative;
    transition:color 0.3s;
    box-sizing:border-box;
  }
  .app-body { flex:1; display:flex; flex-direction:column; width:100%; position:relative; }
  .app-orbs { position:fixed; inset:0; z-index:0; pointer-events:none; }
  .app-orbs::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(255,255,255,0.02) 60%, transparent 100%);
  }
  @keyframes orbFloat {
    0%   { transform:scale(1) translate(0,0); }
    50%  { transform:scale(1.06) translate(12px,-10px); }
    100% { transform:scale(0.96) translate(-8px,14px); }
  }
  @keyframes flowFadeIn {
    from { opacity:0; transform:scale(0.92); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes flowDonePop {
    0%   { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
    50%  { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
    100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
  }

  /* ── GLASS CARD ── */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
    border-radius: 16px;
    transition: background 0.22s, border-color 0.22s, box-shadow 0.22s, transform 0.22s;
    position:relative; overflow:hidden;
  }
  .glass-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, var(--glass-specular) 30%, rgba(255,255,255,0.20) 50%, var(--glass-specular) 70%, transparent);
    pointer-events:none;
  }
  .glass-card:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-strong);
    box-shadow: var(--glass-shadow-lg), inset 0 1px 0 var(--glass-specular);
  }

  /* ── HEADER ── */
  .hdr-wrap {
    position:sticky; top:0; z-index:200; width:100%;
    background: var(--hdr-bg);
    backdrop-filter: blur(40px) saturate(2.0);
    -webkit-backdrop-filter: blur(40px) saturate(2.0);
    border-bottom: 1px solid var(--glass-border);
    box-shadow: 0 1px 0 var(--glass-specular), 0 4px 20px rgba(0,0,0,0.15);
    box-sizing:border-box;
    padding-top: env(safe-area-inset-top, 0px);
  }
  .hdr { padding:0 20px; box-sizing:border-box; width:100%; }
  .hdr-row { display:flex; justify-content:flex-start; align-items:flex-start; padding:6px 0 12px; }
  .hdr-left { flex:1; display:flex; flex-direction:column; gap:4px; align-items:flex-start; }
  .back-btn { background:none; border:none; font-family:'Barlow',sans-serif; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:var(--text-secondary); cursor:pointer; padding:14px 0 6px; transition:color 0.15s; display:block; }
  .back-btn:hover { color:var(--text-primary); }
  .hdr-title { font-size:24px; font-weight:500; letter-spacing:-0.02em; line-height:1.15; color:var(--text-white); }
  .hdr-meta { display:flex; gap:14px; margin-top:3px; align-items:center; }
  .hdr-subtitle { font-size:14px; color:var(--text-secondary); font-style:italic; }
  .hdr-dur {
    font-size:14px; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-secondary);
    background:var(--glass-bg); border:1px solid var(--glass-border); padding:3px 12px; border-radius:20px;
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  }

  /* ── SESSION / STREAK BAR ── */
  .streak-bar { display:flex; align-items:center; gap:8px; padding:8px 0 10px; border-bottom:1px solid var(--border); }
  .streak-divider { width:1px; height:14px; background:var(--glass-border); }
  .session-time { font-size:15px; color:var(--text-secondary); letter-spacing:0.02em; font-weight:400; }
  .session-time-lbl { font-size:13px; color:var(--text-dim); letter-spacing:0.14em; text-transform:uppercase; margin-left:4px; }
  .prog-bar { height:2px; background:var(--border); border-radius:2px; overflow:hidden; }
  .prog-fill { height:2px; background:linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 50%, transparent)); transition:width 0.6s cubic-bezier(0.4,0,0.2,1); box-shadow:0 0 10px var(--accent-glow); }

  /* ── TRACK SCROLL ── */
  .track-scroll { overflow-x:auto; display:flex; gap:6px; padding:10px 20px 10px; margin:0 -20px; border-bottom:1px solid var(--border); scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .track-scroll::-webkit-scrollbar { display:none; }
  .track-btn {
    padding:5px 16px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:500;
    letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; transition:all 0.2s;
    white-space:nowrap; flex-shrink:0; border-radius:20px;
    background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-secondary);
    backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  }
  .track-btn.active { background:var(--accent-dim); border-color:var(--accent); color:var(--accent); box-shadow:0 0 12px var(--accent-glow); }

  /* ── TABS ── */
  .tabs {
    display:flex; gap:0; width:100%;
    background:transparent;
    padding:0;
  }
  .tab {
    flex:1; padding:13px 0 11px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.16em; text-transform:uppercase; border:none; cursor:pointer;
    background:transparent; color:var(--text-dimmer); transition:all 0.18s;
    min-width:0; white-space:nowrap; position:relative;
    border-bottom: 2px solid transparent;
  }
  .tab.on { color:var(--accent); border-bottom-color: var(--accent); }
  /* sub-bar: tab-desc + progress live here, bleeds to edges, floats above content */
  .tab-subbar {
    position:sticky; top: var(--hdr-height, 120px); z-index:190;
    background: var(--hdr-bg);
    backdrop-filter: blur(40px) saturate(2.0);
    -webkit-backdrop-filter: blur(40px) saturate(2.0);
    box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 1px 0 var(--glass-border);
    margin: 0 -20px;
    padding: 10px 20px 12px;
  }
  .tab-desc-line {
    font-size:14px; color:var(--text-secondary);
    letter-spacing:0.03em; line-height:1.45;
    padding-bottom: 8px;
  }
  .tab-prog-row {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:6px;
  }

  /* ── CONTENT ── */
  .content { padding:0 20px 100px; max-width:100%; position:relative; z-index:1; }
  .sg {
    margin-top:32px;
    background:var(--glass-bg);
    backdrop-filter:blur(24px) saturate(1.8); -webkit-backdrop-filter:blur(24px) saturate(1.8);
    border:1px solid var(--glass-border);
    border-radius:22px;
    padding:18px 20px;
    box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
  }
  .sh { display:flex; align-items:baseline; gap:14px; padding-bottom:14px; border-bottom:1px solid var(--border); margin-bottom:12px; }
  .sh-tag { font-size:12px; color:var(--text-dimmer); letter-spacing:0.12em; }
  .sh-name { font-size:15px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-secondary); }
  .sh-ct { margin-left:auto; font-size:13px; color:var(--text-dimmer); }

  /* ── PURPOSE NOTE ── */
  .purpose-note {
    margin-top:8px; margin-bottom:8px; padding:10px 0;
    border-top:1px solid var(--border); border-bottom:1px solid var(--border);
  }
  .purpose-label { font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:var(--accent-secondary); margin-bottom:4px; font-weight:500; }
  .purpose-text { font-size:16px; font-style:italic; line-height:1.7; color:var(--text-secondary); }

  /* ── EXERCISE ROW ── */
  .er { display:flex; align-items:center; gap:12px; padding:13px 0; margin:0; border-bottom:1px solid var(--border); cursor:pointer; transition:all 0.2s; position:relative; border-radius:0; }
  .er:hover { background:var(--bg-hover); border-bottom-color:transparent; border-radius:10px; margin:0 -8px; padding:13px 8px; }
  .er.open {
    background:var(--glass-bg); border:1px solid var(--glass-border-strong);
    border-radius:12px 12px 0 0; border-bottom-color:transparent;
    box-shadow:inset 0 1px 0 var(--glass-specular);
    backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    margin:6px -8px 0; padding:13px 8px;
  }
  .panel {
    background:var(--glass-bg); border:1px solid var(--glass-border-strong); border-top:none;
    border-radius:0 0 12px 12px; padding:20px 16px 22px 16px;
    margin:0 -8px 8px;
    backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    box-shadow:0 4px 20px rgba(60,80,150,0.10), inset 0 -1px 0 var(--glass-specular);
  }
  .reps-row { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:8px; border-top:1px solid var(--border); padding-top:14px; flex-wrap:nowrap; }
  .reps-left { display:flex; flex-direction:column; flex:1; min-width:0; }
  .mark-btn {
    width:100%; padding:12px; border-radius:12px; cursor:pointer; transition:all 0.2s; margin-top:8px;
    background:var(--glass-bg); border:1px solid var(--glass-border-strong); color:var(--text-primary);
    font-family:'Barlow',sans-serif; font-size:15px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase;
    backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  }
  .mark-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-dim); }
  .chk {
    width:26px; height:26px; flex-shrink:0; border-radius:50%; cursor:pointer;
    border:1.5px solid var(--glass-border-strong); background:var(--glass-bg);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center; transition:all 0.2s;
  }
  .chk.on { border-color:var(--accent); background:var(--accent); box-shadow:0 0 12px var(--accent-glow); }
  .chk svg { opacity:0; transition:opacity 0.15s; }
  .chk.on svg { opacity:1; }
  .ei { flex:1; min-width:0; }
  .en { font-size:20px; font-weight:400; color:var(--text-primary); letter-spacing:-0.01em; transition:all 0.2s; }
  .er.open .en { color:var(--text-white); font-weight:500; }
  .en.done { color:var(--text-done); text-decoration:line-through; }
  .en.skipped { color:var(--text-done); text-decoration:line-through; }
  .es { font-size:12px; color:var(--text-secondary); margin-top:2px; font-style:italic; }

  .ereps { font-size:14px; font-weight:600; color:var(--text-secondary); letter-spacing:0.08em; margin-top:6px; text-transform:uppercase; }
  .npill {
    font-size:13px; letter-spacing:0.16em; text-transform:uppercase; padding:2px 9px; border-radius:20px;
    background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-secondary);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  }
  .chev { color:var(--text-dim); font-size:13px; transition:transform 0.25s; align-self:center; }
  .chev.op { transform:rotate(180deg); }
  .row-actions { display:flex; gap:4px; flex-shrink:0; align-self:center; }
  .ra-btn {
    width:26px; height:26px; border-radius:8px; border:1px solid var(--glass-border);
    background:var(--glass-bg); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    font-size:13px; font-weight:700; line-height:1; transition:all 0.15s; color:var(--text-dim);
  }
  .ra-btn:hover { background:var(--glass-bg-hover); border-color:var(--glass-border-strong); color:var(--text-primary); }
  .ra-btn.fav-on { color:var(--accent); border-color:var(--accent); background:var(--accent-dim); }

  /* ── FLOW CARD ── */
  .fc {
    margin-top:12px; padding:20px; border-radius:20px; position:relative; overflow:hidden;
    background:var(--glass-bg); backdrop-filter:blur(24px) saturate(1.8); -webkit-backdrop-filter:blur(24px) saturate(1.8);
    border:1px solid var(--glass-border); box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
  }
  .fc::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px; pointer-events:none;
    background:linear-gradient(90deg, transparent, var(--glass-specular) 30%, rgba(255,255,255,0.22) 50%, var(--glass-specular) 70%, transparent);
  }
  .fc-idx { position:absolute; top:14px; right:16px; font-size:13px; color:var(--text-dimmer); letter-spacing:0.12em; }
  .fc-name { font-size:28px; font-weight:500; letter-spacing:-0.03em; line-height:1.1; margin:4px 0 6px; color:var(--text-white); }
  .fc-sub { font-size:14px; color:var(--text-secondary); font-style:italic; margin-bottom:20px; }
  .fc-steps { display:flex; flex-direction:column; gap:0; border-top:1px solid var(--border); padding-top:18px; margin-bottom:18px; }
  .fc-step { display:flex; gap:0; position:relative; }
  .fc-step:not(:last-child)::after { content:''; position:absolute; left:21px; top:42px; bottom:0; width:1px; background:var(--step-connector); }
  .fc-badge {
    width:42px; height:42px; flex-shrink:0; border-radius:12px;
    background:var(--glass-bg); border:1px solid var(--glass-border);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
  }
  .fc-pos { font-size:15px; font-weight:600; color:var(--accent-secondary); }
  .fc-right { padding:0 0 20px 14px; flex:1; }
  .fc-plabel { font-size:13px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:3px; }
  .fc-pfocus {
    display:inline-block; font-size:13px; letter-spacing:0.16em; border-radius:20px;
    color:var(--accent-secondary); background:var(--accent-dim); border:1px solid rgba(255,191,101,0.18);
    padding:1px 9px; margin-bottom:6px;
  }
  .fc-pcue { font-size:18px; color:var(--text-primary); line-height:1.65; font-weight:300; }
  .fc-timer { border-top:1px solid var(--border); padding-top:16px; margin-bottom:14px; }
  .fc-reps { border-top:1px solid var(--border); padding-top:14px; margin-bottom:14px; }
  /* flow fullscreen overlay */
  .fv-overlay {
    position:fixed; inset:0; z-index:500;
    background:var(--bg-gradient);
    display:flex; flex-direction:column;
  }
  .fv-top-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:calc(env(safe-area-inset-top, 0px) + 52px) 20px 14px; flex-shrink:0;
  }
  .fv-top-exit {
    background:none; border:none; cursor:pointer; padding:6px;
    color:var(--text-secondary); font-family:'Barlow',sans-serif;
    font-size:13px; letter-spacing:0.16em; text-transform:uppercase;
  }
  .fv-top-meta { text-align:right; }
  .fv-top-section { font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dimmer); }
  .fv-top-prog { font-size:12px; color:var(--text-secondary); margin-top:2px; }
  /* main card */
  .fv-main {
    flex:1; display:flex; flex-direction:column; justify-content:space-between;
    margin:0 16px; padding:32px 28px 28px; border-radius:28px; overflow:hidden;
    background:var(--glass-bg); border:1px solid var(--glass-border);
    box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
  }
  .fv-name { font-size:40px; font-weight:500; letter-spacing:-0.03em; line-height:1.05; color:var(--text-white); margin-bottom:16px; }
  .fv-cue { font-size:18px; color:var(--text-secondary); font-style:italic; line-height:1.65; }
  .fv-bottom { display:flex; flex-direction:column; gap:12px; }
  .fv-next { font-size:14px; color:var(--text-dim); letter-spacing:0.10em; text-transform:uppercase; }
  .fv-next span { color:var(--text-secondary); font-style:italic; letter-spacing:0; text-transform:none; }
  /* action bar */
  .fv-bar {
    display:flex; gap:10px; padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 20px); flex-shrink:0;
  }
  .fv-cta {
    width:100%; padding:20px 24px; border-radius:20px; cursor:pointer; transition:all 0.18s; border:none;
    background:var(--accent); color:var(--accent-btn-text);
    font-family:'Barlow',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;
    box-shadow:0 4px 24px var(--accent-glow);
    display:flex; flex-direction:column; align-items:center;
  }
  .fv-cta:hover { box-shadow:0 6px 32px var(--accent-glow); transform:translateY(-1px); }
  .fv-cta:active { transform:scale(0.97); opacity:0.85; }
  .fv-cta.done { background:var(--accent-dim); border:1px solid var(--accent); color:var(--accent); }
  .fv-skip {
    padding:18px 20px; border-radius:18px; cursor:pointer; transition:all 0.15s;
    background:var(--glass-bg); border:1px solid var(--glass-border-strong); color:var(--text-secondary);
    font-family:'Barlow',sans-serif; font-size:15px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase;
    box-shadow:0 1px 4px rgba(0,0,0,0.12);
  }
  .fv-prev {
    padding:18px 20px; border-radius:18px; cursor:pointer; transition:all 0.15s;
    background:var(--glass-bg); border:1px solid var(--glass-border-strong); color:var(--text-secondary);
    font-family:'Barlow',sans-serif; font-size:17px; line-height:1;
    box-shadow:0 1px 4px rgba(0,0,0,0.12);
  }
  .fv-prev:disabled { opacity:0.2; cursor:not-allowed; }

  /* ── EXERCISE SUBTITLE ── */
  .es { font-size:14px; color:var(--text-secondary); margin-top:4px; font-style:italic; line-height:1.55; }

  /* ── STEPS (A/B/C cues) ── */
  .steps { display:flex; flex-direction:column; gap:0; margin-top:8px; }
  .step { display:flex; gap:10px; align-items:flex-start; padding:14px 0; border-bottom:1px solid var(--border); }
  .step:last-child { border-bottom:none; }
  .step-badge {
    width:28px; flex-shrink:0; display:flex; align-items:flex-start; justify-content:flex-start; padding-top:3px;
  }
  .step-badge-inner {
    width:20px; height:20px; border-radius:50%;
    background:transparent; border:1px solid var(--accent-secondary);
    display:flex; align-items:center; justify-content:center; line-height:1; flex-shrink:0;
  }
  .step-pos { font-size:13px; font-weight:700; letter-spacing:0; color:var(--accent-secondary); }
  .step-right { flex:1; }
  .step-label { font-size:17px; font-weight:500; color:var(--text-white); line-height:1.3; }
  .step-focus { font-size:14px; color:var(--accent-secondary); letter-spacing:0.08em; margin-top:5px; font-weight:600; text-transform:uppercase; }
  .step-cue { font-size:19px; color:var(--text-secondary); margin-top:12px; line-height:1.65; }
  .fc-steps .step { padding:12px 0; }

  /* ── TIMER ── */
  .timer-wrap {
    padding:16px 0 14px; margin-top:20px; margin-bottom:4px;
    border-top:1px solid var(--border);
    display:flex; flex-direction:column; gap:14px;
  }
  .timer-top { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
  .timer-val {
    font-size:60px; font-weight:600; letter-spacing:-0.04em;
    color:var(--text-white); line-height:1;
  }
  .timer-unit {
    font-size:12px; letter-spacing:0.16em; text-transform:uppercase;
    color:var(--text-secondary); font-weight:500;
  }
  .timer-next { text-align:right; }
  .timer-next { text-align:right; }
  .timer-next-lbl { font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); margin-bottom:3px; }
  .timer-next-name { font-size:13px; font-weight:500; color:var(--text-secondary); letter-spacing:-0.01em; max-width:160px; line-height:1.3; }
  .timer-next-name { font-size:13px; font-weight:500; color:var(--text-secondary); line-height:1.3; max-width:140px; }
  .timer-bar-track {
    height:3px; background:var(--border); border-radius:3px;
    overflow:hidden; width:100%;
  }
  .timer-bar-fill {
    height:3px; border-radius:3px;
    background:linear-gradient(90deg, var(--accent), var(--accent-dim));
    box-shadow:0 0 8px var(--accent-glow);
    transition:width 1s linear;
  }
  .timer-btns { display:flex; gap:8px; }
  .tb {
    flex:1; padding:10px 0; border-radius:20px; cursor:pointer; transition:all 0.15s;
    background:var(--accent); border:none; color:var(--accent-btn-text);
    font-family:'Barlow',sans-serif; font-size:15px; font-weight:700;
    letter-spacing:0.16em; text-transform:uppercase;
    box-shadow:0 4px 14px var(--accent-glow);
  }
  .tb:hover { opacity:0.88; }
  .tb-g {
    padding:10px 20px; border-radius:20px; cursor:pointer; transition:all 0.15s;
    background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-secondary);
    font-family:'Barlow',sans-serif; font-size:13px; font-weight:500;
    letter-spacing:0.14em; text-transform:uppercase;
  }
  .tb-g:hover { border-color:var(--glass-border-strong); color:var(--text-primary); }

  /* ── REPS ── */
  .reps-big {
    font-size:clamp(40px, 12vw, 60px); font-weight:600; letter-spacing:-0.03em; color:var(--text-white);
    line-height:1;
  }
  .reps-str {
    font-size:24px; font-weight:500; color:var(--text-white); letter-spacing:-0.01em; line-height:1.3;
  }
  .reps-unit {
    font-size:14px; font-weight:500; letter-spacing:0.18em; text-transform:uppercase;
    color:var(--text-secondary); margin-top:5px;
  }
  .fc-reps { border-top:1px solid var(--border); padding-top:16px; margin-bottom:14px; }

  /* ── REST OVERLAY ── */
  .rest-overlay {
    display:flex; align-items:center; gap:16px;
    padding:14px 18px; border-radius:14px; margin-bottom:4px;
    background:var(--glass-bg); border:1px solid var(--glass-border);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  }
  .rest-num { font-size:44px; font-weight:600; color:var(--accent); letter-spacing:-0.03em; min-width:52px; text-align:center; }
  .rest-lbl { font-size:15px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-white); }
  .rest-sub { font-size:14px; color:var(--text-secondary); margin-top:3px; }

  /* ── DOTS — moved to header area, below tabs ── */
  .dots-bar {
    padding:8px 20px 6px;
    display:flex; gap:5px; flex-wrap:wrap;
  }
  .dots { display:flex; gap:5px; flex-wrap:wrap; }
  .dot { width:7px; height:7px; border-radius:50%; background:var(--dot-bg); cursor:pointer; transition:all 0.2s; }
  .dot.dd { background:var(--dot-done); }
  .dot.da { background:var(--accent); box-shadow:0 0 8px var(--accent-glow); transform:scale(1.2); }
  .dot.ds { background:var(--dot-bg); opacity:0.28; }

  /* ── SUMMARY ── */
  .summary {
    border:1px solid var(--glass-border); padding:20px; margin-top:28px; border-radius:18px;
    background:var(--glass-bg); backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
    position:relative; overflow:hidden;
  }
  .summary::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px; pointer-events:none;
    background:linear-gradient(90deg, transparent, var(--glass-specular) 35%, rgba(255,255,255,0.2) 50%, var(--glass-specular) 65%, transparent);
  }
  .summary-title { font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:14px; font-weight:500; }
  .summary-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
  .summary-cell {
    background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px;
    padding:14px 12px; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    box-shadow:inset 0 1px 0 var(--glass-specular);
  }
  .summary-num { font-size:28px; font-weight:300; color:var(--accent-secondary); letter-spacing:-0.04em; line-height:1; margin-bottom:4px; }
  .summary-lbl { font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-secondary); }
  .history-row { display:flex; justify-content:space-between; align-items:center; padding:13px 0; border-bottom:1px solid var(--border); }
  .history-date { font-size:12px; color:var(--text-tertiary); }
  .history-track { font-size:13px; letter-spacing:0.10em; text-transform:uppercase; color:var(--text-secondary); }
  .history-detail { font-size:12px; color:var(--text-dim); }

  /* Momentum 7-day strip (glass card) */
  .summary-momentum { margin-top:24px; }
  .momentum-strip { display:flex; gap:6px; margin-bottom:10px; }
  .momentum-cell { flex:1; aspect-ratio:1; border-radius:6px; transition:all 0.2s; }
  .momentum-labels { display:flex; justify-content:space-between; margin-bottom:8px; }
  .momentum-label { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-dimmer); }
  .momentum-disclaimer { font-size:11px; color:var(--text-dimmer); letter-spacing:0.06em; line-height:1.5; }

  /* ── DONE BANNER ── */
  .done-banner {
    padding:36px 22px; text-align:center; margin-top:24px; border-radius:22px;
    background:var(--glass-bg); border:1px solid var(--glass-border);
    backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
  }
  .db-title { font-size:22px; font-weight:500; letter-spacing:-0.03em; margin-bottom:5px; color:var(--text-white); }
  .db-sub { font-size:13px; color:var(--text-secondary); letter-spacing:0.14em; text-transform:uppercase; }
  .reset-lnk { display:block; width:fit-content; margin:20px auto 0; background:none; border:none; font-family:'Barlow',sans-serif; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; color:var(--text-dim); cursor:pointer; text-decoration:underline; text-underline-offset:3px; transition:color 0.15s; }
  .reset-lnk:hover { color:var(--text-secondary); }

  /* ── FAV FILTER ── */
  .fav-filter { display:flex; align-items:center; gap:8px; padding:14px 0 6px; flex-wrap:wrap; }
  .fav-toggle {
    padding:5px 13px; border-radius:20px; font-family:'Barlow',sans-serif;
    font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase;
    cursor:pointer; transition:all 0.18s; white-space:nowrap;
    border:1px solid var(--glass-border); background:transparent; color:var(--text-dim);
  }
  .fav-toggle:hover { border-color:var(--accent); color:var(--accent); }
  .fav-toggle.on { border-color:var(--accent); background:var(--accent-dim); color:var(--accent); }
  .fav-toggle.reset-pill { border-style:solid; color:var(--text-dim); }
  .fav-toggle.reset-pill:hover { border-color:var(--text-secondary); color:var(--text-secondary); }

  /* ── NOTES ── */
  .notes-area { margin-top:10px; }
  .notes-input {
    width:100%; padding:10px 14px; font-family:'Barlow',sans-serif; font-size:13px; border-radius:12px;
    background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-primary);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    resize:none; line-height:1.6; outline:none; transition:all 0.2s;
  }
  .notes-input:focus { border-color:var(--glass-border-strong); background:var(--glass-bg-hover); }
  .notes-input::placeholder { color:var(--text-dim); }

  /* ── TAB BAR ── */
  .tab-bar {
    position:fixed; bottom:0; left:0; right:0;
    background:var(--tab-bg);
    backdrop-filter:blur(30px) saturate(1.8); -webkit-backdrop-filter:blur(30px) saturate(1.8);
    border-top:1px solid var(--glass-border);
    display:flex; align-items:stretch; justify-content:space-around;
    padding:0 0 calc(env(safe-area-inset-bottom,0px));
    z-index:300;
  }
  .tab-btn {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:3px; padding:10px 6px 8px; border:none; cursor:pointer; border-radius:0;
    background:transparent; color:var(--text-dim);
    font-family:'Barlow',sans-serif; font-size:11px; font-weight:500;
    letter-spacing:0.08em; text-transform:uppercase;
    transition:color 0.15s; position:relative; flex:1;
    border-top:2px solid transparent;
  }
  .tab-btn.active {
    color:var(--accent);
    border-top-color:var(--accent);
  }
  .tab-btn.active svg { filter:drop-shadow(0 0 3px var(--accent-glow)); }
  .tab-btn:hover { color:var(--text-secondary); }
  .tab-btn svg { stroke:currentColor; fill:none; transition:all 0.15s; width:18px; height:18px; }
  @keyframes tabPulse {
    0%, 100% { opacity:1; transform:scale(1); }
    50% { opacity:0.7; transform:scale(1.2); }
  }
  .tab-live-dot {
    position:absolute; top:8px; right:calc(50% - 12px);
    width:5px; height:5px; border-radius:50%;
    background:var(--accent); box-shadow:0 0 5px var(--accent-glow);
    animation:tabPulse 4s ease-in-out infinite;
  }
  .tab-bar-spacer { height:calc(62px + env(safe-area-inset-bottom, 0px)); }

  /* ── HOME ── */
  .home { min-height:100vh; position:relative; z-index:1; }
  .home-hdr { padding: var(--safe-top) var(--page-padding) 0; max-width:100%; }
  .home-wordmark {
    font-size:36px; font-weight:700; letter-spacing:0.10em; text-transform:uppercase;
    color:var(--text-white); line-height:1; margin-bottom:0;
  }
  .home-eyebrow { display:none; }
  .home-brand { display:flex; flex-direction:column; align-items:flex-start; gap:0; }
  .home-brand-icon { display:none; }
  .home-tagline {
    font-size:20px; color:var(--text-white); font-weight:400; font-style:normal;
    padding:18px 0 24px; letter-spacing:-0.01em; max-width:100%; display:block;
    line-height:1.3; text-align:left; margin:0;
  }
  /* End-of-list marker */
  .eol-marker {
    display:flex; align-items:center; justify-content:center;
    height:calc(84px + env(safe-area-inset-bottom, 0px));
    user-select:none; -webkit-user-select:none;
    position:relative; cursor:default; width:100%;
  }
  .eol-xs {
    font-size:12px; letter-spacing:0.8em; font-weight:300;
    color:var(--eol-color);
    transition:opacity 0.4s ease;
    text-align:center;
  }
  .eol-tag {
    font-size:12px; letter-spacing:0.22em; font-weight:300;
    color:var(--eol-color);
    text-transform:uppercase;
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    opacity:0; transition:opacity 0.4s ease;
    white-space:nowrap; padding-right:0;
  }
  .eol-marker.show-tag .eol-xs { opacity:0; }
  .eol-marker.show-tag .eol-tag { opacity:1; }

  /* ── TRACK GROUPS ── */
  .track-cards-outer { padding:0 24px 0; }
  .track-group { padding:0; max-width:100%; }
  .track-group + .track-group { margin-top:20px; }
  .track-group-label {
    font-size:14px; font-weight:700; letter-spacing:0.28em; text-transform:uppercase;
    color:var(--text-dim); margin-bottom:12px;
  }
  .start-here-group { margin-bottom:4px; }
  .start-here-label { color:var(--accent-secondary); letter-spacing:0.22em; }
  .track-cards { display:flex; flex-direction:column; gap:8px; }

  /* ── TRACK CARD ── */
  .track-card {
    background:var(--glass-bg); backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    border:1px solid var(--glass-border);
    box-shadow:0 24px 48px rgba(0,0,0,0.06), var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
    border-radius:24px; padding:28px 24px 22px 24px; cursor:pointer;
    transition: background 0.22s, border-color 0.22s, box-shadow 0.22s, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display:flex; flex-direction:column; gap:12px; position:relative; overflow:hidden;
  }
  .track-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg, transparent, var(--glass-specular) 35%, rgba(255,255,255,0.18) 50%, var(--glass-specular) 65%, transparent);
  }
  .track-card:hover {
    background:var(--glass-bg-hover); border-color:var(--glass-border-strong);
    box-shadow:var(--glass-shadow-lg), inset 0 1px 0 var(--glass-specular);
    transform:translateY(-2px);
  }
  .track-card:active { transform:scale(0.98); }
  .track-card-left { flex:1; min-width:0; width:100%; }
  .track-card-name { font-size:22px; font-weight:600; color:var(--text-white); margin-bottom:6px; letter-spacing:-0.02em; }
  .track-card-sub { font-size:14px; color:var(--accent-secondary); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px; line-height:1.5; }
  .track-card-purpose { font-size:15px; color:var(--text-secondary); font-style:italic; line-height:1.65; margin-top:10px; }
  .track-card-right { display:flex; align-items:center; justify-content:space-between; width:100%; }
  .track-card-dur { font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:var(--text-dim); font-weight:500; }
  .begin-btn {
    padding:9px 22px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700;
    letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; border-radius:20px;
    background:var(--accent); border:none; color:var(--accent-btn-text);
    transition:all 0.2s;
    box-shadow:0 2px 12px var(--accent-glow);
  }
  .begin-btn:hover { opacity:0.88; transform:scale(1.03); }

  /* ── THEME TOGGLE ── */
  .theme-toggle {
    position:fixed; top:16px; right:20px; z-index:200; border-radius:50%;
    background:var(--glass-bg); border:1px solid var(--glass-border);
    backdrop-filter:blur(24px) saturate(1.4); -webkit-backdrop-filter:blur(24px) saturate(1.4);
    width:36px; height:36px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
    transition:all 0.2s;
  }
  .theme-toggle:hover { background:var(--glass-bg-hover); border-color:var(--glass-border-strong); }
  .theme-toggle svg { stroke:var(--text-secondary); fill:none; }

  /* ── ACCESSIBILITY: focus visible (keyboard / screen reader) ── */
  button:focus-visible, a:focus-visible, .track-card:focus-visible,
  input:focus-visible, [role="button"]:focus-visible {
    outline:2px solid var(--accent);
    outline-offset:2px;
  }
  .track-card { outline:none; }
  .tab-btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

  /* ── ACCESSIBILITY: reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .app-orbs { animation: none !important; }
    .tab-live-dot { animation: none !important; }
    .track-card, .glass-card, .tab-btn, .begin-btn { transition-duration: 0.08s; }
  }
`;

// ─────────────────────────────────────────────────────────────
//  TIMER
// ─────────────────────────────────────────────────────────────
function Timer({ seconds, onDone, nextName }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running && left > 0) ref.current = setInterval(() => setLeft((l) => l - 1), 1000);else
    {clearInterval(ref.current);if (left === 0 && running) {setRunning(false);onDone?.();}}
    return () => clearInterval(ref.current);
  }, [running, left]);
  const pct = (seconds - left) / seconds;
  const label = running ? "Pause" : left === seconds ? "Start" : "Resume";
  return (/*#__PURE__*/
    React.createElement("div", { className: "timer-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "timer-top" }, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } }, /*#__PURE__*/
    React.createElement("div", { className: "timer-val" }, left), /*#__PURE__*/
    React.createElement("div", { className: "timer-unit" }, "sec")
    ),
    nextName && /*#__PURE__*/
    React.createElement("div", { className: "timer-next" }, /*#__PURE__*/
    React.createElement("div", { className: "timer-next-lbl" }, "Next up"), /*#__PURE__*/
    React.createElement("div", { className: "timer-next-name" }, nextName)
    )

    ), /*#__PURE__*/
    React.createElement("div", { className: "timer-bar-track" }, /*#__PURE__*/
    React.createElement("div", { className: "timer-bar-fill", style: { width: `${pct * 100}%` } })
    ), /*#__PURE__*/
    React.createElement("div", { className: "timer-btns" }, /*#__PURE__*/
    React.createElement("button", { className: "tb", onClick: () => setRunning((r) => !r) }, label), /*#__PURE__*/
    React.createElement("button", { className: "tb-g", onClick: () => {setLeft(seconds);setRunning(false);clearInterval(ref.current);} }, "Reset")
    )
    ));

}

function RestTimer({ onDone }) {
  const [left, setLeft] = useState(5);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => setLeft((l) => {if (l <= 1) {clearInterval(ref.current);onDone();return 0;}return l - 1;}), 1000);
    return () => clearInterval(ref.current);
  }, []);
  return (/*#__PURE__*/
    React.createElement("div", { className: "rest-overlay" }, /*#__PURE__*/
    React.createElement("div", { className: "rest-num" }, left), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("div", { className: "rest-lbl" }, "Rest"), /*#__PURE__*/React.createElement("div", { className: "rest-sub" }, "Next exercise in ", left, "s"))
    ));

}

function Steps({ steps, small }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: small ? "steps" : "fc-steps" },
    small && steps && steps.length > 0 && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
        color: "var(--text-dimmer)", fontWeight: 600, paddingBottom: 8,
        borderBottom: "1px solid var(--border)", marginBottom: 0, paddingLeft: 0 } }, "How to perform"

    ),

    steps.map((s, i) => small ? /*#__PURE__*/
    React.createElement("div", { className: "step", key: i }, /*#__PURE__*/
    React.createElement("div", { className: "step-badge" }, /*#__PURE__*/React.createElement("div", { className: "step-badge-inner" }, /*#__PURE__*/React.createElement("span", { className: "step-pos" }, s.pos))), /*#__PURE__*/
    React.createElement("div", { className: "step-right" }, /*#__PURE__*/
    React.createElement("div", { className: "step-label" }, s.label), /*#__PURE__*/
    React.createElement("div", { className: "step-focus" }, s.focus), /*#__PURE__*/
    React.createElement("div", { className: "step-cue" }, s.cue)
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "fc-step", key: i }, /*#__PURE__*/
    React.createElement("div", { className: "fc-badge" }, /*#__PURE__*/React.createElement("span", { className: "fc-pos" }, s.pos)), /*#__PURE__*/
    React.createElement("div", { className: "fc-right" }, /*#__PURE__*/
    React.createElement("div", { className: "fc-plabel" }, s.label), /*#__PURE__*/
    React.createElement("div", { className: "fc-pfocus" }, s.focus), /*#__PURE__*/
    React.createElement("div", { className: "fc-pcue" }, s.cue)
    )
    )
    )
    ));

}

function ExRow({ ex, done, onToggle, open, onExpand, skipped, onSkip, faved, onFav, note, onNote, nextName, hideTimer = false, hideDone = false }) {
  const rowRef = useRef(null);
  useEffect(() => {
    if (open && rowRef.current) {
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  }, [open]);
  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { ref: rowRef, className: `er ${open ? "open" : ""} ${skipped ? "skipped" : ""}`, onClick: onExpand, style: skipped ? { opacity: 0.32 } : {} },
    !hideDone && /*#__PURE__*/React.createElement("div", { className: `chk ${done && !skipped ? "on" : ""}`, onClick: (e) => {e.stopPropagation();if (!skipped) onToggle();} }, /*#__PURE__*/
    React.createElement("svg", { width: "9", height: "7", viewBox: "0 0 9 7", fill: "none" }, /*#__PURE__*/
    React.createElement("path", { d: "M1 3.5L3.2 5.5L8 1", stroke: "#13181B", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "ei" }, /*#__PURE__*/
    React.createElement("div", { className: `en ${done && !skipped ? "done" : ""} ${skipped ? "skipped" : ""}` }, ex.name), /*#__PURE__*/
    React.createElement("div", { className: "es" }, ex.sub),
    ex.reps && !skipped && !hideDone && /*#__PURE__*/React.createElement("div", { className: "ereps" }, ex.reps)
    ), /*#__PURE__*/
    React.createElement("div", { className: "row-actions", onClick: (e) => e.stopPropagation() },
    !skipped && /*#__PURE__*/React.createElement("button", { className: `ra-btn ${faved ? "fav-on" : ""}`, onClick: onFav }, "\u2605"), /*#__PURE__*/
    React.createElement("button", { className: `ra-btn ${skipped ? "skip-on" : ""}`, onClick: onSkip }, skipped ? /*#__PURE__*/
    React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/
    React.createElement("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }), /*#__PURE__*/
    React.createElement("path", { d: "M3 3v5h5" })
    ) :
    "—")
    ), /*#__PURE__*/
    React.createElement("div", { className: `chev ${open ? "op" : ""}`, style: { marginLeft: 4 } }, "\u25BE")
    ),
    open && /*#__PURE__*/
    React.createElement("div", { className: "panel", style: skipped ? { opacity: 0.45 } : {} },
    ex.start && /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--accent-glow)" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-secondary)", fontWeight: 700, flexShrink: 0 } }, "Start"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 } }, ex.start)
    ), /*#__PURE__*/

    React.createElement(Steps, { steps: ex.steps, small: true }),
    !skipped && /*#__PURE__*/
    React.createElement(React.Fragment, null,
    (ex.type === "time" || ex.type === "flow") && !hideTimer ? /*#__PURE__*/
    React.createElement(Timer, { key: ex.id, seconds: ex.seconds, onDone: onToggle, nextName: nextName }) :
    ex.reps && !hideDone ? /*#__PURE__*/
    React.createElement("div", { style: { marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-secondary)", fontWeight: 700, marginBottom: 8 } }, "Target"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 16, fontWeight: 700, letterSpacing: "0.04em", color: "var(--text-white)", lineHeight: 1.3, marginBottom: 16 } },
    ex.reps
    ), /*#__PURE__*/
    React.createElement("button", { className: "mark-btn", onClick: onToggle }, "Mark Done")
    ) :
    !hideDone ? /*#__PURE__*/React.createElement("button", { className: "mark-btn", onClick: onToggle, style: { marginTop: 16 } }, "Mark Done") : null

    )


    )

    ));

}


// ─────────────────────────────────────────────────────────────
//  MOMENTUM — 7-day strip (device-only)
// ─────────────────────────────────────────────────────────────
function MomentumMap({ history }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const sessionCounts = history.reduce((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...Object.values(sessionCounts));
  return (/*#__PURE__*/
    React.createElement("div", { className: "summary summary-momentum", style: { marginTop: 24 } }, /*#__PURE__*/
    React.createElement("div", { className: "summary-title", style: { marginBottom: 12 } }, "Momentum"), /*#__PURE__*/
    React.createElement("div", { className: "momentum-strip" },
    days.map((dateStr, i) => {
      const count = sessionCounts[dateStr] || 0;
      const intensity = count > 0 ? 0.35 + count / maxCount * 0.65 : 0;
      const isToday = i === 6;
      return (/*#__PURE__*/
        React.createElement("div", { key: i, className: "momentum-cell", style: {
            background: count > 0 ? `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, transparent)` : "var(--dot-bg)",
            boxShadow: count > 0 ? `0 0 ${4 + intensity * 6}px var(--accent-glow)` : "none",
            border: isToday ? "1px solid var(--accent)" : "none"
          } }));

    })
    ), /*#__PURE__*/
    React.createElement("div", { className: "momentum-labels" }, /*#__PURE__*/
    React.createElement("span", { className: "momentum-label" }, "7 days ago"), /*#__PURE__*/
    React.createElement("span", { className: "momentum-label" }, "Today")
    ), /*#__PURE__*/
    React.createElement("div", { className: "momentum-disclaimer" }, "Activity data is stored locally on this device."

    )
    ));

}

// ─────────────────────────────────────────────────────────────
//  TAB BAR
// ─────────────────────────────────────────────────────────────
function TabBar({ view, setView, hasActiveSession, theme }) {
  const HomeIcon = () => /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), /*#__PURE__*/React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" }));
  const SessionIcon = () => /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /*#__PURE__*/React.createElement("polyline", { points: "12 6 12 12 16 14" }));
  const MoodIcon = () => /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "5" }));
  const TimerIcon = () => /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "13", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "M12 9v4l2.5 2.5" }), /*#__PURE__*/React.createElement("path", { d: "M9 3h6" }), /*#__PURE__*/React.createElement("path", { d: "M12 3v2" }));
  const SettingsIcon = () => /*#__PURE__*/React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /*#__PURE__*/React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }));

  return (/*#__PURE__*/
    React.createElement("div", { className: "tab-bar" }, /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18) 50%,transparent)", pointerEvents: "none" } }), /*#__PURE__*/
    React.createElement("button", { className: `tab-btn ${view === "home" ? "active" : ""}`, onClick: () => setView("home"), "aria-label": "Today", "aria-current": view === "home" ? "page" : undefined }, /*#__PURE__*/React.createElement(HomeIcon, null), "Today"), /*#__PURE__*/
    React.createElement("button", { className: `tab-btn ${view === "session" ? "active" : ""}`, onClick: () => setView("session"), style: { position: "relative" }, "aria-label": "Session", "aria-current": view === "session" ? "page" : undefined },
    hasActiveSession && view !== "session" && /*#__PURE__*/React.createElement("div", { className: "tab-live-dot", "aria-hidden": true }), /*#__PURE__*/
    React.createElement(SessionIcon, null), "Session"
    ), /*#__PURE__*/
    React.createElement("button", { className: `tab-btn ${view === "timer" ? "active" : ""}`, onClick: () => setView("timer"), "aria-label": "Timer", "aria-current": view === "timer" ? "page" : undefined }, /*#__PURE__*/React.createElement(TimerIcon, null), "Timer"), /*#__PURE__*/
    React.createElement("button", { className: `tab-btn ${view === "mood" ? "active" : ""}`, onClick: () => setView("mood"), "aria-label": "Mood and appearance", "aria-current": view === "mood" ? "page" : undefined }, /*#__PURE__*/React.createElement(MoodIcon, null), "Mood"), /*#__PURE__*/
    React.createElement("button", { className: `tab-btn ${view === "settings" ? "active" : ""}`, onClick: () => setView("settings"), "aria-label": "Settings", "aria-current": view === "settings" ? "page" : undefined }, /*#__PURE__*/React.createElement(SettingsIcon, null), "Settings")
    ));

}

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  FLOW OVERLAY — mounts directly on document.body via ref
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  EXERCISE FIGURE — renders SVG illustration if available
// ─────────────────────────────────────────────────────────────
function ExerciseFigure({ id, size = 110 }) {
  const svg = FIGURES[id];
  if (!svg) return null;
  return (/*#__PURE__*/
    React.createElement("div", {
      style: { width: size, height: Math.round(size * 160 / 120), flexShrink: 0 },
      dangerouslySetInnerHTML: { __html: svg } }
    ));

}

// ─────────────────────────────────────────────────────────────
//  OVERLAY TIMER — fully inlined styles, no CSS class dependency
// ─────────────────────────────────────────────────────────────
let _audioCtx = null;

function primeAudio() {
  try {
    if (!_audioCtx || _audioCtx.state === "closed") {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === "suspended") _audioCtx.resume();
  } catch (e) {}
}

function beep(freq = 880, duration = 0.3) {
  try {
    if (!_audioCtx || _audioCtx.state !== "running") return;
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.frequency.value = freq;o.type = "sine";
    g.gain.setValueAtTime(0.25, _audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
    o.start(_audioCtx.currentTime);o.stop(_audioCtx.currentTime + duration);
  } catch (e) {}
}

function OverlayTimer({ seconds, onDone, autoStart = false, paused = false, onReset, fi = 0, list = [], theme = "dark", activePeriod = null, nightMode = false }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const ref = useRef(null);

  useEffect(() => {if (autoStart) setRunning(true);}, []);

  // External pause control
  useEffect(() => {setRunning(!paused);}, [paused]);

  useEffect(() => {
    if (running && left > 0) {
      ref.current = setInterval(() => setLeft((l) => {
        const next = l - 1;
        if (next === 3 || next === 2 || next === 1) beep(440, 0.08);
        return next;
      }), 1000);
    } else {
      clearInterval(ref.current);
      if (left === 0 && running) {setRunning(false);beep(880, 0.4);onDone?.();}
    }
    return () => clearInterval(ref.current);
  }, [running, left]);

  // External reset
  useEffect(() => {
    if (onReset) {setLeft(seconds);setRunning(autoStart);}
  }, [onReset]);

  const pct = seconds > 0 ? (seconds - left) / seconds : 0;
  const remaining = left;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${remaining}`;
  const total = list.length;

  // Theme-aware timer colors — use circadian accent
  const isTimerDark = nightMode || theme === "dark";
  const timerPeriod = activePeriod || getCircadianPeriod();
  const timerCt = nightMode ?
  { accent: "#FF3B30", accentDim: "rgba(255,59,48,0.18)" } :
  CIRCADIAN_THEMES[timerPeriod][isTimerDark ? "dark" : "light"];
  const timerAccent = timerCt.accent;
  const timerAccentDim = timerCt.accentDim;
  const TN = nightMode ? "#FF3B30" : isTimerDark ? "#ffffff" : "#1a1048";
  const TU = nightMode ? "rgba(255,59,48,0.55)" : isTimerDark ? "rgba(232,228,223,0.45)" : "rgba(26,16,72,0.55)";
  const TC = nightMode ? "rgba(255,59,48,0.55)" : isTimerDark ? "rgba(232,228,223,0.50)" : "rgba(26,16,72,0.55)";
  const TCB = nightMode ? "#FF3B30" : isTimerDark ? "#ffffff" : "#1a1048";
  const BAR_TRACK = nightMode ? "rgba(255,59,48,0.12)" : isTimerDark ? "rgba(255,255,255,0.10)" : "rgba(15,30,46,0.10)";
  const BAR_FILL = `linear-gradient(90deg,${timerAccent},${timerAccentDim})`;
  const DOT_CURR = nightMode ? "#FF3B30" : isTimerDark ? "#ffffff" : "#0f1e2e";
  const DOT_DONE = timerAccent;
  const DOT_REST = nightMode ? "rgba(255,59,48,0.18)" : isTimerDark ? "rgba(255,255,255,0.18)" : "rgba(15,30,46,0.15)";
  const LINE_DONE = `${timerAccent}44`;
  const LINE_REST = nightMode ? "rgba(255,59,48,0.10)" : isTimerDark ? "rgba(255,255,255,0.08)" : "rgba(15,30,46,0.10)";
  const NEXT_C = nightMode ? "rgba(255,59,48,0.45)" : isTimerDark ? "rgba(232,228,223,0.40)" : "rgba(15,30,46,0.50)";
  const NEXT_NAME = nightMode ? "#FF3B30" : isTimerDark ? "rgba(232,228,223,0.70)" : "#0f1e2e";

  return (/*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 0, marginTop: 16 } }, /*#__PURE__*/

    React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 72, fontWeight: 600, letterSpacing: "-0.04em", color: TN, lineHeight: 1 } }, display), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: TU, fontWeight: 500, marginBottom: 4 } }, mins > 0 ? "min" : "sec")
    ), /*#__PURE__*/

    React.createElement("div", { style: { height: 2, background: "transparent", borderRadius: 2, overflow: "hidden", marginBottom: 16 } }, /*#__PURE__*/
    React.createElement("div", { style: { height: 2, borderRadius: 2, background: BAR_FILL,
        width: `${pct * 100}%`, transition: "width 1s linear" } })
    ),

    total > 0 && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 13, color: TC, letterSpacing: "0.06em", marginBottom: 14 } }, /*#__PURE__*/
    React.createElement("span", { style: { color: TCB, fontWeight: 600 } }, fi + 1), /*#__PURE__*/
    React.createElement("span", { style: { margin: "0 4px" } }, "of"), /*#__PURE__*/
    React.createElement("span", { style: { color: TCB, fontWeight: 600 } }, total), /*#__PURE__*/
    React.createElement("span", { style: { marginLeft: 4, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 } }, "exercises")
    ),


    total > 0 && /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", width: "100%" } },
    list.map((ex, i) => {
      const isDone = i < fi;
      const isCur = i === fi;
      const size = Math.max(5, Math.min(12, Math.floor(300 / total) - 4));
      return (/*#__PURE__*/
        React.createElement(React.Fragment, { key: ex.id }, /*#__PURE__*/
        React.createElement("div", { style: {
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: isDone ? DOT_DONE : isCur ? DOT_CURR : DOT_REST,
            transition: "all 0.35s"
          } }),
        i < total - 1 && /*#__PURE__*/
        React.createElement("div", { style: { flex: 1, height: 1,
            background: isDone ? LINE_DONE : LINE_REST,
            transition: "background 0.35s"
          } })

        ));

    })
    )

    ));

}

function FlowOverlay({ theme, activePeriod, activeAll: activeAllProp, TOTAL, done, totalDone, sessionSecs,
  onExit, onToggle, onSkip, formatTime, trackLabel = "", trackDuration = "", nightMode = false, streak = 0, onSessionComplete }) {

  const isNight = nightMode;
  const isDark = isNight || theme === "dark";
  const period = activePeriod || getCircadianPeriod();

  // Night Mode: pure black/red, no circadian color bleed
  const ct = isNight ?
  {
    bg: "#000000",
    accent: "#FF3B30",
    accentDim: "rgba(255,59,48,0.18)",
    accentGlow: "rgba(255,59,48,0.35)",
    textPrimary: "#FF3B30",
    orb1: "none", orb2: "none", orb3: "none"
  } :
  CIRCADIAN_THEMES[period][isDark ? "dark" : "light"];

  const A = ct.accent;
  // Night Mode: all text is red at varying opacities — no white at all
  const W = isNight ? "#FF3B30" : ct.textPrimary || (isDark ? "#ffffff" : "#0f1020");
  const S = isNight ? "rgba(255,59,48,0.70)" : isDark ? "rgba(232,228,223,0.60)" : ct.textPrimary ? ct.textPrimary + "cc" : "rgba(15,30,46,0.75)";
  const D = isNight ? "rgba(255,59,48,0.40)" : isDark ? "rgba(232,228,223,0.35)" : ct.textPrimary ? ct.textPrimary + "88" : "rgba(15,30,46,0.50)";
  const BG = isNight ? "#000000" : MAIN_APP_BG[isDark ? "dark" : "light"];

  // derive card/button colors from the theme background
  const CARD_BG = isNight ? "#000000" : isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.50)";
  const CARD_BDR = isNight ? "rgba(255,59,48,0.25)" : isDark ? `${ct.accent}33` : `${ct.accent}44`;
  const BTN_BG = isNight ? "#000000" : isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.65)";
  const BTN_BDR = isNight ? "rgba(255,59,48,0.40)" : isDark ? `${ct.accent}55` : `${ct.accent}66`;

  // fade colors — Night Mode uses pure black
  const periodFadeMap = {
    dawn: { dark: "rgba(15,7,0,", light: "rgba(255,232,200," },
    midday: { dark: "rgba(0,8,4,", light: "rgba(224,255,248," },
    prime: { dark: "rgba(0,6,14,", light: "rgba(216,238,255," },
    rest: { dark: "rgba(3,0,8,", light: "rgba(232,220,255," }
  };
  const pf = isNight ? { dark: "rgba(0,0,0,", light: "rgba(0,0,0," } : periodFadeMap[period] || periodFadeMap.rest;
  const pfKey = isDark ? "dark" : "light";
  const fadeDark = `${pf[pfKey]}0)`;
  const fadeSolid = `${pf[pfKey]}0.97)`;
  const FADE_BOT = `linear-gradient(to bottom,${fadeDark} 0%,${fadeSolid} 28px)`;
  const BAR_BOT = fadeSolid;
  const CUE_COLOR = W;
  const NAME_DIM = D;
  const HAIRLINE = isNight ? "rgba(255,59,48,0.15)" : isDark ? "rgba(255,255,255,0.07)" : `${ct.accent}22`;

  // Glass card & control bar — light mode: crisp, soft tinted shadows (no muddy black)
  const GLASS_BG = isNight ? "#000000" :
  isDark ? "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)" :
  "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%)";
  const GLASS_BDR = isNight ? "1px solid rgba(255,59,48,0.20)" :
  isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(200,220,240,0.65)";
  const GLASS_SHAD = isNight ? "0 4px 20px rgba(0,0,0,0.4)" :
  isDark ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.12)" :
  "inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(20,50,90,0.06)";
  const BAR_BG = isNight ? "#000000" :
  isDark ? "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)" :
  "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)";
  const BAR_BDR = isNight ? "1px solid rgba(255,59,48,0.22)" :
  isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(200,220,240,0.70)";
  const BAR_SHAD = isNight ? "0 4px 24px rgba(0,0,0,0.5)" :
  isDark ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 20px rgba(0,0,0,0.15)" :
  "inset 0 1px 0 rgba(255,255,255,0.75), 0 2px 14px rgba(20,50,90,0.05)";
  const DIVIDER = isNight ? "1px solid rgba(255,59,48,0.15)" :
  isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)";
  const ROW_DIV = isNight ? "1px solid rgba(255,59,48,0.12)" :
  isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const SESS_BG = isNight ? "#000000" :
  isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)";
  const BACK_DIM = isNight ? "rgba(255,59,48,0.25)" : isDark ? "rgba(255,255,255,0.22)" : "rgba(15,30,46,0.22)";
  const NAME_SHAD = "none";

  // Snapshot activeAll on mount so fi stays stable regardless of external skips
  const listRef = useRef(activeAllProp);
  const list = listRef.current;
  const listTotal = list.length;
  const filteredCount = listTotal;

  // Own fi and resting state — self-contained continuous flow
  const [fi, setFi] = useState(0);
  const [phase, setPhase] = useState("intro"); // "intro" | "getready" | "exercise" | "rest" | "milestone" | "closing"
  const [restLeft, setRestLeft] = useState(10);
  const [readyLeft, setReadyLeft] = useState(12);
  const [paused, setPaused] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const [showJustDone, setShowJustDone] = useState(false);
  const restRef = useRef(null);
  const readyRef = useRef(null);
  const milestoneRef = useRef(null);

  const cur = list[Math.min(fi, list.length - 1)];
  const next = list[fi + 1] || null;

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

  // Get-ready countdown — fires when phase becomes "getready"
  useEffect(() => {
    if (phase !== "getready") return;
    readyRef.current = setInterval(() => {
      setReadyLeft((l) => {
        if (l <= 1) {
          clearInterval(readyRef.current);
          setPhase("exercise");
          beep(880, 0.3);
          return 12;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(readyRef.current);
  }, [phase]);

  // Rest countdown — auto-advance to next exercise
  useEffect(() => {
    if (phase !== "rest") {clearInterval(restRef.current);return;}
    setRestLeft(10);
    restRef.current = setInterval(() => {
      setRestLeft((l) => {
        if (l <= 1) {
          clearInterval(restRef.current);
          beep(880, 0.3);
          setFi((i) => Math.min(i + 1, list.length - 1));
          setPhase("exercise");
          return 10;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(restRef.current);
  }, [phase, fi]);

  const completeCurrent = () => {
    beep(660, 0.4);
    onToggle(cur.id);
    setShowJustDone(true);
    setTimeout(() => setShowJustDone(false), 450);
    const nextTotal = totalDone + 1;
    if (nextTotal >= listTotal) {
      setPhase("closing");
      if (onSessionComplete) onSessionComplete();
      return;
    }
    const at25 = Math.ceil(listTotal * 0.25);
    const at50 = Math.ceil(listTotal * 0.5);
    const at75 = Math.ceil(listTotal * 0.75);
    if (nextTotal === at25 || nextTotal === at50 || nextTotal === at75) {
      const msg = nextTotal === at25 ? "Quarter done" : nextTotal === at50 ? "Halfway there" : "Almost there";
      setMilestoneMessage(msg);
      setPhase("milestone");
      if (milestoneRef.current) clearTimeout(milestoneRef.current);
      milestoneRef.current = setTimeout(() => {
        setPhase("rest");
        setMilestoneMessage("");
        milestoneRef.current = null;
      }, 2200);
    } else {
      setPhase("rest");
    }
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
    if (fi < list.length - 1) {setFi((i) => i + 1);setPhase("exercise");}
  };

  const handlePrev = () => {
    if (fi > 0) {setFi((i) => i - 1);setPhase("exercise");clearInterval(restRef.current);}
  };

  return (/*#__PURE__*/
    React.createElement("div", { "data-theme": theme, "data-night": isNight ? "true" : "false", style: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
        background: BG, display: "flex", flexDirection: "column",
        fontFamily: "'Barlow',sans-serif", color: W, WebkitFontSmoothing: "antialiased",
        overflow: "hidden"
      } }, /*#__PURE__*/
    React.createElement("style", null, css), /*#__PURE__*/


    React.createElement("div", { className: "app-orbs", style: {
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "var(--orb1), var(--orb2), var(--orb3)",
        animation: "orbFloat 24s cubic-bezier(0.37,0,0.63,1) infinite alternate",
        transition: "background 2s ease"
      } }), /*#__PURE__*/


    React.createElement("div", { style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "56px 24px 16px", flexShrink: 0, position: "relative", zIndex: 2
      } }, /*#__PURE__*/
    React.createElement("button", { onClick: onExit, style: {
        background: "none", border: "none", cursor: "pointer", color: S,
        fontFamily: "'Barlow',sans-serif", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", padding: 0, display: "flex", alignItems: "center", gap: 5,
        opacity: phase === "intro" ? 1 : 0.85
      } }, "\u2715 ", /*#__PURE__*/React.createElement("span", null, "Exit")),
    phase !== "intro" && phase !== "closing" && listTotal > 0 && (() => {
      const r = 14;const C = 2 * Math.PI * r;
      const filled = totalDone / listTotal * C;
      const offset = C - filled;
      return (/*#__PURE__*/
        React.createElement("div", { style: { position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" } }, /*#__PURE__*/
        React.createElement("svg", { width: 36, height: 36, style: { transform: "rotate(-90deg)" } }, /*#__PURE__*/
        React.createElement("circle", { cx: "18", cy: "18", r: r, fill: "none", stroke: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", strokeWidth: "3" }), /*#__PURE__*/
        React.createElement("circle", { cx: "18", cy: "18", r: r, fill: "none", stroke: A, strokeWidth: "3", strokeLinecap: "round",
          strokeDasharray: C, strokeDashoffset: offset,
          style: { transition: "stroke-dashoffset 0.4s ease-out" } })
        ), /*#__PURE__*/
        React.createElement("span", { style: { position: "absolute", fontSize: 10, fontWeight: 700, color: W } }, totalDone, "/", listTotal)
        ));

    })()
    ),


    phase === "milestone" && /*#__PURE__*/
    React.createElement("div", { style: {
        position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent", pointerEvents: "none"
      } }, /*#__PURE__*/
    React.createElement("div", { style: {
        fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: W,
        textShadow: NAME_SHAD, opacity: 0, animation: "flowFadeIn 0.35s ease forwards"
      } }, milestoneMessage)
    ),



    phase === "closing" && /*#__PURE__*/
    React.createElement("div", { style: {
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "48px", textAlign: "center", position: "relative", zIndex: 10
      } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.35, color: W, marginBottom: 12, maxWidth: 300,
        textShadow: NAME_SHAD } }, "Session complete."

    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 15, color: S, marginBottom: 48, maxWidth: 280, lineHeight: 1.5 } }, "Give yourself a moment before you move on."

    ), /*#__PURE__*/
    React.createElement("button", { onClick: onExit, style: {
        padding: "16px 48px", borderRadius: 28, cursor: "pointer",
        background: A, border: "none", color: ct.accentBtnText || "#0a0e1a",
        fontFamily: "'Barlow',sans-serif", fontSize: 13, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        boxShadow: `0 0 32px ${ct.accentGlow}`
      } }, "Done")
    ),



    phase === "intro" && /*#__PURE__*/
    React.createElement("div", { style: {
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px", textAlign: "center", position: "relative", zIndex: 2
      } },
    streak > 0 && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: A, marginBottom: 20 } }, "Day ",
    streak
    ), /*#__PURE__*/

    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.30em", textTransform: "uppercase", color: D, marginBottom: 16 } }, "Flow Session"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 52, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.0, color: W, marginBottom: 12,
        textShadow: NAME_SHAD } },
    trackLabel
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 15, color: S, marginBottom: 4 } }, filteredCount, " exercises"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 13, color: D, marginBottom: 56 } }, trackDuration), /*#__PURE__*/
    React.createElement("button", { onClick: () => {primeAudio();beep(880, 0.3);setPhase("getready");}, style: {
        padding: "17px 52px", borderRadius: 40, cursor: "pointer",
        background: A, border: "none", color: ct.accentBtnText || "#0a0e1a",
        fontFamily: "'Barlow',sans-serif", fontSize: 12, fontWeight: 700,
        letterSpacing: "0.22em", textTransform: "uppercase",
        boxShadow: isDark ? `0 0 24px ${ct.accentGlow}, 0 2px 12px rgba(0,0,0,0.2)` : `0 0 20px ${ct.accentGlow}, 0 2px 8px rgba(20,50,90,0.08)`
      } }, "Let's Go"), /*#__PURE__*/
    React.createElement("button", { onClick: onExit, style: {
        marginTop: 20, background: "none", border: "none", cursor: "pointer",
        fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
        color: D, fontFamily: "'Barlow',sans-serif"
      } }, "Cancel")
    ),



    phase !== "intro" && phase !== "closing" && phase !== "milestone" && /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 2, minHeight: 0, padding: "8px 20px 0" } }, /*#__PURE__*/


    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: A, marginBottom: 14, flexShrink: 0 } },
    phase === "getready" ? "First Up" : phase === "rest" ? "Up Next" : ""
    ), /*#__PURE__*/


    React.createElement("div", { style: {
        fontSize: phase === "exercise" ? 38 : 34,
        fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.05,
        color: W, marginBottom: 20, flexShrink: 0,
        textShadow: NAME_SHAD
      } },
    phase === "rest" ? next?.name : cur.name
    ),


    (() => {
      const ex = phase === "rest" ? next : cur;
      if (!ex?.steps?.length && !ex?.start) return null;
      return (/*#__PURE__*/
        React.createElement("div", { style: {
            borderRadius: 20,
            background: GLASS_BG,
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            border: GLASS_BDR,
            boxShadow: `${GLASS_SHAD}, 0 0 0 1px ${isNight ? "rgba(255,59,48,0.15)" : ct.accent + "22"}`,
            overflow: "hidden", flexShrink: 0, marginBottom: 20
          } },
        ex.start && /*#__PURE__*/
        React.createElement("div", { style: { padding: "16px 18px 14px", borderBottom: ex.steps?.[0] || ex.steps?.[1] ? ROW_DIV : "none" } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase",
            color: A, marginBottom: 8, opacity: 0.85 } }, "Start"), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 16, color: W, lineHeight: 1.55, fontWeight: isDark ? 300 : 400,
            letterSpacing: "-0.01em" } }, ex.start)
        ),

        ex.steps?.[0] && /*#__PURE__*/
        React.createElement("div", { style: { padding: "16px 18px 14px", borderBottom: ex.steps[1] ? ROW_DIV : "none" } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase",
            color: A, marginBottom: 8, opacity: 0.85 } }, "Setup"), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 16, color: W, lineHeight: 1.55, fontWeight: isDark ? 300 : 400,
            letterSpacing: "-0.01em" } }, ex.steps[0].cue)
        ),

        ex.steps[1] && /*#__PURE__*/
        React.createElement("div", { style: { padding: "14px 18px 16px" } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase",
            color: A, marginBottom: 8, opacity: 0.85 } }, "Move"), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 16, color: W, lineHeight: 1.55, fontWeight: isDark ? 300 : 400,
            letterSpacing: "-0.01em" } }, ex.steps[1].cue)
        ),

        !ex.steps?.[1] && ex.type === "reps" && ex.reps && /*#__PURE__*/
        React.createElement("div", { style: { padding: "14px 18px 16px", borderTop: ROW_DIV } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase",
            color: A, marginBottom: 6, opacity: 0.85 } }, "Target"), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: 20, fontWeight: 600, color: W } }, ex.reps)
        )

        ));

    })(),


    phase === "exercise" && cur.type === "reps" && cur.reps && cur.steps?.length >= 2 && /*#__PURE__*/
    React.createElement("div", { style: { marginBottom: 16, flexShrink: 0 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: A, opacity: 0.8, marginBottom: 6 } }, "Target"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 22, fontWeight: 600, color: W } }, cur.reps)
    ), /*#__PURE__*/


    React.createElement("div", { style: { flex: 1 } }),


    phase === "exercise" && (cur.type === "time" || cur.type === "flow") && /*#__PURE__*/
    React.createElement("div", { style: { flexShrink: 0, marginBottom: 8 } }, /*#__PURE__*/
    React.createElement(OverlayTimer, { key: cur.id + "-" + fi, seconds: cur.seconds, onDone: handleTimerDone,
      autoStart: true, paused: paused, fi: fi, list: list, theme: theme, activePeriod: activePeriod, nightMode: nightMode })
    ),



    phase === "getready" && /*#__PURE__*/
    React.createElement("div", { style: { flexShrink: 0, marginBottom: 12, display: "flex", alignItems: "baseline", gap: 6 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 72, fontWeight: 700, letterSpacing: "-0.04em", color: W, lineHeight: 1 } }, readyLeft), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: D } }, "sec")
    ),



    showJustDone && /*#__PURE__*/
    React.createElement("div", { style: {
        position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%)",
        width: 56, height: 56, borderRadius: "50%", border: `3px solid ${A}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${A}22`, animation: "flowDonePop 0.45s ease-out forwards",
        zIndex: 5
      } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 24, color: A } }, "\u2713")
    )

    ),



    phase !== "closing" && phase !== "milestone" && phase !== "exercise" && /*#__PURE__*/
    React.createElement("div", { style: {
        margin: "0 16px", marginBottom: `max(28px, env(safe-area-inset-bottom, 28px))`,
        borderRadius: 24, overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 2,
        background: BAR_BG,
        backdropFilter: isDark ? "blur(40px) saturate(2)" : "blur(28px) saturate(1.4)",
        WebkitBackdropFilter: isDark ? "blur(40px) saturate(2)" : "blur(28px) saturate(1.4)",
        border: BAR_BDR,
        boxShadow: BAR_SHAD,
        display: "flex", alignItems: "stretch", height: 56
      } }, /*#__PURE__*/

    React.createElement("button", { disabled: fi === 0, onClick: handlePrev, style: {
        width: 56, flexShrink: 0, background: "transparent", border: "none",
        borderRight: DIVIDER,
        color: fi === 0 ? BACK_DIM : W,
        fontFamily: "'Barlow',sans-serif", fontSize: 18, cursor: fi === 0 ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center"
      } }, "\u2190"),


    phase === "exercise" && (cur?.type === "time" || cur?.type === "flow") && /*#__PURE__*/
    React.createElement("button", { onClick: () => setPaused((p) => !p), style: {
        flex: 1, background: paused ? `${A}22` : "transparent", border: "none",
        borderRight: DIVIDER,
        color: paused ? A : S,
        fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
        transition: "all 0.2s"
      } }, paused ? "Resume" : "Pause"),



    phase === "exercise" && (cur?.type === "time" || cur?.type === "flow") && /*#__PURE__*/
    React.createElement("button", { onClick: handleMarkDone, style: {
        width: 68, background: done[cur?.id] ? `${A}22` : "transparent", border: "none",
        borderRight: DIVIDER,
        color: done[cur?.id] ? A : S,
        fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer"
      } }, done[cur?.id] ? "✓" : "Done"),



    phase === "exercise" && cur?.type === "reps" && /*#__PURE__*/
    React.createElement("button", { onClick: handleMarkDone, style: {
        flex: 1, background: done[cur?.id] ? `${A}22` : "transparent", border: "none",
        borderRight: DIVIDER,
        color: done[cur?.id] ? A : W,
        fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"
      } }, done[cur?.id] ? "✓ Done" : "Mark Done"),



    phase === "getready" && /*#__PURE__*/
    React.createElement("button", { onClick: () => {clearInterval(readyRef.current);setPhase("exercise");beep(880, 0.3);}, style: {
        flex: 1, background: "transparent", border: "none",
        borderRight: DIVIDER,
        color: W, fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"
      } }, "Start Now"),



    phase === "rest" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        borderRight: DIVIDER } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 22, fontWeight: 700, color: W, letterSpacing: "-0.03em" } }, restLeft), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: D } }, "sec")
    ), /*#__PURE__*/
    React.createElement("button", { onClick: () => {clearInterval(restRef.current);setFi((i) => Math.min(i + 1, list.length - 1));setPhase("exercise");}, style: {
        flex: 1, background: "transparent", border: "none",
        borderRight: DIVIDER,
        color: W, fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"
      } }, "Skip Rest")
    ),


    phase === "intro" && /*#__PURE__*/React.createElement("div", { style: { flex: 1 } }),


    phase === "exercise" && /*#__PURE__*/
    React.createElement("button", { onClick: handleSkip, style: {
        width: 60, background: "transparent", border: "none",
        color: S, fontFamily: "'Barlow',sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer"
      } }, "Skip"),



    (phase === "getready" || phase === "rest" || phase === "intro") && /*#__PURE__*/
    React.createElement("div", { style: { width: 56 } })

    )

    ));

}



// ─────────────────────────────────────────────────────────────
//  CIRCADIAN THEME ENGINE
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  TIMER VIEW — standalone interval timer
// ─────────────────────────────────────────────────────────────
function TimerView({ theme, view, setView, hasActiveSession, css, nightMode = false, activePeriod = null }) {
  const [mode, setMode] = useState("interval"); // "interval" | "breathe"

  // ── INTERVAL state ──
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(15);
  const [rounds, setRounds] = useState(4);
  const [iRunning, setIRunning] = useState(false);
  const [iPhase, setIPhase] = useState("idle");
  const [iRound, setIRound] = useState(1);
  const [iTime, setITime] = useState(0);
  const iRef = useRef(null);

  function iReset() {clearInterval(iRef.current);setIRunning(false);setIPhase("idle");setIRound(1);setITime(0);}
  function iStart() {setIPhase("work");setIRound(1);setITime(work);setIRunning(true);}

  useEffect(() => {
    if (!iRunning || iPhase === "idle" || iPhase === "done") return;
    clearInterval(iRef.current);
    iRef.current = setInterval(() => {
      setITime((t) => {
        if (t <= 1) {
          if (iPhase === "work") {
            beep(660, 0.25);
            if (rest > 0) {setIPhase("rest");return rest;}
            setIRound((r) => {if (r >= rounds) {setIPhase("done");setIRunning(false);beep(440, 0.5);return r;}setIPhase("work");return r + 1;});
            return work;
          } else {
            beep(880, 0.2);
            setIRound((r) => {if (r >= rounds) {setIPhase("done");setIRunning(false);beep(440, 0.5);return r;}setIPhase("work");return r + 1;});
            return work;
          }
        }
        if (t === 4) beep(440, 0.12);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iRef.current);
  }, [iRunning, iPhase, work, rest, rounds]);

  // ── BREATHE state ──
  const BREATH_PATTERNS = {
    "4-7-8": [
    { label: "Inhale", dur: 4, color: "var(--accent)", expand: true },
    { label: "Hold", dur: 7, color: "var(--text-secondary)", expand: true },
    { label: "Exhale", dur: 8, color: "var(--text-dim)", expand: false }],

    "Box": [
    { label: "Inhale", dur: 4, color: "var(--accent)", expand: true },
    { label: "Hold", dur: 4, color: "var(--text-secondary)", expand: true },
    { label: "Exhale", dur: 4, color: "var(--text-dim)", expand: false },
    { label: "Hold", dur: 4, color: "var(--text-dimmer)", expand: false }],

    "Physio Sigh": [
    { label: "Inhale", dur: 2, color: "var(--accent)", expand: true },
    { label: "Sniff", dur: 1, color: "var(--accent)", expand: true },
    { label: "Long Exhale", dur: 8, color: "var(--text-dim)", expand: false }]

  };
  const [breathPattern, setBreathPattern] = useState("4-7-8");
  const [breathCycles, setBreathCycles] = useState(4);
  const [breatheMinimal, setBreatheMinimal] = useState(false); // minimal: ring + phase word only, no numbers
  const [bRunning, setBRunning] = useState(false);
  const [bPhaseIdx, setBPhaseIdx] = useState(0);
  const [bCycle, setBCycle] = useState(1);
  const [bTime, setBTime] = useState(0);
  const [bExpand, setBExpand] = useState(false);
  const bRef = useRef(null);
  // Refs so interval callback always reads fresh values without restarting
  const bPhaseRef = useRef(0);
  const bCycleRef = useRef(1);
  const bPatternRef = useRef(BREATH_PATTERNS["4-7-8"]);
  const bCyclesRef = useRef(4);

  // Keep refs in sync
  useEffect(() => {bPatternRef.current = BREATH_PATTERNS[breathPattern];}, [breathPattern]);
  useEffect(() => {bCyclesRef.current = breathCycles;}, [breathCycles]);

  const pattern = BREATH_PATTERNS[breathPattern];
  const curBreathPhase = pattern[bPhaseIdx];

  function bReset() {
    clearInterval(bRef.current);
    setBRunning(false);setBPhaseIdx(0);setBCycle(1);setBTime(0);setBExpand(false);
    bPhaseRef.current = 0;bCycleRef.current = 1;
  }

  function bStart() {
    primeAudio();
    bPhaseRef.current = 0;bCycleRef.current = 1;
    setBPhaseIdx(0);setBCycle(1);
    setBTime(bPatternRef.current[0].dur);
    setBExpand(bPatternRef.current[0].expand);
    setBRunning(true);
    beep(528, 0.2);
  }

  useEffect(() => {
    if (!bRunning) return;
    clearInterval(bRef.current);
    bRef.current = setInterval(() => {
      setBTime((t) => {
        if (t <= 1) {
          const pat = bPatternRef.current;
          const nextIdx = (bPhaseRef.current + 1) % pat.length;
          const isNewCycle = nextIdx === 0;
          const nextCycle = isNewCycle ? bCycleRef.current + 1 : bCycleRef.current;

          if (isNewCycle && bCycleRef.current >= bCyclesRef.current) {
            clearInterval(bRef.current);
            setBRunning(false);setBPhaseIdx(0);setBExpand(false);
            beep(528, 0.4);
            return 0;
          }

          bPhaseRef.current = nextIdx;
          bCycleRef.current = nextCycle;
          setBPhaseIdx(nextIdx);
          setBCycle(nextCycle);
          setBExpand(pat[nextIdx].expand);
          beep(pat[nextIdx].label === "Inhale" ? 528 : 440, 0.15);
          return pat[nextIdx].dur;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(bRef.current);
  }, [bRunning]); // only re-run when start/stop — refs handle the rest

  const bDone = !bRunning && bCycle > breathCycles && bTime === 0;

  // switch mode → reset both
  function switchMode(m) {iReset();bReset();setMode(m);}

  const iPct = iPhase === "work" ? (work - iTime) / work * 100 : iPhase === "rest" ? (rest - iTime) / rest * 100 : 0;
  const iRingColor = iPhase === "rest" ? "var(--text-secondary)" : "var(--accent)";
  const iCircumference = 2 * Math.PI * 110;
  const BTN = { padding: "18px 56px", borderRadius: 36, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", background: "var(--accent)", color: "var(--accent-btn-text, #fff)", border: "none", boxShadow: "0 0 28px var(--accent-glow)", transition: "all 0.2s" };
  const BTN_GHOST = { padding: "18px 28px", borderRadius: 36, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--glass-bg)", color: "var(--text-secondary)", border: "1px solid var(--glass-border)", transition: "all 0.2s" };

  return (/*#__PURE__*/
    React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
    React.createElement("style", null, css), /*#__PURE__*/
    React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", animation: "orbFloat 24s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate", transition: "background 2s ease" } }), /*#__PURE__*/
    React.createElement("div", { className: "app-body", style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 84px)", padding: "0 24px 84px", boxSizing: "border-box", width: "100%" } }, /*#__PURE__*/


    React.createElement("div", { style: { display: "flex", gap: 0, marginBottom: 44, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 24, padding: 4 } },
    ["interval", "breathe"].map((m) => /*#__PURE__*/
    React.createElement("button", { key: m, onClick: () => switchMode(m), style: {
        padding: "9px 28px", borderRadius: 20, border: "none", cursor: "pointer",
        fontFamily: "'Barlow',sans-serif", fontSize: "13px", fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase", transition: "all 0.2s",
        background: mode === m ? "var(--accent)" : "transparent",
        color: mode === m ? "var(--accent-btn-text, #fff)" : "var(--text-dim)",
        boxShadow: mode === m ? "0 0 16px var(--accent-glow)" : "none"
      } }, m === "interval" ? "Interval" : "Breathe")
    )
    ),


    mode === "interval" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, width: "100%" } }, /*#__PURE__*/
    React.createElement("svg", { width: "260", height: "260", className: "timer-interval-ring", style: { transform: "rotate(-90deg)", display: "block", margin: "0 auto" } }, /*#__PURE__*/
    React.createElement("circle", { cx: "130", cy: "130", r: "110", fill: "none", stroke: "var(--glass-border)", strokeWidth: "3" }),
    iPhase !== "idle" && iPhase !== "done" && /*#__PURE__*/
    React.createElement("circle", { cx: "130", cy: "130", r: "110", fill: "none",
      stroke: iRingColor, strokeWidth: "4", strokeLinecap: "round",
      strokeDasharray: iCircumference,
      strokeDashoffset: iCircumference * (1 - iPct / 100),
      style: { transition: "stroke-dashoffset 0.9s linear, stroke 0.4s" } }
    )

    ), /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", textAlign: "center" } },
    iPhase === "idle" && /*#__PURE__*/React.createElement("div", { style: { fontSize: "80px", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text-white)", fontFamily: "'Barlow',sans-serif", lineHeight: 1 } }, work),
    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/React.createElement("div", { style: { fontSize: "96px", fontWeight: 700, letterSpacing: "-0.04em", color: iRingColor, fontFamily: "'Barlow',sans-serif", lineHeight: 1, transition: "color 0.4s" } }, iTime),
    iPhase === "done" && /*#__PURE__*/React.createElement("div", { style: { fontSize: "48px", fontWeight: 700, color: "var(--accent)", fontFamily: "'Barlow',sans-serif", lineHeight: 1 } }, "\u2713"),
    iPhase !== "idle" && iPhase !== "done" && /*#__PURE__*/React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dimmer)", marginTop: 8 } }, iRound, " / ", rounds)
    )
    ),

    iPhase === "idle" && /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", marginBottom: 40, borderRadius: 20, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", width: "100%", boxSizing: "border-box", overflow: "hidden" } },
    [
    { label: "Work", val: work, set: setWork, min: 5, max: 300, step: 5, isRound: false },
    { label: "Rest", val: rest, set: setRest, min: 0, max: 120, step: 5, isRound: false },
    { label: "Rounds", val: rounds, set: setRounds, min: 1, max: 20, step: 1, isRound: true }].
    map(({ label, val, set, min, max, step, isRound }, i) => /*#__PURE__*/
    React.createElement("div", { key: label, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "16px 0", borderLeft: i > 0 ? "1px solid var(--border)" : "none" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dimmer)" } }, label), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => set((v) => Math.max(min, v - step)), style: { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-secondary)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2212"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "22px", fontWeight: 700, color: "var(--text-white)", minWidth: 32, textAlign: "center", fontFamily: "'Barlow',sans-serif", letterSpacing: "-0.02em" } }, val, !isRound && /*#__PURE__*/React.createElement("span", { style: { fontSize: "13px", color: "var(--text-dimmer)", marginLeft: 1 } }, "s")), /*#__PURE__*/
    React.createElement("button", { onClick: () => set((v) => Math.min(max, v + step)), style: { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-secondary)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: "flex", gap: 12 } },
    iPhase === "idle" && /*#__PURE__*/React.createElement("button", { onClick: () => {primeAudio();iStart();}, style: BTN }, "Start"),
    (iPhase === "work" || iPhase === "rest") && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("button", { onClick: () => setIRunning((r) => !r), style: { ...BTN, padding: "18px 40px" } }, iRunning ? "Pause" : "Resume"), /*#__PURE__*/
    React.createElement("button", { onClick: iReset, style: BTN_GHOST }, "Reset")
    ),
    iPhase === "done" && /*#__PURE__*/React.createElement("button", { onClick: iReset, style: BTN }, "Again")
    )
    ),


    mode === "breathe" && /*#__PURE__*/React.createElement(React.Fragment, null,

    !bRunning && !bDone && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 20 } },
    Object.keys(BREATH_PATTERNS).map((p) => /*#__PURE__*/
    React.createElement("button", { key: p, onClick: () => setBreathPattern(p), style: {
        fontFamily: "'Barlow',sans-serif", fontSize: "13px", fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase", padding: "9px 20px",
        borderRadius: 20, cursor: "pointer", transition: "all 0.2s",
        border: breathPattern === p ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
        background: breathPattern === p ? "var(--accent-dim)" : "var(--glass-bg)",
        color: breathPattern === p ? "var(--accent)" : "var(--text-secondary)"
      } }, p === "4-7-8" ? "4-7-8" : p === "Box" ? "Box" : "Physio Sigh")
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-dimmer)" } }, "Minimal"), /*#__PURE__*/
    React.createElement("button", { type: "button", role: "switch", "aria-checked": breatheMinimal, onClick: () => setBreatheMinimal((v) => !v), style: {
        width: 40, height: 22, border: "1px solid", borderColor: breatheMinimal ? "var(--accent)" : "var(--glass-border)",
        borderRadius: 11, background: breatheMinimal ? "var(--accent)" : "var(--glass-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s"
      } }, /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", top: 2, left: breatheMinimal ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: theme === "dark" ? "#fff" : "#111", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" } })
    ), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 11, color: "var(--text-dimmer)" } }, "Ring + phase only")
    )
    ), /*#__PURE__*/



    React.createElement("div", { className: "timer-breathe-ring-wrap", style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 260, height: 260, marginLeft: "auto", marginRight: "auto", marginBottom: 36 } }, /*#__PURE__*/

    React.createElement("svg", { width: "260", height: "260", style: { position: "absolute", top: 0, left: 0 }, className: "timer-breathe-guide-ring" }, /*#__PURE__*/
    React.createElement("circle", { cx: "130", cy: "130", r: "110", fill: "none", stroke: "var(--glass-border)", strokeWidth: "1.5" })
    ), /*#__PURE__*/

    React.createElement("div", { className: `timer-breathe-expand-ring ${!(bRunning && bExpand) ? "breathe-idle" : ""}`, style: {
        position: "absolute",
        width: 220, height: 220,
        borderRadius: "50%",
        background: `radial-gradient(circle, var(--accent-glow) 0%, var(--accent-dim) 55%, transparent 100%)`,
        border: "1.5px solid var(--accent)",
        opacity: bRunning && bExpand ? 0.85 : 0.08,
        transform: bRunning && bExpand ? "scale(1)" : "scale(0.45)",
        transition: bRunning ?
        `opacity ${curBreathPhase?.dur || 4}s cubic-bezier(0.4,0,0.2,1), transform ${curBreathPhase?.dur || 4}s cubic-bezier(0.4,0,0.2,1)` :
        "opacity 0.6s ease, transform 0.6s ease",
        boxShadow: bRunning && bExpand ? "0 0 50px var(--accent-glow)" : "none"
      } }), /*#__PURE__*/

    React.createElement("div", { style: { position: "absolute", textAlign: "center", pointerEvents: "none" } },
    !bRunning && !bDone && /*#__PURE__*/React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dimmer)" } }, "Ready"),
    bRunning && /*#__PURE__*/React.createElement(React.Fragment, null,
    !breatheMinimal && /*#__PURE__*/React.createElement("div", { style: { fontSize: "42px", fontWeight: 700, color: curBreathPhase.color, fontFamily: "'Barlow',sans-serif", lineHeight: 1, transition: "color 0.5s" } }, bTime), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: breatheMinimal ? "18px" : "13px", letterSpacing: "0.18em", textTransform: "uppercase", color: breatheMinimal ? curBreathPhase.color : "var(--text-dimmer)", marginTop: breatheMinimal ? 0 : 6, transition: "all 0.5s" } }, curBreathPhase.label),
    !breatheMinimal && /*#__PURE__*/React.createElement("div", { style: { fontSize: "13px", color: "var(--text-dimmer)", marginTop: 4 } }, bCycle, " / ", breathCycles)
    ),
    bDone && /*#__PURE__*/React.createElement("div", { style: { fontSize: "36px", fontWeight: 700, color: "var(--accent)", fontFamily: "'Barlow',sans-serif", lineHeight: 1 } }, "\u2713")
    )
    ),


    !bRunning && !bDone && !breatheMinimal && /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 40 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dimmer)" } }, "Cycles"), /*#__PURE__*/
    React.createElement("button", { onClick: () => setBreathCycles((v) => Math.max(1, v - 1)), style: { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-secondary)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2212"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "22px", fontWeight: 700, color: "var(--text-white)", minWidth: 20, textAlign: "center", fontFamily: "'Barlow',sans-serif" } }, breathCycles), /*#__PURE__*/
    React.createElement("button", { onClick: () => setBreathCycles((v) => Math.min(12, v + 1)), style: { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-secondary)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
    ),

    bRunning && /*#__PURE__*/React.createElement("div", { style: { height: 76 } }), /*#__PURE__*/

    React.createElement("div", { style: { display: "flex", gap: 12 } },
    !bRunning && !bDone && /*#__PURE__*/React.createElement("button", { onClick: bStart, style: BTN }, "Start"),
    bRunning && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("button", { onClick: () => setBRunning((r) => !r), style: { ...BTN, padding: "18px 40px" } }, "Pause"), /*#__PURE__*/
    React.createElement("button", { onClick: bReset, style: BTN_GHOST }, "Reset")
    ),
    bDone && /*#__PURE__*/React.createElement("button", { onClick: bReset, style: BTN }, "Again")
    )
    )

    ), /*#__PURE__*/
    React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
    ));

}


function FeedbackButton() {
  const [revealed, setRevealed] = React.useState ? React.useState(false) : useState(false);
  return (/*#__PURE__*/
    React.createElement("div", null,
    !revealed ? /*#__PURE__*/
    React.createElement("button", { onClick: () => setRevealed(true), style: {
        display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "1px solid var(--glass-border)",
        fontFamily: "'Barlow',sans-serif", fontSize: "13px", letterSpacing: "0.04em",
        color: "var(--text-secondary)", cursor: "pointer", padding: "10px 14px", borderRadius: 10,
        transition: "all 0.18s"
      } }, /*#__PURE__*/
    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/
    React.createElement("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), /*#__PURE__*/
    React.createElement("polyline", { points: "22,6 12,13 2,6" })
    ), "Send Feedback"

    ) : /*#__PURE__*/

    React.createElement("a", { href: "mailto:hello@adamlorber.com", style: {
        display: "inline-flex", alignItems: "center", gap: 8,
        fontSize: "13px", color: "var(--accent)", textDecoration: "none",
        letterSpacing: "0.04em", padding: "10px 14px", border: "1px solid var(--accent)",
        borderRadius: 10, fontFamily: "'Barlow',sans-serif"
      } }, /*#__PURE__*/
    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/
    React.createElement("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), /*#__PURE__*/
    React.createElement("polyline", { points: "22,6 12,13 2,6" })
    ), "hello@adamlorber.com"

    )

    ));

}

function WorkoutApp({ theme, toggleTheme, nightMode = false, toggleNight = () => {}, onFlowOpen }) {
  const [view, setView] = useState("home");
  const [activePeriod, setActivePeriod] = useState(() => storageGet("axis_period", null)); // null = auto
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showStreak, setShowStreak] = useState(() => storageGet("axis_show_streak", true));
  const [showTimer, setShowTimer] = useState(() => storageGet("axis_show_timer", true));
  const [showPct, setShowPct] = useState(() => storageGet("axis_show_pct", true));
  const [track, setTrack] = useState("daily");
  const [tab, setTab] = useState("list");
  const [fi, setFi] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [showSkipOnly, setShowSkipOnly] = useState(false);
  const [resting, setResting] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [done, setDone] = useState(() => storageGet("axis_done", {}));
  const [skipped, setSkipped] = useState(() => storageGet("axis_skipped", {}));
  const [favs, setFavs] = useState(() => storageGet("axis_favs", {}));
  const [notes, setNotes] = useState(() => storageGet("axis_notes", {}));
  const [sessionSecs, setSessionSecs] = useState(0);
  const [streak, setStreak] = useState(() => storageGet("axis_streak", 0));
  const [history, setHistory] = useState(() => storageGet("axis_history", []));
  const [todayLogged, setTodayLogged] = useState(() => {
    const h = storageGet("axis_history", []);
    return h.some((e) => e.date === new Date().toDateString());
  });

  useEffect(() => {
    if (!flowActive) {setSessionComplete(false);return;}
    if (sessionComplete) return;
    setSessionSecs(0);
    const t = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [flowActive, sessionComplete]);

  // Paint gradient on body + apply circadian theme
  useEffect(() => {
    const isDark = theme === "dark";
    const period = activePeriod || getCircadianPeriod();
    const circadian = nightMode ? { bg: "#000000" } : applyCircadianTheme(isDark, period);
    document.body.style.transition = "background 2s ease";
    document.body.style.background = circadian?.bg || (
    isDark ? "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)" :
    "linear-gradient(145deg, #c8d8e8 0%, #d0dcea 35%, #dce4ec 70%, #e8eef4 100%)");
    document.body.style.width = "100%";
    document.documentElement.style.width = "100%";
    document.body.style.minHeight = "100vh";
    return () => {document.body.style.background = "";};
  }, [theme, activePeriod]);
  useEffect(() => {storageSet("axis_show_streak", showStreak);}, [showStreak]);
  useEffect(() => {storageSet("axis_show_timer", showTimer);}, [showTimer]);
  useEffect(() => {storageSet("axis_show_pct", showPct);}, [showPct]);
  useEffect(() => {storageSet("axis_done", done);}, [done]);
  useEffect(() => {storageSet("axis_skipped", skipped);}, [skipped]);
  useEffect(() => {storageSet("axis_favs", favs);}, [favs]);
  useEffect(() => {storageSet("axis_notes", notes);}, [notes]);

  const SECTIONS = getSections(track);
  const ALL = getAll(track);
  const activeAll = ALL.filter((e) => !skipped[e.id]);
  const filteredAll = activeAll.filter((e) => {
    if (showFavOnly) return favs[e.id];
    if (showSkipOnly) return skipped[e.id]; // skipped already excluded above, so this shows none — intentional
    return true;
  });
  const TOTAL = activeAll.length;
  const totalDone = activeAll.filter((e) => done[e.id]).length;
  const pct = TOTAL > 0 ? Math.round(totalDone / TOTAL * 100) : 0;
  const cur = activeAll[Math.min(fi, activeAll.length - 1)];

  const toggle = (id) => {
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      if (next[id] && !todayLogged) {
        const today = new Date().toDateString();
        const newEntry = { date: today, track: TRACKS[track].label, duration: Math.round(sessionSecs / 60) };
        const newHistory = [newEntry, ...history].slice(0, 30);
        setHistory(newHistory);storageSet("axis_history", newHistory);
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const hadYesterday = history.some((e) => e.date === yesterday);
        const newStreak = hadYesterday ? streak + 1 : 1;
        setStreak(newStreak);storageSet("axis_streak", newStreak);
        setTodayLogged(true);
      }
      return next;
    });
  };

  const toggleSkip = (id) => setSkipped((s) => ({ ...s, [id]: !s[id] }));
  const toggleFav = (id) => setFavs((f) => ({ ...f, [id]: !f[id] }));
  const setNote = (id, val) => setNotes((n) => ({ ...n, [id]: val }));
  const switchTrack = (t) => {setTrack(t);setFi(0);setOpenId(null);setTab("list");};
  const beginTrack = (t) => {switchTrack(t);setHasActiveSession(true);setView("session");};
  const goHome = () => {setView("home");setTab("list");};
  const playBeep = (freq = 880) => beep(freq);
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toDateString();
  const weekSessions = history.filter((e) => new Date(e.date) >= new Date(weekAgo));
  const weekMinutes = weekSessions.reduce((a, e) => a + (e.duration || 0), 0);
  const favCount = Object.values(favs).filter(Boolean).length;
  const skippedCount = Object.values(skipped).filter(Boolean).length;
  const visibleSections = SECTIONS.map((s) => ({ ...s, exercises: s.exercises.filter((e) => {if (showFavOnly) return favs[e.id];if (showSkipOnly) return skipped[e.id];return true;}) })).filter((s) => s.exercises.length > 0);

  const SunIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "5" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "4" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "22" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), /*#__PURE__*/React.createElement("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), /*#__PURE__*/React.createElement("line", { x1: "2", y1: "12", x2: "4", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "20", y1: "12", x2: "22", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), /*#__PURE__*/React.createElement("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }));
  const MoonIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }));
  const GearIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /*#__PURE__*/React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }));

  // SETTINGS
  // TIMER VIEW
  if (view === "timer") {
    return /*#__PURE__*/React.createElement(TimerView, { theme: theme, view: view, setView: setView, hasActiveSession: hasActiveSession, css: css, activePeriod: activePeriod, nightMode: nightMode });
  }
  if (view === "settings") return (/*#__PURE__*/
    React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
    React.createElement("style", null, css), /*#__PURE__*/
    React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", animation: "orbFloat 24s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate", transition: "background 2s ease" } }), /*#__PURE__*/
    React.createElement("div", { className: "app-body" }, /*#__PURE__*/
    React.createElement("div", { className: "app-page-header" }, /*#__PURE__*/
    React.createElement("div", { className: "app-label", style: { fontSize: 24, fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 20 } }, "AXIS"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "30px", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-white)", marginBottom: 36 } }, "Settings"), /*#__PURE__*/
    React.createElement("div", { style: { borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 32 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dimmer)", marginBottom: 20 } }, "Session Bar"),
    [
    { label: "Show % done", desc: "Percentage of exercises completed in the current track.", val: showPct, set: setShowPct }].
    map(({ label, desc, val, set }) => /*#__PURE__*/
    React.createElement("div", { key: label, style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 24 } }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "14px", fontWeight: 500, color: "var(--text-white)", marginBottom: 4 } }, label), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280 } }, desc)
    ), /*#__PURE__*/
    React.createElement("button", { onClick: () => set((s) => !s), style: { flexShrink: 0, marginTop: 2, width: 44, height: 26, border: "1px solid", borderColor: val ? "var(--accent)" : "var(--glass-border-strong)", borderRadius: 13, background: val ? "var(--accent)" : "var(--glass-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s" } }, /*#__PURE__*/
    React.createElement("div", { style: { position: "absolute", top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: nightMode ? "#000000" : "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
    )
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 0 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dimmer)", marginBottom: 16 } }, "Data Management"), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => {
        try {
          const data = { history: storageGet("axis_history", []), favs: storageGet("axis_favs", {}), streak: storageGet("axis_streak", 0), exported: new Date().toISOString() };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");a.href = url;
          a.download = `axis-backup-${new Date().toISOString().split("T")[0]}.json`;
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, style: { background: "var(--glass-bg)", border: "1px solid var(--glass-border)", fontFamily: "'Barlow',sans-serif", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-secondary)", cursor: "pointer", padding: "11px 18px", borderRadius: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 10 } }, /*#__PURE__*/
    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), /*#__PURE__*/React.createElement("polyline", { points: "7 10 12 15 17 10" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })), "Backup Data"

    ), /*#__PURE__*/
    React.createElement("label", { style: { background: "var(--glass-bg)", border: "1px solid var(--glass-border)", fontFamily: "'Barlow',sans-serif", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-secondary)", cursor: "pointer", padding: "11px 18px", borderRadius: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 10 } }, /*#__PURE__*/
    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), /*#__PURE__*/React.createElement("polyline", { points: "17 8 12 3 7 8" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "3", x2: "12", y2: "15" })), "Restore Data", /*#__PURE__*/

    React.createElement("input", { type: "file", accept: ".json", style: { display: "none" }, onChange: (e) => {
        const file = e.target.files?.[0];if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.history) {storageSet("axis_history", data.history);}
            if (data.favs) {storageSet("axis_favs", data.favs);}
            if (data.streak) {storageSet("axis_streak", data.streak);}
            window.location.reload();
          } catch (err) {alert("Could not restore — invalid backup file.");}
        };
        reader.readAsText(file);
      } })
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { borderTop: "1px solid var(--border)", paddingTop: 20 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dimmer)", marginBottom: 16 } }, "About"), /*#__PURE__*/
    React.createElement("button", { onClick: () => {storageSet("axis_onboarded", false);window.location.reload();}, style: { background: "none", border: "1px solid var(--glass-border)", fontFamily: "'Barlow',sans-serif", fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-dim)", cursor: "pointer", padding: "10px 18px", marginBottom: 16, borderRadius: 10 } }, "View Onboarding Again"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement(FeedbackButton, null)
    )
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "tab-bar-spacer" })
    ), /*#__PURE__*/
    React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
    ));


  // MOOD
  if (view === "mood") {
    const MOOD_PERIODS = [
    { p: "dawn", label: "Dawn", time: "5–11am", desc: "Warm amber. Morning energy.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M4 16 A 8 8 0 0 1 20 16" }), /*#__PURE__*/React.createElement("line", { x1: "0", y1: "16", x2: "24", y2: "16" })) },
    { p: "midday", label: "Midday", time: "11am–5pm", desc: "Cool mint. Crisp and focused.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "5" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "19", x2: "12", y2: "22" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "4.22", x2: "6.34", y2: "6.34" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "17.66", x2: "19.78", y2: "19.78" }), /*#__PURE__*/React.createElement("line", { x1: "2", y1: "12", x2: "5", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "19", y1: "12", x2: "22", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "19.78", x2: "6.34", y2: "17.66" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "6.34", x2: "19.78", y2: "4.22" })) },
    { p: "prime", label: "Prime", time: "5–10pm", desc: "Deep blue. Winding down.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })) },
    { p: "rest", label: "Rest", time: "10pm–5am", desc: "Soft violet. Calm and dim.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M12 3l1.5 5.5 6 .5-4.5 4 1.5 5.5L12 16l-4.5 2 1.5-5.5-4.5-4 6-.5L12 3z" })) }];

    const nowPeriod = getCircadianPeriod();
    return (/*#__PURE__*/
      React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("style", null, css), /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", animation: "orbFloat 24s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate", transition: "background 2s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body" }, /*#__PURE__*/
      React.createElement("div", { className: "app-page-header" }, /*#__PURE__*/
      React.createElement("div", { className: "app-label", style: { fontSize: 24, fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 20 } }, "AXIS"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "30px", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-white)", marginBottom: 6 } }, "Mood"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "14px", color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 } }, "Set the feeling of the app. Auto follows the time of day, or lock it to whatever matches how you feel right now."

      ), /*#__PURE__*/

      React.createElement("div", { style: { fontSize: 12, letterSpacing: "0.20em", textTransform: "uppercase", color: "var(--text-dimmer)", marginBottom: 10, fontWeight: 500 } }, "Appearance"), /*#__PURE__*/
      React.createElement("div", { style: { ...(nightMode ? { opacity: 0.45, pointerEvents: "none", transition: "opacity 0.25s ease" } : {}) } }, /*#__PURE__*/
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 20 } },
      [{ val: "dark", label: "Dark" }, { val: "light", label: "Light" }].map(({ val, label }) => /*#__PURE__*/
      React.createElement("button", { key: val, onClick: nightMode ? undefined : toggleTheme, style: {
          flex: 1, padding: "11px 0", borderRadius: 12, cursor: nightMode ? "default" : "pointer",
          fontFamily: "'Barlow',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
          border: theme === val ? "1.5px solid var(--accent)" : "1px solid var(--glass-border)",
          background: theme === val ? "var(--accent-dim)" : "var(--glass-bg)",
          color: theme === val ? "var(--accent)" : "var(--text-secondary)",
          transition: "all 0.18s"
        } }, label)
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 16, background: "var(--glass-bg)", border: activePeriod === null ? "1px solid var(--accent)" : "1px solid var(--glass-border)", marginBottom: 12, transition: "all 0.2s", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "15px", fontWeight: 500, color: activePeriod === null ? "var(--accent)" : "var(--text-white)", marginBottom: 3 } }, "Auto"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "12px", color: "var(--text-secondary)" } },
      activePeriod === null ? /*#__PURE__*/React.createElement("span", null, "On \u2014 currently ", /*#__PURE__*/React.createElement("span", { style: { color: "var(--accent)", fontWeight: 500 } }, nowPeriod)) : "Follows time of day"
      )
      ), /*#__PURE__*/
      React.createElement("button", { onClick: nightMode ? undefined : () => {const n = activePeriod === null ? nowPeriod : null;setActivePeriod(n);storageSet("axis_period", n);}, style: { flexShrink: 0, width: 44, height: 26, border: "1px solid", borderColor: activePeriod === null ? "var(--accent)" : "var(--glass-border-strong)", borderRadius: 13, background: activePeriod === null ? "var(--accent)" : "var(--glass-bg)", cursor: nightMode ? "default" : "pointer", position: "relative", transition: "all 0.2s" } }, /*#__PURE__*/
      React.createElement("div", { style: { position: "absolute", top: 3, left: activePeriod === null ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: nightMode ? "#000000" : "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 } },
      MOOD_PERIODS.map(({ p, label, time, desc, icon }) => {
        const ct = CIRCADIAN_THEMES[p][theme === "dark" ? "dark" : "light"];
        const isSelected = activePeriod === p;
        const isNow = nowPeriod === p;
        return (/*#__PURE__*/
          React.createElement("button", { key: p, onClick: nightMode ? undefined : () => {setActivePeriod(p);storageSet("axis_period", p);}, style: {
              display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
              borderRadius: 16, cursor: nightMode ? "default" : "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
              border: isSelected ? `1.5px solid ${ct.accent}` : "1px solid var(--glass-border)",
              background: isSelected ? ct.accentDim : "var(--glass-bg)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              transition: "all 0.2s"
            } }, /*#__PURE__*/
          React.createElement("div", { style: {
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: ct.bg, border: `1px solid ${ct.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: ct.accent, boxShadow: isSelected ? `0 0 16px ${ct.accentGlow}` : "none",
              transition: "box-shadow 0.2s"
            } }, icon), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: "16px", fontWeight: 500, color: isSelected ? ct.accent : "var(--text-white)", fontFamily: "'Barlow',sans-serif", letterSpacing: "-0.01em" } }, label), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: "12px", color: "var(--text-dimmer)" } }, time),
          isNow && !nightMode && /*#__PURE__*/React.createElement("span", { style: { fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.7 } }, "now")
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: "13px", color: "var(--text-secondary)" } }, desc)
          ),
          isSelected && !nightMode && /*#__PURE__*/React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: ct.accent, flexShrink: 0, boxShadow: `0 0 8px ${ct.accentGlow}` } })
          ));

      })
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 32 } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "14px", fontWeight: 500, color: "var(--text-white)", marginBottom: 4 } }, "Night mode"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280 } }, "Pure black with vibrant red \u2014 like Apple Watch Ultra. For low-light use.")
      ), /*#__PURE__*/
      React.createElement("button", { onClick: toggleNight, style: { flexShrink: 0, marginTop: 2, width: 44, height: 26, border: "1px solid", borderColor: nightMode ? "var(--accent)" : "var(--glass-border-strong)", borderRadius: 13, background: nightMode ? "var(--accent)" : "var(--glass-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s" } }, /*#__PURE__*/
      React.createElement("div", { style: { position: "absolute", top: 3, left: nightMode ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: nightMode ? "#000" : "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer" })
      ), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
      ));

  }

  // TODAY (formerly Home)
  if (view === "home") {
    const nowPeriod = getCircadianPeriod();
    const TODAY_SUGGESTIONS = {
      dawn: { trackId: "morning", label: "Morning Routine", suggestion: "An 8‑minute reset might fit now." },
      midday: { trackId: "desk", label: "Desk Routine", suggestion: "A 5‑minute desk break might fit now." },
      prime: { trackId: "anxiety", label: "Calm Circuit", suggestion: "A 12‑minute reset might fit now." },
      rest: { trackId: "prime", label: "Better Sleep Stretch", suggestion: "A 12‑minute wind-down might fit now." }
    };
    const periodLabels = { dawn: "Dawn", midday: "Midday", prime: "Prime", rest: "Rest" };
    const todaySug = TODAY_SUGGESTIONS[nowPeriod];
    const todayTrack = TRACKS[todaySug.trackId];
    const groups = [
    { label: "Foundation", ids: ["daily", "restorative"] },
    { label: "Time of Day", ids: ["morning", "prime"] },
    { label: "Targeted", ids: ["desk", "screen", "hip", "back"] },
    { label: "Body Maintenance", ids: ["steady", "freely", "feet", "knee"] },
    { label: "Mental Wellness", ids: ["anxiety", "stress"] },
    { label: "Travel", ids: ["transit", "travel"] }];

    return (/*#__PURE__*/
      React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("style", null, css), /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", animation: "orbFloat 24s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate", transition: "background 2s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body" }, /*#__PURE__*/
      React.createElement("div", { className: "home" }, /*#__PURE__*/
      React.createElement("div", { className: "home-hdr app-page-header" }, /*#__PURE__*/
      React.createElement("div", { className: "home-brand" }, /*#__PURE__*/
      React.createElement("div", { className: "home-wordmark" }, "AXIS")
      ), /*#__PURE__*/
      React.createElement("div", { className: "home-tagline" }, "Listen to your body. Select your focus.")
      ), /*#__PURE__*/
      React.createElement("div", { className: "track-cards-outer" }, /*#__PURE__*/

      React.createElement("div", { className: "track-group start-here-group", style: { marginBottom: 28 }, role: "region", "aria-label": "Today's suggestion" }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8, fontWeight: 600 } }, "Today"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 20, fontWeight: 500, color: "var(--text-white)", marginBottom: 6 } }, periodLabels[nowPeriod]), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 14, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 } }, todaySug.suggestion), /*#__PURE__*/
      React.createElement("button", { className: "begin-btn", onClick: () => beginTrack(todayTrack.id), style: { width: "100%", padding: "14px 24px", fontSize: 15 }, "aria-label": `Start ${todayTrack.label}, ${todayTrack.duration}` },
      todayTrack.label, " \u2014 ", todayTrack.duration
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8, fontWeight: 600 } }, "Browse"),
      groups.map((g) => /*#__PURE__*/
      React.createElement("div", { className: "track-group", key: g.label }, /*#__PURE__*/
      React.createElement("div", { className: "track-group-label" }, g.label), /*#__PURE__*/
      React.createElement("div", { className: "track-cards" },
      g.ids.map((id) => {const t = TRACKS[id];return (/*#__PURE__*/
          React.createElement("div", { className: "track-card", key: t.id, onClick: () => beginTrack(t.id), role: "button", tabIndex: 0, onKeyDown: (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();beginTrack(t.id);}}, "aria-label": `${t.label}, ${t.duration}. Begin session` }, /*#__PURE__*/
          React.createElement("div", { className: "track-card-left" }, /*#__PURE__*/
          React.createElement("div", { className: "track-card-name" }, t.label), /*#__PURE__*/
          React.createElement("div", { className: "track-card-sub" }, t.subtitle), /*#__PURE__*/
          React.createElement("div", { className: "track-card-purpose" }, t.purpose)
          ), /*#__PURE__*/
          React.createElement("div", { className: "track-card-right" }, /*#__PURE__*/
          React.createElement("div", { className: "track-card-dur" }, t.duration), /*#__PURE__*/
          React.createElement("button", { className: "begin-btn", onClick: (e) => {e.stopPropagation();beginTrack(t.id);}, "aria-label": `Begin ${t.label}` }, "Begin")
          )
          ));
      })
      )
      )
      ), /*#__PURE__*/
      React.createElement(EolMarker, null)
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer" })
      ), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
      ));

  }

  // SESSION — empty state if no track started
  if (view === "session" && !hasActiveSession) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("style", null, css), /*#__PURE__*/
      React.createElement("div", { className: "app-body", style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px 120px", textAlign: "center", minHeight: "calc(100vh - 72px)" } }, /*#__PURE__*/
      React.createElement("div", { style: { marginBottom: 16, opacity: 0.25 } }, /*#__PURE__*/
      React.createElement("img", { src: theme === "dark" ? AXIS_LOGO_DARK : AXIS_LOGO_LIGHT, alt: "AXIS", style: { height: 72, width: "auto", objectFit: "contain" } })
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "12px", color: "var(--eol-color)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 96, fontWeight: 300 } }, "X\xA0MOVE\xA0X\xA0MEND\xA0X\xA0MAINTAIN\xA0X"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "18px", fontWeight: 400, color: "var(--text-white)", letterSpacing: "-0.02em", marginBottom: 20 } }, "Ready for movement."), /*#__PURE__*/
      React.createElement("button", { onClick: () => setView("home"), style: { padding: "12px 28px", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", fontFamily: "'Barlow',sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", borderRadius: 24, transition: "all 0.2s" }, "aria-label": "Browse all tracks" }, "Browse all tracks"

      )
      ), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
      ));

  }

  if (view !== "session") return null;

  // SESSION
  return (/*#__PURE__*/
    React.createElement(React.Fragment, null,
    flowActive && /*#__PURE__*/
    React.createElement(FlowOverlay, {
      theme: theme, activePeriod: activePeriod, activeAll: filteredAll, TOTAL: filteredAll.length,
      done: done, totalDone: totalDone, sessionSecs: sessionSecs,
      onExit: () => {setFlowActive(false);setSessionComplete(false);},
      onToggle: toggle,
      onSkip: toggleSkip,
      formatTime: formatTime,
      trackLabel: TRACKS[track].label,
      trackDuration: TRACKS[track].duration,
      nightMode: nightMode,
      streak: streak,
      onSessionComplete: () => setSessionComplete(true) }
    ), /*#__PURE__*/

    React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
    React.createElement("style", null, css), /*#__PURE__*/
    React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", animation: "orbFloat 24s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate", transition: "background 2s ease" } }), /*#__PURE__*/
    React.createElement("div", { className: "app-body" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr" }, /*#__PURE__*/
    React.createElement("button", { className: "back-btn", onClick: goHome }, "\u2190 All Workouts"), /*#__PURE__*/
    React.createElement("div", { className: "hdr-row" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-left" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-title" }, TRACKS[track].label), /*#__PURE__*/
    React.createElement("div", { className: "hdr-meta" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-subtitle" }, TRACKS[track].subtitle), /*#__PURE__*/
    React.createElement("div", { className: "hdr-dur" }, TRACKS[track].duration)
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "tabs" },
    ["list", "flow", "summary"].map((t) => /*#__PURE__*/
    React.createElement("button", { key: t, className: `tab ${tab === t ? "on" : ""}`, onClick: () => setTab(t) }, t.charAt(0).toUpperCase() + t.slice(1))
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "content" }, /*#__PURE__*/

    React.createElement("div", { className: "tab-subbar" }, /*#__PURE__*/
    React.createElement("div", { className: "tab-desc-line" },
    tab === "list" && "Your pace. Tap to expand, mark done when ready.",
    tab === "flow" && "Hands-free. Auto-timed with audio cues.",
    tab === "summary" && "Your progress over time."
    ),
    tab !== "summary" && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "tab-prog-row" }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.04em" } }, /*#__PURE__*/
    React.createElement("span", { style: { fontWeight: 700, color: "var(--accent)" } }, totalDone), /*#__PURE__*/
    React.createElement("span", { style: { color: "var(--text-dimmer)" } }, " / ", TOTAL, " exercises")
    ), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: 11, color: "var(--text-dimmer)", letterSpacing: "0.08em" } }, pct, "%")
    ), /*#__PURE__*/
    React.createElement("div", { className: "prog-bar", style: { marginBottom: 6 } }, /*#__PURE__*/React.createElement("div", { className: "prog-fill", style: { width: `${pct}%` } }))
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "fav-filter" }, /*#__PURE__*/
    React.createElement("button", { className: `fav-toggle ${showFavOnly ? "on" : ""}`, onClick: () => {setShowFavOnly((f) => !f);setShowSkipOnly(false);} }, "\u2605 Favorites"), /*#__PURE__*/
    React.createElement("button", { className: `fav-toggle ${showSkipOnly ? "on" : ""}`, onClick: () => {setShowSkipOnly((f) => !f);setShowFavOnly(false);} }, "\u2014 Skipped"), /*#__PURE__*/
    React.createElement("button", { className: "fav-toggle reset-pill", onClick: () => {
        setDone({});setSkipped({});setOpenId(null);setFi(0);setResting(false);
        storageSet("axis_done", {});storageSet("axis_skipped", {});
        setShowFavOnly(false);setShowSkipOnly(false);
      } }, "\u21BA Reset Session")
    ),
    tab === "list" && /*#__PURE__*/
    React.createElement(React.Fragment, null,
    visibleSections.map((sec) => /*#__PURE__*/
    React.createElement("div", { className: "sg", key: sec.label }, /*#__PURE__*/
    React.createElement("div", { className: "sh" }, /*#__PURE__*/
    React.createElement("span", { className: "sh-tag" }, sec.tag), /*#__PURE__*/
    React.createElement("span", { className: "sh-name" }, sec.label), /*#__PURE__*/
    React.createElement("span", { className: "sh-ct" }, sec.exercises.filter((e) => done[e.id]).length, "/", sec.exercises.length)
    ),
    sec.purpose && /*#__PURE__*/
    React.createElement("div", { className: "purpose-note" }, /*#__PURE__*/
    React.createElement("div", { className: "purpose-label" }, "Purpose"), /*#__PURE__*/
    React.createElement("div", { className: "purpose-text" }, sec.purpose)
    ),

    sec.exercises.map((ex, idx) => {
      const nextEx = sec.exercises[idx + 1] || null;
      return (/*#__PURE__*/
        React.createElement(ExRow, { key: ex.id, ex: ex,
          done: !!done[ex.id], onToggle: () => toggle(ex.id),
          open: openId === ex.id, onExpand: () => setOpenId(openId === ex.id ? null : ex.id),
          skipped: !!skipped[ex.id], onSkip: () => toggleSkip(ex.id),
          faved: !!favs[ex.id], onFav: () => toggleFav(ex.id),
          note: notes[ex.id], onNote: (val) => setNote(ex.id, val),
          nextName: nextEx ? nextEx.name : null }
        ));

    })
    )
    )
    ),


    tab === "flow" && /*#__PURE__*/
    React.createElement(React.Fragment, null,
    visibleSections.map((sec) => /*#__PURE__*/
    React.createElement("div", { className: "sg", key: sec.label }, /*#__PURE__*/
    React.createElement("div", { className: "sh" }, /*#__PURE__*/
    React.createElement("span", { className: "sh-tag" }, sec.tag), /*#__PURE__*/
    React.createElement("span", { className: "sh-name" }, sec.label)
    ),
    sec.purpose && /*#__PURE__*/
    React.createElement("div", { className: "purpose-note" }, /*#__PURE__*/
    React.createElement("div", { className: "purpose-label" }, "Purpose"), /*#__PURE__*/
    React.createElement("div", { className: "purpose-text" }, sec.purpose)
    ),

    sec.exercises.map((ex, idx) => {
      const nextEx = sec.exercises[idx + 1] || null;
      return (/*#__PURE__*/
        React.createElement(ExRow, { key: ex.id, ex: ex,
          done: !!done[ex.id], onToggle: () => toggle(ex.id),
          open: openId === ex.id, onExpand: () => setOpenId(openId === ex.id ? null : ex.id),
          skipped: !!skipped[ex.id], onSkip: () => toggleSkip(ex.id),
          faved: !!favs[ex.id], onFav: () => toggleFav(ex.id),
          note: notes[ex.id], onNote: (val) => setNote(ex.id, val),
          nextName: nextEx ? nextEx.name : null,
          hideTimer: true,
          hideDone: true }
        ));

    })
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { padding: "16px 0 32px" } }, /*#__PURE__*/
    React.createElement("button", { className: "fv-cta", onClick: () => {primeAudio();setFlowActive(true);} }, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 } }, /*#__PURE__*/
    React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor" }, /*#__PURE__*/React.createElement("polygon", { points: "5,3 19,12 5,21" })), /*#__PURE__*/
    React.createElement("span", null, "Start Flow")
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 11, fontWeight: 400, letterSpacing: "0.12em", opacity: 0.65, marginTop: 4 } },
    activeAll.length, " exercises \xB7 auto-timed"
    )
    )
    )
    ),



    tab === "summary" && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "summary", style: { marginTop: 24 } }, /*#__PURE__*/
    React.createElement("div", { className: "summary-title" }, "This Week"), /*#__PURE__*/
    React.createElement("div", { className: "summary-grid" }, /*#__PURE__*/
    React.createElement("div", { className: "summary-cell" }, /*#__PURE__*/React.createElement("div", { className: "summary-num" }, weekSessions.length), /*#__PURE__*/React.createElement("div", { className: "summary-lbl" }, "Sessions")), /*#__PURE__*/
    React.createElement("div", { className: "summary-cell" }, /*#__PURE__*/React.createElement("div", { className: "summary-num" }, streak), /*#__PURE__*/React.createElement("div", { className: "summary-lbl" }, "Day Streak")), /*#__PURE__*/
    React.createElement("div", { className: "summary-cell" }, /*#__PURE__*/React.createElement("div", { className: "summary-num" }, weekMinutes, /*#__PURE__*/React.createElement("span", { style: { fontSize: 14 } }, "m")), /*#__PURE__*/React.createElement("div", { className: "summary-lbl" }, "Minutes"))
    )
    ), /*#__PURE__*/
    React.createElement(MomentumMap, { history: history }),
    history.length > 0 && /*#__PURE__*/
    React.createElement("div", { className: "history", style: { marginTop: 24 } }, /*#__PURE__*/
    React.createElement("div", { className: "summary-title", style: { marginBottom: 8 } }, "Recent Sessions"),
    history.slice(0, 10).map((e, i) => /*#__PURE__*/
    React.createElement("div", { className: "history-row", key: i }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("div", { className: "history-date" }, e.date), /*#__PURE__*/React.createElement("div", { className: "history-track" }, e.track)), /*#__PURE__*/
    React.createElement("div", { className: "history-detail" }, e.duration, "m")
    )
    )
    ),

    history.length === 0 && /*#__PURE__*/
    React.createElement("div", { style: { textAlign: "center", padding: "48px 0", color: "var(--text-dim)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" } }, "Complete a session to see your history"

    ),


    (track === "anxiety" || track === "stress") && totalDone > 0 && /*#__PURE__*/
    React.createElement("div", { style: { marginTop: 28, padding: "18px", borderRadius: 16, border: "1px solid var(--glass-border)", background: "var(--glass-bg)" } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 } }, "Continue the Reset"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 } },
    track === "anxiety" ? "Finish with 2 minutes of Box Breathing to ground the nervous system." : "Calm the heart with a Physiological Sigh."
    ), /*#__PURE__*/
    React.createElement("button", { onClick: () => {setView("timer");}, style: {
        background: "var(--accent-dim)", border: "1px solid var(--accent)",
        fontFamily: "'Barlow',sans-serif", fontSize: "12px", letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--accent)", cursor: "pointer",
        padding: "10px 18px", borderRadius: 10, transition: "all 0.18s"
      } },
    track === "anxiety" ? "→ Box Breathing" : "→ Physiological Sigh"
    )
    )

    ), /*#__PURE__*/



    React.createElement("div", { className: "tab-bar-spacer" })
    )
    ), /*#__PURE__*/
    React.createElement(TabBar, { view: view, setView: setView, hasActiveSession: hasActiveSession, theme: theme })
    )
    ));

}

// ─────────────────────────────────────────────────────────────
//  ROOT — orchestrates onboarding → app
// ─────────────────────────────────────────────────────────────
function App() {
  // Temporary mount test: render a minimal component to verify React mounting.
  return /*#__PURE__*/React.createElement("div", { style: { color: "#fff", padding: 24, fontFamily: "'Barlow', sans-serif", fontSize: 18 } }, "Hello from React");
}

// ─────────────────────────────────────────────────────────────
//  END-OF-LIST MARKER
// ─────────────────────────────────────────────────────────────
function EolMarker() {
  const [showTag, setShowTag] = useState(false);
  const holdRef = useRef(null);
  const timerRef = useRef(null);

  const startPress = () => {
    holdRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      setShowTag(true);
      timerRef.current = setTimeout(() => setShowTag(false), 2000);
    }, 600);
  };
  const endPress = () => {clearTimeout(holdRef.current);};

  return (/*#__PURE__*/
    React.createElement("div", {
      className: "eol-marker" + (showTag ? " show-tag" : ""),
      onMouseDown: startPress, onMouseUp: endPress, onMouseLeave: endPress,
      onTouchStart: startPress, onTouchEnd: endPress }, /*#__PURE__*/

    React.createElement("span", { className: "eol-xs" }, "X X X X"), /*#__PURE__*/
    React.createElement("span", { className: "eol-tag" }, "X MOVE X MEND X MAINTAIN X")
    ));

}


function mountApp() {
  try {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      // If libraries aren't present yet, try again shortly
      setTimeout(mountApp, 250);
      return;
    }
    const el = document.getElementById('root');
    if (!el) {
      // Wait for DOM ready
      document.addEventListener('DOMContentLoaded', mountApp, { once: true });
      return;
    }
    ReactDOM.createRoot(el).render(React.createElement(App));
  } catch (e) {
    try { showLoadErr('Error: ' + (e && e.message ? e.message : String(e)) + (e && e.stack ? '\n\n' + e.stack : '')); } catch (_) {}
  }
// Start mounting once scripts executed / DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}