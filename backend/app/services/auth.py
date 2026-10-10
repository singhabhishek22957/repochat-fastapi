from app.core.db import user_collection
from app.core import exceptions
from pymongo.errors import DuplicateKeyError
from app.schema.auth import UserLogin
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password
)

from app.schema.auth import TokenResponse

async def username_exists(username:str)->bool:
    user = await user_collection.find_one({"username":username})
    return True if user else False


async def register_user_service(user:dict):
    try:
        user["password"] = hash_password(user["password"])
        user = await user_collection.insert_one(user)
        return user.inserted_id
    except DuplicateKeyError as e:
        if "username" in str(e):
            raise exceptions.UserUsernameAlreadyExistsError()
        elif "email" in str(e):
            raise exceptions.UserEmailAlreadyExistsError()
        else:
            raise exceptions.AppException("User already exists", "USER_ALREADY_EXISTS", 409)


async def login_user_service(data:UserLogin):

    identifier = data.identifier
    password = data.password

    user = await user_collection.find_one({"$or":[{"email":identifier},{"username":identifier}]})

    if not user:
        raise exceptions.InvalidCredentialsError()

    if not user["is_active"]:
        raise exceptions.UserInactiveError()
    is_password_valid = verify_password(password, user["password"])
    if not is_password_valid:
        raise exceptions.InvalidCredentialsError()

    access_token = create_access_token(str(user["_id"]))

    return TokenResponse(access_token=access_token)


    

