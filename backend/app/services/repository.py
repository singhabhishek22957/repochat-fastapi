from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.core.db import repository_collection
from app.core import exceptions
from app.model.repository import repository_document
from app.schema.repository import (
    RepositoryCreate,
    RepositoryResponse,
)


async def create_repository_service(
    *,
    user_id: str,
    data: RepositoryCreate,
) -> RepositoryResponse:

    repository = repository_document(
        user_id=user_id,
        url=str(data["url"]),
        owner=data['owner'],
        name=data['name'],
        branch=data['branch'],
    )

    try:
        result = await repository_collection.insert_one(repository)

        return RepositoryResponse(
            id=str(result.inserted_id),
            user_id=user_id,
            url=repository["url"],
            provider=repository["provider"],
            owner=repository["owner"], 
            name=repository["name"],
            branch=repository["branch"],
            commit_sha=repository["commit_sha"],
            status=repository["status"],
            file_count=repository["file_count"],
            chunk_count=repository["chunk_count"],
            last_synced_at=repository["last_synced_at"],
            created_at=repository["created_at"],
            updated_at=repository["updated_at"],
        )

    except DuplicateKeyError:
        raise exceptions.AppException(
            "Repository already exists",
            "REPOSITORY_ALREADY_EXISTS",
            409,
        )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to create repository",
            "REPOSITORY_CREATION_FAILED",
            500,
        )


async def get_repository_service(
    *,
    repository_id: str,
    user_id: str,
) -> RepositoryResponse:

    if not ObjectId.is_valid(repository_id):
        raise exceptions.AppException(
            "Invalid repository ID",
            "INVALID_REPOSITORY_ID",
            400,
        )

    try:
        repository = await repository_collection.find_one(
            {
                "_id": ObjectId(repository_id),
                "user_id": user_id,
            }
        )

        if not repository:
            raise exceptions.AppException(
                "Repository not found",
                "REPOSITORY_NOT_FOUND",
                404,
            )

        return RepositoryResponse(
            id=str(repository["_id"]),
            user_id=str(repository["user_id"]),
            url=repository["url"],
            provider=repository["provider"],
            owner=repository["owner"],
            name=repository["name"],
            branch=repository["branch"],
            commit_sha=repository["commit_sha"],
            status=repository["status"],
            file_count=repository["file_count"],
            chunk_count=repository["chunk_count"],
            last_synced_at=repository["last_synced_at"],
            created_at=repository["created_at"],
            updated_at=repository["updated_at"],
        )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to fetch repository",
            "REPOSITORY_FETCH_FAILED",
            500,
        )


async def get_all_repositories_service(
    *,
    user_id: str,
) -> list[RepositoryResponse]:
    try:
        cursor = repository_collection.find({"user_id": user_id}).sort("created_at", -1)
        repositories: list[RepositoryResponse] = []
        async for repo in cursor:
            repositories.append(
                RepositoryResponse(
                    id=str(repo["_id"]),
                    user_id=str(repo["user_id"]),
                    url=repo["url"],
                    provider=repo.get("provider", "github"),
                    owner=repo["owner"],
                    name=repo["name"],
                    branch=repo["branch"],
                    commit_sha=repo.get("commit_sha"),
                    status=repo["status"],
                    file_count=repo.get("file_count", 0),
                    chunk_count=repo.get("chunk_count", 0),
                    last_synced_at=repo.get("last_synced_at"),
                    created_at=repo["created_at"],
                    updated_at=repo["updated_at"],
                )
            )
        return repositories
    except PyMongoError:
        raise exceptions.AppException(
            "Failed to fetch repositories",
            "REPOSITORIES_FETCH_FAILED",
            500,
        )


async def delete_repository_service(
    *,
    repository_id: str,
    user_id: str,
) -> None:

    if not ObjectId.is_valid(repository_id):
        raise exceptions.AppException(
            "Invalid repository ID",
            "INVALID_REPOSITORY_ID",
            400,
        )

    try:
        result = await repository_collection.delete_one(
            {
                "_id": ObjectId(repository_id),
                "user_id": user_id,
            }
        )

        if result.deleted_count == 0:
            raise exceptions.AppException(
                "Repository not found",
                "REPOSITORY_NOT_FOUND",
                404,
            )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to delete repository",
            "REPOSITORY_DELETE_FAILED",
            500,
        )


async def update_repository_status_service(
    *,
    repository_id: str,
    user_id: str,
    status: str,
) -> None:

    if not ObjectId.is_valid(repository_id):
        raise exceptions.AppException(
            "Invalid repository ID",
            "INVALID_REPOSITORY_ID",
            400,
        )

    now = datetime.now(timezone.utc)

    try:
        result = await repository_collection.update_one(
            {
                "_id": ObjectId(repository_id),
                "user_id": user_id,
            },
            {
                "$set": {
                    "status": status,
                    "updated_at": now,
                }
            },
        )

        if result.matched_count == 0:
            raise exceptions.AppException(
                "Repository not found",
                "REPOSITORY_NOT_FOUND",
                404,
            )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to update repository status",
            "REPOSITORY_STATUS_UPDATE_FAILED",
            500,
        )