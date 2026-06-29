from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User

async def create_user(db: AsyncSession, username: str, password: str, email: str, nickname: str):
    user = User(username=username, password=password, email=email, nickname=nickname, is_active=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()
from sqlalchemy import select
from ...app.models.user import User


async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str = None):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()