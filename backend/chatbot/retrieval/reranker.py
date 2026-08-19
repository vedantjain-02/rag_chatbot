import json
import logging

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import (
    GROQ_MODEL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
    FINAL_TOP_K,
)

logger = logging.getLogger(__name__)


class Reranker:

    def __init__(self):

        self.llm = ChatOpenAI(
            model=GROQ_MODEL,
            temperature=0,
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL,
        )

        self.prompt = ChatPromptTemplate.from_template(
            """
You are a document reranking assistant.

A user asked:

{query}

Below are retrieved documents.

{documents}

Select the most relevant documents for answering the user's question.

Return ONLY a JSON array of document indexes in order of relevance.

Example:

[2,5,1,4]

Do not explain anything.
"""
        )

        self.chain = self.prompt | self.llm

    def rerank(self, query, docs):
        logger.debug("[Reranker] Running with %d docs", len(docs))
        if len(docs) <= 1:
            return docs

        document_text = []

        for i, doc in enumerate(docs):

            document_text.append(
                f"""
Document {i}

{doc.page_content}
"""
            )

        response = self.chain.invoke(
            {
                "query": query,
                "documents": "\n\n".join(document_text),
            }
        )

        try:

            order = json.loads(response.content.strip())
            logger.debug("[Reranker] LLM ranking: %s", order)

            ranked_docs = []

            for idx in order:

                if 0 <= idx < len(docs):
                    ranked_docs.append(docs[idx])

            if ranked_docs:
                return ranked_docs[:FINAL_TOP_K]

        except Exception as e:
            logger.warning("[Reranker] Failed to parse LLM ranking: %s", e)

        return docs[:FINAL_TOP_K]
