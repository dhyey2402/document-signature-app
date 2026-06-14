from sqlalchemy import Column, Integer, String
from app.models.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password = Column(String(255), nullable=False)

    documents = relationship(
        "Document",
        back_populates="user"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user"
    )