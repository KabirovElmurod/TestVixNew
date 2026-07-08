
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

DATABASE_URL = "postgresql+asyncpg://testvixdocker:qoty_qouy_2006@db:5432/testvixdocker"


def get_session():
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        poolclass=NullPool
    )

    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )




# from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
# from sqlalchemy.pool import NullPool

# DATABASE_URL = "postgresql+asyncpg://testvixdocker:qoty_qouy_2006@db:5432/testvixdocker"


# engine = create_async_engine(
#     DATABASE_URL,
#     echo=False,
#     poolclass=NullPool
# )


# AsyncSessionLocal = async_sessionmaker(
#     bind=engine,
#     expire_on_commit=False
# )