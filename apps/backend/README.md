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

## Végpontok (prototípus)
- `GET /health` – DB connectivity check
- `GET /metrics` – alap metrikák (prototípus szint)
- `GET /api/quizzes` – kvízek listája
- `POST /api/quizzes` – új kvíz létrehozása
- `DELETE /api/quizzes/:id` – kvíz törlése
