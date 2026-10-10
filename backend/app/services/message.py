from datetime import datetime, timezone
from typing import Any, Literal
from bson import ObjectId
from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from app.core.db import message_collection, chat_collection
from app.core import exceptions
from app.core.config import settings
from app.schema.message import MessageResponse
from app.rag.graph import rag_graph


# ------------------------------------------------
# Core message creation and retrieval
# ------------------------------------------------

async def create_message_service(
    *,
    chat_id: str,
    user_id: str,
    role: Literal["user", "assistant", "system"],
    content: str,
    sources: list[dict[str, Any]] | None = None,
    model: str | None = None,
) -> MessageResponse:
    """Persist a message document in MongoDB and return MessageResponse."""
    now = datetime.now(timezone.utc)

    message = {
        "chat_id": chat_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "sources": sources or [],
        "model": model,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await message_collection.insert_one(message)
        return MessageResponse(
            id=str(result.inserted_id),
            chat_id=chat_id,
            user_id=user_id,
            role=role,
            content=content,
            sources=sources or [],
            model=model,
            created_at=now,
            updated_at=now,
        )
    except PyMongoError:
        raise exceptions.AppException(
            "Failed to create message",
            "MESSAGE_CREATION_FAILED",
            500,
        )


async def get_chat_messages_service(
    *,
    chat_id: str,
    limit: int = 50,
) -> list[MessageResponse]:
    """Retrieve messages for a chat in chronological order."""
    try:
        cursor = message_collection.find({"chat_id": chat_id}).sort("created_at", ASCENDING).limit(limit)
        messages: list[MessageResponse] = []
        async for doc in cursor:
            messages.append(
                MessageResponse(
                    id=str(doc["_id"]),
                    chat_id=doc["chat_id"],
                    user_id=doc.get("user_id", ""),
                    role=doc["role"],
                    content=doc["content"],
                    sources=doc.get("sources", []),
                    model=doc.get("model"),
                    created_at=doc["created_at"],
                    updated_at=doc["updated_at"],
                )
            )
        return messages
    except PyMongoError:
        raise exceptions.AppException(
            "Failed to retrieve messages",
            "MESSAGE_FETCH_FAILED",
            500,
        )


# ------------------------------------------------
# LangChain & LangGraph RAG execution
# ------------------------------------------------

async def _fetch_repository_id(chat_id: str) -> str:
    """Return the repository_id stored on the chat document."""
    if ObjectId.is_valid(chat_id):
        query = {"_id": ObjectId(chat_id)}
    else:
        query = {"_id": chat_id}

    chat = await chat_collection.find_one(query)
    if not chat:
        raise exceptions.AppException(
            "Chat not found",
            "CHAT_NOT_FOUND",
            404,
        )

    repo_id = chat.get("repository_id")
    if not repo_id:
        raise exceptions.AppException(
            "Chat does not have an associated repository",
            "REPOSITORY_NOT_FOUND",
            400,
        )
    return str(repo_id)


async def process_chat_message(
    chat_id: str,
    user_content: str,
) -> MessageResponse:
    """
    RAG pipeline executed via LangGraph and LangChain:
    1. Fetch repository_id from chat.
    2. Fetch prior chat history for multi-turn conversational context.
    3. Execute the LangGraph StateGraph (retrieve from Qdrant -> generate via ChatGroq).
    4. Persist the AI assistant response into MongoDB.
    """
    # 1. Resolve repository ID
    repo_id = await _fetch_repository_id(chat_id)

    # 2. Fetch recent conversation history (excluding the current user message)
    cursor = message_collection.find({"chat_id": chat_id}).sort("created_at", ASCENDING).limit(10)
    history: list[dict[str, str]] = []
    async for doc in cursor:
        history.append({
            "role": doc.get("role", "user"),
            "content": doc.get("content", ""),
        })

    # 3. Invoke LangGraph StateGraph
    initial_state = {
        "chat_id": chat_id,
        "repository_id": repo_id,
        "query": user_content,
        "chat_history": history,
        "retrieved_chunks": [],
        "context": "",
        "sources": [],
        "response": "",
    }

    graph_result = await rag_graph.ainvoke(initial_state)

    answer = graph_result.get("response", "I could not generate an answer.")
    sources = graph_result.get("sources", [])

    # 4. Save AI message into MongoDB
    assistant_msg = await create_message_service(
        chat_id=chat_id,
        user_id="assistant",
        role="assistant",
        content=answer,
        sources=sources,
        model=settings.GROQ_MODEL_NAME,
    )

    return assistant_msg