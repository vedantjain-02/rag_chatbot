from pydantic import BaseModel
from typing import List


class ChatRequest(BaseModel):
    question: str


class Source(BaseModel):
    page: int | str
    source: str
    preview: str


class ChatResponse(BaseModel):
    success: bool
    answer: str
    sources: List[Source]