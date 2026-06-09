from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.dependencies import get_db
from app.services.auth_service import create_user, authenticate_user, get_user_by_email
from app.utils.jwt import create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email is already registered."
        )

    new_user = create_user(db, user.name, user.email, user.password)
    token = create_access_token({"sub": str(new_user.id)})

    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.email, user.password)

    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="The email or password you entered is incorrect."
        )

    token = create_access_token({"sub": str(authenticated_user.id)})

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }