from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from datetime import datetime, timedelta, timezone
from jwt import InvalidTokenError
from app.core.config import settings


password_hasher = PasswordHasher()

def hash_password(password:str)->str:
    return password_hasher.hash(password)

def verify_password(password:str, hashed_password:str)->bool:
    try:
        password_hasher.verify(hashed_password, password)
        return True
    except VerifyMismatchError:
        return False

def create_access_token(user_id:str)->str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {"user_id":user_id, "exp":expire}

    access_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    return access_token

def decode_access_token(token:str)->dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except InvalidTokenError:
        return ValueError("Invalid or Expired Token")