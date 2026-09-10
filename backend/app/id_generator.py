from sqlalchemy import select
from sqlalchemy.orm import Session


def next_id(db: Session, model, id_column, prefix: str, start: int = 1000) -> str:
    """Scan existing IDs matching `prefix-*` and return prefix-(max+1)."""
    existing = db.scalars(select(id_column).where(id_column.like(f"{prefix}-%"))).all()
    max_seq = start - 1
    for existing_id in existing:
        try:
            seq = int(existing_id.split("-", 1)[1])
        except (IndexError, ValueError):
            continue
        max_seq = max(max_seq, seq)
    return f"{prefix}-{max_seq + 1}"
