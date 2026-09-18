# KoylaNiti

**AI-Based Smart Governance and Compliance Monitoring System for Coal Mines**
Smart India Hackathon 2026 — Problem Statement SIH26024, Ministry of Coal, Software Track

Every coal mine's compliance status is fused from three signal types — statutory documents, field inspections, and satellite monitoring — into one continuously-updated, explainable score. When a mine's score drops too low, the system opens a case automatically and routes it through a closed loop: detect → assign → inspect → verify → close, with a full audit trail at every step.

> All mine, workforce, contractor, and environmental data in this prototype is **synthetic demo data**, clearly labelled as such. Rule/control identifiers (e.g. `CMR-SAFE-001`) are internal "KoylaNiti Control ID"s, not official regulation citations. AI assists prioritisation and document-field extraction; it never decides legal compliance.

## The core idea

- **Explainable compliance score** — four weighted domains (Statutory Documents 30%, Safety/Field Inspection 35%, Environmental/Satellite 25%, Operational 10%), always shown as a breakdown with the specific findings behind it, never an opaque number.
- **Compliance Evidence Graph** — every case traces its full chain: control → evidence → field observation → risk contribution → corrective action → closure evidence → authorized verification → audit timeline.
- **Closed-loop case workflow** — `DETECTED → TRIAGED → ASSIGNED → INSPECTION/REMEDIATION → EVIDENCE SUBMITTED → VERIFIED → CLOSED`, enforced server-side; a case cannot close while a linked finding is still open.
- **Offline-first field app** — inspectors capture GPS + timestamp + photo evidence on-site, queue it locally when offline, and sync in one batch (idempotent) on reconnect.
- **SLA + escalation** — corrective actions carry a due date and escalation target; overdue cases and critical findings fan out in-app alerts to the relevant oversight officers.
- **Role-based access, enforced server-side** — Ministry Admin (all mines), DGMS Officer (own jurisdiction), Mine Manager (own mine), Field Inspector (own assignments) — a role can never see or act beyond its scope, verified by API tests, not just hidden UI.
- **Bilingual (English / Hindi)** — a one-tap EN/हिंदी toggle on every screen (header and login), choice remembered across sessions; formal Hindi throughout, with all UI chrome translated and a warm earth-tone/cream visual theme.

## Tech stack

- **Frontend**: Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind v4, Leaflet, hand-rolled i18n (English/Hindi)
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL, JWT auth
- **AI**: local Ollama (Qwen 2.5) for document field extraction and case-brief generation — deterministic rule engine and score model, not AI, decide compliance

## Running locally

Requires PostgreSQL running locally and (optionally, for AI extraction) [Ollama](https://ollama.com) with `qwen2.5:0.5b` pulled.

```bash
# Backend
cd backend
python -m venv .venv && .venv/Scripts/activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and SECRET_KEY
python seed.py          # wipes and seeds demo data
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd app
npm install
npm run dev
```

Open `http://localhost:3000`. Demo accounts (password `demo-2026` for all): `admin` (Ministry Admin), `dgms_east` (DGMS Officer, Chhattisgarh), `manager3` (Mine Manager), `inspector1` (Field Inspector).

## Deployment

- Frontend → Vercel (set `NEXT_PUBLIC_API_URL` to the deployed backend URL)
- Backend → Render (`render.yaml` blueprint included; set `DATABASE_URL`, `CORS_ORIGINS` env vars)
- Database → Neon (or any managed Postgres)

AI features (document extraction, case briefs) require a reachable Ollama instance; they fail gracefully (logged, not crashed) if unavailable in a hosted environment.
