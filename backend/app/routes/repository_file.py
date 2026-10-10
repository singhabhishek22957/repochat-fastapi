from fastapi import APIRouter, status, Depends, Request

from app.schema.common import APIResponse
from app.schema.repository_file import RepositoryFileResponse

from app.controllers.repository_file import (
    get_repository_file_controller,
    get_repository_files_controller,
    get_file_by_path_controller,
)

from app.core.success_res import success_res


router = APIRouter(
    prefix="/repositories/{repository_id}/files",
    tags=["repository-files"],
)


@router.get( 
    "",
    response_model=APIResponse[list[RepositoryFileResponse]],
    status_code=status.HTTP_200_OK,
)
async def get_repository_files(
    repository_id: str,
):
    files = await get_repository_files_controller(
        repository_id=repository_id,
    )

    return success_res(
        files,
        "Repository Files Fetched Successfully",
    )


@router.get(
    "/{file_id}",
    response_model=APIResponse[RepositoryFileResponse],
    status_code=status.HTTP_200_OK,
)
async def get_repository_file(
    repository_id: str,
    file_id: str,
):
    file = await get_repository_file_controller(
        file_id=file_id,
    )

    return success_res(
        file,
        "Repository File Fetched Successfully",
    )


@router.get(
    "/path/{path:path}",
    response_model=APIResponse[RepositoryFileResponse],
    status_code=status.HTTP_200_OK,
)
async def get_repository_file_by_path(
    repository_id: str,
    path: str,
):
    file = await get_file_by_path_controller(
        repository_id=repository_id,
        path=path,
    )

    return success_res(
        file,
        "Repository File Fetched Successfully",
    )