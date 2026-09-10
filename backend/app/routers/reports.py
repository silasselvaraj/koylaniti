from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import Case, Mine, User
from app.scoping import scope_mines

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/compliance")
def compliance_report(state: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_user)):
    mine_stmt = scope_mines(user, select(Mine))
    if state:
        mine_stmt = mine_stmt.where(Mine.state == state)
    mines = db.scalars(mine_stmt).all()

    band_counts = {"GREEN": 0, "YELLOW": 0, "RED": 0, "UNSCORED": 0}
    for m in mines:
        band_counts[m.current_band or "UNSCORED"] += 1

    mine_ids = [m.id for m in mines]
    case_counts: dict[str, int] = {}
    if mine_ids:
        rows = db.execute(
            select(Case.status, func.count(Case.id)).where(Case.mine_id.in_(mine_ids)).group_by(Case.status)
        ).all()
        case_counts = {status: count for status, count in rows}

    avg_score = sum(m.current_score for m in mines if m.current_score is not None) / max(
        1, len([m for m in mines if m.current_score is not None])
    )

    return {
        "total_mines": len(mines),
        "band_counts": band_counts,
        "case_counts": case_counts,
        "avg_score": round(avg_score, 1) if mines else None,
    }
