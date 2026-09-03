from pydantic import BaseModel

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