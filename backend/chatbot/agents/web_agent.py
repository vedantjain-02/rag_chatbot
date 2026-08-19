import logging
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from chatbot.config import (
    GROQ_MODEL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
)

logger = logging.getLogger(__name__)


class WebAgent:

    def __init__(self):

        self.search = DuckDuckGoSearchRun()

        self.llm = ChatOpenAI(
            model=GROQ_MODEL,
            temperature=0,
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL,
        )

        self.prompt = ChatPromptTemplate.from_template(
            """
You are an AI assistant.

You are given web search results.

Your job is to answer the user's question in a clean,
professional and easy-to-read format.

Rules:

- Don't copy raw search results.
- Summarize them.
- Use bullet points when appropriate.
- If information is recent, mention it.
- Keep the answer concise.
- Don't hallucinate.

Question:
{question}

Search Results:
{results}
"""
        )

        self.chain = self.prompt | self.llm

    def run(self, question: str):

        # Search
        search_results = self.search.invoke(question)

        # LLM Summary
        response = self.chain.invoke(
            {
                "question": question,
                "results": search_results,
            }
        )

        return {
            "success": True,
            "answer": response.content,
            "sources": {
                "chunks": [],
                "agent_steps": [
                    {
                        "agent": "Supervisor",
                        "action": "Route → WEB",
                    },
                    {
                        "agent": "Web Search",
                        "action": "DuckDuckGo",
                    },
                    {
                        "agent": "LLM",
                        "action": "Summarized Results",
                    },
                ],
                "history_summary": None,
                "rewritten_query": None,
            },
        }
