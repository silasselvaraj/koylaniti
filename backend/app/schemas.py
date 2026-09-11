from datetime import date, datetime, timezone

from pydantic import BaseModel, computed_field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    role: str
    user_id: int
    full_name: str


class MeResponse(BaseModel):
    id: int
    username: str
    role: str
    full_name: str
    jurisdiction_state: str | None
    mine_id: str | None


class MineOut(BaseModel):
    id: str
    name: str
    state: str
    district: str
    mine_type: str
    latitude: float
    longitude: float
    boundary_polygon: list
    current_score: float | None
    current_band: str | None
    last_scored_at: datetime | None

    model_config = {"from_attributes": True}


class FindingOut(BaseModel):
    id: int
    rule_id: str | None
    domain: str
    source_type: str
    severity: str
    status: str
    description: str
    score_impact: float
    detail: dict
    case_id: str | None
    contractor_id: str | None
    detected_at: datetime

    model_config = {"from_attributes": True}


class ContractorOut(BaseModel):
    id: str
    name: str
    contact_person: str | None
    phone: str | None
    license_number: str | None
    specialization: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RuleOut(BaseModel):
    id: str
    domain: str
    source: str
    description: str
    severity: str
    evidence_required: str
    check_type: str

    model_config = {"from_attributes": True}


class AuditLogOut(BaseModel):
    id: int
    event_type: str
    mine_id: str | None
    case_id: str | None
    user_id: int | None
    detail: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentOut(BaseModel):
    id: str
    mine_id: str
    doc_type: str
    filename: str
    size: int
    raw_text: str | None
    extracted_issue_date: date | None
    extracted_expiry_date: date | None
    extracted_permit_number: str | None
    extraction_status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InspectionIn(BaseModel):
    client_id: str
    mine_id: str
    case_id: str | None = None
    report_type: str = "Compliance Observation"
    checklist_answers: list
    gps_lat: float | None = None
    gps_lng: float | None = None
    notes: str | None = None
    submitted_at: datetime | None = None
    photo_base64: str | None = None
    photo_content_type: str | None = None


class InspectionOut(BaseModel):
    id: str
    client_id: str
    mine_id: str
    inspector_user_id: int
    case_id: str | None
    report_type: str
    checklist_answers: list
    gps_lat: float | None
    gps_lng: float | None
    notes: str | None
    sync_status: str
    submitted_at: datetime | None
    created_at: datetime
    has_photo: bool = False

    model_config = {"from_attributes": True}


class CaseOut(BaseModel):
    id: str
    mine_id: str
    status: str
    severity: str
    title: str
    ai_brief: str | None
    assigned_to_user_id: int | None
    created_by: str
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
    due_date: datetime | None
    escalation_target: str | None

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def is_overdue(self) -> bool:
        if self.due_date is None or self.status == "CLOSED":
            return False
        due = self.due_date if self.due_date.tzinfo else self.due_date.replace(tzinfo=timezone.utc)
        return due < datetime.now(timezone.utc)


class CaseAssignIn(BaseModel):
    user_id: int
    due_date: datetime | None = None
    escalation_target: str | None = None


class CaseResolveIn(BaseModel):
    reason: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    full_name: str
    jurisdiction_state: str | None
    mine_id: str | None

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: int
    case_id: str | None
    message: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicMineOut(BaseModel):
    """Score-free mine listing for the anonymous complaint form."""

    id: str
    name: str
    state: str
    district: str

    model_config = {"from_attributes": True}


class PublicComplaintStatusOut(BaseModel):
    id: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicComplaintOut(BaseModel):
    id: str
    mine_id: str
    category: str
    description: str
    status: str
    case_id: str | None
    reviewed_by_user_id: int | None
    review_notes: str | None
    ai_summary: str | None
    created_at: datetime
    has_photo: bool = False

    model_config = {"from_attributes": True}


class ComplaintReviewIn(BaseModel):
    notes: str | None = None
