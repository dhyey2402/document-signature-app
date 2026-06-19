import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.signature import Signature
from app.models.signature_asset import SignatureAsset
from app.models.signing_link import SigningLink
from app.schemas.signing_link import SigningLinkCreate, PublicSigningLinkDetail
from app.services.email_service import send_signing_email
from app.services.pdf_service import generate_signed_pdf
from app.services.audit_service import (
    log_event,
    SIGNING_LINK_CREATED,
    DOCUMENT_VIEWED,
    DOCUMENT_SIGNED,
    DOCUMENT_DOWNLOADED,
    SIGNED_DOCUMENT_DOWNLOADED,
)
from app.core.config import SIGNATURES_DIR, FRONTEND_URL

router = APIRouter(prefix="/api/signing-links", tags=["Signing Links"])


def _require_document_owner(db: Session, document_id: int, current_user: User) -> Document:
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.uploaded_by == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/")
def list_signing_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all signing links for documents owned by the current user."""
    doc_ids = [
        d.id
        for d in db.query(Document.id).filter(Document.uploaded_by == current_user.id).all()
    ]
    if not doc_ids:
        return []
    links = (
        db.query(SigningLink)
        .filter(SigningLink.document_id.in_(doc_ids))
        .order_by(SigningLink.created_at.desc())
        .all()
    )
    result = []
    for link in links:
        doc = db.query(Document).filter(Document.id == link.document_id).first()
        result.append({
            "id": link.id,
            "token": link.token,
            "recipient_name": link.recipient_name,
            "recipient_email": link.recipient_email,
            "status": link.status,
            "expires_at": link.expires_at,
            "created_at": link.created_at,
            "signed_at": link.signed_at,
            "document_id": link.document_id,
            "document_title": doc.title if doc else None,
        })
    return result


@router.post("/")
def generate_signing_link(
    body: SigningLinkCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _require_document_owner(db, body.document_id, current_user)

    # create signing link
    link = SigningLink(
        document_id=body.document_id,
        recipient_name=body.recipient_name,
        recipient_email=body.recipient_email
    )
    db.add(link)
    db.flush()

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=body.document_id,
        action=SIGNING_LINK_CREATED,
        description=f"Signing link created for {body.recipient_name} <{body.recipient_email}>.",
        ip_address=client_ip,
        user_id=current_user.id,
        signing_link_id=link.id,
    )

    db.commit()
    db.refresh(link)

    public_url = f"{FRONTEND_URL}/sign/{link.token}"

    # dispatch notification email
    email_sent = send_signing_email(
        recipient_name=link.recipient_name,
        recipient_email=link.recipient_email,
        document_title=document.title,
        signing_link=public_url,
        sender_name=current_user.name,
        sender_email=current_user.email
    )

    return {
        "message": "Signing link generated successfully.",
        "signing_link": {
            "id": link.id,
            "document_id": link.document_id,
            "token": link.token,
            "recipient_name": link.recipient_name,
            "recipient_email": link.recipient_email,
            "status": link.status,
            "expires_at": link.expires_at,
            "created_at": link.created_at
        },
        "public_url": public_url,
        "email_sent": email_sent
    }


@router.get("/{token}", response_model=PublicSigningLinkDetail)
def get_public_signing_link_detail(token: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(SigningLink).filter(SigningLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid signing link token")

    if link.expires_at < datetime.now(timezone.utc):
        link.status = "expired"
        db.add(link)
        db.commit()
        raise HTTPException(status_code=400, detail="This signing link has expired")

    document = db.query(Document).filter(Document.id == link.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Original document not found")

    signatures = db.query(Signature).filter(Signature.document_id == document.id).all()

    # log view event
    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=document.id,
        action=DOCUMENT_VIEWED,
        description=f"Document viewed via public signing link by {link.recipient_name}.",
        ip_address=client_ip,
        signing_link_id=link.id,
    )
    db.commit()

    return {
        "document_id": document.id,
        "document_title": document.title,
        "recipient_name": link.recipient_name,
        "recipient_email": link.recipient_email,
        "status": link.status,
        "expires_at": link.expires_at,
        "signatures": signatures
    }


@router.get("/{token}/download")
def download_public_original_pdf(token: str, request: Request, db: Session = Depends(get_db), preview: bool = False):
    link = db.query(SigningLink).filter(SigningLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid signing link token")

    if link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This signing link has expired")

    document = db.query(Document).filter(Document.id == link.document_id).first()
    if not document or not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")

    if not preview:
        client_ip = request.client.host if request.client else None
        log_event(
            db,
            document_id=document.id,
            action=DOCUMENT_DOWNLOADED,
            description=f"Original PDF downloaded via public link by {link.recipient_name}.",
            ip_address=client_ip,
            signing_link_id=link.id,
        )
        db.commit()

    return FileResponse(
        document.file_path,
        media_type="application/pdf",
        filename=document.file_name
    )


@router.get("/{token}/download-signed")
def download_public_signed_pdf(token: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(SigningLink).filter(SigningLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid signing link token")

    if not link.signed_file_path or not os.path.exists(link.signed_file_path):
        raise HTTPException(status_code=404, detail="Signed document file not found")

    document = db.query(Document).filter(Document.id == link.document_id).first()
    filename = f"signed_{document.file_name}" if document else "signed_document.pdf"

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=link.document_id,
        action=SIGNED_DOCUMENT_DOWNLOADED,
        description=f"Signed PDF downloaded via public link by {link.recipient_name}.",
        ip_address=client_ip,
        signing_link_id=link.id,
    )
    db.commit()

    return FileResponse(
        link.signed_file_path,
        media_type="application/pdf",
        filename=filename
    )


@router.post("/{token}/sign")
def public_submit_signature(
    token: str,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    link = db.query(SigningLink).filter(SigningLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid signing link token")

    if link.status == "signed" or link.signed_file_path is not None:
        raise HTTPException(status_code=400, detail="Document is already signed. Link cannot be reused.")

    if link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This signing link has expired")

    document = db.query(Document).filter(Document.id == link.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Original document not found")

    signatures = db.query(Signature).filter(Signature.document_id == document.id).all()
    if not signatures:
        raise HTTPException(status_code=400, detail="No signature placeholders exist for this document")

    # save incoming signature image
    allowed = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    content_type = file.content_type
    if content_type and content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported signature image type")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        ext = ".png"

    asset_id = str(uuid.uuid4())
    saved_name = f"public_signature_{asset_id}{ext}"
    saved_path = os.path.join(SIGNATURES_DIR, saved_name)

    with open(saved_path, "wb") as buffer:
        buffer.write(file.file.read())

    # associate asset to document creator
    asset = SignatureAsset(
        uploaded_by=document.uploaded_by,  # Owned by the document creator
        file_path=saved_path,
        file_name=file.filename,
        content_type=content_type,
    )
    db.add(asset)
    db.flush()

    # construct signed pdf
    signed_file_path = generate_signed_pdf(
        document.file_path,
        asset.file_path,
        signatures,
        document.id
    )

    client_ip = request.client.host if request.client else None
    now_time = datetime.now(timezone.utc)

    # update global document state
    document.signed_file_path = signed_file_path
    document.status = "signed"
    document.signed_at = now_time
    db.add(document)

    # record signature event on link
    link.status = "signed"
    link.signed_file_path = signed_file_path
    link.signed_at = now_time
    link.signer_ip = client_ip
    db.add(link)

    log_event(
        db,
        document_id=document.id,
        action=DOCUMENT_SIGNED,
        description=f"Document signed via public link by {link.recipient_name}.",
        ip_address=client_ip,
        signing_link_id=link.id,
    )

    db.commit()

    return {
        "message": "Document signed successfully",
        "signed_at": link.signed_at,
        "recipient_name": link.recipient_name
    }
