from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.case_brief import run_case_brief_generation
from app.audit import log_event
from app.database import get_db
from app.deps import require_dgms_officer, require_mine_manager, require_user
from app.models import AuditLog, Case, ComplianceFinding, Mine, Notification, User
from app.notifications_helpers import notify_oversight
from app.schemas import AuditLogOut, CaseAssignIn, CaseOut, CaseResolveIn
from app.scoping import scope_by_mine_fk
from app.scoring.engine import compute_mine_score

NEAR_DUE_THRESHOLD = timedelta(hours=48)

router = APIRouter(prefix="/api/v1/cases", tags=["cases"])

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "DETECTED": {"TRIAGED", "ASSIGNED"},
    "TRIAGED": {"ASSIGNED"},
    "ASSIGNED": {"INSPECTION_REMEDIATION", "EVIDENCE_SUBMITTED"},
    "INSPECTION_REMEDIATION": {"EVIDENCE_SUBMITTED"},
    "EVIDENCE_SUBMITTED": {"VERIFIED"},
    "VERIFIED": {"CLOSED"},
    "CLOSED": set(),
}


def _get_visible_case(db: Session, case_id: str, user: User) -> Case:
    stmt = scope_by_mine_fk(user, Case, select(Case).where(Case.id == case_id))
    case = db.scalars(stmt).first()
    if case is None:
        raise HTTPException(404, "Case not found")
    return case


def transition(db: Session, case: Case, new_status: str, user: User, detail: str | None = None) -> None:
    if new_status not in ALLOWED_TRANSITIONS.get(case.status, set()):
        raise HTTPException(400, f"Cannot move case from {case.status} to {new_status}")
    old_status = case.status
    case.status = new_status
    if new_status == "CLOSED":
        case.closed_at = datetime.now(timezone.utc)
    log_event(db, "case_transition", mine_id=case.mine_id, case_id=case.id, user_id=user.id, detail=f"{old_status}->{new_status}: {detail or ''}")


@router.get("", response_model=list[CaseOut])
def list_cases(
    status: str | None = None,
    severity: str | None = None,
    mine_id: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    stmt = scope_by_mine_fk(user, Case, select(Case))
    if status:
        stmt = stmt.where(Case.status == status.upper())
    if severity:
        stmt = stmt.where(Case.severity == severity.upper())
    if mine_id:
        stmt = stmt.where(Case.mine_id == mine_id)
    return db.scalars(stmt.order_by(Case.created_at.desc())).all()


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    return _get_visible_case(db, case_id, user)


@router.get("/{case_id}/audit", response_model=list[AuditLogOut])
def get_case_audit(case_id: str, db: Session = Depends(get_db), user: User = Depends(require_user)):
    _get_visible_case(db, case_id, user)  # visibility check
    stmt = select(AuditLog).where(AuditLog.case_id == case_id).order_by(AuditLog.created_at)
    return db.scalars(stmt).all()


@router.post("/{case_id}/assign", response_model=CaseOut)
def assign_case(
    case_id: str,
    body: CaseAssignIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    case = _get_visible_case(db, case_id, user)
    assignee = db.get(User, body.user_id)
    if assignee is None or assignee.role != "FIELD_INSPECTOR":
        raise HTTPException(400, "Assignee must be a field inspector")
    transition(db, case, "ASSIGNED", user, detail=f"assigned_to={assignee.id}")
    case.assigned_to_user_id = assignee.id
    case.due_date = body.due_date
    case.escalation_target = body.escalation_target
    db.add(Notification(user_id=assignee.id, case_id=case.id, message=f"You were assigned case {case.id}"))
    if body.due_date is not None:
        due = body.due_date if body.due_date.tzinfo else body.due_date.replace(tzinfo=timezone.utc)
        if due - datetime.now(timezone.utc) < NEAR_DUE_THRESHOLD:
            mine = db.get(Mine, case.mine_id)
            notify_oversight(
                db, mine, f"Case {case.id} has a near/overdue SLA (due {due.date().isoformat()}).", case_id=case.id
            )
    db.commit()
    if case.ai_brief is None:
        background_tasks.add_task(run_case_brief_generation, case.id)
    return case


@router.post("/{case_id}/evidence", response_model=CaseOut)
def submit_evidence(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_mine_manager),
):
    case = _get_visible_case(db, case_id, user)
    if case.status in ("ASSIGNED", "INSPECTION_REMEDIATION"):
        transition(db, case, "EVIDENCE_SUBMITTED", user, detail="manager_evidence")
    db.commit()
    return case


@router.post("/{case_id}/verify", response_model=CaseOut)
def verify_case(case_id: str, db: Session = Depends(get_db), user: User = Depends(require_dgms_officer)):
    case = _get_visible_case(db, case_id, user)
    transition(db, case, "VERIFIED", user)
    # Verification is the point where a DGMS officer confirms the submitted evidence
    # actually addresses the findings - that's when they become RESOLVED, not later.
    findings = db.scalars(
        select(ComplianceFinding).where(ComplianceFinding.case_id == case_id, ComplianceFinding.status == "OPEN")
    ).all()
    for f in findings:
        f.status = "RESOLVED"
    db.commit()
    compute_mine_score(db, case.mine_id)
    return case


@router.post("/{case_id}/resolve", response_model=CaseOut)
def resolve_case(
    case_id: str,
    body: CaseResolveIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_dgms_officer),
):
    case = _get_visible_case(db, case_id, user)
    open_findings = db.scalars(
        select(ComplianceFinding).where(ComplianceFinding.case_id == case_id, ComplianceFinding.status == "OPEN")
    ).all()
    if open_findings:
        raise HTTPException(
            400, f"Cannot close case: {len(open_findings)} linked finding(s) still OPEN - verify evidence first."
        )
    transition(db, case, "CLOSED", user, detail=body.reason)
    db.commit()
    # A different, still-open finding on this mine (not linked to this case) may have
    # kept it RED - give that finding's own case-creation path a chance to fire.
    compute_mine_score(db, case.mine_id)
    return case
