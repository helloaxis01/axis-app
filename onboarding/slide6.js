// Slide 6: Ethics & Safety
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide6 = function Slide6(props) {
      const { go = () => {} } = props || {};
      return React.createElement("div", { className: "ob-screen" },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow" }, "THE ETHICS & SAFETY"),
          React.createElement("div", { className: "ob-heading", style: { lineHeight: 0.96, letterSpacing: "-0.01em" } }, "Your body. Your ", React.createElement("em", null, "data.")),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 24, lineHeight: 1.28 } }, "No accounts, no tracking, and your data never leaves this device. AXIS is about mending, not pushing, so always listen to your body. If a movement causes pain, skip it.")
        ),
        React.createElement("div", { className: "ob-nav-bar" },
          React.createElement("div", { className: "ob-nav-inner" },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(5) }, "\u2190"),
            React.createElement("div", null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(7) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

