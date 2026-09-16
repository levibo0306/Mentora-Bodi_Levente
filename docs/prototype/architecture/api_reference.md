# API referencia

A backend alapértelmezett címe `http://localhost:3001`. A védett végpontok `Authorization: Bearer <token>` fejlécet várnak.

## Rendszer

- `GET /health` – adatbázis-kapcsolat ellenőrzése
- `GET /metrics` – egyszerű technikai számlálók

## Auth

- `POST /api/auth/register` – regisztráció
- `POST /api/auth/login` – bejelentkezés
- `PATCH /api/auth/me` – profil/jelszó módosítása
- `POST /api/auth/logout` – token visszavonása

## Kvízek és adaptív tanulás

- `GET /api/quizzes` – saját vagy témához tartozó kvízek
- `GET /api/quizzes/shared-with-me` – velem megosztott kvízek
- `GET /api/quizzes/importable` – Flashcards-importhoz használható kvízek
- `GET /api/quizzes/:id` – kvíz alapadatai
- `POST /api/quizzes` – kvíz létrehozása
- `PUT /api/quizzes/:id` – kvíz módosítása
- `DELETE /api/quizzes/:id` – kvíz törlése
- `GET /api/quizzes/:id/questions` – teljes kérdéssor szerkesztéshez/offline mentéshez
- `GET /api/quizzes/:id/adaptive-questions?limit=10` – személyre szabott kérdéssor, helyes válaszok nélkül
- `POST /api/quizzes/:id/questions` – kérdés létrehozása
- `PUT /api/quizzes/:id/questions/:questionId` – kérdés módosítása
- `POST /api/quizzes/:id/attempt` – válaszok kiértékelése és tanulói profil frissítése
- `GET /api/quizzes/:id/results` – próbálkozások és kérdésstatisztikák a tulajdonosnak

## AI-generálás

- `POST /api/quizzes/generate-ai` – JSON body: `{ "text": "...", "count": 5 }`
- `POST /api/quizzes/generate-ai-file` – multipart body: `file` (PDF/DOCX, max. 8 MB), `count`

A fájl végpont maximum 7000 karaktert ad át az Ollamának. Szövegréteg nélküli PDF-hez előzetes OCR szükséges.

## Megosztás és témák

- `POST /api/quizzes/:id/share` – kvíz megosztása
- `POST /api/share/claim` – kvízkód beváltása
- `GET /api/share/:token` – publikus link adatainak lekérése
- `POST /api/share/:token/submit` – publikus kvíz kitöltése
- `GET|POST /api/topics` – témák listázása/létrehozása
- `GET|PUT|DELETE /api/topics/:id` – téma lekérése/módosítása/törlése
- `POST /api/topics/:id/share` – téma megosztása
- `POST /api/topics/share/claim` – témakód beváltása

## Flashcards

- `GET|POST /api/flashcards/packs` – csomagok listázása/létrehozása
- `GET|DELETE /api/flashcards/packs/:id` – csomag lekérése/törlése
- `POST /api/flashcards/packs/import-quiz` – csomag készítése kvízből
- `POST /api/flashcards/packs/:id/review` – kártyaismétlés mentése
- `GET /api/flashcards/packs/:id/stats` – tanulói statisztika
- `POST /api/flashcards/packs/:id/share` – megosztás
- `POST /api/flashcards/share/claim` – megosztási kód beváltása

## Felhasználó és visszajelzés

- `GET /api/users/me/overview` – dashboard, XP, badge-ek, streak
- `GET /api/users/me/missions` – napi küldetések
- `GET /api/users/me/weekly-goal` – heti cél
- `POST /api/users/me/activity` – tanulási esemény
- `GET /api/feedback/contacts` – elérhető kapcsolatok
- `GET|POST /api/feedback/:partnerId` – üzenetek lekérése/küldése
- `GET /api/feedback/:partnerId/targets` – kapcsolható tanulási elemek
