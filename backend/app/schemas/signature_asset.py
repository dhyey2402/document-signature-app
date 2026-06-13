from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SignatureAssetUploadResponse(BaseModel):
    id: int
    uploaded_by: int
    file_path: str
    file_name: Optional[str] = None
    content_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

