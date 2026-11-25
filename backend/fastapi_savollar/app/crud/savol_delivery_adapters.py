"""
SavolYetkazishXizmati uchun real adapterlar:
- RedisSavollarKesh   -> redis.asyncio.Redis
- SqlAlchemySavollarRepo -> AsyncSession + Testlar/Savollar/Variantlar
- FuncHashXizmat      -> crud/func.py dagi generate_hash_*

Bu fayl faqat production'da ishlaydi; birlik testlar unga
murojaat qilmaydi (servis savol_delivery.py ga bog'liq).
"""

from __future__ import annotations

import json
from contextlib import asynccontextmanager

from sqlalchemy import select, func

from ..models.savollar import Savollar, Variantlar, Testlar
from .func import generate_hash_savol, generate_hash_url
from .savol_delivery import SavolQatori, TestInfo


class RedisSavollarKesh:
    """SavollarKesh protokolining Redis implementatsiyasi."""

    def __init__(self, redis):
        self.redis = redis

    async def hmget(self, key, *fields):
        return await self.redis.hmget(key, *fields)

    async def zrange(self, key):
        return await self.redis.zrange(key, 0, -1)

    async def exists(self, key):
        return await self.redis.exists(key)

    async def llen(self, key):
        return await self.redis.llen(key)

    async def lrange(self, key, start, stop):
        return await self.redis.lrange(key, start, stop)

    async def lpos(self, key, value):
        return await self.redis.lpos(key, value)

    async def get(self, key):
        return await self.redis.get(key)

    def lock(self, name):
        return self.redis.lock(name, timeout=30, blocking_timeout=10)

    async def init_public_index(self, key, ids, ttl):
        pipe = self.redis.pipeline()
        pipe.zadd(key, {str(i): int(i) for i in ids})
        pipe.expire(key, ttl)
        pipe.set(key.replace(":savollar", ":savollar:ready"), 1, ex=ttl)
        await pipe.execute()

    async def create_user_order(self, key, ids, ttl):
        pipe = self.redis.pipeline()
        pipe.rpush(key, *ids)
        pipe.expire(key, ttl)
        await pipe.execute()

    async def set_question(self, key, payload, ttl):
        await self.redis.set(key, payload, ex=ttl)

    async def trim_list(self, key, start, stop):
        await self.redis.ltrim(key, start, stop)


class SqlAlchemySavollarRepo:
    """SavollarRepo protokolining PostgreSQL implementatsiyasi."""

    def __init__(self, db):
        self.db = db

    async def get_test(self, test_id: int):
        result = await self.db.execute(
            select(Testlar).where(Testlar.id == test_id)
        )
        row = result.scalars().first()
        if not row:
            return None
        return TestInfo(
            test_id=row.id,
            time=row.time,
            istime=row.istime,
            question_count=row.question_count,
        )

    async def get_question_ids(self, test_id: int):
        result = await self.db.execute(
            select(Savollar.id)
            .where(Savollar.test_id == test_id)
            .order_by(Savollar.id.asc())
        )
        return list(result.scalars().all())

    async def get_questions(self, test_id: int, ids: list[int]):
        result = await self.db.execute(
            select(
                Savollar.id,
                Savollar.test_id,
                Savollar.text,
                Savollar.svg_json,
                func.json_agg(
                    func.json_build_object(
                        "id", Variantlar.id,
                        "text", Variantlar.text,
                        "is_true", Variantlar.is_true,
                    )
                ).label("variantlar"),
            )
            .join(Variantlar, Variantlar.savol_id == Savollar.id)
            .where(Savollar.id.in_(ids), Savollar.test_id == test_id)
            .group_by(
                Savollar.id, Savollar.test_id,
                Savollar.text, Savollar.svg_json,
            )
        )
        return [
            SavolQatori(
                id=r.id, test_id=r.test_id, text=r.text,
                svg_json=r.svg_json, variantlar=r.variantlar or [],
            )
            for r in result.all()
        ]


class FuncHashXizmat:
    """HashXizmat protokolining crud/func.py asosidagi implementatsiyasi."""

    def hash_savol(self, savol_id: int, test_id: int) -> str:
        return generate_hash_savol(savol_id, test_id)

    def hash_variant(self, variant_id: int, savol_hash: str) -> str:
        return generate_hash_url(variant_id, savol_hash)


def build_service(db, redis, temp_answer_mode: bool = False):
    """Production da service ni real adapterlar bilan yig'adi."""
    from .savol_delivery import SavolYetkazishXizmati

    return SavolYetkazishXizmati(
        kesh=RedisSavollarKesh(redis),
        repo=SqlAlchemySavollarRepo(db),
        hasher=FuncHashXizmat(),
        shuffle_correct_answer=temp_answer_mode,
    )
