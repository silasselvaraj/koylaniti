from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Mine, Notification, User


def notify_oversight(db: Session, mine: Mine, message: str, case_id: str | None = None) -> None:
    """Fans out one Notification to every MINISTRY_ADMIN plus every DGMS_OFFICER whose
    jurisdiction covers this mine. Adds but does not commit - caller commits, same
    convention as audit.py::log_event."""
    stmt = select(User).where(
        or_(
            User.role == "MINISTRY_ADMIN",
            (User.role == "DGMS_OFFICER") & (User.jurisdiction_state == mine.state),
        )
    )
    for user in db.scalars(stmt):
        db.add(Notification(user_id=user.id, case_id=case_id, message=message))
