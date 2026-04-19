import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db import Base
from app.models import Session as ChatSession, Message


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Maker = async_sessionmaker(engine, expire_on_commit=False)
    async with Maker() as s:
        yield s


@pytest.mark.asyncio
async def test_message_model_roundtrip(db_session: AsyncSession):
    s = ChatSession()
    db_session.add(s)
    await db_session.flush()
    db_session.add_all([
        Message(session_id=s.id, role="user", content="hi"),
        Message(session_id=s.id, role="assistant", content="hello"),
    ])
    await db_session.commit()

    from sqlalchemy import select
    result = await db_session.execute(
        select(Message).where(Message.session_id == s.id).order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    assert [m.role for m in msgs] == ["user", "assistant"]
    assert [m.content for m in msgs] == ["hi", "hello"]
