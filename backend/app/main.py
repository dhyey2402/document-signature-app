from fastapi import FastAPI

from app.routers.auth import router as auth_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Document Signature API"
)

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