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


async def set_group_session_state(session_id: int, state: dict):
    """Guruh test sessiyasi holatini Redisga saqlash"""
    await redis.hset(f"group_session:{session_id}", mapping=state)
    await redis.expire(f"group_session:{session_id}", 7200)  # 2 soat TTL


async def get_group_session_state(session_id: int) -> Optional[dict]:
    """Guruh test sessiyasi holatini Redisdan olish"""
    state = await redis.hgetall(f"group_session:{session_id}")
    return state if state else None


async def set_user_progress(session_id: int, user_id: int, progress: dict):
    """Foydalanuvchi progressini Redisga saqlash"""
    await redis.hset(f"user_progress:{session_id}", str(user_id), json.dumps(progress))
    await redis.expire(f"user_progress:{session_id}", 7200)


async def get_user_progress(session_id: int, user_id: int) -> Optional[dict]:
    """Foydalanuvchi progressini Redisdan olish"""
    progress = await redis.hget(f"user_progress:{session_id}", str(user_id))
    return json.loads(progress) if progress else None


async def get_all_users_progress(session_id: int) -> dict:
    """Barcha foydalanuvchilar progressini olish"""
    all_progress = await redis.hgetall(f"user_progress:{session_id}")
    return {k: json.loads(v) for k, v in all_progress.items()} if all_progress else {}


async def delete_group_session(session_id: int):
    """Guruh sessiyasini Redisdan o'chirish"""
    await redis.delete(f"group_session:{session_id}")
    await redis.delete(f"user_progress:{session_id}")