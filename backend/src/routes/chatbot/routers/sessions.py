import logging
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.db_session import get_db
from shared.auth.jwt_auth_function import jwt_auth

logger = logging.getLogger(__name__)

from src.routes.chatbot.controllers.session_controller import (
    create_chat_session,
    list_chat_sessions,
    update_chat_session,
    delete_chat_session,
    backfill_session_titles,
)
from src.routes.chatbot.schemas.session_request import SessionRequest, SessionUpdateRequest

router = APIRouter()


@router.post("/sessions")
def create_session(
    request: SessionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")
    t0 = time.monotonic()

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    session = create_chat_session(
        db=db,
        user_id=user_id,
        title=request.title,
        domain_key=request.domain_key,
    )

    elapsed_ms = (time.monotonic() - t0) * 1000
    logger.info(
        "SESSION_CREATE user_id=%s session_id=%s title=%r domain_key=%r elapsed_ms=%.1f",
        user_id,
        session.id,
        session.title,
        session.domain_key,
        elapsed_ms,
    )

    return {
        "session": session,
    }


@router.delete("/sessions/{session_id}")
def delete_session_endpoint(
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

    deleted = delete_chat_session(
        db=db,
        session_id=session_id,
        user_id=user_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return {"ok": True}


@router.post("/sessions/backfill-titles")
def backfill_titles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    updated = backfill_session_titles(
        db=db,
        user_id=user_id,
    )

    return {
        "updated": updated,
    }


@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    sessions = list_chat_sessions(
        db=db,
        user_id=user_id,
    )

    data = []

    for session, count in sessions:
        session.message_count = count
        data.append(session)

    return {
        "sessions": data,
    }


@router.patch("/sessions/{session_id}")
def update_session_title(
    session_id: int,
    request: SessionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(jwt_auth),
):
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    session = update_chat_session(
        db=db,
        session_id=session_id,
        user_id=user_id,
        title=request.title,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return {
        "session": session,
    }