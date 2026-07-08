import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()
# DATABASE_URL="postgresql+asyncpg://testvix:qoty_qouy_2006@10.255.255.254:5432/testvix"
# DATABASE_URL="postgresql+asyncpg://testvix:qoty_qouy_2006@db:5432/testvix"
DATABASE_URL="postgresql+asyncpg://testvixdocker:qoty_qouy_2006@db:5432/testvixdocker"

# DATABASE_URL = os.getenv(
#     "DATABASE_URL",
#     "postgresql+asyncpg://testvix:qoty_qouy_2006@db:5432/testvix"
# )
