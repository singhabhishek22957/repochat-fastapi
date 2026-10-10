from app.schema.message import MessageCreate, MessageResponse
from app.services.message import (
    create_message_service,
    get_chat_messages_service,
    process_chat_message,
)


async def create_message_controller(
    data: MessageCreate,
    chat_id: str,
    user_id: str,
) -> MessageResponse:
    #  Store the user's message
    await create_message_service(
        chat_id=chat_id,
        user_id=user_id,
        role="user",
        content=data.content,
    )
    #  Generete assistant reply via langgraph RAG pipeline
    assistant_msg = await process_chat_message(
        chat_id=chat_id,
        user_content=data.content,
    )
    return assistant_msg


async def get_messages_controller(
    chat_id: str,
) -> list[MessageResponse]:
    return await get_chat_messages_service(chat_id=chat_id)