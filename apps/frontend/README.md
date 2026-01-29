# Frontend (apps/frontend)

## Tech
- Vite + React + TypeScript
- Vitest (unit tesztek)

## Futtatás

```bash
npm install
npm run dev
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
- `.env.example` → másold `.env.local`-ba, ha szükséges.
