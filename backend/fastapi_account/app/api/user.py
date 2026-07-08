from urllib import response

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ...app.session import get_db
from ...app.schemas.user import UserCreate
from ...app.crud.user import create_user, get_users

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/")
async def add_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user.name, user.email)

@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    return await get_users(db)



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...app.session import get_db
from ...app.schemas.auth import LoginSchema, MessageResponse, TokenResponse, RegisterSchema
from ..crud.user import get_user_by_email, get_user_by_username
from ...app.cure.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


from fastapi.responses import JSONResponse

@router.post("/login")
async def login(
    data: LoginSchema,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_username(db, data.username)

    if not user or not verify_password(data.password, user.password):
        return JSONResponse(
            content={"message": "Noto'g'ri username yoki password", "status": False}
        )

    token = create_access_token({"sub": user.username, "id": user.id})

    response = JSONResponse(
        content={
            "message": "Muvaffaqiyatli kirdingiz",
            "status": True
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
    
    token = create_access_token({"sub": new_user.username, "id": new_user.id})

    response = JSONResponse(
        content={
            "message": "Muvaffaqiyatli ro'yxatdan o'tdingiz",
            "status": True
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


from ...app.core.security import get_current_user

@router.get("/me")
async def me(user=Depends(get_current_user)):
    print('\n\n\n', user, '\n\n\n')
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


