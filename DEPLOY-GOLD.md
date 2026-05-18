# GOLD web shell (matches `localhost:4173`)

## What “GOLD” is

- **Local:** `npm run preview` or `npm run preview:static` → serves **`public_web/`** on port **4173** after `npm run build` (syntax check only).
- **Git:** branch **`sync/axis-static-desktop`** in **`helloaxis01/axis-app`** — root layout is **`package.json` + `vercel.json` + `public_web/` + `scripts/`** (not the full monorepo Cap build).
- **`vercel.json`:** `buildCommand`: `npm run build`, **`outputDirectory`: `public_web`**.

## Why `main` is different

**`main`** is the **full AXIS repo** (`build.js` → **`dist/`**, cron, nested `031726 REBUILD/` sync). A Vercel project pinned to **`main`** builds **`dist/`**, not raw **`public_web/`**, so it will **not** match GOLD line‑for‑line.

## Deploy GOLD on Vercel

**Use Vercel project `axis-app` only** (team: `helloaxis01s-projects`). Do **not** deploy to the separate legacy project `axis-app-beryl` (that project’s production URL is `axis-app-beryl-seven.vercel.app` and will stay stale).

- **Production URL (wellness app):** `https://axis-app-beryl.vercel.app` — this domain is attached to **`axis-app`**, not to the `axis-app-beryl` project.
- **CLI:** `vercel link --project axis-app --scope helloaxis01s-projects` then `vercel deploy --prod --scope helloaxis01s-projects`
- **Do not use** `https://axis-app.vercel.app` for the app — that hostname serves an unrelated Next.js marketing site.

Do this in **Vercel → Project `axis-app` → Settings**:

1. **Git → Production Branch** = **`sync/axis-static-desktop`** (not `main`).
2. **Root Directory** = **.** (leave empty / repo root). This branch **is** the shell root.
3. **Build & Development Settings** — ensure Vercel reads **`vercel.json`** from the branch:
   - Install: `npm install` (default)
   - Build: `npm run build`
   - Output: **`public_web`** (usually picked up from `vercel.json`)

Save, then **Deployments → Redeploy** Production (clear cache if offered).

## Checklist after deploy

- Open **`https://axis-app-beryl.vercel.app`** and confirm **Metrics / Today** behave like **4173**.
- View page source (or curl) and confirm `app.js?cb=` matches the cache token in `public_web/index.html`.
- Optional: compare **`curl -sI URL`** **etag** / **content-length** once with local `public_web/index.html` size after a fresh deploy.
