import logging

from chatbot.agents.supervisor import SupervisorAgent

logger = logging.getLogger(__name__)

supervisor = SupervisorAgent()


def supervisor_node(state):

    logger.debug("===== SUPERVISOR NODE =====")

    route = supervisor.route(
        state["question"]
    )

    logger.debug("Supervisor selected route: %s", route)

    state["route"] = route

    return state