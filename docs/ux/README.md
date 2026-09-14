# Mentora GUI / UX dokumentáció

Ez a mappa a Mentora szakdolgozati projekt jelenlegi felhasználói felületének és felhasználói élményének dokumentációját tartalmazza.

## Tartalom

- [pageflow.mmd](/Users/bodilevente/mentora-prototype/docs/ux/pageflow.mmd) – a képernyő-térkép szerkeszthető Mermaid forrása
- `pageflow.png` – exportálandó PNG változat a fenti forrásból
- [screens.csv](/Users/bodilevente/mentora-prototype/docs/ux/screens.csv) – képernyő-leírás táblázat
- [journeys.md](/Users/bodilevente/mentora-prototype/docs/ux/journeys.md) – top 3 user journey
- [design_system.md](/Users/bodilevente/mentora-prototype/docs/ux/design_system.md) – vizuális rendszer és UI döntések
- [self_assessment.md](/Users/bodilevente/mentora-prototype/docs/ux/self_assessment.md) – önértékelés
- [screenshots/README.md](/Users/bodilevente/mentora-prototype/docs/ux/screenshots/README.md) – screenshot checklist és elkészítési útmutató
- `screenshots/` – ide kerülnek a képernyőképek az `S##_*` névkonvenció szerint
- `mockups/` – opcionális tervezési artifactok helye
- `inspirations/` – opcionális benchmark anyagok helye

## Jelenlegi állapot

A kötelező szöveges UX dokumentumok el vannak készítve, és a `screenshots/` mappában már bent van a jelenlegi screenshot készlet.

### Jelenleg bent lévő screenshotok

- `S01_login.png`
- `S01_login__register.png`
- `S03_student_dashboard_own__empty.png`
- `S03_student_dashboard_own__success.png`
- `S04_student_dashboard_shared.png`
- `S06_topics_panel.png`
- `S07_quiz_modal.png`
- `S08_quiz_share_modal__success.png`
- `S10_quiz_player.png`
- `S11_daily_missions.png`
- `S14_student_dashboard.png`
- `S15_result.png`
- `S16_teacher_results.png`
- `S17_teacher_dashboard.png`

### Ami még kötelező a beadáshoz

1. PR nyitása `docs(ux): GUI/UX dokumentáció` címmel.
2. A PR leírásába ennek a [README.md](/Users/bodilevente/mentora-prototype/docs/ux/README.md) fájlnak a bemásolása.

## Export és kitöltés

### `pageflow.png`

- A PNG fájl már létre van hozva itt: [pageflow.png](/Users/bodilevente/mentora-prototype/docs/ux/pageflow.png)
- Újragenerálás lokálban:
```bash
npx -y @mermaid-js/mermaid-cli -i docs/ux/pageflow.mmd -o docs/ux/pageflow.png
```
- Alternatíva: nyisd meg a [pageflow.mmd](/Users/bodilevente/mentora-prototype/docs/ux/pageflow.mmd) fájlt VS Code Mermaid Preview-ban vagy a [Mermaid Live Editorban](https://mermaid.live/), majd exportáld PNG-be.

### Screenshotok

- A jelenleg bent lévő screenshot készlet listáját a [screenshots/README.md](/Users/bodilevente/mentora-prototype/docs/ux/screenshots/README.md) fájl tartalmazza.
- Kötelezően már csak annyi a teendő, hogy a meglévő screenshot készlet maradjon a repóban.

## PR leíráshoz

A PR címe legyen:

`docs(ux): GUI/UX dokumentáció`

A PR leírásába ennek a fájlnak a tartalma másolható.

## Beadási checklist

- [x] `pageflow.png` exportálva a Mermaid forrásból
- [x] `pageflow.mmd` benne van a repóban
- [x] Screenshotok bekerültek a `screenshots/` mappába
- [x] A screenshotok `S##_*` névkonvenciót követnek
- [x] `screens.csv` kitöltve és a pageflow számozásával egyezik
- [x] `journeys.md` elkészült
- [x] `design_system.md` elkészült
- [x] `self_assessment.md` elkészült
- [ ] PR megnyitva `docs(ux): GUI/UX dokumentáció` címmel
- [ ] A PR leírásába bemásolva ez a `README.md`
