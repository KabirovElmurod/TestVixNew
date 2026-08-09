from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .app.api.testlar import router as testlar_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", 'http://localhost:5173'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from .app.redis.redis import get_redis

@app.on_event("startup")
async def startup_event():
    redis = await get_redis()
    await redis.clear_all_data()  # Clear all Redis data on startup
    await redis.create_index()
    await redis.create_search_index()  # Create search index for caching
app.include_router(testlar_router)

@app.get("/")
async def root():
    return {"message": "API ishlayapti"}