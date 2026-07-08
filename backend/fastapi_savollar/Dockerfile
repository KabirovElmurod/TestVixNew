FROM python:3.12

WORKDIR /app

COPY library.txt .
RUN pip install -r library.txt

COPY . .

CMD ["uvicorn", "fastapi_savollar.main:app", "--host", "0.0.0.0", "--port", "8000"]