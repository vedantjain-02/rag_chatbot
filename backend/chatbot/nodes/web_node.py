import logging
from chatbot.agents.web_agent import WebAgent

logger = logging.getLogger(__name__)

web = WebAgent()


def web_node(state):
    logger.debug("===== WEB NODE =====")

    result = web.run(state["question"])

    state["answer"] = result["answer"]
    state["sources"] = result["sources"]

    return state