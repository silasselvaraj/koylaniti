import base64

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import log_event
from app.database import get_db
from app.deps import require_dgms_officer, require_field_inspector, require_user
from app.id_generator import next_id
from app.models import Case, Inspection, User
from app.routers.cases import transition
from app.schemas import InspectionIn, InspectionOut
from app.scoping import scope_by_mine_fk

router = APIRouter(prefix="/api/v1", tags=["inspections"])


def _create_or_get(db: Session, body: InspectionIn, user: User) -> Inspection:
    existing = db.scalars(select(Inspection).where(Inspection.client_id == body.client_id)).first()
    if existing is not None:
        return existing

    photo_data = None
    if body.photo_base64:
        try:
            photo_data = base64.b64decode(body.photo_base64)
        except (ValueError, TypeError):
            photo_data = None

    inspection_id = next_id(db, Inspection, Inspection.id, "INSP")
    inspection = Inspection(
        id=inspection_id,
        client_id=body.client_id,
        mine_id=body.mine_id,
        inspector_user_id=user.id,
        case_id=body.case_id,
        report_type=body.report_type,
        checklist_answers=body.checklist_answers,
        gps_lat=body.gps_lat,
        gps_lng=body.gps_lng,
        photo_data=photo_data,
        photo_content_type=body.photo_content_type if photo_data else None,
        notes=body.notes,
        sync_status="ACKNOWLEDGED",
        submitted_at=body.submitted_at,
    )
    db.add(inspection)
    log_event(db, "inspection_submitted", mine_id=body.mine_id, case_id=body.case_id, user_id=user.id, detail=inspection_id)

    if body.case_id:
        case = db.get(Case, body.case_id)
        if case is not None and case.status in ("ASSIGNED", "INSPECTION_REMEDIATION"):
            transition(db, case, "EVIDENCE_SUBMITTED", user, detail=f"inspection={inspection_id}")
            case.verification_inspection_id = inspection_id

    db.commit()
    return inspection


@router.post("/inspections", response_model=InspectionOut)
def create_inspection(body: InspectionIn, db: Session = Depends(get_db), user: User = Depends(require_field_inspector)):
    return _create_or_get(db, body, user)


@router.post("/sync/batch", response_model=list[InspectionOut])
def sync_batch(items: list[InspectionIn], db: Session = Depends(get_db), user: User = Depends(require_field_inspector)):
    return [_create_or_get(db, item, user) for item in items]


@router.get("/inspections/{inspection_id}/photo")
def get_inspection_photo(inspection_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = scope_by_mine_fk(user, Inspection, select(Inspection).where(Inspection.id == inspection_id))
    inspection = db.scalars(stmt).first()
    if inspection is None or inspection.photo_data is None:
        raise HTTPException(404, "No photo for this inspection")
    return Response(content=inspection.photo_data, media_type=inspection.photo_content_type or "image/jpeg")


@router.get("/inspections/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    stmt = scope_by_mine_fk(user, Inspection, select(Inspection).where(Inspection.id == inspection_id))
    inspection = db.scalars(stmt).first()
    if inspection is None:
        raise HTTPException(404, "Inspection not found")
    return inspection


@router.get("/inspections", response_model=list[InspectionOut])
def list_inspections(
    mine_id: str | None = None,
    case_id: str | None = None,
    standalone: bool | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    stmt = scope_by_mine_fk(user, Inspection, select(Inspection))
    if mine_id:
        stmt = stmt.where(Inspection.mine_id == mine_id)
    if case_id:
        stmt = stmt.where(Inspection.case_id == case_id)
    if standalone:
        stmt = stmt.where(Inspection.case_id.is_(None))
    return db.scalars(stmt.order_by(Inspection.created_at.desc())).all()


@router.post("/inspections/{inspection_id}/review")
def review_inspection(
    inspection_id: str, db: Session = Depends(get_db), user: User = Depends(require_dgms_officer)
):
    stmt = scope_by_mine_fk(user, Inspection, select(Inspection).where(Inspection.id == inspection_id))
    inspection = db.scalars(stmt).first()
    if inspection is None:
        raise HTTPException(404, "Inspection not found")
    log_event(db, "field_report_reviewed", mine_id=inspection.mine_id, user_id=user.id, detail=inspection_id)
    db.commit()
    return {"status": "reviewed"}
