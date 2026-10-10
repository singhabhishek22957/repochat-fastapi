from datetime import datetime

from pydantic import BaseModel, Field


class ChatCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    repository_id: str = Field(
        ...,
        min_length=1
    )


class ChatResponse(BaseModel):
    id: str

    user_id: str
    repository_id: str

    name: str
    description: str | None

    created_at: datetime
    updated_at: datetime