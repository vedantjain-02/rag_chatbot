from dotenv import load_dotenv
load_dotenv()

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

import src  # noqa: F401 — register ORM models

from config.environment import MEDIA_PATH
from shared import get_logger, log_error
from src.routes.users.router import router as users_router
from src.routes.chatbot.router import router as chatbot_router

logger = get_logger(__name__)

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     from chatbot.build_index import clear_pipeline_cache

#     clear_pipeline_cache()
#     yield


app = FastAPI(title="RAG Chatbot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.mount(
    "/media",
    StaticFiles(directory=MEDIA_PATH),
    name="media",
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status": exc.status_code,
                "message": str(exc.detail),
                "error": str(exc.detail),
            },
        )

    log_error(
        logger,
        "Unhandled exception on %s %s" % (request.method, request.url.path),
        exception=exc,
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status": 500,
            "message": "Internal Server Error",
            "error": str(exc),
        },
    )
