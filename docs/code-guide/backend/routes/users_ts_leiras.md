# `routes/users.ts` leírása

A dashboard/profil és gamifikációs végpontok.

- `GET /me/overview`: tanárnál kvízstatisztikát, diáknál próbálkozásokat, badge-eket, XP-t, szintet, rangot, streaket és napi küldetést ad.
- `GET /me/missions`: dátum szerint rendezett küldetéstörténet.
- `GET /me/weekly-goal`: heti aktivitási összesítő.
- `POST /me/activity`: nem-kvízes tanulási eseményt rögzít.

A rangot a service `computeRank`, a szintet a `computeLevel` számolja. A badge-ek feltételei jelenleg ebben a route-ban vannak felsorolva.
