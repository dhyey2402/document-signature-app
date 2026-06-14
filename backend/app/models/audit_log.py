from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    signing_link_id = Column(
        Integer,
        ForeignKey("signing_links.id", ondelete="SET NULL"),
        nullable=True
    )

    action = Column(String(100), nullable=False)

    description = Column(String(1000), nullable=True)

    ip_address = Column(String(100), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    document = relationship("Document", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
