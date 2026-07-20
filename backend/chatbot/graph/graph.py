import logging

from langgraph.graph import StateGraph, END

from chatbot.graph.state import GraphState

from chatbot.nodes.supervisor_node import supervisor_node
from chatbot.nodes.rag_node import rag_node
from chatbot.nodes.web_node import web_node

logger = logging.getLogger(__name__)

builder = StateGraph(GraphState)

# Nodes
builder.add_node(
    "supervisor",
    supervisor_node,
)

builder.add_node(
    "rag",
    rag_node,
)

builder.add_node(
    "web",
    web_node,
)

# Entry
builder.set_entry_point("supervisor")


# Conditional Routing
def route(state):

    logger.debug(
        "Routing to %s",
        state["route"],
    )

    return state["route"].lower()


builder.add_conditional_edges(
    "supervisor",
    route,
    {
        "rag": "rag",
        "web": "web",
    },
)

# End
builder.add_edge(
    "rag",
    END,
)

builder.add_edge(
    "web",
    END,
)

graph = builder.compile()