# `api/users.ts` leírása

A profil, dashboard és gamifikáció frontend API-ja. A `UserOverview` tartalmazza a szerepkörfüggő statisztikákat, XP-t, szintet, rangot, badge-eket, streaket és napi küldetéseket. A `getUserOverview` a dashboard és profil összefoglalóját, a `getUserMissions` a küldetéstörténetet, a `getWeeklyGoal` a heti aktivitást kéri le. A `trackActivity` olyan nem-kvízes eseményeket jelent a backendnek, mint a témanyitás vagy profilmegtekintés.

A backend párja a `routes/users.ts`, a számítások nagy része pedig a `services/gamification.ts` fájlban történik.
