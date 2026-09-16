# `pages/Profile.tsx` leírása

## Szerepe

A fiókadatok módosítása és a diák személyes fejlődésének megjelenítése.

## Működés

Az első `useEffect` lekéri a `UserOverview` adatot; a második a szerkesztőmezőket szinkronban tartja az `AuthContext` userével. A `submit` biztonsági okból mindig elküldi a jelenlegi jelszót, az új jelszó opcionális. Siker után törli a jelszómezőket és státuszt mutat.

Diáknál a profil megjeleníti a szintet, rangot és XP-t. A rangot nem a frontend számolja: a backend `computeRank` eredménye érkezik a `/api/users/me/overview` válaszában.
