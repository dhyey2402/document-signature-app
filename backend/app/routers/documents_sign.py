import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import fitz  # PyMuPDF

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.signature import Signature
from app.models.signature_asset import SignatureAsset
from app.services.pdf_service import generate_signed_pdf
from app.services.audit_service import (
    log_event,
    DOCUMENT_SIGNED,
    SIGNED_DOCUMENT_DOWNLOADED,
)

from pydantic import BaseModel

from app.core.config import SIGNED_DIR

router = APIRouter(prefix="/api/documents", tags=["Documents"])


class SignRequest(BaseModel):
    signature_asset_id: int


def _require_document_owner(db: Session, document_id: int, current_user: User) -> Document:

    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.uploaded_by == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/{document_id}/sign")
def sign_document(
    document_id: int,
    body: SignRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _require_document_owner(db, document_id, current_user)

    # prevent duplicate signing
    if document.status == "signed" or document.signed_file_path is not None:
        raise HTTPException(
            status_code=400,
            detail="Document is already signed. Cannot sign again."
        )

    # require placement coordinates
    signatures = (
        db.query(Signature)
        .filter(Signature.document_id == document_id)
        .all()
    )
    if not signatures:
        raise HTTPException(status_code=400, detail="No signature coordinates exist for this document")

    # load signature image asset
    signature_asset = (
        db.query(SignatureAsset)
        .filter(
            SignatureAsset.id == body.signature_asset_id,
            SignatureAsset.uploaded_by == current_user.id,
        )
        .first()
    )
    if not signature_asset or not signature_asset.file_path:
        raise HTTPException(status_code=400, detail="Signature image asset not provided")

    if not os.path.exists(signature_asset.file_path):
        raise HTTPException(status_code=400, detail="Signature image asset file missing")

    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=400, detail="Original PDF file missing")

    # compile and save signed pdf
    signed_file_path = generate_signed_pdf(
        document.file_path,
        signature_asset.file_path,
        signatures,
        document.id
    )

    now_time = datetime.now(timezone.utc)
    document.signed_file_path = signed_file_path
    document.status = "signed"
    document.signed_at = now_time
    db.add(document)

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=document.id,
        action=DOCUMENT_SIGNED,
        description=f"Document signed by owner {current_user.name}.",
        ip_address=client_ip,
        user_id=current_user.id,
    )

    db.commit()
    db.refresh(document)

    return {"message": "Signed PDF generated", "signed_file_path": document.signed_file_path}


@router.get("/{document_id}/signed")
def download_signed(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _require_document_owner(db, document_id, current_user)

    if not document.signed_file_path or not os.path.exists(document.signed_file_path):
        raise HTTPException(status_code=404, detail="Signed PDF not found")

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=document.id,
        action=SIGNED_DOCUMENT_DOWNLOADED,
        description=f"Signed PDF downloaded by {current_user.name}.",
        ip_address=client_ip,
        user_id=current_user.id,
    )
    db.commit()

    return FileResponse(
        document.signed_file_path,
        media_type="application/pdf",
        filename=f"signed_{document.file_name}",
    )
