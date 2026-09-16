# `styles.css` leírása

## Szerepe

Az alkalmazás teljes globális vizuális rendszere egyetlen CSS fájlban. Nincs külső komponenskönyvtár, ezért itt található minden szín, térköz, gomb, kártya, modal és reszponzív szabály.

## Felépítése

- `:root`: fő színtokenek, például `--primary`, `--secondary`, `--success`.
- Alap reset, body és tipográfia.
- Funkciónkénti blokkok: login, navbar, dashboard, statisztika, kvízek, wizard, profil, flashcards, témák, csevegés.
- `@media` szabályok: mobilon egyoszlopos elrendezés, tömörebb navigáció és kétsoros fő fülek.
- A fájl végi „SIMPLIFIED HOME EXPERIENCE” blokk a letisztított kezdőlap felülírásait tartalmazza.

## Fontos tudnivalók

A CSS globális: egy általános osztály módosítása több oldalt is érinthet. Új stílusnál ezért érdemes funkcióspecifikus osztálynevet használni. A `hidden` panelek elrejtése fontos a dashboard villanásmentes fülváltásához. A mobil breakpoint jellemzően 768 vagy 800 pixel.
