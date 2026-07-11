import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from shared.auth.jwt_auth_function import jwt_auth
from db.db_session import get_db

from src.routes.chatbot.controllers.session_controller import (
    get_chat_messages,
    send_chat_message,
)
from src.routes.chatbot.schemas.chat_request import ChatRequest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/sessions/{session_id}/messages")
def messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    try:
        result = get_chat_messages(
            db=db,
            session_id=session_id,
            user_id=user_id,
        )
    except Exception as e:
        logger.error(
            "Failed to get messages for session %s: %s",
            session_id,
            e,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve messages",
        )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return result


@router.post("/sessions/{session_id}/messages")
def send_message(
    session_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    logger.debug("[POST messages] session_id=%s user_id=%s", session_id, user_id)
    try:
        result = send_chat_message(
            db=db,
            session_id=session_id,
            user_id=user_id,
            content=request.content,
        )
        logger.debug("[POST messages] send_chat_message returned type=%s", type(result).__name__)
    except Exception as e:
        logger.error(
            "Failed to send message for session %s: %s",
            session_id,
            e,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to send message",
        )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    logger.debug("[POST messages] Returning result for session %s", session_id)
    return result