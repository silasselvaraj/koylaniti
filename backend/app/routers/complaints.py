from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.complaint_summary import run_complaint_summary
from app.audit import log_event
from app.database import get_db
from app.deps import require_dgms_officer, require_user
from app.id_generator import next_id
from app.limiter import limiter
from app.models import Case, Mine, PublicComplaint, User
from app.schemas import ComplaintReviewIn, PublicComplaintOut, PublicComplaintStatusOut, PublicMineOut
from app.scoping import scope_by_mine_fk

router = APIRouter(prefix="/api/v1", tags=["complaints"])

MAX_FILE_SIZE = 10 * 1024 * 1024
CATEGORIES = ("Safety", "Environmental", "Labour/Worker", "Corruption/Malpractice", "Other")

# --- Public, unauthenticated endpoints ---------------------------------------------


@router.get("/public/mines", response_model=list[PublicMineOut])
def list_public_mines(db: Session = Depends(get_db)):
    return db.scalars(select(Mine).order_by(Mine.name)).all()


@router.post("/public/complaints", response_model=PublicComplaintStatusOut)
@limiter.limit("10/hour")
async def submit_complaint(
    request: Request,
    background_tasks: BackgroundTasks,
    mine_id: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    website: str = Form(""),  # honeypot - real users never see or fill this field
    photo: UploadFile | None = None,
    db: Session = Depends(get_db),
):
    if website:
        raise HTTPException(400, "Submission rejected")
    if category not in CATEGORIES:
        category = "Other"
    mine = db.get(Mine, mine_id)
    if mine is None:
        raise HTTPException(400, "Unknown mine")

    photo_data, photo_content_type = None, None
    if photo is not None:
        data = await photo.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(413, "Photo too large (10MB max)")
        if data:
            photo_data, photo_content_type = data, photo.content_type or "image/jpeg"

    complaint_id = next_id(db, PublicComplaint, PublicComplaint.id, "COMP")
    complaint = PublicComplaint(
        id=complaint_id,
        mine_id=mine_id,
        category=category,
        description=description,
        photo_data=photo_data,
        photo_content_type=photo_content_type,
        status="NEW",
    )
    db.add(complaint)
    log_event(db, "complaint_submitted", mine_id=mine_id, detail=complaint_id)
    db.commit()

    background_tasks.add_task(run_complaint_summary, complaint_id)
    return complaint


@router.get("/public/complaints/{complaint_id}/status", response_model=PublicComplaintStatusOut)
def get_complaint_status(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.get(PublicComplaint, complaint_id)
    if complaint is None:
        raise HTTPException(404, "No complaint found with that ID")
    return complaint


# --- Authenticated triage endpoints ------------------------------------------------


def _get_visible_complaint(db: Session, complaint_id: str, user: User) -> PublicComplaint:
    stmt = scope_by_mine_fk(
        user, PublicComplaint, select(PublicComplaint).where(PublicComplaint.id == complaint_id)
    )
    complaint = db.scalars(stmt).first()
    if complaint is None:
        raise HTTPException(404, "Complaint not found")
    return complaint


@router.get("/complaints", response_model=list[PublicComplaintOut])
def list_complaints(
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    stmt = scope_by_mine_fk(user, PublicComplaint, select(PublicComplaint))
    if status:
        stmt = stmt.where(PublicComplaint.status == status.upper())
    return db.scalars(stmt.order_by(PublicComplaint.created_at.desc())).all()


@router.get("/complaints/{complaint_id}", response_model=PublicComplaintOut)
def get_complaint(complaint_id: str, db: Session = Depends(get_db), user: User = Depends(require_dgms_officer)):
    return _get_visible_complaint(db, complaint_id, user)


@router.get("/complaints/{complaint_id}/photo")
def get_complaint_photo(
    complaint_id: str, db: Session = Depends(get_db), user: User = Depends(require_dgms_officer)
):
    complaint = _get_visible_complaint(db, complaint_id, user)
    if complaint.photo_data is None:
        raise HTTPException(404, "No photo for this complaint")
    return Response(content=complaint.photo_data, media_type=complaint.photo_content_type or "image/jpeg")


@router.post("/complaints/{complaint_id}/dismiss", response_model=PublicComplaintOut)
def dismiss_complaint(
    complaint_id: str,
    body: ComplaintReviewIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    complaint = _get_visible_complaint(db, complaint_id, user)
    complaint.status = "DISMISSED"
    complaint.reviewed_by_user_id = user.id
    complaint.review_notes = body.notes
    log_event(db, "complaint_dismissed", mine_id=complaint.mine_id, user_id=user.id, detail=complaint_id)
    db.commit()
    return complaint


@router.post("/complaints/{complaint_id}/escalate", response_model=PublicComplaintOut)
def escalate_complaint(
    complaint_id: str,
    body: ComplaintReviewIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    complaint = _get_visible_complaint(db, complaint_id, user)
    if complaint.status == "ESCALATED":
        raise HTTPException(400, "Complaint already escalated")

    case_id = next_id(db, Case, Case.id, "CASE")
    case = Case(
        id=case_id,
        mine_id=complaint.mine_id,
        status="DETECTED",
        severity="MEDIUM",
        title=f"Public complaint: {complaint.category}",
        created_by="PUBLIC_COMPLAINT",
    )
    db.add(case)
    db.flush()  # case row must exist before the complaint can reference it

    complaint.status = "ESCALATED"
    complaint.case_id = case_id
    complaint.reviewed_by_user_id = user.id
    complaint.review_notes = body.notes
    log_event(db, "complaint_escalated", mine_id=complaint.mine_id, case_id=case_id, user_id=user.id, detail=complaint_id)
    log_event(db, "case_auto_created", mine_id=complaint.mine_id, case_id=case_id, detail=f"from complaint {complaint_id}")
    db.commit()
    return complaint
