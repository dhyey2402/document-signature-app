import os
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.base import Base


class SignatureAsset(Base):
    __tablename__ = "signature_assets"

    id = Column(Integer, primary_key=True, index=True)

    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # stored path on disk
    file_path = Column(String(500), nullable=False)

    # optional original filename / metadata
    file_name = Column(String(255), nullable=True)
    content_type = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

