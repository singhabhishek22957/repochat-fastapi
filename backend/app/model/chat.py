from datetime import datetime, timezone

from typing import Any


def chat_document(
    *,
    user_id: str,
    repository_id: str,
    name: str,
    description: str | None = None,
) -> dict[str, Any]:

    now = datetime.now(timezone.utc)

    return {
        "user_id": user_id,
        "repository_id": repository_id,

        "name": name,
        "description": description,

        "created_at": now,
        "updated_at": now,
    }