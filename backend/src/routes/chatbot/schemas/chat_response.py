from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    sources: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}