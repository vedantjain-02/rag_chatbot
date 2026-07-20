from langchain_community.tools import DuckDuckGoSearchRun
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

from chatbot.config import (
    LLM_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
)


class WebAgent:

    def __init__(self):

        self.search = DuckDuckGoSearchRun()

        self.llm = ChatOllama(
            model=LLM_MODEL,
            temperature=0,
            client_kwargs={
                "timeout": OLLAMA_TIMEOUT_SECONDS,
            },
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