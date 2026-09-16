# `backend/src/revokedTokens.ts` leírása

Egyszerű memóriabeli JWT visszavonási lista. A `revokeToken` kijelentkezéskor hozzáadja a tokent, az `isTokenRevoked` pedig auth ellenőrzéskor vizsgálja. Fontos korlát: szerverújraindításkor kiürül, több backend példány között nem közös. Prototípushoz megfelelő; éles skálázott rendszerben Redis vagy adatbázis alapú lista lenne szükséges.
