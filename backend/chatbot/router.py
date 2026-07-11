from fastapi import APIRouter
from pydantic import BaseModel
from .chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags= ["RAG Chatbot"])

chatbot = ChatbotService()

class ChatRequest(BaseModel):
    question: str

@router.post("/chat")
def chat(request: ChatRequest):
    
    result = chatbot.ask(request.question)

    return result