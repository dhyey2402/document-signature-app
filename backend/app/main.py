from fastapi import FastAPI

from app.routers.auth import router as auth_router

from fastapi.middleware.cors import CORSMiddleware

from app.routers.documents import router as documents_router
from app.routers.signatures import router as signatures_router

app = FastAPI(
    title="Document Signature API"
)

app.include_router(documents_router)
app.include_router(signatures_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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