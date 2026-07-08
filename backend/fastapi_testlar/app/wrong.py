def wrong(message: str, status: bool, data: dict = {}):
    return {"message": message, "status": status, "data": data}


import time

# from ...celery_app import celery_app

# @celery_app.task
# def ai_generate(test_id: int):
#     print("AI ishlayapti...")

#     time.sleep(10)

#     print(f"{test_id} uchun AI tugadi")