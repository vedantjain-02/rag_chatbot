import logging

from chatbot.agents.rag_agent import RagAgent

logger = logging.getLogger(__name__)

rag = RagAgent()


def rag_node(state):

    logger.debug("===== RAG NODE =====")

    result = rag.run(
        question=state["question"],
        history=state.get("history"),
    )

    state["success"] = result.get("success")
    state["answer"] = result.get("answer")
    state["sources"] = result.get("sources")
    state["error"] = result.get("error")

    return state