import { onAuthStateChanged, signOut } from "firebase/auth";
import App from "./App.js";
import Login from "./Login.js";
import { auth } from "./firebase.js";

window.AXIS_AuthRoot = App;
window.AXIS_auth = auth;
window.AXIS_onAuthStateChanged = onAuthStateChanged;
window.AXIS_Login = Login;
window.AXIS_signOut = () => signOut(auth);
