import logging

from sqlalchemy.orm import Session

from src.routes.chatbot.crud.chat_session import (
    create_session,
    get_session,
    get_sessions,
    update_session,
    delete_session,
    backfill_new_chat_titles,
    _derive_title,
)
from src.routes.chatbot.crud.chat_message import (
    create_message,
    get_messages,
)
from chatbot.chatbot_service import ChatbotService

logger = logging.getLogger(__name__)


def create_chat_session(
    db: Session,
    user_id: int,
    title: str | None,
    domain_key: str | None,
):
    return create_session(
        db=db,
        user_id=user_id,
        title=title,
        domain_key=domain_key,
    )


def list_chat_sessions(
    db: Session,
    user_id: int,
):
    return get_sessions(
        db=db,
        user_id=user_id,
    )


def update_chat_session(
    db: Session,
    session_id: int,
    user_id: int,
    title: str | None = None,
):
    return update_session(
        db=db,
        session_id=session_id,
        user_id=user_id,
        title=title,
    )


def backfill_session_titles(
    db: Session,
    user_id: int,
):
    return backfill_new_chat_titles(db=db, user_id=user_id)


def delete_chat_session(
    db: Session,
    session_id: int,
    user_id: int,
) -> bool:
    return delete_session(db=db, session_id=session_id, user_id=user_id)


def get_chat_messages(
    db: Session,
    session_id: int,
    user_id: int,
):
    session = get_session(
        db=db,
        session_id=session_id,
        user_id=user_id,
    )

    if not session:
        return None

    messages = get_messages(
        db=db,
        session_id=session.id,
    )

    return {
        "session": session,
        "messages": messages,
    }


def send_chat_message(
    db: Session,
    session_id: int,
    user_id: int,
    content: str,
):
    logger.debug("[send_chat_message] Looking up session %s for user %s", session_id, user_id)
    session = get_session(
        db=db,
        session_id=session_id,
        user_id=user_id,
    )

    if not session:
        logger.debug("[send_chat_message] Session %s not found", session_id)
        return None

    logger.debug("[send_chat_message] Creating user message in session %s", session.id)
    user_message = create_message(
        db=db,
        session_id=session.id,
        role="user",
        content=content,
    )
    logger.debug("[send_chat_message] User message created (id=%s), calling chatbot.ask()", getattr(user_message, 'id', '?'))

    if session.title == "New Chat":
        session.title = _derive_title(content)
        db.flush()

    try:
        chatbot = ChatbotService()
        logger.debug("[send_chat_message] ChatbotService instantiated, calling ask()")
        answer = chatbot.ask(content)
        logger.debug("[send_chat_message] ask() returned, type=%s", type(answer).__name__)

    except Exception as e:
        logger.error(
            "chatbot.ask() failed for session %s: %s",
            session_id,
            e,
            exc_info=True,
        )

        assistant_message = create_message(
            db=db,
            session_id=session.id,
            role="assistant",
            content="Sorry, something went wrong while generating the response.",
            sources=None,
        )

        return {
            "user_message": user_message,
            "assistant_message": assistant_message,
        }

    if isinstance(answer, dict):
        assistant_text = answer.get("answer", "")
        sources = answer.get("sources")
    else:
        assistant_text = answer
        sources = None

    logger.debug("[send_chat_message] Creating assistant message in session %s", session.id)
    assistant_message = create_message(
        db=db,
        session_id=session.id,
        role="assistant",
        content=assistant_text,
        sources=sources,
    )
    logger.debug("[send_chat_message] Assistant message created (id=%s), returning", getattr(assistant_message, 'id', '?'))

    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
    }