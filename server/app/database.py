cat > ~/Documents/Perdita/server/app/database.py << 'EOF'
"""
Database engine and session configuration.

Every model in app/models/ imports `Base` from here, and every route
that touches the database depends on `get_db` as a FastAPI dependency
to get a scoped session per-request.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Copy server/.env.example to server/.env "
        "and fill in your MySQL connection details."
    )

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session, always closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF