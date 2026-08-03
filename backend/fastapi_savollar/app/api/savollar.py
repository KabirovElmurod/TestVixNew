from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ...app.session import get_db
from ...app.schemas.savollar import SavollarCreate, SavollarDelete, SavollarUpdate, SavollarRead, GetSavollarRequest, GetSavol, FinishSavol
from ...app.crud.savollar import (
    create_savollar,
    get_savollar_by_id,
    get_savol_by_test_id,
    get_savollar_by_savol_code,
    get_savollar_by_savol_key,
    get_all_savollar,
    get_savollar_by_user_id,
    get_public_savollar,
    update_savol,
    delete_savollar,
    finish_check_savol
)
from ...app.core.security import get_current_user
from ...app.wrong import wrong
from ...app.crud.func import verify_hash_savol, verify_hash_url
# from backend.fastapi_testlar.app.crud.func import verify_one_hash

router = APIRouter(prefix="/savollar", tags=["Savollar"])

@router.get('/a')
def test():
    return {"message": "Test endpoint ishlayapti"}

@router.post("/create_savol")
async def create_savollar_endpoint(
    savollar: SavollarCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    if not verify_hash_url(savollar.test_id, savollar.key, savollar.hash_url):
        return {"message": "Bunday test mavjud emas yoki noto'g'ri URL", "status": False}

    return await create_savollar(db, savollar)


@router.post("/get_savollar_by_id")
async def get_savollar(
    data: GetSavollarRequest,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    if not verify_hash_url(data.test_id, data.key, data.hash_url):
        return {"message": "Bunday test mavjud emas yoki noto'g'ri URL", "status": False}
    return await get_all_savollar(db, data, skip, limit)

@router.post('/get_savol')
async def get_savol(
    data: GetSavol,
    db:AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
): 
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    if not verify_hash_url(data.id,data.test_id, data.hash_url):
        return {'message': 'Bunday test mavjud emas', 'status': False}

    return await get_savol_by_test_id(db, data.id)
    

@router.post("/update_savol")
async def update_savol_endpoint(
    data: SavollarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):

    print('\n\n\n', data, '\n\n\n')

    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}
    
    if not verify_hash_url(data.test_id, data.key, data.hash_url):
        return {"message": "Bunday test mavjud emas yoki noto'g'ri URL", "status": False}
    if not verify_hash_url(data.savol_id, data.hash_url, data.hash_id):
        return {"message": "Bunday savol mavjud emas yoki noto'g'ri URL", "status": False}
    
    for item in data.new_variantlar:
        if (item.get('hash_id') is None):
            continue
        if not verify_hash_url(item['id'], data.hash_url, item['hash_id']):
            return {"message": "Bunday variant mavjud emas yoki noto'g'ri URL", "status": False}
    for item in data.old_variantlar:
        if not verify_hash_url(item['id'], data.hash_url, item['hash_id']):
            return {"message": "Bunday variant mavjud emas yoki noto'g'ri URL", "status": False}
    # if not verify_hash_url()
    
    if not await update_savol(db, data):
        return wrong("Savolni yangilashda xatolik yuz berdi", status=False)
    return {"message": "Savol muvaffaqiyatli yangilandi", "status": True}


@router.post("/delete_savol")
async def delete_savollar_endpoint(
    data: SavollarDelete,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user':False}
        
    if not verify_hash_url(int(data.test_id), data.key, data.hash_url):
        return {"message": "Bunday test mavjud emas yoki noto'g'ri URLss", "status": False}
    if not verify_hash_savol(int(data.savol_id), data.hash_url, data.hash_id):
        return {"message": "Bunday savol mavjud emas yoki noto'g'ri URL", "status": False}
    if await delete_savollar(db, data.test_id, data.savol_id):
        return {"message": "Savol muvaffaqiyatli o'chirildi", "status": True}
    else:
        return {"message": "Savolni o'chirishda xatolik yuz berdi", "status": False}

@router.post("/finish_savol")
async def finish_savol(
    data: FinishSavol,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.get('status') == False:
        return {'message': 'Foydalanuvchi tekshirishda xatolik yuz berdi', 'status': False, 'user': False}
    print('\n\n\n', data, '\n\n\n')
    print('\n\n\n', data.answers, '\n\n\n')
    if not verify_hash_url(data.id, data.test_id, data.hash_url):
        return {'message': 'Tekshirishda xatolik yuz berdi', 'status': False}
    for item in data.answers:
        if not verify_hash_url(int(item), data.id, data.answers[item]['savol_hash']):
            return {'message': 'Tekshirishda xatolik yuz berdi', 'status': False}
        if not verify_hash_url(data.answers[item]['v_id'], data.answers[item]['savol_hash'], data.answers[item]['v_hash']):
            return {'message': 'Tekshirishda xatolik yuz berdi', 'status': False}
    # for item in data.answers:

    return await finish_check_savol(db, data, current_user.get('id'))
