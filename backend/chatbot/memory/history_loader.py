from sqlalchemy.orm import Session

from src.routes.chatbot.models.chat_message import ChatMessage


class HistoryLoader:

    def __init__(self, db: Session):
        self.db = db

    def load(
        self,
        session_id: int,
        limit: int = 10,
    ):
        messages = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .all()
        )

        messages.reverse()

        history = []

        for msg in messages:
            history.append(
                {
                    "role": msg.role,
                    "content": msg.content,
                }
            )

        return history