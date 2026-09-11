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
        # Unrestricted read-only mine visibility (same as MINISTRY_ADMIN) - a field
        # inspector needs to be able to pick a mine when filing a standalone report
        # that isn't tied to an existing case assignment. Read-only visibility of mine
        # names/scores is a reasonable real-world permission for a field inspector;
        # actual mutating actions (inspections, case access) stay scoped elsewhere.
        return stmt
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
