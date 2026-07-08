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