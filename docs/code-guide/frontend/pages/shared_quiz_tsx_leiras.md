# `pages/SharedQuiz.tsx` leírása

Publikus, tokenes kvízkitöltő oldal. Bejelentkezés nélkül is működhet, mert az URL `/shared/:token` tokenje azonosítja a megosztást. Betöltéskor lekéri a kvízt és kérdéseit, majd kérdésenként tárolja a választ. Beküldéskor a tokenes submit végpont százalékos eredményt ad.

A komponens külön kezeli a loading, hiba, üres kvíz, kitöltés és eredmény állapotokat. A `SharedPage` a közös hátteret, a `CenteredCard` az állapotkártyát, a `ResultView` az eredményt jeleníti meg. A normál `QuizPlayer`-től eltérően nem quiz ID-alapú védett végpontokat, hanem a `routes/share.ts` publikus végpontjait használja. A kinézet a `styles.css` `shared-quiz-*` osztályaiban van, ezért a folyamat olvasható marad.
