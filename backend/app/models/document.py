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
        default="draft"
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