# `api/http.ts` leírása

## Szerepe

Minden frontend API-kérés közös alapfüggvénye. Egységesen kezeli az URL-t, JSON-t, tokent, hibákat és az ideiglenes hálózati problémák újrapróbálását.

## Fő elemek

- `BASE`: a `VITE_API_BASE_URL` környezeti változó vagy üres érték azonos host esetén.
- `ApiError`: HTTP státuszt és `retryable` jelzőt is őrző hibatípus.
- `api<T>`: generikus fetch wrapper. Hozzáadja a Bearer tokent és az időzóna-eltolást, JSON body esetén content type-ot állít, majd JSON-ként adja vissza a választ.
- Átmeneti GET hibánál késleltetve újrapróbálhatja a kérést.
- 401 esetén törli a sessiont és loginra irányít.
- Más hibáknál `mentora:error` eseményt küld, amit az `ErrorToaster` jelenít meg.

## Kapcsolatok

Az összes többi `api/*.ts` modul erre épül. Ha itt változik a tokenkezelés vagy a hibapolitika, az egész alkalmazás hálózati viselkedése változik.
