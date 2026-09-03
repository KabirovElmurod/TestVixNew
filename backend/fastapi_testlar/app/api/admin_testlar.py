from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..session import get_db
from ..schemas.admin_testlar import (
    AdminTestFilter, 
    AdminTestResponse, 
    AdminStatsResponse,
    AdminTestCreate,
    AdminTestUpdate,
    AdminTestListResponse,
    HashtagCreate,
    HashtagUpdate,
    HashtagResponse,
    TestHashtagRequest,
    TestHashtagResponse
)
from ..crud.admin_testlar import (
    admin_get_all_tests,
    admin_get_test_by_id,
    admin_create_test,
    admin_update_test,
    admin_delete_test,
    admin_get_stats,
    admin_get_all_hashtags,
    admin_create_hashtag,
    admin_update_hashtag,
    admin_delete_hashtag,
    admin_add_hashtag_to_test,
    admin_remove_hashtag_from_test,
    admin_get_test_hashtags
)
from ..core.security import get_current_admin_user
from ..wrong import wrong

router = APIRouter(prefix="/testlar/admin", tags=["Admin Testlar"])

@router.get("/all", response_model=AdminTestListResponse)
async def admin_get_all_tests_endpoint(
    search: Optional[str] = Query(None),
    fan: Optional[str] = Query(None),
    ispublic: Optional[bool] = Query(None),
    user_id: Optional[int] = Query(None),
    skip: int = Query(0),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun barcha testlarni olish (filterlash imkoniyati bilan)
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    print('search', search)
    print('fan', fan)
    print('ispublic', ispublic)
    print('user_id', user_id)
    print('skip', skip)
    filters = AdminTestFilter(
        search=search,
        fan=fan,
        ispublic=ispublic,
        user_id=user_id,
        skip=skip,
        limit=5  # Default limit
    )
    
    result = await admin_get_all_tests(db, filters)
    return result

@router.get("/stats", response_model=AdminStatsResponse)
async def admin_get_stats_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin panel uchun statistika ma'lumotlari
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    
    stats = await admin_get_stats(db)
    return stats

@router.get("/{test_id}", response_model=AdminTestResponse)
async def admin_get_test_by_id_endpoint(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun testni ID bo'yicha olish
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    
    test = await admin_get_test_by_id(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    return test

@router.post("/create")
async def admin_create_test_endpoint(
    test_data: AdminTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun test yaratish
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    
    result = await admin_create_test(db, test_data, current_user.get('id'))
    return {"message": "Test muvaffaqiyatli yaratildi", "status": True, "test": result}

@router.post("/update/{test_id}")
async def admin_update_test_endpoint(
    test_id: int,
    test_data: AdminTestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun testni yangilash
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    
    success = await admin_update_test(db, test_id, test_data)
    if not success:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    return {"message": "Test muvaffaqiyatli yangilandi", "status": True}

@router.delete("/{test_id}")
async def admin_delete_test_endpoint(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun testni o'chirish
    """
    if current_user.get('status') == False:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    
    success = await admin_delete_test(db, test_id, current_user.get('id'))
    if not success:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    return {"message": "Test muvaffaqiyatli o'chirildi", "status": True}

# Hashtag endpoints
@router.get("/hashtags")
async def admin_get_all_hashtag(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun barcha hashtaglarni olish
    """
    print('current_user', current_user)
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    hashtags_db = await admin_get_all_hashtags(db)
    return hashtags_db

@router.post("/hashtags/create")
async def admin_create_hashtag_endpoint(
    hashtag: HashtagCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun yangi hashtag yaratish
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    try:
        result = await admin_create_hashtag(db, hashtag.name)
        return {"message": "Hashtag muvaffaqiyatli yaratildi", "status": True, "hashtag": result}
    except ValueError as e:
        return wrong(str(e), status=False)

@router.put("/hashtags/{hashtag_id}")
async def admin_update_hashtag_endpoint(
    hashtag_id: int,
    hashtag: HashtagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun hashtag yangilash
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    try:
        result = await admin_update_hashtag(db, hashtag_id, hashtag.name)
        return {"message": "Hashtag muvaffaqiyatli yangilandi", "status": True, "hashtag": result}
    except ValueError as e:
        return wrong(str(e), status=False)

@router.delete("/hashtags/{hashtag_id}")
async def admin_delete_hashtag_endpoint(
    hashtag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Admin uchun hashtag o'chirish
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    success = await admin_delete_hashtag(db, hashtag_id)
    if not success:
        return wrong("Hashtag topilmadi", status=False)
    
    return {"message": "Hashtag muvaffaqiyatli o'chirildi", "status": True}

@router.post("/{test_id}/hashtags")
async def admin_add_hashtag_to_test_endpoint(
    test_id: int,
    hashtag_request: TestHashtagRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Testga hashtag qo'shish (test_id yoki id bilan)
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    try:
        result = await admin_add_hashtag_to_test(db, test_id, hashtag_request.hashtag_id, hashtag_request.tag)
        return {"message": "Hashtag testga muvaffaqiyatli qo'shildi", "status": True, "test_hashtag": result}
    except ValueError as e:
        return wrong(str(e), status=False)

@router.delete("/{test_id}/hashtags/{hashtag_id}")
async def admin_remove_hashtag_from_test_endpoint(
    test_id: int,
    hashtag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Testdan hashtag olib tashlash (test_id yoki id bilan)
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    success = await admin_remove_hashtag_from_test(db, test_id, hashtag_id)
    if not success:
        return wrong("Test yoki hashtag topilmadi", status=False)
    
    return {"message": "Hashtag testdan muvaffaqiyatli olib tashlandi", "status": True}

@router.get("/{test_id}/hashtags", response_model=list[dict])
async def admin_get_test_hashtags_endpoint(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user)
):
    """
    Testning hashtaglarini olish (test_id yoki id bilan)
    """
    if current_user.get('status') == False:
        return wrong("Admin huquqi kerak", status=False)
    
    hashtags = await admin_get_test_hashtags(db, test_id)
    return hashtags