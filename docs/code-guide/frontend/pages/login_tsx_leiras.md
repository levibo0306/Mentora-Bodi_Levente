# `pages/Login.tsx` leírása

Belépési és regisztrációs képernyő egy komponensben. A `mode` dönti el, hogy login vagy register mezők jelennek meg. A mezőstate-ek az azonosítót, emailt, felhasználónevet, jelszót és szerepkört tárolják. Beküldéskor az `AuthContext` `login` vagy `register` függvényét hívja; siker esetén a dashboardra navigál, hiba esetén inline üzenetet mutat. A szerepválasztó csak regisztrációkor lényeges.
