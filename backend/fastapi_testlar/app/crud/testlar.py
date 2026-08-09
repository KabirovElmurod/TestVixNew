from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, extract, select, delete, update, func, or_, literal
from sqlalchemy.orm import aliased
from ...app.crud.func import (
    generate_unique_test_code, 
    generate_unique_test_id, 
    generate_unique_test_key, 
    created_to_human_time, 
    generate_hash_url
)
from sqlalchemy import distinct
import json
from ..models.testlar import Testlar, Savollar, TestlarHashtag, Variantlar, Hashtag
from ..schemas.testlar import TestlarCreate, TestlarUpdate, SearchTestRequest
from ..redis.redis import get_redis
from ...app.task import generate_hashtags
# from ..app.crud. import created_to_human_time
async def get_id_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(Testlar.id).where(Testlar.username == username))
    return result.scalar_one_or_none()

async def create_testlar(db: AsyncSession, testlar: TestlarCreate, user_id: int):
    # redis = await get_redis()
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
    redis = await get_redis()
    # Invalidate search cache when new test is created
    if testlar.ispublic:
        # Delete all search cache keys safely using SCAN
        await redis.delete_by_pattern("search:*")
    generate_hashtags.delay(db_testlar.id, db_testlar.nom, db_testlar.fan, db_testlar.tavsif)
    return {'message': "Test muvaffaqiyatli yaratildi", "status": True, 'user':True}

async def create_test_with_json(db: AsyncSession, testlar: TestlarCreate, user_id: int):
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
    await db.flush()  # id hosil bo'ladi

    for savol in testlar.savollar:
        db_savol = Savollar(
            test_id=db_testlar.id,
            text=savol["savol"],
            svg_json=savol["svg_json"] if "svg_json" in savol else json.dumps({"elements": []}),
            # javob=savol["javob"]
        )

        db.add(db_savol)
        await db.flush()  # savol.id hosil bo'ladi

        variants = [
            Variantlar(
                savol_id=db_savol.id,
                text=v,
                is_true = (savol['javob'] == index)
            )
            for index, v in enumerate(savol["variantlar"])
        ]

        db.add_all(variants)

    await db.commit()
    
    redis = await get_redis()
    # Invalidate search cache when new test is created
    if testlar.ispublic:
        # Delete all search cache keys safely using SCAN
        await redis.delete_by_pattern("search:*")
    
    generate_hashtags.delay(
        db_testlar.id,
        db_testlar.nom,
        db_testlar.fan,
        db_testlar.tavsif
    )

    return {
        "message": "Test muvaffaqiyatli yaratildi",
        "status": True,
        "user": True
    }
async def get_testlar_by_id(db: AsyncSession, testlar_id: int):
    result = await db.execute(select(Testlar).where(Testlar.id == testlar_id))
    return result.scalar_one_or_none()


async def get_test_by_test_id(db: AsyncSession, test_id: str | int):
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
                func.count(distinct(Savollar.id)).label("savollar_soni"),
                func.array_agg(
                    distinct(Hashtag.name)
                ).label("hashtags")
            )
        .outerjoin(Savollar, Savollar.test_id == Testlar.id)
        .outerjoin(
            TestlarHashtag,
            (TestlarHashtag.test_id == Testlar.id) &
            (TestlarHashtag.tag == True)
        )
        .outerjoin(
            Hashtag,
            Hashtag.id == TestlarHashtag.hashtag_id
        )
        .where(Testlar.user_id == user_id)
        .group_by(Testlar.id)
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()
    results = []
    for test, savollar_soni, hashtag_name in rows:
        results.append({
            'test_id': test.test_id if test.ispublic else test.test_code,
            'id': test.id,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            'key': test.test_key,
            'ispublic': test.ispublic,
            'istime': test.istime,
            'time': test.time,
            'created': created_to_human_time(test.created),
            'hash_url': generate_hash_url(test.id, test.test_key),
            'savollar_soni': savollar_soni,
            'hashtag_names': hashtag_name
        })
    return results
    # return 

async def get_public_testlar(db: AsyncSession, last_score: int = 0, limit: int = 100):
    # result = await db.execute(
    #     select(Testlar).where(Testlar.ispublic == True).offset(skip).limit(limit)
    # )
    
    redis = await get_redis()
    # cached_tests = await redis.get(f"public_tests:{last_score}:{limit}")
    # if cached_tests:
    #     return json.loads(cached_tests)
    respon = []
    
    if not last_score:
        cates = [
                {
                    'cate':"Matematika",
                    'is_category': True
                },
                {
                    'cate':"Fizika",
                    'is_category': True
                },
                {
                    'cate':"Tarix",
                    'is_category': True
                },
                {
                    'cate':"Biologiya",
                    'is_category': True
                }
            ]
        for cate in cates:
            request = SearchTestRequest(text=cate['cate'].lower(), type="string", last_score=None)
            data = await search_testlar(db, request)
            respon.append({
                'category': cate['cate'],
                'results': data,
                'is_category': True
            })
    score = extract(
        'epoch',
        Testlar.created
    ).label("score")
    stmt = (
            select(
                Testlar,
                score,
                func.count(distinct(Savollar.id)).label("savollar_soni"),
                func.array_agg(
                    distinct(Hashtag.name)
                ).label("hashtags")
            )
            .outerjoin(Savollar, Savollar.test_id == Testlar.id)
            .outerjoin(
                TestlarHashtag,
                (TestlarHashtag.test_id == Testlar.id) &
                (TestlarHashtag.tag == True)
            )
            .outerjoin(
                Hashtag,
                Hashtag.id == TestlarHashtag.hashtag_id
            )
            .where((Testlar.ispublic == True))
            # .group_by(Testlar.id)
            # .order_by(score)
            # .limit(limit)
        )
    # print('\n\n\n', 'last_score=>', last_score, '\n\n\n')
    if last_score:
        stmt = stmt.where(score < last_score)

    stmt = (
        stmt
        .group_by(Testlar.id)
        .order_by(score.desc())
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    results = []
    for test, test_score, savollar_soni, hashtag_name in rows:
        results.append({
            'test_id': test.test_id ,
            'id': test.id,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            # 'key': test.test_key,
            # 'ispublic': test.ispublic,
            'istime': test.istime,
            'time': test.time,
            'score': int(test_score),
            'created': created_to_human_time(test.created),
            'hash_url': generate_hash_url(test.id, str(test.test_id)),
            'savollar_soni': savollar_soni,
            'hashtag_names': hashtag_name
        })
    next_last_score = None
    if not results:
        return {'results': [], 'last_score': None}
    if len(results) == limit:
        next_last_score = results[-1]['score'] if results else None
    # else:
    #     return {'results': [], 'last_score': None}
    response = {
        'results': results,
        'last_score': next_last_score
    }
    await redis.set(f"public_tests:{last_score}:{limit}", json.dumps(response), ex=3600)  # Cache for 1 hour
    data = {
        'category': 'Boshqa testlar',
        # 'is_category': False,
        'results': results,
        'last_score': next_last_score,
        'is_category': False
    }
    if last_score:
        return data
    
    respon.append(data)
    # if not last_score:
    cates.append({
        'cate': 'Boshqa testlar',
        'is_category': False,
    })
    respon.append({'cates': cates})
    # respon['Boshqa testlar'] = response
    return respon

async def update_test(db: AsyncSession, test: TestlarUpdate):
    update_data = test.model_dump(exclude_unset=True)
    redis = await get_redis()
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
    # Invalidate search cache when test is updated
    await redis.delete_by_pattern("search:*")
    await redis.delete("public_tests")
    # updated_testlar = await get_testlar_by_id(db, test.id)
    return True


async def delete_testlar(db: AsyncSession, key: str, id: str | int, user_id: int):
    redis = await get_redis()
    await db.execute(
        delete(Variantlar).where(
            Variantlar.savol_id.in_(
                select(Savollar.id).where(Savollar.test_id == id)
            )
        )
    )
    await db.execute(delete(Savollar).where(Savollar.test_id == id))
    await db.execute(delete(TestlarHashtag).where(TestlarHashtag.test_id == id))
    result = await db.execute(delete(Testlar).where((Testlar.test_key == key) & (Testlar.user_id == user_id) & (Testlar.id == id)))
    # Invalidate search cache when test is deleted
    await redis.delete_by_pattern("search:*")
    await redis.delete("public_tests")
    await db.commit()
    return result.rowcount > 0

async def search_testlar(db: AsyncSession, data, limit: int = 4):
    redis = await get_redis()
    last_score = None
    if(data.last_score!=None):
        last_score = float(data.last_score)
    if data.type == "string":

        words = data.text.lower().split()
        
        # Redis Stack search for cached results
        last_score_str = str(last_score) if last_score is not None else "none"
        result = await redis.search_cached_results(data.text.lower(), limit, last_score_str)
        
        # Check if result is valid and has expected structure
        if result and isinstance(result, list) and len(result) > 0 and result[0] > 0:
            docs = result[2:]
            
            for i in range(0, len(docs), 2):
                fields = docs[i + 1]
                field_dict = dict(zip(fields[::2], fields[1::2]))
                
                # limit mosligini tekshirish
                if int(field_dict["limit"]) != limit:
                    continue
                
                # pagination tekshirish
                if last_score is not None:
                    if field_dict["last_score"] != str(last_score):
                        continue
                
                cache = await redis.get(field_dict["cache_key"])
                print('\n\n\n', "cashe=>", cache, '\n\n\n')
                if cache:
                    return cache
        
        # If no cache hit or lazy loading needed, proceed with DB query
        
        # 1. HASHTAG QIDIRISH (Database search)
        hashtag_conditions = []
        for word in words:
            hashtag_conditions.append(
                Hashtag.name.op("%")(word)
            )

        hashtag_scores = func.greatest(
            *[
                func.similarity(Hashtag.name, word)
                for word in words
            ]
        )

        hashtag_query = (
            select(
                Hashtag.id,
                hashtag_scores.label("score")
            )
            .where(
                or_(*hashtag_conditions)
            )
            .subquery()
        )


        # 2. SAVOLLAR SONI
        savollar_count = (
            select(
                Savollar.test_id,
                func.count(Savollar.id).label("savollar_soni")
            )
            .group_by(Savollar.test_id)
            .subquery()
        )


        SearchTestHashtag = aliased(TestlarHashtag)
        TrueTestHashtag = aliased(TestlarHashtag)
        TrueHashtag = aliased(Hashtag)


        # 3. TESTLARNI OLISH
        score = func.sum(hashtag_query.c.score)


        stmt = (
            select(
                Testlar,

                func.coalesce(
                    savollar_count.c.savollar_soni,
                    0
                ).label("savollar_soni"),

                func.array_agg(
                    distinct(TrueHashtag.name)
                ).label("hashtags"),

                score.label("score")
            )

            .join(
                SearchTestHashtag,
                SearchTestHashtag.test_id == Testlar.id
            )

            .join(
                hashtag_query,
                hashtag_query.c.id == SearchTestHashtag.hashtag_id
            )


            .outerjoin(
                TrueTestHashtag,
                and_(
                    TrueTestHashtag.test_id == Testlar.id,
                    TrueTestHashtag.tag.is_(True)
                )
            )

            .outerjoin(
                TrueHashtag,
                TrueHashtag.id == TrueTestHashtag.hashtag_id
            )

            .outerjoin(
                savollar_count,
                savollar_count.c.test_id == Testlar.id
            )

            .where(
                Testlar.ispublic.is_(True)
            )

            .group_by(
                Testlar.id,
                savollar_count.c.savollar_soni
            )

            .having(
                score >= 0.5
            )

            .order_by(
                score.desc()
            )
            .limit(limit)
        )

        if last_score is not None:
            stmt = stmt.having(score <= last_score)
        
        result = await db.execute(stmt)
        rows = result.all()

        results = []
        # savollar_soni = 30
        for test, savollar_soni, hashtag_name, test_score in rows: 
            results.append({
                "test_id": test.test_id,
                "id": test.id,
                "nom": test.nom,
                "fan": test.fan,
                "tavsif": test.tavsif,
                "istime": test.istime,
                "time": test.time,
                "created": created_to_human_time(test.created),
                "hash_url": generate_hash_url(test.id, test.test_id),
                "savollar_soni": savollar_soni,
                "hashtag_names": hashtag_name,
                "score": float(test_score)
            })
        respon = {
            "results": results,
            "last_score": float(results[-1]["score"]) if results else None
        }
        print('\n\n\n', "1=>", respon, '\n\n\n')
    else:
        # Handle other search types if needed
        respon = {
            "results": [],
            "last_score": None
        }
        # print('\n\n\n', respon, '\n\n\n')
        print('\n\n\n', "2=>", respon, '\n\n\n')


    
    # Cache the result with the original search query
    # Use the full query as primary cache key
    # Only cache if we have results
    print('\n\n\n', "3=>", respon, '\n\n\n')

    if respon.get("results"):
        # Include last_score in cache key to handle pagination correctly
        last_score_str = str(last_score) if last_score is not None else "none"
        primary_cache_key = f"search:{data.text.lower()}:{limit}:{last_score_str}"
        await redis.set(primary_cache_key, respon, ex=3600)  # Cache for 1 hour
        
        # Store metadata for Redis Stack search
        await redis.client.hset(
            f"cache:{primary_cache_key}",
            mapping={
                "query": data.text.lower(),
                "cache_key": primary_cache_key,
                "limit": limit,
                "last_score": last_score_str,
            }
        )
    else:
        print(f"Not caching empty result for: {data.text.lower()}")  # Debug

    return respon
