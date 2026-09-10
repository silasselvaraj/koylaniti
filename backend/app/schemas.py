from datetime import date, datetime

from pydantic import BaseModel


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
    detected_at: datetime

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

    model_config = {"from_attributes": True}


class CaseAssignIn(BaseModel):
    user_id: int


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
