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
# import fuzzy
from sqlalchemy import distinct
import json
from ..models.testlar import Testlar, Savollar, TestlarHashtag, Variantlar, Hashtag
from ..schemas.testlar import TestlarCreate, TestlarUpdate, SearchTestRequest, GetPublicTestlarRequest
from ..redis.redis import get_redis
from redis.commands.search.query import Query, NumericFilter
from rapidfuzz import process, fuzz

from ...app.task import generate_hashtags
# from ..app.crud. import created_to_human_time
async def get_id_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(Testlar.id).where(Testlar.username == username))
    return result.scalar_one_or_none()

async def create_testlar(db: AsyncSession, testlar: TestlarCreate, user_id: int):
    # redis = await get_redis()
    test_id=await generate_unique_test_id(db)
    test_code=await generate_unique_test_code(db)
    test_key=await generate_unique_test_key(db)
    db_testlar = Testlar(
        user_id=user_id,
        nom=testlar.nom,
        fan=testlar.fan,
        tavsif=testlar.tavsif,
        test_id=test_id,
        test_code=test_code,
        test_key=test_key,
        ispublic=testlar.ispublic,
        istime=testlar.istime,
        time=testlar.time * 60 if testlar.istime else 60 * 60 * 60 * 24 * 365
    )
    db.add(db_testlar)
    await db.commit()
    await db.refresh(db_testlar)
    redis = await get_redis()
    await redis.hset(
        f'public_tests:{db_testlar.id}',
        mapping={
                "test_id": test_id,
                "id_test": db_testlar.id,
                "nom": db_testlar.nom,
                "fan": db_testlar.fan,
                "tavsif": db_testlar.tavsif, 
                "istime": f'{db_testlar.istime}',
                "time": db_testlar.time * 60,
                "created": created_to_human_time(db_testlar.created),
                'score' : int(db_testlar.created.timestamp()),
                "hash_url": generate_hash_url(db_testlar.id, db_testlar.test_id),
                "savollar_soni": 0,
                "hashtags": "|",
                "hashtag": ' '
            }
    )
    await redis.expire(f'public_tests:{db_testlar.id}', int(db_testlar.time) * 60)
    # redis = await get_redis()
    # # Invalidate search cache when new test is created
    # if testlar.ispublic:
    #     # Delete all search cache keys safely using SCAN
    #     await redis.delete_by_pattern("search:*")
    generate_hashtags.delay(db_testlar.id, db_testlar.nom, db_testlar.fan, db_testlar.tavsif)
    return {'message': "Test muvaffaqiyatli yaratildi", "status": True, 'user':True}

async def create_test_with_json(db: AsyncSession, testlar: TestlarCreate, user_id: int):
    test_id=await generate_unique_test_id(db)
    test_code=await generate_unique_test_code(db)
    test_key=await generate_unique_test_key(db)
    db_testlar = Testlar(
        user_id=user_id,
        nom=testlar.nom,
        fan=testlar.fan,
        tavsif=testlar.tavsif,
        test_id=test_id,
        test_code=test_code,
        test_key=test_key,
        ispublic=testlar.ispublic,
        istime=testlar.istime,
        time=testlar.time * 60 if testlar.istime else 60 * 60 * 60 * 24 * 365
    )

    db.add(db_testlar)
    await db.flush()  # id hosil bo'ladi

    for savol in testlar.savollar:
        db_savol = Savollar(
            test_id=db_testlar.id,
            text=savol["savol"],
            # svg_json=testlar.svg_json if "svg_json" in testlar else json.dumps({"elements": []}),
            svg_json=json.dumps(savol["svg_json"]) if "svg_json" in savol else json.dumps({"elements": []}),
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
    await redis.hset(
        f'public_tests:{db_testlar.id}',
        mapping={
                "test_id": test_id,
                "id_test": db_testlar.id,
                "nom": db_testlar.nom,
                "fan": db_testlar.fan,
                "tavsif": db_testlar.tavsif, 
                "istime": f'{db_testlar.istime}',
                "time": db_testlar.time * 60,
                "created": created_to_human_time(db_testlar.created),
                'score' : int(db_testlar.created.timestamp()),
                "hash_url": generate_hash_url(db_testlar.id, db_testlar.test_id),
                "savollar_soni": len(testlar.savollar),
                "hashtags": "|",
                "hashtag": ' '
            }
    )
    await redis.expire(f'public_tests:{db_testlar.id}', int(db_testlar.time) * 60)

    
    
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

async def get_public_testlar(db: AsyncSession, data: GetPublicTestlarRequest, limit: int = 100):
    # result = await db.execute(
    #     select(Testlar).where(Testlar.ispublic == True).offset(skip).limit(limit)
    # )

    last_score = data.last_score
    last_id = data.last_id
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
            data = await search_testlar(db, request, self=True)
            respon.append({
                'category': cate['cate'],
                'results': data,
                'is_category': True
            })
    if last_score:
        query = (
            Query('*')
            .add_filter(NumericFilter("score", float("-inf"), last_score))
            .paging(1, limit)
            .sort_by('score', asc=False)
            )
    else:
        query = (
            Query('*')
            .paging(0, limit)
            .sort_by('score', asc=False)
            )
    cashe_result = await redis.ft('ind:public_tests').search(query)
    # print('\n\n\n', cashe_result, '\n\n\n')
    if cashe_result.docs and len(cashe_result.docs)> 0:
        res = []
        next_last_score = None
        next_last_id = None
        for test in cashe_result.docs:
            next_last_score = test.score
            next_last_id = test.id_test
            res.append({
                
            'test_id': test.test_id ,
            'id': test.id_test,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            # 'key': test.test_key,
            # 'ispublic': test.ispublic,
            'istime': test.istime,
            'time': test.time,
            'score': test.score,
            'created': test.created,
            'hash_url': generate_hash_url(int(test.id_test), str(test.test_id)),
            'savollar_soni': test.savollar_soni,
            'hashtag_names': test.hashtag.split()
        
            })
        cashe = {
                'category': 'Boshqa testlar',
                # 'is_category': False,
                'results': res,
                'last_score': int(next_last_score) ,
                # if len(cashe_result.docs) == limit else None,
                'last_id': int(next_last_id),
                #   if len(cashe_result.docs) == limit else None,
                'is_category': False
            }
        if last_score:
            print('\n\n\n', 'cashe public', '\n\n\n')
            return cashe
            
        respon.append(cashe)
            # if not last_score:
        cates.append({
            'cate': 'Boshqa testlar',
            'is_category': False,
        })
        respon.append({'cates': cates})
        # respon['Boshqa testlar'] = response
        return respon

    print('\n\n\n', 'dbdan olindi', '\n\n\n')
    
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
    # if last_score:
    #     stmt = stmt.having(score < last_score)

    if last_score is not None and last_id is not None:
        stmt = stmt.having(
            and_(
                score >= 0.1,
                or_(
                    score < last_score,
                    and_(
                        score == last_score,
                        Testlar.id < last_id
                    )
                )
            )
        )

    stmt = (
        stmt
        .group_by(Testlar.id)
        .order_by(score.desc() , Testlar.id.desc())
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
        await redis.sadd('hashtags', *hashtag_name)
        await redis.expire('hashtags', 3600)
        # for hashtag in hashtag_name:
        #     if await redis.exists(f'hashtag:{hashtag}'):
        #         continue
        #     await redis.hset(f'hashtag:{hashtag}', mapping={
        #         'hashtag':hashtag
        #     })
        if await redis.exists(f'public_tests:{test.id}'):
            continue
        await redis.hset(
            f'public_tests:{test.id}',
            mapping={
                'test_id': test.test_id ,
                'id_test': test.id,
                'nom': test.nom,
                'fan': test.fan,
                'tavsif': test.tavsif,
                # 'key': test.test_key,
                # 'ispublic': test.ispublic,
                'istime': f'{test.istime}',
                'time': test.time,
                'score': int(test_score),
                'created': created_to_human_time(test.created),
                'hash_url': generate_hash_url(test.id, str(test.test_id)),
                'savollar_soni': savollar_soni,
                'hashtags': "|".join(hashtag_name),
                'hashtag': " ".join(hashtag_name),
            }
        )
        await redis.expire(f'public_tests:{test.id}', int(test.time))

        # await redis.hset(f'')

    next_last_score = None
    next_last_id = None
    print('\n\n\n', results, '\n\n\n')

    if not results:
        return {'results': [], 'last_score': None}
    if len(results) == limit:
        next_last_score = results[-1]['score'] if results else None
        next_last_id = results[-1]['id'] if results else None
    # else:
    #     return {'results': [], 'last_score': None}
    response = {
        'results': results,
        'last_score': next_last_score,
        'last_id': next_last_id
    
    }
    # await redis.set(f"public_tests:{last_score}:{limit}", json.dumps(response), ex=3600)  # Cache for 1 hour
    data = {
        'category': 'Boshqa testlar',
        # 'is_category': False,
        'results': results,
        'last_score': next_last_score,
        'last_id': next_last_id,
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


async def search_testlar(db: AsyncSession, data, limit: int = 4, self: bool = False):
    
    """Fallback to DB search when Redis hashtags are not available"""
    redis = await get_redis()
    words = data.text.lower().split()

    last_score = None
    if data.last_score:
        last_score = data.last_score
    last_id = None
    if data.last_id:
        last_id = data.last_id
    # if data.last:
    #     last = data.last
    # else:
    #     last = None
    # for word in words:
    if self == False:
        hashtags = await redis.smembers('hashtags')
        hashtag = set()
        for word in words:
            matches = process.extract(
                word,
                hashtags,
                scorer=fuzz.WRatio,
                limit=5,
                score_cutoff=20,
            )
            print('\n\n\n', 'matches=>', matches, '\n\n\n')
            hashtag.update(match[0] for match in matches)
            # hashtag = [match[0] for match in matches]
        
        print('\n\n\n', 'hashtag=>', hashtag, '\n\n\n')
        search = f'@hashtags:{{{'|'.join(hashtag)}}}' 
            
    else:
        search = f'@hashtags:{{{'|'.join(words)}}}' 
        
    # search = '|'.join(search)
    print('\n\n\n', search, '\n\n\n')
    if not last_score:
        query = (
            Query(search)
            .paging(0 ,limit)
            .sort_by('score', asc=False)
        )
    else:
        query = (
            Query(search)
            .add_filter(NumericFilter("score", float("-inf"), last_score))
            .paging(1 ,limit)
            .sort_by('score', asc=False)
        )
    cashe_result = await redis.ft('ind:public_tests').search(query)
    print('\n\n\n', 'cashe_results=>', cashe_result, '\n\n\n')
    results = []
    if cashe_result.docs and len(cashe_result.docs)>0:
        next_last_score = None
        next_last_id = None
        for index, test in enumerate(cashe_result.docs):
            next_last_score = test.score
            next_last_id = test.id_test
            # last = None
            # if index == len(cashe_result.docs)-1:
            #     hashtags = test.hashtag.split()
            #     s = 0
            #     print('\n\n\n', hashtags, '\n\n\n')
            #     for hashtag in hashtags:
            #         for word in words:
            #             s += fuzz.ratio(word, hashtag)
            #     last = s/100 * 2
            results.append({
                
            'test_id': test.test_id ,
            'id': test.id_test,
            'nom': test.nom,
            'fan': test.fan,
            'tavsif': test.tavsif,
            # 'key': test.test_key,
            # 'ispublic': test.ispublic,
            'istime': test.istime,
            'time': test.time,
            'score': test.score,
            'created': test.created,
            'hash_url': generate_hash_url(int(test.id_test), str(test.test_id)),
            'savollar_soni': test.savollar_soni,
            'hashtag_names': test.hashtag.split()
        
            })
        response = {
                "results": results,
                "last_score": float(results[-1]["score"]),
                'last_id': results[-1]["id"] ,
            }
            
        # respon['Boshqa testlar'] = response
        print('\n\n\n', 'cashe_search', '\n\n\n')
        # if len(results) == limit:
        return response
    
    # 1. HASHTAG QIDIRISH (Database search)
    print('\n\n\n', 'db search', '\n\n\n')
    # if last:
    #     last_score = last
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

    created_score = extract(
    'epoch',
    Testlar.created
        ).label("created_score")

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
            # score.label("score")
            created_score
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
        # .having(
        #     score >= 0.5
        # )
        .order_by(
            # score.desc(),
            created_score.desc(),
            Testlar.id.desc()
        )
        .limit(limit * 2)
    )
    if last_score is not None and last_id is not None:
        stmt = stmt.where(
            or_(
                created_score < last_score,
                and_(
                    created_score == last_score,
                    Testlar.id < last_id
                ),
                created_score > last_score
            )
        )

    result = await db.execute(stmt)
    rows = result.all()

    # results = []
    for test, savollar_soni, hashtag_name, test_score in rows: 
        new_test = {
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
                "score": int(test_score)
            }
        if last_score is not None and int(test_score) < last_score:
            results.append(new_test)
        elif last_score is None:
            results.append(new_test)
        

        if await redis.exists(f'public_tests:{test.id}'):
            continue
        pipe = redis.pipeline()
        pipe.hset(
            f'public_tests:{test.id}',
            mapping={
                "test_id": test.test_id,
                "id_test": test.id,
                "nom": test.nom,
                "fan": test.fan,
                "tavsif": test.tavsif, 
                "istime": f'{test.istime}',
                "time": test.time,
                "created": created_to_human_time(test.created),
                'score' : int(test_score),
                "hash_url": generate_hash_url(test.id, test.test_id),
                "savollar_soni": savollar_soni,
                "hashtags": "|".join(hashtag_name),
                "hashtag": ' '.join(hashtag_name)
            }
        )
        pipe.expire(f'public_tests:{test.id}', 3600)
        pipe.sadd('hashtags', *hashtag_name)
        await pipe.execute()

    print('\n\n\n', 'data=>', data, '\n\n\n')
    print('\n\n\n', 'results=>', results, '\n\n\n')
    response = {
        "results": results,
        "last_score": float(results[-1]["score"]) if len(results)==limit else None,
        'last_id': results[-1]["id"] if len(results)==limit else None
    }
    
    # Cache the result
    # await redis.set(cache_key, response, ex=3600)
    
    return response



async def update_test(db: AsyncSession, test: TestlarUpdate):
    update_data = test.model_dump(exclude_unset=True)
    print('\n\n\n', update_data, '\n\n\n')
    redis = await get_redis()
    result = await db.execute(
        update(Testlar).where((Testlar.id == test.id)  & (Testlar.test_key == test.key))
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
    # redis = await get_redis()
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
    # await redis.delete_by_pattern("search:*")
    # await redis.delete("public_tests")
    await db.commit()
    return result.rowcount > 0

