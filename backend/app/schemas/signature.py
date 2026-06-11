from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SignatureCreate(BaseModel):
    document_id: int
    page_number: int = 1
    x_coordinate: float = Field(..., ge=0.0, le=1.0)
    y_coordinate: float = Field(..., ge=0.0, le=1.0)
    width: float = Field(..., gt=0.0, le=1.0)
    height: float = Field(..., gt=0.0, le=1.0)

class SignatureResponse(BaseModel):
    id: int
    document_id: int
    page_number: int
    x_coordinate: float
    y_coordinate: float
    width: float
    height: float
    created_at: datetime

    class Config:
        orm_mode = True
