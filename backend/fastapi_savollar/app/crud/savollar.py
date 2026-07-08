from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, insert
from sqlalchemy.orm import selectinload

from ...app.crud.func import (
    generate_unique_savol_code, 
    generate_unique_savol_id, 
    generate_unique_savol_key, 
    created_to_human_time, 
    generate_hash_url,
    verify_hash_url,
    generate_hash_savol, 
    verify_hash_savol
)
from ..models.savollar import Savollar, Variantlar
from ..schemas.savollar import SavollarCreate, SavollarUpdate, GetSavollarRequest
# from ..app.crud. import created_to_human_time
async def get_id_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(Savollar.id).where(Savollar.username == username))
    return result.scalar_one_or_none()

async def create_savollar(db: AsyncSession, savollar: SavollarCreate):
    db_savollar = Savollar(
        test_id=int(savollar.test_id),
        text=savollar.text,
        svg_json=savollar.svg_json
    )
    db.add(db_savollar)
    await db.flush()
    variants = [
        Variantlar(
            savol_id = db_savollar.id,
            text = v['text'],
            is_true = v['is_true']
        )
        for v in savollar.options
    ]
    db.add_all(variants)
    await db.commit()
    return {'message': "Savol muvaffaqiyatli yaratildi", "status": True}






async def get_savollar_by_id(db: AsyncSession, savollar_id: int):
    result = await db.execute(select(Savollar).where(Savollar.id == savollar_id))
    return result.scalar_one_or_none()


async def get_savollar_by_savol_id(db: AsyncSession, savol_id: str):
    result = await db.execute(select(Savollar).where(Savollar.savol_id == savol_id))
    return result.scalar_one_or_none()


async def get_savollar_by_savol_code(db: AsyncSession, savol_code: str):
    result = await db.execute(select(Savollar).where(Savollar.savol_code == savol_code))
    return result.scalar_one_or_none()


async def get_savollar_by_savol_key(db: AsyncSession, savol_key: str):
    result = await db.execute(select(Savollar).where(Savollar.savol_key == savol_key))
    return result.scalar_one_or_none()


async def get_all_savollar(db: AsyncSession, data: GetSavollarRequest, skip: int = 0, limit: int = 100):
    query = (
        select(Savollar)
        .options(selectinload(Savollar.variantlar))
        .where(Savollar.test_id == data.test_id)
    )
    result = await db.execute(query)
    savols = result.scalars().all()
    for savol in savols:
        savol.hash_id = generate_hash_url(savol.id, data.hash_url)
        savol.is_edit = False
        savol.is_svg_json_edit = False
        for variant in savol.variantlar:
            variant.hash_id = generate_hash_url(variant.id, data.hash_url)
            variant.is_edit = False
            variant.is_delete = False
            variant.is_true_edit = False
    
    
    return {
        "data": savols,
        "status": True
    }


async def get_savollar_by_user_id(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Savollar).where(Savollar.user_id == user_id).offset(skip).limit(limit)
    )
    savols = result.scalars().all()
    results = []
    for savol in savols:
        results.append({
            'id': savol.savol_id if savol.ispublic else savol.savol_code,
            'nom': savol.nom,
            'fan': savol.fan,
            'tavsif': savol.tavsif,
            # 'savol_id': savol.savol_id if savol.ispublic else savol.savol_code,
            # 'savol_code': savol.savol_code,
            'key': savol.savol_key,
            'ispublic': savol.ispublic,
            'istime': savol.istime,
            'time': savol.time,
            'created': created_to_human_time(savol.created)
        })
    return results
    # return 


async def get_public_savollar(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Savollar).where(Savollar.ispublic == True).offset(skip).limit(limit)
    )
    return result.scalars().all()




async def update_savol(db: AsyncSession, data):

    values = {}

    if getattr(data, "is_edit", False):
        values["text"] = data.text

    if getattr(data, "is_svg_json_edit", False):
        values["svg_json"] = data.svg_json

    if values:
        await db.execute(
            update(Savollar)
            .where(Savollar.id == data.savol_id)
            .values(**values)
        )

    delete_ids = [
        v["id"]
        for v in data.old_variantlar
        if v.get("is_delete")
    ]

    insert_data = [
        {
            "savol_id": data.savol_id,
            "text": v["text"],
            "is_true": v["is_true"],
        }
        for v in data.new_variantlar
        if v.get("hash_id") is None
    ]

    new_map = {v["id"]: v for v in data.new_variantlar}

    update_data = []

    for old in data.old_variantlar:
        new = new_map.get(old["id"])
        if not new:
            continue

        changes = {}

        # text o'zgarsa
        if old.get("is_edit"):
            changes["text"] = new["text"]

        # is_true logic
        if old["is_true"] != new["is_true"]:
            changes["is_true"] = new["is_true"]

        if changes:
            update_data.append({
                "id": old["id"],
                **changes
            })

    # -------------------------
    # BULK OPERATIONS
    # -------------------------
    if update_data:
        await db.run_sync(
            lambda s: s.bulk_update_mappings(Variantlar, update_data)
        )

    if insert_data:
        await db.run_sync(
            lambda s: s.bulk_insert_mappings(Variantlar, insert_data)
        )

    if delete_ids:
        await db.execute(
            delete(Variantlar).where(Variantlar.id.in_(delete_ids))
        )

    await db.commit()
    return True


async def delete_savollar(db: AsyncSession, test_id: str|int, savol_id: str|int):
    result_variant = delete(Variantlar).where(Variantlar.savol_id == savol_id)
    await db.execute(result_variant)
    result = delete(Savollar).where((Savollar.test_id == test_id) & (Savollar.id == savol_id))
    await db.execute(result)
    await db.commit()
    return True
