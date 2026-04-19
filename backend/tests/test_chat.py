import pytest


async def _new_session(client):
    r = await client.post("/sessions")
    return r.cookies["session_id"]


@pytest.mark.asyncio
async def test_chat_requires_session_cookie(client, fake_llm):
    r = await client.post("/chat/stream", json={"content": "hi"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_chat_streams_tokens_in_order(client, fake_llm):
    sid = await _new_session(client)
    fake_llm["queue"].append(["Hel", "lo", " world"])
    async with client.stream(
        "POST", "/chat/stream", json={"content": "hi"},
        cookies={"session_id": sid},
    ) as r:
        assert r.status_code == 200
        body = b""
        async for chunk in r.aiter_raw():
            body += chunk
        assert body.decode() == "Hello world"


@pytest.mark.asyncio
async def test_chat_persists_user_and_assistant(client, fake_llm):
    sid = await _new_session(client)
    fake_llm["queue"].append(["Hi", " there"])
    async with client.stream(
        "POST", "/chat/stream", json={"content": "hello"},
        cookies={"session_id": sid},
    ) as r:
        async for _ in r.aiter_raw():
            pass
    h = await client.get("/sessions/me/messages", cookies={"session_id": sid})
    payload = h.json()
    assert [m["role"] for m in payload] == ["user", "assistant"]
    assert [m["content"] for m in payload] == ["hello", "Hi there"]


@pytest.mark.asyncio
async def test_chat_includes_history_on_second_turn(client, fake_llm):
    sid = await _new_session(client)
    fake_llm["queue"].extend([["A"], ["B"]])

    async with client.stream(
        "POST", "/chat/stream", json={"content": "first"},
        cookies={"session_id": sid},
    ) as r:
        async for _ in r.aiter_raw():
            pass

    async with client.stream(
        "POST", "/chat/stream", json={"content": "second"},
        cookies={"session_id": sid},
    ) as r:
        async for _ in r.aiter_raw():
            pass

    second_call = fake_llm["calls"][1]
    roles = [m["role"] for m in second_call]
    contents = [m["content"] for m in second_call]
    assert roles == ["system", "user", "assistant", "user"]
    assert contents[1] == "first"
    assert contents[2] == "A"
    assert contents[3] == "second"


@pytest.mark.asyncio
async def test_chat_empty_content_returns_400(client, fake_llm):
    sid = await _new_session(client)
    r = await client.post(
        "/chat/stream", json={"content": "   "},
        cookies={"session_id": sid},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_chat_llm_error_yields_error_and_does_not_persist_assistant(client, monkeypatch):
    from app import llm as llm_module

    async def boom(messages):
        yield "partial"
        raise RuntimeError("boom")

    monkeypatch.setattr(llm_module, "stream_chat", boom)

    r = await client.post("/sessions")
    sid = r.cookies["session_id"]

    async with client.stream(
        "POST", "/chat/stream", json={"content": "hi"},
        cookies={"session_id": sid},
    ) as resp:
        body = b""
        async for chunk in resp.aiter_raw():
            body += chunk
    assert b"[error:" in body

    h = await client.get("/sessions/me/messages", cookies={"session_id": sid})
    payload = h.json()
    assert [m["role"] for m in payload] == ["user"]
