import { initializeApp } from "firebase/app";
import { getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwWwUePj5jEUCRLUCrk26IPNxjF0WCnvc",
  authDomain: "axis-7f474.firebaseapp.com",
  projectId: "axis-7f474",
  storageBucket: "axis-7f474.firebasestorage.app",
  messagingSenderId: "288491438427",
  appId: "1:288491438427:web:b2bbeda5a575e927d3da7e"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Creates or updates `users/{uid}`: new users get onboardingComplete: false; returning users only get email + lastLogin. */
export async function syncUserProfile(user) {
  if (!user || !user.uid) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const email = user.email ?? null;
  if (!snap.exists) {
    await setDoc(userRef, {
      uid: user.uid,
      email,
      lastLogin: serverTimestamp(),
      onboardingComplete: false,
    });
    return;
  }
  await updateDoc(userRef, {
    email,
    lastLogin: serverTimestamp(),
  });
}
