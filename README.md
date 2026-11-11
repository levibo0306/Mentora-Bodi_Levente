# Mentora – Prototype Repository

Ez a repó a Mentora projekt prototípus állapotú, beadásra előkészített, letisztított verziója.

## 1) Mappastruktúra

```
mentora-prototype/
├─ apps/
│  ├─ frontend/        # Vite + React kliens (src/, tests/)
│  └─ backend/         # Express API + PostgreSQL (src/)
└─ docs/               # dokumentáció
```

## 2) Gyors indítás (lokál)

### Előfeltételek
- Node.js 20.19+ vagy 22.12+ (ajánlott: 22 LTS)
- PostgreSQL (helyben futó szerver)
- Ollama (opcionális, a helyi AI kérdésgeneráláshoz)

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

### AI kérdésgenerálás

A backend helyi Ollamát vagy API-kulccsal távoli Ollama szolgáltatást is tud hívni. A helyi futtatásnak nincs kérésenkénti díja; a felhős szolgáltatás saját keretekkel és árazással működik.

1. Töltsd le és telepítsd az Ollama macOS alkalmazást: https://ollama.com/download/mac
2. Nyisd meg az Ollama alkalmazást.
3. Töltsd le a modellt:

```bash
ollama pull qwen3:4b
```

Az alkalmazás futása közben az Ollama API automatikusan elérhető. A modell és az elérési cím az `apps/backend/.env` fájlban felülírható:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_API_KEY=
OLLAMA_TIMEOUT_MS=120000
OLLAMA_NUM_CTX=4096
```

A kvízkészítő második lépésében illeszd be a tananyagot, vagy tölts fel egy legfeljebb 8 MB-os PDF/DOCX dokumentumot. Válaszd ki a kérdésszámot, majd ellenőrizd a listába kerülő kérdéseket mentés előtt. Szkennelt, szövegréteg nélküli PDF-hez előzetes OCR szükséges; 7000 karakternél hosszabb dokumentumból az első 7000 karakter kerül az AI-hoz.

### Backend indítás
Az adatbázisséma első betöltése után hozd létre a tesztfiókokat:

```bash
(set -a; source apps/backend/.env; set +a; psql "$DATABASE_URL" -f apps/backend/sql/schema.sql)
npm run migrate
npm run seed
```

Már létező adatbázisnál csak az új, biztonságosan ismételhető migráció szükséges:

```bash
npm run migrate
```

Teszt belépők:

- Diák: `diak@mentora.local` / `Mentora123!`
- Tanár: `tanar@mentora.local` / `Mentora123!`

Ezután indítsd el a backendet:

```bash
npm run dev:backend
```

### Frontend indítás
Új terminálban:
```bash
npm run dev:frontend
```

A frontend alapértelmezetten: `http://localhost:5173`

### Környezeti konfiguráció

A backend `.env` fontosabb mezői:

- `DATABASE_URL` – PostgreSQL kapcsolat
- `JWT_SECRET` – hosszú, véletlen titok
- `CORS_ORIGINS` – engedélyezett frontend origine(k), vesszővel elválasztva
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_API_KEY` – helyi vagy távoli Ollama szolgáltatás

A frontendhez másold az `apps/frontend/.env.example` fájlt `.env` néven. Publikus telepítésnél a `VITE_API_BASE_URL` értéke a backend HTTPS URL-je legyen.

## 3) Tesztek

Frontend tesztek:
```bash
npm run test:frontend
```

Backend és böngészős E2E tesztek:
```bash
npm run test:backend
npm run test:e2e
```

Az E2E tesztek első CI-futtatása előtt telepítsd a Playwright Chromiumot:
```bash
npx playwright install chromium
```

Az összes teszt egymás után:
```bash
npm run test:all
```

Typecheck, backend tesztek, coverage és production build egy parancsban:
```bash
npm run verify
```

CI-szerű futtatás coverage-zel:
```bash
npm run test:frontend:ci
```

## 4) Dokumentáció

A részletes dokumentumok a `docs/` mappában vannak (PRD/ADR, Sprint 1-2 anyagok, prototype).
A végső beadás lépései: [`docs/submission/CHECKLIST.md`](docs/submission/CHECKLIST.md).
A teljes technikai audit és a nyitott javaslatok: [`docs/submission/AUDIT.md`](docs/submission/AUDIT.md).
A teljes, kezdőknek szánt működési és React-kézikönyv: [`docs/MENTORA_KEZIKONYV.md`](docs/MENTORA_KEZIKONYV.md).

### Offline gyakorlás kipróbálása

A frontend éles buildje előre gyorsítótárazza a betöltéshez szükséges fájlokat. Helyben a futó backend mellett indítsd el a frontendet az `npm run build`, majd az `npm run preview` parancsokkal. Ha a frontend külön API-címet használ, az legyen elérhető a buildben beállított címen; a helyi proxy használatához a `VITE_API_BASE_URL` maradjon üresen.

Jelentkezz be online, tölts le egy gyakorlókvízt, majd ugyanabban a böngészőben próbáld megnyitni hálózat nélkül. A vizsgakvízhez szerverkapcsolat szükséges. Új vizsgához használj új kvízt, ha egy korábbi gyakorlókvíz megoldásait már megosztottad vagy letöltötték.
