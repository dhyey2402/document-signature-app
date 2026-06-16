import os
import shutil
from datetime import datetime, timezone
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    Request
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse, RejectDocumentRequest
from app.services.audit_service import (
    log_event,
    DOCUMENT_UPLOADED,
    DOCUMENT_DOWNLOADED,
    DOCUMENT_REJECTED,
    SIGNED_DOCUMENT_DOWNLOADED,
)

from app.core.config import DOCUMENTS_DIR

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post("/upload")
def upload_document(
    request: Request,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # enforce pdf format restriction
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_path = os.path.join(
        DOCUMENTS_DIR,
        file.filename
    )

    # write incoming binary stream to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    document = Document(
        title=title,
        file_name=file.filename,
        file_path=file_path,
        status="pending",
        uploaded_by=current_user.id
    )

    db.add(document)
    db.flush()  # get document.id before audit log

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=document.id,
        action=DOCUMENT_UPLOADED,
        description=f"Document '{title}' uploaded by {current_user.name}.",
        ip_address=client_ip,
        user_id=current_user.id,
    )

    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully.",
        "id": document.id,
        "title": document.title,
    }


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = (
        db.query(Document)
        .filter(Document.uploaded_by == current_user.id)
        .all()
    )

    return documents


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return recent audit log events across all documents owned by the current user."""
    doc_ids = [
        d.id
        for d in db.query(Document.id).filter(Document.uploaded_by == current_user.id).all()
    ]
    if not doc_ids:
        return []
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.document_id.in_(doc_ids))
        .order_by(AuditLog.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for e in entries:
        doc = db.query(Document).filter(Document.id == e.document_id).first()
        result.append({
            "id": e.id,
            "action": e.action,
            "description": e.description,
            "document_id": e.document_id,
            "document_title": doc.title if doc else None,
            "ip_address": e.ip_address,
            "created_at": e.created_at,
        })
    return result


@router.get("/{document_id}/audit", response_model=List[AuditLogResponse])
def get_audit_log(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ownership check
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

    audit_entries = (
        db.query(AuditLog)
        .filter(AuditLog.document_id == document_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return audit_entries


@router.post("/{document_id}/reject")
def reject_document(
    document_id: int,
    body: RejectDocumentRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    if document.status == "signed":
        raise HTTPException(
            status_code=400,
            detail="Cannot reject a document that has already been signed."
        )

    if document.status == "rejected":
        raise HTTPException(
            status_code=400,
            detail="Document is already rejected."
        )

    if not body.reason or not body.reason.strip():
        raise HTTPException(status_code=400, detail="Rejection reason is required.")

    document.status = "rejected"
    document.rejection_reason = body.reason.strip()
    document.rejected_at = datetime.now(timezone.utc)
    db.add(document)

    client_ip = request.client.host if request.client else None
    log_event(
        db,
        document_id=document.id,
        action=DOCUMENT_REJECTED,
        description=f"Document rejected. Reason: {body.reason.strip()}",
        ip_address=client_ip,
        user_id=current_user.id,
    )

    db.commit()
    db.refresh(document)

    return {
        "message": "Document rejected successfully.",
        "status": document.status,
        "rejection_reason": document.rejection_reason,
        "rejected_at": document.rejected_at,
    }


@router.get("/{document_id}")
def get_document_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    file_path = document.file_path

    # delete backing file from local storage
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully."}


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    preview: bool = False,
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

    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not preview:
        client_ip = request.client.host if request.client else None
        log_event(
            db,
            document_id=document.id,
            action=DOCUMENT_DOWNLOADED,
            description=f"Original PDF downloaded by {current_user.name}.",
            ip_address=client_ip,
            user_id=current_user.id,
        )
        db.commit()

    from fastapi.responses import FileResponse

    return FileResponse(
        document.file_path,
        media_type="application/pdf",
        filename=document.file_name,
    )
