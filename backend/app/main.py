import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import env  # noqa: F401 - side-effect import, loads .env first
from app.limiter import limiter
from app.routers import (
    auth,
    cases,
    complaints,
    contractors,
    documents,
    inspections,
    mines,
    monitoring,
    notifications,
    reports,
    rules,
    users,
)

app = FastAPI(title="SIH26024 Coal Mine Compliance API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

_default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_extra_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(mines.router)
app.include_router(documents.router)
app.include_router(inspections.router)
app.include_router(cases.router)
app.include_router(monitoring.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(users.router)
app.include_router(rules.router)
app.include_router(contractors.router)
app.include_router(complaints.router)


@app.get("/health")
def health():
    return {"status": "ok"}
