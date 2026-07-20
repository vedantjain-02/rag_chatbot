from ..hybrid_retriever import HybridRetriever
from .query_rewriter import QueryRewriter
from .reranker import Reranker


class RetrievalPipeline:

    def __init__(self):
        self.rewriter = QueryRewriter()
        self.hybrid = HybridRetriever()
        self.reranker = Reranker()


    def retrieve(self, query: str):
        print("========== PIPELINE RUNNING ==========")

        rewritten_query = self.rewriter.rewrite(query)

        print("Rewritten Query:", rewritten_query)

        docs = self.hybrid.invoke(rewritten_query)

        print("Hybrid returned", len(docs), "documents")

        docs = self.reranker.rerank(
            rewritten_query,
            docs,
        )
        print("Reranker completed")

        return docs