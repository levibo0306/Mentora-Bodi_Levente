# `api/quizzes.ts` leírása

## Szerepe

A kvíz funkció frontend adatmodellje és teljes backend kliensrétege.

## Típusok

`Quiz`, `CreateQuizDto`, `CreateQuestionDto`, `QuizQuestion`, `AdaptiveQuizQuestion`, `QuizSubmission`, `QuizResult`, `QuizAttempt`, `QuizQuestionStats` és `QuizResults`. Ezek írják le, milyen adatot vár és ad vissza az API.

## Függvénycsoportok

- Lista/részletek: `getQuizzes`, `getQuiz`, `getQuizQuestions`, `getAdaptiveQuizQuestions`, `getImportableQuizzes`.
- Módosítás: `createQuiz`, `updateQuiz`, `deleteQuiz`, `createQuestion`, `updateQuestion`.
- Kitöltés és elemzés: `submitQuizAttempt`, `getQuizResults`.
- AI: `generateQuestionsAI` szövegből, `generateQuestionsFromDocument` feltöltött PDF/DOCX fájlból generál kérdéseket. Mindkettő támogat megszakítási signalt.

## Kapcsolatok

A `QuizList`, `QuizPlayer`, `CreateQuizForm`, `Results`, `Flashcards` és offline modulok használják. Backend oldalon főként a `routes/quizzes.ts` felel meg neki.
