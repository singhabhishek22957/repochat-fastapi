from datetime import datetime, timezone

from typing import Any


def message_document(
    *,
    chat_id: str,
    user_id: str,
    role: str,
    content: str,
    sources: list[dict[str, Any]] | None = None,
    model: str | None = None,
) -> dict[str, Any]:

    now = datetime.now(timezone.utc)

    return {
        "chat_id": chat_id,
        "user_id": user_id,

        "role": role,
        "content": content,

        "sources": sources or [],
        "model": model,

        "created_at": now,
        "updated_at": now,
    }