from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.signature import Signature
from app.models.signature_asset import SignatureAsset
from app.schemas.signature import SignatureCreate, SignatureResponse
from app.schemas.signature_asset import SignatureAssetUploadResponse
from app.services.audit_service import log_event, SIGNATURE_PLACED

import os
import uuid
from fastapi import UploadFile, File
import fitz  # PyMuPDF
from app.core.config import SIGNATURES_DIR

router = APIRouter(
    prefix="/api/signatures",
    tags=["Signatures"]
)


@router.post("/", response_model=SignatureResponse)
def create_signature(
    signature_data: SignatureCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = (
        db.query(Document)
        .filter(
            Document.id == signature_data.document_id,
            Document.uploaded_by == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=400, detail="Original PDF file is missing on server")

    doc = None
    try:
        doc = fitz.open(document.file_path)
        total_pages = len(doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to open/parse PDF document: {e}")
    finally:
        if doc is not None:
            doc.close()

    # verify requested page index is within pdf bounds
    if signature_data.page_number < 1 or signature_data.page_number > total_pages:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid page_number: Document has only {total_pages} page(s)."
        )

    new_signature = Signature(
        document_id=signature_data.document_id,
        page_number=signature_data.page_number,
        x_coordinate=signature_data.x_coordinate,
        y_coordinate=signature_data.y_coordinate,
        width=signature_data.width,
        height=signature_data.height
    )

    db.add(new_signature)
    db.flush()

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=signature_data.document_id,
        action=SIGNATURE_PLACED,
        description=f"Signature placeholder placed on page {signature_data.page_number} by {current_user.name}.",
        ip_address=client_ip,
        user_id=current_user.id,
    )

    db.commit()
    db.refresh(new_signature)

    return new_signature


@router.get("/{document_id}", response_model=List[SignatureResponse])
def get_signatures_for_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.uploaded_by == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    signatures = (
        db.query(Signature)
        .filter(Signature.document_id == document_id)
        .all()
    )

    return signatures


@router.post("/upload", response_model=SignatureAssetUploadResponse)
def upload_signature_asset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # validate file mime type
    allowed = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    content_type = file.content_type
    if content_type and content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported signature image type")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        ext = ".png"

    asset_id = str(uuid.uuid4())
    saved_name = f"signature_{asset_id}{ext}"
    saved_path = os.path.join(SIGNATURES_DIR, saved_name)

    # persist signature image asset
    with open(saved_path, "wb") as buffer:
        buffer.write(file.file.read())

    asset = SignatureAsset(
        uploaded_by=current_user.id,
        file_path=saved_path,
        file_name=file.filename,
        content_type=content_type,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset
