import os
import sys

from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "admin")
PG_DATABASE = os.getenv("PG_DATABASE", "rag_chatbot")

DATABASE_URL = (
    f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"
)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
X_API_KEY = os.getenv("X_API_KEY", "dev-x-api-key-change-me")
TOKEN_EXPIRY_HOURS = int(os.getenv("TOKEN_EXPIRY_HOURS", "24"))

MEDIA_PATH = os.getenv("MEDIA_PATH", "media").strip()
APP_NAME = os.getenv("APP_NAME", "RAG Chatbot")

# ── Groq LLM configuration validation ──────────────────────────────────────
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").strip().lower()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "").strip()

OBSOLETE_MODELS = {"llama-3.3-70b-versatile"}

def _validate_groq_config():
    """Validate Groq configuration at import time. Raises on misconfiguration."""
    if LLM_PROVIDER != "groq":
        return

    errors = []
    if not GROQ_API_KEY:
        errors.append("GROQ_API_KEY is missing from environment variables")
    if not GROQ_MODEL:
        errors.append("GROQ_MODEL is missing from environment variables")
    elif GROQ_MODEL in OBSOLETE_MODELS:
        errors.append(
            f"GROQ_MODEL='{GROQ_MODEL}' is obsolete and no longer available on Groq. "
            "Update GROQ_MODEL in your .env file."
        )

    if errors:
        for e in errors:
            print(f"CONFIG ERROR: {e}", file=sys.stderr)
        raise ValueError(
            "Groq configuration errors:\n" + "\n".join(f"  - {e}" for e in errors)
        )

_validate_groq_config()
