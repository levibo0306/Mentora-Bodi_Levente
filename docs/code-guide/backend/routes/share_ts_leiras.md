# `routes/share.ts` leírása

A kvízek tokenes megosztási folyamata.

- `POST /quizzes/:id/share`: a tulajdonos címzettenként vagy általánosan tokeneket készít, opcionális továbbosztási engedéllyel.
- `POST /share/claim`: bejelentkezett diák a tokent saját megosztott listájához kapcsolja.
- `GET /share/:token`: publikus kvíz és kérdések lekérése; a helyes válaszokat nem adja ki.
- `POST /share/:token/submit`: tokenes válaszokat pontoz és eredményt ment.

A frontend `ShareModal`, `SharedAdd` és `SharedQuiz` folyamatai ehhez kapcsolódnak.
