from pydantic import BaseModel, EmailStr, Field 
from enum import Enum


class Role(str, Enum):
    user = "user"
    admin = "admin"

class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=3, max_length=100)
    role: Role = Role.user

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    username: str
    role: Role
    is_active: bool
    is_email_verified: bool