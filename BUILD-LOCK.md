# Locked web shell builds

Production web deploys use **`public_web/`** stamped at build time. Native Capacitor builds use the same folder after `npm run cap:sync`.

## Lock a build

```bash
npm run build
```

This runs `stamp-build` (git SHA → `?cb=` tokens in `index.html`) and writes:

- `public_web/build-id.txt` — short id
- `public_web/build-lock.json` — branch, full commit, deploy metadata

## Verify locally (GOLD)

```bash
npm run preview:static
# http://localhost:4173
```

Compare `window.AXIS_BUILD` in the browser with `public_web/build-lock.json`.

## Vercel (web)

See [DEPLOY-GOLD.md](./DEPLOY-GOLD.md). Production branch: **`sync/axis-static-desktop`**, output **`public_web`**.

## Native (Capacitor — audio + haptics)

iOS uses **Swift Package Manager** (no CocoaPods). See **[NATIVE-TESTING.md](./NATIVE-TESTING.md)**.

```bash
npm run ios:ready         # sync + resolve packages + open Xcode
npm run cap:sync          # stamp + bundle native bridge + cap sync
npm run cap:open:ios      # open App.xcodeproj
```

Requires Xcode (iOS) or Android Studio. First-time iOS: open Xcode → target **App** → Signing & Capabilities → set your Team.
