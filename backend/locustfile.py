from locust import HttpUser, task, between, events
from locust.runners import MasterRunner
import json
import random
import time

class TestVixUser(HttpUser):
    wait_time = between(0.5, 2)  # 0.5-2 soniya kutish

    @task(3)
    def show_test_page(self):
        """ShowTest page ni ko'rish"""
        test_id = "50561"
        hash_url = "caba9f8b6537d35b82befe39aa650b4d04bd3881e9ceab61785d6f0e3db8e40c"

        with self.client.get(
            f"/test/show/52/{test_id}/{hash_url}",
            catch_response=True,
            name="/test/show/:id/:test_id/:hash_url"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"ShowTest failed: {response.status_code}")

    @task(5)
    def start_test(self):
        """Testni boshlash - ASOSIY TEST (StartTest API)"""
        test_id = "50561"
        hash_url = "caba9f8b6537d35b82befe39aa650b4d04bd3881e9ceab61785d6f0e3db8e40c"

        start_data = {
            "id": 52,
            "test_id": test_id,
            "hash_url": hash_url
        }

        start_time = time.time()

        with self.client.post(
            "/savol/start_savol",  # To'g'ri endpoint
            json=start_data,
            catch_response=True,
            name="/savol/start_savol (Start Test API)"
        ) as response:
            load_time = (time.time() - start_time) * 1000  # millisekundda

            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"StartTest failed: {response.status_code} - Load time: {load_time:.2f}ms - Response: {response.text[:100]}")

    @task(2)
    def get_questions(self):
        """Savollarni olish - progressive loading test"""
        test_id = "50561"
        hash_url = "caba9f8b6537d35b82befe39aa650b4d04bd3881e9ceab61785d6f0e3db8e40c"

        start_time = time.time()

        with self.client.get(
            f"/savol/get?id=52&test_id={test_id}&hash_url={hash_url}",
            catch_response=True,
            name="/savol/get (Question Loading)"
        ) as response:
            load_time = (time.time() - start_time) * 1000  # millisekundda

            if response.status_code == 200:
                data = response.json()
                if "savollar" in data:
                    response.success()
                    # Agar batch bo'lsa, ikkinchi batch ham olish (simulatsiya)
                    if data.get("last_id"):
                        self.client.get(
                            f"/savol/get?id=52&test_id={test_id}&hash_url={hash_url}&last_id={data['last_id']}",
                            catch_response=True,
                            name="/savol/get (Second Batch)"
                        )
                else:
                    response.failure("No questions in response")
            else:
                response.failure(f"Get questions failed: {response.status_code} - Load time: {load_time:.2f}ms")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test boshlanganda"""
    print("\n" + "="*50)
    print("TestVix Load Test Boshlandi!")
    print("="*50 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test tugaganda"""
    print("\n" + "="*50)
    print("TestVix Load Test Tugadi!")
    print("="*50 + "\n")

    if environment.stats.total.fail_ratio > 0.05:  # 5% dan ko'p xatolik bo'lsa
        print(f"⚠️  Warning: {environment.stats.total.fail_ratio * 100:.2f}% requests failed!")
    else:
        print(f"✅ Success: Only {environment.stats.total.fail_ratio * 100:.2f}% requests failed!")

    print(f"📊 Total requests: {environment.stats.total.num_requests}")
    print(f"⏱️  Avg response time: {environment.stats.total.avg_response_time:.2f}ms")
    print(f"🚀 Max response time: {environment.stats.total.max_response_time:.2f}ms")
