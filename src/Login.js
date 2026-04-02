import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { axisOnboardingUrl } from "./axis-onboarding-url.js";
import React, { useState } from "./react-shim.js";
import { auth, syncUserProfile } from "./firebase.js";

window.AXIS_DEBUG_KEY = 'NEW_KEY_ACTIVE';

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }
    setBusy(true);

    const run = async () => {
      try {
        if (mode === "signup") {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await syncUserProfile(cred.user);
          try {
            localStorage.removeItem("hasCompletedOnboarding");
            localStorage.setItem("axis_onboarded", JSON.stringify(false));
          } catch (err) {}
          window.location.replace(axisOnboardingUrl());
          return;
        }
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await syncUserProfile(cred.user);
      } catch (err) {
        setError(err && err.message ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    };
    run();
  };

  const shell = {
    width: "100%",
    height: "100vh",
    minHeight: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    padding: "max(20px, env(safe-area-inset-top, 0px)) 20px calc(20px + env(safe-area-inset-bottom, 0px))",
    boxSizing: "border-box",
    background: "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)",
    color: "#f6f7f8",
  };

  const top = {
    flex: "0 0 40%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  };

  const bottom = {
    flex: "1 1 60%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const formWrap = {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const input = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(8,13,24,0.24)",
    color: "#f6f7f8",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const submitBtn = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 999,
    border: "none",
    marginTop: "8px",
    background: "#FF9F43",
    color: "#252525",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.75 : 1,
  };

  const toggleBtn = {
    marginTop: "14px",
    border: "none",
    background: "none",
    color: "rgba(246,247,248,0.78)",
    width: "100%",
    textAlign: "center",
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "13px",
  };

  return React.createElement(
    "div",
    { style: shell },
    React.createElement(
      "div",
      { style: top },
      React.createElement("img", {
        src: "./AXIS_Branding_DarkMode_Outlined.svg",
        alt: "AXIS",
        style: {
          width: "min(187px, 53vw)",
          height: "auto",
          display: "block",
          marginTop: "calc(min(187px, 53vw) * 0.5)",
        },
      })
    ),
    React.createElement(
      "div",
      { style: { ...bottom, marginTop: "calc(min(187px, 53vw) * -0.25)" } },
      React.createElement(
        "div",
        { style: formWrap },
        React.createElement(
          "div",
          {
            style: {
              marginBottom: "12px",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(246,247,248,0.74)",
            },
          },
          mode === "signin" ? "Sign in" : "Create account"
        ),
        React.createElement(
          "form",
          { onSubmit: handleSubmit },
          React.createElement("input", {
            type: "email",
            placeholder: "Email",
            autoComplete: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            disabled: busy,
            style: input,
          }),
          React.createElement("input", {
            type: "password",
            placeholder: "Password",
            autoComplete: mode === "signup" ? "new-password" : "current-password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            disabled: busy,
            style: input,
          }),
          mode === "signup" &&
            React.createElement("input", {
              type: "password",
              placeholder: "Confirm Password",
              autoComplete: "new-password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              disabled: busy,
              style: input,
            }),
          error &&
            React.createElement(
              "div",
              {
                style: {
                  color: "#ff6b6b",
                  fontSize: "13px",
                  margin: "0 0 8px",
                  lineHeight: 1.35,
                  fontFamily: "'Inter', system-ui, sans-serif",
                },
              },
              error
            ),
          React.createElement(
            "button",
            {
              type: "submit",
              style: {
                ...submitBtn,
                background: mode === "signin" ? "#2EC4B6" : "#FF9F43",
                color: mode === "signin" ? "#0D2E2A" : "#252525",
              },
              disabled: busy,
            },
            busy ? "..." : mode === "signin" ? "Sign in" : "Create account"
          )
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => {
              setError("");
              setConfirmPassword("");
              setMode(mode === "signin" ? "signup" : "signin");
            },
            style: toggleBtn,
          },
          mode === "signin"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"
        )
      )
    )
  );
}
