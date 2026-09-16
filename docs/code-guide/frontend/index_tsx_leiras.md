# `index.tsx` leírása

## Szerepe

Ez a frontend központi vezérlője. Itt található a kezdőlap `Dashboard` komponense, a védett útvonalak ellenőrzése és az összes URL–képernyő megfeleltetés.

## Fontos részek

- `Dashboard`: kezeli az aktív diákfület, a saját/megosztott kvíz nézetet, valamint az új vagy szerkesztett kvíz modalt.
- `handleCreateClick`, `handleEditClick`, `handleSuccess`: a kvízszerkesztő életciklusát irányítják.
- A diákpanelek `hidden` attribútummal maradnak csatolva. Ez szándékos: fülváltáskor nem töltődnek újra, ezért nincs képernyővillanás és az állapotuk sem vész el.
- `ProtectedRoute`: betöltés közben vár, kijelentkezett felhasználót a login oldalra küld, és opcionálisan szerepkört is ellenőriz.
- `App`: megjeleníti a globális hibajelzőt, a navbart és a `Routes` definícióit.
- Két `useEffect` naplózza a diák aktivitását a küldetésekhez.

## Útvonalak

- `/`: dashboard
- `/login`: bejelentkezés/regisztráció
- `/play/:id`: bejelentkezett kvízkitöltés
- `/shared/:token`: publikus megosztott kvíz
- `/results`: csak tanári eredmények
- `/missions`, `/profile`, `/feedback`, `/flashcards`, `/topics/:id`: további védett oldalak

## Adatkapcsolatok

A komponens maga kevés közvetlen API-hívást végez; gyermekkomponenseket szervez. A felhasználó az `AuthContext`-ből érkezik, az aktivitás az `api/users.ts` fájlon át jut a backendhez.
