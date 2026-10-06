import asyncio
import aiohttp
import random
import redis.asyncio as redis
import time
import statistics
from collections import Counter


# ============================================================
# CONFIG
# ============================================================

TEST_URL = "http://localhost/api3/savollar/get_savol"

CONCURRENT_USERS = 50
TIMEOUT_SECONDS = 30

# Redis docker ichidan ishlaganda
REDIS_HOST = "redis"
REDIS_PORT = 6379
REDIS_DB = 0

# Har bir userga random test berish
# Xohlasangiz bitta testni hamma userga berishingiz mumkin.
TEST_DATA = [
    {
        "id": 3,
        "test_id": 50550,
        "hash_url": "e8ccf46535b9cfe236ec13d698c18e6b3ef1721f0448ca081faea9774123566a",
    },

    # Kerak bo'lsa boshqa testlar:
    # {
    #     "id": 41,
    #     "test_id": 50551,
    #     "hash_url": "...",
    # },
]


# ============================================================
# REDIS
# ============================================================

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True,
)


# ============================================================
# USER TOKENLAR
# ============================================================

async def get_tokens():
    print("Redis'dan tokenlar olinmoqda...")

    start = time.perf_counter()

    tokens = await redis_client.hgetall("test_tokens")

    elapsed = (time.perf_counter() - start) * 1000

    token_list = list(tokens.values())

    print(f"✓ Tokenlar: {len(token_list)}")
    print(f"✓ Redis vaqti: {elapsed:.2f} ms")

    if not token_list:
        raise RuntimeError("Redis'da test_tokens topilmadi!")

    return token_list


# ============================================================
# BIR USER
# ============================================================

async def simulate_real_user(
    session,
    user_number,
    token,
    test_data,
    start_barrier,
):
    """
    Bitta real userning /test/start jarayonini simulyatsiya qiladi.

    Frontenddagi:

        Boshlash
          ↓
        /test/start/...
          ↓
        getSavol()
          ↓
        last_id
          ↓
        getSavol(last_id)
          ↓
        ...
    """

    result = {
        "user": user_number,
        "success": False,
        "duration": 0,
        "requests": 0,
        "questions": 0,
        "errors": 0,
        "statuses": [],
        "request_times": [],
        "error_messages": [],
    }

    try:
        # ====================================================
        # HAMMA USER BIR VAQTDA START
        # ====================================================

        await start_barrier.wait()

        user_start = time.perf_counter()

        last_id = None
        total_questions = 0
        request_number = 0

        while True:

            payload = {
                "id": int(test_data["id"]),
                "test_id": str(test_data["test_id"]),
                "hash_url": test_data["hash_url"],
            }

            if last_id:
                payload["last_id"] = last_id

            request_number += 1

            request_start = time.perf_counter()

            try:
                async with session.post(
                    TEST_URL,
                    json=payload,
                    cookies={
                        "access_token": token
                    },
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                ) as response:

                    request_time = (
                        time.perf_counter() - request_start
                    ) * 1000

                    result["request_times"].append(request_time)
                    result["requests"] += 1
                    result["statuses"].append(response.status)

                    # JSON o'qish
                    data = await response.json()

                    if response.status != 200:
                        result["errors"] += 1
                        result["error_messages"].append(
                            f"HTTP {response.status}"
                        )
                        break

                    # Auth
                    if data.get("user") is False:
                        result["errors"] += 1
                        result["error_messages"].append(
                            "user=false"
                        )
                        break

                    # Backend status
                    if data.get("status") is False:
                        result["errors"] += 1
                        result["error_messages"].append(
                            "status=false"
                        )
                        break

                    # Savollar
                    questions = data.get("savollar", [])

                    total_questions += len(questions)

                    # Pagination
                    next_last_id = data.get("last_id")

                    if not next_last_id:
                        break

                    last_id = next_last_id

            except asyncio.TimeoutError:
                result["errors"] += 1
                result["error_messages"].append(
                    "TIMEOUT"
                )
                break

            except Exception as e:
                result["errors"] += 1
                result["error_messages"].append(
                    str(e)
                )
                break

        # ====================================================
        # USER STARTUP TIME
        # ====================================================

        result["duration"] = (
            time.perf_counter() - user_start
        )

        result["questions"] = total_questions

        result["success"] = (
            result["errors"] == 0
            and result["requests"] > 0
            and total_questions > 0
        )

        return result

    except Exception as e:

        result["errors"] += 1
        result["error_messages"].append(str(e))

        result["duration"] = (
            time.perf_counter() - user_start
        )

        return result


# ============================================================
# STATISTICS
# ============================================================

def percentile(values, p):

    if not values:
        return 0

    values = sorted(values)

    index = (len(values) - 1) * p

    lower = int(index)
    upper = min(lower + 1, len(values) - 1)

    weight = index - lower

    return (
        values[lower]
        + (values[upper] - values[lower]) * weight
    )


def print_statistics(results, total_duration):

    successful = [
        r for r in results
        if r["success"]
    ]

    failed = [
        r for r in results
        if not r["success"]
    ]

    durations = [
        r["duration"]
        for r in results
    ]

    durations_ms = [
        x * 1000
        for x in durations
    ]

    all_request_times = []

    for r in results:
        all_request_times.extend(
            r["request_times"]
        )

    total_requests = sum(
        r["requests"]
        for r in results
    )

    total_questions = sum(
        r["questions"]
        for r in results
    )

    print()
    print("=" * 70)
    print("REAL USER LOAD TEST NATIJALARI")
    print("=" * 70)

    print()
    print("👥 USERS")
    print("-" * 70)

    print(f"Jami user              : {len(results)}")
    print(f"Muvaffaqiyatli user    : {len(successful)}")
    print(f"Xatolik user           : {len(failed)}")

    success_rate = (
        len(successful) / len(results) * 100
        if results
        else 0
    )

    print(f"Success rate           : {success_rate:.2f}%")

    print()
    print("⏱ USER STARTUP TIME")
    print("-" * 70)

    print(
        f"Min                    : "
        f"{min(durations_ms):.2f} ms"
    )

    print(
        f"Avg                    : "
        f"{statistics.mean(durations_ms):.2f} ms"
    )

    print(
        f"Median                 : "
        f"{statistics.median(durations_ms):.2f} ms"
    )

    print(
        f"P75                    : "
        f"{percentile(durations_ms, 0.75):.2f} ms"
    )

    print(
        f"P90                    : "
        f"{percentile(durations_ms, 0.90):.2f} ms"
    )

    print(
        f"P95                    : "
        f"{percentile(durations_ms, 0.95):.2f} ms"
    )

    print(
        f"P99                    : "
        f"{percentile(durations_ms, 0.99):.2f} ms"
    )

    print(
        f"Max                    : "
        f"{max(durations_ms):.2f} ms"
    )

    print()
    print("🌐 HTTP REQUESTLAR")
    print("-" * 70)

    print(f"Jami API request       : {total_requests}")
    print(f"Jami savol             : {total_questions}")

    if total_duration > 0:
        print(
            f"Umumiy throughput      : "
            f"{total_requests / total_duration:.2f} req/sec"
        )

    print()
    print("⏱ INDIVIDUAL API RESPONSE TIME")
    print("-" * 70)

    if all_request_times:

        print(
            f"Min                    : "
            f"{min(all_request_times):.2f} ms"
        )

        print(
            f"Avg                    : "
            f"{statistics.mean(all_request_times):.2f} ms"
        )

        print(
            f"Median                 : "
            f"{statistics.median(all_request_times):.2f} ms"
        )

        print(
            f"P90                    : "
            f"{percentile(all_request_times, 0.90):.2f} ms"
        )

        print(
            f"P95                    : "
            f"{percentile(all_request_times, 0.95):.2f} ms"
        )

        print(
            f"P99                    : "
            f"{percentile(all_request_times, 0.99):.2f} ms"
        )

        print(
            f"Max                    : "
            f"{max(all_request_times):.2f} ms"
        )

    print()
    print("📊 HTTP STATUS")
    print("-" * 70)

    statuses = Counter()

    for r in results:
        statuses.update(r["statuses"])

    for status, count in sorted(statuses.items()):
        percentage = (
            count / total_requests * 100
            if total_requests
            else 0
        )

        print(
            f"{status:<10} : "
            f"{count:>5} "
            f"({percentage:.2f}%)"
        )

    print()
    print("🐌 ENG SEKIN USERLAR")
    print("-" * 70)

    slowest = sorted(
        results,
        key=lambda x: x["duration"],
        reverse=True
    )[:10]

    for index, r in enumerate(slowest, 1):

        print(
            f"#{index:<2} "
            f"User {r['user']:<4} | "
            f"{r['duration'] * 1000:>9.2f} ms | "
            f"{r['requests']:>2} request | "
            f"{r['questions']:>3} savol | "
            f"{'OK' if r['success'] else 'FAIL'}"
        )

    if failed:

        print()
        print("❌ XATOLIKLAR")
        print("-" * 70)

        for r in failed:

            print(
                f"User {r['user']}: "
                f"{', '.join(r['error_messages'])}"
            )

    print()
    print("=" * 70)

    if failed:
        print("⚠️ Ba'zi userlar muvaffaqiyatsiz bo'ldi.")
    else:
        print("✅ Barcha userlar testni muvaffaqiyatli boshladi.")

    print("=" * 70)


# ============================================================
# MAIN LOAD TEST
# ============================================================

async def main():

    print()
    print("=" * 70)
    print("🔥 REAL USER PARALLEL LOAD TEST")
    print("=" * 70)

    print(f"URL                 : {TEST_URL}")
    print(f"Parallel users      : {CONCURRENT_USERS}")
    print(f"Timeout             : {TIMEOUT_SECONDS}s")

    print()
    print("Bu test:")
    print("  1. Har bir userga alohida token beradi")
    print("  2. Userlar bir vaqtda START qiladi")
    print("  3. get_savol pagination'ini oxirigacha bajaradi")
    print("  4. Har bir userning startup vaqtini o'lchaydi")
    print()

    tokens = await get_tokens()

    if len(tokens) < CONCURRENT_USERS:

        raise RuntimeError(
            f"Token yetarli emas: "
            f"{len(tokens)} token, "
            f"{CONCURRENT_USERS} user kerak."
        )

    # Faqat kerakli miqdorda token
    selected_tokens = tokens[:CONCURRENT_USERS]

    timeout = aiohttp.ClientTimeout(
        total=TIMEOUT_SECONDS,
        connect=10,
        sock_connect=10,
        sock_read=TIMEOUT_SECONDS,
    )

    connector = aiohttp.TCPConnector(
        limit=CONCURRENT_USERS * 2,
        limit_per_host=CONCURRENT_USERS * 2,
        ttl_dns_cache=300,
    )

    start_barrier = asyncio.Event()

    async with aiohttp.ClientSession(
        timeout=timeout,
        connector=connector,
    ) as session:

        # ====================================================
        # TASKLAR OLDINDAN TAYYORLANADI
        # ====================================================

        tasks = []

        for i in range(CONCURRENT_USERS):

            token = selected_tokens[i]

            test_data = random.choice(TEST_DATA)

            task = asyncio.create_task(
                simulate_real_user(
                    session=session,
                    user_number=i + 1,
                    token=token,
                    test_data=test_data,
                    start_barrier=start_barrier,
                )
            )

            tasks.append(task)

        # ====================================================
        # HAMMASINI BIR VAQTDA START
        # ====================================================

        print("🚀 Userlar tayyor...")
        await asyncio.sleep(0.5)

        print("🚀🚀🚀 BARCHA USERLAR START!")

        global_start = time.perf_counter()

        start_barrier.set()

        results = await asyncio.gather(*tasks)

        total_duration = (
            time.perf_counter()
            - global_start
        )

    print_statistics(
        results,
        total_duration,
    )


if __name__ == "__main__":

    try:
        asyncio.run(main())

    finally:

        asyncio.run(
            redis_client.aclose()
        )
