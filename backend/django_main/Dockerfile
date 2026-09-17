FROM python:3.12-slim

WORKDIR /app

COPY library.txt .

RUN pip install --no-cache-dir -r library.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate"]
