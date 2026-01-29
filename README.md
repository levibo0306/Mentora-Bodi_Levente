# Mentora – Prototype Repository

Ez a repó a Mentora projekt prototípus állapotú, beadásra előkészített, letisztított verziója.

## 1) Mappastruktúra

```
mentora-prototype/
├─ apps/
│  ├─ frontend/        # Vite + React kliens (src/, tests/)
│  └─ backend/         # Express API + PostgreSQL (src/)
└─ docs/               # PRD/ADR és a Sprint 1-2 dokumentáció
```

## 2) Gyors indítás (lokál)

### Előfeltételek
- Node.js 18+ (ajánlott: 20 LTS)
- PostgreSQL (helyben futó szerver)

### Telepítés
A repó gyökérből:

```bash
npm run install:all
```

### Adatbázis
Hozz létre egy adatbázist, pl. `mentora`, majd állítsd be a backend env fájlt:

- `apps/backend/.env` (másold az `.env.example`-t)

Példa:
```
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/mentora
PORT=3001
```

### Backend indítás
```bash
npm run dev:backend
```

### Frontend indítás
Új terminálban:
```bash
npm run dev:frontend
```

A frontend alapértelmezetten: `http://localhost:5173`

## 3) Tesztek

Frontend tesztek:
```bash
npm run test:frontend
```

CI-szerű futtatás coverage-zel:
```bash
npm run test:frontend:ci
```

## 4) Dokumentáció

A részletes dokumentumok a `docs/` mappában vannak (PRD/ADR, Sprint 1-2 anyagok).

