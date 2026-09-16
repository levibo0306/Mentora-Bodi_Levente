# `routes/feedback.ts` leírása

A tanár–diák csevegés szerveroldala. Csak olyan párok beszélhetnek, akik között megosztás vagy korábbi feedback kapcsolat létezik.

- `GET /contacts`: szerepkör szerint elérhető partnerek.
- `GET /:partnerId`: beszélgetéstörténet; az olvasatlan bejövő üzeneteket olvasottnak jelöli.
- `GET /:partnerId/targets`: közös kvízek, témák és kártyacsomagok, amelyekre hivatkozni lehet.
- `POST /:partnerId`: validált üzenet mentése, opcionális célhivatkozással; gamifikációs eseményt is rögzít.
