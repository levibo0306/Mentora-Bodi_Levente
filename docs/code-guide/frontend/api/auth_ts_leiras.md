# `api/auth.ts` leírása

Az auth végpontok típusos frontend burkolata. Az `AuthUser` és `UserRole` típusok meghatározzák a kliensen használt felhasználóformát. A `registerApi` a `/api/auth/register`, a `loginApi` a `/api/auth/login`, az `updateProfileApi` pedig a `/api/auth/me` végpontot hívja. Az utóbbi felhasználónevet, emailt, jelenlegi és opcionális új jelszót küld.

Ezt közvetlenül főként az `AuthContext` használja. A fájl nem tárol állapotot; kizárólag adatot alakít és továbbít az `api/http.ts` segítségével.
