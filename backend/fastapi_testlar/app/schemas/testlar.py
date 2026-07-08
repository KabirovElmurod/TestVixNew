import datetime

from pydantic import BaseModel
from typing import Optional


class TestlarCreate(BaseModel):
    nom: str
    fan: str
    tavsif: str
    ispublic: bool = False
    istime: bool = False
    time: Optional[int] = None
    # user_id: int
    # test_id: str
    # test_code: str
    # test_key: str


class TestlarUpdate(BaseModel):
    nom: Optional[str] = None
    fan: Optional[str] = None
    tavsif: Optional[str] = None
    ispublic: Optional[bool] = None
    istime: Optional[bool] = None
    time: Optional[int] = None
    key: Optional[str] = None
    id: Optional[str | int] = None

class TestlarDelete(BaseModel):
    key: Optional[str]
    id: Optional[str | int] 
    hash_url: Optional[str | int] 

class TestlarRead(BaseModel):
    id: int
    user_id: int
    nom: str
    fan: str
    tavsif: str
    test_id: int
    test_code: str
    test_key: str
    ispublic: bool
    istime: bool
    time: Optional[int]
    created: datetime.datetime

    class Config:
        from_attributes = True
