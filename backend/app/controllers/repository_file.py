from app.services.repository_file import (
    create_repository_file_service,
    get_repository_file_service,
    get_repository_file_service,
    get_file_by_path_service,
    update_repository_file_service,
    delete_repository_file_service,
)

from app.schema.repository_file import RepositoryFileResponse


async def create_repository_file_controller(
    *,
    repository_id: str,
    path: str,
    content_hash: str,
    commit_sha: str,
    chunk_count: int = 0,
):
    return await create_repository_file_service(
        repository_id=repository_id,
        path=path,
        content_hash=content_hash,
        commit_sha=commit_sha,
        chunk_count=chunk_count,
    )


async def get_repository_file_controller(
    *,
    file_id: str,
):
    return await get_repository_file_service(
        file_id=file_id,
    )


async def get_repository_files_controller(
    *,
    repository_id: str,
):
    return await get_repository_file_service(
        repository_id=repository_id,
    )


async def get_file_by_path_controller(
    *,
    repository_id: str,
    path: str,
):
    return await get_file_by_path_service(
        repository_id=repository_id,
        path=path,
    )


async def update_repository_file_controller(
    *,
    repository_id: str,
    path: str,
    content_hash: str,
    commit_sha: str,
    chunk_count: int,
):
    await update_repository_file_service(
        repository_id=repository_id,
        path=path,
        content_hash=content_hash,
        commit_sha=commit_sha,
        chunk_count=chunk_count,
    )


async def delete_repository_file_controller(
    *,
    repository_id: str,
    path: str,
):
    await delete_repository_file_service(
        repository_id=repository_id,
        path=path,
    )