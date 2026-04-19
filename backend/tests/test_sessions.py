import pytest


@pytest.mark.asyncio
async def test_create_session_sets_cookie(client):
    r = await client.post("/sessions")
    assert r.status_code == 200
    assert "session_id" in r.cookies
    sc = r.headers["set-cookie"]
    assert "HttpOnly" in sc
    assert "samesite=lax" in sc.lower()


@pytest.mark.asyncio
async def test_get_history_without_cookie_401(client):
    r = await client.get("/sessions/me/messages")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_history_returns_empty_for_new_session(client):
    r = await client.post("/sessions")
    sid = r.cookies["session_id"]
    r2 = await client.get("/sessions/me/messages", cookies={"session_id": sid})
    assert r2.status_code == 200
    assert r2.json() == []


@pytest.mark.asyncio
async def test_get_history_with_unknown_session_returns_404(client):
    import uuid
    r = await client.get("/sessions/me/messages", cookies={"session_id": str(uuid.uuid4())})
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_get_history_with_malformed_cookie_returns_401(client):
    r = await client.get("/sessions/me/messages", cookies={"session_id": "not-a-uuid"})
    assert r.status_code == 401
