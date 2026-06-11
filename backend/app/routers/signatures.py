from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.signature import Signature
from app.schemas.signature import SignatureCreate, SignatureResponse

router = APIRouter(
    prefix="/api/signatures",
    tags=["Signatures"]
)

@router.post("/", response_model=SignatureResponse)
def create_signature(
    signature_data: SignatureCreate,
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

    new_signature = Signature(
        document_id=signature_data.document_id,
        page_number=signature_data.page_number,
        x_coordinate=signature_data.x_coordinate,
        y_coordinate=signature_data.y_coordinate,
        width=signature_data.width,
        height=signature_data.height
    )

    db.add(new_signature)
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
