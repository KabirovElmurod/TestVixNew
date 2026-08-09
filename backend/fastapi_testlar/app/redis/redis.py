import redis.asyncio as redis
import json
from typing import Optional, Any

class RedisClient:
    def __init__(self, host='redis', port=6379, db=0):
        self.redis_pool = redis.ConnectionPool(host=host, port=port, db=db, decode_responses=True)
        self.client = redis.Redis(connection_pool=self.redis_pool)
    
    async def clear_all_data(self):
        """Clear all data from Redis"""
        try:
            await self.client.flushdb()
            print("All Redis data cleared on startup")
        except Exception as e:
            print(f"Error clearing Redis data: {e}")

    async def get(self, key: str) -> Optional[Any]:
        data = await self.client.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: Any, ex: int = 3600): # 1 soatlik kesh
        await self.client.set(key, json.dumps(value, default=str), ex=ex)

    async def delete(self, key: str):
        await self.client.delete(key)

    async def create_index(self):
        try:
            await self.client.execute_command(
                "FT.CREATE",
                "hashtags",
                "ON", "HASH",
                "PREFIX", "1", "hashtag:",
                "SCHEMA",
                "name", "TEXT"
            )
        except Exception as e:
            if "Index already exists" not in str(e):
                raise


    async def search_hashtag(self, text: str, limit: int = 10):
        return await self.client.execute_command(
            "FT.SEARCH",
            "hashtags",
            text,
            "LIMIT", "0", str(limit)
        )
    
    async def create_search_index(self):
        """Create search index for test results caching"""
        try:
            await self.client.execute_command(
                "FT.CREATE",
                "test_search",
                "ON", "HASH",
                "PREFIX", "1", "cache:",
                "SCHEMA",
                "query", "TEXT",
                "cache_key", "TAG",
                "limit", "NUMERIC",
                "last_score", "TAG"
            )
        except Exception as e:
            if "Index already exists" not in str(e):
                raise
    
    async def search_cached_results(self, query: str, limit: int, last_score: str = "none"):
        """Search cached test results using Redis Stack search"""
        try:
            # Use field-based search with @query:, exact limit match, and last_score
            # For TAG fields, use exact match
            search_query = f'@query:"{query}" @limit:{limit} @last_score:{last_score}'
            result = await self.client.execute_command(
                "FT.SEARCH",
                "test_search",
                search_query,
                "LIMIT", "0", "10"
            )
            # Ensure result is a list before returning
            if result is not None and not isinstance(result, list):
                return None
            return result
        except Exception as e:
            # If index doesn't exist, try to create it
            if "Unknown Index name" in str(e):
                await self.create_search_index()
                return await self.search_cached_results(query, limit, last_score)
            return None
    
    async def scan_keys(self, pattern: str, count: int = 100):
        """Scan keys safely instead of KEYS command"""
        keys = []
        async for key in self.client.scan_iter(match=pattern, count=count):
            keys.append(key)
        return keys
    
    async def delete_by_pattern(self, pattern: str):
        """Delete keys by pattern using SCAN"""
        keys = await self.scan_keys(pattern)
        if keys:
            await self.client.delete(*keys)

redis_client = RedisClient()

async def get_redis():
    return redis_client