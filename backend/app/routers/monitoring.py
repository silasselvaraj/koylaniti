from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.deps import require_user
from app.models import User
from app.satellite.mock_data import get_finding_for_mine

router = APIRouter(prefix="/api/v1/monitoring", tags=["monitoring"])


class MonitoringJobIn(BaseModel):
    mine_id: str


@router.post("/jobs")
def trigger_job(body: MonitoringJobIn, user: User = Depends(require_user)):
    """Lookup facade against the mocked findings table - not a real async job (see plan)."""
    finding = get_finding_for_mine(body.mine_id)
    if finding is None:
        raise HTTPException(404, "No imagery in demo dataset for this mine")
    return finding


@router.get("/mines/{mine_id}")
def get_mine_monitoring(mine_id: str, user: User = Depends(require_user)):
    finding = get_finding_for_mine(mine_id)
    if finding is None:
        raise HTTPException(404, "No imagery in demo dataset for this mine")
    return finding
