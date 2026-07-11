from sqlalchemy.orm import Session

from src.routes.chatbot.models.chat_message import ChatMessage


def create_message(
    db: Session,
    session_id: int,
    role: str,
    content: str,
    sources=None,
):
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        sources=sources,
    )

    db.add(message)
    db.flush()
    db.refresh(message)

    return message


def get_messages(
    db: Session,
    session_id: int,
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )