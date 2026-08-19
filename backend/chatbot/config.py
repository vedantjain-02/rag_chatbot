import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# PDF Dataset
DATA_PATH = BASE_DIR / "data" / "Dotsquares_Company_Policy.pdf"

# Chroma Database
CHROMA_DB_PATH = BASE_DIR / "chroma_db_v2"

# ── Groq LLM Configuration ─────────────────────────────────────────────────
GROQ_MODEL = os.getenv("GROQ_MODEL", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# ── Embeddings Configuration ────────────────────────────────────────────────
EMBEDDING_MODEL = os.getenv(
    "SENTENCE_TRANSFORMER_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
)

# Retrieval
VECTOR_TOP_K = 10
BM25_TOP_K = 10
FINAL_TOP_K = 5