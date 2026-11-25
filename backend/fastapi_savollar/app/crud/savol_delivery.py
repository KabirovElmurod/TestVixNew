"""
get_savol_by_test_id funksiyasining komponentlarga ajratilgan versiyasi.

Eski funksiya (crud/savollar.py:449, 576 qator, CC=62) 10 ta ishni
bitta funksiyada bajargan. Bu modul uni interfeyslar orqali
ajratilgan kichik komponentlarga bo'ladi.

Bog'liqliklar tashqaridan beriladi (Dependency Injection):
- kesh:   SavollarKesh   (Redis operatsiyalari)
- repo:   SavollarRepo   (PostgreSQL so'rovlari)
- hasher: HashXizmat     (javoblarni himoya qiluvchi HMAC)

 Modul tashqi xizmatlarni o'zi import qilmaydi — shuning uchun
 birlik testlar DB/Redis'siz ishlaydi.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from typing import Any, AsyncContextManager, Protocol


# ------------------------------------------------------------------
# Interfeyslar (shartnomalar)
# ------------------------------------------------------------------

class SavollarKesh(Protocol):
    """Required interface: savol kesh xizmati (Redis implementatsiyasi)."""

    async def hmget(self, key: str, *fields: str) -> list | None: ...
    async def zrange(self, key: str) -> list[str]: ...
    async def exists(self, key: str) -> int: ...
    async def llen(self, key: str) -> int: ...
    async def lrange(self, key: str, start: int, stop: int) -> list[str]: ...
    async def lpos(self, key: str, value: str) -> int | None: ...
    async def get(self, key: str) -> str | None: ...
    def lock(self, name: str) -> AsyncContextManager: ...
    async def init_public_index(self, key: str, ids: list[int], ttl: int) -> None: ...
    async def create_user_order(self, key: str, ids: list[str], ttl: int) -> None: ...
    async def set_question(self, key: str, payload: str, ttl: int) -> None: ...
    async def trim_list(self, key: str, start: int, stop: int) -> None: ...


class TestInfo:
    """Repository qaytaradigan test metadatasi (oddiy dataclass)."""

    def __init__(self, test_id: int, time=None, istime=None, question_count=None):
        self.id = test_id
        self.time = time
        self.istime = istime
        self.question_count = question_count


class SavolQatori:
    """DB'dan kelgan savol + variantlar qatori."""

    def __init__(self, id: int, test_id: int, text, svg_json, variantlar):
        self.id = id
        self.test_id = test_id
        self.text = text
        self.svg_json = svg_json
        self.variantlar = variantlar  # list[dict]: {"id","text","is_true"}


class SavollarRepo(Protocol):
    """Required interface: savollar ombori (PostgreSQL implementatsiyasi)."""

    async def get_test(self, test_id: int) -> TestInfo | None: ...
    async def get_question_ids(self, test_id: int) -> list[int]: ...
    async def get_questions(self, test_id: int, ids: list[int]) -> list[SavolQatori]: ...


class HashXizmat(Protocol):
    """Required interface: HMAC hashgenerator (crud/func.py mos)."""

    def hash_savol(self, savol_id: int, test_id: int) -> str: ...
    def hash_variant(self, variant_id: int, savol_hash: str) -> str: ...


# ------------------------------------------------------------------
# Kichik sof funksiyalar (strategiya/qiymat obyektlari)
# ------------------------------------------------------------------

def calculate_ttl(time, istime) -> int:
    """Vaqtli testda TTL = test vaqti, aks holda 5 soat."""
    if istime and time:
        return int(time)
    return 5 * 60 * 60


def parse_time(value):
    """Redis'dan kelgan time ni int ga aylantiradi."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# ------------------------------------------------------------------
# Asosiy servis — avvalgi 576 qatorli funksiyaning orkestratori
# ------------------------------------------------------------------

@dataclass
class SavolYetkazishXizmati:
    """
    Test savollarini user'ga berish bo'yicha biznes-mantiq.

    Kichik private metodlar har biri bitta mas'uliyat:
    - _test_vaqtini_olish
    - _global_indeksni_yaratish
    - _user_tartibini_yaratish
    - _question_count_filtri
    - _sahifalash
    - _savollarni_yuklash
    - _javoblarni_aralashtirish (TEMP_ANSWER_MODE)
    - _javoblarni_tozalash
    """

    kesh: SavollarKesh
    repo: SavollarRepo
    hasher: HashXizmat
    shuffle_correct_answer: bool = False  # TEMP_ANSWER_MODE

    # --- kalit nomlari (sehrli satrlar nomlangan) ---
    KALIT_TEST_META = "public_tests:{test_id}"
    KALIT_GLOBAL = "test:{test_id}:savollar"
    KALIT_READY = "test:{test_id}:savollar:ready"
    KALIT_USER = "user:{user_id}:test:{test_id}:savollar"
    KALIT_SAVOL = "savol:{id}"
    LOCK_GLOBAL = "lock:test:{test_id}:init"
    LOCK_USER = "lock:user:{user_id}:test:{test_id}:init"

    async def get_savollar(
        self,
        user_id: int,
        test_id: int,
        last_id: int | None = None,
        limit: int = 4,
    ) -> dict:
        """Asosiy kirish nuqtasi — eski get_savol_by_test_id bilan bir xil."""
        if limit <= 0:
            limit = 4
        limit = min(limit, 50)

        time_, istime = await self._test_vaqtini_olish(test_id)

        await self._global_indeksni_yaratish(test_id, time_, istime)

        question_count = await self._question_count_olish(test_id)

        await self._user_tartibini_yaratish(
            user_id, test_id, question_count, time_, istime
        )

        await self._question_count_filtri(user_id, test_id, question_count)

        sahifa, base_position = await self._sahifalash(
            user_id, test_id, last_id, limit
        )
        if sahifa is None:  # noto'g'ri cursor yoki test tugagan
            return {"savollar": [], "last_id": None}

        if not sahifa:
            return {"savollar": [], "last_id": None}

        savollar, missing_ids = await self._keshdan_olish(sahifa)

        new_questions = await self._dbdan_yuklash(
            test_id, missing_ids, time_, istime
        ) if missing_ids else {}

        ordered = self._tartibga_joylashtir(
            sahifa, savollar, new_questions
        )

        if not ordered:
            return {"savollar": [], "last_id": None}

        next_last_id = (
            None if len(sahifa) < limit else ordered[-1]["id"]
        )

        self._javoblarni_aralashtirish(
            ordered, user_id, base_position
        )

        self._javoblarni_tozalash(ordered)

        return {"savollar": ordered, "last_id": next_last_id}

    # ------------------------------------------------------------------
    # Komponent metodlar
    # ------------------------------------------------------------------

    async def _test_vaqtini_olish(self, test_id: int):
        """public_tests:{id} hash'dan time/istime o'qiydi."""
        meta = await self.kesh.hmget(
            self.KALIT_TEST_META.format(test_id=test_id),
            "time",
            "istime",
        )
        if meta:
            time_, istime = meta
        else:
            time_, istime = None, None
        return parse_time(time_), istime

    async def _global_indeksni_yaratish(self, test_id, time_, istime):
        """test:{id}:savollar ZSET'ini bir marta (lock ostida) yaratadi."""
        key = self.KALIT_GLOBAL.format(test_id=test_id)
        public_ids = await self.kesh.zrange(key)

        if public_ids:
            return

        async with self.kesh.lock(
            self.LOCK_GLOBAL.format(test_id=test_id)
        ):
            public_ids = await self.kesh.zrange(key)
            if public_ids:
                return

            db_ids = await self.repo.get_question_ids(test_id)
            if not db_ids:
                return

            if time_ is None:
                info = await self.repo.get_test(test_id)
                if info:
                    time_, istime = info.time, info.istime

            await self.kesh.init_public_index(
                key, db_ids, calculate_ttl(time_, istime)
            )
            # ready kaliti adapter ichida yoziladi

    async def _question_count_olish(self, test_id: int):
        info = await self.repo.get_test(test_id)
        return info.question_count if info else None

    async def _user_tartibini_yaratish(
        self, user_id, test_id, question_count, time_, istime
    ):
        """user:{uid}:test:{id}:savollar LIST'ini bir marta aralashtirib yaratadi."""
        key = self.KALIT_USER.format(user_id=user_id, test_id=test_id)

        if await self.kesh.exists(key):
            return

        async with self.kesh.lock(
            self.LOCK_USER.format(user_id=user_id, test_id=test_id)
        ):
            if await self.kesh.exists(key):
                return

            public_ids = await self.kesh.zrange(
                self.KALIT_GLOBAL.format(test_id=test_id)
            )
            if not public_ids:
                return

            user_ids = list(public_ids)
            random.shuffle(user_ids)

            if question_count and 0 < question_count < len(user_ids):
                user_ids = user_ids[:question_count]

            if time_ is None:
                info = await self.repo.get_test(test_id)
                if info:
                    time_, istime = info.time, info.istime

            await self.kesh.create_user_order(
                key, user_ids, calculate_ttl(time_, istime)
            )

    async def _question_count_filtri(self, user_id, test_id, question_count):
        """Test keyinroq question_count bilan kichraytirilgan bo'lsa,"
        " mavjud user ro'yxatlarini ham qisqartiradi."""
        if not question_count or question_count <= 0:
            return
        key = self.KALIT_USER.format(user_id=user_id, test_id=test_id)
        try:
            user_len = await self.kesh.llen(key)
            if user_len > question_count:
                await self.kesh.trim_list(key, 0, question_count - 1)
        except Exception:
            pass

    async def _sahifalash(self, user_id, test_id, last_id, limit):
        """
        Redis LIST ichidan cursor bo'yicha sahifa oladi.
        Qaytaradi: (id_list | None, base_position)
        None -> noto'g'ri cursor.
        """
        key = self.KALIT_USER.format(user_id=user_id, test_id=test_id)
        base_position = 0

        if last_id is None:
            cache_ids = await self.kesh.lrange(key, 0, limit - 1)
        else:
            position = await self.kesh.lpos(key, str(last_id))
            if position is None:
                return None, 0
            base_position = position + 1
            cache_ids = await self.kesh.lrange(
                key, position + 1, position + limit
            )
        return cache_ids, base_position

    async def _keshdan_olish(self, cache_ids):
        """savol:{id} kalitlaridan JSON o'qiydi; miss'larni qaytaradi."""
        savollar = []
        missing_ids = []

        for question_id in cache_ids:
            cached = await self.kesh.get(
                self.KALIT_SAVOL.format(id=question_id)
            )
            if cached:
                try:
                    savollar.append(json.loads(cached))
                except (json.JSONDecodeError, TypeError):
                    missing_ids.append(int(question_id))
            else:
                missing_ids.append(int(question_id))

        return savollar, missing_ids

    async def _dbdan_yuklash(self, test_id, missing_ids, time_, istime):
        """Cache miss bo'lgan savollarni DB'dan olib, keshga yozadi."""
        rows = await self.repo.get_questions(test_id, missing_ids)
        rows_map = {row.id: row for row in rows}
        ttl = calculate_ttl(time_, istime)

        new_questions = {}
        for question_id in missing_ids:
            row = rows_map.get(question_id)
            if row is None:
                continue

            savol_hash = self.hasher.hash_savol(row.id, test_id)

            variants = [
                {
                    "id": v["id"],
                    "text": v["text"],
                    "is_true": v.get("is_true"),
                    "v_hash": self.hasher.hash_variant(v["id"], savol_hash),
                }
                for v in (row.variantlar or [])
            ]

            new_savol = {
                "id": row.id,
                "test_id": row.test_id,
                "savol_hash": savol_hash,
                "text": row.text,
                "svg_json": row.svg_json,
                "variantlar": variants,
            }
            new_questions[row.id] = new_savol
            await self.kesh.set_question(
                self.KALIT_SAVOL.format(id=row.id),
                json.dumps(new_savol, ensure_ascii=False),
                ttl,
            )

        return new_questions

    def _tartibga_joylashtir(self, cache_ids, cached, new_questions):
        """Natijani Redis LIST tartibida qaytaradi (DB tartibi emas)."""
        all_questions = {s["id"]: s for s in cached}
        for q in new_questions.values():
            all_questions[q["id"]] = q

        ordered = []
        for question_id in cache_ids:
            q = all_questions.get(int(question_id))
            if q:
                ordered.append(q)
        return ordered

    def _javoblarni_aralashtirish(self, ordered, user_id, base_position):
        """TEMP_ANSWER_MODE: to'g'ri javobni deterministik joylashtiradi."""
        if not self.shuffle_correct_answer or not ordered:
            return

        h_str = str((user_id * 137 + 19) ** 40)
        h_len = len(h_str)

        for idx, savol in enumerate(ordered):
            variants = savol.get("variantlar") or []
            n = len(variants)
            if n <= 1:
                continue

            pos = base_position + idx
            target = (int(h_str[pos % h_len]) + pos) % n

            true_idx = next(
                (i for i, v in enumerate(variants) if v.get("is_true")),
                None,
            )
            if true_idx is None or true_idx == target:
                continue

            true_variant = variants.pop(true_idx)
            variants.insert(target, true_variant)

    def _javoblarni_tozalash(self, ordered):
        """is_true clientga leak qilinmasligi uchun olib tashlanadi."""
        for savol in ordered:
            for v in savol.get("variantlar") or []:
                v.pop("is_true", None)
