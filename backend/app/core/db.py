from pymongo import AsyncMongoClient , ASCENDING
from app.core.config import settings

client = AsyncMongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

user_collection = db["user"]
chat_collection = db["chat"]
message_collection = db["message"]
repository_collection = db["repository"]
repository_file_collection = db["repository_file"]


async def create_indexes():
    await user_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="email_unique_index"
        )
    

    await repository_collection.create_index(
    [
        ("user_id", 1),
        ("url", 1),
    ],
    unique=True,
    name="unique_user_repository",
    )


    await repository_file_collection.create_index(
    [
        ("repository_id", 1),
        ("path", 1),
    ],
    unique=True,
    name="unique_repository_file",
)

    await user_collection.create_index(
        [("username", ASCENDING)],
        unique=True,
        name="username_unique_index"
    )

    
