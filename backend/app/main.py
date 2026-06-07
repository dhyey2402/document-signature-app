from fastapi import FastAPI

app = FastAPI(
    title="Document Signature API"
)

@app.get("/")
def root():
    return {"message": "API Running"}