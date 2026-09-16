# Traceability

| Funkció | Ellenőrzés | Implementáció | CI lépés |
|---|---|---|---|
| Offline Flashcards | `tests/unit/offline_flashcards.spec.ts` | `src/infra/offlineFlashcards.ts` | frontend unit |
| Offline kvíz és szinkron | `tests/unit/offline_quizzes.spec.ts` | `src/infra/offlineQuizzes.ts` | frontend unit |
| PDF-alapú kvízkészítés | `tests/e2e/mentora.spec.ts` | `src/ui/CreateQuizForm.tsx` | Playwright E2E |
| Adaptív kvíz UI | `tests/e2e/mentora.spec.ts` | `src/ui/QuizPlayer.tsx` | Playwright E2E |
| Adaptív rangsorolás | `apps/backend/tests/adaptive.spec.ts` | `apps/backend/src/services/adaptive.ts` | backend unit |
| JWT konfiguráció és token-validálás | `apps/backend/tests/auth.spec.ts` | `apps/backend/src/middleware/auth.ts` | backend unit |
| Dokumentumfeldolgozás | `apps/backend/tests/documentText.spec.ts` | `apps/backend/src/services/documentText.ts` | backend unit |
| Health/auth védelem | `apps/backend/tests/app.spec.ts` | `apps/backend/src/index.ts` | backend integration |

A frontend tesztutak az `apps/frontend` könyvtárhoz képest értendők. A workflow: `.github/workflows/ci.yml`.
