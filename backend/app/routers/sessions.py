from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings
from app.deps import get_db, get_session_from_cookie
from app.models import ChatSession, Message
from app.schemas import SessionOut, MessageOut

router = APIRouter()
settings = get_settings()


@router.post("/sessions", response_model=SessionOut)
async def create_session(response: Response, db: AsyncSession = Depends(get_db)):
    s = ChatSession()
    db.add(s)
    await db.commit()
    await db.refresh(s)
    response.set_cookie(
        key="session_id",
        value=str(s.id),
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=60 * 60 * 24 * 30,
        path="/",
    )
    return SessionOut(id=s.id)


@router.get("/sessions/me/messages", response_model=list[MessageOut])
async def get_history(
    session: ChatSession = Depends(get_session_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(
        select(Message).where(Message.session_id == session.id).order_by(Message.created_at)
    )).scalars().all()
    return rows
