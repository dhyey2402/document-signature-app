from pydantic import BaseModel
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    title: str
    file_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True