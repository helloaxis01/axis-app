// Slide 0: Splash
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide0 = function Slide0(props) {
      const { go = () => {}, theme = "dark" } = props || {};
      const logo = theme === "dark" ? (typeof AXIS_LOGO_DARK !== "undefined" ? AXIS_LOGO_DARK : "") : (typeof AXIS_LOGO_LIGHT !== "undefined" ? AXIS_LOGO_LIGHT : "");
      return React.createElement("div", { className: "ob-screen ob-s0", style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center", padding: "60px 32px 80px", boxSizing: "border-box" } },
        React.createElement("div", { className: "ob-s0-top", style: { flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 24 } },
          React.createElement("img", { src: logo, alt: "AXIS", style: { height: 200, width: "auto", objectFit: "contain" } })
        ),
        React.createElement("div", { className: "ob-s0-bottom", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 24 } },
          React.createElement("div", { className: "ob-splash-tag", style: { fontSize: 13, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--ob-text-sec)" } }, "X  MOVE  X  MEND  X  MAINTAIN  X")
        ),
        React.createElement("div", { className: "ob-nav-bar", style: { position: "fixed", bottom: 0, left: 0, right: 0 } },
          React.createElement("div", { className: "ob-nav-inner", style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 0" } },
            React.createElement("button", { className: "ob-nav-back", style: { visibility: "hidden" } }, "\u2190"),
            React.createElement("div", { style: { display: "flex", gap: 6 } }, /* simple dots placeholder */ null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(1), style: { padding: "12px 20px", borderRadius: 999 } }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

