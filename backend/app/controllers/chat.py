from app.schema.chat import ChatCreate, ChatResponse
from app.services.chat import (
    create_chat_service,
    delete_chat_service,
    get_all_chats_service,
    get_chat_service,
)


async def create_chat_controller(
    data: ChatCreate,
    user_id: str,
) -> ChatResponse:
    return await create_chat_service(
        user_id=user_id,
        data=data,
    )


async def get_all_chats_controller(
    user_id: str,
) -> list[ChatResponse]:
    return await get_all_chats_service(
        user_id=user_id,
    )


async def get_chat_controller(
    chat_id: str,
    user_id: str,
) -> ChatResponse:
    return await get_chat_service(
        chat_id=chat_id,
        user_id=user_id,
    )


async def delete_chat_controller(
    chat_id: str,
    user_id: str,
):
    await delete_chat_service(
        chat_id=chat_id,
        user_id=user_id,
    )

    return {
        "message": "Chat deleted successfully"
    }