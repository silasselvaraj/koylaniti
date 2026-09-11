from datetime import date, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, LargeBinary, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

ROLES = ("MINISTRY_ADMIN", "DGMS_OFFICER", "MINE_MANAGER", "FIELD_INSPECTOR")
DOMAINS = ("STATUTORY", "SAFETY", "ENVIRONMENTAL", "OPERATIONAL")
BANDS = ("GREEN", "YELLOW", "RED")
REPORT_TYPES = ("Compliance Observation", "Safety Incident", "Environmental Observation", "Operational Exception")
SEVERITIES = ("LOW", "MEDIUM", "HIGH", "CRITICAL")
CASE_STATUSES = (
    "DETECTED",
    "TRIAGED",
    "ASSIGNED",
    "INSPECTION_REMEDIATION",
    "EVIDENCE_SUBMITTED",
    "VERIFIED",
    "CLOSED",
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]
    role: Mapped[str] = mapped_column(default="FIELD_INSPECTOR")
    full_name: Mapped[str]
    jurisdiction_state: Mapped[str | None] = mapped_column(default=None)
    mine_id: Mapped[str | None] = mapped_column(ForeignKey("mines.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Mine(Base):
    __tablename__ = "mines"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    state: Mapped[str]
    district: Mapped[str]
    mine_type: Mapped[str] = mapped_column(default="Opencast")
    latitude: Mapped[float]
    longitude: Mapped[float]
    boundary_polygon: Mapped[list] = mapped_column(JSON, default=list)
    manager_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", use_alter=True, name="fk_mines_manager_user_id"), default=None
    )
    current_score: Mapped[float | None] = mapped_column(default=None)
    current_band: Mapped[str | None] = mapped_column(default=None)
    last_scored_at: Mapped[datetime | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Rule(Base):
    __tablename__ = "rules"

    id: Mapped[str] = mapped_column(primary_key=True)
    rule_version: Mapped[int] = mapped_column(default=1)
    domain: Mapped[str]
    source: Mapped[str]
    description: Mapped[str]
    check_type: Mapped[str]
    threshold: Mapped[dict] = mapped_column(JSON, default=dict)
    severity: Mapped[str]
    evidence_required: Mapped[str]
    active_from: Mapped[datetime] = mapped_column(server_default=func.now())
    active_to: Mapped[datetime | None] = mapped_column(default=None)
    active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(primary_key=True)
    mine_id: Mapped[str] = mapped_column(ForeignKey("mines.id", ondelete="CASCADE"))
    uploaded_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    doc_type: Mapped[str] = mapped_column(default="Other")
    filename: Mapped[str]
    content_type: Mapped[str] = mapped_column(default="application/octet-stream")
    size: Mapped[int]
    data: Mapped[bytes] = mapped_column(LargeBinary)
    raw_text: Mapped[str | None] = mapped_column(default=None)
    extracted_issue_date: Mapped[date | None] = mapped_column(default=None)
    extracted_expiry_date: Mapped[date | None] = mapped_column(default=None)
    extracted_permit_number: Mapped[str | None] = mapped_column(default=None)
    extraction_status: Mapped[str] = mapped_column(default="PENDING")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    mine: Mapped["Mine"] = relationship()


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(primary_key=True)
    client_id: Mapped[str] = mapped_column(unique=True)
    mine_id: Mapped[str] = mapped_column(ForeignKey("mines.id", ondelete="CASCADE"))
    inspector_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    case_id: Mapped[str | None] = mapped_column(ForeignKey("cases.id"), default=None)
    report_type: Mapped[str] = mapped_column(default="Compliance Observation")
    checklist_answers: Mapped[list] = mapped_column(JSON, default=list)
    gps_lat: Mapped[float | None] = mapped_column(default=None)
    gps_lng: Mapped[float | None] = mapped_column(default=None)
    photo_data: Mapped[bytes | None] = mapped_column(LargeBinary, default=None)
    photo_content_type: Mapped[str | None] = mapped_column(default=None)
    notes: Mapped[str | None] = mapped_column(default=None)
    sync_status: Mapped[str] = mapped_column(default="ACKNOWLEDGED")
    submitted_at: Mapped[datetime | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @property
    def has_photo(self) -> bool:
        return self.photo_data is not None


class Contractor(Base):
    __tablename__ = "contractors"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    contact_person: Mapped[str | None] = mapped_column(default=None)
    phone: Mapped[str | None] = mapped_column(default=None)
    license_number: Mapped[str | None] = mapped_column(default=None)
    specialization: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class ComplianceFinding(Base):
    __tablename__ = "compliance_findings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    mine_id: Mapped[str] = mapped_column(ForeignKey("mines.id", ondelete="CASCADE"))
    rule_id: Mapped[str | None] = mapped_column(ForeignKey("rules.id"), default=None)
    domain: Mapped[str]
    source_type: Mapped[str]
    source_id: Mapped[str | None] = mapped_column(default=None)
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    severity: Mapped[str]
    status: Mapped[str] = mapped_column(default="OPEN")
    description: Mapped[str]
    score_impact: Mapped[float]
    case_id: Mapped[str | None] = mapped_column(ForeignKey("cases.id"), default=None)
    contractor_id: Mapped[str | None] = mapped_column(ForeignKey("contractors.id"), default=None)
    detected_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(primary_key=True)
    mine_id: Mapped[str] = mapped_column(ForeignKey("mines.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(default="DETECTED")
    severity: Mapped[str]
    title: Mapped[str]
    ai_brief: Mapped[str | None] = mapped_column(default=None)
    assigned_to_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), default=None)
    created_by: Mapped[str] = mapped_column(default="SYSTEM")
    verification_inspection_id: Mapped[str | None] = mapped_column(default=None)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    escalation_target: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    closed_at: Mapped[datetime | None] = mapped_column(default=None)

    mine: Mapped["Mine"] = relationship()


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    case_id: Mapped[str | None] = mapped_column(ForeignKey("cases.id"), default=None)
    message: Mapped[str]
    read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_type: Mapped[str]
    mine_id: Mapped[str | None] = mapped_column(default=None)
    case_id: Mapped[str | None] = mapped_column(default=None)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), default=None)
    detail: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
