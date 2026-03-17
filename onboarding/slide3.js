// Slide 3: The Benefits
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide3 = function Slide3(props) {
      const { go = () => {} } = props || {};
      return React.createElement("div", { className: "ob-screen" },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow" }, "THE BENEFITS"),
          React.createElement("div", { className: "ob-heading", style: { lineHeight: 0.96, letterSpacing: "-0.01em" } }, "Movement as ", React.createElement("em", null, "Medicine.")),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 18, lineHeight: 1.28 } }, "Smart movement isn’t just a workout — it’s a physiological shift."),
          React.createElement("div", { style: { marginTop: 18, display: "grid", gap: 14 } },
            React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 8, height: 8, marginTop: 6, borderRadius: 8, background: "var(--ob-box-border)" } }),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 700, color: "var(--ob-text-head)" } }, "Targeted mobility can cut chronic pain by up to 30% in 8 weeks."),
                React.createElement("div", { style: { marginTop: 6, color: "var(--ob-text-body)" } }, "Consistent practice improves tissue tolerance and reduces nociceptive drivers over time.")
              )
            ),
            React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 8, height: 8, marginTop: 6, borderRadius: 8, background: "var(--ob-box-border)" } }),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 700, color: "var(--ob-text-head)" } }, "Daily micro-resets reduce tension by 50% for desk workers."),
                React.createElement("div", { style: { marginTop: 6, color: "var(--ob-text-body)" } }, "Short, regular breaks interrupt the accumulation of stiffness and improve comfort.")
              )
            ),
            React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 8, height: 8, marginTop: 6, borderRadius: 8, background: "var(--ob-box-border)" } }),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 700, color: "var(--ob-text-head)" } }, "Core and spine work improves stability by 40%, preventing recurrence."),
                React.createElement("div", { style: { marginTop: 6, color: "var(--ob-text-body)" } }, "Targeted activation builds resilience so you can return to meaningful movement safely.")
              )
            ),
            React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 8, height: 8, marginTop: 6, borderRadius: 8, background: "var(--ob-box-border)" } }),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 700, color: "var(--ob-text-head)" } }, "One 8‑minute session boosts mood and energy all day."),
                React.createElement("div", { style: { marginTop: 6, color: "var(--ob-text-body)" } }, "A brief, focused practice can shift autonomic state and kickstart momentum for the day.")
              )
            )
          )
        ),
        React.createElement("div", { className: "ob-nav-bar" },
          React.createElement("div", { className: "ob-nav-inner" },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(2) }, "\u2190"),
            React.createElement("div", null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(4) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

