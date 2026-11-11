# `routes/quizzes.ts` leírása

## Szerepe

A legnagyobb backend router: a kvízek teljes életciklusát kezeli.

## Végpontcsoportok

- Lista: saját/elérhető kvízek, megosztott kvízek, flashcardként importálható kvízek.
- Eredmények: tanári összesítés, próbálkozások és kérdés/opció statisztikák.
- CRUD: kvíz lekérése, létrehozása, frissítése, törlése.
- Kérdések: létrehozás, szerkesztés és jogosultságfüggő lekérés.
- Adaptív kitöltés: a közelmúlt teljesítménye alapján rangsorolt kérdéssor.
- Próbálkozás: válaszok pontozása, attempt mentése, XP/streak/küldetés frissítése.
- Az AI-generálás külön `quizGeneration.ts` routerben található, de ugyanazon `/api/quizzes` URL alatt érhető el.

## Kapcsolatok

Az `adaptive` és `gamification` service-eket használja. Adatbázisban főként a `quizzes`, `questions`, `attempts` és `student_question_profiles` táblákkal dolgozik. Minden tulajdonosi műveletnél szerveroldalon ellenőrzi a jogosultságot.
