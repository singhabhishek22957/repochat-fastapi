from app.schema.repository import RepositoryCreate

from app.services.repository import (
    create_repository_service,
    get_repository_service,
    get_all_repositories_service,
    delete_repository_service,
)

from app.services.github_service import get_repo_metadata

import json 
from app.core.redis import redis_client
async def create_repository_controller(
    repo_url: str,
    user_id: str, 
):
    data = await get_repo_metadata(repo_url)
    result =  await create_repository_service(
        user_id=user_id,
        data={
            "url": repo_url,
            "owner": data["owner"],
            "name": data["name"],
            "branch": data["branch"],
        },
    )

    job = {
        "repo_id": str(result.id),
        "repo_url": repo_url,
        "commit_sha": result.commit_sha,
    }

    await redis_client.lpush("repo_jobs", json.dumps(job))

    return result


async def get_repository_controller(
    repository_id: str,
    user_id: str,
):
    return await get_repository_service(
        repository_id=repository_id,
        user_id=user_id,
    )


async def get_all_repositories_controller(
    user_id: str,
):
    return await get_all_repositories_service(
        user_id=user_id,
    )


async def delete_repository_controller(
    repository_id: str,
    user_id: str,
):
    await delete_repository_service(
        repository_id=repository_id,
        user_id=user_id,
    )

    return {
        "message": "Repository deleted successfully"
    }