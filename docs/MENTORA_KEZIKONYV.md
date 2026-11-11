# Mentora kézikönyv – az első kattintástól az adatbázisig

Ez a leírás szándékosan egyszerű nyelvet használ. Nem kell hozzá előre tudni a Reactet, az Expresst vagy az adatbázisokat. A cél az, hogy lásd:

1. miből áll a projekt;
2. hogyan indul el;
3. mi történik egy kattintás után;
4. melyik fájl és függvény mit csinál;
5. hogyan működik az online és az offline használat;
6. hol érdemes keresni, ha valami elromlik.

---

## 1. Az egész alkalmazás egy étteremhez hasonlít

Képzelj el egy éttermet:

- A **frontend** az étkező. Ezt látja és ezt használja a vendég.
- A **React komponensek** az asztalok, gombok, űrlapok és étlapok.
- A **frontend API-fájlok** a pincérek. Elviszik a kérést a konyhába.
- A **backend** a konyha. Ellenőriz, számol és elkészíti a választ.
- A **route** megmondja, melyik szakácshoz kerüljön a kérés.
- A **service** egy különleges konyhai gép: például pontot számol vagy AI-kérdést készít.
- A **PostgreSQL adatbázis** a raktár és a füzet, amiben minden tartós adat megmarad.
- A **JWT token** a belépőkártya. Ebből tudja a backend, hogy ki kér valamit.
- A **localStorage** egy kis fiók a böngészőben. Az offline adatok és a belépés egy része itt marad.

A legfontosabb út mindig ez:

```text
felhasználó kattint
  → React eseménykezelő
  → frontend API-függvény
  → HTTP kérés
  → Express route
  → service vagy adatbázis
  → JSON válasz
  → React state frissül
  → a képernyő újrarajzolódik
```

---

## 2. A projekt fő mappái

```text
mentora-prototype/
├── apps/
│   ├── frontend/              amit a böngésző megjelenít
│   │   ├── src/
│   │   │   ├── api/           kérések a backend felé
│   │   │   ├── context/       közösen használt belépési állapot
│   │   │   ├── infra/         offline mentés és szinkron
│   │   │   ├── pages/         teljes oldalak
│   │   │   ├── ui/            kisebb felületi elemek
│   │   │   ├── App.tsx        URL-ek és oldalak összekötése
│   │   │   ├── main.tsx       a frontend legelső fájlja
│   │   │   └── styles.css     a kinézet
│   │   └── tests/             frontend és böngészős tesztek
│   └── backend/
│       ├── src/
│       │   ├── middleware/    kérés előtti ellenőrzések
│       │   ├── routes/        API-végpontok
│       │   ├── services/      számolási és üzleti logika
│       │   ├── types/         TypeScript-kiegészítések
│       │   ├── db.ts          adatbázis-kapcsolat
│       │   ├── index.ts       a backend legelső fájlja
│       │   ├── migrate.ts     új táblák és mezők létrehozása
│       │   └── seed.ts        próba felhasználók
│       ├── sql/schema.sql     az alap adatbázisséma
│       └── tests/             backend tesztek
├── docs/                      dokumentáció
└── package.json               közös parancsok
```

Ökölszabály:

- ami képernyőn látszik, azt először a `frontend/src/pages` vagy `frontend/src/ui` alatt keresd;
- ami hálózati kérés, azt a `frontend/src/api` alatt keresd;
- ami adatot ment vagy jogosultságot ellenőriz, azt a `backend/src/routes` alatt keresd;
- ami számol vagy átalakít, azt a `backend/src/services` alatt keresd.

---

## 3. React-alapok nagyon egyszerűen

### 3.1 Komponens

A komponens egy függvény, amely megmondja, mi jelenjen meg.

```tsx
function Koszones() {
  return <h1>Szia!</h1>;
}
```

A Mentora `Dashboard`, `Login`, `QuizPlayer` és `Navbar` elemei mind komponensek.

### 3.2 JSX

A JSX HTML-hez hasonló leírás TypeScript-fájlban. Kapcsos zárójelben JavaScript-érték kerülhet a felületre:

```tsx
<h1>Szia, {user.username}!</h1>
```

### 3.3 Props

A prop olyan, mint egy csomag, amit a szülő komponens átad a gyermeknek:

```tsx
<QuizList onEdit={openQuizForm} />
```

Itt a `QuizList` megkapja az `onEdit` függvényt. Ha szerkesztést kér, meghívja ezt a függvényt.

### 3.4 State és `useState`

A state a komponens rövid távú memóriája:

```tsx
const [loading, setLoading] = useState(false);
```

- `loading`: a jelenlegi érték;
- `setLoading(true)`: új értéket ad;
- a React ezután újrarajzolja az érintett részt.

### 3.5 `useEffect`

A `useEffect` valamit egy esemény után futtat. Például oldalnyitás után adatot kér le:

```tsx
useEffect(() => {
  getTopics().then(setTopics);
}, []);
```

Az üres `[]` azt jelenti: egyszer fusson le a komponens megjelenésekor.

### 3.6 Context

Az `AuthContext` olyan közös hátizsák, amit sok komponens elér. Ebben van a bejelentkezett felhasználó és a belépés/kilépés függvénye. Így nem kell minden oldalon külön átadni.

### 3.7 Router

A router az URL alapján választ oldalt:

```text
/login       → Login
/            → Dashboard
/play/:id    → QuizPlayer
/profile     → Profile
```

A `:id` változó rész. Például `/play/123` esetén az `id` értéke `123`.

### 3.8 Eseménykezelő

Az `onClick`, `onChange` és `onSubmit` egy felhasználói műveletre futó függvény:

```tsx
<button onClick={saveQuiz}>Mentés</button>
```

### 3.9 Feltételes megjelenítés

```tsx
{loading ? <p>Betöltés...</p> : <QuizList />}
```

Ha `loading` igaz, a betöltési szöveg látszik. Egyébként a lista.

---

## 4. Így indul el a frontend

### `src/main.tsx`

Ez az első frontend fájl.

1. Megkeresi az `index.html` `root` elemét.
2. A `ReactDOM.createRoot(...).render(...)` elindítja a Reactet.
3. A `BrowserRouter` bekapcsolja az URL-alapú navigációt.
4. Az `AuthProvider` minden oldalnak elérhetővé teszi a felhasználót.
5. Az `App` megjeleníti a megfelelő oldalt.
6. Regisztrálja a service workert az offline statikus fájlokhoz.
7. Induláskor és az internet visszatérésekor meghívja a `syncOfflineWork` függvényt.

`syncOfflineWork` egyszerre próbálja elküldeni:

- a net nélkül kitöltött kvízeket;
- a net nélkül értékelt tanulókártyákat.

### `src/App.tsx`

Az `App` három dolgot végez:

1. kirakja a globális hibajelzőt;
2. belépett felhasználónál kirakja a navigációt;
3. az URL-hez kiválasztja az oldalt.

Az első `useEffect` egyszer naplózza a diák alkalmazásnyitását. A második az útvonal alapján naplózza a profil, küldetések vagy kártyák meglátogatását.

### `ProtectedRoute`

A védett útvonal „ajtónálló”:

- ha még töltődik a belépés, vár;
- ha nincs felhasználó, a login oldalra küld;
- ha tanári oldalhoz diák érkezik, a kezdőlapra küld;
- egyébként megmutatja a kért oldalt.

---

## 5. Bejelentkezés és regisztráció

Teljes út:

```text
Login.tsx
→ AuthContext.login vagy AuthContext.register
→ api/auth.ts
→ POST /api/auth/login vagy /register
→ backend routes/auth.ts
→ users tábla
→ JWT token
→ localStorage + AuthContext
→ Dashboard
```

### Frontend függvények

- `loginApi(identifier, password)`: elküldi a belépési adatokat.
- `registerApi(...)`: elküldi az új fiókot.
- `updateProfileApi(...)`: módosítja a profilt.
- `AuthProvider`: betölti és közösen tárolja a sessiont.
- `persist(token, user)`: state-be és localStorage-ba ment.
- `login`: meghívja a `loginApi`-t, majd a `persist`-et.
- `register`: ugyanaz regisztrációval.
- `updateProfile`: friss adatot és új tokent ment.
- `logout`: kitörli a helyi tokent és felhasználót.
- `useAuth`: hozzáférést ad a contexthez, és szól, ha rossz helyen használják.

### Backend függvények

- `jwtSecret()`: elkéri a kötelező titkot a környezetből.
- `signToken(payload)`: 24 órás belépőkártyát készít.
- `requireAuth`: ellenőrzi a Bearer tokent, majd `req.user`-be teszi a felhasználót.
- `optionalAuth`: elfogad névtelen kérést is, de jó tokennél felismeri a felhasználót.
- `requireRole(role)`: tanári vagy diákszerepet kér.
- `revokeToken` és `isTokenRevoked`: kijelentkezés után memóriában letiltja a tokent.

---

## 6. A dashboard

A `pages/Dashboard.tsx` a tanár és a diák közös kezdőlapja.

Fontos state-ek:

- `showModal`: nyitva van-e a kvízablak;
- `refreshKey`: mentés után újratölti a listát;
- `editingQuizId`: új kvíz készül vagy meglévőt szerkesztünk;
- `activeTab`: melyik diákfül látszik;
- `quizSource`: saját vagy megosztott kvízek.

Fontos függvények:

- `openQuizForm(id)`: megnyitja a kvízszerkesztőt;
- `closeQuizForm()`: bezárja és törli a szerkesztési azonosítót;
- `handleQuizSaved()`: bezárás után frissíti a listát.

A fülek `hidden` attribútummal maradnak a lapon. Emiatt fülváltáskor nem veszítik el a saját state-jüket.

---

## 7. Kvíz létrehozása kézzel vagy AI-val

Teljes út:

```text
Dashboard
→ Modal
→ CreateQuizForm
→ api/quizzes.ts
→ backend routes/quizzes.ts vagy quizGeneration.ts
→ quizzes + questions táblák
→ lista frissítése
```

### A három képernyő

1. `QuizBasicsStep`: cím, leírás, mód és téma.
2. Kérdések: AI-panel, `QuestionEditor`, mentett kérdések listája.
3. `QuizReviewStep`: utolsó ellenőrzés.

### `CreateQuizForm` fontos függvényei

- `resetQuestionEditor()`: kiüríti a kérdés mezőit.
- `getQuestionFromInput()`: ellenőrzi, hogy van kérdés és legalább két válasz.
- `handleAddQuestion()`: új kérdést ad a listához vagy frissíti a szerkesztettet.
- `handleGenerateQuestions()`: szöveget vagy dokumentumot küld az AI-nak.
- `handleSubmit()`: létrehozza/frissíti a kvízt, majd elmenti az új kérdéseket.

### Kézi kérdés

1. A felhasználó beírja a kérdést és válaszokat.
2. A rádiógomb megadja a helyes választ.
3. A csúszka 1–5 közötti nehézséget ad.
4. A „Kérdés mentése” csak a frontend listájába teszi.
5. A „Kvíz véglegesítése” küldi az új elemeket a backendnek.

### AI szövegből

1. Legalább 50 karakter tananyag kell.
2. `generateQuestionsAI` POST kérést küld a `/api/quizzes/generate-ai` címre.
3. A backend Zoddal ellenőrzi a szöveget és a darabszámot.
4. `generateQuizFromText` meghívja az Ollama `/api/chat` végpontját.
5. A modell kötött JSON-formátumot ad.
6. A Zod ezt a választ is ellenőrzi.
7. A kérdések szerkeszthető listába kerülnek; nem mentődnek vakon.

### AI PDF/DOCX fájlból

1. A böngésző ellenőrzi a 8 MB-os méretkorlátot.
2. `generateQuestionsFromDocument` `FormData` csomagban küldi a fájlt.
3. A `quizGenerationRouter` Multerrel memóriába olvassa.
4. `extractDocumentText` PDF-ből vagy DOCX-ből szöveget készít.
5. Üres vagy nem támogatott fájlnál érthető hibát ad.
6. Legfeljebb 7000 karakter jut az AI-hoz.
7. Az AI ugyanúgy szerkeszthető kérdéslistát ad vissza.

### AI segédfüggvények

- `ollamaConfig()`: cím, modell és opcionális API-kulcs.
- `requestAbortSignal(res)`: megszakítja a munkát, ha a kliens bezárja a kérést.
- `generateQuizFromText(...)`: időkorlát, Ollama-kérés, JSON-feldolgozás és ellenőrzés.
- `normalizeText(...)`: megtisztítja a dokumentumszöveget.
- `isPdf(...)`, `isDocx(...)`: felismeri a fájlt.
- `extractDocumentText(...)`: kinyeri és levágja a szöveget.

---

## 8. Kvíz kitöltése és adaptív nehézség

```text
QuizList
→ /play/:id
→ QuizPlayer
→ getAdaptiveQuizQuestions
→ GET /api/quizzes/:id/adaptive-questions
→ rankAdaptiveQuestions
→ válaszok
→ submitQuizAttempt
→ POST /api/quizzes/:id/attempt
→ pont + profil + XP + küldetés
```

### Adaptív kiválasztás

- `estimateTargetDifficulty(score)`: a korábbi átlagból 1–5 közötti célnehézséget számol.
- `rankAdaptiveQuestions(...)`: előre veszi azt, amit a diák kevésbé tud, ami illik a célszinthez, és az új kérdéseket is kipróbáltatja.

Az adaptív rész nem kérdés közben cserélgeti a következő feladatot. A kitöltés elején állít össze személyre szabott kérdéssort. Ez egyszerűbb, kiszámíthatóbb és még valóban személyre szabott.

### Beküldés

1. A backend csak az elküldött, valóban ehhez a kvízhez tartozó kérdéseket fogadja el.
2. Összehasonlítja a válaszindexet a helyes indexszel.
3. Frissíti a kérdés összesített sikerességét és nehézségét.
4. Diáknál frissíti a `student_question_profiles` személyes tudásprofilt.
5. Elmenti az `attempts` rekordot.
6. Pontszázalékot és XP-t ad vissza.
7. Frissíti a streaket és a napi küldetéseket.

---

## 9. Offline kvíz

Az offline funkció nem azt jelenti, hogy az egész szerver a böngészőben fut. A már letöltött tananyag használható internet nélkül.

### Letöltés

- `saveOfflineQuiz(quiz, questions)`: a kvízt és kérdéseket a jelenlegi felhasználó saját localStorage-kulcsába menti.
- `listOfflineQuizzes()`: visszaadja a mentett kvízeket.
- `getOfflineQuiz(id)`: megkeres egy kvízt.
- `removeOfflineQuiz(id)`: törli a helyi példányt.

### Kitöltés net nélkül

1. A `QuizPlayer` az API sikertelenségekor megnézi a helyi példányt.
2. A diák kitölti.
3. `queueOfflineAttempt` sorba teszi a válaszokat.
4. A böngészőben az eredmény helyben kiszámítható.
5. Internet visszatérésekor a `syncOfflineAttempts` egyenként elküldi a sort.
6. Csak a sikeresen elküldött elemek tűnnek el a sorból.

Fontos: kijelentkezés előtt érdemes szinkronizálni. A helyi adatok felhasználónként külön kulcson vannak.

---

## 10. Megosztás

### Bejelentkezés nélküli publikus kvíz

```text
ShareModal
→ POST /api/quizzes/:id/share
→ token
→ /shared/:token
→ SharedQuiz
→ GET /api/share/:token
→ POST /api/share/:token/submit
```

- A token egy nehezen kitalálható megosztási kód.
- A `SharedQuiz` betöltési, hiba-, üres-, játék- és eredménynézetet kezel.
- `SharedPage` adja a közös hátteret.
- `CenteredCard` adja a középre tett állapotkártyát.
- `ResultView` kiszámolja és megmutatja a százalékot.
- A publikus beküldés pontoz, de nem igényel fiókot.

### Saját fiókhoz hozzáadás

A `SharedAdd` kód alapján meghívja a claim végpontot. Ezután a megosztott kvíz, téma vagy kártyacsomag megjelenik a megfelelő listában.

---

## 11. Tanulókártyák és offline ismétlés

Fontos frontend API-függvények:

- `getFlashcardPacks`: csomaglista;
- `getFlashcardPack`: csomag és kártyái;
- `createFlashcardPack`: új csomag;
- `importQuizAsPack`: kvízből kártyacsomag;
- `reviewFlashcard`: értékelés elküldése;
- `deleteFlashcardPack`: törlés;
- `getFlashcardPackStats`: tanári statisztika;
- `shareFlashcardPack`: megosztás;
- `claimFlashcardPack`: kód elfogadása.

Offline függvények:

- `saveOfflineFlashcardPack`: helyi csomag mentése;
- `listOfflineFlashcardPacks`: mentett csomagok;
- `getOfflineFlashcardPack`: egy csomag;
- `removeOfflineFlashcardPack`: helyi törlés;
- `asOfflinePackSummary`: a helyi kártyákból listanézeti számokat készít;
- `applyOfflineFlashcardReview`: internet nélkül kiszámolja a következő ismétlést;
- `queueOfflineFlashcardReview`: várólistába teszi az értékelést;
- `syncOfflineFlashcardReviews`: internetnél elküldi a várólistát.

A következő ismétlés ideje a minőség, az ismétlésszám, az intervallum és az `ease_factor` alapján változik.

---

## 12. Témák

A téma egy doboz, amelyhez kvízek és kártyacsomagok tartozhatnak.

Frontend függvények:

- `getTopics`, `getTopic`: lista és részlet;
- `getTopicStats`: tanári összesítés;
- `createTopic`, `deleteTopic`: létrehozás és törlés;
- `shareTopic`: megosztási kódok;
- `claimTopic`: megosztott téma felvétele.

A `TopicsPanel` a dashboardon listáz és létrehoz. A `TopicDetail` egy témára szűrve mutatja a kvízeket és kártyákat.

---

## 13. Visszajelzés és üzenetek

```text
Feedback oldal
→ getFeedbackContacts
→ partner kiválasztása
→ getFeedbackMessages + getFeedbackTargets
→ sendFeedbackMessage
→ feedback_messages tábla
```

Backend segédfüggvények:

- `resolvePair(user, partnerId)`: megállapítja a tanár–diák párt, és ellenőrzi, van-e köztük tanulási kapcsolat;
- `getFeedbackTargets(pair)`: összegyűjti a közös témákat, kvízeket és kártyákat.

Üzenetet csak valódi tanulási kapcsolatban lévő tanár és diák válthat.

---

## 14. XP, rang, streak, napi küldetés és heti cél

- `computeLevel(xp)`: minden 100 XP után új szint.
- `computeRank(level)`: a szintből rangnevet ad.
- `todayKey`, `yesterdayKey`, `weekStartKey`: helyi nap- és hétkulcsokat készít.
- `getUserXp`: kiolvassa az XP-t.
- `addXp`: XP-t és szintet frissít.
- `pickRandomMissions`: különböző napi feladatokat választ.
- `ensureDailyMissions`: pontosan három mai küldetést biztosít.
- `updateStreakOnAttempt`: egymást követő aktív napokat számol.
- `getCurrentStreak`: visszaadja a sorozatot.
- `recordLearningEvent`: eseményt ment és frissíti a küldetést.
- `getWeeklyGoal`: heti kvíz-, kártya- és aktívnap-célt számol.
- `updateDailyMissionsOnAttempt`: egy kvíz után meghívja a szükséges frissítéseket.

A `DashboardOverview`, `Profile` és `Missions` csak megjeleníti ezeket; a hiteles számítás a backendben történik.

---

## 15. A közös HTTP-függvény

Az `api/http.ts` minden frontend kérés központja.

### `api<T>(path, init)`

1. Összerakja a teljes címet.
2. JSON-kérésnél beállítja a `Content-Type` fejlécet.
3. A localStorage tokenjét Bearer fejlécként hozzáadja.
4. Elküldi az időzóna-eltolást.
5. GET kérésnél átmeneti hibára legfeljebb háromszor próbálkozik.
6. 401-nél törli a hibás sessiont és loginra irányít.
7. A választ JSON-ként vagy szövegként adja vissza.
8. Hibánál `ApiError` objektumot készít és globális értesítést küld.

### További segédek

- `getErrorMessage(error, fallback)`: ismeretlen hibából biztonságos szöveget készít.
- `wait(ms)`: újrapróbálkozás előtt vár.
- `notifyError(message)`: eseményt küld az `ErrorToaster` számára.

---

## 16. Backend indulás

### `backend/src/index.ts`

1. Betölti a `.env` változókat.
2. Opcionálisan elindítja a Sentry hibajelentést.
3. Létrehozza az Express alkalmazást.
4. Beállítja a CORS engedélyezett frontend címeket.
5. Bekapcsolja a JSON body olvasását.
6. Számolja és naplózza a kéréseket.
7. Felcsatolja az auth, quiz, share, user, flashcard, topic és feedback routereket.
8. Felcsatolja az utolsó hibakezelőt.
9. Teszten kívül figyelni kezd a megadott porton.

Technikai végpontok:

- `GET /health`: megkérdezi az adatbázist, hogy él-e;
- `GET /metrics`: kérés- és hibaszámlálót ad.

### `db.ts`

- `pool`: újrahasznosítható PostgreSQL kapcsolatok készlete;
- `healthcheck()`: lefuttatja a `select 1` próbát.

### `migrate.ts` és `seed.ts`

- `migrate()`: biztonságosan létrehozza az újabb táblákat, mezőket és indexeket;
- `seed()`: próba tanárt és diákot készít;
- mindkettő a végén lezárja a saját adatbázis-poolját.

---

## 17. Backend route-térkép

### Auth – `/api/auth`

- `POST /register`: fiók létrehozása;
- `POST /login`: belépés;
- `GET /me`: saját fiók;
- `PATCH /me`: profil és opcionális jelszó módosítása;
- `POST /logout`: token visszavonása.

### Kvíz – `/api/quizzes`

- `GET /`: elérhető saját/alap kvízek;
- `GET /shared-with-me`: nekem címzett kvízek;
- `GET /importable`: kártyává alakítható kvízek;
- `GET /:id/results`: részletes tanári eredmények;
- `GET /:id`: kvíz alapadatai;
- `POST /`: új kvíz;
- `PUT /:id`: kvíz módosítása;
- `DELETE /:id`: saját kvíz törlése;
- `POST /:id/questions`: kérdés létrehozása;
- `PUT /:id/questions/:qid`: kérdés szerkesztése;
- `GET /:id/questions`: teljes kérdéslista;
- `GET /:id/adaptive-questions`: személyre szabott kérdéssor;
- `POST /:id/attempt`: kitöltés pontozása és mentése.

A `canAccessQuiz` ellenőrzi a tulajdont, közvetlen kvízmegosztást és témamegosztást.

### AI – szintén `/api/quizzes`

- `POST /generate-ai`: kérdések szövegből;
- `POST /generate-ai-file`: kérdések PDF/DOCX fájlból.

### Megosztás – `/api`

- `POST /quizzes/:id/share`: token készítése;
- `POST /share/claim`: kód elfogadása;
- `GET /share/:token`: publikus kvíz betöltése;
- `POST /share/:token/submit`: publikus pontozás.

### Kártyák – `/api/flashcards`

- csomaglista, csomagrészlet, létrehozás és törlés;
- kvíz importálása;
- kártyaértékelés;
- tanári statisztika;
- megosztás és kód elfogadása.

A `canReadPack` ellenőrzi, hogy a felhasználó tulajdonos-e vagy kapott-e hozzáférést.

### Témák – `/api/topics`

- lista, részlet, statisztika;
- létrehozás, módosítás, törlés;
- megosztás és kód elfogadása.

### Felhasználó – `/api/users`

- `GET /me/overview`: dashboard/profil összesítés;
- `GET /me/missions`: küldetések;
- `GET /me/weekly-goal`: heti cél;
- `POST /me/activity`: frontend esemény naplózása.

### Feedback – `/api/feedback`

- `GET /contacts`: kapcsolatok;
- `GET /:partnerId`: üzenetek;
- `GET /:partnerId/targets`: közös tananyagok;
- `POST /:partnerId`: üzenet küldése.

---

## 18. Adatbázistáblák emberi nyelven

- `users`: fiókok, szerep, XP, szint;
- `quizzes`: kvízek;
- `questions`: kérdések és helyes válaszok;
- `attempts`: kitöltések és pontszámok;
- `student_question_profiles`: diák–kérdés tudásszint;
- `quiz_shares`: kvízmegosztások;
- `topics`: témák;
- `topic_shares`: témamegosztások;
- `flashcard_packs`: kártyacsomagok;
- `flashcards`: kártyák;
- `flashcard_reviews`: ismétlési állapot;
- `flashcard_shares`: kártyamegosztások;
- `feedback_messages`: tanár–diák üzenetek;
- `learning_events`: tanulási események;
- `daily_missions`: napi feladatok;
- `weekly_goals`: heti célok;
- `user_streaks`: egymást követő aktív napok.

Az idegen kulcs azt jelenti, hogy egy rekord egy másikhoz tartozik. Például egy kérdés `quiz_id` mezője megmondja, melyik kvízhez tartozik.

---

## 19. Tesztek

### Backend

- `adaptive.spec.ts`: nehézségbecslés és rangsorolás;
- `ai.spec.ts`: helyi és felhős Ollama-kérés;
- `auth.spec.ts`: token és jogosultság;
- `documentText.spec.ts`: PDF/DOCX feldolgozás;
- `app.spec.ts`: egész Express alkalmazás alap viselkedése.

### Frontend unit

- `offline_quizzes.spec.ts`: helyi kvíz és várólista;
- `offline_flashcards.spec.ts`: kártyaértékelés és szinkron.

### E2E

A Playwright valódi böngészőt vezérel. A fő felhasználói folyamatokat ellenőrzi, miközben a backend válaszait kiszámítható módon helyettesíti.

Parancsok:

```bash
npm run typecheck
npm run test:backend
npm run test:frontend:ci
npm run test:e2e
npm run build
npm run verify
```

---

## 20. Hogyan kövess végig bármilyen hibát?

Példa: „A kvízmentés nem működik.”

1. Nézd meg a gombot a `CreateQuizForm.tsx` fájlban.
2. Kövesd a `handleSubmit` függvényt.
3. Nézd meg, melyik API-függvényt hívja: `createQuiz` vagy `updateQuiz`.
4. Nézd meg az URL-t az `api/quizzes.ts` fájlban.
5. Keresd meg ugyanazt az URL-t a backend `routes/quizzes.ts` fájlban.
6. Nézd meg a Zod-sémát: elfogadja-e az adatot?
7. Nézd meg az SQL-kérést és az adatbázis hibaüzenetét.
8. Ellenőrizd a böngésző Network paneljén a státuszkódot és a választ.
9. Futtasd a kapcsolódó teszteket.

Ez a módszer szinte minden funkciónál működik:

```text
képernyő → eseménykezelő → frontend API → backend route → service/SQL
```

---

## 21. Mi lett szándékosan egyszerűsítve?

- A korábbi `index.tsx` egyszerre tartalmazta a dashboardot, route-okat és védelmet. Most `App.tsx`, `Dashboard.tsx` és `ProtectedRoute.tsx` külön, egyértelmű feladatot kapott.
- A kvízűrlap alapadatai, kérdésszerkesztője és áttekintése külön kis komponens.
- A publikus kvíz inline stílusai a közös CSS-be kerültek, a komponens 411 sorról jóval rövidebb lett.
- Az AI route-ok külön `quizGeneration.ts` fájlba kerültek.
- A frontend API alapértelmezett eredménye már nem `any`, hanem `unknown`.
- Az Express `req.user` és `req.token` rendes típust kapott.
- A mindig nulla `quizzesCreated` technikai számláló kikerült.
- A nem használt, részletes eredmény-végpontot duplázó `GET /api/quizzes/:id/stats` kikerült. A használt `/:id/results` változat megmaradt.

Nem változott a design, az URL-ek felhasználó által használt része, a kvíz-, megosztás-, offline-, kártya-, téma-, feedback-, profil- vagy gamifikációs folyamat.

---

## 22. Rövid tanulási sorrend

Ha először tanulod a projektet, ebben a sorrendben olvasd:

1. `apps/frontend/src/main.tsx`
2. `apps/frontend/src/App.tsx`
3. `apps/frontend/src/context/AuthContext.tsx`
4. `apps/frontend/src/pages/Dashboard.tsx`
5. egy választott UI-fájl, például `QuizPlayer.tsx`
6. a hozzá tartozó `api/*.ts` fájl
7. a hozzá tartozó backend `routes/*.ts` fájl
8. az útvonal által használt `services/*.ts` fájl
9. `apps/backend/sql/schema.sql`

Nem kell egyszerre mindent megjegyezni. Elég mindig egy felhasználói kattintást végigkövetni a képernyőtől az adatbázisig és vissza.
