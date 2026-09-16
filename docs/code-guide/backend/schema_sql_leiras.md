# `backend/sql/schema.sql` leírása

## Szerepe

A teljes PostgreSQL adatmodell deklaratív forrása. Fejlesztői vagy új környezetben ebből építhető fel az adatbázis.

## Fő táblacsoportok

- `users`: fiók, szerepkör, jelszóhash, XP és szint.
- `topics`, valamint topic share/member táblák: tananyagcsoportok és hozzáférés.
- `quizzes`, `questions`: kvíz törzsadatai és válaszlehetőségei.
- `attempts`, `attempt_answers`: kitöltések, pontszámok és válaszok.
- quiz share táblák: tokenek, címzettek, claim és továbbosztás.
- flashcard pack/card/review/share táblák: kártyák, ismétlési állapot és megosztás.
- `daily_missions`, `learning_events`, `user_streaks`: gamifikáció.
- `feedback_messages`: tanár–diák üzenetek és opcionális tananyaghivatkozások.

## Kapcsolatok

UUID elsődleges kulcsokat és idegen kulcsokat használ. A `CASCADE` kapcsolatok tulajdonos törlésekor takarítják a függő adatokat; a `SET NULL` megtarthat történeti rekordot törölt opcionális hivatkozás mellett. Az indexek a gyakori user-, token-, dátum- és kapcsolatlekérdezéseket gyorsítják.
