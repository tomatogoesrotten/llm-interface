from uuid import UUID
from typing import AsyncIterator
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import SessionMaker
from app.models import ChatSession


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionMaker() as s:
        yield s


async def get_session_from_cookie(
    session_id: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> ChatSession:
    if session_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing session cookie")
    try:
        sid = UUID(session_id)
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session cookie")
    row = (await db.execute(select(ChatSession).where(ChatSession.id == sid))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return row
