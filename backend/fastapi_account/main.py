from fastapi import FastAPI
from .app.api import user as user_router
from .app.api import admin as admin_router
# from .app.api import user

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", 'http://localhost:5173', "http://localhost"], # Frontend manzili (Vite uchun odatda shu)
    allow_credentials=True, # BU JUDA MUHIM!
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router.router)
app.include_router(admin_router.router)

@app.get("/")
async def root():
    return {"message": "API ishlayapti"}