FROM python:3.12-slim
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./alembic.ini
COPY entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

CMD ["./entrypoint.sh"]
