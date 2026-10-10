from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=10000
    )


class MessageResponse(BaseModel):
    id: str

    chat_id: str
    user_id: str

    role: Literal["user", "assistant", "system"]

    content: str

    sources: list[dict[str, Any]] = Field(
        default_factory=list
    )

    model: str | None = None

    created_at: datetime
    updated_at: datetime