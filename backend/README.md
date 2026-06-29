# TestVix Backend Architecture

## Texnologiyalar
- **Django** - Admin paneli va database boshqaruvi
- **FastAPI** - REST API uchun
- **PostgreSQL** - Asosiy database
- **Redis** - Caching uchun
- **Celery** - Background tasks uchun
- **Docker** - Konteynerizatsiya

## Proyekt Strukturi

```
backend/
├── admin/                     # Django admin paneli
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── apps/
│       ├── users/            # Foydalanuvchilar
│       ├── tests/            # Testlar
│       ├── questions/        # Savollar
│       ├── results/          # Natijalar
│       └── comments/         # Commentlar
├── api/                       # FastAPI
│   ├── __init__.py
│   ├── main.py
│   ├── dependencies.py
│   ├── database.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── tests.py
│   │   ├── questions.py
│   │   ├── results.py
│   │   └── comments.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── test.py
│   │   ├── question.py
│   │   ├── result.py
│   │   └── comment.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── test.py
│   │   ├── question.py
│   │   ├── result.py
│   │   └── comment.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── cache.py
│   │   └── email.py
│   └── utils/
│       ├── __init__.py
│       ├── security.py
│       └── helpers.py
├── shared/                     # Umumiy modellar va konfiguratsiyalar
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── test.py
│   │   ├── question.py
│   │   ├── result.py
│   │   └── comment.py
│   ├── database.py
│   └── config.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile.admin
├── Dockerfile.api
└── README.md
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tests Table
```sql
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    duration_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(20) DEFAULT 'medium',
    is_public BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT false,
    categories TEXT[], -- PostgreSQL array
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Questions Table
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    math_formula TEXT,
    question_type VARCHAR(20) DEFAULT 'multiple_choice',
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Question Options Table
```sql
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL
);
```

### Test Results Table
```sql
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id),
    user_id UUID REFERENCES users(id),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_taken_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Answers Table
```sql
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_result_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    selected_option_id UUID REFERENCES question_options(id),
    answer_text TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    parent_comment_id UUID REFERENCES comments(id),
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Django Admin Paneli

### Settings (admin/settings.py)
```python
import os
from pathlib import Path
from shared.config import get_settings

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'admin.apps.users',
    'admin.apps.tests',
    'admin.apps.questions',
    'admin.apps.results',
    'admin.apps.comments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'admin.urls'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'testvix'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Redis cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### User Model (admin/apps/users/models.py)
```python
from django.contrib.auth.models import AbstractUser
from shared.models.base import BaseModel

class User(AbstractUser, BaseModel):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    avatar_url = models.URLField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']
    
    def __str__(self):
        return self.email
```

## FastAPI Configuration

### Main App (api/main.py)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from api.routers import auth, users, tests, questions, results, comments
from shared.database import engine
from shared.models import Base

app = FastAPI(
    title="TestVix API",
    description="Test platformasi uchun API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis cache
cache = FastAPICache(backend=RedisBackend(redis_url="redis://localhost:6379/2"))

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(tests.router, prefix="/api/v1/tests", tags=["Tests"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(results.router, prefix="/api/v1/results", tags=["Results"])
app.include_router(comments.router, prefix="/api/v1/comments", tags=["Comments"])

@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "TestVix API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Authentication Router (api/routers/auth.py)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from api.database import get_db
from api.schemas.user import UserCreate, UserLogin, Token
from api.services.auth import AuthService
from api.utils.security import create_access_token, verify_token

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = await auth_service.register(user_data)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    token = await auth_service.authenticate(user_data)
    return token

@router.get("/me")
async def get_current_user(current_user: dict = Depends(verify_token)):
    return current_user
```

### Tests Router (api/routers/tests.py)
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from api.database import get_db
from api.schemas.test import TestCreate, TestResponse, TestListResponse
from api.services.cache import cache_response

router = APIRouter()

@router.post("/", response_model=TestResponse)
async def create_test(
    test_data: TestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Test yaratish logikasi
    pass

@router.get("/", response_model=List[TestListResponse])
@cache_response(expire=300)  # 5 minut cache
async def get_tests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Testlarni olish logikasi
    pass

@router.get("/{test_id}", response_model=TestResponse)
@cache_response(expire=600)  # 10 minut cache
async def get_test(test_id: str, db: Session = Depends(get_db)):
    # Bitta testni olish logikasi
    pass
```

## Redis Cache Tizimi

### Cache Service (api/services/cache.py)
```python
from fastapi_cache import FastAPICache
from typing import Any, Optional
import json
import redis

class CacheService:
    def __init__(self, cache: FastAPICache):
        self.cache = cache
    
    async def get(self, key: str) -> Optional[Any]:
        """Cacheden ma'lumot olish"""
        try:
            cached_data = await self.cache.get(key)
            return json.loads(cached_data) if cached_data else None
        except:
            return None
    
    async def set(self, key: str, value: Any, expire: int = 300):
        """Cachega ma'lumot yozish"""
        try:
            await self.cache.set(key, json.dumps(value), expire=expire)
        except:
            pass
    
    async def delete(self, key: str):
        """Cacheden ma'lumot o'chirish"""
        try:
            await self.cache.delete(key)
        except:
            pass
    
    async def clear_pattern(self, pattern: str):
        """Pattern bo'yicha cacheni tozalash"""
        # Redis da bu ishlaydi
        pass

# Cache decorator
def cache_response(expire: int = 300):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Cache key generatsiya qilish
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Avval cacheni tekshirish
            cached_result = await cache_service.get(cache_key)
            if cached_result:
                return cached_result
            
            # Agar cache bo'lmasa, funksiyani chaqirish
            result = await func(*args, **kwargs)
            
            # Natijani cache ga yozish
            await cache_service.set(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator
```

## Docker Konfiguratsiyasi

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: testvix
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=postgres
      - DB_NAME=testvix
      - DB_USER=postgres
      - DB_PASSWORD=password
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./admin:/app

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/testvix
      - REDIS_URL=redis://redis:6379/2
      - SECRET_KEY=your-secret-key
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./api:/app

volumes:
  postgres_data:
  redis_data:
```

### Dockerfile.admin
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.admin.txt .
RUN pip install --no-cache-dir -r requirements.admin.txt

COPY admin/ ./admin/
COPY shared/ ./shared/

EXPOSE 8000

CMD ["python", "admin/manage.py", "runserver", "0.0.0.0:8000"]
```

### Dockerfile.api
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.api.txt .
RUN pip install --no-cache-dir -r requirements.api.txt

COPY api/ ./api/
COPY shared/ ./shared/

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

## Requirements

### requirements.admin.txt
```
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.7
django-redis==5.4.0
celery==5.3.4
python-decouple==3.8
```

### requirements.api.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.7
redis==5.0.1
fastapi-cache==0.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
email-validator==2.1.0
```

## Environment Variables

### .env.example
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testvix
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379/1
REDIS_CACHE_EXPIRE=300

# Security
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=true

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/app/uploads

# API
API_V1_STR=/api/v1
DEBUG=false
```

## Deployment

### Production uchun
1. **Docker Compose**: `docker-compose -f docker-compose.prod.yml up -d`
2. **Nginx**: Reverse proxy uchun
3. **SSL**: HTTPS uchun sertifikat
4. **Monitoring**: Prometheus + Grafana
5. **Logging**: ELK stack

### Security xususiyatlari
- JWT token authentication
- CORS konfiguratsiyasi
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection
- HTTPS only (production)

## Monitoring va Logging

### Health checks
- `/health` endpoint
- Database connection check
- Redis connection check
- Service availability monitoring

### Logging
- Structured logging
- Error tracking
- Performance monitoring
- User activity logs
