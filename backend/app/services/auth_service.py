from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import hash_password, verify_password


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(db: Session, name: str, email: str, password: str):
    hashed_password = hash_password(password)

    user = User(name=name, email=email, password=hashed_password)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user or not verify_password(password, user.password):
        return None

    return user