from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_access_token, verify_password
from app.database import get_db
from app.deps import require_user
from app.limiter import limiter
from app.models import User
from app.schemas import LoginRequest, LoginResponse, MeResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
@limiter.limit("20/minute")
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalars(select(User).where(User.username == body.username)).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")
    token = create_access_token(user.id)
    return LoginResponse(access_token=token, role=user.role, user_id=user.id, full_name=user.full_name)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(require_user)):
    return MeResponse(
        id=user.id,
        username=user.username,
        role=user.role,
        full_name=user.full_name,
        jurisdiction_state=user.jurisdiction_state,
        mine_id=user.mine_id,
    )
