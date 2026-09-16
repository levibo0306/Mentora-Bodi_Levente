# Publikus telepítés

Ehhez a folyamathoz saját hosting- és adatbázis-hozzáférés szükséges.

## 1. PostgreSQL

1. Hozz létre egy PostgreSQL adatbázist a választott szolgáltatónál.
2. Másold ki a TLS-kompatibilis `DATABASE_URL` kapcsolatot.
3. Egy megbízható gépen töltsd be az alapsémát, majd a migrációkat:

```bash
psql "$DATABASE_URL" -f apps/backend/sql/schema.sql
npm run migrate
npm run seed
```

A `seed` csak demonstrációs környezetben ajánlott.

## 2. Backend

A szolgáltatás munkakönyvtára a repository gyökere legyen.

- telepítés: `npm ci`
- indítás: `npm --workspace apps/backend run start`
- health check: `/health`

Környezeti változók:

```env
DATABASE_URL=postgres://...
JWT_SECRET=legalabb-32-karakteres-veletlen-ertek
CORS_ORIGINS=https://frontend-pelda.hu
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

## 3. Ollama helyi gép nélkül

### Ajánlott demonstrációs megoldás: Ollama Cloud

1. Hozz létre egy Ollama API-kulcsot.
2. Válassz az Ollama Cloudban közvetlenül elérhető modellt.
3. A **backend** szolgáltatás titkos környezeti változóiként állítsd be:

```env
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_API_KEY=az-ollama-api-kulcs
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_TIMEOUT_MS=180000
OLLAMA_NUM_CTX=4096
```

Az API-kulcs kizárólag a backend környezetében szerepelhet; nem kerülhet `VITE_` változóba, frontend buildbe vagy verziókezelésbe. Az alkalmazás automatikusan `Authorization: Bearer ...` fejlécet küld. Az Ollama hivatalos leírása: [Cloud API](https://docs.ollama.com/cloud), [API-hitelesítés](https://docs.ollama.com/api/authentication).

Cloud módban a felhasználó által megadott tananyagszöveg az Ollama szolgáltatásához kerül. Bizalmas vagy személyes adatot tartalmazó dokumentumnál inkább privát, saját üzemeltetésű példányt kell használni.

### Alternatíva: saját Ollama VM-en

Az Ollama hivatalos Docker image-e CPU-val is elindítható, de elfogadható válaszidőhöz GPU ajánlott. A modellt tartós Docker volume-ban kell tárolni, a `11434` portot pedig lehetőleg csak a backend privát hálózata felé szabad megnyitni. Hivatalos telepítési leírás: [Ollama Docker](https://docs.ollama.com/docker).

Ebben az esetben:

```env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_API_KEY=
```

Ha az Ollama publikus HTTPS címen érhető el, elé hitelesítést végző reverse proxyt kell tenni, és annak bearer tokenjét lehet `OLLAMA_API_KEY` értékként átadni. Az Ollama nyers helyi API-ja önmagában nem kér hitelesítést.

## 4. Frontend

- telepítés: `npm ci`
- build: `npm run build`
- artifact/output: `apps/frontend/dist`

Build-time változó:

```env
VITE_API_BASE_URL=https://backend-pelda.hu
```

A backend `CORS_ORIGINS` értékének pontosan tartalmaznia kell a frontend originjét, útvonal és záró perjel nélkül.

## 5. Ellenőrzés

```bash
curl -f https://backend-pelda.hu/health
curl -f https://frontend-pelda.hu/
```

Ezután böngészőből ellenőrizd a regisztrációt, login folyamatot, egy kvíz kitöltését és a tanári eredménynézetet. Az AI-demó előtt futtass egy próbagenerálást; ezzel egyszerre ellenőrizhető a kulcs, a modellnév, a timeout és a strukturált JSON-válasz támogatása.
