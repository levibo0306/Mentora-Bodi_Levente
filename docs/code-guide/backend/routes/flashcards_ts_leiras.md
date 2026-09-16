# `routes/flashcards.ts` leírása

A kártyacsomagok backendje. Listáz és részletes csomagot ad, létrehoz kártyákkal együtt, kvízkérdésekből csomagot importál, ismétlési minőséget fogad, statisztikát készít, megosztási tokeneket kezel és csomagot töröl.

A review végpont a quality alapján frissíti a kártya ismétlési adatait és learning eventet ír. A statisztika a felidézési sikerességet és ismétlésszámot foglalja össze. Tulajdonosi és megosztási jogosultságot minden érzékeny művelet ellenőriz.
