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
from ...app.models.user import User,Testlar, Savollar, Variantlar, Hashtag, TestlarHashtag, Natijalar


async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str = None):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

# async def get_users(db:AsyncSession, limit:int = 20, offset:int = 0):
#     offset = offset * limit
    
async def get_users(
    db: AsyncSession,
    page: int = 0,
    limit: int = 20
):
    offset = page * limit

    # Jami userlar soni
    total_result = await db.execute(
        select(func.count()).select_from(User)
    )
    total = total_result.scalar_one()

    # Joriy page userlari
    result = await db.execute(
        select(
            User,
            func.count(func.distinct(Testlar.id)).label("test_count"), 
            func.count(func.distinct(Natijalar.id)).label("result_count"),
        )
        .order_by(User.id.desc())
        .outerjoin(Testlar, Testlar.user_id == User.id)
        .outerjoin(Natijalar, Natijalar.user_id == User.id)
        .group_by(User.id)
        .limit(limit)
        .offset(offset)
    )

    users = result.all()
    result = []
    for user, test_count, result_count in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "hash_url": generate_hash_url(user.id, user.username),
            "test_count": test_count,
            "natija_count": result_count
        })
        # user.hash_url = generate_hash_url(user.id, user.username)
        # user.test_count = test_count

    # Jami page soni
    pages = ceil(total / limit)

    return {
        "users": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }

async def create_user_in_db(db: AsyncSession, username: str, password: str, email: str, nickname: str, is_active: bool = True, is_admin: bool = False):
    if await get_user_by_username(db, username):
        return {"message": "Username allaqachon mavjud", "status": False}
    if await get_user_by_email(db, email):
        return {"message": "Email allaqachon mavjud", "status": False}
    user = User(username=username, password=password, email=email, nickname=nickname, is_active=is_active, is_admin=is_admin)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"message": "User created successfully", "status": True}


async def search_users_in_db(db: AsyncSession, search: str, page: int = 0, limit: int = 20):
    offset = page * limit

    # Jami userlar soni
    total_result = await db.execute(
        select(func.count()).select_from(User).where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")) | (User.nickname.ilike(f"%{search}%"))
        )
    )
    total = total_result.scalar_one()

    # Joriy page userlari
    result = await db.execute(
        select(
            User,
            func.count(func.distinct(Testlar.id)).label("test_count"), 
            func.count(func.distinct(Natijalar.id)).label("result_count"),
        )
        .where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")) | (User.nickname.ilike(f"%{search}%"))
        )
        .order_by(User.id.desc())
        .outerjoin(Testlar, Testlar.user_id == User.id)
        .outerjoin(Natijalar, Natijalar.user_id == User.id)
        .group_by(User.id)
        .limit(limit)
        .offset(offset)
    )

    users = result.all()
    result = []
    for user, test_count, result_count in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "hash_url": generate_hash_url(user.id, user.username),
            "test_count": test_count,
            "natija_count": result_count
        })

    # Jami page soni
    pages = ceil(total / limit)

    return {
        "users": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


async def update_user_in_db(db: AsyncSession, user_data):
    values = {}
    if user_data.edit_username is not None:
        if await get_user_by_username(db, user_data.edit_username):
            return {"message": "Username allaqachon mavjud", "status": False}
        values['username'] = user_data.edit_username
    if user_data.email is not None:
        if await get_user_by_email(db, user_data.email):
            return {"message": "Email allaqachon mavjud", "status": False}
        values['email'] = user_data.email
    if user_data.nickname is not None:
        values['nickname'] = user_data.nickname
    if user_data.password is not None:
        values['password'] = hash_password(user_data.password)
    if user_data.is_active is not None:
        values['is_active'] = user_data.is_active
    if user_data.is_admin is not None:
        values['is_admin'] = user_data.is_admin
    
    await db.execute(
        update(User)
        .where(User.id == user_data.id)
        .values(**values)
    )
    await db.commit()
    return {"message": "User updated successfully", "status": True}

async def delete_user_from_db(db: AsyncSession, user_data):
    # user = await get_user_by_username(db, user_data.username)
    await db.execute(
        delete(Variantlar).where(
            Variantlar.savol_id.in_(
                select(Savollar.id).where(Savollar.test_id.in_(
                    select(Testlar.id).where(Testlar.user_id == user_data.id)
                ))
            )
        )
    )
    await db.execute(
        delete(Savollar).where(
            Savollar.test_id.in_(
                select(Testlar.id).where(Testlar.user_id == user_data.id)
            )
        )
    )
    await db.execute(
        delete(TestlarHashtag).where(
            TestlarHashtag.test_id.in_(
                select(Testlar.id).where(Testlar.user_id == user_data.id)
            )
        )
    )
    await db.execute(
        delete(Natijalar).where(Natijalar.user_id == user_data.id)
    )
    await db.execute(
        delete(Natijalar).where(
            Natijalar.test_id.in_(
                select(Testlar.id).where(Testlar.user_id == user_data.id)
            )
        )
    )
    await db.execute(
        delete(Testlar).where(Testlar.user_id == user_data.id)
    )
    await db.execute(
        delete(User)
        .where(User.id == user_data.id)
    )
    await db.commit()
    return True

    