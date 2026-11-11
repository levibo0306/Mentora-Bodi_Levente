# Frontend (apps/frontend)

## Tech
- Vite + React + TypeScript
- Vitest (unit tesztek)

## Futtatás

A repó gyökeréből:

```bash
npm ci
npm run dev:frontend
```

Alapértelmezett cím: `http://localhost:5173`

## API kapcsolódás
Lokálban a `vite.config.ts` proxyzza az alábbi útvonalakat a backendre:
- `/api` → `http://localhost:3001`
- `/health` → `http://localhost:3001`
- `/metrics` → `http://localhost:3001`

## Tesztek

```bash
npm test
npm run test:ci
```

## Környezeti változók
- A helyi Vite proxyhoz a `VITE_API_BASE_URL` maradjon üres. Külön API-kiszolgálónál a mintát másold `.env` néven, és add meg az API URL-jét.
