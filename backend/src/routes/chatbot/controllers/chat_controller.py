from chatbot.chatbot_service import ChatbotService


def chat_controller(question: str):
    chatbot = ChatbotService()
    return chatbot.ask(question)