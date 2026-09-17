from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .cure.config import DATABASE_URL
import redis.asyncio as redis

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Redis client
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
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