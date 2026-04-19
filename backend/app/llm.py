from typing import AsyncIterator
from openai import AsyncOpenAI
from app.config import get_settings

_settings = get_settings()
_client = AsyncOpenAI(api_key=_settings.openai_api_key)


async def stream_chat(messages: list[dict]) -> AsyncIterator[str]:
    stream = await _client.chat.completions.create(
        model=_settings.openai_model,
        messages=messages,
        stream=True,
    )
    async for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token
