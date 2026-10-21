from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .cure.config import DATABASE_URL
import redis.asyncio as redis
import os

# Productionda echo=False, developmentda echo=True
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

engine = create_async_engine(
    DATABASE_URL,
    echo=DEBUG,
    pool_size=20,  # Connection pool size
    max_overflow=40,  # Max overflow connections
    pool_pre_ping=True,  # Check connection health before use
    pool_recycle=3600  # Recycle connections after 1 hour
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Redis client with connection pool
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True,
    max_connections=50,  # Max connections in pool
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_redis():
    try:
        yield redis_client
    except Exception as e:
        print(f"Redis connection error: {e}")
        yield None