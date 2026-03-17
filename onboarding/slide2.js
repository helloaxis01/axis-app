// Slide 2: Perspective & Foundation
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide2 = function Slide2(props) {
      const { go = () => {} } = props || {};
      return React.createElement("div", { className: "ob-screen", style: { minHeight: "100vh", display: "flex", flexDirection: "column" } },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow" }, "THE PERSPECTIVE & FOUNDATION"),
          React.createElement("div", { className: "ob-heading", style: { lineHeight: 0.78, letterSpacing: "-0.03em", fontWeight: 700 } }, "Modern life is an ", React.createElement("em", null, "endurance sport.")),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 20, lineHeight: 1.28 } }, "Screens and desks create a physical tax, and AXIS is your manual reset. We use biomechanically sequenced movements to reboot your nervous system and restore natural alignment."),
          React.createElement("div", { style: { marginTop: 12, display: "flex", gap: 24, alignItems: "stretch", flexWrap: "wrap" } },
            React.createElement("div", { style: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", marginRight: 40 } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("div", { style: { width: 'clamp(64px, 12vw, 88px)', height: 'clamp(40px, 8vw, 80px)', display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#252525", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 } },
                  React.createElement("div", { style: { fontWeight: 900, color: "#f6f7f8", lineHeight: 1 } }, "80%")
                ),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontWeight: 800, color: "var(--ob-text-head)" } }, "Back pain prevalence"),
                  React.createElement("div", { style: { color: "var(--ob-text-body)", marginTop: 4 } }, "A common issue we target with consistent resets.")
                )
              ),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("div", { style: { width: 'clamp(64px, 12vw, 88px)', height: 'clamp(40px, 8vw, 80px)', display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#252525", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 } },
                  React.createElement("div", { style: { fontWeight: 900, color: "#f6f7f8", lineHeight: 1 } }, "70%")
                ),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontWeight: 800, color: "var(--ob-text-head)" } }, "Desk-worker tension"),
                  React.createElement("div", { style: { color: "var(--ob-text-body)", marginTop: 4 } }, "Screen posture drives neck and shoulder strain.")
                )
              ),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("div", { style: { width: 'clamp(64px, 12vw, 88px)', height: 'clamp(40px, 8vw, 80px)', display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#252525", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 } },
                  React.createElement("div", { style: { fontWeight: 900, color: "#f6f7f8", lineHeight: 1 } }, "100%")
                ),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontWeight: 800, color: "var(--ob-text-head)" } }, "Better with intent"),
                  React.createElement("div", { style: { color: "var(--ob-text-body)", marginTop: 4 } }, "Focused movement reliably improves comfort and mood.")
                )
              )
            ),
            React.createElement("div", { style: { flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" } },
              React.createElement("div", { style: { fontWeight: 800, color: "var(--ob-text-head)" } }, "Why it matters"),
              React.createElement("div", { style: { color: "var(--ob-text-body)", lineHeight: 1.28 } }, "Daily micro-resets interrupt the accumulation of tension, restore movement patterns, and rebuild resilience. Short, focused sessions are designed to produce measurable improvements without disrupting your day."),
              React.createElement("div", { style: { marginTop: 8, fontWeight: 700, color: "var(--ob-text-head)", textTransform: "uppercase" } }, "QUICK WINS. EVIDENCE-BACKED. DAILY FRIENDLY.")
            )
          )
        ),
        React.createElement("div", { className: "ob-nav-bar", style: { position: "fixed", bottom: 0, left: 0, right: 0 } },
          React.createElement("div", { className: "ob-nav-inner", style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 0" } },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(1) }, "\u2190"),
            React.createElement("div", null, null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(3) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

