from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ...app.crud.func import verify_hash_url, verify_one_hash

from ...app.session import get_db
from ...app.schemas.testlar import TestlarCreate, TestlarDelete, TestlarUpdate, TestlarRead, GetPublicTestlarRequest, SearchTestRequest, TestRoomCreate, TestRoomRead, TestRoomJoin
from ...app.crud.testlar import (
    create_testlar,
    create_test_with_json,
    get_testlar_by_id,
    get_test_by_test_id,
    get_testlar_by_test_code,
    get_testlar_by_test_key,
    get_all_testlar,
    get_testlar_by_user_id,
    get_public_testlar,
    update_test,
    delete_testlar,
    search_testlar,
    create_testroom,
    get_testrooms_by_user,
    get_testroom_by_id,
    join_testroom
)
from ...app.core.security import get_current_user
from ...app.wrong import wrong

router = APIRouter(prefix="/testlar", tags=["Testlar"])

@router.get('/a')
def test():
    return {"message": "Test endpoint ishlayapti"}

@router.post("/")
async def create_testlar_endpoint(
    testlar: TestlarCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    return await create_testlar(db, testlar, current_user.get('id'))


@router.get("/", response_model=List[TestlarRead])
async def get_all_testlar_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    return await get_all_testlar(db, skip, limit)


@router.post("/testlar")
async def get_public_testlar_endpoint(
    data: GetPublicTestlarRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    limit = 6
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    return await get_public_testlar(db, data, limit)

@router.post('/create_test_with_json')
async def create_test_with_json_endpoint(
    testlar: TestlarCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    return await create_test_with_json(db, testlar, current_user.get('id'))

@router.get("/get_test_by_user_id")
async def get_user_testlar_endpoint(
    # user_id: int,
    # skip: int = 0,
    # limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {'message': 'Foydalanuvchi tekshirishda xatolik yuz berdi', 'status': False, 'user': False}
    
    return await get_testlar_by_user_id(db, current_user.get('id'))


# @router.get("/{testlar_id}", response_model=TestlarRead)
# async def get_testlar_endpoint(
#     testlar_id: int,
#     db: AsyncSession = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     if current_user.get('status') == False:
#         return {'message': 'Foydalanuvchi tekshirishda xatolik yuz berdi', 'status': False, 'user': False}
    
#     testlar = await get_testlar_by_id(db, testlar_id)
#     if not testlar:
#         return wrong("Test topilmadi", status=False)
    
#     return testlar


@router.post("/update_test/{testlar_id}")
async def update_test_endpoint(
    testlar_id: int | str,
    test: TestlarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}
    
    # existing_test = await get_test_by_id(db, test.id)
    # if not existing_test:
    #     return wrong("Test topilmadi", status=False)
    if not await update_test(db, test):
        return wrong("Testni yangilashda xatolik yuz berdi", status=False)
    return {"message": "Test muvaffaqiyatli yangilandi", "status": True}


@router.post("/delete_test/{id}")
async def delete_testlar_endpoint(
    id: str | int,
    data: TestlarDelete,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}
    
    if not verify_hash_url(data.id, data.key, data.hash_url):
        return {"message": "Test o'chirishda xatolik yuz berdi", "status": False}


    deleted = await delete_testlar(db, data.key, data.id, current_user.get('id'))
    if deleted == False:
        return {"message": "Bunday test topilmadi yoki sizga tegishli emas", "status": False}
    return {"message": "Test muvaffaqiyatli o'chirildi", "status": True}

@router.post('/get_show_test')
async def  get_show_test(
    id:int,
    test_id : int|str,
    hash_url : str,
    
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}
    
    if not verify_hash_url(id, test_id, hash_url):
        return {"message": "Bunday test mavjud emas", "status": False}

    return await get_test_by_test_id(db, test_id)

@router.post('/search_test')
async def search_test(
    data: SearchTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print('\n\n\n', data, '\n\n\n')
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}

    return await search_testlar(db, data)

@router.post("/testroom")
async def create_testroom_endpoint(
    testroom: TestRoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}

    room = await create_testroom(db, testroom, current_user.get('id'))
    if room:
        return {"message": "Testroom muvaffaqiyatli yaratildi", "status": True, "room_id": room.id}
    return {"message": "Testroom yaratishda xatolik yuz berdi", "status": False}

@router.get("/testroom")
async def get_testrooms_endpoint(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}

    rooms = await get_testrooms_by_user(db, current_user.get('id'), skip, limit)
    return {"rooms": rooms, "status": True}

@router.post("/testroom/join")
async def join_testroom_endpoint(
    data: TestRoomJoin,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}

    room = await join_testroom(db, data, current_user.get('id'))
    if room:
        return {"message": "Testroomga muvaffaqiyatli qo'shildi", "status": True, "room": room}
    return {"message": "Testroom topilmadi yoki parol noto'g'ri", "status": False}