from typing import Any, TypedDict
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from qdrant_client.http import models

from app.core.config import settings
from app.core.qdrant import async_qdrant_client, embed_query


SYSTEM_PROMPT = (
    "You are an expert AI software architect and code assistant for this repository.\n"
    "Your task is to analyze, explain, and review the repository's code, architecture, and features.\n\n"
    "Guidelines:\n"
    "1. Ground your explanation in the provided repository context chunks, citing exact file names, functions, and classes.\n"
    "2. Explain clearly how the features work and why they are implemented that way.\n"
    "3. Provide in-depth technical analysis including pros and cons of the design choices, patterns, or features when relevant.\n"
    "4. Offer actionable recommendations, architectural suggestions, and best practices where applicable.\n"
    "5. If the context does not contain sufficient information to answer fully, state what is known and specify what is missing.\n"
    "6. Format your answer with clean Markdown, clear headings, bullet points, and syntax-highlighted code blocks."
)


class RepoRAGState(TypedDict):
    query: str
    repository_id: str
    chat_history: list[dict[str, str]]
    retrieved_chunks: list[dict[str, Any]]
    context: str
    sources: list[dict[str, Any]]
    response: str


async def retrieve_node(state: RepoRAGState) -> dict[str, Any]:
    """Retrieve relevant code chunks from Qdrant vector database."""
    query = state.get("query", "").strip()
    repo_id = state.get("repository_id", "").strip()

    if not query or not repo_id:
        return {
            "retrieved_chunks": [],
            "context": "No query or repository specified.",
            "sources": [],
        }

    # Generate dense query embedding
    query_vector = embed_query(query)

    # Filter points by repository_id
    query_filter = models.Filter(
        must=[
            models.FieldCondition(
                key="repository_id",
                match=models.MatchValue(value=repo_id),
            )
        ]
    )

    try:
        search_result = await async_qdrant_client.query_points(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query=query_vector,
            query_filter=query_filter,
            limit=6,
        )
        points = search_result.points or []
    except Exception as e:
        print(f"[RAG Retrieve Error] Qdrant search failed: {e}", flush=True)
        points = []

    retrieved_chunks: list[dict[str, Any]] = []
    sources: list[dict[str, Any]] = []
    context_parts: list[str] = []

    for point in points:
        payload = point.payload or {}
        file_path = payload.get("file_path", "unknown")
        chunk_index = payload.get("chunk_index", 0)
        content = payload.get("content", "")
        score = point.score

        chunk_info = {
            "id": str(point.id),
            "file_path": file_path,
            "chunk_index": chunk_index,
            "content": content,
            "score": score,
        }
        retrieved_chunks.append(chunk_info)

        sources.append({
            "id": str(point.id),
            "file_path": file_path,
            "chunk_index": chunk_index,
            "score": round(score, 4),
        })

        ext = file_path.split(".")[-1] if "." in file_path else ""
        context_parts.append(
            f"### File: `{file_path}` (Chunk {chunk_index}, Relevance: {round(score, 3)})\n"
            f"```{ext}\n{content}\n```"
        )

    context = "\n\n".join(context_parts) if context_parts else "No relevant repository files found."

    return {
        "retrieved_chunks": retrieved_chunks,
        "context": context,
        "sources": sources,
    }


async def generate_node(state: RepoRAGState) -> dict[str, Any]:
    """Generate answer using LangChain ChatGroq and formatted prompt."""
    query = state.get("query", "")
    context = state.get("context", "")
    chat_history = state.get("chat_history", [])

    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    # Add conversational history if available
    for msg in chat_history:
        role = msg.get("role")
        content = msg.get("content", "")
        if not content:
            continue
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    # Add the current query with repository context
    current_prompt = (
        f"### Retrieved Repository Code Context:\n"
        f"{context}\n\n"
        f"### User Question:\n"
        f"{query}\n\n"
        f"Please analyze the question using the repository context above, explain the relevant code, "
        f"its pros and cons, how the feature works, and provide architectural recommendations."
    )
    messages.append(HumanMessage(content=current_prompt))

    # Initialize LangChain Groq model
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.GROQ_MODEL_NAME,
        temperature=0.2,
        max_tokens=2048,
    )

    response = await llm.ainvoke(messages)
    answer_text = response.content if isinstance(response.content, str) else str(response.content)

    return {
        "response": answer_text,
    }


# Build LangGraph StateGraph
builder = StateGraph(RepoRAGState)
builder.add_node("retrieve", retrieve_node)
builder.add_node("generate", generate_node)

builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)

rag_graph = builder.compile()
