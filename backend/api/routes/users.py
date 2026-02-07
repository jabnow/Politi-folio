from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

@router.post("/")
def create_user(user: UserCreate):
    # Dummy implementation
    return {"username": user.username, "status": "created"}
