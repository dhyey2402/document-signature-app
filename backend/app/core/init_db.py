from app.core.database import engine
from app.models.base import Base

import app.models.user

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")