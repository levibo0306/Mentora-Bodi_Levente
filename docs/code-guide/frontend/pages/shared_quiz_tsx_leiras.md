# `pages/SharedQuiz.tsx` leírása

Publikus, tokenes kvízkitöltő oldal. Bejelentkezés nélkül is működhet, mert az URL `/shared/:token` tokenje azonosítja a megosztást. Betöltéskor lekéri a kvízt és kérdéseit, majd kérdésenként tárolja a választ. Beküldéskor a tokenes submit végpont százalékos eredményt ad.

A komponens külön kezeli a loading, hiba, kitöltés és eredmény állapotokat. A normál `QuizPlayer`-től eltérően nem quiz ID-alapú védett végpontokat, hanem a `routes/share.ts` publikus végpontjait használja. A fájl azért nagy, mert a teljes játékfolyam és eredmény UI egy helyen van.
