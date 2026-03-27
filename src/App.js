import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login.js";
import React, { useEffect, useState } from "./react-shim.js";
import { auth, syncUserProfile } from "./firebase.js";

function isOnboarded() {
  try {
    const raw = localStorage.getItem("axis_onboarded");
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch (e) {
    return false;
  }
}

export default function App({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
      if (u) {
        syncUserProfile(u).catch((err) => {
          try {
            console.error("AXIS: sync user profile failed", err);
          } catch (e) {}
        });
      }
      if (u && !isOnboarded()) {
        window.location.replace("./onboarding.html");
      }
    });
    return () => unsub();
  }, []);

  if (loading) return null;
  if (!user) return React.createElement(Login);
  if (!isOnboarded()) return null;
  return children;
}
