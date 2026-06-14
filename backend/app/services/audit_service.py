from sqlalchemy.orm import Session
from typing import Optional

from app.models.audit_log import AuditLog


# Action constants
DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
SIGNATURE_PLACED = "SIGNATURE_PLACED"
SIGNING_LINK_CREATED = "SIGNING_LINK_CREATED"
DOCUMENT_VIEWED = "DOCUMENT_VIEWED"
DOCUMENT_SIGNED = "DOCUMENT_SIGNED"
DOCUMENT_REJECTED = "DOCUMENT_REJECTED"
DOCUMENT_DOWNLOADED = "DOCUMENT_DOWNLOADED"
SIGNED_DOCUMENT_DOWNLOADED = "SIGNED_DOCUMENT_DOWNLOADED"


def log_event(
    db: Session,
    document_id: int,
    action: str,
    description: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_id: Optional[int] = None,
    signing_link_id: Optional[int] = None,
) -> AuditLog:
    """
    Create a single audit log entry and flush it to the database.
    Does NOT commit — caller is responsible for committing the transaction.
    """
    entry = AuditLog(
        document_id=document_id,
        action=action,
        description=description,
        ip_address=ip_address,
        user_id=user_id,
        signing_link_id=signing_link_id,
    )
    db.add(entry)
    db.flush()  # assign PK without committing
    return entry
