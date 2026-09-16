# `ui/DashboardOverview.tsx` leírása

Lekéri a felhasználói összefoglalót, majd szerepkör szerint eltérő kompakt kártyát jelenít meg. Tanárnál aktív kvíz, diákszám és átlag látható. Diáknál rang, következő szintig hiányzó XP, progress bar, streak, egy következő napi cél és két fő statisztika jelenik meg.

A `nextMission` először befejezetlen küldetést keres. Az XP százalékot a jelenlegi XP és `next_level_xp` alapján számolja, maximum 100%-ra korlátozva. Adatforrása az `api/users.ts`.
