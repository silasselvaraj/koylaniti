# Deploying KoylaNiti live

Three free-tier services: **Neon** (Postgres), **Render** (backend), **Vercel** (frontend). You sign in to each yourself — none of these steps need you to hand credentials to anyone else.

## 1. Database — Neon

1. Go to https://neon.tech and sign up/log in (GitHub login is fastest).
2. Create a new project (any name, e.g. `koylaniti`).
3. On the project dashboard, copy the **connection string** it shows you. It looks like:
   `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require`
4. Change `postgresql://` to `postgresql+psycopg://` at the start (SQLAlchemy needs the driver name). Keep the rest as-is. Save this full string somewhere — you'll paste it into Render next, and use it once locally to seed the database.

## 2. Backend — Render

1. Go to https://render.com and sign up/log in (GitHub login again is easiest — it also grants Render access to your repos).
2. **New +** → **Blueprint** → connect your `koylaniti` GitHub repo. Render will detect `render.yaml` at the repo root automatically.
3. It'll ask you to fill in two env vars (marked `sync: false` so they're not stored in the repo):
   - `DATABASE_URL` → the Neon connection string from step 1 (with `+psycopg`)
   - `CORS_ORIGINS` → leave blank for now (the app doesn't actually need it today — the frontend talks to the backend server-to-server, not from the browser — but it's there for safety if that ever changes)
4. Deploy. Render will build and start the service. Note the URL it gives you — something like `https://koylaniti-api.onrender.com`.
5. **Free tier note:** the service spins down after ~15 minutes idle and takes 30-50 seconds to wake up on the next request. Fine for a demo, just don't let it go quiet right before you present — open the URL a minute beforehand to warm it up.

## 3. Seed the live database

Do this once, from your own machine, pointed at the Neon database:

```bash
cd backend
# Windows:
$env:DATABASE_URL = "postgresql+psycopg://user:password@ep-xxxx.neon.tech/neondb?sslmode=require"
# macOS/Linux:
export DATABASE_URL="postgresql+psycopg://user:password@ep-xxxx.neon.tech/neondb?sslmode=require"

.venv/Scripts/python.exe seed.py   # or .venv/bin/python seed.py
```

This wipes and reseeds — same script you've already used locally, just pointed at the cloud database this time. Re-run it any time you want to reset the live demo to its pristine state.

## 4. Frontend — Vercel

1. Go to https://vercel.com and sign up/log in (GitHub login).
2. **Add New** → **Project** → import the `koylaniti` GitHub repo.
3. Vercel will ask for the project settings — set **Root Directory** to `app` (this repo has the Next.js app in a subfolder, not at the repo root).
4. Add one environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL from step 2 (e.g. `https://koylaniti-api.onrender.com`, no trailing slash).
5. Deploy. Vercel gives you a URL like `https://koylaniti.vercel.app` — that's your live link.

## 5. Verify

Open the Vercel URL, log in with `dgms_east` / `demo-2026`, and walk the same flow you already know. If login fails, it's almost always one of: Render still cold-starting (wait ~40s and retry), `NEXT_PUBLIC_API_URL` missing the `https://` or has a trailing slash, or the Neon connection string wasn't seeded yet.

## What won't work live

AI document extraction and AI case-brief generation call a local Ollama instance, which doesn't exist on Render's free tier. Both are built to fail gracefully (the extraction gets marked `FAILED`, the case brief falls back to a plain summary) — nothing crashes, but those two AI touches just won't produce real output in the hosted demo. Everything else (scoring, cases, RBAC, offline sync, the Evidence Graph, contractors, alerts) is plain application logic and works identically to local.
