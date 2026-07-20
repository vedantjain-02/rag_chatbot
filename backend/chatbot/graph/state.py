from typing import TypedDict, List, Optional, Any


class GraphState(TypedDict):
    question: str
    history: Optional[List[Any]]

    route: Optional[str]

    answer: Optional[str]

    sources: Optional[dict]

    success: Optional[bool]

    error: Optional[str]