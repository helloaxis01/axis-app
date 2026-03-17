// Slide 1: Alpha Build
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide1 = function Slide1(props) {
      const { go = () => {} } = props || {};
      return React.createElement("div", { className: "ob-screen", style: { minHeight: "100vh", display: "flex", flexDirection: "column" } },
        React.createElement("div", { className: "ob-pad", style: { padding: "calc(env(safe-area-inset-top, 0px) + 72px) 32px calc(env(safe-area-inset-bottom, 0px) + 70px)" } },
          React.createElement("div", { className: "ob-eyebrow", style: { letterSpacing: "0.5em" } }, "ALPHA BUILD"),
          React.createElement("div", { className: "ob-heading", style: { fontWeight: 700, color: "var(--ob-text-head)", lineHeight: 0.96, letterSpacing: "-0.01em", marginBottom: 14 } }, "Welcome to AXIS."),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 24, opacity: 0.6, lineHeight: 1.28 } }, "You’re accessing an early prototype. While we refine the final experience, the core science is fully active. Your usage and feedback help shape the future of AXIS."),
          React.createElement("div", { className: "ob-body", style: { marginTop: 16, color: "var(--ob-text-sec)", lineHeight: 1.28 } }, "When you’re done using the app, please quit it so you receive the latest updates automatically.")
        ),
        React.createElement("div", { className: "ob-nav-bar", style: { position: "fixed", bottom: 0, left: 0, right: 0 } },
          React.createElement("div", { className: "ob-nav-inner", style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 0" } },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(0) }, "\u2190"),
            React.createElement("div", null, null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(2) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

