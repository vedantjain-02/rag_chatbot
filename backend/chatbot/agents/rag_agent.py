from chatbot.chatbot_service import ChatbotService


class RagAgent:

    def __init__(self):
        self.chatbot = ChatbotService()

    def run(
        self,
        question: str,
        history=None,
    ):

        result = self.chatbot.ask(
            question=question,
            history=history,
        )

        return result