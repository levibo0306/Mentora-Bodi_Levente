# `api/topics.ts` leírása

A tanulási témák kliensrétege. A `Topic` típus tárolja a témát, tulajdonosi és megosztási adatokat. A `TopicStats` a témához tartozó kvíz- és kártyastatisztikákat írja le.

Függvényei: témák listázása és lekérése, tanári statisztika, létrehozás, törlés, megosztás és megosztási token beváltása. A `TopicsPanel` és `TopicDetail` használja, backend párja a `routes/topics.ts`.
