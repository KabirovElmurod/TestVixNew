from math import ceil
import json
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from ...app.crud.func import generate_hash_url, verify_hash_url
# from ..models.user import User
from ...app.cure.auth import hash_password, verify_password
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


# Profile related functions
async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_profile(db: AsyncSession, user_id: int, profile_data: dict):
    user = await get_user_by_id(db, user_id)
    if not user:
        return {"message": "User topilmadi", "status": False}
    
    values = {}
    if 'username' in profile_data and profile_data['username']:
        existing_user = await get_user_by_username(db, profile_data['username'])
        if existing_user and existing_user.id != user_id:
            return {"message": "Username allaqachon mavjud", "status": False}
        values['username'] = profile_data['username']
    
    if 'email' in profile_data and profile_data['email']:
        existing_email = await get_user_by_email(db, profile_data['email'])
        if existing_email and existing_email.id != user_id:
            return {"message": "Email allaqachon mavjud", "status": False}
        values['email'] = profile_data['email']
    
    if 'nickname' in profile_data:
        values['nickname'] = profile_data['nickname']
    
    if 'bio' in profile_data:
        values['bio'] = profile_data['bio']
    
    if 'avatar' in profile_data:
        values['avatar'] = profile_data['avatar']
    
    if values:
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(**values)
        )
        await db.commit()
        await db.refresh(user)
    
    return {"message": "Profile muvaffaqiyatli yangilandi", "status": True, "user": user}


async def change_password(db: AsyncSession, user_id: int, current_password: str, new_password: str):
    user = await get_user_by_id(db, user_id)
    if not user:
        return {"message": "User topilmadi", "status": False}
    
    if not verify_password(current_password, user.password):
        return {"message": "Hozirgi parol noto'g'ri", "status": False}
    
    if len(new_password) < 6:
        return {"message": "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", "status": False}
    
    hashed_password = hash_password(new_password)
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(password=hashed_password)
    )
    await db.commit()
    
    return {"message": "Parol muvaffaqiyatli o'zgartirildi", "status": True}


async def get_user_stats(db: AsyncSession, user_id: int, redis_client=None):
    # Redis caching
    cache_key = f"user_stats:{user_id}"
    if redis_client:
        try:
            cached_stats = await redis_client.get(cache_key)
            if cached_stats:
                return json.loads(cached_stats)
        except Exception as e:
            print(f"Redis error: {e}")
    
    # Database query
    test_count_result = await db.execute(
        select(func.count(Testlar.id)).where(Testlar.user_id == user_id)
    )
    test_count = test_count_result.scalar() or 0
    
    result_count_result = await db.execute(
        select(func.count(Natijalar.id)).where(Natijalar.user_id == user_id)
    )
    result_count = result_count_result.scalar() or 0
    
    # Calculate average score
    avg_score = 0
    if result_count > 0:
        results = await db.execute(
            select(Natijalar).where(Natijalar.user_id == user_id, Natijalar.isfinish == True)
        )
        results_list = results.scalars().all()
        
        if results_list:
            total_score = 0
            for result in results_list:
                if result.sum_son > 0:
                    score = (result.true_son / result.sum_son) * 100
                    total_score += score
            avg_score = round(total_score / len(results_list), 1) if results_list else 0
    
    # Calculate streak (consecutive days with activity)
    streak = 0
    if result_count > 0:
        results = await db.execute(
            select(Natijalar.created)
            .where(Natijalar.user_id == user_id)
            .order_by(Natijalar.created.desc())
            .limit(30)
        )
        result_dates = [row[0].date() for row in results.all()]
        
        if result_dates:
            today = datetime.now().date()
            streak = 0
            current_date = today
            
            for date in result_dates:
                if date == current_date:
                    streak += 1
                    current_date -= timedelta(days=1)
                elif date == current_date - timedelta(days=1):
                    current_date -= timedelta(days=1)
                else:
                    break
    
    stats = {
        "test_count": test_count,
        "result_count": result_count,
        "avg_score": avg_score,
        "streak": streak
    }
    
    # Cache in Redis for 5 minutes
    if redis_client:
        try:
            await redis_client.setex(cache_key, 300, json.dumps(stats))
        except Exception as e:
            print(f"Redis caching error: {e}")
    
    return stats


async def get_user_results(db: AsyncSession, user_id: int, page: int = 0, limit: int = 20, redis_client=None):
    # Redis caching
    cache_key = f"user_results:{user_id}:{page}:{limit}"
    if redis_client:
        try:
            cached_results = await redis_client.get(cache_key)
            if cached_results:
                return json.loads(cached_results)
        except Exception as e:
            print(f"Redis error: {e}")
    
    offset = page * limit
    
    # Get total count
    total_result = await db.execute(
        select(func.count()).select_from(Natijalar).where(Natijalar.user_id == user_id)
    )
    total = total_result.scalar() or 0
    
    # Get results with pagination
    results = await db.execute(
        select(Natijalar)
        .where(Natijalar.user_id == user_id)
        .order_by(Natijalar.created.desc())
        .limit(limit)
        .offset(offset)
    )
    results_list = results.scalars().all()
    
    # Format results
    formatted_results = []
    for result in results_list:
        score = 0
        if result.sum_son > 0:
            score = round((result.true_son / result.sum_son) * 100, 1)
        
        formatted_results.append({
            "id": result.id,
            "test_id": result.test_id,
            "sum_son": result.sum_son,
            "true_son": result.true_son,
            "false_son": result.false_son,
            "isfinish": result.isfinish,
            "created": result.created.isoformat() if result.created else None,
            "score": score
        })
    
    response = {
        "results": formatted_results,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": ceil(total / limit) if total > 0 else 0
    }
    
    # Cache in Redis for 2 minutes
    if redis_client:
        try:
            await redis_client.setex(cache_key, 120, json.dumps(response, default=str))
        except Exception as e:
            print(f"Redis caching error: {e}")
    
    return response


async def delete_account(db: AsyncSession, user_id: int, confirmation: str, reason: str = None):
    if confirmation != "DELETE":
        return {"message": "Tasdiqlash noto'g'ri", "status": False}
    
    # Delete all user data
    await db.execute(
        delete(Variantlar).where(
            Variantlar.savol_id.in_(
                select(Savollar.id).where(Savollar.test_id.in_(
                    select(Testlar.id).where(Testlar.user_id == user_id)
                ))
            )
        )
    )
    await db.execute(
        delete(Savollar).where(
            Savollar.test_id.in_(
                select(Testlar.id).where(Testlar.user_id == user_id)
            )
        )
    )
    await db.execute(
        delete(TestlarHashtag).where(
            TestlarHashtag.test_id.in_(
                select(Testlar.id).where(Testlar.user_id == user_id)
            )
        )
    )
    await db.execute(
        delete(Natijalar).where(Natijalar.user_id == user_id)
    )
    await db.execute(
        delete(Testlar).where(Testlar.user_id == user_id)
    )
    await db.execute(
        delete(User)
        .where(User.id == user_id)
    )
    await db.commit()
    
    return {"message": "Hisob muvaffaqiyatli o'chirildi", "status": True}


async def update_avatar(db: AsyncSession, user_id: int, avatar_url: str, redis_client=None):
    """Update user avatar URL with Redis cache invalidation"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return {"message": "User topilmadi", "status": False}
    
    # Update avatar URL in database
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(avatar=avatar_url)
    )
    await db.commit()
    await db.refresh(user)
    
    # Invalidate Redis cache for user profile
    if redis_client:
        try:
            cache_keys = [
                f"user_stats:{user_id}",
                f"user_results:{user_id}:*",
                f"user_profile:{user_id}"
            ]
            for key_pattern in cache_keys:
                if '*' in key_pattern:
                    keys = await redis_client.keys(key_pattern)
                    if keys:
                        await redis_client.delete(*keys)
                else:
                    await redis_client.delete(key_pattern)
        except Exception as e:
            print(f"Redis cache invalidation error: {e}")
    
    return {"message": "Avatar muvaffaqiyatli yangilandi", "status": True, "avatar": avatar_url}