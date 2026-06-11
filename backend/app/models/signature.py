from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, backref

from app.models.base import Base


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    page_number = Column(Integer, default=1)
    
    x_coordinate = Column(Float, nullable=False)
    y_coordinate = Column(Float, nullable=False)
    
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    document = relationship(
        "Document",
        backref=backref("signatures", cascade="all, delete-orphan")
    )
