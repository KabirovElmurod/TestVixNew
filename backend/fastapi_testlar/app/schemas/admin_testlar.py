from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Admin-specific schemas
class AdminTestFilter(BaseModel):
    search: Optional[str] = None
    fan: Optional[str] = None
    ispublic: Optional[bool] = None
    user_id: Optional[int] = None
    skip: int = 0
    limit: int = 100

class AdminTestResponse(BaseModel):
    id: int
    test_id: str
    nom: str
    fan: str
    tavsif: Optional[str]
    ispublic: bool
    user_id: int
    created: str
    username: Optional[str] = None

class AdminStatsResponse(BaseModel):
    total_tests: int
    public_tests: int
    total_users: int
    active_users: int

class AdminTestListResponse(BaseModel):
    tests: List[AdminTestResponse]
    total_count: int
    pages: int

class AdminTestCreate(BaseModel):
    nom: str
    fan: str
    tavsif: Optional[str] = ""
    ispublic: bool = True
    istime: bool = False
    time: Optional[int] = None

class AdminTestUpdate(BaseModel):
    nom: Optional[str] = None
    fan: Optional[str] = None
    tavsif: Optional[str] = None
    ispublic: Optional[bool] = None
    istime: Optional[bool] = None
    time: Optional[int] = None

# Hashtag schemas
class HashtagCreate(BaseModel):
    name: str

class HashtagUpdate(BaseModel):
    name: str

class HashtagResponse(BaseModel):
    id: int
    name: str

class TestHashtagRequest(BaseModel):
    hashtag_id: int
    tag: bool = True

class TestHashtagResponse(BaseModel):
    id: int
    test_id: int
    hashtag_id: int
    tag: bool
    hashtag_name: str