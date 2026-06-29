from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .app.api.savollar import router as savollar_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", 'http://localhost:5173'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(savollar_router)

@app.get("/")
async def root():
    return {"message": "API ishlayapti"}