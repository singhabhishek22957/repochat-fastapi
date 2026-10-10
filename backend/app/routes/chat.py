from fastapi import APIRouter, status, Request

from app.schema.common import APIResponse
from app.schema.chat import ChatCreate, ChatResponse
from app.controllers.chat import (
    create_chat_controller,
    get_all_chats_controller,
    get_chat_controller,
    delete_chat_controller,
)
from app.core.success_res import success_res


router = APIRouter(
    prefix="/chats",
    tags=["chats"],
)


@router.post(
    "",
    response_model=APIResponse[ChatResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_chat(
    data: ChatCreate,
    req: Request,
):
    current_user = req.state.user
    chat = await create_chat_controller(
        data=data,
        user_id=str(current_user["id"]),
    )

    return success_res(
        chat,
        "Chat Created Successfully",
    )


@router.get(
    "",
    response_model=APIResponse[list[ChatResponse]],
    status_code=status.HTTP_200_OK,
)
async def get_all_chats(
    req: Request,
):
    current_user = req.state.user
    chats = await get_all_chats_controller(
        user_id=str(current_user["id"]),
    )

    return success_res(
        chats,
        "Chats Fetched Successfully",
    )


@router.get(
    "/{chat_id}",
    response_model=APIResponse[ChatResponse],
    status_code=status.HTTP_200_OK,
)
async def get_chat(
    chat_id: str,
    req: Request,
):
    current_user = req.state.user
    chat = await get_chat_controller(
        chat_id=chat_id,
        user_id=str(current_user["id"]),
    )

    return success_res(
        chat,
        "Chat Fetched Successfully",
    )


@router.delete(
    "/{chat_id}",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
)
async def delete_chat(
    chat_id: str,
    req: Request,
):
    current_user = req.state.user
    await delete_chat_controller(
        chat_id=chat_id,
        user_id=str(current_user["id"]),
    )

    return success_res(
        None,
        "Chat Deleted Successfully",
    )