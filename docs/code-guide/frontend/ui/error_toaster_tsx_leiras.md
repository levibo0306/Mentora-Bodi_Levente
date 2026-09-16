# `ui/ErrorToaster.tsx` leírása

Globális, nem blokkoló hibaértesítő. A `mentora:error` böngészőeseményt figyeli, amelyet az `api/http.ts` küld. Az üzenetet hat másodperc után automatikusan törli, de kézzel is bezárható. Az `App` tetején egyszer van elhelyezve, ezért bármely API-hiba megjelenhet benne.
