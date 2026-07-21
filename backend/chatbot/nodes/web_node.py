import logging
from chatbot.agents.web_agent import WebAgent

logger = logging.getLogger(__name__)

web = WebAgent()


def web_node(state):
    logger.debug("===== WEB NODE =====")

    result = web.run(state["question"])

    state["success"] = result.get("success", True)
    state["fallback_to_web"] = False
    state["answer"] = result.get("answer")
    state["sources"] = result.get("sources")
    state["error"] = result.get("error")

    return state