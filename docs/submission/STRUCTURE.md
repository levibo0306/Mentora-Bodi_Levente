# Beadási struktúra és fájl-mapping

## Cél
A projekt eredetileg a kurzus sprint-template-jével indult. A projekt növekedésével a kód és a dokumentáció vegyesen, sprint-mappák alatt kezdett szétcsúszni.
Ezért a beadáshoz egy **letisztított monorepo** szerkezet készült, ahol:
- a futtatható kód az `apps/` alatt van,
- a dokumentáció és sprint artefaktumok a `docs/` alatt,
- a validátor és sémák külön, `tools/` alatt.

## Új mappák szerepe

### `apps/frontend`
A kliens alkalmazás (Vite + React).

### `apps/backend`
A szerver (Express) és PostgreSQL perzisztencia.

### `docs/`
PRD/ADR és az összes sprinthez tartozó dokumentum (piackutatás, interjúk, specek, wireframe-ek, riportok).

### `tools/`
A kurzus template-ből átvett validátor és JSON sémák.

## Mapping az eredeti struktúrából

### Frontend
- **régi:** `index.html` (root) + `sprints/02/src/` + `sprints/02/tests/`
- **új:** `apps/frontend/index.html` + `apps/frontend/src/` + `apps/frontend/tests/`

Megjegyzés: az `index.html` script útvonala frissítve lett ` /src/main.tsx`-re.

### Backend
- **régi:** `server/`
- **új:** `apps/backend/`

### Sprint dokumentáció
- **régi:** `sprints/01/*`
- **új:** `docs/sprint-01/*`

- **régi:** `sprints/02/{ai,deploy,docs,infra,reports,scripts,wireframes}`
- **új:** `docs/sprint-02/` alatt ugyanezek a mappák

### Template és meta
- **régi:** `README.md` (kurzus template)
- **új:** `docs/template/COURSE_TEMPLATE_README.md`

- **régi:** `course.yaml`
- **új:** `docs/course.yaml`

### Validátor és sémák
- **régi:** `scripts/` (root)
- **új:** `tools/scripts/`

## Miért jó ez beadásnál?
- A futtatható kód egy helyen: `apps/`
- A dokumentumok egy helyen: `docs/`
- Könnyen átadható: `git clone` → `npm install` → futtatás
