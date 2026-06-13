from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentSignedResponse(BaseModel):
    id: int
    title: str
    file_name: str
    status: str
    signed_file_path: Optional[str] = None
    created_at: datetime
    signed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

