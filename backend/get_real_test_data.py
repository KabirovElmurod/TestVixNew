import hmac
import hashlib
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = "postgresql+asyncpg://testvixdocker:qoty_qouy_2006@db:5432/testvixdocker"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def generate_hash_url(id: int, test_code: str | int):
    """Hash URL generatsiya qilish (backend dagi bilan bir xil)"""
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{id}|{test_code}"
    hash_value = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hash_value

async def get_test_data():
    """Database'dan test ma'lumotlarini olish"""
    async with AsyncSessionLocal() as session:
        # Testlarni olish
        from fastapi_testlar.app.models.testlar import Testlar
        result = await session.execute(select(Testlar).limit(10))
        tests = result.scalars().all()
        
        print("=== Python Test Data (TEST_DATA) ===")
        print("TEST_DATA = [")
        for test in tests:
            hash_url = generate_hash_url(test.id, test.test_id)
            print(f"    {{'id': {test.id}, 'test_id': {test.test_id}, 'hash_url': '{hash_url}'}},")
        print("]")
        
        print(f"\nJami {len(tests)} ta test topildi")
        print("Bu ma'lumotlarni load_test_with_tokens.py dagi TEST_DATA ga nusxalang")

if __name__ == "__main__":
    asyncio.run(get_test_data())
