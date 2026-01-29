# Product Specification v0.2 – Kvíz vertikális szelet

## Cél
A felhasználók egy egyszerűen használható felületen tudjanak saját kvízeket létrehozni 
és megtekinteni. A cél az, hogy a rendszer megmutassa az üres állapotot, a sikeres létrehozást, 
és a hibaállapotot. Ez a vertikális szelet biztosítja a Mentora alkalmazás alap értékajánlatát: 
gyors visszajelzés, tanulást támogató struktúra és átlátható felület.

## Scope (In)
- Kvízlista megjelenítése
- Üres állapot kezelése
- Kvíz létrehozása (egy cím megadása)
- Hibaállapot megjelenítése (szimulált vagy valós)
- UI komponensek + minimális logika

## Scope (Out)
- Teljes kvízkérdés-szerkesztő
- Tanári statisztika
- AI kérdésgenerálás
- Autentikáció
- Témák szerinti rendezés
- Backend perzisztencia

## User Story térkép
- US-01 – Üres állapot megtekintése
- US-02 – Kvíz létrehozása (valid/invalid)
- US-03 – Kvízlista megtekintése
- US-04 – Hibaállapot kezelése
- US-05 – Alap visszajelzés (toast/success)

## NFR-ek
- NFR-01: TTFB < 1.5s (local preview)
- NFR-02: Smoke test PASS ≥ 95%
- NFR-03: Test coverage ≥ 60%
- NFR-04: Crash-free rendering – UI ne essen szét hibánál sem

## Fő AC-k
### AC1 – Üres állapot
Given nincs egyetlen kvíz sem  
When megnyitom a főoldalt  
Then látok egy üzenetet: "Nincs még kvízed"  
And megjelenik a „Új kvíz létrehozása” gomb  

### AC2 – Valid kvíz létrehozás
Given üres lista  
When egy érvényes címet írok be  
And rányomok a "Mentés" gombra  
Then a kvíz megjelenik a listában  
And megjelenik: "Sikeres mentés"  

### AC3 – Invalid input
Given a cím mező üres  
When menteni próbálok  
Then hibát kapok: "A cím kötelező"  

### AC4 – Hibaállapot
Given API hiba  
When megnyitom az oldalt  
Then látok egy hibaüzenetet  
And egy „Próbáld újra” gombot  
