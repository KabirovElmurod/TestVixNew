import json
from typing import Optional, Any
from redis.asyncio import Redis
from redis.commands.search.field import (
    NumericField,
    TagField,
    TextField,
    VectorField
)

from redis.commands.search.index_definition import (
    IndexDefinition, 
    IndexType
)
redis = Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
)

# 'test_id': test.test_id ,
#             'id': test.id,
#             'nom': test.nom,
#             'fan': test.fan,
#             'tavsif': test.tavsif,
#             # 'key': test.test_key,
#             # 'ispublic': test.ispublic,
#             'istime': test.istime,
#             'time': test.time,
#             'score': int(test_score),
#             'created': created_to_human_time(test.created),
#             'hash_url': generate_hash_url(test.id, str(test.test_id)),
#             'savollar_soni': savollar_soni,
#             'hashtag_names': hashtag_name

async def create_index_public_test_redis():
    indexs = await redis.execute_command('FT._LIST')
    if 'ind:public_tests' in indexs:
        return
        # await redis.execute_command('FT.DROP INDEX ind:public_tests')
    
    await redis.ft('ind:public_tests').create_index(
        [
            NumericField('test_id'),
            NumericField('id_test'),
            TextField('nom'),
            TextField('fan'),
            TextField('tavsif'),
            TextField('hash_url'),
            TagField('istime'),
            NumericField('time'),
            NumericField('score'),
            NumericField('savollar_soni'),
            TextField('created'),
            NumericField('cashe_created'),
            TagField('hashtags', separator="|"),
            TextField('hashtag')
        ],
        definition=IndexDefinition(
            prefix=['public_tests:'], 
            index_type=IndexType.HASH
            )
    )

async def create_index_hashtag_redis():
    indexs = await redis.execute_command('FT._LIST')
    if 'ind:public_tests' in indexs:
        return

    await redis.ft('ind:hashtags').create_index(
        [
            TextField('hashtag')
        ],
        definition = IndexDefinition(
            prefix=['hashtag:'],
            index_type=IndexType.HASH
        )
    )

    

async def get_redis():
    return redis