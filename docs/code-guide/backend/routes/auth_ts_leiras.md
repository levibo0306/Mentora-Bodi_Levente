# `routes/auth.ts` leírása

Felhasználói hitelesítés és profilkezelés.

- `POST /register`: validál, ellenőrzi az egyediséget, bcrypt hash-t készít, usert hoz létre és tokent ad.
- `POST /login`: emaillel vagy username-mel keres, ellenőrzi a jelszót és tokent ad.
- `GET /me`: visszaadja az aktuális felhasználót.
- `PATCH /me`: jelenlegi jelszó ellenőrzése után módosítja a username/email értéket és opcionálisan a jelszót.
- `POST /logout`: a tokent a memóriabeli visszavonási listára teszi.

A bemeneteket Zod ellenőrzi, a jelszó soha nem kerül vissza a klienshez.
