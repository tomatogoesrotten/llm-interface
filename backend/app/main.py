from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()
app = FastAPI(title="LLM Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routers import sessions as sessions_router
app.include_router(sessions_router.router)


@app.get("/health")
async def health():
    return {"ok": True}


from app.routers import chat as chat_router
app.include_router(chat_router.router)
