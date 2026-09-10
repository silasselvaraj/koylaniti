import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app import env  # noqa: F401 - side-effect import, loads .env first

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://sih_new_dev:sih_new_dev_local@localhost/sih_new_dev",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
