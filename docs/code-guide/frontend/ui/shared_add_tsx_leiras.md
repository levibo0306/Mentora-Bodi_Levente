# `ui/SharedAdd.tsx` leírása

Egységes felület megosztott kvíz, téma vagy kártyacsomag hozzáadásához. Az `extractToken` teljes megosztási URL-ből is kiemeli a tokent. A `handleAdd` a kiválasztott típusnak megfelelő claim API-t hívja, majd az `onAdded` callbackkel megmondja a dashboardnak, melyik fülre váltson. Saját státuszstate kezeli a várakozást, sikert és hibát.
