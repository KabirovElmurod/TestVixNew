from math import ceil

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from ...app.crud.func import generate_hash_url, verify_hash_url
# from ..models.user import User
from ...app.cure.auth import hash_password
async def create_user(db: AsyncSession, username: str, password: str, email: str, nickname: str):
    user = User(username=username, password=password, email=email, nickname=nickname, is_active=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

from sqlalchemy import select
from ...app.models.user import Comment, Aloqa


async def contact_user(db: AsyncSession, data, user_id:int = None):
    contact = Aloqa(
        user_id=user_id,
        telegram=data.telegram,
        email=data.email,
        message=data.message,
        type=data.type,
        subject=data.subject,
        name = data.name
    )
    db.add(contact)
    await db.commit()
    return True