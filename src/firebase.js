import { initializeApp } from "firebase/app";
import { getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

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
