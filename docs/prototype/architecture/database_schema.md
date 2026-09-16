# Adatbázisséma

A Mentora PostgreSQL-t használ. Új adatbázisnál először az `apps/backend/sql/schema.sql`, utána az idempotens `npm run migrate` futtatandó.

## Alaptáblák

- `users` – fiók, szerepkör, XP és szint
- `quizzes` – kvíz alapadatai, tulajdonos, téma és mód
- `questions` – válaszlehetőségek, helyes index, magyarázat, nehézség és globális statisztika
- `attempts` – felhasználói válaszok és pontszám
- `topics` – tanulási témák/projektek
- `quiz_shares`, `topic_shares` – címzett vagy publikus megosztások
- `daily_missions`, `user_streaks` – gamification állapot

## Migrációval létrejövő táblák

- `flashcard_packs`, `flashcards` – csomagok és kártyák
- `flashcard_reviews` – személyes ismétlési állapot
- `flashcard_shares` – Flashcards-megosztások
- `feedback_messages` – tanár–diák visszajelzések
- `weekly_goals` – heti kvíz-, kártya- és aktívnap-célok
- `learning_events` – tanulási aktivitások
- `student_question_profiles` – tanulónkénti kérdésteljesítmény az adaptív kiválasztáshoz

## Fontos kapcsolatok

- Felhasználó `1:N` kvíz, téma, kitöltés és tanulási esemény
- Kvíz `1:N` kérdés és kitöltés
- Téma `1:N` kvíz és Flashcards-csomag
- Flashcards-csomag `1:N` kártya
- Felhasználó és kérdés `N:M` a `student_question_profiles` kapcsolótáblán keresztül

A részletes SQL a [schema.sql](../../../apps/backend/sql/schema.sql) és [migrate.ts](../../../apps/backend/src/migrate.ts) fájlokban a technikai forrásigazság.
