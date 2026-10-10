from fastapi import APIRouter, status, Request

from app.schema.common import APIResponse
from app.schema.message import MessageCreate, MessageResponse
from app.controllers.message import (
    create_message_controller,
    get_messages_controller,
)
from app.core.success_res import success_res


router = APIRouter(
    prefix="/chats/{chat_id}/messages",
    tags=["messages"],
)


@router.post(
    "",
    response_model=APIResponse[MessageResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    chat_id: str,
    data: MessageCreate,
    req: Request,
):
    current_user = req.state.user
    message = await create_message_controller(
        data=data,
        chat_id=chat_id,
        user_id=str(current_user["id"]),
    )

    return success_res(
        message,
        "Message Created Successfully",
    )


@router.get(
    "",
    response_model=APIResponse[list[MessageResponse]],
    status_code=status.HTTP_200_OK,
)
async def get_messages(
    chat_id: str,
    req: Request,
):
    messages = await get_messages_controller(chat_id=chat_id)

    return success_res(
        messages,
        "Messages Retrieved Successfully",
    )