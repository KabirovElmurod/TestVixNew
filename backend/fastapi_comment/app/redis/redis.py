import json
from typing import Optional, Any
from redis.asyncio import Redis

redis = Redis(
    host='redis',
    port=6379,
    db=1,
    decode_responses=True
)

async def get_redis():
    return redis

async def get_room_messages(room_id: int, limit: int = 50):
    """Redisdan xabarlarni olish"""
    messages = await redis.lrange(f"room_messages:{room_id}", 0, limit - 1)
    return [json.loads(msg) for msg in messages]

async def add_room_message(room_id: int, message: dict):
    """Redisga xabar qo'shish"""
    await redis.lpush(f"room_messages:{room_id}", json.dumps(message))
    # TTL 1 soat
    await redis.expire(f"room_messages:{room_id}", 3600)

async def get_room_message_size(room_id: int) -> int:
    """Redisdagi xabarlarning o'lchamini olish (baytlarda)"""
    return await redis.memory_usage(f"room_messages:{room_id}") or 0

async def flush_room_messages_to_db(room_id: int, db_session):
    """Redisdagi xabarlarni DBga yozish"""
    from ..models.user import RoomMessage
    from sqlalchemy import insert

    messages = await redis.lrange(f"room_messages:{room_id}", 0, -1)
    if not messages:
        return

    message_dicts = [json.loads(msg) for msg in messages]

    # DBga yozish
    await db_session.execute(
        insert(RoomMessage).values(message_dicts)
    )
    await db_session.commit()

    # Redisdan tozalash
    await redis.delete(f"room_messages:{room_id}")