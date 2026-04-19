import os
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

os.environ.setdefault("OPENAI_API_KEY", "sk-test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")


@pytest.fixture
async def test_engine():
    from app.db import Base
    import app.models  # noqa: F401 ensure mappers are registered
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def client(test_engine):
    from app.main import app
    from app.deps import get_db

    Maker = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

    async def override_db():
        async with Maker() as s:
            yield s

    app.dependency_overrides[get_db] = override_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def fake_llm(monkeypatch):
    tokens_to_yield: list[list[str]] = []
    calls: list[list[dict]] = []

    async def _fake(messages):
        calls.append(messages)
        seq = tokens_to_yield.pop(0) if tokens_to_yield else ["Hel", "lo"]
        for t in seq:
            yield t

    from app import llm
    monkeypatch.setattr(llm, "stream_chat", _fake)
    return {"queue": tokens_to_yield, "calls": calls}
