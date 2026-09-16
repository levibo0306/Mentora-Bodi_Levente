# `services/gamification.ts` leírása

## Szint és rang

`computeLevel(xp) = floor(xp / 100) + 1`, tehát minden 100 XP új szint.

| Rang | Szint | XP-tartomány |
|---|---:|---:|
| Újonc | 1–2 | 0–199 |
| Tanuló | 3–4 | 200–399 |
| Felfedező | 5–6 | 400–599 |
| Haladó | 7–8 | 600–799 |
| Mester | 9–10 | 800–999 |
| Legenda | 11+ | 1000+ |

`addXp` növeli az XP-t és az adatbázisban tárolt szintet is frissíti.

## Küldetések és streak

Az `actions` lista definiálja a lehetséges tanulási eseményeket. A `generatedMissions` nehézséghez 25/45/70 XP jutalmat rendel. Az `ensureDailyMissions` naponta három különböző feladatot biztosít, régi vagy duplikált rekordokat takarít. A dátumot a kliens időzóna-eltolásával számolja.

`recordLearningEvent` elmenti az eseményt, majd frissíti az érintett napi küldetések progressét és teljesítéskor egyszer ad XP-t. `updateStreakOnAttempt` az egymást követő aktív napokat kezeli. `getWeeklyGoal` heti aktivitást összesít, `updateDailyMissionsOnAttempt` pedig kvízeredményből frissít küldetéseket.
