
const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

/**
 * Persists tester consent to Supabase (RPC save_consent).
 * Runs in the background; failures are logged only (onboarding continues).
 * Deploy: run supabase/migrations/001_tester_signups_save_consent.sql in SQL Editor, then set AXIS_SUPABASE_URL + AXIS_SUPABASE_ANON_KEY above.
 */
async function save_consent(payload) {
  const name = (payload && payload.name) ? String(payload.name).trim() : '';
  const consent = payload && payload.consent === true;
  if (!name || !consent) return;
  const base = typeof window !== 'undefined' && window.AXIS_SUPABASE_URL;
  const key = typeof window !== 'undefined' && window.AXIS_SUPABASE_ANON_KEY;
  if (!base || !key || String(base).indexOf('http') !== 0) return;
  if (String(key).indexOf('PASTE YOUR') !== -1) return; /* wait until real anon key is set */
  const root = String(base).replace(/\/$/, '');
  try {
    /* PostgREST: calls public.save_consent(p_name, p_consent) */
    const res = await fetch(root + '/rest/v1/rpc/save_consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: 'Bearer ' + key,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ p_name: name, p_consent: true })
    });
    if (!res.ok) {
      try { console.warn('[AXIS] save_consent failed', res.status, await res.text()); } catch (e) { console.warn('[AXIS] save_consent failed', res.status); }
    }
  } catch (err) {
    console.warn('[AXIS] save_consent', err);
  }
}

// ─────────────────────────────────────────────────────────────
//  AXIS — COMPLETE APP (Onboarding → Home → Sessions)
// ─────────────────────────────────────────────────────────────

// ── ICON RENDERER ─────────────────────────────────────────────
function AxisIcon({ size = 72, color = "#F0EEEB" }) {
  const S = size;
  const pad = S * 0.05, usable = S - pad * 2, spacing = usable * 0.5;
  const xSize = spacing * 0.78, strokeW = S * 0.09, off = spacing / 2;
  const positions = [
    [S/2 - off, S/2 - off], [S/2 + off, S/2 - off],
    [S/2 - off, S/2 + off], [S/2 + off, S/2 + off],
  ];
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      {positions.flatMap(([x, y]) =>
        [-45, 45].map(angle => (
          <rect key={`${x}-${y}-${angle}`}
            x={x - xSize/2} y={y - strokeW/2}
            width={xSize} height={strokeW}
            fill={color}
            transform={`rotate(${angle} ${x} ${y})`}
          />
        ))
      )}
    </svg>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────
const obCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
  html,body,#root{width:100%;margin:0;padding:0;}
  .ob-wrap {
    display:flex; flex-direction:column; box-sizing:border-box;
    width:100%; position:relative; min-height:100vh; min-height:100dvh;
    background:var(--ob-page-bg); font-family:var(--font-display); font-weight: 400;
  }
  /* Match index.html .app-orbs: BASE = --ob-page-bg on body + .ob-wrap; orb stack is a faint tint (not full-bleed color) */
  .ob-orbs-layer {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    opacity:0.15;
    background-position:top center;
    background-repeat:no-repeat;
  }
  .ob-wrap[data-theme="light"] .ob-orbs-layer { opacity:0.38; }
  .ob-orbs-layer::after {
    content:'';
    position:absolute;
    inset:0;
    pointer-events:none;
    background:linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(255,255,255,0.02) 60%, transparent 100%);
  }
  .ob-wrap[data-theme="light"] .ob-orbs-layer::after {
    background:linear-gradient(165deg, rgba(255,255,255,0.18) 0%, transparent 48%, rgba(255,255,255,0.06) 100%);
  }
  .ob-label { display:none; }
  .ob-shell { width:100%; overflow:visible; position:relative; z-index:1; flex:1; min-height:0; display:flex; flex-direction:column; box-sizing:border-box; }
  .ob-screen { width:100%; flex:1; min-height:0; display:flex; flex-direction:column; position:relative; box-sizing:border-box; animation:obFadeIn 0.3s ease; padding-top:calc(80px + env(safe-area-inset-top, 0px)); padding-bottom:calc(40px + env(safe-area-inset-bottom, 0px)); padding-left:24px; padding-right:24px; overflow-y:auto; -webkit-overflow-scrolling:touch; }
  @keyframes obFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes obColorFadeIn { from { opacity:0; } to { opacity:1; } }
  .ob-color-reveal { animation: obColorFadeIn 2.5s ease-out forwards; }
  .ob-pad { padding:calc(env(safe-area-inset-top, 0px) + 72px) 32px calc(env(safe-area-inset-bottom, 0px) + 70px); flex:1; box-sizing:border-box; width:100%; text-align:left; }
  /* Logo exception: keep logo centered while text is left-aligned */
  .ob-logo-wrap { align-self: center !important; width: 100%; text-align: center !important; }
  /* Disclosure / CTA: extra scroll space under Let's Go — matches .ob-pad bottom */
  .ob-pad-after-cta { min-height:calc(env(safe-area-inset-bottom, 0px) + 70px); flex-shrink:0; width:100%; pointer-events:none; }
  .ob-screen.ob-screen-upper-bar .ob-pad { flex: 0 1 auto !important; }
  .ob-screen.ob-screen-upper-bar .ob-screen-body { flex: 0 1 auto !important; }
  .ob-s0 {
    display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center;
    padding:calc(80px + env(safe-area-inset-top, 0px)) 24px calc(40px + env(safe-area-inset-bottom, 0px)); box-sizing:border-box; overflow:hidden;
  }
  .ob-s0-top { flex:1; display:flex; align-items:flex-end; justify-content:center; width:100%; min-height:0; padding-bottom:24px; }
  .ob-s0-bottom { flex:1; display:flex; align-items:center; justify-content:center; width:100%; min-height:0; padding-top:24px; }
  .ob-splash-icon {
    width:110px; height:110px; border-radius:16px; margin-bottom:32px;
    background:var(--ob-nav-bg); border-top:1px solid var(--ob-box-border);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .ob-splash-name { font-size: 48px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--ob-text-head); line-height:1; margin-top:44px; }
  .ob-splash-tag { margin-top:24px; font-family:var(--font-meta), "Roboto Mono", ui-monospace, monospace !important; font-size:12px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:var(--ob-text-sec); white-space:nowrap; display:block; text-align:center; }
  .ob-eyebrow { font-family: var(--font-meta), "Roboto Mono", ui-monospace, monospace !important; font-size: var(--text-sm); font-weight: 600; letter-spacing:0.14em; text-transform:uppercase; color:var(--ob-accent); margin-bottom:16px; }
  .ob-heading { font-size: 42px; font-weight:600; letter-spacing:-0.02em; line-height:1.05; color:var(--ob-text-head); margin-bottom:18px; }
  .ob-heading em { font-style:italic; font-weight: 400; color:var(--ob-accent); }
  .ob-body { font-size: var(--text-base); line-height:1.52; color:var(--ob-text-body); font-weight:400; }
  :root { --ob-box-bg: rgba(255,255,255,0.05); --ob-box-border: rgba(255,255,255,0.08); }
  .ob-sci-blocks { display:flex; flex-direction:column; gap:10px; margin-top:20px; flex-shrink:0; }
  .ob-sci {
    padding:14px 16px; border-radius:12px; flex-shrink:0;
    background:var(--ob-box-bg); border:1px solid var(--ob-box-border);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-sci-label { font-family: var(--font-meta), ui-monospace, monospace; font-size: var(--text-sm); font-weight: 600; letter-spacing:0.2em; text-transform:uppercase; color:var(--ob-text-sec); margin-bottom:6px; }
  .ob-sci-text { font-size: var(--text-base); line-height:1.5; color:var(--ob-text-body); font-weight:400; }
  .ob-sci-text strong { color:var(--ob-text-head); font-weight: 600; }
  .ob-benefits { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
  .ob-benefit {
    display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border-radius:12px;
    background:var(--ob-box-bg); border:1px solid var(--ob-box-border);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-benefit--list-recommended {
    border-left: 2px solid var(--mood-color, var(--ob-accent));
  }
  .ob-benefit--guided-secondary {
    background: rgba(255,255,255,0.055);
    border-color: rgba(255,255,255,0.10);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .ob-tab-nav-icon-slot {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--mood-color, var(--ob-accent)) 15%, transparent);
    color: var(--ob-text-head);
  }
  /* Appearance: mirrors System gateway BASE THEME + Auto (.sys-dash__*) */
  .ob-sys-sep {
    margin-top: 20px;
    margin-bottom: 10px;
    font-family: var(--font-meta, var(--font-data)), ui-monospace, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.3);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.3);
  }
  .ob-wrap[data-theme="light"] .ob-sys-sep {
    color: rgba(30, 30, 40, 0.5);
    -webkit-text-fill-color: rgba(30, 30, 40, 0.5);
  }
  .ob-sys-sep--tight {
    margin-top: 14px;
  }
  .ob-sys-auto {
    margin-top: 4px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .ob-sys-auto-lbl {
    flex: 1;
    font-family: var(--font-meta), ui-monospace, monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: none;
    color: rgba(255, 255, 255, 0.38);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.38);
    line-height: 1.4;
  }
  .ob-wrap[data-theme="light"] .ob-sys-auto-lbl {
    color: rgba(30, 30, 40, 0.55);
    -webkit-text-fill-color: rgba(30, 30, 40, 0.55);
  }
  /* Dark / Light — same visual language as Home EXPLORE / RECENTS (timer-glass-wrap pill) */
  .ob-wrap[data-theme="dark"] .ob-appearance .ob-home-theme-pill {
    --ob-pill-border: rgba(246, 247, 248, 0.12);
    --ob-pill-muted: rgba(237, 237, 237, 0.55);
  }
  .ob-wrap[data-theme="light"] .ob-appearance .ob-home-theme-pill {
    --ob-pill-border: rgba(37, 37, 37, 0.12);
    --ob-pill-muted: rgba(42, 42, 44, 0.78);
    background: rgba(255, 255, 255, 0.35);
    border-color: rgba(15, 30, 46, 0.14) !important;
  }
  .ob-appearance .ob-home-theme-pill {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    max-width: 380px;
    margin: 4px auto 16px;
    min-height: 40px;
    box-sizing: border-box;
    gap: 5px;
    padding: 3px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--ob-pill-border) 92%, transparent);
    border-radius: 12px;
    box-shadow: none;
  }
  .ob-appearance .ob-home-theme-pill__btn {
    flex: 1 1 0;
    min-width: 0;
    margin: 0;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    font-family: var(--font-meta, var(--font-data)), ui-monospace, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    transition: background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, -webkit-text-fill-color 0.22s ease;
    background: transparent;
    color: var(--ob-pill-muted, var(--ob-text-dim));
    -webkit-text-fill-color: var(--ob-pill-muted, var(--ob-text-dim));
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }
  .ob-appearance .ob-home-theme-pill__btn.active {
    background: color-mix(in srgb, var(--mood-color, var(--ob-accent)) 16%, transparent);
    color: var(--mood-color, var(--ob-accent));
    -webkit-text-fill-color: var(--mood-color, var(--ob-accent));
    border-color: transparent;
    box-shadow: none;
  }
  .ob-wrap[data-theme="light"] .ob-appearance .ob-home-theme-pill__btn:not(.active) {
    color: var(--ob-pill-muted, var(--ob-text-dim));
    -webkit-text-fill-color: var(--ob-pill-muted, var(--ob-text-dim));
  }
  .ob-sys-toggle-ios {
    flex-shrink: 0;
    width: 46px;
    height: 28px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
    position: relative;
    transition: border-color 0.3s ease, background 0.3s ease;
    background: rgba(255, 255, 255, 0.08);
  }
  .ob-sys-toggle-ios--on {
    border-color: color-mix(in srgb, var(--mood-color, var(--ob-accent)) 72%, transparent);
    background: var(--mood-color, var(--ob-accent));
  }
  .ob-sys-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.28);
    transition: left 0.3s ease, background 0.3s ease;
    pointer-events: none;
  }
  .ob-sys-toggle-ios--on .ob-sys-toggle-knob {
    left: 23px;
    background: #000000;
  }
  .ob-wrap[data-theme="light"] .ob-sys-toggle-ios {
    border-color: rgba(15, 30, 46, 0.14);
    background: rgba(15, 30, 46, 0.06);
  }
  .ob-mood-list--auto-locked {
    opacity: 0.72;
    pointer-events: none;
  }
  [data-theme="light"] .ob-benefit--guided-secondary {
    background: rgba(255,255,255,0.72);
    border-color: rgba(15,23,42,0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .ob-bi { flex-shrink:0; opacity:0.9; display:flex; align-items:center; padding-top:1px; }
  .ob-bt { font-size: var(--text-base); color:var(--ob-text-body); line-height:1.48; font-weight: 400; }
  .ob-bt strong { color:var(--ob-text-head); font-weight: 600; }
  .ob-disc { margin-top:20px; }
  .ob-disc-box {
    padding:14px 16px; border-radius:12px; margin-top:12px;
    background:var(--ob-box-bg); border:1px solid var(--ob-box-border);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ob-disc-label { font-size: var(--text-sm); font-weight: 600; letter-spacing:0.2em; text-transform:uppercase; color:var(--ob-text-sec); margin-bottom:8px; }
  .ob-disc-text { font-size: var(--text-base); line-height:1.52; color:var(--ob-text-body); font-weight:400; }
  .ob-disc-text strong { color:var(--ob-text-head); font-weight: 600; }
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
  .ob-cta-head { font-size: 42px; font-weight:600; letter-spacing:-0.03em; line-height:1.05; color:var(--ob-text-head); margin-bottom:14px; }
  .ob-cta-head em { font-style:italic; font-weight: 400; color:var(--ob-accent); }
  .ob-cta-sub { font-size: var(--text-base); color:var(--ob-text-body); line-height:1.52; margin-bottom:40px; font-weight:400; }
  .ob-btn-primary {
    width:100%; padding:16px; border-radius:var(--axis-radius); border:none; cursor:pointer;
    background:var(--ob-accent); color:var(--ob-accent-btn-text, var(--axis-white));
    font-family:var(--font-display); font-weight:700; font-size: var(--text-sm);
    letter-spacing:0.22em; text-transform:uppercase;
    transition:opacity 0.2s; margin-bottom:10px; display:block;
    box-shadow:0 4px 20px var(--ob-accent-glow);
  }
  .ob-btn-outline {
    width:100%; padding:16px; border-radius:12px; cursor:pointer;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    color:var(--ob-text-body); font-family:var(--font-display); font-weight: 600;
    font-size: var(--text-sm); letter-spacing:0.22em; text-transform:uppercase;
    transition:all 0.2s; margin-bottom:16px; display:block;
  }
  .ob-btn-outline:hover { border-color:var(--ob-accent); color:var(--ob-accent); }
  .ob-btn-ghost { background:none; border:none; font-family:var(--font-display); font-size: var(--text-sm); letter-spacing:0.18em; text-transform:uppercase; color:var(--ob-text-sec); cursor:pointer; transition:color 0.15s; }
  .ob-btn-ghost:hover { color:var(--ob-text-body); }
  .ob-ndots { display:flex; gap:6px; align-items:center; }
  .ob-nd { width:6px; height:6px; border-radius:50%; background:var(--ob-dot-bg); transition:all 0.3s; }
  .ob-nd.a { background:var(--ob-accent); transform:scale(1.3); box-shadow:0 0 8px var(--ob-accent-glow); }
  .ob-nav-bar {
    position:fixed; bottom:0; left:0; right:0;
    padding:0 18px env(safe-area-inset-bottom, 0px);
    display:flex; justify-content:space-between; align-items:flex-start; z-index:100;
    background:var(--ob-nav-bg);
    backdrop-filter:blur(40px) saturate(1.8); -webkit-backdrop-filter:blur(40px) saturate(1.8);
    border-top:1px solid rgba(255,255,255,0.14);
  }
  .ob-nav-inner {
    display:flex;
    align-items:center;
    justify-content:space-between;
    width:100%;
    padding:10px 0;
  }
  .ob-nav-next {
    padding:8px 20px; border-radius:12px; cursor:pointer; transition:all 0.15s;
    background:var(--ob-accent-dim); border:1px solid var(--ob-accent);
    color:var(--ob-accent); font-family:var(--font-display); font-size: var(--text-xs);
    font-weight:600; letter-spacing:0.18em; text-transform:uppercase;
  }
  .ob-nav-next:hover { background:var(--ob-accent); color:var(--ob-accent-btn-text, var(--axis-white)); }
  .ob-nav-back {
    background:none; border:none; cursor:pointer; padding:6px 8px;
    font-family:var(--font-display); font-size: var(--text-lg); color:var(--ob-text-sec);
    opacity:0.6; transition:opacity 0.15s; line-height:1;
  }
  .ob-nav-back:hover { opacity:1; }
  .ob-nav-skip { background:none; border:none; font-family:var(--font-display); font-size: var(--text-sm); letter-spacing:0.16em; text-transform:uppercase; color:var(--ob-text-sec); cursor:pointer; }
  /* Intro hero — after generic .ob-screen so layout wins vs flex:1; min-height:0 */
  .ob-screen.ob-intro-hero {
    display:flex !important;
    flex-direction:column !important;
    align-items:center !important;
    justify-content:flex-start !important;
    width:100% !important;
    flex: 1 1 auto !important;
    min-height:100vh !important;
    min-height:100dvh !important;
    overflow:visible !important;
    padding: calc(52px + env(safe-area-inset-top, 0px)) 28px calc(136px + env(safe-area-inset-bottom, 0px)) !important;
    box-sizing:border-box !important;
  }
  .ob-intro-hero, .ob-intro-hero * { text-align:center !important; }
  .ob-intro-hero__inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 400px;
    min-height: 0;
    padding: 24px 0 32px;
  }
  .ob-intro-hero__wordmark,
  .ob-launch-wordmark {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: clamp(22px, 6vw, 32px);
    font-weight: 300 !important;
    letter-spacing: 0.42em !important;
    text-transform: uppercase !important;
    line-height: 1.15 !important;
    margin: 0 !important;
    padding: 0 4px !important;
    text-align: center !important;
  }
  .ob-wrap[data-theme="light"] .ob-intro-hero__wordmark,
  .ob-wrap[data-theme="light"] .ob-launch-wordmark {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }
  .ob-wrap[data-theme="dark"] .ob-intro-hero__wordmark,
  .ob-wrap[data-theme="dark"] .ob-launch-wordmark {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }
  .ob-intro-hero__sub {
    margin-top: 28px;
    max-width: min(100%, 360px);
    font-family: var(--font-meta), "Roboto Mono", ui-monospace, monospace !important;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.5;
    margin-bottom: 0;
    text-wrap: balance;
  }
  .ob-wrap[data-theme="light"] .ob-intro-hero__sub { color: rgba(29, 29, 31, 0.5); }
  .ob-intro-hero__accent-bar {
    margin-top: 18px;
    width: 16px;
    height: 2px;
    border-radius: 1px;
    background: var(--ob-accent);
    flex-shrink: 0;
  }
  .ob-intro-hero__body {
    margin-top: 36px;
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: 14px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.6;
    max-width: 320px;
  }
  .ob-wrap[data-theme="light"] .ob-intro-hero__body { color: rgba(29, 29, 31, 0.48); }
  /* Final light-mode text overrides after mood selection (exclude Ultra). */
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-appearance .ob-eyebrow,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-appearance .ob-heading,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-appearance .ob-body,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-eyebrow,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-heading,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-body,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-eyebrow,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-heading,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-body,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-title,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-desc,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-label,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-desc,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-upper-bar .ob-eyebrow,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-upper-bar .ob-heading,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-upper-bar .ob-body,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-launch-screen .ob-launch-headline,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-launch-screen .ob-launch-support {
    color: #252525 !important;
    -webkit-text-fill-color: #252525 !important;
  }
  /* Slide tag strip: metrics = .ob-eyebrow; dark = same dim as Lower Tab eyebrow; light = #252525 */
  .ob-screen.ob-content-only.ob-screen-appearance .ob-slide-tag,
  .ob-screen.ob-content-only.ob-screen-session-modes .ob-slide-tag {
    font-family: var(--font-meta), "Roboto Mono", ui-monospace, monospace !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    line-height: 1.35 !important;
  }
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-appearance .ob-slide-tag,
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-slide-tag {
    color: rgba(255, 255, 255, 0.3) !important;
    -webkit-text-fill-color: rgba(255, 255, 255, 0.3) !important;
  }
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-appearance .ob-slide-tag,
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-slide-tag {
    color: #252525 !important;
    -webkit-text-fill-color: #252525 !important;
  }
  /* LIST/GUIDED + tab rows: same Inter body scale as .ob-body (14/400/1.7); titles 14/700 */
  .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-label,
  .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-title {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;
    letter-spacing: -0.02em !important;
  }
  .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-desc,
  .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-desc {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    line-height: 1.7 !important;
  }
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-label,
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-title {
    color: rgba(255, 255, 255, 0.95) !important;
    -webkit-text-fill-color: rgba(255, 255, 255, 0.95) !important;
  }
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-session-modes .ob-mode-card-desc,
  .ob-wrap[data-theme="dark"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-desc {
    color: rgba(255, 255, 255, 0.5) !important;
    -webkit-text-fill-color: rgba(255, 255, 255, 0.5) !important;
  }
  /* Ultra: same metrics as other content sheets; color stays red via earlier rules */
  .ob-screen.ob-ultra-content.ob-content-only .ob-eyebrow,
  .ob-screen.ob-ultra-content.ob-content-only .ob-pad > .ob-eyebrow:first-child {
    font-family: var(--font-meta), "Roboto Mono", ui-monospace, monospace !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    line-height: 1.35 !important;
  }
  .ob-screen.ob-ultra-content.ob-content-only .ob-heading,
  .ob-screen.ob-ultra-content.ob-content-only .ob-heading em {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: clamp(21px, 4.9vw, 24px) !important;
    font-weight: 700 !important;
    line-height: 1.28 !important;
    letter-spacing: -0.02em !important;
  }
  .ob-screen.ob-ultra-content.ob-content-only .ob-body {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    line-height: 1.7 !important;
  }
  .ob-screen.ob-ultra-content.ob-content-only .ob-ultra-note {
    font-family: var(--font-display), "Inter", system-ui, sans-serif !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    line-height: 1.7 !important;
  }
  .ob-wrap .ob-launch-submit {
    color: #f6f7f8 !important;
    -webkit-text-fill-color: #f6f7f8 !important;
  }
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-card {
    background: rgba(37, 37, 37, 0.04) !important;
    border: 1px solid rgba(37, 37, 37, 0.16) !important;
    border-left: 3px solid var(--ob-accent) !important;
    border-radius: 14px !important;
  }
  .ob-wrap[data-theme="light"] .ob-screen.ob-content-only.ob-screen-upper-bar .ob-upper-bar-demo {
    background: rgba(37, 37, 37, 0.04) !important;
    border: 1px solid rgba(37, 37, 37, 0.16) !important;
    border-left: 1px solid rgba(37, 37, 37, 0.16) !important;
    border-radius: 14px !important;
  }
  .ob-screen.ob-content-only.ob-screen-tab-guide .ob-tab-guide-icon {
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .ob-ext-nav { display:none; }
  .ob-en-btn { display:none; }
`;

const obDarkVars = `
  --ob-page-bg: radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%);
  --ob-orb1: radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,179,237,0.18) 0%, transparent 70%);
  --ob-orb2: radial-gradient(ellipse 50% 60% at 80% 70%, rgba(167,139,250,0.15) 0%, transparent 70%);
  --ob-orb3: radial-gradient(ellipse 40% 40% at 60% 10%, rgba(251,191,36,0.10) 0%, transparent 70%);
  --ob-text-head:#ffffff; --ob-text-body:rgba(255,255,255,0.78); --ob-text-sec:rgba(255,255,255,0.52); --ob-text-dim:rgba(255,255,255,0.38);
  --ob-accent:#FFBF65; --ob-accent-text:#0a0e1a; --ob-accent-dim:rgba(255,191,101,0.18); --ob-accent-glow:rgba(255,191,101,0.30);
  --ob-nav-bg:rgba(8,12,18,0.82); --ob-dot-bg:rgba(255,255,255,0.20);
`;
const obLightVars = `
  --ob-page-bg: linear-gradient(145deg, #dce6f0 0%, #e4ebf4 35%, #eaf0f7 70%, #f0f5fa 100%);
  --ob-orb1: radial-gradient(ellipse 65% 55% at 10% 15%, rgba(80,140,200,0.13) 0%, transparent 65%);
  --ob-orb2: radial-gradient(ellipse 55% 65% at 90% 75%, rgba(100,160,210,0.10) 0%, transparent 65%);
  --ob-orb3: radial-gradient(ellipse 50% 45% at 55% 5%,  rgba(140,180,220,0.08) 0%, transparent 65%);
  --ob-text-head:#1D1D1F; --ob-text-body:rgba(29,29,31,0.88); --ob-text-sec:rgba(29,29,31,0.68); --ob-text-dim:rgba(29,29,31,0.50);
  --ob-accent:#1a4f7a; --ob-accent-text:var(--axis-white); --ob-accent-btn-text:var(--axis-white); --ob-accent-dim:rgba(26,79,122,0.14); --ob-accent-glow:rgba(26,79,122,0.28);
  --ob-nav-bg:rgba(255,255,255,0.92); --ob-dot-bg:rgba(29,29,31,0.22);
`;

// Main app backgrounds (dark/light) — same as public_web/index.html MAIN_APP_BG
const MAIN_APP_BG = {
  dark: "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)",
  light: "linear-gradient(145deg, #dce6f0 0%, #e4ebf4 35%, #eaf0f7 70%, #f0f5fa 100%)",
};

// Brand logo PNGs — default LIGHT.png (white on dark). DARK.png only when user toggles to Light Mode on Appearance.
const AXIS_LOGO_LIGHT = "./AXIS_LOGO_LIGHT.png";
const AXIS_LOGO_DARK = "./AXIS_LOGO_DARK.png"; // Used only if obTheme === "light" (e.g. logo on light bg)

// Onboarding intro (screens 0–4) — uses deep navy shell; color blooms in at Appearance
const OB_GREY = {
  dark: {
    // Same orb recipe as index.html [data-theme="dark"]
    bg: MAIN_APP_BG.dark,
    orb1: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,179,237,0.18) 0%, transparent 70%)",
    orb2: "radial-gradient(ellipse 50% 60% at 80% 70%, rgba(167,139,250,0.15) 0%, transparent 70%)",
    orb3: "radial-gradient(ellipse 40% 40% at 60% 10%, rgba(251,191,36,0.10) 0%, transparent 70%)",
    accent: "#9ca3af", accentDim: "rgba(156,163,175,0.2)", accentGlow: "rgba(156,163,175,0.15)",
    accentBtnText: "#0f0f12", textPrimary: "#ffffff", tabBg: "rgba(8,12,18,0.82)",
  },
  light: {
    bg: MAIN_APP_BG.light,
    orb1: "radial-gradient(ellipse 65% 55% at 10% 15%, rgba(0,0,0,0.03) 0%, transparent 65%)",
    orb2: "radial-gradient(ellipse 55% 65% at 90% 75%, rgba(0,0,0,0.02) 0%, transparent 65%)",
    orb3: "radial-gradient(ellipse 50% 45% at 55% 5%, rgba(0,0,0,0.02) 0%, transparent 65%)",
    accent: "#4b5563", accentDim: "rgba(75,85,99,0.18)", accentGlow: "rgba(75,85,99,0.2)",
    accentBtnText: "var(--axis-white)", textPrimary: "#111827", tabBg: "rgba(243,244,246,0.92)",
  },
};

const MOODS = [
  {
    id: "rise",
    label: "Rise",
    time: "5–11am",
    desc: "Warm amber. Morning energy.",
    accent: "#C85A00",
    icon: "◐",
    bg: "radial-gradient(ellipse at 30% 20%, rgba(232,160,69,0.12) 0%, transparent 60%)",
  },
  {
    id: "midday",
    label: "Midday",
    time: "11am–5pm",
    desc: "Cool mint. Crisp and focused.",
    accent: "#007A6A",
    icon: "◎",
    bg: "radial-gradient(ellipse at 70% 20%, rgba(62,201,167,0.12) 0%, transparent 60%)",
  },
  {
    id: "prime",
    label: "Prime",
    time: "5–10pm",
    desc: "Deep blue. Winding down.",
    accent: "#1060C0",
    icon: "◑",
    bg: "radial-gradient(ellipse at 30% 80%, rgba(91,143,249,0.12) 0%, transparent 60%)",
  },
  {
    id: "rest",
    label: "Rest",
    time: "10pm–5am",
    desc: "Soft violet. Calm and dim.",
    accent: "#6030B0",
    icon: "✦",
    bg: "radial-gradient(ellipse at 70% 80%, rgba(155,109,255,0.12) 0%, transparent 60%)",
  },
];


function storageGet(key, def) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
}
function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/** Mirrors index.html axisActiveUidForStorage — scoped onboarding key must match main app gate. */
function axisOnboardingActiveUid() {
  try {
    if (typeof window !== "undefined" && window.AXIS_auth && window.AXIS_auth.currentUser && window.AXIS_auth.currentUser.uid) {
      return String(window.AXIS_auth.currentUser.uid);
    }
  } catch (e) {}
  try {
    if (typeof localStorage !== "undefined") {
      const c = localStorage.getItem("axis_auth_uid");
      if (c && String(c).trim()) return String(c).trim();
    }
  } catch (e) {}
  return "";
}

function getCircadianPeriod() {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return "dawn";
  if (h >= 11 && h < 17) return "midday";
  if (h >= 17 && h < 22) return "prime";
  return "rest";
}

const CIRCADIAN_THEMES = {
  // ── DAWN 5–11am — warm orange/amber, sunrise ──
  dawn: {
    dark: {
      // orb1: brightest part top-right so it doesn't wash out exercise copy (center/left)
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(255,135,55,0.72) 0%, transparent 70%)",
      // orb2: large orb bottom-left for balance and more organic spread
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(255,175,75,0.50) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(205,80,20,0.60) 0%, transparent 76%)",
      accent: "#FF8C35", accentDim: "rgba(255,140,53,0.25)", accentGlow: "rgba(255,140,53,0.55)",
      accentBtnText: "#1a0800",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#FFF0E0",
      tabBg: "rgba(7,9,18,0.94)",
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(255,120,40,0.26) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(255,165,70,0.20) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(220,120,30,0.18) 0%, transparent 76%)",
      accent: "#C85A00", accentDim: "rgba(200,90,0,0.18)", accentGlow: "rgba(200,90,0,0.38)",
      accentBtnText: "var(--axis-white)",
      bg: "linear-gradient(160deg, #ffe8c8 0%, #ffd4a0 35%, #ffbf78 70%, #ffd4a8 100%)",
      textPrimary: "#2a1200",
    },
  },
  // ── MIDDAY 11–5pm — mint/teal, crisp and clear ──
  midday: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(0,225,190,0.64) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(0,210,170,0.44) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(0,140,110,0.55) 0%, transparent 76%)",
      accent: "#00E8C0", accentDim: "rgba(0,232,192,0.20)", accentGlow: "rgba(0,232,192,0.52)",
      accentBtnText: "#001f1a",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#D0FFF5",
      tabBg: "rgba(0,8,4,0.88)",
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(0,210,175,0.30) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(0,195,155,0.22) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 115%, rgba(0,150,125,0.22) 0%, transparent 76%)",
      accent: "#007A6A", accentDim: "rgba(0,122,106,0.16)", accentGlow: "rgba(0,122,106,0.34)",
      accentBtnText: "var(--axis-white)",
      bg: "linear-gradient(160deg, #f0fffc 0%, #e0fff8 35%, #d0fff4 70%, #e8fff9 100%)",
      textPrimary: "#00261f",
    },
  },
  // ── PRIME 5–10pm — cool blue, winding down ──
  prime: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(40,120,255,0.56) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(70,160,255,0.42) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 118%, rgba(20,60,170,0.52) 0%, transparent 76%)",
      accent: "#4DA8FF", accentDim: "rgba(77,168,255,0.22)", accentGlow: "rgba(77,168,255,0.55)",
      accentBtnText: "#00102a",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#D8EEFF",
      tabBg: "rgba(0,6,14,0.88)",
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(40,120,230,0.28) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(70,160,230,0.22) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 118%, rgba(40,90,200,0.22) 0%, transparent 76%)",
      accent: "#1060C0", accentDim: "rgba(16,96,192,0.17)", accentGlow: "rgba(16,96,192,0.38)",
      accentBtnText: "var(--axis-white)",
      bg: "linear-gradient(160deg, #d8eeff 0%, #c0e0ff 35%, #a8d4ff 70%, #c8e8ff 100%)",
      textPrimary: "#001830",
    },
  },
  // ── REST 10–5am — deep purple/indigo, calm and dim ──
  rest: {
    dark: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(130,50,240,0.56) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(170,80,255,0.42) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 120%, rgba(90,40,180,0.52) 0%, transparent 76%)",
      accent: "#A060FF", accentDim: "rgba(160,96,255,0.22)", accentGlow: "rgba(160,96,255,0.52)",
      accentBtnText: "#0a0020",
      bg: MAIN_APP_BG.dark,
      textPrimary: "#E8D8FF",
      tabBg: "rgba(3,0,8,0.90)",
    },
    light: {
      orb1: "radial-gradient(ellipse 120% 120% at 88% 18%, rgba(120,40,220,0.26) 0%, transparent 70%)",
      orb2: "radial-gradient(ellipse 110% 110% at 5% 98%, rgba(150,70,230,0.20) 0%, transparent 72%)",
      orb3: "radial-gradient(ellipse 75% 75% at 50% 120%, rgba(90,40,180,0.20) 0%, transparent 76%)",
      accent: "#6030B0", accentDim: "rgba(96,48,176,0.18)", accentGlow: "rgba(96,48,176,0.38)",
      accentBtnText: "var(--axis-white)",
      bg: "linear-gradient(160deg, #ece0ff 0%, #ddd0ff 35%, #cec0ff 70%, #e0d4ff 100%)",
      textPrimary: "#180030",
    },
  },
};

function applyCircadianTheme(isDark, period) {
  const p = period || getCircadianPeriod();
  const t = CIRCADIAN_THEMES[p][isDark ? "dark" : "light"];
  let el = document.getElementById("circadian-style");
  if (!el) { el = document.createElement("style"); el.id = "circadian-style"; document.head.appendChild(el); }
  // Derive cue-bar, tab-bg, and accent-secondary from accent so they always match
  const accentSec = t.accent && t.accent.match(/^#[0-9a-fA-F]{6}$/) ? t.accent + "99" : (t.accentSecondary || t.accent);
  el.textContent = `
    [data-theme]:not([data-night="true"]) {
      --orb1: ${t.orb1} !important;
      --orb2: ${t.orb2} !important;
      --orb3: ${t.orb3} !important;
      --accent: ${t.accent} !important;
      --accent-secondary: ${accentSec} !important;
      --accent-dim: ${t.accentDim} !important;
      --accent-glow: ${t.accentGlow} !important;
      --cue-bar: ${t.accentDim.replace(/[\d.]+\)$/, "0.7)")} !important;
      --cue-bar-label: ${t.accentDim.replace(/[\d.]+\)$/, "0.9)")} !important;
      ${t.textPrimary ? `--text-white: ${t.textPrimary} !important;` : ""}
      ${t.accentBtnText ? `--accent-btn-text: ${t.accentBtnText} !important;` : ""}
      ${t.tabBg ? `--tab-bg: ${t.tabBg} !important;` : ""}
    }
    .app-orbs { transition: background 0.4s ease !important; }
  `;
  return { bg: t.bg };
}

function Onboarding({ theme, onComplete }) {
  const MOOD_AMBIENT_BG = {
    dawn: "radial-gradient(ellipse at 50% 0%, rgba(255, 191, 101, 0.24) 0%, rgba(255, 191, 101, 0.08) 34%, transparent 64%)",
    midday: "radial-gradient(ellipse at 50% 0%, rgba(86, 196, 170, 0.24) 0%, rgba(86, 196, 170, 0.08) 34%, transparent 64%)",
    prime: "radial-gradient(ellipse at 50% 0%, rgba(77, 168, 255, 0.24) 0%, rgba(77, 168, 255, 0.08) 34%, transparent 64%)",
    rest: "radial-gradient(ellipse at 50% 0%, rgba(160, 96, 255, 0.24) 0%, rgba(160, 96, 255, 0.08) 34%, transparent 64%)"
  };
  const AXIS_APP_ICON_BLANK = "data:image/svg+xml," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"180\" height=\"180\" viewBox=\"0 0 180 180\"><rect width=\"180\" height=\"180\" fill=\"#080d18\"/></svg>");
  const APP_ICON_OPTIONS = [
    { id: "wordmark", label: "Wordmark", src: "./axis-icon.png" },
    { id: "classic", label: "Classic", src: AXIS_APP_ICON_BLANK },
    { id: "light", label: "Light", src: AXIS_APP_ICON_BLANK },
    { id: "dark", label: "Dark", src: AXIS_APP_ICON_BLANK }
  ];
  const [cur, setCur] = useState(0);
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState(1);
  const total = 12; // Intro…Safety, Appearance, LIST & GUIDED, Lower Tab Menu, Upper Bar, Ultra, Launch
  const [disclaimerName, setDisclaimerName] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [disclaimerWarning, setDisclaimerWarning] = useState(false);
  const consentPersistedRef = useRef(false);
  const DOT_COUNT = 12;
  const todayStr = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const transitionTimerRef = useRef(null);
  const go = useCallback((n) => {
    const target = Math.max(0, Math.min(total - 1, n));
    if (target === cur) return;
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setDirection(target > cur ? 1 : -1);
    setVisible(false);
    transitionTimerRef.current = setTimeout(() => {
      setCur(target);
      setVisible(true);
      transitionTimerRef.current = null;
    }, 220);
  }, [cur, total]);
  // Live circadian — onboarding matches the app color at time of signup
  const [obPeriod, setObPeriod] = useState(null); // null = none selected; first mood user picks lights up
  const [obTheme, setObTheme] = useState(theme || "dark");
  const [obAutoTime, setObAutoTime] = useState(false); // false = user picks mood/color; true = set and forget (follow time of day)
  const [obReason, setObReason] = useState(null); // "tightness" | "stress" | "routine" for calibration / Start here
  const [obArea, setObArea] = useState(null); // back / neck / hips / knees / feet / general
  const [obTime, setObTime] = useState(null); // 5 | 10 | 15 | 20 (minutes) for calibration
  const [hasChosenMood, setHasChosenMood] = useState(false); // Grey until user picks a mood on Appearance
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedAppIcon, setSelectedAppIcon] = useState(() => {
    const fallback = "./axis-icon.png";
    const removedFive = { "./app-icons/icon-ultra.png": 1, "/app-icons/icon-ultra.png": 1, "./app-icons/icon-rise.png": 1, "/app-icons/icon-rise.png": 1, "./app-icons/icon-midday.png": 1, "/app-icons/icon-midday.png": 1, "./app-icons/icon-prime.png": 1, "/app-icons/icon-prime.png": 1, "./app-icons/icon-rest.png": 1, "/app-icons/icon-rest.png": 1 };
    try {
      const v = storageGet("axis_app_icon", fallback);
      if (!v) return fallback;
      if (removedFive[v]) return fallback;
      if (v === "./app-icons/icon-classic.png" || v === "/app-icons/icon-classic.png") return AXIS_APP_ICON_BLANK;
      if (v === "./app-icons/icon-light.png" || v === "/app-icons/icon-light.png") return AXIS_APP_ICON_BLANK;
      if (v === "./app-icons/icon-dark.png" || v === "/app-icons/icon-dark.png") return AXIS_APP_ICON_BLANK;
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  });
  const manifestBlobUrlRef = useRef(null);
  const iconColor = obTheme === "dark" ? "var(--axis-white)" : "var(--axis-black)";
  const periodForTheme = obAutoTime ? getCircadianPeriod() : (obPeriod ?? getCircadianPeriod());
  const ct = CIRCADIAN_THEMES[periodForTheme][obTheme === "dark" ? "dark" : "light"];
  const useGrey = cur < 6 || (cur === 6 && !hasChosenMood); // Navy until first mood choice on Appearance; then keep circadian (no timer snap back to grey)
  const t = useGrey
    ? OB_GREY[obTheme === "dark" ? "dark" : "light"]
    : { ...ct, bg: MAIN_APP_BG[obTheme === "dark" ? "dark" : "light"] };
  const selectedAccent = selectedMood && selectedMood.accent ? selectedMood.accent : "#6B7280";
  const selectedAccentDim = selectedMood && selectedMood.accentDim ? selectedMood.accentDim : "rgba(107,114,128,0.24)";
  const selectedAccentGlow = selectedMood && selectedMood.accentGlow ? selectedMood.accentGlow : "rgba(107,114,128,0.38)";
  const selectedAccentBtnText = selectedMood && selectedMood.accentBtnText ? selectedMood.accentBtnText : "#0d0f14";
  const vars = `
    --ob-page-bg: ${t.bg};
    --current-bg: ${t.bg};
    --ob-orb1: ${t.orb1};
    --ob-orb2: ${t.orb2};
    --ob-orb3: ${t.orb3};
    --ob-accent: ${selectedAccent};
    --mood-accent: ${selectedAccent};
    --ob-accent-dim: ${selectedAccentDim};
    --ob-accent-glow: ${selectedAccentGlow};
    --ob-accent-btn-text: ${selectedAccentBtnText};
    --ob-text-head: ${t.textPrimary || (obTheme === "dark" ? "#ffffff" : "var(--axis-black)")};
    --ob-text-body: ${obTheme === "dark" ? "rgba(255,255,255,0.78)" : "rgba(26,26,26,0.88)"};
    --ob-text-sec: ${obTheme === "dark" ? "rgba(255,255,255,0.52)" : "rgba(26,26,26,0.72)"};
    --ob-text-dim: ${obTheme === "dark" ? "rgba(255,255,255,0.38)" : "rgba(26,26,26,0.55)"};
    --ob-dot-bg: ${obTheme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(15,30,46,0.18)"};
    --ob-nav-bg: ${cur === 10 ? "#000000" : (t.tabBg || (obTheme === "dark" ? "rgba(8,12,18,0.82)" : "rgba(255,255,255,0.80)"))};
    --ob-box-bg: ${obTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
    --ob-box-border: ${obTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
    --mood-color: ${selectedAccent};
    --font-ui: "Inter", system-ui, -apple-system, sans-serif;
    --font-display: "Inter", system-ui, -apple-system, sans-serif;
    --font-data: "Roboto Mono", ui-monospace, "SF Mono", "SFMono-Regular", Menlo, monospace;
    --font-meta: "Roboto Mono", ui-monospace, "SF Mono", "SFMono-Regular", Menlo, monospace;
  `.replace(/\n\s*/g, ' ');
  /* Light Appearance: shared surface for Dark/Light/AUTO/mood rows (reads off pale gradient) */
  const obDotInactive = obTheme === "light" ? "rgba(29, 29, 31, 0.22)" : "rgba(255, 255, 255, 0.2)";
  const AUTO_MOOD_LABELS = { dawn: "Auto: Rise", midday: "Auto: Midday", prime: "Auto: Prime", rest: "Auto: Rest" };

  const obShellRef = useRef(null);
  const applySelectedAppIcon = async (iconHref) => {
    if (typeof document === "undefined" || !iconHref) return;
    const upsertLink = (selector, rel, href, type) => {
      let link = document.querySelector(selector);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      if (type) link.setAttribute("type", type);
      link.setAttribute("href", href);
    };
    upsertLink("link[rel='apple-touch-icon']", "apple-touch-icon", iconHref);
    const raw = String(iconHref);
    const base = raw.split("?")[0].split("#")[0];
    var favHref = raw;
    var favType = "image/png";
    if (/axis-icon\.png$/i.test(base)) {
      favHref = raw.replace(/axis-icon\.png/i, "axis-icon.svg");
      favType = "image/svg+xml";
    } else if (/^data:image\/svg\+xml/i.test(raw)) {
      favHref = raw;
      favType = "image/svg+xml";
    }
    upsertLink("link[rel='icon']", "icon", favHref, favType);

    const manifestLink = document.querySelector("link[rel='manifest']");
    if (!manifestLink) return;
    const manifestHref = manifestLink.getAttribute("href");
    if (!manifestHref) return;
    try {
      const manifestUrl = new URL(manifestHref, window.location.href).href;
      const res = await fetch(manifestUrl, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const next = { ...json };
      if (Array.isArray(next.icons) && next.icons.length > 0) {
        next.icons = next.icons.map((icon) => ({ ...icon, src: iconHref }));
      } else {
        next.icons = [{ src: iconHref, sizes: "192x192", type: "image/png" }, { src: iconHref, sizes: "512x512", type: "image/png" }];
      }
      const blob = new Blob([JSON.stringify(next)], { type: "application/json" });
      const blobUrl = URL.createObjectURL(blob);
      if (manifestBlobUrlRef.current) URL.revokeObjectURL(manifestBlobUrlRef.current);
      manifestBlobUrlRef.current = blobUrl;
      manifestLink.setAttribute("href", blobUrl);
    } catch (e) {}
  };

  useEffect(() => {
    storageSet("axis_app_icon", selectedAppIcon);
    void applySelectedAppIcon(selectedAppIcon);
  }, [selectedAppIcon]);

  useEffect(() => () => {
    if (manifestBlobUrlRef.current) URL.revokeObjectURL(manifestBlobUrlRef.current);
  }, []);
  useEffect(() => () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
  }, []);

  useLayoutEffect(() => {
    const reset = () => {
      if (obShellRef.current) obShellRef.current.scrollTop = 0;
      const screen = obShellRef.current?.querySelector('.ob-screen');
      if (screen) screen.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    reset();
    requestAnimationFrame(reset);
  }, [cur]);

  /* Same as main app: paint MAIN_APP_BG / circadian base on document so shell matches Home (body + orbs are layered like .app + .app-orbs). Ultra slide uses pure black so no navy peeks under the sheet or footer. */
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const bg = cur === 10 ? "#000000" : t.bg;
    try {
      document.documentElement.style.setProperty("--bg-app", bg);
      document.body.style.transition = "background var(--motion-slow, 800ms ease-in-out)";
      document.body.style.background = bg;
      document.documentElement.style.background = bg;
    } catch (e) {}
    return () => {
      try {
        document.body.style.background = "";
        document.body.style.removeProperty("transition");
        document.documentElement.style.background = "";
        document.documentElement.style.removeProperty("--bg-app");
      } catch (e) {}
    };
  }, [t.bg, obTheme, cur]);

  /* Background save to Supabase once name + disclaimer are complete (check box and/or before Accept). Does not navigate. */
  useEffect(() => {
    if (cur !== 5) return;
    const name = disclaimerName.trim();
    if (!name || !disclaimerChecked || consentPersistedRef.current) return;
    consentPersistedRef.current = true;
    const record = { name, date: new Date().toISOString().split("T")[0], timestamp: new Date().toISOString(), accepted: true };
    try { localStorage.setItem("axis_disclaimer", JSON.stringify(record)); } catch (e) {}
    void save_consent({ name, consent: true });
  }, [cur, disclaimerName, disclaimerChecked]);

  const doSafetyNext = () => {
    if (!disclaimerName.trim() || !disclaimerChecked) { setDisclaimerWarning(true); return; }
    const record = { name: disclaimerName.trim(), date: new Date().toISOString().split("T")[0], timestamp: new Date().toISOString(), accepted: true };
    try { localStorage.setItem("axis_disclaimer", JSON.stringify(record)); } catch(e) {}
    go(6);
  };

  const doLaunch = () => {
    const selectedMoodPeriod = selectedMood && selectedMood.id ? mapMoodIdToPeriod(selectedMood.id) : null;
    const launchPeriod = obAutoTime ? null : (obPeriod ?? selectedMoodPeriod ?? getCircadianPeriod());
    storageSet("axis_period", launchPeriod);
    try {
      if (obAutoTime) localStorage.setItem("selectedMood", "auto");
      else if (launchPeriod) localStorage.setItem("selectedMood", launchPeriod);
    } catch (e) {}
    storageSet("axis_theme", obTheme);
    storageSet("axis_onboarded", true);
    try {
      const uid = axisOnboardingActiveUid();
      if (uid) storageSet("axis_onboarded:" + uid, true);
    } catch (e) {}
    try { localStorage.setItem("hasCompletedOnboarding", "true"); } catch (e) {}
    onComplete({ period: launchPeriod || getCircadianPeriod(), theme: obTheme });
    try {
      sessionStorage.setItem("axis_ob_visual_handoff", "1");
      sessionStorage.setItem("axis_boot_home", "1");
    } catch (e) {}
    const el = typeof document !== "undefined" ? (document.querySelector(".ob-wrap") || document.body) : null;
    if (el) {
      el.style.transition = "opacity 300ms ease";
      el.style.opacity = "0";
    }
    window.setTimeout(() => {
      try {
        const base = "./index.html";
        const url = typeof window.location !== "undefined" && window.location.pathname ? new URL(base, window.location.href).href : base;
        window.location.href = url;
      } catch (e2) {
        window.location.href = "./index.html";
      }
    }, 300);
  };
  const goTo = (i) => go(i);
  const currentSlide = cur;
  const TOTAL_SLIDES = DOT_COUNT;
  const accent = selectedMood ? selectedMood.accent : "#6B7280";
  const mapMoodIdToPeriod = (id) => id === "rise" ? "dawn" : id;
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "255, 255, 255";
  }

  function NavBtn({ onClick, disabled, accent, label, filled }) {
    const isLight = obTheme === "light";
    const baseBorder = isLight ? "1px solid rgba(37,37,37,0.18)" : "1px solid rgba(255,255,255,0.1)";
    const baseBg = isLight ? "rgba(37,37,37,0.06)" : "rgba(255,255,255,0.06)";
    const disabledBg = isLight ? "rgba(37,37,37,0.05)" : "rgba(255,255,255,0.04)";
    const disabledFg = isLight ? "rgba(37,37,37,0.35)" : "rgba(255,255,255,0.2)";
    const textFg = isLight ? "#252525" : "#fff";
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: baseBorder,
          background: disabled
            ? disabledBg
            : baseBg,
          color: disabled ? disabledFg : textFg,
          fontSize: 22,
          fontWeight: 300,
          cursor: disabled ? "default" : "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
          flexShrink: 0
        }}
      >
        {label}
      </button>
    );
  }

  function SlideShell({ children, className = "" }) {
    return (
      <div className={`ob-screen ob-content-only ${className}`.trim()}>
        <div className="ob-screen-body" style={{ position: "relative", zIndex: 10 }}>
          <div className="ob-pad">{children}</div>
        </div>
      </div>
    );
  }

  function Tag({ children, accent }) {
    return (
      <div
        className="ob-slide-tag"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: accent || "rgba(255,255,255,0.35)",
          marginBottom: 10,
          transition: "color 0.4s ease"
        }}
      >
        {children}
      </div>
    );
  }

  function Headline({ children }) {
    return <div className="ob-heading">{children}</div>;
  }

  function Body({ children }) {
    return <div className="ob-body" style={{ marginBottom: 18 }}>{children}</div>;
  }

  function MoodSelectSlide({ accent, selectedMood, onSelect, obAutoTime, setObAutoTime, obTheme, setObTheme }) {
    const nowPeriod = getCircadianPeriod();
    const isLight = obTheme === "light";
    const moodCopyPrimary = obTheme === "light" ? "#252525" : "#fff";
    const moodCopySecondary = obTheme === "light" ? "#252525" : "rgba(255,255,255,0.45)";
    const moodCopyMeta = obTheme === "light" ? "#252525" : "rgba(255,255,255,0.3)";
    const moodIcon = (id, color) => {
      if (id === "rise") {
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16 A 8 8 0 0 1 20 16" /><line x1="0" y1="16" x2="24" y2="16" /></svg>;
      }
      if (id === "midday") {
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" /></svg>;
      }
      if (id === "prime") {
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
      }
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 5.5 6 .5-4.5 4 1.5 5.5L12 16l-4.5 2 1.5-5.5-4.5-4 6-.5L12 3z" /></svg>;
    };
    return (
      <SlideShell className="ob-screen-appearance">
        <Tag accent={accent}>APPEARANCE</Tag>
        <Headline>Pick your Mood.</Headline>
        <Body>
          AXIS shifts its color with the time of day - or lock it to match how
          you feel right now. Pick one to preview it through the rest of onboarding.
        </Body>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: isLight ? "rgba(37,37,37,0.04)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(37,37,37,0.16)" : "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: moodCopyPrimary }}>Auto</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: moodCopySecondary }}>{obAutoTime ? "Follows time of day" : "Lock to a mood"}</div>
          </div>
          <button
            type="button"
            onClick={() => setObAutoTime((v) => !v)}
            style={{
              flexShrink: 0,
              width: 44,
              height: 26,
              border: "1px solid",
              borderColor: obAutoTime ? accent : (isLight ? "rgba(37,37,37,0.2)" : "rgba(255,255,255,0.14)"),
              borderRadius: 13,
              background: obAutoTime ? accent : (isLight ? "rgba(37,37,37,0.08)" : "rgba(255,255,255,0.06)"),
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
              boxSizing: "border-box"
            }}
            aria-label={obAutoTime ? "Turn off automatic mood" : "Turn on automatic mood"}
          >
            <span style={{ position: "absolute", top: 3, left: obAutoTime ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "var(--ob-text-sec)", marginBottom: 8 }}>BASE THEME</div>
          <div style={{ display: "flex", gap: 6, padding: 3, border: isLight ? "1px solid rgba(37,37,37,0.16)" : "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
            {[{ val: "dark", label: "Dark" }, { val: "light", label: "Light" }].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setObTheme(val)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background: obTheme === val ? "color-mix(in srgb, var(--ob-accent) 16%, transparent)" : "transparent",
                  color: obTheme === val ? "var(--ob-accent)" : "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}
              >{label}</button>
            ))}
          </div>
        </div>
        {MOODS.map((m) => {
          const active = obAutoTime ? mapMoodIdToPeriod(m.id) === nowPeriod : (selectedMood && selectedMood.id === m.id);
          return (
            <div
              key={m.id}
              onClick={() => { if (obAutoTime) return; onSelect(m); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 14,
                border: active
                  ? `1.5px solid ${m.accent}`
                  : (isLight ? "1px solid rgba(37,37,37,0.16)" : "1px solid rgba(255,255,255,0.08)"),
                background: active
                  ? `rgba(${hexToRgb(m.accent)}, 0.1)`
                  : (isLight ? "rgba(37,37,37,0.04)" : "rgba(255,255,255,0.04)"),
                cursor: obAutoTime ? "default" : "pointer",
                transition: "all 0.25s ease",
                marginBottom: 10,
                pointerEvents: obAutoTime ? "none" : "auto"
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: `rgba(${hexToRgb(m.accent)}, 0.15)`,
                  border: `1.5px solid ${m.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: m.accent,
                  flexShrink: 0
                }}
              >
                {moodIcon(m.id, m.accent)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: moodCopyPrimary }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: 12, color: moodCopyMeta }}>
                    {m.time}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 400, color: moodCopySecondary, marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>
              {active && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: m.accent,
                    flexShrink: 0
                  }}
                />
              )}
            </div>
          );
        })}
      </SlideShell>
    );
  }

  function ModeCard({ accent, label, desc }) {
    const isLight = obTheme === "light";
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: 14,
          border: isLight ? "1px solid rgba(37,37,37,0.16)" : `1px solid ${accent}55`,
          background: isLight ? "rgba(37,37,37,0.04)" : `rgba(${hexToRgb(accent)}, 0.05)`,
          borderLeft: `3px solid ${accent}`,
          marginBottom: 10
        }}
      >
        <div className="ob-mode-card-label" style={{ marginBottom: 6 }}>
          {label}
        </div>
        <div className="ob-mode-card-desc">
          {desc}
        </div>
      </div>
    );
  }

  return (
    <div className="ob-wrap" data-theme={obTheme} style={{ background: cur === 10 ? "#000000" : t.bg, color: obTheme === "dark" ? "var(--axis-white)" : "var(--axis-black)", transition: "background 0.45s ease, color 0.45s ease" }}>
      <style>{obCss}{`:root,body,[data-ob]{${vars}}.ob-wrap{${vars}}`}</style>
      <div className="ob-orbs-layer" style={{
        background:`${t.orb1}, ${t.orb2}, ${t.orb3}`,
        transition: "background var(--motion-slow, 800ms ease-in-out), opacity 0.35s ease",
        opacity: cur === 10 ? 0 : obTheme === "light" ? 0.38 : 0.15
      }} />
      <div
        ref={obShellRef}
        className="ob-shell"
        style={{ position: "relative" }}
        onClick={e => { if (cur === 0 || cur === 5 || cur === 6 || cur === 10) return; if (!e.target.closest("button") && !e.target.closest("input") && !e.target.closest(".ob-disclaimer-check")) go(cur + 1); }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: selectedMood && selectedMood.bg ? selectedMood.bg : "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)",
            transition: "background 0.8s ease, opacity 0.35s ease",
            opacity: cur === 10 ? 0 : 1,
            pointerEvents: "none",
            zIndex: 0
          }}
        />
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : `translateX(${direction * 24}px)`,
            transition: "opacity 0.22s ease, transform 0.22s ease",
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%"
          }}
        >
        {cur === 0 && (
          <div className="ob-screen ob-intro-hero" style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 14px)",
              right: 18,
              fontFamily: 'var(--font-meta), "Roboto Mono", ui-monospace, monospace',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ob-text-sec)",
              opacity: 0.72,
            }}>OB-mp4ea8nk</div>
            <div className="ob-intro-hero__inner">
              <h1 className="ob-intro-hero__wordmark">AXIS</h1>
              <p className="ob-intro-hero__sub">X MOVE X MEND X MAINTAIN X</p>
              <span className="ob-intro-hero__accent-bar" aria-hidden="true" />
              <p className="ob-intro-hero__body">Personalized mobility for exactly<br />where you are right now.</p>
            </div>
          </div>
        )}

          {/* 2: THE PERSPECTIVE — no logo */}
          {cur === 1 && <div className="ob-screen ob-content-only ob-screen-perspective">
            <div className="ob-screen-body">
              <div className="ob-pad">
                <div className="ob-eyebrow">The Perspective</div>
                <div className="ob-heading">Modern life beats up your body.</div>
                <div className="ob-body" style={{marginBottom:16}}>
                  Screens, desks, and stress are just some of the things that contribute to back pain and "tech neck." AXIS is your reset button.
                </div>
                <div className="ob-sci-blocks ob-sci-blocks--perspective-stats">
                  <div className="ob-sci"><div className="ob-sci-text">80% of us get back pain.</div></div>
                  <div className="ob-sci"><div className="ob-sci-text">70% of desk workers fight neck tension.</div></div>
                  <div className="ob-sci"><div className="ob-sci-text">100% feel better moving smarter.</div></div>
                </div>
              </div>
            </div>
          </div>}

          {/* 3: THE FOUNDATION */}
          {cur === 2 && <div className="ob-screen ob-content-only ob-screen-foundation">
            <div className="ob-screen-body">
              <div className="ob-pad">
                <div className="ob-eyebrow">The Foundation</div>
                <div className="ob-heading">Movement equals medicine.</div>
                <div className="ob-body" style={{ marginBottom: 0 }}>
                  AXIS isn't a workout. It's a nervous system reboot with research-backed moves that dial down pain and wake up your core.
                </div>
                <div className="ob-sci-blocks ob-sci-blocks--foundation-callout">
                  <div className="ob-sci">
                    <div className="ob-sci-text">Show up and move. Your body does the rest.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* 4: THE SCIENCE + THE METHOD */}
          {cur === 3 && <div className="ob-screen ob-content-only">
            <div className="ob-screen-body">
              <div className="ob-pad">
                <div className="ob-eyebrow">The Science</div>
                <div className="ob-heading">Motion is needed for your body to repair.</div>
                <div className="ob-body" style={{ marginBottom: 0 }}>
                  Exercise therapy beats pills and passive fixes for chronic pain.
                </div>
                <div className="ob-eyebrow">The Method</div>
                <div className="ob-heading">One session. Total reset.</div>
                <div className="ob-body" style={{ marginBottom: 0 }}>
                  8 minute morning boost or evening deep release. AXIS fits your day. We handle the cues so you can stay in the flow.
                </div>
              </div>
            </div>
          </div>}

          {/* 5: THE ETHICS */}
          {cur === 4 && <div className="ob-screen ob-content-only">
            <div className="ob-screen-body">
              <div className="ob-pad">
              <div className="ob-eyebrow">The Ethics</div>
              <div className="ob-heading">Your data is your data.</div>
              <div className="ob-body" style={{marginBottom:28}}>
                We only ask you to sign a medical disclaimer and create an account. We don&apos;t ask for your age. We don&apos;t ask for your weight. Your info is your info. We only take what&apos;s necessary. No tracking. No BS. Your data stays on your device.
              </div>
              </div>
            </div>
          </div>}

          {/* 6: THE SAFETY + MEDICAL DISCLAIMER */}
          {cur === 5 && <div className="ob-screen ob-cta-screen ob-safety-navy ob-content-only">
            <div className="ob-screen-body">
              <div className="ob-pad">
              <div className="ob-eyebrow">The Safety</div>
              <div className="ob-heading">A note on your safety.</div>
              <div className="ob-body" style={{ marginBottom: 16 }}>
                AXIS provides movement guidance for general wellness. We are a supportive partner, not a substitute for medical advice. Listen to your body and stop if something hurts.
              </div>
              <div className="ob-sci-blocks" style={{marginBottom:28}}>
                <div className="ob-sci">
                  <div className="ob-sci-text">By continuing, you are taking responsibility for your journey. Let's move.</div>
                </div>
              </div>

              <div className="ob-eyebrow">Medical Disclaimer</div>
              <div className="ob-content-card ob-content-legalese" style={{ marginBottom: 24 }}>
                AXIS provides movement guidance for general wellness purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. The exercises and routines in this app are not designed to treat any medical condition.
                <br/><br/>
                If you have any injury, chronic pain, cardiovascular condition, or other health concern, consult a qualified healthcare professional before beginning any exercise program. Stop immediately and seek medical attention if you experience pain, dizziness, shortness of breath, or discomfort during any movement.
                <br/><br/>
                By continuing, you acknowledge that you are participating voluntarily and assume full responsibility for your use of this app.
              </div>

              <div style={{width:"100%", marginBottom:20}}>
                <div className="ob-ts-label">Your Name</div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={disclaimerName}
                  onChange={e => { setDisclaimerName(e.target.value); setDisclaimerWarning(false); }}
                  style={{
                    width:"100%", padding:"12px 16px", borderRadius:12, fontSize:15,
                    fontFamily:"var(--font-ui),system-ui,sans-serif", fontWeight:400,
                    background:"var(--ob-box-bg)", border: disclaimerWarning && !disclaimerName ? "1.5px solid rgba(255,100,100,0.7)" : "1px solid var(--ob-box-border)",
                    color:"var(--ob-text-head)", outline:"none", boxSizing:"border-box",
                    WebkitAppearance:"none",
                  }}
                />
              </div>

              <div style={{width:"100%", marginBottom:24}}>
                <div className="ob-ts-label">Date</div>
                <div style={{
                  padding:"12px 16px", borderRadius:12, fontSize:15,
                  fontFamily:"var(--font-ui),system-ui,sans-serif", fontWeight:400,
                  background:"var(--ob-box-bg)", border:"1px solid var(--ob-box-border)",
                  color:"var(--ob-text-sec)",
                }}>{todayStr}</div>
              </div>

              <div
                className="ob-disclaimer-check"
                onClick={() => { setDisclaimerChecked(c => !c); setDisclaimerWarning(false); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDisclaimerChecked(c => !c); setDisclaimerWarning(false); } }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  marginBottom: 28,
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{
                  flexShrink:0, width:22, height:22, borderRadius:6, marginTop:1,
                  border: disclaimerWarning && !disclaimerChecked ? "1.5px solid rgba(255,100,100,0.7)" : "1.5px solid var(--ob-box-border)",
                  background: disclaimerChecked ? "var(--ob-accent)" : "var(--ob-box-bg)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.18s",
                }}>
                  {disclaimerChecked && <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="#0a0e1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </div>
                <div className="ob-body ob-disclaimer-check__label" style={{ lineHeight: 1.45, flex: "1 1 0", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
                  I have read and understand the disclaimer above. I confirm I am using this app at my own risk and will consult a healthcare professional if I have any concerns.
                </div>
              </div>

              {disclaimerWarning && (
                <div style={{
                  width:"100%", marginBottom:16, padding:"10px 14px", borderRadius:10,
                  background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,80,80,0.25)",
                  fontSize:12, color:"rgba(255,160,160,0.9)", lineHeight:1.5,
                }}>
                  {!disclaimerName && !disclaimerChecked
                    ? "Please enter your name and check the box to continue."
                    : !disclaimerName
                    ? "Please enter your name to continue."
                    : "Please check the box to confirm you've read the disclaimer."}
                </div>
              )}
              </div>
            </div>
          </div>}

          {/* 7: APPEARANCE — interactive mood selector */}
          {cur === 6 && (
            <MoodSelectSlide
              accent={accent}
              selectedMood={selectedMood}
              obAutoTime={obAutoTime}
              setObAutoTime={setObAutoTime}
              obTheme={obTheme}
              setObTheme={setObTheme}
              onSelect={(m) => {
                setSelectedMood(m);
                setHasChosenMood(true);
                setObAutoTime(false);
                setObPeriod(mapMoodIdToPeriod(m.id));
              }}
            />
          )}

          {/* 11: ULTRA MODE */}
          {cur === 10 && <div className="ob-screen ob-content-only ob-ultra-content" style={{ background: "#000000", color: "#FF3B30" }}>
            <div className="ob-screen-body" style={{ position: "relative", zIndex: 10 }}>
              <div className="ob-pad">
                <div className="ob-eyebrow">Ultra Mode</div>
                <div className="ob-heading">Protect your night vision.</div>
                <div className="ob-body" style={{ marginBottom:22 }}>
                  Ultra Mode uses a pure black canvas with vibrant red accents so your eyes stay adapted in low light.
                </div>
                <div className="ob-ultra-note">
                  Best for late-night sessions when you want to minimize glare, reduce eye fatigue, and keep your surroundings visible.
                </div>
                <div className="ob-body" style={{ marginTop:12 }}>
                  Enable this option from System, then Mood.
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                  <svg className="ob-ultra-eye-mark" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>}

          {/* 8: LIST & GUIDED — session modes */}
          {cur === 7 && <div className="ob-screen ob-content-only ob-screen-session-modes">
            <div className="ob-screen-body" style={{ position: "relative", zIndex: 10 }}>
              <div className="ob-pad">
                <Tag accent={accent}>SESSION MODES</Tag>
                <div className="ob-heading">LIST vs GUIDED</div>
                <div className="ob-body" style={{ marginBottom: 22 }}>
                  On the sessions tab you pick how you want to move—browse on your own, or follow a timed flow.
                </div>
                <div className="ob-mode-cards">
                  <ModeCard
                    accent={accent}
                    label="LIST"
                    desc="Self-paced. Scroll the exercise list, set each move (e.g. 30-60s), skip freely, and control your own pace-great when you want flexibility or a quick pick-up."
                  />
                  <ModeCard
                    accent={accent}
                    label="GUIDED"
                    desc="Hands-free. Auto-timed. Rest for :15 between moves."
                  />
                </div>
                <div className="ob-body" style={{ marginTop: 18 }}>
                  Switch LIST / GUIDED from the session header whenever you like.
                </div>
              </div>
            </div>
          </div>}

          {/* 9: KNOW EVERY TAB */}
          {cur === 8 && <div className="ob-screen ob-content-only ob-screen-tab-guide">
            <div className="ob-screen-body" style={{ position: "relative", zIndex: 10 }}>
              <div className="ob-pad">
                <div className="ob-eyebrow" style={{ color: obTheme === "light" ? "#252525" : undefined }}>The Lower Tab Menu</div>
                <div className="ob-heading" style={{ color: obTheme === "light" ? "#252525" : undefined }}>What each tab does.</div>
                <div className="ob-body" style={{ marginBottom:22, color: obTheme === "light" ? "#252525" : undefined }}>
                  Same five tabs as the main app (left to right):
                </div>
                <div className="ob-tab-guide-list">
                  {[
                    ["HOME", "Your main library and daily suggestions that change based on the time of day and what you're doing.", <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V9L12 2l9 7v13h-6v-10H9v10H3z" /></svg>],
                    ["BOOKMARKS", "Everything you've saved, from full routines down to the specific exercises you like most.", <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3.5h11c.83 0 1.5.67 1.5 1.5v15.28l-7-5.42-7 5.42V5c0-.83.67-1.5 1.5-1.5Z" /></svg>],
                    ["TIMER", "Simple timers for breathing or your own workouts—use these to de-stress, focus, or just cool down.", <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 7.5 L12 12 L17 12" /></svg>],
                    ["METRICS", "A quick look at how you're doing this week and notes on your recent sessions.", <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12.5 11 15.5 16.5 9" /></svg>],
                    ["SYSTEM", "The spot to tweak your theme, mood, and how the app feels, plus all your other settings.", <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="0.75" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="0.75" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="0.75" /><rect x="14" y="14" width="6.5" height="6.5" rx="0.75" /></svg>],
                  ].map(([label, body, icon]) => (
                    <div
                      key={label}
                      className="ob-tab-guide-card"
                      style={{
                        padding: "16px",
                        borderRadius: 14,
                        border: obTheme === "light" ? "1px solid rgba(37,37,37,0.16)" : `1px solid ${accent}55`,
                        background: obTheme === "light" ? "rgba(37,37,37,0.04)" : `rgba(${hexToRgb(accent)}, 0.05)`,
                        borderLeft: `3px solid ${accent}`,
                        marginBottom: 10,
                        alignItems: "flex-start",
                        gap: 12
                      }}
                    >
                      <div
                        className="ob-tab-guide-icon"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: accent,
                          transition: "all 0.4s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >{icon}</div>
                      <span className="ob-tab-guide-divider" aria-hidden="true" style={{ background: obTheme === "light" ? "rgba(37,37,37,0.22)" : "rgba(255,255,255,0.16)" }} />
                      <div style={{ minWidth:0, flex:1 }}>
                        <div className="ob-tab-guide-title" style={{ color: obTheme === "light" ? "#252525" : undefined }}>{label}</div>
                        <div className="ob-tab-guide-desc" style={{ color: obTheme === "light" ? "#252525" : undefined }}>{body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>}

          {/* 10: THE UPPER BAR */}
          {cur === 9 && <div className="ob-screen ob-content-only ob-screen-upper-bar">
            <div className="ob-screen-body" style={{ position: "relative", zIndex: 10 }}>
              <div className="ob-pad">
                <div className="ob-eyebrow" style={{ color: obTheme === "light" ? "#252525" : undefined }}>The Upper Bar</div>
                <div className="ob-heading" style={{ color: obTheme === "light" ? "#252525" : undefined }}>Your daily snapshot.</div>
                <div className="ob-body" style={{ marginBottom: 18, color: obTheme === "light" ? "#252525" : undefined }}>
                  The bar stays at the top everywhere in the app. The pill on the left is your progress toward today&apos;s movement goal. The seven squares on the right are the last seven days—lit when you logged a workout that day.
                </div>
                <div
                  className="ob-upper-bar-demo"
                  aria-hidden="true"
                  style={{
                    padding: "16px",
                    borderRadius: 14,
                    border: obTheme === "light" ? "1px solid rgba(37,37,37,0.16)" : `1px solid ${accent}55`,
                    background: obTheme === "light" ? "rgba(37,37,37,0.04)" : `rgba(${hexToRgb(accent)}, 0.05)`,
                    borderLeft: `3px solid ${accent}`
                  }}
                >
                  <div className="ob-upper-bar-demo__row">
                    <div className="ob-upper-bar-demo__progress-track">
                      <div className="ob-upper-bar-demo__progress-fill" />
                    </div>
                    <div className="ob-upper-bar-demo__brand">AXIS</div>
                    <div className="ob-upper-bar-demo__streak">
                      {[true, true, true, false, true, false, false].map((on, i) => (
                        <span key={i} className={"ob-upper-bar-demo__cell" + (on ? " ob-upper-bar-demo__cell--on" : "")} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* 12: LAUNCH */}
          {cur === 11 && (
            <div className="ob-screen ob-cta-screen ob-launch-screen ob-content-only" style={{ color: "var(--ob-text-head)", transition: "color 0.6s ease" }}>
              <div className="ob-screen-body">
                <div className="ob-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                  <h1 className="ob-launch-wordmark">AXIS</h1>
                  <p className="ob-launch-headline">You&apos;re ready.</p>
                  <p className="ob-launch-support">Pick a track and start feeling better.</p>
                  <button
                    type="button"
                    className="ob-launch-submit"
                    onClick={doLaunch}
                    style={{
                      width: "100%",
                      marginTop: 28,
                      padding: "18px 0",
                      borderRadius: 16,
                      border: "none",
                      background: accent,
                      color: "#f6f7f8",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background 0.4s ease"
                    }}
                  >
                    LET&apos;S GO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="ob-ext-nav">
        {["Intro","Perspective","Foundation","Science · Method","Ethics","Safety","Appearance","LIST & GUIDED","The Lower Tab Menu","The Upper Bar","Ultra Mode","Launch"].map((l, i) => (
          <button key={l} className="ob-en-btn" onClick={() => go(i)}>{l}</button>
        ))}
        <button className="ob-en-btn" style={{ borderColor: "#FFBF65", color: "#FFBF65" }} onClick={() => go(11)}>→ Launch Screen</button>
      </div>
      <div className="ob-label">Tap screen or use controls · Begin buttons launch the app</div>
      {/* Fixed footer — pointer-events: none; buttons have pointer-events: auto */}
      <div
        className="ob-nav-footer"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, width: 'auto',
          minHeight: 100, height: 'auto',
          paddingBottom: 'var(--axis-safe-bottom)', paddingTop: 10, paddingLeft: 24, paddingRight: 24,
          zIndex: 1000, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', boxSizing: 'border-box',
          gap: 0,
          backdropFilter: 'blur(18px) saturate(1.15)', WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
          background: 'var(--ob-nav-bg)',
          borderTop: obTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          transition: 'background 0.45s ease',
        }}
      >
        <div className="ob-footer-row">
          <div className="ob-footer-side ob-footer-side--left">
            <NavBtn
              onClick={() => go(Math.max(0, cur - 1))}
              disabled={cur <= 0}
              accent="var(--ob-accent)"
              label="‹"
              filled={false}
            />
          </div>
          <div className="ob-footer-center">
            <div className="ob-footer-dots" style={{ pointerEvents: "auto" }}>
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === currentSlide ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background:
                      i === currentSlide
                        ? accent
                        : i < currentSlide
                        ? "color-mix(in srgb, var(--ob-accent) 35%, transparent)"
                        : (obTheme === "light" ? "rgba(37,37,37,0.28)" : "rgba(255,255,255,0.15)"),
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          </div>
          <div className="ob-footer-side ob-footer-side--right">
            <NavBtn
              onClick={() => {
                if (cur === 0) { go(1); return; }
                if (cur === 5) { doSafetyNext(); return; }
                if (cur === 6) {
                  setHasChosenMood(true);
                  if (!obAutoTime && obPeriod == null) setObPeriod(getCircadianPeriod());
                  go(7);
                  return;
                }
                if (cur < total - 1) go(cur + 1);
              }}
              disabled={cur >= total - 1 || (cur === 5 && (!disclaimerName.trim() || !disclaimerChecked))}
              accent="var(--ob-accent)"
              label="›"
              filled={true}
            />
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          background: cur === 10 ? "#000000" : "var(--ob-nav-bg)",
          zIndex: 999,
          pointerEvents: "none"
        }}
      />
    </div>
  );
}

try {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    showLoadErr('App libraries did not load. Check your connection and refresh.');
  } else {
    const root = document.getElementById('root');
    if (root) {
      ReactDOM.createRoot(root).render(<Onboarding theme="dark" onComplete={() => {}} />);
    }
  }
} catch (e) {
  showLoadErr('Error: ' + (e && e.message ? e.message : String(e)) + (e && e.stack ? '\n\n' + e.stack : ''));
}
