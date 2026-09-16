# Teljes projekt-audit – 2026-09-16

## Átvizsgált területek

- backend és frontend forráskód
- adatbázisséma és kiegészítő migráció
- unit, integrációs és E2E tesztek
- workspace-, TypeScript-, Vite-, Vitest- és Playwright-konfiguráció
- CI, telepítési és beadási dokumentáció
- verziókezelt statikus és generált artefaktok

A `node_modules`, `.git`, build-, coverage- és Terraform provider-cache könyvtárak generált tartalomként nem kézi forrásaudit tárgyai.

## Elvégzett javítások

- Megszűnt a beépített JWT fallback titok; `JWT_SECRET` nélkül a backend nem ír alá tokent.
- A JWT payload szerepköre, email címe és UUID azonosítója futásidőben is validálva van.
- Sérült localStorage felhasználói adat esetén a token és a felhasználó is törlődik.
- Az üres publikus kvíz külön állapotot kapott, így nincs nullával osztás vagy hiányzó kérdés miatti hiba.
- Kikerültek a futó alkalmazásból nem hivatkozott régi MVP-komponensek, segédmodulok és a gyökérben maradt statikus HTML-prototípus.
- A korábbi, holt segédkódot vizsgáló teszteket offline kvízszinkron- és JWT-tesztekkel váltottuk fel.
- A coverage a ténylegesen használt offline modulokat méri.
- A tesztriport, traceability és backend környezeti dokumentáció aktualizálva lett.

## Ellenőrzött eredmény

- TypeScript typecheck: sikeres
- Backend: 15/15 teszt sikeres
- Frontend: 5/5 unit teszt sikeres
- Frontend coverage: 91,74% sor, 71,69% ág
- Playwright: 2/2 E2E folyamat sikeres
- Production build: sikeres
- `npm audit --omit=dev`: 0 sérülékenység
- `git diff --check`: sikeres

## Nyitott, beadás előtt mérlegelendő tételek

### Magas prioritás

1. **Express async hibakezelés.** A projekt Express 4-et használ. Több async route-ban a Zod-validálás a lokális `try` blokkon kívül történik, ezért hibás kérésnél egy elutasított Promise nem minden esetben jut el a globális hibakezelőhöz. Következő technikai lépésként minden async handlert wrapperrel kell védeni, vagy kontrollált Express 5 migráció szükséges.
2. **Megoldókulcs a kliensen.** A teljes kérdéslista-végpont az offline működés miatt a helyes válasz indexét is visszaadja az arra jogosult diáknak. Gyakorló módban ez elfogadható kompromisszum, valódi számonkérésnél azonban a kliens nem tekinthető biztonságosnak. Assessment módban külön, megoldókulcs nélküli letöltési stratégia ajánlott.
3. **Adatbázis-létrehozás két lépésben történik.** A `schema.sql` után kötelező a migráció futtatása. Hosszabb távon verziózott migrációs könyvtár és egyetlen bootstrap parancs lenne biztonságosabb.

### Közepes prioritás

1. A logout token-visszavonás csak memóriában él, szerverújraindítás után elveszik; a frontend jelenleg lokálisan léptet ki.
2. Nincs rate limiting a login-, AI-generáló és publikus megosztási végpontokon.
3. A UI legfontosabb komponenseihez még nincs komponensszintű teszt; az alapfolyamatokat jelenleg E2E tesztek védik.
4. Az API route-okban sok `any` típus található. Express Request típus-kiegészítéssel és DTO-kkal fokozatosan szigorítható.
5. A `/metrics` `quizzesCreated` mezője nincs bekötve a kvízlétrehozásba, ezért mindig nulla.

### Függőségek

A teljes `npm audit` 5 fejlesztői sebezhetőséget jelez a Vite/esbuild/Vitest láncban. A production dependency audit tiszta. Az automatikus javítás Vite 8-as breaking upgrade-et kér, ezért ezt külön migrációként, build- és E2E-ellenőrzéssel érdemes elvégezni; `npm audit fix --force` beadás előtt nem ajánlott.

## Felesleges vagy történeti artefaktok

- A workspace gyökér `package-lock.json` fájlja a kanonikus lock; a két alkalmazás saját lockfájlja később eltávolítható, ha minden telepítés következetesen a gyökérből történik.
- A Terraform `plan.out` generált és platformfüggő artefakt. Történeti sprintbizonyítékként megtartható, aktív infrastruktúra-forrásként nem kezelendő.
- A `.DS_Store` fájlok ignorálva vannak; nem részei a verziókezelt beadási tartalomnak.
