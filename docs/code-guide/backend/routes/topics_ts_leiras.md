# `routes/topics.ts` leírása

Témák listázása, részletei, tanári statisztikája, létrehozása, módosítása, törlése és megosztása. A hozzáférés tulajdon vagy elfogadott megosztás alapján történik. A `/:id/stats` tanári szerepet kér. A share végpont tokeneket készít, a `/share/claim` diáknál felveszi a témát. Törlésnél az adatbázis idegen kulcsainak szabályai rendezik a kapcsolódó tartalmakat.
