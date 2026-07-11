from fastapi import APIRouter

from src.routes.chatbot.routers.sessions import router as sessions_router
from src.routes.chatbot.routers.messages import router as messages_router

router = APIRouter()

router.include_router(
    sessions_router,
    prefix="/api/chat",
    tags=["Chatbot"],
)

router.include_router(
    messages_router,
    prefix="/api/chat",
    tags=["Chatbot"],
)