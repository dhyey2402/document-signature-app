"""
GET /api/reports/dashboard

Returns a PDF analytics report for the authenticated user.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.signing_link import SigningLink
from app.services.report_service import build_dashboard_pdf

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.get("/dashboard")
def download_dashboard_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and return a PDF analytics report for the current user."""
    # Fetch all documents owned by the user
    docs = (
        db.query(Document)
        .filter(Document.uploaded_by == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )

    # Fetch all audit log events for those documents (with document relation)
    doc_ids = [d.id for d in docs]
    if doc_ids:
        audit_logs = (
            db.query(AuditLog)
            .options(joinedload(AuditLog.document))
            .filter(AuditLog.document_id.in_(doc_ids))
            .order_by(AuditLog.created_at.desc())
            .all()
        )
    else:
        audit_logs = []

    # Fetch all signing links for those documents
    if doc_ids:
        signing_links = (
            db.query(SigningLink)
            .filter(SigningLink.document_id.in_(doc_ids))
            .all()
        )
    else:
        signing_links = []

    try:
        pdf_bytes = build_dashboard_pdf(
            user_name=current_user.name,
            docs=docs,
            audit_logs=audit_logs,
            signing_links=signing_links,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    filename = f"Signly_Report_{date_str}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
