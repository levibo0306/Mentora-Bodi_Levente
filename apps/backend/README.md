# Backend (apps/backend)

## Tech
- Node.js + Express (ESM)
- TypeScript futtatás: `tsx watch`
- PostgreSQL driver: `pg`
- Input validáció: `zod`

## Futtatás

```bash
npm install
npm run dev
```

Alapértelmezett port: `3001`

## Környezeti változók
- `.env.example` → másold `.env`-be.

Kötelező:
- `DATABASE_URL`

Opcionális:
- `PORT` (default 3001)
- `SENTRY_DSN` (ha bekötöd a Sentry-t)
- `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (default `qwen3:4b`)
- `OLLAMA_TIMEOUT_MS` (default `120000`)
- `OLLAMA_NUM_CTX` (default `4096`, a modell memóriaigényét korlátozza)

## Végpontok (prototípus)
- `GET /health` – DB connectivity check
- `GET /metrics` – alap metrikák (prototípus szint)
- `GET /api/quizzes` – kvízek listája
- `POST /api/quizzes` – új kvíz létrehozása
- `DELETE /api/quizzes/:id` – kvíz törlése
