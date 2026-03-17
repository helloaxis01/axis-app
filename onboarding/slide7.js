// Slide 7: Medical Disclaimer (final)
(function () {
  function mount() {
    if (typeof React === "undefined") {
      setTimeout(mount, 50);
      return;
    }

    window.AXIS_Onboarding_Slide7 = function Slide7(props) {
      const { go = () => {}, onComplete } = props || {};
      const [name, setName] = React.useState("");
      const [checked, setChecked] = React.useState(false);
      const [warn, setWarn] = React.useState(false);
      const submit = () => {
        if (!name.trim() || !checked) {
          setWarn(true);
          return;
        }
        try { localStorage.setItem("axis_disclaimer", JSON.stringify({ name: name.trim(), accepted: true, date: new Date().toISOString() })); } catch (e) {}
        if (typeof onComplete === "function") onComplete({ name });
      };
      return React.createElement("div", { className: "ob-screen ob-cta-screen" },
        React.createElement("div", { className: "ob-pad" },
          React.createElement("div", { className: "ob-eyebrow", style: { marginBottom: 8 } }, "MEDICAL DISCLAIMER"),
          React.createElement("div", { className: "ob-heading", style: { marginBottom: 16, lineHeight: 0.96, letterSpacing: "-0.01em" } }, React.createElement("span", { style: { fontWeight: 800 } }, "The"), " ", React.createElement("em", null, "Fine Print.")),
          React.createElement("div", { className: "ob-disclaimer-scroll", style: { lineHeight: 1.28, color: "#ffffff" } }, "AXIS provides movement and breath guidance for general wellness. It is not a substitute for professional medical advice, diagnosis, or treatment.", React.createElement("br", null), React.createElement("br", null), "If you have any medical condition, injury, or concern, consult a qualified healthcare professional before starting. Stop immediately and seek attention if you experience pain, dizziness, shortness of breath, or discomfort.", React.createElement("br", null), React.createElement("br", null), "By continuing, you confirm that you are participating voluntarily and assume full responsibility for your use of this app.")
        ),
        React.createElement("div", { style: { width: "100%", marginTop: 16, marginBottom: 20 } },
          React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ob-text-sec)", marginBottom: 8, fontWeight: 500 } }, "Name:"),
          React.createElement("input", { type: "text", placeholder: "Full name", value: name, onChange: (e) => { setName(e.target.value); setWarn(false); }, style: { width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15, fontFamily: "'Barlow',sans-serif", fontWeight: 400, background: "var(--ob-box-bg)", border: "1px solid var(--ob-box-border)", color: "var(--ob-text-head)", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" } })
        ),
        React.createElement("div", { style: { width: "100%", marginBottom: 24 } },
          React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28, cursor: "pointer", width: "100%" }, onClick: () => { setChecked(c => !c); setWarn(false); } },
            React.createElement("div", { style: { flexShrink: 0, width: 22, height: 22, borderRadius: 6, marginTop: 1, border: checked ? "1.5px solid var(--ob-accent)" : "1.5px solid var(--ob-box-border)", background: checked ? "var(--ob-accent)" : "var(--ob-box-bg)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" } }, checked && React.createElement("svg", { width: 12, height: 10, viewBox: "0 0 12 10", fill: "none" }, React.createElement("path", { d: "M1 5L4.5 8.5L11 1.5", stroke: "#0a0e1a", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }))),
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.45, color: "var(--ob-text-body)", fontWeight: 300 } }, "\u2611 I have read and understand the disclaimer above.", React.createElement("br", null), "I confirm I am using this app at my own risk and will consult a healthcare professional if I have concerns.")
          )
        ),
        warn && React.createElement("div", { style: { width: "100%", marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)", fontSize: 12, color: "rgba(255,160,160,0.9)", lineHeight: 1.5 } }, !name.trim() && !checked ? "Please enter your name and check the box to continue." : !name.trim() ? "Please enter your name to continue." : "Please check the box to confirm you've read the disclaimer."),
        React.createElement("div", { className: "ob-nav-bar" },
          React.createElement("div", { className: "ob-nav-inner" },
            React.createElement("button", { className: "ob-nav-back", onClick: () => go(6) }, "\u2190"),
            React.createElement("div", null),
            React.createElement("button", { className: "ob-btn-primary", onClick: submit, style: { width: "100%", margin: "12px 0" } }, "LET'S MOVE")
          )
        )
      );
    };
  }
  mount();
})();

