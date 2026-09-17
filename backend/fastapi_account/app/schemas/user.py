from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    nickname: str
    username: str
    password: str
    is_active: bool = True
    is_admin: bool = False
    email: str


class UserRead(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class AdminGetUsers(BaseModel):
    page:int

class UserUpdate(BaseModel):
    username: str
    edit_username: str = None
    email: str = None
    nickname: str = None
    password: str = None
    hash_url: str
    id: int
    created_at: str = None
    is_active: bool = None
    is_admin: bool = None

class UserDelete(BaseModel):
    username: str
    hash_url: str
    id: int

class SearchUser(BaseModel):
    search: str
    page: int

# Profile schemas
class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ProfileStats(BaseModel):
    test_count: int
    result_count: int
    avg_score: float
    streak: int

class UserResult(BaseModel):
    id: int
    test_id: int
    sum_son: int
    true_son: int
    false_son: int
    isfinish: bool
    created: datetime
    score: Optional[float] = None

class UserResultsResponse(BaseModel):
    results: list[UserResult]
    total: int

class AvatarUrlUpdate(BaseModel):
    avatar_url: str