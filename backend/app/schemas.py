from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class SessionOut(BaseModel):
    id: UUID


class MessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    content: str
