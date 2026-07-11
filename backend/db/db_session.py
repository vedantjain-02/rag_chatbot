from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.environment import DATABASE_URL
from shared.logging import get_logger

logger = get_logger(__name__)

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    logger.debug("[get_db] Session opened: %s", id(db))
    try:
        yield db
        logger.debug("[get_db] About to commit session %s", id(db))
        db.commit()
        logger.debug("[get_db] Session %s committed successfully", id(db))
    except Exception as exc:
        logger.error("[get_db] Rolling back session %s due to: %s", id(db), exc, exc_info=True)
        db.rollback()
        raise
    finally:
        logger.debug("[get_db] Closing session %s", id(db))
        db.close()
        logger.debug("[get_db] Session %s closed", id(db))
