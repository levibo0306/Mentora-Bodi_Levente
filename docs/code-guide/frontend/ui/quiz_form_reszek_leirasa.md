# `frontend/src/ui/quiz-form` részei

- `QuizBasicsStep.tsx`: cím, leírás, mód és saját téma kiválasztása.
- `QuestionEditor.tsx`: kérdésszöveg, válaszok, helyes index és nehézség szerkesztése.
- `QuizReviewStep.tsx`: mentés előtti összegzés és függő kérdés figyelmeztetése.

Ezek megjelenítő komponensek. Az adatokat és eseménykezelő függvényeket propként kapják a `CreateQuizForm` szülőtől, ezért az üzleti folyamat továbbra is egy helyen követhető.
