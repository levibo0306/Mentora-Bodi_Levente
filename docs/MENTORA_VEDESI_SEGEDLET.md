# Mentora – védési segédlet: mit használtam és miért?

## Ha csak fél percem van

„A Mentora egy tanulástámogató webalkalmazás, amelyben kvízeket és tanulókártyákat lehet készíteni és használni. A felülethez Reactot választottam, mert az ismétlődő elemeket, például a kérdésszerkesztőt és a kártyákat, újrafelhasználható komponensekre tudtam bontani. A Vite a fejlesztői szervert és a frontend összeállítását adta. A szerver Node.js-en fut, Expressben írtam meg az API-t, az összekapcsolódó adatokat pedig PostgreSQL-ben tárolom. Az AI-val támogatott kérdésgeneráláshoz Ollamát használok; a kapott kérdéseket mentés előtt át lehet nézni és szerkeszteni.”

## A fő technológiák

| Mit használtam? | Mire használom a Mentorában? | Mit mondjak, ha megkérdezik, miért? |
|---|---|---|
| **React** | A kvízszerkesztő, a tanulókártyák és az irányítópult felülete. | „A felületet kisebb, újrafelhasználható részekre tudtam bontani. Ha például a felhasználó hozzáad egy választ, a felület a változó állapot alapján frissül.” |
| **Vite** | Helyi frontend fejlesztői szerver, gyors frissítés szerkesztés közben, valamint a kiadható frontend összeállítása. Fejlesztéskor továbbítja az API-kéréseket az Expresshez. | „Gyorsan láttam a felületen a módosításaimat, és ugyanazzal az eszközzel el tudtam készíteni a böngészőben futó csomagot.” |
| **TypeScript** | Típusok a frontend és a backend kódjában, például a kvíz és a válasz adatainál. | „Szerkesztéskor és típusellenőrzéskor hamarabb észreveszem, ha egy mező hiányzik vagy rossz típusú. A kívülről érkező adatokat ettől még futás közben is ellenőrzöm.” |
| **React Router** | Az alkalmazás nézeteinek URL-jei, például a belépés, a profil és a kvíz kitöltése. | „Külön URL-t adhattam az oldalaknak, miközben a navigációhoz nem kell minden alkalommal újratölteni az egész alkalmazást.” |
| **Node.js és Express** | A Node.js futtatja a szervert; az Express kezeli a HTTP-végpontokat, például a belépést, a kvíz mentését és a kérdésgenerálást. | „A szerveren is TypeScriptben tudtam dolgozni, és az Expressben közös ellenőrzést tehettem a védett végpontok elé.” |
| **PostgreSQL és a `pg` csomag** | Felhasználók, témák, kvízek, kérdések és eredmények tárolása. A szerver a `pg` csomagon át küld SQL-lekérdezéseket. | „Egy kvízhez több kérdés, egy felhasználóhoz több kitöltés tartozhat. A relációs adatbázisban ezek a kapcsolatok jól modellezhetők, és az adatbázis idegen kulcsokkal is védi őket.” |
| **Zod** | Beérkező adatok és a generált kvízkérdések szerkezetének ellenőrzése. | „A böngészőből vagy a modelltől érkező adatról futás közben kell eldönteni, hogy megfelel-e a várt szerkezetnek. A TypeScript típusai erre önmagukban nem elegendők.” |
| **bcryptjs és JWT** | A jelszavakból bcrypttel ellenőrizhető hash készül. Sikeres belépéskor a szerver aláírt JWT-t ad, amelyet a kliens a védett kérésekkel elküld. | „Így a jelszót nem nyers szövegként tárolom, és a szerver a token ellenőrzése után azonosítani tudja, ki küldte a kérést. A jogosultságokat a szerveren ellenőrzöm.” |

## AI, adaptív gyakorlás és offline mód

- **Ollama és Qwen3 4B:** Az Ollama futtatja és API-n keresztül elérhetővé teszi a modellt; a Qwen3 4B a kódban beállított alapértelmezett modell. „Azért választottam az Ollamát, mert helyi futtatással is be tudom mutatni a kérdésgenerálást. A modell kérdésjavaslatokat ad. A Zod a szerkezetüket ellenőrzi, a tartalmi helyességet mentés előtt a felhasználó tudja ellenőrizni.”
- **Multer, pdf-parse, Mammoth:** A Multer fogadja a fájlt, a pdf-parse a PDF-ből, a Mammoth a DOCX-ből olvassa ki a szöveget. „A modellnek a kivonatolt szöveget küldöm. Így a felhasználónak nem kell kézzel bemásolnia a tananyagot. Szövegréteg nélküli szkennelt PDF-hez előbb szövegfelismerés kell.”
- **Adaptív kérdésválasztás:** „Ez saját pontozási szabály. A meglévő kérdéseket a korábbi teljesítmény, a célnak megfelelő nehézség és a kevésbé gyakorolt kérdések alapján rangsorolom. Az AI kérdést generál, az adaptív algoritmus a meglévő kérdésekből választ.”
- **Service worker és localStorage:** „A service worker az alkalmazás betöltéséhez szükséges fájlok gyorsítótárazásában segít, a localStorage pedig az előre letöltött kvízeket, kártyákat és a később szinkronizálandó műveleteket tárolja. Így egy előre letöltött anyagot internet nélkül is lehet gyakorolni. Ez részleges offline működés.”
- **Gamifikáció:** „A pontok, szintek és napi küldetések visszajelzést adnak a haladásról, és segítenek célt adni a rendszeres gyakorlásnak.”

## Tesztelés és néhány további eszköz

| Eszköz | Mire és miért? |
|---|---|
| **Vitest** | Gyorsan ellenőrizhetők különálló szabályok és függvények, például az adaptív kérdésrangsorolás. |
| **Supertest** | HTTP-kérésekkel tesztelem az Express API válaszait, böngésző nélkül. |
| **Playwright** | Valódi böngészőben lehet ellenőrizni, hogy a felhasználói folyamat több lépése együtt működik-e. |
| **Nano ID** | Rövid, véletlenszerű kódokat állít elő a megosztáshoz. |
| **Sentry** | Konfigurálható szerveroldali hibajelentés: bekapcsolva segít megtalálni a futás közben jelentkező hibákat. |

## Ha visszakérdeznek

- **Mi a React és a Vite közti különbség?** „A Reacttel írom meg, mit lát a felhasználó és hogyan reagál a felület. A Vite azt segíti, hogy ezt gyorsan fejlesszem és a böngésző számára összeállítsam.”
- **Mi történik egy kérdésgeneráláskor?** „A React felületről elindítom a kérést. Az Express ellenőrzi a bemenetet, fájlnál kinyeri a szöveget, majd meghívja az Ollamát. A szerver ellenőrzi a modell válaszának szerkezetét, a felületen pedig megjelennek a szerkeszthető kérdésjavaslatok.”
- **Mi történik, ha leáll az AI?** „Az automatikus generálás hibát jelez, a kérdéseket kézzel továbbra is meg lehet adni.”
- **Miért külön frontend és backend?** „A frontend a felületért felel. A backend ellenőrzi a jogosultságokat és a beérkező adatokat, kezeli az adatbázist, és onnan indul a modellhívás is.”

A példák a projekt csomaglistáin, Vite-konfigurációján és megvalósításán alapulnak.
