# `AuthContext.tsx` leírása

## Szerepe

Központilag tárolja a bejelentkezett felhasználót, hogy ne kelljen minden komponensnek külön lekérnie vagy továbbadnia.

## Fő elemek

- `AuthContext`: a React context objektum.
- `AuthProvider`: induláskor localStorage-ból visszaállítja a tokent és a felhasználót, majd elérhetővé teszi az auth állapotot.
- `login`: meghívja a frontend auth API-t, majd elmenti a tokent és usert.
- `register`: regisztrál, majd ugyanúgy bejelentkezett állapotot hoz létre.
- `logout`: értesíti a backendet, törli a lokális session adatokat és nullázza a usert.
- `updateProfile`: frissíti a backendet, majd a contextben és localStorage-ban is lecseréli a felhasználót.
- `useAuth`: biztonságos hozzáférést ad a contexthez.

## Kapcsolatok

A `main.tsx` teszi az egész `App` fölé. A `Login`, `Navbar`, `Profile`, `ProtectedRoute` és több dashboard komponens fogyasztja. A hálózati műveleteket az `api/auth.ts` végzi.
