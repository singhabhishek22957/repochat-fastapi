import redis.asyncio as redis


redis_client = redis.Redis(
    host="redis",
    port=6379,
    encoding="utf-8",
    decode_responses=True,
)