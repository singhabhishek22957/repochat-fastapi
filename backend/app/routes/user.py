from fastapi import APIRouter , status , Request
from app.schema.common import APIResponse
from app.schema.user import UserResponse
from app.core.success_res import success_res


router = APIRouter(
    prefix="/user",
    tags=["user"]
)






@router.get("/me", response_model=APIResponse[UserResponse] , status_code=status.HTTP_200_OK)
async def get_current_user(req:Request):
    user = req.state.user
    return success_res(user, "User Fetched Successfully")