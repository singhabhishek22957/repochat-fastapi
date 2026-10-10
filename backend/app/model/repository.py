from datetime import datetime, timezone
from typing import Any


def repository_document(
    *,
    user_id: str,
    url: str,
    owner: str,
    name: str,
    branch: str = "main",
) -> dict[str, Any]:

    now = datetime.now(timezone.utc)

    return {
        "user_id": user_id,

        "url": url,
        "provider": "github",

        "owner": owner,
        "name": name,
        "branch": branch,

        # Repository version
        "commit_sha": None,

        # Ingestion status
        "status": "pending",

        # Repository statistics
        "file_count": 0,
        "chunk_count": 0,

        # Sync information
        "last_synced_at": None,

        "created_at": now,
        "updated_at": now,
    }