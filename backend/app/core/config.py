import os

# Base directory is the backend directory (parent of app)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")

DOCUMENTS_DIR = os.path.join(UPLOAD_ROOT, "documents")
SIGNATURES_DIR = os.path.join(UPLOAD_ROOT, "signatures")
SIGNED_DIR = os.path.join(UPLOAD_ROOT, "signed")

# Create directories automatically if missing
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(SIGNATURES_DIR, exist_ok=True)
os.makedirs(SIGNED_DIR, exist_ok=True)
