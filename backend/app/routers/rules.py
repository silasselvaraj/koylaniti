from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import Rule, User
from app.schemas import RuleOut

router = APIRouter(prefix="/api/v1/rules", tags=["rules"])


@router.get("", response_model=list[RuleOut])
def list_rules(domain: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = select(Rule)
    if domain:
        stmt = stmt.where(Rule.domain == domain.upper())
    return db.scalars(stmt.order_by(Rule.id)).all()
