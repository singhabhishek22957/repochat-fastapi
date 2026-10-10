# 🚀 RepoChat — Talk to Any Git Repository with LangGraph & RAG

> **Enterprise-grade, AI-driven codebase conversation platform powered by FastAPI, LangGraph, LangChain, Qdrant Vector Search, FastEmbed, MongoDB, and React 19.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2+-blue?style=flat-square&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![LangChain](https://img.shields.io/badge/LangChain-1.4+-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://www.langchain.com)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC2626?style=flat-square&logo=qdrant&logoColor=white)](https://qdrant.tech)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [How It Works (Step-by-Step Pipeline)](#-how-it-works-step-by-step-pipeline)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Environment Variables (.env)](#-environment-variables-env)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Quickstart with Docker Compose (Recommended)](#quickstart-with-docker-compose-recommended)
  - [Manual Local Development Setup](#manual-local-development-setup)
- [Frontend User Interface](#-frontend-user-interface)
- [Security & Authentication](#-security--authentication)
- [License & Contributions](#-license--contributions)

---

## 🌟 Overview

**RepoChat** is a full-stack, distributed Retrieval-Augmented Generation (RAG) system engineered to help software engineers, open-source contributors, and students deeply understand, navigate, and analyze complex codebases.

Instead of generic LLM answers, RepoChat clones public Git repositories, splits valid source code into semantically coherent blocks, calculates dense embeddings via **FastEmbed**, and indexes them into **Qdrant Vector Database**. When you ask a question, a compiled **LangGraph `StateGraph`** retrieves the most relevant code chunks and prompts an LLM (**Groq / `openai/gpt-oss-120b`**) to generate deep architectural explanations, trade-off analysis (pros & cons), and exact file-level citations.

---

## ✨ Key Features

- **⚡ Decoupled Ingestion Pipeline**: Asynchronous background workers process repositories via a **Redis Job Queue** (`repo_jobs`), ensuring API endpoints stay non-blocking and ultra-fast.
- **🧠 LangGraph RAG Workflow**: Built with a stateful `StateGraph` (`retrieve_node` &rarr; `generate_node`) rather than rigid sequential chains.
- **🔍 Qdrant Semantic Code Search**: High-performance cosine similarity search filtered by `repository_id` keywords with FastEmbed 384-dimensional embeddings (`BAAI/bge-small-en-v1.5`).
- **💬 ChatGPT-Style Chat Interface**:
  - Multi-conversation management with persistent sidebar history.
  - Full Markdown rendering with syntax-highlighted code blocks and 1-click **Copy Code** buttons.
  - Expandable **Source Citations** showing exact file paths, chunk indices, and vector relevance scores.
  - Real-time thinking indicators and smooth auto-scrolling.
- **🛡️ Secure Dual Authentication**:
  - Argon2id password hashing.
  - 256-bit JWT authentication supporting both `Authorization: Bearer` headers and HTTP-only cookies (`SameSite=Lax`).
  - Seamless CORS preflight handling for cross-origin browser clients.
- **📊 Developer Dashboard**:
  - Live system metrics (Total Repositories, Active Chats, Indexed Code Chunks, RAG Status).
  - Quick repository and conversation shortcuts.
- **🌐 Public Showcase Landing Page**:
  - Highlights core value propositions, interactive UI previews, and curated guides for both students and experienced software architects.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 19 + TypeScript + Vite)"]
        UI["RepoChat Web App\n(Dashboard / Chat / Repositories)"]
    end

    subgraph Gateway ["API Gateway & Backend (FastAPI)"]
        AUTH["Auth Middleware\n(JWT Header / Cookie)"]
        ROUTER["REST Controllers & Routers\n(/auth, /repositories, /chats, /messages)"]
    end

    subgraph IngestionWorker ["Background Ingestion Worker"]
        REDIS[("Redis Queue\n'repo_jobs'")]
        WORKER["Worker Process\n(Git Clone + Text Splitter)"]
        FASTEMBED["FastEmbed\n(BAAI/bge-small-en-v1.5)"]
    end

    subgraph Storage ["Databases & Vector Storage"]
        MONGO[("MongoDB\n(Users, Repos, Chats, Messages)")]
        QDRANT[("Qdrant Vector DB\n(384D Embeddings + Payload)")]
    end

    subgraph RAGCore ["LangGraph RAG Engine"]
        GRAPH["LangGraph StateGraph\nSTART -> retrieve -> generate -> END"]
        GROQ["ChatGroq / LLM\n(openai/gpt-oss-120b)"]
    end

    UI -->|HTTP / Credentials| AUTH
    AUTH --> ROUTER
    ROUTER -->|Push Job| REDIS
    REDIS --> WORKER
    WORKER --> FASTEMBED
    FASTEMBED -->|Upsert Vectors| QDRANT
    WORKER -->|Update Status| MONGO
    ROUTER -->|CRUD Data| MONGO
    ROUTER -->|Trigger RAG| GRAPH
    GRAPH -->|1. Query Vectors| QDRANT
    GRAPH -->|2. Generate Answer| GROQ
    GRAPH -->|3. Persist Messages| MONGO
    ROUTER -->|Return AI Answer & Citations| UI
```

---

## ⚙️ How It Works (Step-by-Step Pipeline)

```
1. Add Repository  ──>  2. Ingestion & Splitting  ──>  3. Vector Embedding
        │                           │                           │
        ▼                           ▼                           ▼
User provides Git URL        Worker clones files,       FastEmbed generates
and Redis receives job       splits by functions/classes 384D dense vectors
                                                                │
                                                                ▼
6. Stream Answer  <───  5. Groq LLM Generation  <───  4. Qdrant Search
        │                           │                           │
        ▼                           ▼                           ▼
Markdown formatted reply    Stateful prompt with        Cosine similarity match
with citations & copy code   system architect persona    filtered by repository_id
```

### 1. Repository Registration & Job Queueing
When a user submits a GitHub repository URL:
1. `GET /repos/{owner}/{name}` queries GitHub API for the default branch and metadata.
2. A repository record is inserted into MongoDB with status `pending`.
3. A JSON payload `{ "repo_id": "...", "repo_url": "...", "commit_sha": "..." }` is pushed to Redis list `repo_jobs`.

### 2. File Ingestion & Intelligent Code Chunking
The background worker (`app.worker`) dequeues jobs using `BRPOP repo_jobs`:
1. Clones the repository to a local isolated volume.
2. Filters out binary files, images, archives, dependencies, and lock files (`node_modules`, `.venv`, `.git`, `package-lock.json`, etc.).
3. Splits files using `RecursiveCharacterTextSplitter` with code-specific separators:
   ```python
   separators=["\nclass ", "\ndef ", "\nasync def ", "\nfunction ", "\n\n", "\n", " ", ""]
   ```

### 3. Dense Vector Embeddings in Qdrant
1. Chunks are passed in batches of 32 to **FastEmbed** (`BAAI/bge-small-en-v1.5`).
2. Point payloads are constructed with `repository_id`, `file_path`, `chunk_index`, and `content`.
3. Upserted into Qdrant collection `repository_codebase` in batches of 40 points.
4. Repository status in MongoDB is updated to `indexed` with total `file_count` and `chunk_count`.

### 4. Chat Initialization & Validation
- A user creates a chat referencing the `repository_id`.
- The service validates that the repository exists and is accessible.

### 5. LangGraph RAG Workflow Execution
When the user sends a message, `process_chat_message` invokes the compiled **LangGraph `StateGraph`**:
- **`retrieve` Node**:
  - Generates dense vector for user query via `embed_query(query)`.
  - Executes `async_qdrant_client.query_points` with a filter on `repository_id == state["repository_id"]`.
  - Formats retrieved chunks into Markdown-delimited code contexts and extracts citation metadata.
- **`generate` Node**:
  - Pulls recent conversation history for multi-turn context.
  - Builds prompt with the **System Software Architect Persona**:
    - Explains how features work and why they are implemented that way.
    - Evaluates architectural pros and cons.
    - Suggests concrete improvements.
  - Invokes `ChatGroq(model_name="openai/gpt-oss-120b", temperature=0.2)`.
- **Persistence Node**:
  - User message and AI response are stored in MongoDB `message` collection.
  - Returns the assistant reply with source references to the client.

---

## 🛠️ Technology Stack

### Backend
| Technology | Description |
|---|---|
| **Python 3.13** | Core language runtime |
| **FastAPI** | High-performance, async web API framework |
| **LangGraph (v1.2+)** | Stateful multi-actor graph orchestration for RAG workflows |
| **LangChain Core & Groq** | LLM abstraction and chat model execution |
| **FastEmbed** | Fast, local in-memory embeddings generation (`bge-small-en-v1.5`) |
| **Qdrant Client** | Async vector search engine client |
| **PyMongo** | Asynchronous MongoDB driver for Python |
| **Redis (redis-py)** | Decoupled queue for asynchronous repository workers |
| **Argon2-cffi & PyJWT** | State-of-the-art password hashing and token generation |
| **Uvicorn** | Lightning-fast ASGI web server |

### Frontend
| Technology | Description |
|---|---|
| **React 19** | Modern declarative UI component library |
| **TypeScript 5.8** | Type-safe client-side logic |
| **Vite 6** | Ultra-fast build tool and development server |
| **Tailwind CSS v4** | Modern utility-first CSS framework with OKLCH tokens |
| **React Router v7** | Declarative client-side routing |
| **Zustand** | Lightweight, reactive state management |
| **React Markdown & Remark GFM**| Full GitHub-flavored markdown rendering with code fences |
| **Lucide React** | Clean, modern iconography |

### Infrastructure
| Technology | Description |
|---|---|
| **Docker & Docker Compose** | Containerized multi-service orchestration |
| **Nginx 1.27** | High-efficiency static asset server and reverse proxy |
| **MongoDB 7.0+** | Document database for users, repositories, chats, messages |
| **Redis 8.0** | In-memory key-value store and job queue broker |
| **Qdrant Cloud / Local** | High-speed vector similarity engine |

---

## 📂 Project Directory Structure

```
repochat-fastapi/
├── backend/
│   ├── app/
│   │   ├── controllers/      # Route controllers (auth, chat, message, repository)
│   │   ├── core/             # Configuration, DB connection, Qdrant client, Security
│   │   │   ├── config.py     # Pydantic BaseSettings (.env loading)
│   │   │   ├── db.py         # MongoDB async connection & index creation
│   │   │   ├── qdrant.py     # Qdrant client & FastEmbed model initialization
│   │   │   └── security.py   # Argon2 hashing & JWT decode/encode
│   │   ├── middlewares/      # Starlette AuthMiddleware (JWT header & cookie support)
│   │   ├── model/            # Mongo document helper models
│   │   ├── rag/              # RAG indexer and LangGraph workflow
│   │   │   ├── graph.py      # LangGraph StateGraph (retrieve & generate nodes)
│   │   │   └── indexer.py    # RecursiveTextSplitter & file ingestion
│   │   ├── routes/           # FastAPI routers (/auth, /repositories, /chats, /messages)
│   │   ├── schema/           # Pydantic request & response schemas
│   │   ├── services/         # Business logic layer
│   │   ├── main.py           # FastAPI application entrypoint & middleware stack
│   │   └── worker.py         # Standalone Redis queue ingestion consumer
│   ├── Dockerfile            # Python 3.13 backend container definition
│   └── requirements.txt      # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI & layout components
│   │   │   ├── chat/         # MarkdownRenderer & CodeBlock with Copy button
│   │   │   ├── layout/       # AppShell (Header, Footer, Nav)
│   │   │   └── ui/           # Button, Card, Input, Label, Separator
│   │   ├── pages/            # View pages
│   │   │   ├── chat-page.tsx         # ChatGPT-style chat interface with sidebar
│   │   │   ├── dashboard-page.tsx    # User stats & profile overview
│   │   │   ├── home-page.tsx         # Public marketing landing page
│   │   │   ├── login-page.tsx        # Modern login page with toggle password
│   │   │   ├── register-page.tsx     # Modern register page with auto-login
│   │   │   └── repositories-page.tsx # Connected repositories manager
│   │   ├── stores/           # Zustand stores (auth-store.ts)
│   │   ├── types/            # TypeScript API types (User, Repo, Chat, Message)
│   │   ├── App.tsx           # Route definition & route guards
│   │   └── index.css         # Tailwind CSS v4 styling & dark theme tokens
│   ├── Dockerfile            # Node 22 build + Nginx static server container
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration & path aliases
├── docker-compose.yml        # Multi-container orchestration (Mongo, Redis, API, Worker, Web)
└── readme.md                 # Complete documentation
```

---

## 📡 API Endpoints Reference

All private endpoints require either:
- Header: `Authorization: Bearer <access_token>`
- Cookie: `access_token=<access_token>`

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/auth/register` | Register a new user account | ❌ |
| `POST` | `/auth/login` | Authenticate user, returns JWT and sets HTTP-only cookie | ❌ |
| `POST` | `/auth/logout` | Clears the `access_token` cookie | ❌ |

### 👤 User (`/user`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/user/me` | Fetch profile details of current authenticated user | ✅ |

### 📁 Repositories (`/repositories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/repositories?repo_url={url}` | Add and queue a GitHub repo for indexing | ✅ |
| `GET` | `/repositories` | Get all repositories belonging to logged-in user | ✅ |
| `GET` | `/repositories/{id}` | Get repository details and sync status | ✅ |
| `DELETE` | `/repositories/{id}` | Delete repository and associated records | ✅ |

### 💬 Chats (`/chats`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/chats` | Create a new chat session bound to a `repository_id` | ✅ |
| `GET` | `/chats` | List all chats belonging to logged-in user | ✅ |
| `GET` | `/chats/{chat_id}` | Fetch chat session details | ✅ |
| `DELETE` | `/chats/{chat_id}` | Delete chat session and all messages | ✅ |

### ✉️ Messages (`/chats/{chat_id}/messages`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/chats/{chat_id}/messages` | Send question, execute LangGraph RAG, return AI response | ✅ |
| `GET` | `/chats/{chat_id}/messages` | Retrieve conversation history with timestamps | ✅ |

### 🩺 System & Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/health` | Check API service health | ❌ |
| `GET` | `/db-test` | Check MongoDB database connectivity | ❌ |
| `GET` | `/docs` | Interactive Swagger UI API documentation | ❌ |

---

## 🔑 Environment Variables (.env)

Create a `.env` file in `backend/` with the following configuration:

```env
# ==========================================
# MongoDB Configuration
# ==========================================
MONGODB_URL=mongodb://admin:password@mongo:27017/repochat?authSource=admin
DATABASE_NAME=repochat

# ==========================================
# Security & JWT Configuration
# ==========================================
JWT_SECRET_KEY=your-long-random-secret-key-32bytes-secure!
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ==========================================
# Redis Configuration
# ==========================================
REDIS_URL=redis://redis:6379

# ==========================================
# LLM & RAG Engine (Groq Cloud)
# ==========================================
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL_NAME=openai/gpt-oss-120b

# ==========================================
# Qdrant Vector Database
# ==========================================
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=repository_codebase
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) installed
- (Optional for local development) Python 3.11+, Node.js 20+, MongoDB, Redis

### Quickstart with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/singhabhishek22957/repochat-fastapi.git
   cd repochat-fastapi
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Add your GROQ_API_KEY and Qdrant credentials to backend/.env
   ```

3. **Build and launch all services:**
   ```bash
   docker compose up --build -d
   ```

4. **Verify running containers:**
   ```bash
   docker compose ps
   ```
   You should see 5 running containers:
   - `repochat-fastapi-frontend-1` on port `5173`
   - `repochat-fastapi-backend-1` on port `8000`
   - `repochat-fastapi-worker-1` (Background ingestion process)
   - `repochat-mongo` on port `27017`
   - `repochat-redis` on port `6379`

5. **Open in browser:**
   - **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   - **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Manual Local Development Setup

#### Backend & Worker
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Terminal 1: Start FastAPI Dev Server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Start Redis Background Worker
python -m app.worker
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Vite runs at http://localhost:5173
```

---

## 💻 Frontend User Interface

- **🏠 Landing Page (`/`)**: Displays feature tours, workflow breakdown, architectural advantages, and targeted guides for students and developers.
- **📊 Dashboard (`/dashboard`)**: Displays user details (`@username`, email, role), stats on repositories, total indexed chunks, and recent conversations.
- **🤖 Chat Assistant (`/chat` & `/chat/:chatId`)**:
  - ChatGPT-style collapsible sidebar with chat history.
  - Interactive repository selector with inline "+ Add New Repository" input.
  - Formatted Markdown responses with copyable code snippets.
  - Source accordion with exact file paths and vector relevance scores.
- **📁 Repositories Management (`/repositories`)**:
  - Add public GitHub repositories.
  - Status indicators (`indexed`, `pending`).
  - Auto-refresh polling until background indexing completes.
  - Direct "Start Chat" action for any repository.

---

## 🔒 Security & Authentication

1. **Argon2 Password Hashing**: Passwords are hashed with salt and memory-hard Argon2id parameters before storage.
2. **Dual-Mode JWT Bearer + Cookies**:
   - Web application automatically stores the token in an `HttpOnly`, `SameSite=Lax` cookie upon login.
   - API clients can provide the standard `Authorization: Bearer <token>` header.
3. **CORS Preflight Protection**:
   - `AuthMiddleware` automatically passes through `OPTIONS` requests, allowing browsers to complete preflight negotiation without credentials.
4. **Data Isolation**:
   - All repository, chat, and message queries enforce ownership validation by `user_id`.

---

## 📄 License & Contributions

This project is licensed under the **MIT License**. Contributions, bug reports, and feature requests are welcome!

```bash
# Submit an issue or create a pull request
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

---

<p align="center">
  <b>Built with ❤️ using FastAPI, LangGraph, Qdrant, and React 19.</b>
</p>
