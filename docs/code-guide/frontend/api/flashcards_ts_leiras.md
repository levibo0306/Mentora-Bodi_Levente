# `api/flashcards.ts` leírása

A tanulókártyák típusai és HTTP műveletei. A `Flashcard` egy kérdés–válasz kártya, a `FlashcardPack` a kártyák csomagja, a `NewCard` mentés előtti egyszerű forma.

A modul listáz, részletes csomagot kér le, csomagot készít, kvízt importál, ismétlési minőséget küld, statisztikát kér, töröl, megosztási linket készít és megosztási kódot fogad be. Fő fogyasztója a `ui/Flashcards.tsx`, az offline működésben az `infra/offlineFlashcards.ts` is használja. Backend párja a `routes/flashcards.ts`.
