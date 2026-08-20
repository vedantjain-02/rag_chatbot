from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.environment import DATABASE_URL, IS_PRODUCTION
from shared.logging import get_logger

logger = get_logger(__name__)

engine_options = {
    "pool_pre_ping": True,
}
if not IS_PRODUCTION:
    engine_options.update(pool_size=5, max_overflow=10)

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    logger.debug("[get_db] Session opened: %s", id(db))
    try:
        yield db
        db.commit()
    except Exception as exc:
        logger.error("[get_db] Rolling back session %s due to: %s", id(db), exc, exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()
