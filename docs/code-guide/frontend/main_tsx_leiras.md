# `main.tsx` leírása

## Miért van itt?

Ez a frontend tényleges belépési pontja. A böngészőben lévő `#root` HTML elemhez kapcsolja a React alkalmazást.

## Mit tartalmaz?

- `ReactDOM.createRoot`: létrehozza a React gyökeret.
- `BrowserRouter`: bekapcsolja az URL-alapú navigációt.
- `AuthProvider`: az egész alkalmazás számára elérhetővé teszi a bejelentkezett felhasználót és az auth műveleteket.
- `App`: a tényleges útvonalak és képernyők gyökérkomponense.
- `styles.css`: az alkalmazás globális megjelenése.

## Kapcsolatok

Az `index.html` tölti be ezt a fájlt. Innen a vezérlés az `index.tsx` fájl `App` komponenséhez kerül. Ha a router vagy az auth provider innen hiányozna, az olyan hookok, mint a `useNavigate`, `useLocation` vagy `useAuth` nem működnének.
