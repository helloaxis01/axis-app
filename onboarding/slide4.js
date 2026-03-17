// Slide 4: The Method & Tools
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide4 = function Slide4(props) {
      const { go = () => {}, obTheme = "dark" } = props || {};
      const iconColor = obTheme === "dark" ? "#f6f7f8" : "#252525";
      return React.createElement("div", { className: "ob-screen" },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow" }, "THE METHOD & TOOLS"),
          React.createElement("div", { className: "ob-heading", style: { marginBottom: 8, lineHeight: 0.96, letterSpacing: "-0.01em" } }, "Three ways to ", React.createElement("em", null, "reset.")),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 18, lineHeight: 1.28 } }, "Choose what fits your energy or time — you can customize or switch anytime."),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 6 } },
            React.createElement("div", { style: { borderTop: "1px solid var(--ob-box-border)", paddingTop: 10, paddingBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" } },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" }, React.createElement("path", { d: "M12 5v14M5 12h14", stroke: iconColor, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }))
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: obTheme === "dark" ? "#f6f7f8" : "#252525" } }, "GUIDED"),
                React.createElement("div", { style: { marginTop: 4, color: "var(--ob-text-body)", lineHeight: 1.25 } }, "Immersive flow. Follow timed sequences with built‑in pacing, rest, and cues that keep you moving with focus and ease.")
              )
            ),
            React.createElement("div", { style: { borderTop: "1px solid var(--ob-box-border)", paddingTop: 10, paddingBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" } },
              React.createElement("div", { style: { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" } },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" }, React.createElement("path", { d: "M4 7h4M10 7h10M4 12h4M10 12h10M4 17h4M10 17h10", stroke: iconColor, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" }))
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: obTheme === "dark" ? "#f6f7f8" : "#252525" } }, "LIST"),
                React.createElement("div", { style: { marginTop: 4, color: "var(--ob-text-body)", lineHeight: 1.25 } }, "Self-paced control. Browse the movement library, check off exercises, and move freely at your own rhythm and tempo.")
              )
            ),
            React.createElement("div", { style: { borderTop: "1px solid var(--ob-box-border)", paddingTop: 10, paddingBottom: 10, display: "flex", gap: 12, alignItems: "flex-start", borderBottom: "1px solid var(--ob-box-border)" } },
              React.createElement("div", { style: { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" } },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" }, React.createElement("circle", { cx: 12, cy: 12, r: 8, stroke: iconColor, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" }))
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: obTheme === "dark" ? "#f6f7f8" : "#252525" } }, "BREATH & FOCUS"),
                React.createElement("div", { style: { marginTop: 4, color: "var(--ob-text-body)", lineHeight: 1.25 } }, "System regulation. Use science-based breathing patterns and interval timers to calm, refocus, and boost performance.")
              )
            )
          )
        ),
        React.createElement("div", { className: "ob-nav-bar" },
          React.createElement("div", { className: "ob-nav-inner" },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(3) }, "\u2190"),
            React.createElement("div", null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(5) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

