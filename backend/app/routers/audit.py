from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.audit import verify_chain
from app.database import get_db
from app.deps import require_dgms_officer
from app.models import User
from app.schemas import AuditChainVerification

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.get("/verify", response_model=AuditChainVerification)
def verify_audit_chain(db: Session = Depends(get_db), user: User = Depends(require_dgms_officer)):
    return verify_chain(db)
