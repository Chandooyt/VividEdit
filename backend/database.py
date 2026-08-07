from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = "sqlite:///./vivid_feedback.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


# =========================================================
# FEEDBACK
# =========================================================

class FeedbackDB(Base):

    __tablename__ = "feedback"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    rating = Column(
        Integer,
        nullable=False
    )

    liked = Column(
        String,
        nullable=True
    )

    frustrated = Column(
        String,
        nullable=True
    )

    feature = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )


# =========================================================
# PRODUCTS / SUBSCRIPTIONS
# =========================================================

class ProductDB(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    price = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Active"
    )

    users = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )


# =========================================================
# CREATE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)