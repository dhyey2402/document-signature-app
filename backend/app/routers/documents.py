import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.post("/upload")
def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    document = Document(
        title=title,
        file_name=file.filename,
        file_path=file_path,
        uploaded_by=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully."
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

    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    from fastapi.responses import FileResponse

    return FileResponse(
        document.file_path,
        media_type="application/pdf",
        filename=document.file_name,
    )
