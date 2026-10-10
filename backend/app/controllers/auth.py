from app.schema.auth import UserLogin
from app.schema.user import UserCreate

from app.services.auth import register_user_service , login_user_service
from app.model.user import user_document 


async def register_user_controller(data:UserCreate):
    user_data = user_document(
        name=data.name,
        username=data.username,
        email=data.email, 
        password=data.password,
        role=data.role
    )
    return await register_user_service(user_data)

async def login_user_controller(data:UserLogin):
    return await login_user_service(data)