// Emergency execution log — helps detect if the onboarding script is being loaded
console.log('ONBOARDING_JS_EXECUTING');
// Lightweight external onboarding component for incremental extraction.
// This registers a global factory `window.AXIS_Onboarding` so the main
// inline app can optionally delegate to this implementation while we
// move the full onboarding code out of index.html incrementally.
(function () {
  console.log('Onboarding CSS attempting to load...'); // debug: check onboarding JS executes
  // Ensure onboarding CSS variables have a sensible default so the page isn't left visually blank.
  try {
    const root = document.documentElement;
    const cur = getComputedStyle(root).getPropertyValue('--ob-page-bg') || '';
    if (!cur || !cur.trim()) {
      // Fallback to a dark background so the onboarding doesn't appear white/blank if vars are missing.
      root.style.setProperty('--ob-page-bg', '#0a0a0f');
      // Also set basic text color vars so content is visible
      root.style.setProperty('--ob-text-head', '#ffffff');
      root.style.setProperty('--ob-text-body', 'rgba(255,255,255,0.9)');
      console.log('AXIS: applied onboarding CSS fallbacks');
    }
  } catch (e) { /* ignore */ }
  // Wait until React is available (index.html loads React before inline app).
  function mountWhenReady() {
    if (typeof React === "undefined") {
      setTimeout(mountWhenReady, 50);
      return;
    }
    // Ensure the root element exists before mounting onboarding UI
    if (!document.getElementById('root')) {
      console.log('AXIS: waiting for #root to exist before mounting onboarding');
      setTimeout(mountWhenReady, 50);
      return;
    }
    // Prefer composed slides if they exist (we extract slides into separate files)
    window.AXIS_Onboarding = function OnboardingExternal(props) {
      const { theme, onComplete } = props || {};
      // Allow an external signal to force the initial slide index (useful for emergency forcing)
      const initialCur = (typeof window.AXIS_FORCE_ONBOARDING_INDEX === 'number') ? window.AXIS_FORCE_ONBOARDING_INDEX : 0;
      const [cur, setCur] = React.useState(() => initialCur);
      const total = 8;
      const go = (n) => setCur(Math.max(0, Math.min(total - 1, n)));

      // Resolve slide components if registered globally
      const Slide0 = window.AXIS_Onboarding_Slide0;
      const Slide1 = window.AXIS_Onboarding_Slide1;
      const Slide2 = window.AXIS_Onboarding_Slide2;
      const Slide3 = window.AXIS_Onboarding_Slide3;
      const Slide4 = window.AXIS_Onboarding_Slide4;
      const Slide5 = window.AXIS_Onboarding_Slide5;
      const Slide6 = window.AXIS_Onboarding_Slide6;
      const Slide7 = window.AXIS_Onboarding_Slide7;

      // If slides are available, render composed flow for slides 0–2 then fall back to a finish button
      if (cur === 0 && Slide0) return React.createElement(Slide0, { go, theme });
      if (cur === 1 && Slide1) return React.createElement(Slide1, { go, theme });
      if (cur === 2 && Slide2) return React.createElement(Slide2, { go, theme });
      if (cur === 3 && Slide3) return React.createElement(Slide3, { go, theme });
      if (cur === 4 && Slide4) return React.createElement(Slide4, { go, theme, obTheme: theme });
      if (cur === 5 && Slide5) return React.createElement(Slide5, { go, theme });
      if (cur === 6 && Slide6) return React.createElement(Slide6, { go, theme });
      if (cur === 7 && Slide7) return React.createElement(Slide7, { go, onComplete, theme });

      // Fallback minimal UI for remaining steps / when slides not present
      return React.createElement(
        "div",
        { style: { padding: 24, fontFamily: "'Barlow',sans-serif", color: "var(--ob-text-body)" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 20, marginBottom: 8 } }, "Onboarding"),
        React.createElement("div", { style: { marginBottom: 12, color: "var(--ob-text-sec)" } }, "Continue through onboarding."),
        React.createElement(
          "div",
          null,
          cur < 7
            ? React.createElement("button", { onClick: () => go(cur + 1), style: { padding: "10px 16px", borderRadius: 10, background: "var(--ob-accent, #FF9F43)", color: "white", border: "none", cursor: "pointer" } }, "Next")
            : React.createElement("button", { onClick: () => { try { if (typeof onComplete === "function") onComplete(); } catch (e) { console.error(e); } }, style: { padding: "10px 16px", borderRadius: 10, background: "var(--ob-accent, #FF9F43)", color: "white", border: "none", cursor: "pointer" } }, "Finish Onboarding")
        )
      );
    };
  }
  // If axis JSON already loaded, set force index to 0 to ensure first slide is shown
  try {
    if (typeof window !== 'undefined' && window.AXIS_JSON) {
      window.AXIS_FORCE_ONBOARDING_INDEX = 0;
      console.log('AXIS_JSON detected — forcing onboarding initial index 0');
    }
  } catch (e) {}
  // Ensure DOM exists before mounting; some local previews load scripts early.
  function onReady() {
    try {
      mountWhenReady();
    } catch (e) {
      console.error('Onboarding mount failed:', e);
    }
  }
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
  // Also run on full window load to ensure all resources and DOM nodes are present
  window.addEventListener('load', onReady);
})();

