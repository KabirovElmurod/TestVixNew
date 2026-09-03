from urllib import response

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from ...app.session import get_db
from ...app.schemas.user import UserCreate, AdminGetUsers, UserUpdate, UserDelete, SearchUser
from ...app.crud.user import (
    create_user, get_users, update_user_in_db, delete_user_from_db, create_user_in_db, get_user_by_username,
    search_users_in_db

) 
from ...app.core.security import get_current_user
from ...app.crud.func import verify_hash_url
router = APIRouter(prefix="/users", tags=["Users"])

# @router.post("/")
# async def add_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
#     return await create_user(db, user.name, user.email)



@router.post('/users')
async def users(data: AdminGetUsers, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    return await get_users(db, page=data.page)
@router.post('/search_users')
async def search_users(data: SearchUser, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    return await search_users_in_db(db, search=data.search, page=data.page)

@router.post("/create_user")
async def create_user_endpoint(data: UserCreate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    return await create_user_in_db(db, data.username, data.password, data.email, data.nickname, data.is_active, data.is_admin)

@router.post('/update_user')
async def update_user(data: UserUpdate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    print('\n\n\n', data, '\n\n\n')
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    if not verify_hash_url(data.id, data.username, data.hash_url):
        # if not verify_hash_url(data.id, get_user_by_username(db, data.username).username, data.hash_url):
        #     return {'message': 'Foydalanuvchini tekshirishda xatolik', 'status': False}
        return {'message': 'Foydalanuvchini tekshirishda xatolik', 'status': False}
    # Call your update function here with the provided data
    return await update_user_in_db(db, data)

@router.post('/delete_user')
async def delete_user(data: UserDelete, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.get('status') == False and user.get('role') != 'admin':
        return {'message':'Foydalanuvchini tekshirishda xatolik' , 'status': False}
    if not verify_hash_url(data.id, data.username, data.hash_url):
        return {'message': 'Foydalanuvchini tekshirishda xatolik', 'status': False}
    # Call your delete function here with the provided data
    await delete_user_from_db(db, data)
    return {"message": "User deleted successfully", "status": True}

from fastapi.responses import JSONResponse




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


