import hashlib

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuditLog

# First row in the chain has no real predecessor - a fixed, well-known genesis value
# (not a secret) so verification has a deterministic starting point.
GENESIS_HASH = "0" * 64


def _compute_hash(
    event_type: str,
    mine_id: str | None,
    case_id: str | None,
    user_id: int | None,
    detail: str | None,
    prev_hash: str,
) -> str:
    # created_at is deliberately excluded - it's a server-assigned default not known
    # until after insert, so including it would make this non-reproducible at write time.
    payload = f"{event_type}|{mine_id or ''}|{case_id or ''}|{user_id or ''}|{detail or ''}|{prev_hash}"
    return hashlib.sha256(payload.encode()).hexdigest()


def log_event(
    db: Session,
    event_type: str,
    *,
    mine_id: str | None = None,
    case_id: str | None = None,
    user_id: int | None = None,
    detail: str | None = None,
) -> None:
    """Adds and flushes (does not commit - caller's own db.commit() covers this write).
    Flushes, unlike the rest of this app's usual 'add only' convention, specifically so
    the hash chain stays correct when a single request logs more than one event before
    committing (several routes do exactly this) - each call must see the previous one's
    row to chain onto it."""
    last = db.scalars(select(AuditLog).order_by(AuditLog.id.desc())).first()
    prev_hash = last.hash if last else GENESIS_HASH
    new_hash = _compute_hash(event_type, mine_id, case_id, user_id, detail, prev_hash)
    db.add(
        AuditLog(
            event_type=event_type,
            mine_id=mine_id,
            case_id=case_id,
            user_id=user_id,
            detail=detail,
            prev_hash=prev_hash,
            hash=new_hash,
        )
    )
    db.flush()


def verify_chain(db: Session) -> dict:
    """Walks every audit event in insertion order and recomputes each hash to confirm
    nothing has been altered, inserted out of order, or deleted. This detects tampering
    after the fact - it does not prevent a privileged database user from editing rows
    directly (no DB-level trigger enforces this); the guarantee is that doing so is
    detectable, not that it's impossible."""
    rows = db.scalars(select(AuditLog).order_by(AuditLog.id)).all()
    prev_hash = GENESIS_HASH
    for row in rows:
        expected = _compute_hash(row.event_type, row.mine_id, row.case_id, row.user_id, row.detail, prev_hash)
        if row.prev_hash != prev_hash or row.hash != expected:
            return {"valid": False, "total_events": len(rows), "broken_at_id": row.id}
        prev_hash = row.hash
    return {"valid": True, "total_events": len(rows), "broken_at_id": None}
