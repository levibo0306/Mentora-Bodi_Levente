# 0001: Kezdeti technológiai stack kiválasztása

- Dátum: 2025-10-10
- Státusz: Elfogadva

## Kontextus
A Mentora platform célja egy interaktív, valós idejű tanulás- és oktatástámogató rendszer fejlesztése,
amely képes kezelni a kvízjátékokat, személyre szabott tanulási útvonalakat és AI-alapú kérdésgenerálást.

## Döntés
A frontendhez **Next.js (React)** keretrendszert választok **TypeScript** támogatással, mivel kiválóan alkalmas dinamikus, interaktív felületek és valós idejű frissítések megvalósítására. A backend szolgáltatás **Node.js (Express)** alapokra épül, ami kompatibilis a websockets-alapú valós idejű kommunikációval, és jól integrálható AI API-kkal. Az adatokat **PostgreSQL** adatbázis tárolja, amely megbízható relációs struktúrát biztosít a felhasználók, kvízek és statisztikák számára.

## Megfontolt alternatívák
- **SvelteKit + Supabase**: modern és gyors stack, de a valós idejű adatfrissítés nagyobb terhelésnél instabil,  
  és az ökoszisztéma kevésbé kiforrott, mint a Reacté.  
- **ASP.NET Core + Blazor**: robusztus, típusos megoldás, viszont a WebAssembly lassú betöltése és a korlátozott AI-integráció miatt kevésbé rugalmas.  
- **Angular + Firebase**: beépített autentikációt és valós idejű szinkront kínál, de a NoSQL adatmodell nem alkalmas relációs statisztikák kezelésére.  

## Következmények
- JavaScript/TypeScript egységével a frontend és backend egységes nyelvi környeztben történne.
- A WebSocket integráció egyszerűen megvalósítható az Express környezetben, ami támogatja a valós idejű játékmechanikákat
- A PostgreSQL rugalmas sémakezelést tesz lehetővé
