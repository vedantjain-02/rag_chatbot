import logging

from ..hybrid_retriever import HybridRetriever
from .query_rewriter import QueryRewriter
from .reranker import Reranker

logger = logging.getLogger(__name__)


class RetrievalPipeline:

    def __init__(self):
        self.rewriter = QueryRewriter()
        self.hybrid = HybridRetriever()
        self.reranker = Reranker()

    def retrieve(self, query: str):
        logger.debug("[Pipeline] Running retrieval for: %s", query[:80])

        rewritten_query = self.rewriter.rewrite(query)

        logger.debug("[Pipeline] Rewritten query: %s", rewritten_query)

        docs = self.hybrid.invoke(rewritten_query)

        logger.debug("[Pipeline] Hybrid returned %d documents", len(docs))

        docs = self.reranker.rerank(
            rewritten_query,
            docs,
        )
        logger.debug("[Pipeline] Reranker completed, %d docs returned", len(docs))

        return docs
