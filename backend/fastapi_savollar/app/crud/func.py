# savol_id hosil qilish ketma-ket counter bo'yicha. oxirgisini dbdan olib counter qilib olish kerak. savol_code va savol_key esa random 8 ta harf va raqam bo'lishi kerak. savol_id, savol_code va savol_key unique bo'lishi kerak
from datetime import datetime, timezone

# from django import db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.savollar import Savollar
from ..wrong import wrong
import random
import string
import secrets
import hashlib
import hmac



async def get_savol_id_counter(db: AsyncSession):
    result = await db.execute(select(Savollar).order_by(Savollar.id.desc()).limit(1))
    last_savollar = result.scalar_one_or_none()
    if last_savollar:
        return last_savollar.savol_id
    return None

async def generate_unique_savol_id(db: AsyncSession):
    counter = await get_savol_id_counter(db)
    if counter is None:
        return 50550
    return int(counter) + 1
# savol_code savol_id ni hash qilish orqali ham hosil qilish mumkin edi, lekin bu usulda savol_code ni oldindan bilib bo'lmaydi, shuning uchun random 8 ta harf va raqam hosil qilish usulini tanladim
async def generate_unique_savol_code(db: AsyncSession):
    # return 
    while True:
        code = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        result = await db.execute(select(Savollar).where(Savollar.savol_code == code))
        existing_code = result.scalar_one_or_none()
        if not existing_code:
            # dbda bunday savol_code yo'qligini tekshirish
            return code
        # dbda bunday savol_code bor-yo'qligini tekshirish
        # agar bunday savol_code bo'lmasa, uni qaytarish
        # agar bunday savol_code bo'lsa, yangi code hosil qilish
        # return code
async def generate_unique_savol_key(db: AsyncSession):
    # return 
    while True:
        key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
        result = await db.execute(select(Savollar).where(Savollar.savol_key == key))
        existing_key = result.scalar_one_or_none()
        if not existing_key:
            # dbda bunday savol_key yo'qligini tekshirish
            return key
        # dbda bunday savol_key bor-yo'qligini tekshirish
        # agar bunday savol_key bo'lmasa, uni qaytarish
        # agar bunday savol_key bo'lsa, yangi key hosil qilish
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




def generate_hash_url(test_id: int, test_code: str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{test_id}|{test_code}"
    hash_value = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hash_value

def verify_hash_url(test_id: int | str, test_code: str, hash_value: str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    
    message = f"{test_id}|{test_code}"
    expected_hash = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    print('\n\n\n', 'id=', test_id, 'test_code=', test_code, 'hash_value=', hash_value, 'expected=', expected_hash, '\n\n\n')

    return hmac.compare_digest(expected_hash, hash_value)


def generate_hash_savol(savol_id:int, hash_url:str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{savol_id}|{hash_url}"
    hash_value = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hash_value

def verify_hash_savol(savol_id:int, hash_url:str, hash_value:str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{savol_id}|{hash_url}"
    expected_hash = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_hash, hash_value)

