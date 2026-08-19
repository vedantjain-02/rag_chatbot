import re

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import (
    GROQ_MODEL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
)


class QueryRewriter:

    def __init__(self):

        self.llm = ChatOpenAI(
            model=GROQ_MODEL,
            temperature=0,
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL,
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
