import uuid
from pathlib import Path
from datetime import datetime, timezone
from bson import ObjectId
from qdrant_client.http import models
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.core.db import repository_collection, repository_file_collection
from app.core.qdrant import (
    qdrant_client,
    embed_texts,
    init_qdrant_collection,
)

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".idea",
    ".vscode",
}

IGNORED_FILENAMES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "Pipfile.lock",
    "Cargo.lock",
    "composer.lock",
}

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".mp4", ".mp3", ".wav", ".avi",
    ".zip", ".tar", ".gz", ".7z", ".rar",
    ".pdf", ".exe", ".bin", ".so", ".dll", ".dylib",
    ".pyc", ".pyo", ".pyd",
    ".db", ".sqlite", ".lock", ".map",
}

MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024  # 1MB limit per file


def is_text_file(file_path: Path) -> bool:
    """Check whether a file is likely to be a readable source/text file."""
    if file_path.name.lower() in IGNORED_FILENAMES:
        return False
    if file_path.suffix.lower() in IGNORED_EXTENSIONS:
        return False
    try:
        # Check size limit
        if file_path.stat().st_size > MAX_FILE_SIZE_BYTES:
            return False
        # Read a small sample to check for null bytes (binary check)
        with open(file_path, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return False
        return True
    except Exception:
        return False


async def index_repository(
    repo_id: str,
    repo_path: str,
    commit_sha: str | None = None,
) -> dict:
    """
    Chunks all valid source files in the repository, generates embeddings,
    and indexes them in Qdrant with repository metadata.
    """
    init_qdrant_collection()

    root = Path(repo_path)
    if not root.exists():
        raise FileNotFoundError(f"Repository path does not exist: {repo_path}")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        length_function=len,
        separators=["\nclass ", "\ndef ", "\nasync def ", "\nfunction ", "\n\n", "\n", " ", ""],
    )

    all_points: list[models.PointStruct] = []
    total_files = 0
    total_chunks = 0

    for file_path in root.rglob("*"):
        if not file_path.is_file():
            continue

        # Skip ignored directories
        if any(part in IGNORED_DIRS for part in file_path.parts):
            continue

        if not is_text_file(file_path):
            continue

        relative_path = str(file_path.relative_to(root)).replace("\\", "/")

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if not content.strip():
            continue

        chunks = text_splitter.split_text(content)
        if not chunks:
            continue

        total_files += 1
        file_chunk_count = len(chunks)
        total_chunks += file_chunk_count

        print(f"    [Indexing] {relative_path} ({file_chunk_count} chunks)...", flush=True)

        # Embed chunks in batch
        embeddings = embed_texts(chunks)

        for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid.uuid4())
            payload = {
                "repository_id": repo_id,
                "file_path": relative_path,
                "chunk_index": idx,
                "content": chunk_text,
                "commit_sha": commit_sha or "",
            }
            all_points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload,
                )
            )

        # Update file chunk count in MongoDB
        await repository_file_collection.update_one(
            {
                "repository_id": repo_id,
                "path": relative_path,
            },
            {
                "$set": {
                    "chunk_count": file_chunk_count,
                    "status": "indexed",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        # Upsert in batches of 40 to avoid large payload requests and HTTP timeouts
        if len(all_points) >= 40:
            qdrant_client.upsert(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                points=all_points,
            )
            all_points = []

    # Upsert remaining points
    if all_points:
        qdrant_client.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=all_points,
        )

    # Update repository document status in MongoDB
    now = datetime.now(timezone.utc)
    if ObjectId.is_valid(repo_id):
        repo_filter = {"_id": ObjectId(repo_id)}
    else:
        repo_filter = {"_id": repo_id}

    await repository_collection.update_one(
        repo_filter,
        {
            "$set": {
                "status": "indexed",
                "file_count": total_files,
                "chunk_count": total_chunks,
                "last_synced_at": now,
                "updated_at": now,
            }
        },
    )

    return {
        "repository_id": repo_id,
        "files_indexed": total_files,
        "chunks_indexed": total_chunks,
        "status": "indexed",
    }
