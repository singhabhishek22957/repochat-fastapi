from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class RepositoryCreate(BaseModel):
    url: HttpUrl = Field(
        ...,
        description="GitHub repository URL",
    )

    owner: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    branch: str = Field(
        default="main",
        min_length=1,
        max_length=100,
    )


class RepositoryResponse(BaseModel):
    id: str

    user_id: str

    url: str
    provider: str

    owner: str
    name: str
    branch: str

    commit_sha: str | None

    status: str

    file_count: int
    chunk_count: int

    last_synced_at: datetime | None

    created_at: datetime
    updated_at: datetime