from datetime import datetime, timezone
from typing import Any


def repository_file_document(
    *,
    repository_id: str,
    path: str,
    content_hash: str,
    commit_sha: str,
    chunk_count: int = 0,
) -> dict[str, Any]:

    now = datetime.now(timezone.utc)

    return {
        "repository_id": repository_id,

        "path": path,

        "content_hash": content_hash,
        "commit_sha": commit_sha,

        "chunk_count": chunk_count,

        "status": "indexed",

        "created_at": now,
        "updated_at": now,
    }