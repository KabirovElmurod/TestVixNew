from urllib import response

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from ...app.session import get_db
from ...app.schemas.user import UserCreate
from ...app.crud.user import contact_user
from ...app.core.security import get_current_user
from ...app.redis.redis import get_room_messages, flush_room_messages_to_db
router = APIRouter(prefix="/comments", tags=["Users"])



    

# @router.get("/")
# async def list_users(db: AsyncSession = Depends(get_db)):
#     return await get_users(db)



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# from fastapi_account.app.session import get_db
from ...app.schemas.contact import MessageResponse
from ...app.cure.auth import hash_password, verify_password, create_access_token


@router.post('/aloqa')
async def aloqa(
    data: MessageResponse,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # print('\n\n\n', current_user, '\n\n\n')
    await contact_user(db, data, current_user.get('id'))
    return {'message': 'Aloqa muvaffaqiyatli yuborildi', 'status': True}

@router.get("/room/{room_id}/messages")
async def get_room_messages_endpoint(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}

    # Avval Redisdan olish
    redis = await get_room_messages(room_id)
    if redis:
        return {"messages": redis, "status": True}

    # Agar Redisdan bo'lmasa, DBdan olish
    from ...app.models.user import RoomMessage
    from sqlalchemy import select

    result = await db.execute(
        select(RoomMessage)
        .where(RoomMessage.room_id == room_id)
        .order_by(RoomMessage.created.desc())
        .limit(50)
    )
    messages = result.scalars().all()

    return {"messages": messages, "status": True}

@router.post("/room/{room_id}/flush")
async def flush_messages_endpoint(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}

    await flush_room_messages_to_db(room_id, db)
    return {"message": "Xabarlarni DBga yozildi", "status": True}