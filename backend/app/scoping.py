from sqlalchemy import Select

from app.models import Case, ComplianceFinding, Document, Inspection, Mine, User


def scope_mines(user: User, stmt: Select) -> Select:
    """Restrict a query (selecting from/joined to Mine) to what `user`'s role may see."""
    if user.role in ("MINISTRY_ADMIN",):
        return stmt
    if user.role == "DGMS_OFFICER":
        return stmt.where(Mine.state == user.jurisdiction_state)
    if user.role == "MINE_MANAGER":
        return stmt.where(Mine.id == user.mine_id)
    if user.role == "FIELD_INSPECTOR":
        return stmt.where(
            Mine.id.in_(
                Case.__table__.select().with_only_columns(Case.mine_id).where(
                    Case.assigned_to_user_id == user.id
                )
            )
        )
    return stmt.where(False)


def scope_by_mine_fk(user: User, model, stmt: Select) -> Select:
    """For tables with a mine_id column (Document, Inspection, Case, ComplianceFinding)."""
    if user.role == "MINISTRY_ADMIN":
        return stmt
    if user.role == "DGMS_OFFICER":
        return stmt.join(Mine, Mine.id == model.mine_id).where(Mine.state == user.jurisdiction_state)
    if user.role == "MINE_MANAGER":
        return stmt.where(model.mine_id == user.mine_id)
    if user.role == "FIELD_INSPECTOR":
        if model is Inspection:
            return stmt.where(model.inspector_user_id == user.id)
        if model is Case:
            return stmt.where(model.assigned_to_user_id == user.id)
        return stmt.where(False)
    return stmt.where(False)


__all__ = ["scope_mines", "scope_by_mine_fk", "Case", "ComplianceFinding", "Document", "Inspection"]
