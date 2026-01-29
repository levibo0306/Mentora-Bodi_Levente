# User Stories – Sprint 2

## US-01: Üres állapot
Mint új felhasználó,
szeretném látni, ha még nincs kvízem,
hogy tudjam, mi a következő lépés.

### Acceptance Criteria
- AC1: Üres állapot szöveg + CTA gomb megjelenik.

---

## US-02: Kvíz létrehozása
Mint felhasználó,
szeretnék gyorsan új kvízt felvenni,
hogy elkezdhessem a tanulást.

### AC1 – Valid input
Given üres lista
When helyes címet adok meg
Then a kvíz megjelenik a listában

### AC2 – Invalid input
Given üres cím
When menteni próbálok
Then hibaüzenet jelenik meg

---

## US-03: Lista megjelenítése
Mint felhasználó,
szeretném látni az összes kvízemet,
hogy tudjam, hol tartok.

### AC1
Látható a lista minden eleme

---

## US-04: Hibaállapot
Mint felhasználó,
szeretném látni, ha valami nem működik,
hogy újra tudjam próbálni.

### AC1
Hibaüzenet + retry gomb

---

## US-05: Visszajelzés
Mint felhasználó,
szeretnék visszajelzést kapni sikeres mentés után,
hogy biztos legyek benne, hogy működött.

### AC1
Sikerüzenet megjelenik („Sikeres mentés”)
