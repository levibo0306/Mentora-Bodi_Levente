# `backend/src/index.ts` leírása

A backend belépési pontja és Express alkalmazása. Betölti a környezeti változókat és megfigyelési modult, beállítja a CORS engedélyezett domaineket, JSON feldolgozást és egyszerű request/error metrikát. A `/health` az adatbázist is ellenőrzi, a `/metrics` prototípus-metrikákat ad.

Itt csatlakoznak a routerek: auth, quizzes, share, users, flashcards, topics és feedback. A fájl végi error middleware fogja meg a route-okból továbbadott hibákat. Tesztelhetőség miatt az `app` exportált; a szerver csak akkor indul figyelni, amikor a fájl közvetlenül fut.
