import pytest
from unittest.mock import AsyncMock, MagicMock
from app import llm


class FakeDelta:
    def __init__(self, content): self.content = content

class FakeChoice:
    def __init__(self, content): self.delta = FakeDelta(content)

class FakeChunk:
    def __init__(self, content): self.choices = [FakeChoice(content)]


class FakeStream:
    def __init__(self, tokens): self._tokens = tokens
    def __aiter__(self): return self
    async def __anext__(self):
        if not self._tokens:
            raise StopAsyncIteration
        return FakeChunk(self._tokens.pop(0))


@pytest.mark.asyncio
async def test_stream_chat_yields_non_none_tokens(monkeypatch):
    fake_client = MagicMock()
    fake_client.chat.completions.create = AsyncMock(
        return_value=FakeStream(["Hel", None, "lo", ""])
    )
    monkeypatch.setattr(llm, "_client", fake_client)

    tokens = [t async for t in llm.stream_chat([{"role": "user", "content": "hi"}])]
    assert tokens == ["Hel", "lo"]
