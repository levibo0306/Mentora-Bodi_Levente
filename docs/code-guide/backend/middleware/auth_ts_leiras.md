# `backend/src/middleware/auth.ts` leírása

## Szerepe

JWT tokenek létrehozása és ellenőrzése, valamint szerepkörös hozzáférés-védelem.

## Függvények

- `jwtSecret`: kötelezően beolvassa a titkos kulcsot.
- `signToken`: aláírja a user ID-t, emailt és szerepkört tartalmazó payloadot.
- `requireAuth`: Bearer tokent vár, ellenőrzi a visszavonási listát, verifikálja és Zod sémával validálja, majd `req.user`-re teszi.
- `optionalAuth`: ugyanez, de hiányzó/hibás tokennél vendégként engedi tovább a kérést.
- `requireRole`: a már hitelesített user szerepét ellenőrzi.

A védett route-ok ezt middleware-ként kapják. A publikus megosztás `optionalAuth`-ot használ, hogy bejelentkezett kitöltőnél userhez is köthető legyen az eredmény.
