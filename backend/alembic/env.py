import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context
from app.config import get_settings
from app.db import Base
import app.models  # noqa: F401

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
settings = get_settings()
db_url = settings.database_url


def run_migrations_online():
    connectable: AsyncEngine = create_async_engine(db_url, future=True)

    async def do_run():
        async with connectable.connect() as connection:
            await connection.run_sync(_do_migrations)

    def _do_migrations(sync_conn):
        context.configure(connection=sync_conn, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(do_run())


run_migrations_online()
