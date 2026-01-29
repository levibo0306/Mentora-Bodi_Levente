# Wireframes – Kvíz flow

## 01-main-flow.png
Cél: meglévő kvízek listázása
Interakciók: kártyák, új kvíz gomb
Állapotok: normál
Hivatkozások: US-03/AC1
Megjegyzések: Ez a fő lista nézet, ahová sikeres mentés után is visszajut a felhasználó. Innen indul a teljes kvíz-flow (létrehozás, lista frissülése).

## 02-empty-state.png
Cél: első belépő tájékoztatása
Interakció: "Új kvíz létrehozása"
Állapot: üres
Hivatkozás: US-01/AC1
Megjegyzések: Teljesen új felhasználó első nézete. A „Nincs még kvízed” szöveg és a CTA gomb egyértelműen jelzi a következő lépést.

## 03-error-state.png
Cél: hiba esetén visszajelzés
Interakció: retry
Állapot: hiba
Hivatkozások: US-04/AC1
Megjegyzések: API vagy hálózati hiba esetén megjelenő fallback. Csak a hibaüzenetet és a „Próbáld újra” gombot mutatja, hogy a felhasználó gyorsan vissza tudjon térni a fő flow-ba.

## 04-form-validation.png
Cél: kvíz létrehozása
Interakció: valid/invalid form
Állapot: hibás bevitel
Hivatkozás: US-02/AC2
Megjegyzések: A kötelező mező (cím) üresen hagyásakor megjelenő hibaállapot. Demonstrálja a kliens oldali validációt (“A cím kötelező”) és azt, hogy a lista addig nem frissül, amíg nincs érvényes bevitel.
