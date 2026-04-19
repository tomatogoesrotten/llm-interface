from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db, get_session_from_cookie
from app.models import ChatSession, Message
from app.schemas import ChatRequest
from app import llm

router = APIRouter()

SYSTEM_PROMPT = "You are a helpful assistant. Keep answers concise."


async def _build_history(db: AsyncSession, session_id) -> list[dict]:
    rows = (await db.execute(
        select(Message).where(Message.session_id == session_id).order_by(Message.created_at)
    )).scalars().all()
    return [{"role": r.role, "content": r.content} for r in rows]


@router.post("/chat/stream")
async def chat_stream(
    req: ChatRequest,
    session: ChatSession = Depends(get_session_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    if not req.content.strip():
        raise HTTPException(400, "content must not be empty")

    history = await _build_history(db, session.id)
    db.add(Message(session_id=session.id, role="user", content=req.content))
    await db.commit()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history,
        {"role": "user", "content": req.content},
    ]

    async def gen():
        buf: list[str] = []
        try:
            async for token in llm.stream_chat(messages):
                buf.append(token)
                yield token
        except Exception as e:
            yield f"\n[error: {type(e).__name__}]"
            return
        full = "".join(buf)
        if full:
            db.add(Message(session_id=session.id, role="assistant", content=full))
            await db.commit()

    headers = {"X-Accel-Buffering": "no", "Cache-Control": "no-cache"}
    return StreamingResponse(gen(), media_type="text/plain; charset=utf-8", headers=headers)
