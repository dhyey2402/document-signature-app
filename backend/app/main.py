from fastapi import FastAPI

from app.routers.auth import router as auth_router

from fastapi.middleware.cors import CORSMiddleware

from app.routers.documents import router as documents_router
from app.routers.signatures import router as signatures_router
from app.routers.documents_sign import router as documents_sign_router
from app.routers.signing_links import router as signing_links_router
from app.routers.reports import router as reports_router


from contextlib import asynccontextmanager
from sqlalchemy import inspect, text
from app.core.database import engine
from app.models.base import Base
import app.models.user
import app.models.document
import app.models.signature
import app.models.signature_asset
import app.models.signing_link
import app.models.audit_log

@asynccontextmanager
async def lifespan(app: FastAPI):
    # initialize schema structure (creates new tables like audit_logs automatically)
    Base.metadata.create_all(bind=engine)

    # run lightweight sqlite schema migration for existing tables
    inspector = inspect(engine)

    if "documents" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("documents")]
        with engine.begin() as conn:
            if "signed_file_path" not in columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN signed_file_path VARCHAR(500) NULL"))
                print("Migration: added signed_file_path to documents.")
            if "signed_at" not in columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE NULL"))
                print("Migration: added signed_at to documents.")
            if "rejection_reason" not in columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN rejection_reason VARCHAR(1000) NULL"))
                print("Migration: added rejection_reason to documents.")
            if "rejected_at" not in columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE NULL"))
                print("Migration: added rejected_at to documents.")

    yield

app = FastAPI(
    title="Document Signature API",
    lifespan=lifespan
)


app.include_router(documents_router)
app.include_router(signatures_router)
app.include_router(documents_sign_router)
app.include_router(signing_links_router)
app.include_router(reports_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "API Running"
    }