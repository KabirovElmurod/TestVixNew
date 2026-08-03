import redis.asyncio as redis
import json
from typing import Optional, Any

class RedisClient:
    def __init__(self, host='redis', port=6379, db=0):
        self.redis_pool = redis.ConnectionPool(host=host, port=port, db=db, decode_responses=True)
        self.client = redis.Redis(connection_pool=self.redis_pool)

    async def get(self, key: str) -> Optional[Any]:
        data = await self.client.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: Any, ex: int = 3600): # 1 soatlik kesh
        await self.client.set(key, json.dumps(value, default=str), ex=ex)

    async def delete(self, key: str):
        await self.client.delete(key)

redis_client = RedisClient()

async def get_redis():
    return redis_client