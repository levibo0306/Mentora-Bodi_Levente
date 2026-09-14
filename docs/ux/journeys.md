# User Journeys

## 1. Tanár új kvízt készít és megosztja

**Persona:** Egyetemi oktató, aki gyorsan szeretne létrehozni egy gyakorló kvízt és linkkel kiküldeni a hallgatóknak.

**Belépési pont:** app megnyitása, majd bejelentkezés.

1. `S01` — A tanár megadja azonosítóját és jelszavát, majd bejelentkezik. A rendszer sikeres auth után a tanári dashboardra navigál. Hibaág: hibás jelszó esetén piros hibaüzenet jelenik meg.
2. `S02` — A tanár a `+ Új kvíz` gombra kattint. A rendszer megnyitja a létrehozó modalt. Hibaág: nincs.
3. `S07` — A tanár kitölti az alapadatokat: cím, leírás, mód, opcionális téma. A rendszer a wizard második lépésére enged. Hibaág: üres cím esetén a végleges mentés nem fog sikerülni.
4. `S07` — A tanár hozzáad legalább egy kérdést és legalább két választ. A rendszer elmenti a kérdést a lokális listába, majd az áttekintésnél véglegesíti a kvízt. Hibaág: ha nincs legalább 2 válasz vagy nincs kérdés, error panel jelenik meg.
5. `S02` — A kvíz megjelenik a kvízlistában. A tanár a `Megosztás` gombra kattint. Hibaág: backend mentési hiba esetén a modal bezárás helyett hibaüzenetet kap.
6. `S08` — A tanár opcionálisan címzetteket ír be és generál egy megosztási linket. A rendszer linket és tokenkódot jelenít meg, amit másolni lehet. Hibaág: share endpoint hiba esetén piros error panel jelenik meg.

**Sikerkritérium:** A kvíz látszik a dashboard listában, és létrejön legalább egy másolható share link vagy token.

**Mért időtartam (kb.):** 60–120 másodperc, 8–14 interakció.

## 2. Diák megosztott kvízt hozzáad és kitölt

**Persona:** Hallgató, aki a tanártól kapott linken vagy kóddal szeretne új kvízt felvenni és megoldani.

**Belépési pont:** app megnyitása és bejelentkezés, vagy meglévő session.

1. `S01` — A diák bejelentkezik. A rendszer a diák dashboardra irányítja. Hibaág: hibás adatoknál hibaüzenet látszik.
2. `S03` — A diák a `Hozzáadás` tabra vált. A rendszer a hozzáadó nézetet nyitja meg. Hibaág: nincs.
3. `S05` — A diák beilleszti a tanártól kapott tokenkódot vagy `/shared/...` linket és a `Hozzáadás` gombra kattint. A rendszer siker esetén státuszüzenetet mutat és átirányít a megosztott listára. Hibaág: rövid vagy hibás tokennél inline hibaüzenet jelenik meg.
4. `S04` — A diák a listában látja a megosztott kvízt, majd a `Kvíz megnyitása` gombra kattint. A rendszer a public shared quiz flow-t nyitja meg. Hibaág: ha a lista még üres, empty state látszik.
5. `S12` — A diák kérdésenként válaszol és a végén leadja a kitöltést. A rendszer százalékos eredményt számol. Hibaág: hibás token vagy submit hiba esetén hibanézet vagy alert jelenik meg.
6. `S13` — A diák megkapja az eredményt, majd visszaléphet vagy újrapróbálhatja a kvízt.

**Sikerkritérium:** A diák sikeresen hozzáadja a megosztott kvízt, megnyitja, majd eredményt kap a végén.

**Mért időtartam (kb.):** 45–90 másodperc, a kérdésszámtól függően 7–15 interakció.

## 3. Diák témán belül gyakorol tanulókártyákkal

**Persona:** Hallgató, aki egy adott tantárgyi témán belül szeretné átnézni a kapcsolódó kvízeket és tanulókártyákat.

**Belépési pont:** meglévő sessionből a dashboard.

1. `S03` — A diák a `Témák` tabra vált. A rendszer megjeleníti az elérhető témákat. Hibaág: ha nincs téma, empty state vagy üres lista látszik.
2. `S06` — A diák kiválaszt egy témát a `Megnyitás` gombbal. A rendszer betölti a téma részleteit. Hibaág: hibás vagy már nem létező téma esetén nem található állapot jelenik meg.
3. `S17` — A diák áttekinti az adott témához tartozó kvízeket és tanulókártyákat. A rendszer egy oldalon mutatja a kapcsolódó tartalmakat. Hibaág: ha nincs kártya vagy kvíz, üres állapot jelenik meg.
4. `S17` — A diák átvált gyakorló módba a tanulókártya modulban, rákattint a kártyára a válasz felfedéséhez, majd lapoz a következő kártyára. Hibaág: ha nincs kártya, a gyakorló mód nem ad értelmes tartalmat.
5. `S17` — A diák dönthet úgy, hogy ugyaninnen egy témához tartozó kvízt is elindít, ami a kvízkitöltő képernyőre viszi tovább.

**Sikerkritérium:** A diák egy adott témát meg tud nyitni, és abból legalább egy tanulókártyát végig tud gyakorolni.

**Mért időtartam (kb.):** 20–60 másodperc, 4–8 interakció.
