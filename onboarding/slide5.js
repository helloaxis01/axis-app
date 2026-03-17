// Slide 5: Appearance
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide5 = function Slide5(props) {
      const { go = () => {}, theme = "dark" } = props || {};
      const [localTheme, setLocalTheme] = React.useState(theme || "dark");
      const [autoTime, setAutoTime] = React.useState(false);
      const onSelect = (val) => {
        try { localStorage.setItem("axis_theme", val); } catch (e) {}
        setLocalTheme(val);
        go(6);
      };
      return React.createElement("div", { className: "ob-screen" },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow" }, "APPEARANCE"),
          React.createElement("div", { className: "ob-heading", style: { lineHeight: 0.96, letterSpacing: "-0.01em" } }, "Personalize your ", React.createElement("em", null, "space.")),
          React.createElement("div", { className: "ob-body", style: { marginBottom: 28, lineHeight: 1.28 } }, "Choose a theme that fits your environment or intent. Select from light or dark mode, or color themes — amber, teal, blue, or purple. Set Auto and AXIS adapts to the time of day."),
          React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 24 } },
            ["dark", "light"].map((val) =>
              React.createElement("button", { key: val, onClick: () => onSelect(val), style: { flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", border: localTheme === val ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)", background: localTheme === val ? "var(--ob-accent-dim)" : "var(--ob-box-bg)", color: localTheme === val ? "var(--ob-accent)" : "var(--ob-text-sec)", transition: "all 0.18s" } }, val.charAt(0).toUpperCase() + val.slice(1))
            )
          ),
          React.createElement("div", { style: { marginBottom: 20 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 14, background: autoTime ? "var(--ob-accent-dim)" : "var(--ob-box-bg)", border: autoTime ? "1.5px solid var(--ob-accent)" : "1px solid var(--ob-box-border)", transition: "all 0.2s" } },
              React.createElement("div", null,
                React.createElement("div", { style: { color: autoTime ? "var(--ob-accent)" : "var(--ob-text-head)", fontWeight: 600, marginBottom: 2 } }, "Auto"),
                React.createElement("div", { style: { color: "var(--ob-text-sec)" } }, "Set Auto and AXIS adapts to the time of day.")
              ),
              React.createElement("button", { type: "button", role: "switch", "aria-checked": autoTime, onClick: () => { setAutoTime(v => !v); if (!autoTime) { try { localStorage.setItem("axis_theme", getCircadianPeriod()); } catch (e) {} } }, style: { width: 48, height: 28, border: "1px solid", borderColor: autoTime ? "var(--ob-accent)" : "var(--ob-box-border)", borderRadius: 14, background: autoTime ? "var(--ob-accent)" : "var(--ob-box-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s" } },
                React.createElement("div", { style: { position: "absolute", top: 3, left: autoTime ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: autoTime ? "#fff" : "#111", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
              )
            )
          )
        ),
        React.createElement("div", { className: "ob-nav-bar" },
          React.createElement("div", { className: "ob-nav-inner" },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(4) }, "\u2190"),
            React.createElement("div", null),
            React.createElement("button", { className: "ob-nav-next", onClick: () => go(6) }, "Next")
          )
        )
      );
    };
  }
  mount();
})();

