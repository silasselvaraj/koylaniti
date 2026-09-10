from sqlalchemy.orm import Session

from app.models import AuditLog


def log_event(
    db: Session,
    event_type: str,
    *,
    mine_id: str | None = None,
    case_id: str | None = None,
    user_id: int | None = None,
    detail: str | None = None,
) -> None:
    """Adds but does not commit - caller's own db.commit() covers this write."""
    db.add(
        AuditLog(
            event_type=event_type,
            mine_id=mine_id,
            case_id=case_id,
            user_id=user_id,
            detail=detail,
        )
    )
