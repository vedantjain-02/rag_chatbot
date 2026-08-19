import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from .memory.prompt_context import PromptContext
from .prompts import SYSTEM_PROMPT
from .retrieval.pipeline import RetrievalPipeline

from .config import GROQ_MODEL, GROQ_API_KEY, GROQ_BASE_URL

load_dotenv()

logger = logging.getLogger(__name__)

class ChatbotService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if ChatbotService._initialized:
            return
        ChatbotService._initialized = True

        self.pipeline = RetrievalPipeline()

        logger.info(
            "[ChatbotService] Initializing LLM: model=%s base_url=%s",
            GROQ_MODEL,
            GROQ_BASE_URL,
        )

        self.llm = ChatOpenAI(
            model=GROQ_MODEL,
            temperature=0,
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL,
        )
        self.prompt = ChatPromptTemplate.from_template(
            SYSTEM_PROMPT
        )

        self.chain = self.prompt | self.llm

    def ask(
    self,
    question: str,
    history=None,
    ):
        _log = logger

        try:
            _log.debug("[ask] Invoking retriever with question: %s", question[:80])
            docs = self.pipeline.retrieve(question)
            _log.debug("[ask] Retriever returned %d docs", len(docs))

            if not docs:
                _log.debug("[ask] No docs found, switching to WEB")

                return {
                    "success": False,
                    "fallback_to_web": True,
                    "answer": "",
                    "sources": {
                        "chunks": [],
                        "agent_steps": [],
                        "history_summary": None,
                        "rewritten_query": None,
                    },
                }

            history_context = PromptContext.build(history)
            context = "\n\n".join(
                doc.page_content for doc in docs
            )
            _log.debug("[ask] Context built (%d chars), invoking LLM chain", len(context))

            response = self.chain.invoke(
            {
                "history": history_context,
                "context": context,
                "question": question,
            }
            )
            answer = response.content.strip()

            if (
                answer == ""
                or "i couldn't find" in answer.lower()
                or "not found" in answer.lower()
                or "don't have enough information" in answer.lower()
            ):
                _log.debug("[ask] LLM could not answer. Switching to WEB.")

                return {
                    "success": False,
                    "fallback_to_web": True,
                    "answer": "",
                    "sources": {
                        "chunks": [],
                        "agent_steps": [],
                        "history_summary": None,
                        "rewritten_query": None,
                    },
                }
            _log.debug("[ask] LLM chain returned, response type=%s", type(response).__name__)

            chunks = []

            for i, doc in enumerate(docs):

                page = doc.metadata.get("page", "Unknown")

                source = doc.metadata.get("source", "")

                preview = doc.page_content[:250].replace("\n", " ")

                chunks.append(
                    {
                        "rank": i + 1,
                        "score": 1.0,
                        "meta": {
                            "page": page + 1 if isinstance(page, int) else page,
                            "source": source.split("\\")[-1],
                        },
                        "preview": preview,
                    }
                )

            _log.debug("[ask] Returning success response with %d chunks", len(chunks))
            return {
                    "success": True,
                    "answer": answer,
                    "sources": {
                        "chunks": chunks,
                        "agent_steps": [],
                        "history_summary": None,
                        "rewritten_query": None,
                    },
                }

        except Exception as e:
            _log.error("[ask] Exception: %s", e, exc_info=True)

            return {
                "success": False,
                "fallback_to_web": True,
                "answer": "",
                "error": str(e),
                "sources": {
                    "chunks": [],
                    "agent_steps": [],
                    "history_summary": None,
                    "rewritten_query": None,
                },
            }