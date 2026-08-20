import os
import sys
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
IS_PRODUCTION = ENVIRONMENT == "production"
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

_raw_database_url = os.getenv("DATABASE_URL", "").strip()
if _raw_database_url:
    DATABASE_URL = _raw_database_url.replace("postgres://", "postgresql://", 1)
else:
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_USER = quote_plus(os.getenv("PG_USER", "postgres"))
    PG_PASSWORD = quote_plus(os.getenv("PG_PASSWORD", "admin"))
    PG_DATABASE = os.getenv("PG_DATABASE", "rag_chatbot")
    DATABASE_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
X_API_KEY = os.getenv("X_API_KEY", "dev-x-api-key-change-me")
TOKEN_EXPIRY_HOURS = int(os.getenv("TOKEN_EXPIRY_HOURS", "24"))

MEDIA_PATH = os.getenv("MEDIA_PATH", "media").strip()
APP_NAME = os.getenv("APP_NAME", "RAG Chatbot")
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]

if IS_PRODUCTION:
    insecure = {"change-me-in-production", "dev-x-api-key-change-me", "", "your-backend-x-api-key"}
    if SECRET_KEY in insecure or len(SECRET_KEY) < 32:
        raise ValueError("SECRET_KEY must be a random value of at least 32 characters in production")
    if X_API_KEY in insecure:
        raise ValueError("X_API_KEY must be explicitly configured in production")
    if not _raw_database_url:
        raise ValueError("DATABASE_URL must be configured in production")
    if not CORS_ORIGINS:
        raise ValueError("CORS_ORIGINS must list the deployed frontend origin in production")

# LLM configuration validation
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").strip().lower()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "").strip()
OBSOLETE_MODELS = {"llama-3.3-70b-versatile"}


def _validate_groq_config():
    if LLM_PROVIDER != "groq":
        return
    errors = []
    if not GROQ_API_KEY:
        errors.append("GROQ_API_KEY is missing from environment variables")
    if not GROQ_MODEL:
        errors.append("GROQ_MODEL is missing from environment variables")
    elif GROQ_MODEL in OBSOLETE_MODELS:
        errors.append(f"GROQ_MODEL='{GROQ_MODEL}' is obsolete and no longer available on Groq")
    if errors:
        for error in errors:
            print(f"CONFIG ERROR: {error}", file=sys.stderr)
        raise ValueError("Groq configuration errors:\n" + "\n".join(f"  - {error}" for error in errors))


_validate_groq_config()
