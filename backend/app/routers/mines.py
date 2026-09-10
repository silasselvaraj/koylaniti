from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import ComplianceFinding, Mine, User
from app.schemas import FindingOut, MineOut
from app.scoping import scope_mines
from app.scoring.engine import compute_mine_score

router = APIRouter(prefix="/api/v1/mines", tags=["mines"])


def _get_visible_mine(db: Session, mine_id: str, user: User) -> Mine:
    stmt = scope_mines(user, select(Mine).where(Mine.id == mine_id))
    mine = db.scalars(stmt).first()
    if mine is None:
        raise HTTPException(404, "Mine not found")
    return mine


@router.get("", response_model=list[MineOut])
def list_mines(
    state: str | None = None,
    risk: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    stmt = scope_mines(user, select(Mine))
    if state:
        stmt = stmt.where(Mine.state == state)
    if risk:
        stmt = stmt.where(Mine.current_band == risk.upper())
    return db.scalars(stmt.order_by(Mine.name)).all()


@router.get("/{mine_id}", response_model=MineOut)
def get_mine(mine_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    return _get_visible_mine(db, mine_id, user)


@router.get("/{mine_id}/compliance")
def get_mine_compliance(mine_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    _get_visible_mine(db, mine_id, user)
    return compute_mine_score(db, mine_id)


@router.get("/{mine_id}/findings", response_model=list[FindingOut])
def get_mine_findings(
    mine_id: str,
    source_type: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    _get_visible_mine(db, mine_id, user)
    stmt = select(ComplianceFinding).where(ComplianceFinding.mine_id == mine_id)
    if source_type:
        stmt = stmt.where(ComplianceFinding.source_type == source_type.upper())
    if status:
        stmt = stmt.where(ComplianceFinding.status == status.upper())
    return db.scalars(stmt.order_by(ComplianceFinding.detected_at.desc())).all()
