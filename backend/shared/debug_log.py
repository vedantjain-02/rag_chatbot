"""NDJSON debug logging for Cursor debug mode (session d2f94c)."""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_LOG_PATH = str(_BACKEND_DIR / "logs" / "debug.log")
_SESSION = "d2f94c"


def debug_log(
    hypothesis_id: str,
    location: str,
    message: str,
    data: dict[str, Any] | None = None,
    run_id: str = "pre-fix",
) -> None:
    # #region agent log
    try:
        os.makedirs(os.path.dirname(_LOG_PATH), exist_ok=True)
        payload = {
            "sessionId": _SESSION,
            "runId": run_id,
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        with open(_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, default=str) + "\n")
    except Exception:
        pass
    # #endregion
