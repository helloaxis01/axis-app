"use strict";
/**
 * Patch compiled auth-bundle.js for Capacitor iOS sign-in + returning-user routing.
 * Run after auth-bundle changes: node scripts/patch-auth-login.cjs
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "public_web", "auth-bundle.js");
let s = fs.readFileSync(file, "utf8");
let changed = false;

function replaceOnce(oldStr, newStr) {
  if (!s.includes(oldStr) || oldStr === newStr) return false;
  s = s.replace(oldStr, newStr);
  changed = true;
  return true;
}

replaceOnce(
  `    await setDoc(userRef, payload, { merge: true });
  }`,
  `    await setDoc(userRef, payload, { merge: true });
    try {
      const data = snap.exists() ? snap.data() : null;
      if (data && data.onboardingComplete === true) {
        localStorage.setItem(\`axis_onboarded:\${user.uid}\`, JSON.stringify(true));
      }
    } catch (e) {}
  }`
);

replaceOnce(
  `      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);`,
  `      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const _axisCapNative = typeof window !== "undefined" && window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform();
      if (_axisCapNative) {
        try {
          auth = initializeAuth(app, { persistence: browserLocalPersistence, popupRedirectResolver: browserPopupRedirectResolver });
        } catch (_axisCapAuthErr) {
          auth = getAuth(app);
        }
      } else {
        auth = getAuth(app);
      }
      db = null;`
);

if (!s.includes("function axisGetFirestoreDb()")) {
  replaceOnce(
    `  async function syncUserProfile(user) {
    if (!user || !user.uid) return;
    const userRef = doc(db, "users", user.uid);`,
    `  function axisGetFirestoreDb() {
    if (!db) db = getFirestore(app);
    return db;
  }
  async function syncUserProfile(user) {
    if (!user || !user.uid) return;
    const userRef = doc(axisGetFirestoreDb(), "users", user.uid);`
  );
}

replaceOnce(
  `          const cred = await Promise.race([
            signInWithEmailAndPassword(auth, email.trim(), password),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Sign-in timed out. Check your connection and try again.")), 20000))
          ]);`,
  `          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);`
);

replaceOnce(
  `        if (u && !isOnboarded2()) {
          window.location.replace(axisOnboardingUrl());
        }`,
  `        if (u && !isOnboarded2()) {
          const dest = typeof window.axisPostLoginHref === "function"
            ? window.axisPostLoginHref()
            : axisOnboardingUrl();
          window.location.replace(dest);
        }`
);

if (!changed) {
  const already =
    s.includes("_axisCapNative") &&
    s.includes("axisGetFirestoreDb") &&
    s.includes("axisPostLoginHref");
  if (already) {
    console.log("patch-auth-login: already patched", file);
    process.exit(0);
  }
  console.error("patch-auth-login: no changes applied (auth-bundle.js layout may have changed)");
  process.exit(1);
}

fs.writeFileSync(file, s, "utf8");
console.log("patch-auth-login: updated", file);
