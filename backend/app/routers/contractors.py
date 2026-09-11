from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import Case, ComplianceFinding, Contractor, User
from app.schemas import ContractorOut, FindingOut
from app.scoping import scope_by_mine_fk

router = APIRouter(prefix="/api/v1/contractors", tags=["contractors"])


@router.get("", response_model=list[ContractorOut])
def list_contractors(db: Session = Depends(get_db), user: User = Depends(require_user)):
    return db.scalars(select(Contractor).order_by(Contractor.name)).all()


@router.get("/{contractor_id}")
def get_contractor(contractor_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    contractor = db.get(Contractor, contractor_id)
    if contractor is None:
        raise HTTPException(404, "Contractor not found")
    stmt = scope_by_mine_fk(
        user, ComplianceFinding, select(ComplianceFinding).where(ComplianceFinding.contractor_id == contractor_id)
    )
    findings = db.scalars(stmt).all()
    case_ids = {f.case_id for f in findings if f.case_id}
    open_case_ids = sorted(
        db.scalars(select(Case.id).where(Case.id.in_(case_ids), Case.status != "CLOSED")).all()
        if case_ids
        else []
    )
    return {
        "contractor": ContractorOut.model_validate(contractor),
        "findings": [FindingOut.model_validate(f) for f in findings],
        "open_case_ids": open_case_ids,
    }
