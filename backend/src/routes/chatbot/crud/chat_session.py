from sqlalchemy.orm import Session
from sqlalchemy import func

from src.routes.chatbot.models.chat_session import ChatSession
from src.routes.chatbot.models.chat_message import ChatMessage


def _derive_title(content: str, max_len: int = 50) -> str:
    clean = " ".join(content.split())
    return clean[:max_len] + ("…" if len(clean) > max_len else "")


def create_session(
    db: Session,
    user_id: int,
    title: str | None,
    domain_key: str | None,
):
    session = ChatSession(
        user_id=user_id,
        title=title or "New Chat",
        domain_key=domain_key,
    )

    db.add(session)
    db.flush()
    db.refresh(session)

    return session


def get_sessions(
    db: Session,
    user_id: int,
):
    sessions = (
        db.query(
            ChatSession,
            func.count(ChatMessage.id).label("message_count"),
        )
        .outerjoin(ChatMessage)
        .filter(
            ChatSession.user_id == user_id,
            ChatSession.is_deleted == False,
        )
        .group_by(ChatSession.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )

    return sessions


def get_session(
    db: Session,
    session_id: int,
    user_id: int,
):
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
            ChatSession.is_deleted == False,
        )
        .first()
    )


def update_session(
    db: Session,
    session_id: int,
    user_id: int,
    title: str | None = None,
):
    session = get_session(db=db, session_id=session_id, user_id=user_id)
    if not session:
        return None

    if title is not None:
        session.title = title

    db.flush()
    db.refresh(session)
    return session


def delete_session(db: Session, session_id: int, user_id: int) -> bool:
    session = get_session(db=db, session_id=session_id, user_id=user_id)
    if not session:
        return False
    session.is_deleted = True
    db.flush()
    return True


def backfill_new_chat_titles(db: Session, user_id: int) -> int:
    sessions = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == user_id,
            ChatSession.is_deleted == False,
            ChatSession.title == "New Chat",
        )
        .all()
    )

    updated = 0
    for session in sessions:
        first_msg = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.session_id == session.id,
                ChatMessage.role == "user",
            )
            .order_by(ChatMessage.created_at.asc())
            .first()
        )
        if first_msg:
            session.title = _derive_title(first_msg.content)
            updated += 1

    if updated:
        db.flush()

    return updated