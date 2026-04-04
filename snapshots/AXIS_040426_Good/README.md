# AXIS backup — 2026-04-04 (Good)

Frozen snapshot for revert. Produced after `npm run build` from repo root (`AXIS`).

## What matches `http://localhost:4173` (preview)

- **`AXIS_Main_040426_Good.html`** — `dist/index.html` (Babel-compiled inline app).
- **`AXIS_Onboarding_040426_Good.html`** — `dist/onboarding.html`.
- **`auth-bundle.js`**, **`axis-icon.png`**, **`axis_data.json`**, **`onboarding.css`**, brand **SVGs**, **`Logo - Vector/`** — same files deployed alongside the HTML in `dist/`.

## Source copies (editable / canonical)

- **`SOURCE_public_web_index_040426_Good.html`** — `031726 REBUILD/public_web/index.html` (synced to repo `index.html` before build).
- **`SOURCE_onboarding_snapshot_040426_Good.html`** — `snapshots/onboarding-v2.1+list-guided.html` (build input for onboarding).
- **`SOURCE_public_web_auth-bundle_040426_Good.js`** — `public_web/auth-bundle.js` when present.

## Restore (outline)

1. Main: copy `SOURCE_public_web_index_040426_Good.html` → `031726 REBUILD/public_web/index.html`, run `npm run build`, or replace `dist/index.html` with `AXIS_Main_040426_Good.html` for a quick static rollback.
2. Onboarding: copy `SOURCE_onboarding_snapshot_040426_Good.html` → `snapshots/onboarding-v2.1+list-guided.html`, then `npm run build`.
3. Assets: copy bundled files from this folder into `dist/` (or let `npm run build` repopulate after HTML restore).
