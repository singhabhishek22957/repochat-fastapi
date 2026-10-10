from qdrant_client import AsyncQdrantClient, QdrantClient
from qdrant_client.http import models
from fastembed import TextEmbedding
from app.core.config import settings

# FastEmbed model for source code / text embeddings (384-dimensional)
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"
VECTOR_SIZE = 384

# Sync client for worker / scripts
qdrant_client = QdrantClient(
    url=settings.QDRANT_URL or None,
    api_key=settings.QDRANT_API_KEY or None,
    timeout=60,
)

# Async client for FastAPI async endpoints
async_qdrant_client = AsyncQdrantClient(
    url=settings.QDRANT_URL or None,
    api_key=settings.QDRANT_API_KEY or None,
    timeout=60,
)

# Shared embedding model instance
_embedding_model: TextEmbedding | None = None


def get_embedding_model() -> TextEmbedding:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME, threads=2)
    return _embedding_model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate dense embeddings for a list of text strings with safe batch size."""
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = list(model.embed(texts, batch_size=32))
    return [e.tolist() for e in embeddings]


def embed_query(query: str) -> list[float]:
    """Generate embedding for a single query."""
    return embed_texts([query])[0]


def init_qdrant_collection():
    """Ensure the Qdrant collection exists and payload indexes are created."""
    collection_name = settings.QDRANT_COLLECTION_NAME

    collections_response = qdrant_client.get_collections()
    existing_collections = [c.name for c in collections_response.collections]

    if collection_name not in existing_collections:
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE,
                distance=models.Distance.COSINE,
            ),
        )
        # Create payload index on repository_id for fast filtering
        qdrant_client.create_payload_index(
            collection_name=collection_name,
            field_name="repository_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
