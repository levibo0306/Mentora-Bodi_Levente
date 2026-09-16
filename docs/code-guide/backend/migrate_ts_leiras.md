# `backend/src/migrate.ts` leírása

Programból futtatható, ismételhető adatbázis-migráció. `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` és indexutasításokat tartalmaz, így meglévő adatbázison is biztonságosan bővíthet. Többek között a gamifikáció, feedback, flashcard és topic funkciók később hozzáadott tábláit/oszlopait biztosítja. A `migrate` csatlakozik a poolhoz, végrehajtja a teljes SQL blokkot, majd lezárja a kapcsolatot.
