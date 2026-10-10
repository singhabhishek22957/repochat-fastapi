from datetime import datetime

from pydantic import BaseModel, Field


class RepositoryFileResponse(BaseModel):
    id: str

    repository_id: str

    path: str

    content_hash: str
    commit_sha: str

    chunk_count: int

    status: str

    created_at: datetime
    updated_at: datetime

