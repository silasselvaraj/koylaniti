from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_dgms_officer
from app.models import User
from app.schemas import UserOut

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(
    role: str | None = None,
    jurisdiction: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role.upper())
    if jurisdiction:
        stmt = stmt.where(User.jurisdiction_state == jurisdiction)
    return db.scalars(stmt.order_by(User.full_name)).all()
