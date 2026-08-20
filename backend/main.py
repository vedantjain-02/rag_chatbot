import logging
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

import src  # noqa: F401 — register ORM models
from config.environment import CORS_ORIGINS, MEDIA_PATH
from shared import get_logger, log_error
from src.routes.chatbot.router import router as chatbot_router
from src.routes.users.router import router as users_router

logger = get_logger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
app = FastAPI(title="RAG Chatbot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)


@app.get("/")
async def root():
    return {"message": "RAG Chatbot backend running", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


app.include_router(users_router, prefix="/users")
app.include_router(chatbot_router, prefix="/users")
os.makedirs(MEDIA_PATH, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_PATH), name="media")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        detail = str(exc.detail)
        return JSONResponse(status_code=exc.status_code, content={"success": False, "status": exc.status_code, "message": detail, "error": detail})
    log_error(logger, f"Unhandled exception on {request.method} {request.url.path}", exception=exc)
    return JSONResponse(status_code=500, content={"success": False, "status": 500, "message": "Internal Server Error", "error": "An unexpected error occurred."})
