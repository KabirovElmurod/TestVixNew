import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# DATABASE_URL = os.getenv(
#     "DATABASE_URL",
#     "postgresql+asyncpg://testvix:pass@db:5432/testvix"
    
# )
# DATABASE_URL="postgresql+asyncpg://testvix:qoty_qouy_2006@db:5432/testvix"
DATABASE_URL="postgresql+asyncpg://testvixdocker:qoty_qouy_2006@db:5432/testvixdocker"

    # "postgresql+asyncpg://testvix:qoty_qouy_2006@db:5432/testvix"


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

# Use absolute path for media directory
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

AVATAR_DIR = MEDIA_DIR / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

print(f"MEDIA_DIR: {MEDIA_DIR}")
print(f"AVATAR_DIR: {AVATAR_DIR}")
print(f"BASE_DIR: {BASE_DIR}")
