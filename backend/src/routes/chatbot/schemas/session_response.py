from datetime import datetime
from pydantic import BaseModel


class ChatSessionOut(BaseModel):
    id: int
    title: str
    domain_key: str | None
    created_at: datetime
    updated_at: datetime
    last_preview: str | None = None
    message_count: int | None = None

    model_config = {"from_attributes": True}