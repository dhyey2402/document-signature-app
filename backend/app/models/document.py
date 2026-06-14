from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    file_name = Column(String(255), nullable=False)

    file_path = Column(String(500), nullable=False)

    status = Column(
        String(50),
        default="pending"
    )

    signed_file_path = Column(
        String(500),
        nullable=True
    )

    signed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    rejection_reason = Column(
        String(1000),
        nullable=True
    )

    rejected_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="documents"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="AuditLog.created_at.desc()"
    )