import asyncio
import json
from redis.exceptions import TimeoutError as RedisTimeoutError, RedisError

from app.core.redis import redis_client
from app.services.repository_file import scan_repository
from app.services.github_service import clone_repo
from app.rag.indexer import index_repository


async def worker():
    print("Worker started, waiting for jobs in 'repo_jobs' queue...", flush=True)
    while True:
        try:
            # Use timeout=5 to prevent long-lived socket timeout disconnects
            job_data = await redis_client.brpop(["repo_jobs"], timeout=5)
            if not job_data:
                continue

            _, raw_job = job_data
            job = json.loads(raw_job)

            repo_id = job['repo_id']
            repo_url = job['repo_url']
            commit_sha = job.get('commit_sha') or ""

            print(f"--> [Cloning]: {repo_url}", flush=True)
            repo_path = clone_repo(repo_url, repo_id)

            print(f"--> [Scanning]: {repo_id}", flush=True)
            await scan_repository(repo_id, repo_path, commit_sha)
            print(f"--> [Repository scanned]: {repo_id}", flush=True)

            print(f"--> [Indexing in Qdrant]: {repo_id}", flush=True)
            await index_repository(repo_id, repo_path, commit_sha)
            print(f"--> [Repository indexed]: {repo_id}", flush=True)

        except (RedisTimeoutError, asyncio.TimeoutError):
            # Idle poll timeout; continue loop seamlessly
            continue
        except Exception as e:
            print(f"[Worker Error]: {e}", flush=True)
            await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(worker())