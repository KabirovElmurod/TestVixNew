# import subprocess
# import sys
# import os

# def run_in_new_cmd(command, cwd=None):
#     subprocess.Popen(
#         f'start cmd /k "{command}"',
#         shell=True,
#         cwd=cwd
#     )

# # FastAPI (uvicorn orqali)
# run_in_new_cmd("uvicorn fastapi_account.main:app --reload --port 8001", cwd=r"D:\Projects\TestVix\TestVixNew\backend")
# run_in_new_cmd("uvicorn fastapi_testlar.main:app --reload --port 8002", cwd=r"D:\Projects\TestVix\TestVixNew\backend")
# run_in_new_cmd("uvicorn fastapi_savollar.main:app --reload --port 8003", cwd=r"D:\Projects\TestVix\TestVixNew\backend")

# # Django
# # run_in_new_cmd("python manage.py runserver", cwd=r"D:\Projects\TestVix\TestVixNew\backend\django")

# # React
# run_in_new_cmd("npm run dev", cwd=r"D:\Projects\TestVix\TestVixNew\frontend\Testvix")



# run_in_new_cmd(r".\nginx", cwd=r"D:\App\Nginx")
# # run_in_new_cmd("npm run dev", cwd=r"D:\App\TestVixNew2\TestVixNew")

import subprocess

def run(command, cwd=None):
    subprocess.Popen(command, shell=True, cwd=cwd)

BASE = "/mnt/d/Projects/TestVix/TestVixNew"

run("uvicorn fastapi_account.main:app --reload --port 8001", f"{BASE}/backend")
run("uvicorn fastapi_testlar.main:app --reload --port 8002", f"{BASE}/backend")
run("uvicorn fastapi_savollar.main:app --reload --port 8003", f"{BASE}/backend")

run("npm run dev", f"{BASE}/frontend/Testvix")
run("./nginx", "/mnt/d/App/Nginx")