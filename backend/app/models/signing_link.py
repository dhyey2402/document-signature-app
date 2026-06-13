from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, backref
import uuid
from datetime import datetime, timedelta, timezone

from app.models.base import Base


def default_expires_at():
    return datetime.now(timezone.utc) + timedelta(days=7)

class SigningLink(Base):
    __tablename__ = "signing_links"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    token = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )

    recipient_name = Column(String(255), nullable=False)
    recipient_email = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, signed, expired

    signer_ip = Column(String(100), nullable=True)
    signed_file_path = Column(String(500), nullable=True)

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=default_expires_at
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    signed_at = Column(DateTime(timezone=True), nullable=True)

    document = relationship(
        "Document",
        backref=backref("signing_links", cascade="all, delete-orphan")
    )
