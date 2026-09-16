# `ui/Navbar.tsx` leírása

A bejelentkezett felhasználó felső navigációja. Az `AuthContext` alapján elrejti magát kijelentkezett állapotban, és szerepkör szerint Küldetések vagy Eredmények linket mutat. A Csevegés mindkét szerepkörnek elérhető. A profiljelvény a profilra visz, a kilépés meghívja a context `logout` függvényét és a loginra navigál.

A `NavLink` aktív osztályt ad az aktuális útvonalnak. Mobilon a CSS a kevésbé fontos szöveges linkeket elrejti, a csevegést, profilt és kilépést ikonként megtartja.
