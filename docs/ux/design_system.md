# Design rendszer / vizuális nyelv

## UI könyvtár / komponens-könyvtár

A projekt nem használ külső komponens-könyvtárat. A felület React komponensekből és egy központi, saját `styles.css` állományból épül fel.

- UI megközelítés: saját komponensek + saját CSS
- CSS helye: [apps/frontend/src/styles.css](/Users/bodilevente/mentora-prototype/apps/frontend/src/styles.css)
- Fő komponensek: dashboard kártyák, quiz cardok, wizard modalok, progress barok, stat blokkok

## Színpaletta

| Token | Érték | Használat |
|---|---|---|
| primary | `#FF6B35` | fő CTA-k, aktív elemek |
| secondary | `#004E89` | másodlagos akcentusok, badge-ek |
| accent | `#FFD23F` | kiemelés, nehézségi közép szint |
| success | `#06D6A0` | sikerállapotok, progress, pozitív eredmény |
| warning | `#FFD23F` | figyelmeztetéshez és köztes hangsúlyhoz közel álló szín |
| error | `#EF476F` | hibák, negatív eredmények |
| surface | `#FFFFFF` | kártyák, modális panelek |
| surface-alt | `#F8F9FA` | dashboard háttér, secondary felületek |
| text | `#1A1A2E` | elsődleges szöveg |
| muted-text | `#666666` | meta és segédszöveg |
| page-bg-gradient-start | `#667EEA` | login és public flow háttér |
| page-bg-gradient-end | `#764BA2` | login és public flow háttér |

## Tipográfia

- Display / branding font: `Archivo Black`
- UI / body font: `DM Sans`
- Font source: Google Fonts import a CSS elején

### Használt méret-skála

- `12px` – meta címkék, label jellegű információk
- `13px` – kisebb státuszok, secondary információk
- `14px` – segédszöveg, badge, leírás
- `15px` – alap input és gombszöveg
- `16px` – általános kiemelt szöveg
- `18px` – közepes hangsúly, login és card szövegek
- `20px` – eredmény részletek
- `24px` – kisebb oldalcímek, kérdés címsorok
- `28px` – fő oldalcímek, modal title
- `32px` – dashboard section címek, eredmény headline
- `42px` – hero/logo méret
- `80px` – eredmény százalék megjelenítés

### Használt font-weight-ek

- `400` – alap body
- `500` – köztes hangsúly
- `600` – navigáció és gombok
- `700` – címek és CTA-k
- `800` – erős kiemelések, stat számok

## Spacing / grid

- Alapritmus: jellemzően `8px`-es és `4px`-es lépések kombinációja
- Kártya sarkok: `10px`–`24px`
- Fő tartalmi szélesség: `1400px`
- Egyéb max szélességek:
  - login box: `480px`
  - modal content: `700px`
  - quiz player: `800px`
  - results card: `500px`
  - results és missions layout: kb. `1100px`
  - profile layout: kb. `900px`

## Ikonkészlet

A projekt nem használ külön ikon library-t. A vizuális jelölések főként emoji alapúak:

- `🎓`, `👨‍🏫` szerepkörök
- `📚`, `📤`, `🔗`, `📊`, `🧭` funkcionális jelölések
- `🏅`, `🔥`, `✅`, `❌` státuszok

Ez gyors prototípus-fejlesztést támogat, de hosszabb távon egységes SVG ikonrendszerre lenne érdemes cserélni.

## Sötét mód

- Támogatott: `nem`

Jelenleg nincs külön dark theme, nincs token-szintű theme váltás.

## Reszponzív breakpoint-ok

A jelenlegi CSS-ben egy explicit breakpoint szerepel:

- mobile / tablet határ: `768px`

Jelenlegi viselkedés:

- `768px` alatt a navbar, grid-ek és modalok egyoszloposabb elrendezésre váltanak
- külön tablet-specifikus breakpoint nincs
- külön desktop breakpoint nincs, a layout alapértelmezett desktop-first

## Forrás

- Implementált design tokenek: [apps/frontend/src/styles.css](/Users/bodilevente/mentora-prototype/apps/frontend/src/styles.css)
- Figma / Penpot link: jelenleg nincs a repóban dokumentálva
