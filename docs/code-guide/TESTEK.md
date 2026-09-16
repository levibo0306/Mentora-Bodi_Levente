# Tesztek értelmezése

## Frontend unit tesztek

Az offline quiz és flashcard tesztek a localStorage mentést, queue-zást és szinkronizálást ellenőrzik. Gyorsak, böngésző nélkül futnak.

## Frontend E2E

Az `apps/frontend/tests/e2e/mentora.spec.ts` valódi böngészőben, mockolt backend válaszokkal ellenőrzi a kvízkészítést, adaptív kitöltést, a villanásmentes fülváltást és a csevegés elérhetőségét.

## Backend tesztek

- `adaptive.spec.ts`: adaptív nehézség és rangsorolás.
- `ai.spec.ts`: AI service válasz- és hibakezelés.
- `auth.spec.ts`: belépési/jogosultsági viselkedés.
- `documentText.spec.ts`: PDF/DOCX szövegkinyerés és validáció.
- `app.spec.ts`: Express végpontok alap működése.

Az E2E teszt azt vizsgálja, hogy több fájl együtt jól működik; a unit teszt egy kisebb algoritmust vagy modult izoláltan.
