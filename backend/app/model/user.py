from datetime import datetime , timezone 
from typing import Any

def user_document(*,
                  name:str,
                  username:str, 
                  email:str, 
                  password:str,
                  role:str,)-> dict[str, Any]:
    now = datetime.now(timezone.utc)

    return {
        "name":name,
        "email":email,
        "username":username,
        "password":password,
        "role":role,
        "created_at":now,
        "updated_at":now,
        "is_active":True,
        "is_email_verified":False
    }