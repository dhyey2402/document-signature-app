from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditLogUserInfo(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    document_id: int
    action: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[AuditLogUserInfo] = None
    signing_link_id: Optional[int] = None

    class Config:
        from_attributes = True


class RejectDocumentRequest(BaseModel):
    reason: str
