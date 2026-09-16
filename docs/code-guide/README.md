# Mentora kódkalauz

Ez a mappa a Mentora működését fájlonként magyarázza el. A leírásokat a forráskód mappaszerkezete szerint rendeztük, így például az `apps/frontend/src/ui/Modal.tsx` dokumentációja a `frontend/ui/modal_tsx_leiras.md` fájlban található.

## Hogyan érdemes olvasni?

1. Kezdd a `frontend/index_tsx_leiras.md` és a `backend/index_ts_leiras.md` fájlokkal. Ezek adják a két alkalmazás belépési pontjait.
2. Ezután olvasd el az `auth_context_tsx_leiras.md` és `middleware/auth_ts_leiras.md` dokumentumokat a bejelentkezés megértéséhez.
3. Egy konkrét funkciónál kövesd ezt a láncot: **oldal vagy UI komponens → frontend API fájl → backend route → service → adatbázistábla**.
4. A teljes adatmodellt a `backend/schema_sql_leiras.md`, a rangokat és XP-t a `backend/services/gamification_ts_leiras.md` magyarázza.

## Fő adatáramlás

`React esemény → src/api modul → HTTP kérés → Express route → service/adatbázis → JSON válasz → React state → képernyő`

Példa: a kvíz beküldése a `QuizPlayer.tsx` komponensből a `api/quizzes.ts` fájl `submitQuizAttempt` függvényén át jut a backend `routes/quizzes.ts` próbálkozás-végpontjára. Az elmenti az eredményt, majd a gamifikációs service XP-t, streaket és küldetést frissít.

## Dokumentált területek

- `frontend/`: indulás, routing, stílusok és hitelesítési állapot
- `frontend/api/`: a backend hívásai és az adatmodellek
- `frontend/pages/`: teljes útvonalhoz tartozó képernyők
- `frontend/ui/`: újrahasznosítható és összetett felületi egységek
- `frontend/infra/`: offline tárolás és későbbi szinkronizálás
- `backend/`: szerverindítás, adatbázis, migráció és hitelesítés
- `backend/routes/`: HTTP végpontok
- `backend/services/`: üzleti logika

Nem készült külön leírás automatikusan előállított fájlokhoz (`dist`, coverage, lock fájlok), deklarációs segédfájlokhoz és képekhez, mert ezek nem tartalmaznak alkalmazási döntési logikát.
