from app.core.database import engine
from app.models.base import Base
from app.models.document import Document
import app.models.user
import app.models.signature
from app.models.signature_asset import SignatureAsset

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")