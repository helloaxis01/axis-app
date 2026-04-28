# GOLD web shell (matches `localhost:4173`)

## What “GOLD” is

- **Local:** `npm run preview` or `npm run preview:static` → serves **`public_web/`** on port **4173** after `npm run build` (syntax check only).
- **Git:** branch **`sync/axis-static-desktop`** in **`helloaxis01/axis-app`** — root layout is **`package.json` + `vercel.json` + `public_web/` + `scripts/`** (not the full monorepo Cap build).
- **`vercel.json`:** `buildCommand`: `npm run build`, **`outputDirectory`: `public_web`**.

## Why `main` is different

**`main`** is the **full AXIS repo** (`build.js` → **`dist/`**, cron, nested `031726 REBUILD/` sync). A Vercel project pinned to **`main`** builds **`dist/`**, not raw **`public_web/`**, so it will **not** match GOLD line‑for‑line.

## Deploy GOLD on Vercel (axis-app-beryl or a new project)

Do this in **Vercel → Project → Settings**:

1. **Git → Production Branch** = **`sync/axis-static-desktop`** (not `main`).
2. **Root Directory** = **.** (leave empty / repo root). This branch **is** the shell root.
3. **Build & Development Settings** — ensure Vercel reads **`vercel.json`** from the branch:
   - Install: `npm install` (default)
   - Build: `npm run build`
   - Output: **`public_web`** (usually picked up from `vercel.json`)

Save, then **Deployments → Redeploy** Production (clear cache if offered).

### New hostname instead of reusing beryl

Add **New Project** → import **`helloaxis01/axis-app`**, same branch **`sync/axis-static-desktop`**, same settings → assign domain **`axis-gold.vercel.app`** (or your preferred name).

## Checklist after deploy

- Open the deployment URL and confirm **Metrics / Today** behave like **4173**.
- Optional: compare **`curl -sI URL`** **etag** / **content-length** once with local `public_web/index.html` size after a fresh deploy.
