import subprocess
import sys
import os

def run_in_new_cmd(command, cwd=None):
    subprocess.Popen(
        f'start cmd /k "{command}"',
        shell=True,
        cwd=cwd
    )

# FastAPI (uvicorn orqali)
run_in_new_cmd("uvicorn fastapi_account.main:app --reload --port 8001", cwd=r"D:\App\Test1\TestVixNew\backend")
run_in_new_cmd("uvicorn fastapi_testlar.main:app --reload --port 8002", cwd=r"D:\App\Test1\TestVixNew\backend")
run_in_new_cmd("uvicorn fastapi_savollar.main:app --reload --port 8003", cwd=r"D:\App\Test1\TestVixNew\backend")

# Django
# run_in_new_cmd("python manage.py runserver", cwd=r"D:\App\Test1\TestVixNew\backend\django")

# React
run_in_new_cmd("npm run dev", cwd=r"D:\App\Test1\TestVixNew\frontend\Testvix")



run_in_new_cmd(r".\nginx", cwd=r"D:\App\Nginx")
# run_in_new_cmd("npm run dev", cwd=r"D:\App\Test1\TestVixNew2\TestVixNew")