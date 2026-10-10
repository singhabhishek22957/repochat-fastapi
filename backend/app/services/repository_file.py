
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.errors import PyMongoError

from app.core.db import repository_file_collection
from app.core import exceptions
from app.schema.repository_file import RepositoryFileResponse
from app.model.repository_file import repository_file_document


# app/services/repository_file_service.py

from pathlib import Path
import hashlib


IGNORE = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
}


async def scan_repository(
    repo_id: str,
    repo_path: str,
    commit_sha: str
):
    root = Path(repo_path)

    for file in root.rglob("*"):

        if not file.is_file():
            continue

        # Ignore unwanted directories
        if any(part in IGNORE for part in file.parts):
            continue

        content = file.read_bytes()

        content_hash = hashlib.sha256(content).hexdigest()

        relative_path = file.relative_to(root)

        document = repository_file_document(
            repository_id=repo_id,
            path=str(relative_path),
            content_hash=content_hash,
            commit_sha=commit_sha,
        )
        # MongoDB
        await repository_file_collection.insert_one(document)


async def create_repository_file_service(
    *,
    repository_id: str,
    path: str,
    content_hash: str,
    commit_sha: str,
    chunk_count: int = 0,
) -> RepositoryFileResponse:

    now = datetime.now(timezone.utc)

    file_data = {
        "repository_id": repository_id,
        "path": path,

        "content_hash": content_hash,
        "commit_sha": commit_sha,

        "chunk_count": chunk_count,

        "status": "indexed",

        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await repository_file_collection.insert_one(
            file_data
        )

        return RepositoryFileResponse(
            id=str(result.inserted_id),
            repository_id=repository_id,
            path=path,
            content_hash=content_hash,
            commit_sha=commit_sha,
            chunk_count=chunk_count,
            status="indexed",
            created_at=now,
            updated_at=now,
        )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to create repository file",
            "REPOSITORY_FILE_CREATION_FAILED",
            500,
        )


async def get_repository_file_service(
    *, 
    file_id: str,
) -> RepositoryFileResponse:

    if not ObjectId.is_valid(file_id):
        raise exceptions.AppException(
            "Invalid file ID",
            "INVALID_REPOSITORY_FILE_ID",
            400,
        )

    try:
        file = await repository_file_collection.find_one(
            {
                "_id": ObjectId(file_id),
            }
        )

        if not file:
            raise exceptions.AppException(
                "Repository file not found",
                "REPOSITORY_FILE_NOT_FOUND",
                404,
            )

        return RepositoryFileResponse(
            id=str(file["_id"]),
            repository_id=str(file["repository_id"]),
            path=file["path"],
            content_hash=file["content_hash"],
            commit_sha=file["commit_sha"],
            chunk_count=file["chunk_count"],
            status=file["status"],
            created_at=file["created_at"],
            updated_at=file["updated_at"],
        )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to fetch repository file",
            "REPOSITORY_FILE_FETCH_FAILED",
            500,
        )


async def get_file_by_path_service(
    *,
    repository_id: str,
    path: str,
) -> RepositoryFileResponse | None:

    try:
        file = await repository_file_collection.find_one(
            {
                "repository_id": repository_id,
                "path": path,
            }
        )

        if not file:
            return None

        return RepositoryFileResponse(
            id=str(file["_id"]),
            repository_id=str(file["repository_id"]),
            path=file["path"],
            content_hash=file["content_hash"],
            commit_sha=file["commit_sha"],
            chunk_count=file["chunk_count"],
            status=file["status"],
            created_at=file["created_at"],
            updated_at=file["updated_at"],
        )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to find repository file",
            "REPOSITORY_FILE_FETCH_FAILED",
            500,
        )


async def update_repository_file_service(
    *,
    repository_id: str,
    path: str,
    content_hash: str,
    commit_sha: str,
    chunk_count: int,
) -> None:

    now = datetime.now(timezone.utc)

    try:
        result = await repository_file_collection.update_one(
            {
                "repository_id": repository_id,
                "path": path,
            },
            {
                "$set": {
                    "content_hash": content_hash,
                    "commit_sha": commit_sha,
                    "chunk_count": chunk_count,
                    "status": "indexed",
                    "updated_at": now,
                }
            },
        )

        if result.matched_count == 0:
            raise exceptions.AppException(
                "Repository file not found",
                "REPOSITORY_FILE_NOT_FOUND",
                404,
            )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to update repository file",
            "REPOSITORY_FILE_UPDATE_FAILED",
            500,
        )


async def delete_repository_file_service(
    *,
    repository_id: str,
    path: str,
) -> None:

    now = datetime.now(timezone.utc)

    try:
        result = await repository_file_collection.update_one(
            {
                "repository_id": repository_id,
                "path": path,
            },
            {
                "$set": {
                    "status": "deleted",
                    "updated_at": now,
                }
            },
        )

        if result.matched_count == 0:
            raise exceptions.AppException(
                "Repository file not found",
                "REPOSITORY_FILE_NOT_FOUND",
                404,
            )

    except PyMongoError:
        raise exceptions.AppException(
            "Failed to delete repository file",
            "REPOSITORY_FILE_DELETE_FAILED",
            500,
        )