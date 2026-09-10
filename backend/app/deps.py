from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app.models import User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ")
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return db.get(User, user_id)


def require_user(user: User | None = Depends(get_current_user)) -> User:
    if user is None:
        raise HTTPException(401, "Login required")
    return user


def require_role(*roles: str):
    def _dep(user: User = Depends(require_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, f"Requires role in {roles}")
        return user

    return _dep


require_ministry_admin = require_role("MINISTRY_ADMIN")
require_dgms_officer = require_role("MINISTRY_ADMIN", "DGMS_OFFICER")
require_mine_manager = require_role("MINE_MANAGER")
require_field_inspector = require_role("FIELD_INSPECTOR")
require_gov = require_role("MINISTRY_ADMIN", "DGMS_OFFICER")
