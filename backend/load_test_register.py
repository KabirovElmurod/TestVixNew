import asyncio
import aiohttp
import random
import redis.asyncio as redis
from datetime import datetime

# Redis connection
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
 )

# Register endpoint URL (docker network ichida service nomi bilan)
REGISTER_URL = 'http://account:8000/auth/register'

async def register_user(session, user_data):
    """Bitta userni register qilish va tokenni olish"""
    try:
        async with session.post(
            REGISTER_URL,
            json=user_data,
            headers={'Content-Type': 'application/json'}
        ) as response:

            if response.status == 200:

                # Cookie'dan access_token olish
                token_cookie = response.cookies.get('access_token')

                if token_cookie:
                    # Morsel -> oddiy string
                    token = token_cookie.value

                    # Redis ga saqlash
                    await redis_client.hset(
                        'test_tokens',
                        user_data['username'],
                        token
                    )

                    print(
                        f"✓ {user_data['username']} - Token saqlandi"
                    )

                    return True

                else:
                    print(
                        f"✗ {user_data['username']} - Token topilmadi"
                    )
                    return False

            else:
                error_text = await response.text()

                print(
                    f"✗ {user_data['username']} - "
                    f"Error: {response.status} - {error_text[:100]}"
                )

                return False

    except Exception as e:
        print(
            f"✗ {user_data['username']} - Exception: {str(e)}"
        )
        return False

def generate_random_user():
    """Random user data generatsiya qilish"""
    random_num = random.randint(100000, 999999)
    return {
        'username': f'testuser_{random_num}',
        'email': f'testuser_{random_num}@example.com',
        'password': 'TestPassword123',  # Kamida 8 ta belgi, harf va raqam
        'nickname': f'Test User {random_num}',
    }

async def load_test_register(concurrent_users=10, total_users=100):
    """Register endpoint load test"""
    print(f"\n{'='*60}")
    print(f"Register Load Test Boshlanmoqda")
    print(f"Concurrent users: {concurrent_users}")
    print(f"Total users: {total_users}")
    print(f"{'='*60}\n")
    
    start_time = datetime.now()
    
    # HTTP session yaratish
    async with aiohttp.ClientSession() as session:
        # Semaphore bilan concurrent requestlarni boshqarish
        semaphore = asyncio.Semaphore(concurrent_users)
        
        async def register_with_semaphore(user_data):
            async with semaphore:
                return await register_user(session, user_data)
        
        # Tasklar yaratish
        tasks = []
        for _ in range(total_users):
            user_data = generate_random_user()
            task = register_with_semaphore(user_data)
            tasks.append(task)
        
        # Barcha tasklarni parallel ishga tushirish
        results = await asyncio.gather(*tasks)
        
        # Natijalarni hisoblash
        success_count = sum(1 for r in results if r)
        fail_count = total_users - success_count
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"Test Natijalari:")
        print(f"{'='*60}")
        print(f"Jami users: {total_users}")
        print(f"Muvaffaqiyatli: {success_count}")
        print(f"Xatolik: {fail_count}")
        print(f"Vaqt: {duration:.2f} sekund")
        print(f"Throughput: {total_users/duration:.2f} user/sekund")
        print(f"{'='*60}\n")
        
        # Redis'da nechta token borligini tekshirish
        token_count = await redis_client.hlen('test_tokens')
        print(f"Redis'da saqlangan tokenlar: {token_count}")

async def main():
    try:
        # Load test parametrlari
        await load_test_register(
            concurrent_users=10,  # Bir vaqtda nechta request
            total_users=100       # Jami nechta user
        )
    finally:
        await redis_client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
