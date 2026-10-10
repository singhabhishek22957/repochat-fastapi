from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import PyMongoError

from app.core.db import chat_collection, message_collection, repository_collection
from app.core import exceptions
from app.schema.chat import ChatCreate, ChatResponse

from app.model.chat import chat_document


async def create_chat_service(
    *,
    user_id: str,
    data: ChatCreate,
) -> ChatResponse:

    print("========================")
    print(user_id,data)
    print("========================")
    # 1. Require repository_id
    if not data.repository_id or not str(data.repository_id).strip():
        raise exceptions.AppException(
            "Repository ID is required to create a chat",
            "REPOSITORY_ID_REQUIRED",
            400,
        )

    # 2. Check if repository exists
    if ObjectId.is_valid(data.repository_id):
        repo_query = {"_id": ObjectId(data.repository_id)}
    else:
        repo_query = {"_id": data.repository_id}

    repo = await repository_collection.find_one(repo_query)
    if not repo:
        raise exceptions.AppException(
            "Repository not found",
            "REPOSITORY_NOT_FOUND",
            404,
        )
    print("repo",repo)
    now = datetime.now(timezone.utc)

    chat = chat_document (
        user_id=user_id,
        repository_id=data.repository_id,
        name= data.name,
        description=data.description,

    )
    print("chat",chat)
    try:
        result = await chat_collection.insert_one(chat)
        print("result",result)
        return ChatResponse(
            id=str(result.inserted_id),
            user_id=user_id,
            repository_id=data.repository_id,
            name=data.name,
            description=data.description,
            created_at=now,
            updated_at=now,
        )

    except PyMongoError as e:
        print("----------------")
        print("Failed to create chat")
        print(e)
        raise exceptions.AppException(
            "Failed to create chat",
            "CHAT_CREATION_FAILED",
            500,
        )


async def delete_chat_service(
    *,
    chat_id: str,
    user_id: str,
) -> None:

    if not ObjectId.is_valid(chat_id):
        raise exceptions.AppException(
            "Invalid chat ID",
            "INVALID_CHAT_ID",
            400,
        )

    try:
        # Safe delete: chat must belong to authenticated user
        result = await chat_collection.delete_one(
            {
                "_id": ObjectId(chat_id),
                "user_id": user_id,
            }
        )

        if result.deleted_count == 0:
            raise exceptions.ChatNotFoundError()

        # Remove all messages (user and assistant) belonging to this chat
        await message_collection.delete_many(
            {
                "chat_id": chat_id,
            }
        )

    except exceptions.ChatNotFoundError:
        raise

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to delete chat",
            "CHAT_DELETE_FAILED",
            500,
        )


async def get_all_chats_service(
    *,
    user_id: str,
) -> list[ChatResponse]:
    try:
        cursor = chat_collection.find({"user_id": user_id}).sort("created_at", -1)
        chats: list[ChatResponse] = []
        async for chat in cursor:
            chats.append(
                ChatResponse(
                    id=str(chat["_id"]),
                    user_id=str(chat["user_id"]),
                    repository_id=str(chat["repository_id"]),
                    name=chat["name"],
                    description=chat.get("description"),
                    created_at=chat["created_at"],
                    updated_at=chat["updated_at"],
                )
            )
        return chats
    except PyMongoError:
        raise exceptions.AppException(
            "Failed to fetch chats",
            "CHATS_FETCH_FAILED",
            500,
        )


async def get_chat_service(
    *,
    chat_id: str,
    user_id: str,
) -> ChatResponse:
    if not ObjectId.is_valid(chat_id):
        raise exceptions.AppException(
            "Invalid chat ID",
            "INVALID_CHAT_ID",
            400,
        )
    try:
        chat = await chat_collection.find_one(
            {
                "_id": ObjectId(chat_id),
                "user_id": user_id,
            }
        )
        if not chat:
            raise exceptions.ChatNotFoundError()

        return ChatResponse(
            id=str(chat["_id"]),
            user_id=str(chat["user_id"]),
            repository_id=str(chat["repository_id"]),
            name=chat["name"],
            description=chat.get("description"),
            created_at=chat["created_at"],
            updated_at=chat["updated_at"],
        )
    except exceptions.ChatNotFoundError:
        raise
    except PyMongoError:
        raise exceptions.AppException(
            "Failed to fetch chat",
            "CHAT_FETCH_FAILED",
            500,
        )