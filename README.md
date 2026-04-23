# LLM Chat Interface

## What it is

A minimal, production-shaped LLM chat application: a Next.js chat UI talks to a FastAPI backend that streams tokens from OpenAI over a single HTTP connection, with conversation history persisted to Postgres so the model can recall prior turns in the session. The whole stack is Dockerized for local dev via `docker compose` and deployed to Zeabur as three services (managed Postgres, backend, frontend).

## Architecture

```
┌─────────────────┐  fetch (streamed)   ┌──────────────────┐    ┌──────────────┐
│  Next.js (web)  │ ───────────────────▶│  FastAPI (api)   │───▶│  PostgreSQL  │
│  React chat UI  │◀──── tokens ────────│  /chat/stream    │    │  (messages)  │
└─────────────────┘                     └──────────────────┘    └──────────────┘
                                                 │
                                                 ▼
                                            OpenAI API
                                        (gpt-4o-mini, stream)
```

On every send, the frontend POSTs to `/chat/stream` with `credentials: 'include'`. The backend resolves the session from an HttpOnly cookie, loads the full message history from Postgres, persists the new user message, calls the LLM wrapper, and streams each token to the client as it arrives. When the stream closes cleanly, the assistant reply is persisted as a single row.

## Tech stack

- **Backend:** FastAPI, SQLAlchemy 2.x (async) + Alembic, `AsyncOpenAI` SDK, Pydantic v2
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Database:** PostgreSQL 16
- **Testing:** `pytest` + `httpx.AsyncClient` (backend), `vitest` + React Testing Library (frontend)
- **Deploy:** Docker, Docker Compose, Zeabur (3 services)

## Local development

```bash
git clone <this-repo>
cd llm-interface
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
docker compose up --build
```

Then visit [http://localhost:3000](http://localhost:3000).
For public view [http://llm-interface.zeabur.aoo](llm-interface.zeabur.app)

Services exposed by `docker-compose.yml`:

- `postgres` → `localhost:5432`
- `backend` (FastAPI) → `localhost:8000`
- `frontend` (Next.js) → `localhost:3000`

Alembic migrations run automatically on backend container start.

## Running tests

### Backend (pytest)

```bash
cd backend
pip install -r requirements.txt
pytest
```

Tests use an in-memory SQLite DB and stub the LLM wrapper via `monkeypatch.setattr(app.llm, "stream_chat", ...)` with a fake that yields pre-canned tokens — no network, fully deterministic.

### Frontend (vitest)

```bash
cd frontend
npm install
npm test
```

### E2E (Playwright)

In one terminal, bring the stack up:

```bash
docker compose up
```

In another terminal:

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```
Note: Tried, but did not succeed

## Deploying to Zeabur

The project ships as three Zeabur services:

| Service | Source | Notes |
|---|---|---|
| `postgres` | PostgreSQL docker image | |
| `backend` | Repo, root `backend/` | Python / FastAPI; runs `alembic upgrade head` on start |
| `frontend` | Repo, root `frontend/` | Next.js (standalone output) |

**Backend env vars:**

- `OPENAI_API_KEY` — OpenAI key
- `DATABASE_URL` — linked from the Postgres service
- `FRONTEND_ORIGIN=https://<frontend-url>` — for CORS
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`

**Frontend env vars:**

- `NEXT_PUBLIC_API_URL=https://<backend-url>`

Zeabur health-checks `/health` on the backend.

## Design decisions

### LLM wrapper pattern

`backend/app/llm.py` is the **only** module in the codebase that imports `openai`. It exposes a single async generator:

```python
async def stream_chat(messages: list[dict]) -> AsyncIterator[str]: ...
```

Everything else — the chat router, the tests — depends on this interface, not on the OpenAI SDK. First, **testability:** tests replace `stream_chat` via `app.dependency_overrides` with a fake that yields pre-canned tokens, so the test suite runs in milliseconds and has zero network flakes. Second, **swappability:** switching to Gemini, Anthropic, or a local Ollama model touches exactly one file.

### HttpOnly cookie sessions

The session ID lives in an `HttpOnly; Secure; SameSite=None` cookie set by `POST /sessions`. It is never visible to JavaScript, so an XSS bug cannot exfiltrate it. The frontend opts in to sending it with `credentials: 'include'` on every fetch. Because the browser refuses to send credentials to a wildcard CORS origin, the backend is configured with an **explicit** `FRONTEND_ORIGIN` and `allow_credentials=True`. Uses `SameSite=Lax` + `Secure=false`; prod uses `SameSite=None` + `Secure=true`, driven by env.

### Stateless backend, DB as source of truth

There is no in-memory conversation cache. Every `/chat/stream` request rebuilds the message list by reading from Postgres, appends the new user turn, calls the LLM, and writes the assistant reply back. The backend carries no per-session state between requests, so horizontal scaling is free — any instance can serve any request, and restarts or re-deploys lose nothing. The DB is the single, authoritative conversation log.

### Raw `text/plain` streaming, not SSE

The backend returns `StreamingResponse(media_type="text/plain; charset=utf-8")` and the frontend consumes it with `response.body.getReader()`. There is exactly one streaming endpoint producing exactly one content type — SSE's `data: ...\n\n` framing and event-type multiplexing would be ceremony for no benefit. To stop reverse proxies from buffering the stream (which would defeat the whole point), the response sets `X-Accel-Buffering: no` and `Cache-Control: no-cache`.


**NOTE**: Since this is a simple demo site, it does not handle multiple chat sessions, so there's no "New Chat" button, please use incognito mode to use a fresh session. 
