from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.signature import SignatureResponse


class SigningLinkCreate(BaseModel):
    document_id: int
    recipient_name: str
    recipient_email: str


class SigningLinkResponse(BaseModel):
    id: int
    document_id: int
    token: str
    recipient_name: str
    recipient_email: str
    status: str
    signer_ip: Optional[str] = None
    signed_file_path: Optional[str] = None
    expires_at: datetime
    created_at: datetime
    signed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PublicSigningLinkDetail(BaseModel):
    document_id: int
    document_title: str
    recipient_name: str
    recipient_email: str
    status: str
    expires_at: datetime
    signatures: List[SignatureResponse]

    class Config:
        from_attributes = True
