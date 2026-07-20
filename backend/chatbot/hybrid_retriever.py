from .vector_store import get_retriever
from .bm25_store import BM25Retriever
import hashlib
from .config import (
    VECTOR_TOP_K,
    BM25_TOP_K,
)
class HybridRetriever:
    def __init__(self):

        self.vector_retriever = get_retriever(
            VECTOR_TOP_K
        )

        self.bm25_retriever = BM25Retriever()

    def invoke(self, query: str):

        vector_docs = self.vector_retriever.invoke(query)

        bm25_docs = self.bm25_retriever.invoke(
            query,
            k=BM25_TOP_K,
        )

        merged = []

        seen = set()

        for doc in vector_docs + bm25_docs:

            key = hashlib.sha256(
                doc.page_content.encode("utf-8")
            ).hexdigest()

            if key not in seen:
                seen.add(key)
                merged.append(doc)

        print("=" * 70)
        print("Vector :", len(vector_docs))
        print("BM25   :", len(bm25_docs))
        print("Merged :", len(merged))
        print("=" * 70)

        return merged