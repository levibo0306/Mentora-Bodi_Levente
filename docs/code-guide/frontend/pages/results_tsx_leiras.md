# `pages/Results.tsx` leírása

Csak tanárok számára elérhető eredményelemző oldal. Először betölti a tanár kvízeit, majd a kiválasztott kvízhez lekéri az összes próbálkozást és kérdésstatisztikát. A `selectedQuizId` a kvízszűrőt, a `selectedAttemptId` a részletesen kibontott próbálkozást vezérli.

Megjelenít összesített pontszámot, kitöltéseket, diákadatokat és válaszopciónkénti eloszlást. Az adatot az `api/quizzes.ts` `getQuizResults` függvénye és a backend `GET /api/quizzes/:id/results` végpontja biztosítja.
