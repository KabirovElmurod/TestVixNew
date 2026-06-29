from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func

from ...app.crud.func import (
    generate_unique_test_code, 
    generate_unique_test_id, 
    generate_unique_test_key, 
    created_to_human_time, 
    generate_hash_url
)
from ..models.testlar import Testlar, Savollar
from ..schemas.testlar import TestlarCreate, TestlarUpdate
# from ..app.crud. import created_to_human_time
async def get_id_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(Testlar.id).where(Testlar.username == username))
    return result.scalar_one_or_none()

async def create_testlar(db: AsyncSession, testlar: TestlarCreate, user_id: int):
    db_testlar = Testlar(
        user_id=user_id,
        nom=testlar.nom,
        fan=testlar.fan,
        tavsif=testlar.tavsif,
        test_id=await generate_unique_test_id(db),
        test_code=await generate_unique_test_code(db),
        test_key=await generate_unique_test_key(db),
        ispublic=testlar.ispublic,
        istime=testlar.istime,
        time=testlar.time if testlar.istime else 60 * 60 * 60 * 24 * 365
    )
    db.add(db_testlar)
    await db.commit()
    await db.refresh(db_testlar)
    return {'message': "Test muvaffaqiyatli yaratildi", "status": True, 'user':True}


async def get_testlar_by_id(db: AsyncSession, testlar_id: int):
    result = await db.execute(select(Testlar).where(Testlar.id == testlar_id))
    return result.scalar_one_or_none()


async def get_testlar_by_test_id(db: AsyncSession, test_id: str):
    result = await db.execute(select(Testlar).where(Testlar.test_id == test_id))
    return result.scalar_one_or_none()


async def get_testlar_by_test_code(db: AsyncSession, test_code: str):
    result = await db.execute(select(Testlar).where(Testlar.test_code == test_code))
    return result.scalar_one_or_none()


async def get_testlar_by_test_key(db: AsyncSession, test_key: str):
    result = await db.execute(select(Testlar).where(Testlar.test_key == test_key))
    return result.scalar_one_or_none()


async def get_all_testlar(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Testlar).offset(skip).limit(limit))
    return result.scalars().all()


async def get_testlar_by_user_id(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    stmt = (
        select(
            Testlar,
            func.count(Savollar.id).label("savollar_soni")
        )
        .outerjoin(Savollar, Savollar.test_id == Testlar.id)
        .where(Testlar.user_id == user_id)
        .group_by(Testlar.id)
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()
    results = []
    for test, savollar_soni in rows:
        results.append({
            'id': test.test_id if test.ispublic else test.test_code,
            'test_id': test.id,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            'key': test.test_key,
            'ispublic': test.ispublic,
            'istime': test.istime,
            'time': test.time,
            'created': created_to_human_time(test.created),
            'hash_url': generate_hash_url(test.id, test.test_key),
            'savollar_soni': savollar_soni
        })
    return results
    # return 


async def get_public_testlar(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Testlar).where(Testlar.ispublic == True).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def update_test(db: AsyncSession, test: TestlarUpdate):
    update_data = test.model_dump(exclude_unset=True)
    result = await db.execute(
        update(Testlar).where((Testlar.test_id == test.id) if test.id.isnumeric() else (Testlar.test_code == test.id) & (Testlar.test_key == test.key))
        .values(
            nom=update_data.get('nom'),
            fan=update_data.get('fan'),
            tavsif=update_data.get('tavsif'),
            ispublic=update_data.get('ispublic'),
            istime=update_data.get('istime'),
            time=update_data.get('time'))
    )
    if result.rowcount == 0:
        return False
    await db.commit()
    # updated_testlar = await get_testlar_by_id(db, test.id)
    return True


async def delete_testlar(db: AsyncSession, key: str, id: str | int, ispublic: bool, user_id: int):
    if ispublic:
        result = await db.execute(delete(Testlar).where((Testlar.test_key == key) & (Testlar.user_id == user_id) & (Testlar.test_id == id)))
    else:
        result = await db.execute(delete(Testlar).where((Testlar.test_key == key) & (Testlar.user_id == user_id) & (Testlar.test_code == id)))
    await db.commit()
    return result.rowcount > 0