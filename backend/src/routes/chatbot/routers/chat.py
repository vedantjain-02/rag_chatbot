from fastapi import APIRouter

from src.routes.chatbot.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
)

from src.routes.chatbot.controllers.chat_controller import chat_controller

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest):
    return chat_controller(request.question)