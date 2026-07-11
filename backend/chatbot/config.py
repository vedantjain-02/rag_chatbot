import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# PDF Dataset
DATA_PATH = BASE_DIR / "data" / "Dotsquares_Company_Policy.pdf"

# Chroma Database
CHROMA_DB_PATH = BASE_DIR / "chroma_db"

# Ollama Models
LLM_MODEL = "qwen3:4b"
EMBEDDING_MODEL = "nomic-embed-text"
OLLAMA_TIMEOUT_SECONDS = int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "300"))

# Retrieval
TOP_K = 5