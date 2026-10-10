from pydantic import BaseModel, Field 


class UserLogin(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=3, max_length=100)


class TokenResponse(BaseModel):
    access_token: str