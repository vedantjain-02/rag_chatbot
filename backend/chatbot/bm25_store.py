from rank_bm25 import BM25Okapi
from langchain_core.documents import Document
from .config import BM25_TOP_K
from .document_loader import get_chunks
from .tokenizer import tokenize

_bm25 = None
_documents = None


class BM25Retriever:
    def __init__(self):
        global _bm25, _documents

        if _bm25 is None:
            _documents = get_chunks()

            tokenized_docs = [
                tokenize(doc.page_content)
                for doc in _documents
            ]

            _bm25 = BM25Okapi(tokenized_docs)

        self.bm25 = _bm25
        self.documents = _documents

    def invoke(self, query: str, k: int = BM25_TOP_K):
        tokenized_query = tokenize(query)

        scores = self.bm25.get_scores(tokenized_query)

        ranked = sorted(
            enumerate(scores),
            key=lambda x: x[1],
            reverse=True,
        )[:k]
        for idx, score in ranked:
            print(
                f"BM25 -> Page {self.documents[idx].metadata.get('page')} | Score = {score:.2f}"
            )
        return [
            self.documents[idx]
            for idx, score in ranked
        ]