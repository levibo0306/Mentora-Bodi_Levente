# `pages/Missions.tsx` leírása

A napi küldetések és heti célok oldala. Betöltéskor párhuzamosan kéri le a küldetéstörténetet és a heti összesítést. A `useMemo` dátum szerint csoportosítja a küldetéseket, így napokra bontva jelenhetnek meg. A progress százalék a `progress / target` arányból készül, a teljesített feladat külön állapotot kap.

Adatforrása az `api/users.ts`; backend oldalon a `routes/users.ts` és `services/gamification.ts` állítja elő az adatokat.
