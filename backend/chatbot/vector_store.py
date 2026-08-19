from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from .config import (
    CHROMA_DB_PATH,
    EMBEDDING_MODEL,
)

_vector_db = None


def get_retriever(k=10):
    import logging
    _log = logging.getLogger(__name__)
    global _vector_db
    if _vector_db is None:
        _log.debug(
            "[get_retriever] Initializing ChromaDB with embeddings model=%s",
            EMBEDDING_MODEL,
        )
        embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
        )
        _vector_db = Chroma(
            persist_directory=str(CHROMA_DB_PATH),
            embedding_function=embeddings,
        )
        _log.debug(
            "[get_retriever] ChromaDB initialized at %s", CHROMA_DB_PATH
        )
    else:
        _log.debug("[get_retriever] Using existing ChromaDB instance")
    return _vector_db.as_retriever(
        search_kwargs={"k": k}
    )
