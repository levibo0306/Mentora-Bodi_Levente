# `backend/src/db.ts` leírása

Központi PostgreSQL kapcsolatpool. A `DATABASE_URL` alapján létrehozott `pool` minden route és service közös adatbázis-belépési pontja. A pool újrahasznosítja a kapcsolatokat, ezért minden lekérdezéshez nem kell új kapcsolatot nyitni. A `healthcheck` egy egyszerű `SELECT 1` lekérdezéssel ellenőrzi az elérhetőséget; ezt a `/health` végpont használja.
