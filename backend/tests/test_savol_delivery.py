"""
finish_check_savol / get_savol_by_test_id refaktoringi uchun
solishtiruvchi (characterization) va birlik testlari.

get_savol_by_test_id -> SavolYetkazishXizmati (savol_delivery.py)

DB va Redis soxta (fake) obyektlar bilan almashtirilgan —
hech qanday tashqi xizmat chaqirilmaydi.
"""

import asyncio
import importlib.util
import json
import os
import sys
import unittest
from contextlib import asynccontextmanager

# savol_delivery.py ni paket importsiz yuklaymiz
MODULE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "fastapi_savollar", "app", "crud", "savol_delivery.py",
)
spec = importlib.util.spec_from_file_location("savol_delivery", MODULE_PATH)
sd = importlib.util.module_from_spec(spec)
sys.modules["savol_delivery"] = sd  # dataclass uchun kerak
spec.loader.exec_module(sd)

SavolYetkazishXizmati = sd.SavolYetkazishXizmati
SavolQatori = sd.SavolQatori
TestInfo = sd.TestInfo
calculate_ttl = sd.calculate_ttl
parse_time = sd.parse_time


# ------------------------------------------------------------------
# Soxta obyektlar (fake)
# ------------------------------------------------------------------

class FakeLock:
    def __init__(self):
        self.entered = False

    async def __aenter__(self):
        self.entered = True
        return self

    async def __aexit__(self, *args):
        return False


class FakeKesh:
    """Redis.asyncio.Redis ning minimal soxta nusxasi.

    Semantika: zadd score=int(id) bo'yicha saralangan,
    rpush/lrange/lpos/ltrim — Python list kabi (LRANGE stop inclusive).
    """

    def __init__(self):
        self.strings = {}   # get/set
        self.hashes = {}    # hmget
        self.zsets = {}     # zadd/zrange  {key: {member: score}}
        self.lists = {}     # rpush/lrange/lpos/llen/ltrim
        self.locks = {}

    async def hmget(self, key, *fields):
        h = self.hashes.get(key, {})
        return [h.get(f) for f in fields]

    async def zrange(self, key):
        z = self.zsets.get(key, {})
        return [m for m, _ in sorted(z.items(), key=lambda kv: kv[1])]

    async def exists(self, key):
        return int(
            key in self.strings or key in self.lists or key in self.zsets
        )

    async def llen(self, key):
        return len(self.lists.get(key, []))

    async def lrange(self, key, start, stop):
        lst = self.lists.get(key, [])
        # Redis: stop inclusive, manfiy indekslar oxiridan
        n = len(lst)
        s = start if start >= 0 else max(n + start, 0)
        e = stop if stop >= 0 else n + stop
        if e >= n:
            e = n - 1
        if s > e or s >= n:
            return []
        return lst[s:e + 1]

    async def lpos(self, key, value):
        lst = self.lists.get(key, [])
        try:
            return lst.index(value)
        except ValueError:
            return None

    async def get(self, key):
        return self.strings.get(key)

    def lock(self, name):
        return FakeLock()

    async def init_public_index(self, key, ids, ttl):
        self.zsets[key] = {str(i): int(i) for i in ids}
        ready = key.replace(":savollar", ":savollar:ready")
        self.strings[ready] = "1"

    async def create_user_order(self, key, ids, ttl):
        self.lists[key] = list(ids)

    async def set_question(self, key, payload, ttl):
        self.strings[key] = payload

    async def trim_list(self, key, start, stop):
        self.lists[key] = self.lists.get(key, [])[start:stop + 1]


class FakeRepo:
    """SavollarRepo protokolining xotira implementatsiyasi."""

    def __init__(self, test_info=None, question_ids=None, questions=None):
        self.test_info = test_info
        self.question_ids = question_ids or []
        self.questions = questions or {}
        self.get_questions_calls = 0
        self.get_test_calls = 0

    async def get_test(self, test_id):
        self.get_test_calls += 1
        return self.test_info

    async def get_question_ids(self, test_id):
        return list(self.question_ids)

    async def get_questions(self, test_id, ids):
        self.get_questions_calls += 1
        return [self.questions[i] for i in ids if i in self.questions]


class FakeHasher:
    """HashXizmat protokolining deterministik implementatsiyasi."""

    def hash_savol(self, savol_id, test_id):
        return f"SH_{savol_id}_{test_id}"

    def hash_variant(self, variant_id, savol_hash):
        return f"VH_{variant_id}_{savol_hash}"


def make_question(qid, n_variants=4):
    variants = [
        {"id": qid * 100 + i, "text": f"v{qid}_{i}", "is_true": i == 0}
        for i in range(n_variants)
    ]
    return SavolQatori(
        id=qid, test_id=1, text=f"Savol {qid}",
        svg_json=None, variantlar=variants,
    )


def build(kesh=None, repo=None, shuffle=False):
    return SavolYetkazishXizmati(
        kesh=kesh or FakeKesh(),
        repo=repo or FakeRepo(),
        hasher=FakeHasher(),
        shuffle_correct_answer=shuffle,
    )


# ------------------------------------------------------------------
# Testlar
# ------------------------------------------------------------------

class TestSolishtiruvchi(unittest.IsolatedAsyncioTestCase):
    """Kamida 5 stsenariy — eski funksiyaning kutilgan xatti-harakati."""

    async def test_01_testda_savollar_yoq(self):
        """Bo'sh test -> bo'sh javob."""
        svc = build(repo=FakeRepo(
            test_info=TestInfo(1), question_ids=[]))
        res = await svc.get_savollar(user_id=1, test_id=1)
        self.assertEqual(res, {"savollar": [], "last_id": None})

    async def test_02_normal_pagination(self):
        """6 savol, limit=4 -> 4 + 2 sahifa, tartib barqaror."""
        questions = {i: make_question(i) for i in range(1, 7)}
        repo = FakeRepo(
            test_info=TestInfo(1, time=None, istime=None),
            question_ids=[1, 2, 3, 4, 5, 6],
            questions=questions,
        )
        kesh = FakeKesh()
        svc = build(kesh=kesh, repo=repo)

        p1 = await svc.get_savollar(user_id=7, test_id=1, limit=4)
        self.assertEqual(len(p1["savollar"]), 4)
        self.assertIsNotNone(p1["last_id"])

        p2 = await svc.get_savollar(
            user_id=7, test_id=1, last_id=p1["last_id"], limit=4)
        self.assertEqual(len(p2["savollar"]), 2)
        self.assertIsNone(p2["last_id"])

        # tartib barqaror: birinchi sahifa qayta so'ralsa xuddi shu
        p1_again = await svc.get_savollar(
            user_id=7, test_id=1, last_id=None, limit=4)
        ids1 = [s["id"] for s in p1["savollar"]]
        ids1b = [s["id"] for s in p1_again["savollar"]]
        self.assertEqual(ids1, ids1b)

        # is_true clientga yuborilmaydi
        for s in p1["savollar"] + p2["savollar"]:
            for v in s["variantlar"]:
                self.assertNotIn("is_true", v)
                self.assertIn("v_hash", v)
                self.assertIn("savol_hash", s)

    async def test_03_question_count_limiti(self):
        """question_count=3 -> userga faqat 3 ta savol."""
        questions = {i: make_question(i) for i in range(1, 11)}
        repo = FakeRepo(
            test_info=TestInfo(1, question_count=3),
            question_ids=list(range(1, 11)),
            questions=questions,
        )
        svc = build(repo=repo)
        res = await svc.get_savollar(user_id=3, test_id=1, limit=50)
        self.assertEqual(len(res["savollar"]), 3)

    async def test_04_kesh_hit_dbga_bormaydi(self):
        """savol:{id} keshda bo'lsa repo.get_questions chaqirilmaydi."""
        questions = {i: make_question(i) for i in range(1, 4)}
        repo = FakeRepo(
            test_info=TestInfo(1), question_ids=[1, 2, 3],
            questions=questions)
        kesh = FakeKesh()
        svc = build(kesh=kesh, repo=repo)

        await svc.get_savollar(user_id=5, test_id=1, limit=4)
        calls_after_first = repo.get_questions_calls
        self.assertEqual(calls_after_first, 1)

        # yangi servis, lekin shu kesh — DB so'rovi oshmasligi kerak
        svc2 = SavolYetkazishXizmati(
            kesh=kesh, repo=repo, hasher=FakeHasher())
        await svc2.get_savollar(user_id=5, test_id=1, limit=4)
        self.assertEqual(repo.get_questions_calls, calls_after_first)

    async def test_05_noto_gri_cursor(self):
        """Ro'yxatda yo'q last_id -> bo'sh javob."""
        questions = {i: make_question(i) for i in range(1, 4)}
        repo = FakeRepo(
            test_info=TestInfo(1), question_ids=[1, 2, 3],
            questions=questions)
        svc = build(repo=repo)
        await svc.get_savollar(user_id=9, test_id=1, limit=4)
        res = await svc.get_savollar(user_id=9, test_id=1,
                                     last_id=9999, limit=4)
        self.assertEqual(res, {"savollar": [], "last_id": None})

    async def test_06_limit_nol_default_4(self):
        """limit<=0 -> 4 ga tenglashtiriladi."""
        questions = {i: make_question(i) for i in range(1, 7)}
        repo = FakeRepo(
            test_info=TestInfo(1), question_ids=list(range(1, 7)),
            questions=questions)
        svc = build(repo=repo)
        res = await svc.get_savollar(user_id=2, test_id=1, limit=0)
        self.assertEqual(len(res["savollar"]), 4)

    async def test_07_vaqtli_test_ttl(self):
        """istime=True,time=60 -> kesh kalitlari 60s TTL bilan yoziladi
        (FakeKesh TTL'ni saqlamaydi, shuning uchun faqat xato yo'qligi
        va javob to'g'riligi tekshiriladi)."""
        questions = {i: make_question(i) for i in range(1, 3)}
        kesh = FakeKesh()
        kesh.hashes["public_tests:1"] = {"time": "60", "istime": "True"}
        repo = FakeRepo(
            test_info=TestInfo(1, time=60, istime=True),
            question_ids=[1, 2], questions=questions)
        svc = build(kesh=kesh, repo=repo)
        res = await svc.get_savollar(user_id=4, test_id=1, limit=4)
        self.assertEqual(len(res["savollar"]), 2)
        # 2 < limit(4) -> test tugagan, keyingi sahifa yo'q
        self.assertIsNone(res["last_id"])


class TestBirlik(unittest.TestCase):
    """Kamida 2 birlik testi — kichik sof funksiyalar."""

    def test_ttl_vaqtli_va_vaqtsiz(self):
        self.assertEqual(calculate_ttl(60, True), 60)
        self.assertEqual(calculate_ttl(None, True), 5 * 60 * 60)
        self.assertEqual(calculate_ttl(30, False), 5 * 60 * 60)
        self.assertEqual(calculate_ttl(None, None), 5 * 60 * 60)

    def test_parse_time(self):
        self.assertEqual(parse_time("60"), 60)
        self.assertEqual(parse_time(60), 60)
        self.assertIsNone(parse_time(None))
        self.assertIsNone(parse_time("abc"))

    def test_shuffle_deterministik_va_tozalaydi(self):
        """shuffle_correct_answer=True: variant matnlari saqlanadi,
        is_true baribir olib tashlanadi."""
        svc = build(shuffle=True)
        q = {"id": 1, "variantlar": [
            {"id": 11, "text": "a", "is_true": True},
            {"id": 12, "text": "b", "is_true": False},
            {"id": 13, "text": "c", "is_true": False},
        ]}
        ordered = [q]
        svc._javoblarni_aralashtirish(ordered, user_id=42,
                                      base_position=0)
        svc._javoblarni_tozalash(ordered)
        texts = sorted(v["text"] for v in ordered[0]["variantlar"])
        self.assertEqual(texts, ["a", "b", "c"])
        for v in ordered[0]["variantlar"]:
            self.assertNotIn("is_true", v)


if __name__ == "__main__":
    unittest.main(verbosity=2)
