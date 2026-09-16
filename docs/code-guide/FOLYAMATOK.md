# Fő alkalmazási folyamatok

## Bejelentkezés

`Login.tsx → AuthContext.login → api/auth.loginApi → POST /api/auth/login → routes/auth.ts → users tábla → JWT → localStorage/context → ProtectedRoute → dashboard`

## Kvíz létrehozása

`Dashboard → Modal → CreateQuizForm → api/quizzes.createQuiz/createQuestion → routes/quizzes.ts → quizzes/questions táblák → onSuccess → QuizList újratöltés`

## Kvíz kitöltése

`QuizList → /play/:id → QuizPlayer → adaptive-questions → services/adaptive.ts → válaszok → POST attempt → pontozás → attempts/attempt_answers → gamification service → eredmény UI`

## Megosztott kvíz

`ShareModal → routes/share.ts token → link vagy kód → SharedAdd claim / SharedQuiz publikus oldal → token ellenőrzés → kitöltés`

## Tanulókártya

`Flashcards → api/flashcards.ts → routes/flashcards.ts → pack/card táblák → review → learning_events → küldetések`

Offline esetben a csomag és review előbb localStorage-ba kerül, majd a sync függvény küldi el.

## Csevegés

`Navbar Csevegés → Feedback.tsx → api/feedback.ts → routes/feedback.ts → kapcsolatellenőrzés → feedback_messages → frissített üzenetlista`

## Rang és profil

`Profile/DashboardOverview → getUserOverview → routes/users.ts → users.xp → computeLevel → computeRank → JSON → rang megjelenítése`

## Téma

`TopicsPanel → api/topics.ts → routes/topics.ts → topics/share táblák → TopicDetail → témára szűrt QuizList + Flashcards`
