# Test AXIS on your iPhone (sound + haptics)

Use the **031726 REBUILD** project — not the older “AXIS ios App” project in Xcode’s recents.

## Fastest path (copy/paste)

**Terminal:**

```bash
cd "/Users/adam/Desktop/AXIS/031726 REBUILD"
npm run ios:ready
```

That syncs the app, resolves packages, and opens Xcode.

**Xcode:**

1. Top bar → choose **your iPhone** (plugged in, unlocked).
2. Press **▶ Run**.

**On the phone:**

1. Silent switch **off**, volume **up**.
2. Open AXIS → **tap once** on the home screen (unlocks sound).
3. Start a **guided** workout → beeps + vibration on taps and timer ticks.

---

## If build failed before

The REBUILD app uses **Swift Package Manager** (no CocoaPods). A typical error was **“requires a development team”** — signing is set for your Apple ID; if Xcode still complains, open **Signing & Capabilities** → **Team** → pick your account.

---

## After you change the web app

```bash
cd "/Users/adam/Desktop/AXIS/031726 REBUILD"
npm run cap:sync
npm run cap:open:ios
```

Press **▶** in Xcode again.

---

## What’s wired up

| Feature | How it works |
|--------|----------------|
| **Haptics + audio cues** | Web Audio + `@capacitor/haptics` via `axis-native.mjs` |
| **Keep Awake** | Screen stays on during guided sessions |
| **Status bar** | Dark style, matches `#080d18` shell |
| **Splash** | Dark launch, auto-hides when app loads |
| **Portrait lock** | Native manifest + `ScreenOrientation` — no “rotate to portrait” overlay |
| **Background pause** | Leaving the app pauses guided timers; tap **Resume** when you return |
| **Offline banner** | Appears when you lose connection; app still works locally |
| **Preferences** | Native storage mirrors `localStorage` (more reliable on device) |
| **Share** | **SHARE** on session complete screen |
| **Daily reminder** | Settings → Reminders → on at **9:00 AM** (allow notifications when asked) |
| **Apple Health** | Settings → Health → **Connect Apple Health** (steps + weight on Metrics) |
| **Audio fallback** | Guided cues use WAV fallback if Web Audio is suspended on device |
| **Web folder** | `public_web` copied into `ios/App/App/public` on each sync |

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Wrong project in Xcode | Close it. Run `npm run ios:ready` from **031726 REBUILD** |
| Signing error | Target **App** → **Signing & Capabilities** → **Team** = your Apple ID |
| App won’t open on phone | **Settings → General → VPN & Device Management** → trust developer |
| No sound | Tap screen once; check silent switch and volume |
| No vibration | Use a **real iPhone**, not Simulator |
| Health shows “Not connected” | Settings → Health → Connect; allow **Steps** and **Weight** in the iOS Health prompt |
| Health build error (entitlements) | Xcode → Target **App** → **Signing & Capabilities** → **+ Capability** → **HealthKit** (one-time; enables provisioning) |
| Black screen on launch | Run `npm run cap:sync`, **Clean Build Folder**, delete AXIS from phone, reinstall |
| Xcode shows **Thread 1: signal SIGKILL** | iOS killed the app (watchdog or memory). See **SIGKILL** below — not a normal code crash |

### SIGKILL in Xcode

**SIGKILL** means the operating system terminated the process. It is **not** pointing at a bug on a specific line in your Swift code.

Common causes when running AXIS:

1. **Launch watchdog** — app took too long to start (heavy web bundle, splash blocked, notification permission wait). Fixed in recent builds by rendering UI immediately and auto-hiding splash.
2. **Memory pressure (jetsam)** — WKWebView + large JS files. `npm run cap:sync` now prunes `auth-bundle.js` and unused vendor scripts from the iOS copy.
3. **You pressed Stop (■)** in Xcode — debugger shows SIGKILL even though nothing is “wrong.”
4. **Stale install** — delete AXIS from the phone, **Product → Clean Build Folder**, run again.
5. **Free Apple ID / signing** — provisioning expired; re-pick **Team** under Signing & Capabilities.

**What to do:**

```bash
cd "/Users/adam/Desktop/AXIS/031726 REBUILD"
npm run cap:sync
```

Then: delete AXIS on the phone → Xcode **Clean Build Folder** → **Run** on a **physical iPhone** (not Simulator for haptics/Health).

To see the real reason: Xcode → **Window → Devices and Simulators** → your iPhone → **Open Console**, filter for `AXIS` or `jetsam` while launching.


## Web-only (no Xcode)

```bash
npm run build
npm run preview:static
```

Open http://localhost:4173 — haptics are weaker in the browser; use the iPhone app for the full experience.
