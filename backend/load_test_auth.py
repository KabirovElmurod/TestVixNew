import asyncio
import aiohttp
import random
import redis.asyncio as redis
from datetime import datetime
import json

# Redis connection (docker network ichida redis service nomi bilan)
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
)

# API endpoints (docker network ichida nginx service nomi bilan)
BASE_URL = 'http://nginx/api1'
REGISTER_URL = f'{BASE_URL}/auth/register'
LOGIN_URL = f'{BASE_URL}/auth/login'

async def register_user(session, user_data):
    """Bitta userni register qilish"""
    try:
        async with session.post(
            REGISTER_URL,
            json=user_data,
            headers={'Content-Type': 'application/json'}
        ) as response:
            status = response.status
            text = await response.text()
            
            if status == 200:
                print(f"✓ Register success: {user_data['username']}")
                return {"success": True, "username": user_data['username'], "status": status}
            else:
                print(f"✗ Register failed: {user_data['username']} - {status} - {text[:100]}")
                return {"success": False, "username": user_data['username'], "status": status, "error": text[:200]}
    except Exception as e:
        print(f"✗ Register exception: {user_data['username']} - {str(e)}")
        return {"success": False, "username": user_data['username'], "error": str(e)}

async def login_user(session, username, password):
    """Bitta userni login qilish"""
    try:
        async with session.post(
            LOGIN_URL,
            json={"username": username, "password": password},
            headers={'Content-Type': 'application/json'}
        ) as response:
            status = response.status
            text = await response.text()
            
            if status == 200:
                print(f"✓ Login success: {username}")
                return {"success": True, "username": username, "status": status}
            else:
                print(f"✗ Login failed: {username} - {status} - {text[:100]}")
                return {"success": False, "username": username, "status": status, "error": text[:200]}
    except Exception as e:
        print(f"✗ Login exception: {username} - {str(e)}")
        return {"success": False, "username": username, "error": str(e)}

def generate_random_user():
    """Random user data generatsiya qilish"""
    random_num = random.randint(100000, 999999)
    return {
        'username': f'testuser_{random_num}',
        'email': f'testuser_{random_num}@example.com',
        'password': 'TestPass123',  # Kamida 8 ta belgi, harf va raqam
        'nickname': f'Test User {random_num}',
    }

async def load_test_register(concurrent_users=10, total_users=100):
    """Register endpoint load test"""
    print(f"\n{'='*60}")
    print(f"REGISTER LOAD TEST")
    print(f"Concurrent users: {concurrent_users}")
    print(f"Total users: {total_users}")
    print(f"{'='*60}\n")
    
    start_time = datetime.now()
    
    async with aiohttp.ClientSession() as session:
        semaphore = asyncio.Semaphore(concurrent_users)
        
        async def register_with_semaphore(user_data):
            async with semaphore:
                return await register_user(session, user_data)
        
        tasks = []
        for _ in range(total_users):
            user_data = generate_random_user()
            task = register_with_semaphore(user_data)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r.get('success'))
        fail_count = total_users - success_count
        
        # Xatoliklarni tahlil qilish
        error_summary = {}
        for r in results:
            if not r.get('success'):
                error_key = r.get('status', 'exception')
                error_summary[error_key] = error_summary.get(error_key, 0) + 1
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"REGISTER TEST RESULTS:")
        print(f"{'='*60}")
        print(f"Total users: {total_users}")
        print(f"Successful: {success_count}")
        print(f"Failed: {fail_count}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Throughput: {total_users/duration:.2f} users/second")
        print(f"\nError breakdown:")
        for status, count in error_summary.items():
            print(f"  Status {status}: {count} errors")
        print(f"{'='*60}\n")
        
        return results

async def load_test_login(concurrent_users=10, total_logins=100):
    """Login endpoint load test - avval register qilingan userlar bilan"""
    print(f"\n{'='*60}")
    print(f"LOGIN LOAD TEST")
    print(f"Concurrent users: {concurrent_users}")
    print(f"Total logins: {total_logins}")
    print(f"{'='*60}\n")
    
    # Avval test userlarini yaratish
    print("Creating test users for login test...")
    test_users = []
    for i in range(min(total_logins, 50)):  # 50 ta user yaratamiz, ularni qayta-qayta login qilamiz
        random_num = random.randint(1000000, 9999999)
        user_data = {
            'username': f'logintest_{random_num}',
            'email': f'logintest_{random_num}@example.com',
            'password': 'LoginPass123',
            'nickname': f'Login Test {random_num}',
        }
        test_users.append(user_data)
    
    # Userlarni register qilish
    async with aiohttp.ClientSession() as session:
        for user in test_users:
            await register_user(session, user)
    
    print(f"Created {len(test_users)} test users\n")
    
    # Endi login test
    start_time = datetime.now()
    
    async with aiohttp.ClientSession() as session:
        semaphore = asyncio.Semaphore(concurrent_users)
        
        async def login_with_semaphore(user):
            async with semaphore:
                return await login_user(session, user['username'], user['password'])
        
        tasks = []
        for _ in range(total_logins):
            user = random.choice(test_users)
            task = login_with_semaphore(user)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r.get('success'))
        fail_count = total_logins - success_count
        
        # Xatoliklarni tahlil qilish
        error_summary = {}
        for r in results:
            if not r.get('success'):
                error_key = r.get('status', 'exception')
                error_summary[error_key] = error_summary.get(error_key, 0) + 1
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"LOGIN TEST RESULTS:")
        print(f"{'='*60}")
        print(f"Total logins: {total_logins}")
        print(f"Successful: {success_count}")
        print(f"Failed: {fail_count}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Throughput: {total_logins/duration:.2f} logins/second")
        print(f"\nError breakdown:")
        for status, count in error_summary.items():
            print(f"  Status {status}: {count} errors")
        print(f"{'='*60}\n")
        
        return results

async def load_test_mixed(concurrent_users=10, total_requests=100):
    """Register va login aralash load test"""
    print(f"\n{'='*60}")
    print(f"MIXED AUTH LOAD TEST (Register + Login)")
    print(f"Concurrent users: {concurrent_users}")
    print(f"Total requests: {total_requests}")
    print(f"{'='*60}\n")
    
    start_time = datetime.now()
    
    async with aiohttp.ClientSession() as session:
        semaphore = asyncio.Semaphore(concurrent_users)
        
        async def random_request():
            async with semaphore:
                # 50% register, 50% login
                if random.random() < 0.5:
                    user_data = generate_random_user()
                    return await register_user(session, user_data)
                else:
                    # Random login with existing test user
                    random_num = random.randint(1000000, 1000005)
                    return await login_user(session, f'mixedtest_{random_num}', 'MixedPass123')
        
        tasks = []
        for _ in range(total_requests):
            task = random_request()
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r.get('success'))
        fail_count = total_requests - success_count
        
        # Xatoliklarni tahlil qilish
        error_summary = {}
        for r in results:
            if not r.get('success'):
                error_key = r.get('status', 'exception')
                error_summary[error_key] = error_summary.get(error_key, 0) + 1
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"MIXED TEST RESULTS:")
        print(f"{'='*60}")
        print(f"Total requests: {total_requests}")
        print(f"Successful: {success_count}")
        print(f"Failed: {fail_count}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Throughput: {total_requests/duration:.2f} requests/second")
        print(f"\nError breakdown:")
        for status, count in error_summary.items():
            print(f"  Status {status}: {count} errors")
        print(f"{'='*60}\n")
        
        return results

async def main():
    try:
        print("\n" + "="*60)
        print("AUTH LOAD TEST SUITE")
        print("="*60)
        
        # Test 1: Register load test - yuqori concurrency
        await load_test_register(concurrent_users=50, total_users=200)
        
        # Kichik tanaffus
        await asyncio.sleep(3)
        
        # Test 2: Login load test - yuqori concurrency
        await load_test_login(concurrent_users=50, total_logins=200)
        
        # Kichik tanaffus
        await asyncio.sleep(3)
        
        # Test 3: Mixed load test - yuqori concurrency
        await load_test_mixed(concurrent_users=50, total_requests=200)
        
        # Kichik tanaffus
        await asyncio.sleep(3)
        
        # Test 4: Extreme load test - 100 concurrent users
        print("\n" + "="*60)
        print("EXTREME LOAD TEST - 100 Concurrent Users")
        print("="*60)
        await load_test_register(concurrent_users=100, total_users=300)
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETED")
        print("="*60 + "\n")
        
    finally:
        await redis_client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
