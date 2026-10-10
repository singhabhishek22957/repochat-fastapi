from fastapi import APIRouter, status, Depends, Request

from app.schema.common import APIResponse
from app.schema.repository import RepositoryCreate, RepositoryResponse

from app.controllers.repository import (
    create_repository_controller,
    get_repository_controller,
    get_all_repositories_controller,
    delete_repository_controller,
)

from app.core.success_res import success_res


router = APIRouter(
    prefix="/repositories",
    tags=["repositories"],
)


@router.post(
    "",
    response_model=APIResponse[RepositoryResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_repository(
    repo_url: str,
    req:Request,
):
    current_user=req.state.user
    repository = await create_repository_controller(
        repo_url,
        str(current_user["id"]),
    )

    return success_res(
        repository,
        "Repository Created Successfully",
    )


@router.get(
    "",
    response_model=APIResponse[list[RepositoryResponse]],
    status_code=status.HTTP_200_OK,
)
async def get_all_repositories(
    req: Request,
):
    current_user = req.state.user
    repositories = await get_all_repositories_controller(
        str(current_user["id"]),
    )

    return success_res(
        repositories,
        "Repositories Fetched Successfully",
    )


@router.get(
    "/{repository_id}",
    response_model=APIResponse[RepositoryResponse],
    status_code=status.HTTP_200_OK,
)
async def get_repository(
    repository_id: str,
    request: Request,
):
    current_user=request.state.user
    repository = await get_repository_controller(
        repository_id,
        str(current_user["id"]),
    )

    return success_res(
        repository,
        "Repository Fetched Successfully",
    )


@router.delete(
    "/{repository_id}",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
)
async def delete_repository(
    repository_id: str,
    req:Request,
):
    current_user=req.state.user
    await delete_repository_controller(
        repository_id,
        str(current_user["id"]),
    )

    return success_res(
        None,
        "Repository Deleted Successfully",
    ) 