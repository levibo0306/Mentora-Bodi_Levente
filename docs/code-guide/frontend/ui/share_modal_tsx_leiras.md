# `ui/ShareModal.tsx` leírása

A kvízmegosztás teljes modális felülete. A `quizId`, `quizTitle`, nyitottság és bezárás mellett opcionális `sourceToken` propot kap továbbosztáshoz. A címzetteket sor/vessző alapján bontja, elküldi az `allowReshare` beállítást, majd URL/token párokat jelenít meg. Másolást, emailes és WhatsApp megosztást kínál. A `copied`, `loading` és `error` state-ek adják a felhasználói visszajelzést.
