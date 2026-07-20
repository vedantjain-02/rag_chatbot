from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
import re

from ..config import (
    LLM_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
)


class QueryRewriter:

    def __init__(self):

        self.llm = ChatOllama(
            model=LLM_MODEL,
            temperature=0,
            client_kwargs={
                "timeout": OLLAMA_TIMEOUT_SECONDS
            },
        )

        self.prompt = ChatPromptTemplate.from_template(
            """
You are an expert query rewriting assistant.

Rewrite the user's query so it is clear, complete, and optimized for retrieving information from a company policy knowledge base.

Rules:

- Preserve the user's intent.
- Do not answer the question.
- Expand abbreviations if obvious (WFH → Work From Home).
- Return ONLY the rewritten query.
- If the query is already clear, return it unchanged.

User Query:
{query}
"""
        )

        self.chain = self.prompt | self.llm

    def needs_rewrite(self, query: str) -> bool:

        query = query.strip().lower()

        # Short queries
        if len(query.split()) <= 2:
            return True

        # Common abbreviations / keywords
        abbreviations = {
            "wfh",
            "pto",
            "hr",
            "pf",
            "esi",
            "lop",
            "ot",
            "salary",
            "leave",
            "holiday",
            "notice period",
        }

        if query in abbreviations:
            return True

        # Already a complete question
        if re.search(
            r"(what|when|where|who|why|how|can|does|do|is|are)",
            query,
        ):
            return False

        return False

    def rewrite(self, query: str):

        # Skip rewriting if the query is already clear
        if not self.needs_rewrite(query):
            return query

        response = self.chain.invoke(
            {
                "query": query
            }
        )

        return response.content.strip()