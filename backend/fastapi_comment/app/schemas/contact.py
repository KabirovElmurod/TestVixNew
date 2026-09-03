from pydantic import BaseModel



class MessageResponse(BaseModel):
    name:str = None
    telegram: str = None
    email: str = None
    message: str
    type: str
    subject: str = None
