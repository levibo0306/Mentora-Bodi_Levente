# `api/feedback.ts` leírása

A tanár–diák csevegés kliensrétege. A `FeedbackContact` egy beszélgetőpartnert, a `FeedbackMessage` egy üzenetet, a `FeedbackTarget` pedig az üzenethez kapcsolható kvízt, témát vagy kártyacsomagot írja le.

- `getFeedbackContacts`: elérhető partnerek.
- `getFeedbackMessages`: egy partnerrel folytatott beszélgetés.
- `getFeedbackTargets`: a közösen elérhető, hivatkozható tananyagok.
- `sendFeedbackMessage`: üzenet és opcionális tananyag-hivatkozás küldése.

A `pages/Feedback.tsx` használja, backend párja a `routes/feedback.ts`.
