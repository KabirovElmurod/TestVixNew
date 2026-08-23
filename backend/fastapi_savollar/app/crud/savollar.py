from operator import and_

# from anyio import Condition

# from numpy import sort

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, insert, join, func
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
from ..models.savollar import Natijalar, Savollar, Variantlar
from sqlalchemy.dialects.postgresql import insert as pg_insert
from ..schemas.savollar import SavollarCreate, SavollarUpdate, GetSavollarRequest
from ...app.redis.redis import get_redis
import json
import random
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


async def get_savol_by_test_id(db: AsyncSession, user_id:int, test_id: int, last_id:int = None, limit:int = 2):
    redis = await get_redis()
    # savollar_ids = await redis.zrange(f'test:{test_id}:savollar', 0,-1)
    if not await redis.lrange(
        f'user:{user_id}:test:{test_id}:savollar',
        0,1
    ):
        ids = await redis.zrange(
            f'test:{test_id}:savollar',
            0,-1
        )
        if ids:
            random.shuffle(ids)
            key = f"user:{user_id}:test:{test_id}:savollar"
            pipe = redis.pipeline()
            pipe.rpush(key, *ids)
            pipe.expire(key, 10)
            await pipe.execute()

            
    key = f"user:{user_id}:test:{test_id}:savollar"
    cashe_id = []
    if last_id is None:
        cashe_id = await redis.lrange(key, 0, limit - 1)
    else:
        pos = await redis.lpos(key, str(last_id))

        if pos is None:
            cashe_id = []
        else:
            cashe_id = await redis.lrange(key, pos + 1, pos + limit)

    # print('\n\n\n', 'ids=>', ids, '\n\n\n')
    need_ids = []
    savollar = []
    if cashe_id:
        print('\n\n\n', cashe_id, '\n\n\n')

        for id in cashe_id:

            savol = await redis.get(f'savol:{id}')
            if savol:
                savol = json.loads(savol)
                savollar.append(savol)
            else:
                need_ids.append(int(id))
        if savollar and not need_ids:
            print('\n\n\n', 'cashe', '\n\n\n')
            return {
                'savollar': savollar,
                'last_id': savollar[-1]['id'] if len(savollar)==limit else None
            }
    print('\n\n\n', 'need=>', need_ids, '\n\n\n')
    print('\n\n\n', 'sav=>', savollar, '\n\n\n')

    
    if not await redis.get(f'test:{test_id}:savollar:ready'):
        result_id = await db.execute(
            select(
                Savollar.id
            )
            .where(Savollar.test_id == test_id)
            .order_by(Savollar.id.asc())
        )
        ids = result_id.scalars().all()
        if ids:
            await redis.zadd(
                f'test:{test_id}:savollar',
                {
                    str(i):i for i in ids
                }
            )
            await redis.set(f"test:{test_id}:savollar:ready", 1, ex=3600)
            await redis.rpush(
                f"user:{user_id}:test:{test_id}:savollar",
                *ids
            )

    
    condition = Savollar.test_id == test_id

    if last_id is not None:
        # condition.append(Savollar.id>last_id)
        condition = and_(
            Savollar.test_id == test_id,
            Savollar.id>last_id
        )
    
    
    result = (
        select(
            Savollar.id,
            Savollar.test_id,
            Savollar.text,
            Savollar.svg_json,
            func.json_agg(
                func.json_build_object(
                    "id", Variantlar.id,
                    "text", Variantlar.text
                )
            ).label("variantlar")
        )
        .join(
            Variantlar,
            Variantlar.savol_id == Savollar.id
        )
        .where(Savollar.test_id == test_id)
        
        .group_by(
            Savollar.id,
            Savollar.test_id,
            Savollar.text,
            Savollar.svg_json
        )
        .order_by(Savollar.id.asc())
        .limit(limit)
    )
    if need_ids:
        result = result.where(
            Savollar.id.in_(need_ids)
        )
    elif last_id:
        result = result.where(Savollar.id > last_id if last_id else True)
    result = await db.execute(result)
    rows = result.all()

    # savollar = []
    got_ids = []
    for row in rows:
        # print('sss=>', row)
        # print('id=>', row.id)
        if row.id not in got_ids:
            savol_hash = generate_hash_savol(row.id, test_id)
            new_savol = {
                "id": row.id,
                "test_id": row.test_id,
                'savol_hash': savol_hash,
                "text": row.text,
                "svg_json": row.svg_json,
                "variantlar": [
                    {
                    "id": v['id'],
                    "text": v['text'],
                    'v_hash': generate_hash_url(v['id'], savol_hash)
                }
                for v in row.variantlar
                ]
            }
            got_ids.append(row.id)
            savollar.append(new_savol)
            # for v in variant:
            #     savollar[savol.id]["variantlar"].append({
            #         "id": v.id,
            #         "text": v.text,
            #         'v_hash': generate_hash_url(v.id, savollar[savol.id]['savol_hash'])
            #     })
            await redis.set(f'savol:{row.id}', json.dumps(new_savol), ex = 10)
            # await redis.zadd(f'test:{row.test_id}:savollar', {
            #     str(row.id): row.id
            # })
        
    if savollar:
        if cashe_id:
            return {
            'savollar':savollar,
            'last_id': cashe_id[-1]
            }
        res = {
            'savollar':savollar,
            'last_id': (savollar)[-1]['id'] if len(list(savollar))==limit else None
        }
        # print()
        return res
    # res['savollar':list(savollar.values())]
    # res['']
    return {
            'last_id':None,
            'savollar': []
        } 
    # list(savollar.values())
    # return result.scalar_one_or_none()


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


async def finish_check_savol(db: AsyncSession, data, user_id):
    true_son = 0
    false_son = 0
    answers_data = data.answers

    # Testdagi barcha savol ID larini bazadan olamiz
    all_savollar_result = await db.execute(
        select(Savollar.id).where(Savollar.test_id == data.id)
    )
    all_savol_ids = [row.id for row in all_savollar_result]

    if not all_savol_ids:
        return {"status": False, "message": "Testda savollar mavjud emas."}

    # Barcha kerakli to'g'ri variantlarni bitta so'rovda bazadan olamiz
    true_variants_result = await db.execute(
        select(Variantlar.savol_id, Variantlar.id)
        .where(Variantlar.savol_id.in_(all_savol_ids))
        .where(Variantlar.is_true == True)
    )
    # {savol_id: true_variant_id} ko'rinishidagi map yaratamiz
    true_variants_map = {row.savol_id: row.id for row in true_variants_result}
    answers_result = {}

    for savol_id in all_savol_ids:
        savol_id_str = str(savol_id)
        answer = answers_data.get(savol_id_str)
        true_variant_id = true_variants_map.get(savol_id)
        is_correct = False
        is_checked = False
        selected_v_id = None

        if answer: # Foydalanuvchi bu savolga javob bergan
            is_checked = True
            selected_v_id = answer.get('v_id')
            if true_variant_id is not None and selected_v_id == true_variant_id:
                true_son += 1
                is_correct = True
            else:
                false_son += 1
        else: # Foydalanuvchi javob bermagan
            false_son += 1

        answers_result[savol_id] ={
            'savol_id': savol_id,
            'v_id': selected_v_id,
            'is_true': is_correct,
            'is_checked': is_checked,
            'is_true_id': true_variant_id
        }

    # Natijalarni bazaga yozish uchun ma'lumotlarni tayyorlaymiz
    natija_data = {
        "user_id": user_id,
        "test_id": data.id,
        "sum_son": len(all_savol_ids),
        "true_son": true_son,
        "false_son": false_son,
        "answer": answers_result,
        "isfinish": True
    }

    # PostgreSQL uchun "upsert" (ON CONFLICT DO UPDATE) so'rovi
    stmt = pg_insert(Natijalar).values(natija_data)
    # stmt = stmt.on_conflict_do_update(
    #     index_elements=['user_id', 'test_id'],  # Bu ustunlar birgalikda unikal bo'lishi kerak
    #     set_=natija_data
    # )
    await db.execute(stmt)
    await db.commit()

    return {"status": True, "message": "Test muvaffaqiyatli yakunlandi!", "result": natija_data}