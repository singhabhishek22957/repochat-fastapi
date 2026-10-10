from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import client , create_indexes
from fastapi.openapi.utils import get_openapi
from app.middlewares.auth import AuthMiddleware
from app.core.exceptions import AppException
from app.handler.exceptions import app_exception_handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await create_indexes()
    yield
    await client.close()

app = FastAPI(
    title = "RepoChat",
    version = "1.0.0",
    description = "RAG based application, Talk to your repository",
    lifespan=lifespan
)

# custom openapi 

def custom_api():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema.setdefault("components", {})
    openapi_schema["components"].setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth":{
            "type":"http",
            "scheme":"bearer",
            "bearerFormat":"JWT"
        }
    }

    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_api



# add middlewares: CORSMiddleware added last so it wraps the app as outermost layer
app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# handle exceptions
app.add_exception_handler(AppException, app_exception_handler)



# auth routes 
from app.routes.auth import router as auth_router
app.include_router(auth_router)

# user routes 
from app.routes.user import router as user_router
app.include_router(user_router)

# chat routes 
from app.routes.chat import router as chat_router
app.include_router(chat_router)

# message routes 
from app.routes.message import router as message_router
app.include_router(message_router)

# repository routes 
from app.routes.repository import router as repository_router
app.include_router(repository_router)

# repository file routes 
from app.routes.repository_file import router as repository_file_router
app.include_router(repository_file_router)

# test redis route 
from app.routes.redis_test import router as redis_router
app.include_router(redis_router)




# default route for health , db connection and api running check
@app.get("/db-test")
async def db_test():
    return await client.admin.command("ping")

@app.get("/health")
def health():
    return {
        "success":True,
        "message":"Repo Chat API is running and health is good "
    }

@app.get("/")
def home():
    return {
        "success":True,
        "msg":"App is Running Perfectly"
    }