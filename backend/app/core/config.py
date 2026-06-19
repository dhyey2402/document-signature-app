import os
from dotenv import load_dotenv

load_dotenv()

# Base directory is the backend directory (parent of app)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Frontend URL — used for generating public signing links and CORS.
# In production, set FRONTEND_URL env var on Render (e.g. https://signly-omega.vercel.app).
# Falls back to localhost for local development.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")

DOCUMENTS_DIR = os.path.join(UPLOAD_ROOT, "documents")
SIGNATURES_DIR = os.path.join(UPLOAD_ROOT, "signatures")
SIGNED_DIR = os.path.join(UPLOAD_ROOT, "signed")

# Create directories automatically if missing
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(SIGNATURES_DIR, exist_ok=True)
os.makedirs(SIGNED_DIR, exist_ok=True)
