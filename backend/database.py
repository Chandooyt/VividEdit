from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime


DATABASE_URL = "sqlite:///./vivid_feedback.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


class FeedbackDB(Base):

    __tablename__ = "feedback"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    rating = Column(
        Integer
    )

    liked = Column(
        String
    )

    frustrated = Column(
        String
    )

    feature = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )


Base.metadata.create_all(
    bind=engine
)