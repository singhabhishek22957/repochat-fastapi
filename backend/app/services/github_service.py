import httpx 
from urllib.parse import urlparse 



async def get_repo_metadata (rep_url:str)-> dict:
    parsed = urlparse(rep_url)

    parts = parsed.path.strip('/').split('/')

    if len(parts) <2 :
        raise ValueError("Invalid repository URL")

    owner = parts[0]
    name = parts[1].removesuffix('.git')

    api_url = f"https://api.github.com/repos/{owner}/{name}"

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url)

    data =  response.json()

    return {
        "owner": data['owner']['login'],
        "name": data['name'],
        "branch": data['default_branch'],
    }




# app/services/git_service.py

import subprocess
from pathlib import Path


REPO_DIR = Path("/app/repositories")


def clone_repo(url: str, repo_id: str) -> str:
    REPO_DIR.mkdir(parents=True, exist_ok=True)

    destination = REPO_DIR / repo_id

    subprocess.run(
        [
            "git",
            "clone",
            "--depth",
            "1",
            url,
            str(destination)
        ],
        check=True
    )

    return str(destination)
    
