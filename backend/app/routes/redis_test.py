from fastapi import APIRouter

from app.core.redis import redis_client
from app.core.success_res import success_res

router = APIRouter(
    prefix="/redis",
    tags=["redis"],
)


@router.get('/set')
async def set_key(key: str, value: str):
    data = await redis_client.set(key, value)

    return  success_res(data, "Value Set Successfully")

@router.get('/get')
async def get_key(key: str):
    data = await redis_client.get(key)

    return  success_res(data, "Value Fetched Successfully")