# `pages/Feedback.tsx` leírása

A tanár–diák csevegőfelület. Betölti az elérhető kapcsolatokat, automatikusan kiválasztja az elsőt, majd partnerenként lekéri az üzeneteket és a hivatkozható tananyagokat. A `submit` elküldi a szöveget és az opcionálisan kiválasztott kvíz/téma/kártyacsomag hivatkozását, majd frissíti az üzenetlistát.

A bal oldal a partnerválasztó, a jobb oldal a beszélgetés és az üzenetíró. Saját üzenetet az `author_id === user.id` feltétel külön stílussal jelöl. Az API-k az `api/feedback.ts` fájlból érkeznek.
