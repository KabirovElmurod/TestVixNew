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
from ..models.savollar import Natijalar, Savollar, Variantlar, Testlar
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

# async def get_savol_by_test_id(
#     db: AsyncSession,
#     user_id: int,
#     test_id: int,
#     last_id: int | None = None,
#     limit: int = 2,
# ):
#     redis = await get_redis()

#     # ---------------------------------------------------------
#     # Keys
#     # ---------------------------------------------------------
#     test_questions_key = f"test:{test_id}:savollar"
#     test_ready_key = f"test:{test_id}:savollar:ready"
#     user_questions_key = f"user:{user_id}:test:{test_id}:savollar"

#     # ---------------------------------------------------------
#     # Validation
#     # ---------------------------------------------------------
#     if limit <= 0:
#         return {
#             "savollar": [],
#             "last_id": None,
#         }

#     # ---------------------------------------------------------
#     # 1. Test time / istime
#     # ---------------------------------------------------------
#     time, istime = await redis.hmget(
#         f"public_tests:{test_id}",
#         "time",
#         "istime",
#     )

#     if time is None or istime is None:
#         result = await db.execute(
#             select(
#                 Testlar.time,
#                 Testlar.istime,
#             ).where(
#                 Testlar.id == test_id
#             )
#         )

#         test = result.one_or_none()

#         if test is None:
#             return {
#                 "savollar": [],
#                 "last_id": None,
#             }

#         time = test.time
#         istime = test.istime

#         # Redis'dagi qiymatlar keyinchalik ishlatilishi uchun
#         if time is not None:
#             await redis.hset(
#                 f"public_tests:{test_id}",
#                 mapping={
#                     "time": time,
#                     "istime": int(bool(istime)),
#                 },
#             )

#     # Redis qiymatlari string/bytes bo'lishi mumkin
#     if isinstance(time, bytes):
#         time = int(time)

#     if isinstance(istime, bytes):
#         istime = bool(int(istime))
#     else:
#         istime = bool(istime)

#     # ---------------------------------------------------------
#     # 2. Test savollarini olish
#     #
#     # test:{test_id}:savollar
#     #
#     # Bu umumiy cache.
#     # Barcha userlar shu ID'lardan foydalanadi.
#     # ---------------------------------------------------------
#     test_question_ids = await redis.zrange(
#         test_questions_key,
#         0,
#         -1,
#     )

#     if not test_question_ids:
#         # Redis'da yo'q -> DB'dan olamiz
#         result = await db.execute(
#             select(Savollar.id)
#             .where(
#                 Savollar.test_id == test_id
#             )
#             .order_by(
#                 Savollar.id.asc()
#             )
#         )

#         db_question_ids = result.scalars().all()

#         if not db_question_ids:
#             return {
#                 "savollar": [],
#                 "last_id": None,
#             }

#         # Umumiy test cache'ni yaratamiz
#         pipe = redis.pipeline()

#         pipe.zadd(
#             test_questions_key,
#             {
#                 str(question_id): question_id
#                 for question_id in db_question_ids
#             },
#         )

#         # Cache expiration
#         cache_ttl = time if istime and time else 5 * 60 * 60

#         pipe.expire(
#             test_questions_key,
#             cache_ttl,
#         )

#         pipe.set(
#             test_ready_key,
#             "1",
#             ex=cache_ttl,
#         )

#         await pipe.execute()

#         test_question_ids = [
#             str(question_id)
#             for question_id in db_question_ids
#         ]

#     else:
#         # Redis bytes -> string
#         test_question_ids = [
#             (
#                 question_id.decode()
#                 if isinstance(question_id, bytes)
#                 else str(question_id)
#             )
#             for question_id in test_question_ids
#         ]

#     # ---------------------------------------------------------
#     # 3. User uchun random savollar listini yaratish
#     #
#     # user:{user_id}:test:{test_id}:savollar
#     #
#     # Agar user hali testni boshlamagan bo'lsa,
#     # faqat bir marta push qilamiz.
#     # ---------------------------------------------------------
#     user_question_count = await redis.llen(
#         user_questions_key
#     )

#     if user_question_count == 0:
#         shuffled_ids = list(test_question_ids)
#         random.shuffle(shuffled_ids)

#         if shuffled_ids:
#             pipe = redis.pipeline()

#             pipe.rpush(
#                 user_questions_key,
#                 *shuffled_ids,
#             )

#             cache_ttl = time if istime and time else 5 * 60 * 60

#             pipe.expire(
#                 user_questions_key,
#                 cache_ttl,
#             )

#             await pipe.execute()

#     # ---------------------------------------------------------
#     # 4. User uchun kerakli ID'larni olish
#     # ---------------------------------------------------------
#     if last_id is None:
#         cached_ids = await redis.lrange(
#             user_questions_key,
#             0,
#             limit - 1,
#         )
#     else:
#         # last_id qaysi pozitsiyada ekanini topamiz
#         position = await redis.lpos(
#             user_questions_key,
#             str(last_id),
#         )

#         if position is None:
#             return {
#                 "savollar": [],
#                 "last_id": None,
#             }

#         cached_ids = await redis.lrange(
#             user_questions_key,
#             position + 1,
#             position + limit,
#         )

#     if not cached_ids:
#         return {
#             "savollar": [],
#             "last_id": None,
#         }

#     # bytes -> int
#     question_ids = [
#         int(
#             question_id.decode()
#             if isinstance(question_id, bytes)
#             else question_id
#         )
#         for question_id in cached_ids
#     ]

#     # ---------------------------------------------------------
#     # 5. Savollarni Redis'dan olish
#     # ---------------------------------------------------------
#     savollar = []
#     missing_ids = []

#     for question_id in question_ids:
#         cached_question = await redis.get(
#             f"savol:{question_id}"
#         )

#         if cached_question:
#             if isinstance(cached_question, bytes):
#                 cached_question = cached_question.decode()

#             savollar.append(
#                 json.loads(cached_question)
#             )
#         else:
#             missing_ids.append(question_id)

#     # ---------------------------------------------------------
#     # 6. Redis'da yo'q savollarni DB'dan olish
#     # ---------------------------------------------------------
#     if missing_ids:
#         result = await db.execute(
#             select(
#                 Savollar.id,
#                 Savollar.test_id,
#                 Savollar.text,
#                 Savollar.svg_json,
#                 func.json_agg(
#                     func.json_build_object(
#                         "id",
#                         Variantlar.id,
#                         "text",
#                         Variantlar.text,
#                     )
#                 ).label("variantlar"),
#             )
#             .join(
#                 Variantlar,
#                 Variantlar.savol_id == Savollar.id,
#             )
#             .where(
#                 Savollar.id.in_(missing_ids),
#                 Savollar.test_id == test_id,
#             )
#             .group_by(
#                 Savollar.id,
#                 Savollar.test_id,
#                 Savollar.text,
#                 Savollar.svg_json,
#             )
#         )

#         rows = result.all()

#         rows_by_id = {
#             row.id: row
#             for row in rows
#         }

#         # DB'dan kelgan tartib emas,
#         # user Redis listidagi tartib muhim.
#         for question_id in missing_ids:
#             row = rows_by_id.get(question_id)

#             if row is None:
#                 continue

#             savol_hash = generate_hash_savol(
#                 row.id,
#                 test_id,
#             )

#             new_savol = {
#                 "id": row.id,
#                 "test_id": row.test_id,
#                 "savol_hash": savol_hash,
#                 "text": row.text,
#                 "svg_json": row.svg_json,
#                 "variantlar": [
#                     {
#                         "id": variant["id"],
#                         "text": variant["text"],
#                         "v_hash": generate_hash_url(
#                             variant["id"],
#                             savol_hash,
#                         ),
#                     }
#                     for variant in row.variantlar
#                 ],
#             }

#             savollar.append(new_savol)

#             # Savolni Redis cache'ga yozamiz
#             cache_ttl = (
#                 time
#                 if istime and time
#                 else 5 * 60 * 60
#             )

#             await redis.set(
#                 f"savol:{row.id}",
#                 json.dumps(new_savol),
#                 ex=cache_ttl,
#             )

#     # ---------------------------------------------------------
#     # 7. Muhim:
#     #
#     # missing_ids DB'dan kelganda tartib o'zgarishi mumkin.
#     # Shuning uchun yakuniy resultni user_question_ids
#     # tartibiga qaytaramiz.
#     # ---------------------------------------------------------
#     savollar_by_id = {
#         savol["id"]: savol
#         for savol in savollar
#     }

#     ordered_savollar = [
#         savollar_by_id[question_id]
#         for question_id in question_ids
#         if question_id in savollar_by_id
#     ]

#     # ---------------------------------------------------------
#     # 8. Pagination
#     # ---------------------------------------------------------
#     if not ordered_savollar:
#         return {
#             "savollar": [],
#             "last_id": None,
#         }

#     # Agar limitdan kam savol qolgan bo'lsa,
#     # keyingi page yo'q.
#     next_last_id = (
#         ordered_savollar[-1]["id"]
#         if len(ordered_savollar) == limit
#         else None
#     )

#     return {
#         "savollar": ordered_savollar,
#         "last_id": next_last_id,
#     }



async def get_savol_by_test_id(
    db: AsyncSession,
    user_id: int,
    test_id: int,
    last_id: int = None,
    limit: int = 4,):
    """
    User uchun test savollarini Redis'dagi random tartibda pagination qiladi.

    API contract o'zgarmaydi:

    {
        "savollar": [...],
        "last_id": 123
    }

    Muhim:
    - test:{test_id}:savollar
        -> testning umumiy savol ID'lari

    - user:{user_id}:test:{test_id}:savollar
        -> aynan shu user uchun random tartibdagi savol ID'lari

    - savol:{id}
        -> savolning JSON cache'i

    Pagination faqat user-specific Redis LIST orqali amalga oshadi.
    DB pagination uchun ishlatilmaydi.
    """

    if limit <= 0:
        limit = 4

    # Juda katta limit bilan bitta request serverni bosib ketmasin.
    limit = min(limit, 50)

    redis = await get_redis()

    user_key = f"user:{user_id}:test:{test_id}:savollar"
    public_key = f"test:{test_id}:savollar"
    ready_key = f"test:{test_id}:savollar:ready"
    test_key = f"public_tests:{test_id}"

    # ---------------------------------------------------------
    # 1. TEST TIME / EXPIRATION
    # ---------------------------------------------------------

    time = None
    istime = None

    test_meta = await redis.hmget(
        test_key,
        "time",
        "istime",
    )

    if test_meta:
        time, istime = test_meta

    if time is not None:
        try:
            time = int(time)
        except (TypeError, ValueError):
            time = None

    # ---------------------------------------------------------
    # 2. TEST SAVOLLARINI GLOBAL REDIS'DA BIR MARTA YARATISH
    #
    # Parallel requestlar kelganda:
    #
    # user1 ─┐
    # user2 ─┼──> test:{id}:savollar
    # user3 ─┘
    #
    # uchun Redis lock ishlatiladi.
    # ---------------------------------------------------------

    public_ids = await redis.zrange(
        public_key,
        0,
        -1,
    )

    if not public_ids:
        lock = redis.lock(
            f"lock:test:{test_id}:init",
            timeout=30,
            blocking_timeout=10,
        )

        async with lock:
            # Lock olgandan keyin yana tekshiramiz.
            # Chunki boshqa parallel request allaqachon yaratgan bo'lishi mumkin.
            public_ids = await redis.zrange(
                public_key,
                0,
                -1,
            )

            if not public_ids:
                result = await db.execute(
                    select(
                        Savollar.id
                    )
                    .where(
                        Savollar.test_id == test_id
                    )
                    .order_by(
                        Savollar.id.asc()
                    )
                )

                db_ids = result.scalars().all()

                if not db_ids:
                    return {
                        "savollar": [],
                        "last_id": None,
                    }

                # DB ID'larini Redis formatiga o'tkazamiz.
                public_ids = [
                    str(question_id)
                    for question_id in db_ids
                ]

                # Test metadata kerak bo'lsa shu yerda olamiz.
                if time is None:
                    result = await db.execute(
                        select(
                            Testlar.time,
                            Testlar.istime,
                        )
                        .where(
                            Testlar.id == test_id
                        )
                    )

                    row = result.one_or_none()

                    if row:
                        time = row.time
                        istime = row.istime

                # Global test savollarini yaratamiz.
                pipe = redis.pipeline()

                pipe.zadd(
                    public_key,
                    {
                        str(question_id): int(question_id)
                        for question_id in db_ids
                    },
                )

                if istime and time:
                    ttl = int(time)
                else:
                    ttl = 5 * 60 * 60

                pipe.expire(
                    public_key,
                    ttl,
                )

                pipe.set(
                    ready_key,
                    1,
                    ex=ttl,
                )

                await pipe.execute()

    # ---------------------------------------------------------
    # 3. USER-SPECIFIC RANDOM LISTNI YARATISH
    #
    # Muhim:
    # Random faqat bir marta qilinadi.
    #
    # Keyingi requestlarda shuffle qilinmaydi.
    # ---------------------------------------------------------

    user_exists = await redis.exists(user_key)

    if not user_exists:
        lock = redis.lock(
            f"lock:user:{user_id}:test:{test_id}:init",
            timeout=30,
            blocking_timeout=10,
        )

        async with lock:
            # Lock ichida qayta tekshirish shart.
            user_exists = await redis.exists(user_key)

            if not user_exists:
                public_ids = await redis.zrange(
                    public_key,
                    0,
                    -1,
                )

                if not public_ids:
                    return {
                        "savollar": [],
                        "last_id": None,
                    }

                # Faqat shu user uchun random.
                user_ids = list(public_ids)
                random.shuffle(user_ids)

                if time is None:
                    result = await db.execute(
                        select(
                            Testlar.time,
                            Testlar.istime,
                        )
                        .where(
                            Testlar.id == test_id
                        )
                    )

                    row = result.one_or_none()

                    if row:
                        time = row.time
                        istime = row.istime

                if istime and time:
                    ttl = int(time)
                else:
                    ttl = 5 * 60 * 60

                pipe = redis.pipeline()

                pipe.rpush(
                    user_key,
                    *user_ids,
                )

                pipe.expire(
                    user_key,
                    ttl,
                )

                await pipe.execute()

    # ---------------------------------------------------------
    # 4. PAGINATION
    #
    # MUHIM:
    # Bundan keyin DB'dan "id > last_id" qilinmaydi.
    #
    # Chunki user list RANDOM.
    #
    # last_id Redis LIST ichidagi cursor.
    # ---------------------------------------------------------

    if last_id is None:
        cache_ids = await redis.lrange(
            user_key,
            0,
            limit - 1,
        )
    else:
        position = await redis.lpos(
            user_key,
            str(last_id),
        )

        if position is None:
            # Noto'g'ri yoki eski cursor.
            #
            # Bu holatda DB'ga tushib ketmaymiz.
            # Aks holda random pagination buziladi.
            return {
                "savollar": [],
                "last_id": None,
            }

        cache_ids = await redis.lrange(
            user_key,
            position + 1,
            position + limit,
        )

    # Test tugagan.
    if not cache_ids:
        return {
            "savollar": [],
            "last_id": None,
        }

    # ---------------------------------------------------------
    # 5. REDIS'DAN SAVOLLARNI OLISH
    #
    # savol:{id} mavjud bo'lsa DB'ga umuman bormaymiz.
    # ---------------------------------------------------------

    savollar = []
    missing_ids = []

    for question_id in cache_ids:
        cached = await redis.get(
            f"savol:{question_id}"
        )

        if cached:
            try:
                savol = json.loads(cached)
                savollar.append(savol)
            except (json.JSONDecodeError, TypeError):
                missing_ids.append(int(question_id))
        else:
            missing_ids.append(int(question_id))

    # ---------------------------------------------------------
    # 6. CACHE MISS -> DB
    #
    # Faqat aynan kerak bo'lgan ID'lar olinadi.
    # ---------------------------------------------------------

    if missing_ids:
        result = await db.execute(
            select(
                Savollar.id,
                Savollar.test_id,
                Savollar.text,
                Savollar.svg_json,
                func.json_agg(
                    func.json_build_object(
                        "id",
                        Variantlar.id,
                        "text",
                        Variantlar.text,
                    )
                ).label("variantlar"),
            )
            .join(
                Variantlar,
                Variantlar.savol_id == Savollar.id,
            )
            .where(
                Savollar.id.in_(missing_ids),
                Savollar.test_id == test_id,
            )
            .group_by(
                Savollar.id,
                Savollar.test_id,
                Savollar.text,
                Savollar.svg_json,
            )
        )

        rows = result.all()

        # DB'dan kelgan savollarni dictionary qilamiz.
        rows_map = {
            row.id: row
            for row in rows
        }

        cache_ttl = int(time) if istime and time else 5 * 60 * 60

        # -----------------------------------------------------
        # 7. CACHE MISS BO'LGAN SAVOLLARNI YARATISH
        # -----------------------------------------------------

        cache_pipe = redis.pipeline()

        new_questions = {}

        for question_id in missing_ids:
            row = rows_map.get(question_id)

            if row is None:
                continue

            savol_hash = generate_hash_savol(
                row.id,
                test_id,
            )

            variants = []

            for variant in row.variantlar or []:
                variant_id = variant["id"]

                variants.append(
                    {
                        "id": variant_id,
                        "text": variant["text"],
                        "v_hash": generate_hash_url(
                            variant_id,
                            savol_hash,
                        ),
                    }
                )

            new_savol = {
                "id": row.id,
                "test_id": row.test_id,
                "savol_hash": savol_hash,
                "text": row.text,
                "svg_json": row.svg_json,
                "variantlar": variants,
            }

            new_questions[row.id] = new_savol

            cache_pipe.set(
                f"savol:{row.id}",
                json.dumps(
                    new_savol,
                    ensure_ascii=False,
                ),
                ex=cache_ttl,
            )

        if new_questions:
            await cache_pipe.execute()

    # ---------------------------------------------------------
    # 8. NATIJANI REDIS LIST TARTIBIDA QAYTARISH
    #
    # DB ASC tartibida emas!
    #
    # Userga berilgan:
    #
    # [85, 75, 81, 70]
    #
    # shu tartibda qaytishi kerak.
    # ---------------------------------------------------------

    all_questions = {}

    # Avval cache'dagi savollar.
    for savol in savollar:
        all_questions[savol["id"]] = savol

    # Keyin yangi DB'dan olingan savollar.
    if missing_ids:
        for question_id in missing_ids:
            question = new_questions.get(question_id)

            if question:
                all_questions[question_id] = question

    ordered_questions = []

    for question_id in cache_ids:
        question_id_int = int(question_id)

        question = all_questions.get(
            question_id_int
        )

        if question:
            ordered_questions.append(question)

    # ---------------------------------------------------------
    # 9. KEYINGI CURSOR
    #
    # Faqat shu requestda haqiqatdan berilgan
    # oxirgi savol.
    # ---------------------------------------------------------

    if len(ordered_questions) < len(cache_ids):
        # Juda noodatiy holat:
        # Redis listda ID bor, lekin DB'da savol yo'q.
        #
        # Baribir mavjud savollarni qaytaramiz.
        pass

    if not ordered_questions:
        return {
            "savollar": [],
            "last_id": None,
        }

    returned_last_id = ordered_questions[-1]["id"]

    # ---------------------------------------------------------
    # 10. TEST TUGAGANINI ANIQLASH
    #
    # Agar oxirgi requestda limitdan kam savol kelgan bo'lsa,
    # keyingi request shart emas.
    #
    # Masalan:
    #
    # 30 savol:
    # 4 + 4 + 4 + 4 + 4 + 4 + 4 + 2
    #
    # oxirgi response:
    # last_id = None
    # ---------------------------------------------------------

    if len(cache_ids) < limit:
        next_last_id = None
    else:
        next_last_id = returned_last_id

    return {
        "savollar": ordered_questions,
        "last_id": next_last_id,
    }


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
        "isfinish": True,
        "time_spent": data.time_spent if hasattr(data, 'time_spent') else 0
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