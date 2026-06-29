# test_id hosil qilish ketma-ket counter bo'yicha. oxirgisini dbdan olib counter qilib olish kerak. test_code va test_key esa random 8 ta harf va raqam bo'lishi kerak. test_id, test_code va test_key unique bo'lishi kerak
from datetime import datetime, timezone

from django import db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.testlar import Testlar
from ..wrong import wrong
import random
import string
import secrets

import hmac
import hashlib

async def get_test_id_counter(db: AsyncSession):
    result = await db.execute(select(Testlar).order_by(Testlar.id.desc()).limit(1))
    last_testlar = result.scalar_one_or_none()
    if last_testlar:
        return last_testlar.test_id
    return None

async def generate_unique_test_id(db: AsyncSession):
    counter = await get_test_id_counter(db)
    if counter is None:
        return 50550
    return int(counter) + 1
# test_code test_id ni hash qilish orqali ham hosil qilish mumkin edi, lekin bu usulda test_code ni oldindan bilib bo'lmaydi, shuning uchun random 8 ta harf va raqam hosil qilish usulini tanladim
async def generate_unique_test_code(db: AsyncSession):
    # return 
    while True:
        code = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        result = await db.execute(select(Testlar).where(Testlar.test_code == code))
        existing_code = result.scalar_one_or_none()
        if not existing_code:
            # dbda bunday test_code yo'qligini tekshirish
            return code
        # dbda bunday test_code bor-yo'qligini tekshirish
        # agar bunday test_code bo'lmasa, uni qaytarish
        # agar bunday test_code bo'lsa, yangi code hosil qilish
        # return code
async def generate_unique_test_key(db: AsyncSession):
    # return 
    while True:
        key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
        result = await db.execute(select(Testlar).where(Testlar.test_key == key))
        existing_key = result.scalar_one_or_none()
        if not existing_key:
            # dbda bunday test_key yo'qligini tekshirish
            return key
        # dbda bunday test_key bor-yo'qligini tekshirish
        # agar bunday test_key bo'lmasa, uni qaytarish
        # agar bunday test_key bo'lsa, yangi key hosil qilish
        # return key


def created_to_human_time(created): # soniya, daqiqa, soat, kun, oy, yil
    now = datetime.now(timezone.utc) 
    diff = now - created
    seconds = diff.total_seconds()

    if seconds < 60:
        return f"{int(seconds)} soniya oldin"
    elif seconds < 3600:
        return f"{int(seconds // 60)} daqiqa oldin"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} soat oldin"
    elif seconds < 2592000:
        return f"{int(seconds // 86400)} kun oldin"
    elif seconds < 31536000:
        return f"{int(seconds // 2592000)} oy oldin"
    else:
        return f"{int(seconds // 31536000)} yil oldin"


def generate_hash_url(id: int, test_code: str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{id}|{test_code}"
    hash_value = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hash_value

def verify_hash_url(id: int, test_code: str, hash_value: str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{id}|{test_code}"
    expected_hash = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_hash, hash_value)

