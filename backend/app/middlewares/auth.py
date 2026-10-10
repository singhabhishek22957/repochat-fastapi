from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from bson import ObjectId

from app.core.db import user_collection
from app.core.security import decode_access_token


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow CORS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Public endpoints that do not require authentication
        public_paths = {
            "/auth/login",
            "/auth/register",
            "/auth/logout",
            "/health",
            "/db-test",
            "/docs",
            "/openapi.json",
            "/",
        }

        if request.url.path in public_paths:
            return await call_next(request)

        # Private endpoints: Extract token from header or cookie
        authorization = request.headers.get("Authorization")
        access_token = request.cookies.get("access_token")
        token = None

        if authorization and " " in authorization:
            scheme, auth_token = authorization.split(" ", 1)
            if scheme.lower() == "bearer" and auth_token.strip():
                token = auth_token.strip()

        # Fallback to HTTP-only cookie if Authorization header is absent
        if not token and access_token:
            token = access_token.strip()

        if not token:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "message": "Authentication Required",
                    "error": {
                        "code": "AUTHENTICATION_REQUIRED",
                        "message": "Authentication Required",
                    },
                },
            )

        try:
            payload = decode_access_token(token)
            user_id = payload.get("user_id")

            if not user_id or not ObjectId.is_valid(user_id):
                return JSONResponse(
                    status_code=401,
                    content={
                        "success": False,
                        "message": "Authentication Required",
                        "error": {
                            "code": "AUTHENTICATION_REQUIRED",
                            "message": "Invalid token payload",
                        },
                    },
                )

            user = await user_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return JSONResponse(
                    status_code=401,
                    content={
                        "success": False,
                        "message": "Authentication Required",
                        "error": {
                            "code": "AUTHENTICATION_REQUIRED",
                            "message": "User not found",
                        },
                    },
                )

            request.state.user = {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "username": user["username"],
                "role": user["role"],
                "is_active": user["is_active"],
                "is_email_verified": user["is_email_verified"],
            }

        except Exception:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "message": "Authentication Required",
                    "error": {
                        "code": "AUTHENTICATION_REQUIRED",
                        "message": "Invalid or expired token",
                    },
                },
            )

        return await call_next(request)