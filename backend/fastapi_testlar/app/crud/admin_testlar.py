from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import aliased
from typing import Optional, List
from ..models.testlar import Testlar, Hashtag, TestlarHashtag
from ..schemas.admin_testlar import AdminTestCreate, AdminTestUpdate, AdminTestFilter
from ..crud.func import (
    generate_unique_test_id, 
    generate_unique_test_code, 
    generate_unique_test_key, 
    created_to_human_time
)
from ..crud.testlar import get_testlar_by_id

async def admin_get_all_tests(
    db: AsyncSession, 
    filters: AdminTestFilter
) -> dict:
    """
    Admin uchun barcha testlarni filterlash bilan olish
    """
    # Avval total count ni olish
    count_query = select(func.count(Testlar.id))
    
    # Filterlash conditions
    conditions = []
    
    if filters.search:
        search_term = f"%{filters.search}%"
        conditions.append(
            or_(
                Testlar.nom.ilike(search_term),
                Testlar.fan.ilike(search_term),
                Testlar.tavsif.ilike(search_term),
                Testlar.test_id.ilike(search_term)
            )
        )
    
    if filters.fan:
        conditions.append(Testlar.fan == filters.fan)
    
    if filters.ispublic is not None:
        conditions.append(Testlar.ispublic == filters.ispublic)
    
    # user_id filter: 0 = barcha testlar, boshqa qism = faqat shu user
    if filters.user_id is not None and filters.user_id != 0:
        conditions.append(Testlar.user_id == filters.user_id)
    
    if conditions:
        count_query = count_query.where(and_(*conditions))
    
    total_count_result = await db.execute(count_query)
    total_count = total_count_result.scalar() or 0
    
    # Asosiy query
    query = select(Testlar)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Pagination
    offset = filters.skip * filters.limit + 1
    query = query.offset(offset).limit(filters.limit)
    
    # Order by created date (descending)
    query = query.order_by(Testlar.created.desc())
    
    result = await db.execute(query)
    tests = result.scalars().all()
    
    # Response formatiga o'tkazish
    response_data = []
    for test in tests:
        response_data.append({
            'id': test.id,
            'test_id': test.test_id,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            'ispublic': test.ispublic,
            'user_id': test.user_id,
            'created': created_to_human_time(test.created) if test.created else "",
            'username': None  # User ma'lumotlari kerak bo'lsa account API dan olinadi
        })
    
    return {
        'tests': response_data,
        'total_count': total_count,
        'pages': total_count // filters.limit + 1
    }

async def admin_get_test_by_id(db: AsyncSession, test_id: int) -> Optional[dict]:
    """
    Admin uchun testni ID bo'yicha olish
    """
    test = await get_testlar_by_id(db, test_id)
    if not test:
        return None
    
    return {
        'id': test.id,
        'test_id': test.test_id,
        'nom': test.nom,
        'fan': test.fan,
        'tavsif': test.tavsif,
        'ispublic': test.ispublic,
        'user_id': test.user_id,
        'created': created_to_human_time(test.created) if test.created else "",
        'username': None
    }

async def admin_create_test(db: AsyncSession, test_data: AdminTestCreate, user_id: int) -> dict:
    """
    Admin uchun test yaratish
    """
    test_id = await generate_unique_test_id(db)
    test_code = await generate_unique_test_code(db)
    test_key = await generate_unique_test_key(db)
    
    db_test = Testlar(
        user_id=user_id,
        nom=test_data.nom,
        fan=test_data.fan,
        tavsif=test_data.tavsif,
        test_id=test_id,
        test_code=test_code,
        test_key=test_key,
        ispublic=test_data.ispublic,
        istime=test_data.istime,
        time=test_data.time * 60 if test_data.istime else 60 * 60 * 60 * 24 * 365
    )
    
    db.add(db_test)
    await db.commit()
    await db.refresh(db_test)
    
    return {
        'id': db_test.id,
        'test_id': db_test.test_id,
        'nom': db_test.nom,
        'fan': db_test.fan,
        'tavsif': db_test.tavsif,
        'ispublic': db_test.ispublic,
        'user_id': db_test.user_id,
        'created': created_to_human_time(db_test.created) if db_test.created else ""
    }

async def admin_update_test(db: AsyncSession, test_id: int, test_data: AdminTestUpdate) -> bool:
    """
    Admin uchun testni yangilash
    """
    test = await get_testlar_by_id(db, test_id)
    if not test:
        return False
    
    # Faqat berilgan maydonlarni yangilash
    update_data = {}
    if test_data.nom is not None:
        update_data['nom'] = test_data.nom
    if test_data.fan is not None:
        update_data['fan'] = test_data.fan
    if test_data.tavsif is not None:
        update_data['tavsif'] = test_data.tavsif
    if test_data.ispublic is not None:
        update_data['ispublic'] = test_data.ispublic
    if test_data.istime is not None:
        update_data['istime'] = test_data.istime
    if test_data.time is not None:
        update_data['time'] = test_data.time * 60 if test_data.istime else 60 * 60 * 60 * 24 * 365
    
    if update_data:
        await db.execute(
            select(Testlar).where(Testlar.id == test_id)
        )
        for key, value in update_data.items():
            setattr(test, key, value)
        
        await db.commit()
        await db.refresh(test)
    
    return True

async def admin_delete_test(db: AsyncSession, test_id: int, user_id: int) -> bool:
    """
    Admin uchun testni o'chirish
    """
    test = await get_testlar_by_id(db, test_id)
    if not test:
        return False
    
    await db.delete(test)
    await db.commit()
    
    return True

# Hashtag CRUD operations
async def admin_get_all_hashtags(db: AsyncSession) -> List[dict]:
    """
    Admin uchun barcha hashtaglarni olish
    """
    query = select(Hashtag).order_by(Hashtag.name)
    result = await db.execute(query)
    hashtags = result.scalars().all()
    
    return [
        {
            'id': h.id,
            'name': h.name
        }
        for h in hashtags
    ]

async def admin_create_hashtag(db: AsyncSession, name: str) -> dict:
    """
    Admin uchun yangi hashtag yaratish
    """
    # Tekshirish - hashtag allaqachon bormi
    existing = await db.execute(select(Hashtag).where(Hashtag.name == name))
    if existing.scalar():
        raise ValueError("Hashtag allaqachon mavjud")
    
    hashtag = Hashtag(name=name)
    db.add(hashtag)
    await db.commit()
    await db.refresh(hashtag)
    
    return {
        'id': hashtag.id,
        'name': hashtag.name
    }

async def admin_delete_hashtag(db: AsyncSession, hashtag_id: int) -> bool:
    """
    Admin uchun hashtag o'chirish
    """
    hashtag = await db.execute(select(Hashtag).where(Hashtag.id == hashtag_id))
    hashtag = hashtag.scalar()
    
    if not hashtag:
        return False
    
    await db.delete(hashtag)
    await db.commit()
    
    return True

async def admin_update_hashtag(db: AsyncSession, hashtag_id: int, name: str) -> dict:
    """
    Admin uchun hashtag yangilash
    """
    hashtag = await db.execute(select(Hashtag).where(Hashtag.id == hashtag_id))
    hashtag = hashtag.scalar()
    
    if not hashtag:
        raise ValueError("Hashtag topilmadi")
    
    # Tekshirish - yangi nom allaqachon bormi
    existing = await db.execute(select(Hashtag).where(Hashtag.name == name).where(Hashtag.id != hashtag_id))
    if existing.scalar():
        raise ValueError("Hashtag allaqachon mavjud")
    
    hashtag.name = name
    await db.commit()
    await db.refresh(hashtag)
    
    return {
        'id': hashtag.id,
        'name': hashtag.name
    }

async def admin_add_hashtag_to_test(db: AsyncSession, test_id: int, hashtag_id: int, tag: bool = True) -> dict:
    """
    Testga hashtag qo'shish (test_id yoki id bilan)
    """
    # Testni topish - avval id bilan, keyin test_id bilan
    test = await db.execute(select(Testlar).where(Testlar.id == test_id))
    test = test.scalar()
    
    if not test:
        # test_id bilan qidirish
        test = await db.execute(select(Testlar).where(Testlar.test_id == str(test_id)))
        test = test.scalar()
    
    if not test:
        raise ValueError("Test topilmadi")
    
    # Hashtagni topish
    hashtag = await db.execute(select(Hashtag).where(Hashtag.id == hashtag_id))
    hashtag = hashtag.scalar()
    
    if not hashtag:
        raise ValueError("Hashtag topilmadi")
    
    # Tekshirish - allaqachon qo'shilganmi
    existing = await db.execute(
        select(TestlarHashtag).where(
            (TestlarHashtag.test_id == test.id) &
            (TestlarHashtag.hashtag_id == hashtag_id)
        )
    )
    existing = existing.scalar()
    
    if existing:
        # Agar allaqachon bo'lsa, tag statusini yangilash
        existing.tag = tag
        await db.commit()
        await db.refresh(existing)
    else:
        # Yangi bog'lanish yaratish
        test_hashtag = TestlarHashtag(
            test_id=test.id,
            hashtag_id=hashtag_id,
            tag=tag
        )
        db.add(test_hashtag)
        await db.commit()
        await db.refresh(test_hashtag)
    
    return {
        'id': test_hashtag.id if not existing else existing.id,
        'test_id': test.id,
        'hashtag_id': hashtag_id,
        'tag': tag,
        'hashtag_name': hashtag.name
    }

async def admin_remove_hashtag_from_test(db: AsyncSession, test_id: int, hashtag_id: int) -> bool:
    """
    Testdan hashtag olib tashlash (test_id yoki id bilan)
    """
    # Testni topish
    test = await db.execute(select(Testlar).where(Testlar.id == test_id))
    test = test.scalar()
    
    if not test:
        # test_id bilan qidirish
        test = await db.execute(select(Testlar).where(Testlar.test_id == str(test_id)))
        test = test.scalar()
    
    if not test:
        return False
    
    # Bog'lanishni topish va o'chirish
    test_hashtag = await db.execute(
        select(TestlarHashtag).where(
            (TestlarHashtag.test_id == test.id) &
            (TestlarHashtag.hashtag_id == hashtag_id)
        )
    )
    test_hashtag = test_hashtag.scalar()
    
    if not test_hashtag:
        return False
    
    await db.delete(test_hashtag)
    await db.commit()
    
    return True

async def admin_get_test_hashtags(db: AsyncSession, test_id: int) -> List[dict]:
    """
    Testning hashtaglarini olish (test_id yoki id bilan)
    """
    # Testni topish
    test = await db.execute(select(Testlar).where(Testlar.id == test_id))
    test = test.scalar()
    
    if not test:
        # test_id bilan qidirish
        test = await db.execute(select(Testlar).where(Testlar.test_id == str(test_id)))
        test = test.scalar()
    
    if not test:
        return []
    
    # Hashtaglarni olish
    query = (
        select(Hashtag.id, Hashtag.name, TestlarHashtag.tag)
        .join(TestlarHashtag, TestlarHashtag.hashtag_id == Hashtag.id)
        .where(TestlarHashtag.test_id == test.id)
        .order_by(Hashtag.name)
    )
    
    result = await db.execute(query)
    hashtags = result.all()
    
    return [
        {
            'id': h[0],
            'name': h[1],
            'tag': h[2]
        }
        for h in hashtags
    ]

async def admin_get_stats(db: AsyncSession) -> dict:
    """
    Admin panel uchun statistika ma'lumotlari
    """
    # Testlar statistikasi
    total_tests_result = await db.execute(select(func.count(Testlar.id)))
    total_tests = total_tests_result.scalar() or 0
    
    public_tests_result = await db.execute(
        select(func.count(Testlar.id)).where(Testlar.ispublic == True)
    )
    public_tests = public_tests_result.scalar() or 0
    
    # Foydalanuvchilar statistikasi (account servicdan olish kerak)
    # Hozircha mock data
    total_users = 0  # Bu account API dan olinadi
    active_users = 0  # Bu account API dan olinadi
    
    return {
        'total_tests': total_tests,
        'public_tests': public_tests,
        'total_users': total_users,
        'active_users': active_users
    }