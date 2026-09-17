from urllib import response

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, File

from ...app.session import get_db, get_redis
from ...app.schemas.user import UserCreate, ProfileUpdate, PasswordChange, AvatarUrlUpdate
from ...app.crud.user import create_user, get_users, update_profile, change_password, get_user_stats, get_user_results, delete_account, update_avatar
from ...app.core.security import get_current_user
# router = APIRouter(prefix="/users", tags=["Users"])
import uuid 
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
# from ...main import MEDIA_DIR
from ...app.cure.config import MEDIA_DIR

from pathlib import Path
# from fastapi_account.app.session import get_db
from ...app.schemas.auth import LoginSchema, MessageResponse, TokenResponse, RegisterSchema
from ..crud.user import get_user_by_email, get_user_by_username
from ...app.cure.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


from fastapi.responses import JSONResponse

@router.post("/")
async def add_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user.name, user.email)



@router.get('/users')
async def users(user=Depends(get_current_user)):
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    return await get_users()


# Profile endpoints
@router.get("/profile/me")
async def get_profile(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile"""
    if user.get('status') == False:
        return user
    
    from ...app.crud.user import get_user_by_id
    user_data = await get_user_by_id(db, user.get('id'))
    
    if not user_data:
        return {"message": "User topilmadi", "status": False}
    
    return {
        "status": True,
        "user": {
            "id": user_data.id,
            "username": user_data.username,
            "email": user_data.email,
            "nickname": user_data.nickname,
            'bio':'yo\'q',
            # "bio": getattr(user_data, 'bio', None),
            "created_at": user_data.created_at.isoformat() if user_data.created_at else None,
            "is_active": user_data.is_active,
            "is_admin": user_data.is_admin,
            "avatar": getattr(user_data, 'avatar', None)
        }
    }


@router.put("/profile/me")
async def update_user_profile(
    profile_data: ProfileUpdate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis)
):
    """Update current user profile"""
    if user.get('status') == False:
        return user
    
    result = await update_profile(db, user.get('id'), profile_data.dict(exclude_unset=True))
    
    # Invalidate cache if profile updated successfully
    if result.get('status') and redis_client:
        try:
            cache_keys = [
                f"user_stats:{user.get('id')}",
                f"user_results:{user.get('id')}:*",
                f"user_profile:{user.get('id')}"
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
    
    return result


@router.post("/profile/change-password")
async def change_user_password(
    password_data: PasswordChange,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    if user.get('status') == False:
        return user
    
    result = await change_password(
        db, 
        user.get('id'), 
        password_data.current_password, 
        password_data.new_password
    )
    return result


@router.get("/profile/stats")
async def get_user_statistics(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis)
):
    """Get user statistics with Redis caching"""
    if user.get('status') == False:
        return user
    
    stats = await get_user_stats(db, user.get('id'), redis_client)
    return {
        "status": True,
        "stats": stats
    }


@router.get("/profile/results")
async def get_user_test_results(
    page: int = 0,
    limit: int = 20,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis)
):
    """Get user test results with pagination and Redis caching"""
    if user.get('status') == False:
        return user
    
    results = await get_user_results(db, user.get('id'), page, limit, redis_client)
    return {
        "status": True,
        **results
    }


@router.delete("/profile/delete")
async def delete_user_account(
    confirmation: str,
    reason: str = None,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user account"""
    if user.get('status') == False:
        return user
    
    result = await delete_account(db, user.get('id'), confirmation, reason)
    return result


@router.post("/profile/avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis),
):
    """Upload/update user avatar as file"""
    MAX_SIZE = 5 * 1024 * 1024  # 5 MB
    print('\n\n\n file name=>', file.filename, '\n\n\n' )
    file_type = file.filename.split('.')[1]
    if(file_type == 'txt'):
        result = await update_avatar(
                    db,
                    user.get("id"),
                    None,
                    redis_client,
                )
    # print('\n\n\n file=>', file.headers, '\n\n\n' )
    # Read file content once for validation
    content = await file.read()
    
    if len(content) > MAX_SIZE:
        return {
            "status": False,
            "message": "Rasm hajmi 5 MB dan oshmasligi kerak",
        }
    if user.get("status") is False:
        return user

    try:
        # Reset file pointer to beginning
        await file.seek(0)
        
        # Read content again for saving
        file_content = await file.read()
        
        # media/avatars
        avatar_dir = MEDIA_DIR / "avatars"
        avatar_dir.mkdir(parents=True, exist_ok=True)

        # filename
        file_extension = (
            Path(file.filename).suffix.lower()
            if file.filename
            else ".jpg"
        )

        unique_filename = (
            f"{user.get('id')}_{uuid.uuid4().hex[:8]}{file_extension}"
        )

        file_path = avatar_dir / unique_filename

        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        # URL
        avatar_url = f"/media/avatars/{unique_filename}"

        result = await update_avatar(
            db,
            user.get("id"),
            avatar_url,
            redis_client,
        )

        if result.get("status"):
            result["avatar_url"] = avatar_url

        return result

    except Exception as e:
        return {
            "message": f"Rasmni yuklashda xatolik: {str(e)}",
            "status": False,
        }

# @router.get("/")
# async def list_users(db: AsyncSession = Depends(get_db)):
#     return await get_users(db)



@router.post("/login")
async def login(
    data: LoginSchema,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_username(db, data.username)
    if not user:
        return JSONResponse(
            content={"message": "Noto'g'ri username yoki password", "status": False}
        )
    if not verify_password(data.password, user.password):
        return JSONResponse(
            content={"message": "Noto'g'ri username yoki password", "status": False}
        )

    token = create_access_token({"sub": user.username, "id": user.id, 'role': 'admin' if user.is_admin else 'user'})

    response = JSONResponse(
        content={
            "message": "Muvaffaqiyatli kirdingiz",
            "status": True,
            'user': {
                'id':user.id,
                'username':user.username,
                'nickname':user.nickname,
                'avatar': getattr(user, 'avatar', None),
                'role': 'admin' if user.is_admin else 'user'
            }
        }
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 30,
        samesite="lax",
        # domain="localhost",
        path="/",
        # secure=False
    )

    return response



@router.post('/register')
async def register(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    print('\n\n\n', data, '\n\n\n')
    email = await get_user_by_email(db, data.email)
    if email:
        return {"message": "Bu email allaqachon ro'yxatdan o'tgan", "status": False}
    username = await get_user_by_username(db, data.username)
    if username:
        return {"message": "Bu username allaqachon ro'yxatdan o'tgan", "status": False}

    # password ichida kamida 8 ta belgi, katta harf, kichik harf va raqam bo'lishi kerak
    if len(data.password) < 8:
        return {"message": "Parol kamida 8 ta belgi bo'lishi kerak", "status": False}
    if (    not any(c.lower() for c in data.password) and
            not any(c.isdigit() for c in data.password)):
        return {"message": "Harf va raqam bo'lishi kerak", "status": False} 
    new_user = await create_user(db, data.username, hash_password(data.password), data.email, data.nickname)
    
    token = create_access_token({"sub": new_user.username, "id": new_user.id, 'role': 'admin' if new_user.is_admin else 'user'})

    response = JSONResponse(
        content={
            "message": "Muvaffaqiyatli ro'yxatdan o'tdingiz",
            "status": True,
            'user': {
                    'username':data.username,
                    'nickname':data.nickname,
                    'role': 'admin' if new_user.is_admin else 'user'
                }
        }
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 30,
        samesite="lax",
        # domain="localhost",
        path="/",
        # secure=False
    )

    return response
    
    # return {"id": new_user.id, "username": new_user.username}




@router.get("/me")
async def me(user=Depends(get_current_user)):
    # print('\n\n\n', user, '\n\n\n')
    if user.get('status') == False:
        return user
    return {"user": user, 'status':True}

@router.get("/logout")
async def logout():
    response = JSONResponse(
        content={
            "message": "Muvaffaqiyatli chiqdingiz",
            "status": True
        }
    )
    response.delete_cookie(
        key="access_token",
        # httponly=True,
        # max_age=60 * 6
        path="/"
    )
    return response


