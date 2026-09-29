from pydantic import BaseModel
from typing import Optional
import datetime



class MessageResponse(BaseModel):
    name:str = None
    telegram: str = None
    email: str = None
    message: str
    type: str
    subject: str = None

class RoomMessageCreate(BaseModel):
    room_id: int
    text: str

class RoomMessageRead(BaseModel):
    id: int
    room_id: int
    user_id: int
    text: str
    created: datetime.datetime

    class Config:
        from_attributes = True
