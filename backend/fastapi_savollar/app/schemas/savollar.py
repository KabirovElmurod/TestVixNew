import datetime
from tkinter import NO

from pydantic import BaseModel
from typing import Optional


class SavollarCreate(BaseModel):
    test_id: int | str
    key: str
    hash_url: str
    text: str
    options: list
    svg_json: str

class GetSavol(BaseModel):
    id:int
    last_id: int | str = None
    test_id: int | str
    hash_url: str


class GetSavollarRequest(BaseModel):
    test_id: int | str
    key: str
    hash_url: str

class FinishSavol(BaseModel):
    id: int
    test_id: int | str
    hash_url: str
    answers : list | dict

class SavollarUpdate(BaseModel):
    test_id: int | str | None = None
    key: str | None = None
    hash_url: str | None = None
    savol_id: int | str | None = None
    hash_id: str | None = None
    text: str | None = None
    new_variantlar: list|dict | None = None
    old_variantlar: list|dict | None = None
    svg_json: str | None = None
    is_edit: bool | None = None
    is_svg_json_edit: bool | None = None



class SavollarDelete(BaseModel):
    hash_id: str
    savol_id: str | int
    test_id: int | str
    key: str
    hash_url: str

class SavollarRead(BaseModel):
    id: int
    user_id: int
    nom: str
    fan: str
    tavsif: str
    savol_id: int
    savol_code: str
    savol_key: str
    ispublic: bool
    istime: bool
    time: Optional[int]
    created: datetime.datetime

    class Config:
        from_attributes = True
