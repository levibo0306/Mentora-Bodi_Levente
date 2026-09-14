# Screenshot útmutató

Ez a fájl azt írja le, hogy a jelenlegi projektből melyik screenshotot hol és milyen tartalommal érdemes elkészíteni.

## Általános szabályok

- Ajánlott desktop viewport: `1440x900`
- A böngésző teljes alkalmazásnézete látszódjon
- A fejlécet ne vágd le
- Modal screenshotnál az overlay és az alatta lévő háttérképernyő is maradjon a képen
- Ha lehet, használj valószerű seed adatot: legyen legalább 1 kvíz, 1 téma, 1 shared quiz
- Ha több állapotot is mentesz, a suffix legyen pl. `__empty`, `__error`, `__success`

## Hol készítsd a képeket

### Lokál fejlesztői környezet

1. Indítsd a backendet: `npm run dev:backend`
2. Indítsd a frontendet: `npm run dev:frontend`
3. Nyisd meg a webet a tipikus desktop méreten
4. Jelentkezz be külön diák és tanár fiókkal
5. A screenshotokat böngészőből készítsd:
   - macOS: `Cmd + Shift + 4` vagy `Cmd + Shift + 5`
   - Chrome DevTools Device Toolbar, ha mobilnézet is kell

## Jelenleg bent lévő screenshotok

| Fájlnév | Lefedett képernyő / állapot |
|---|---|
| `S01_login.png` | login képernyő |
| `S01_login__register.png` | regisztrációs képernyő |
| `S03_student_dashboard_own__empty.png` | diák dashboard saját nézet, üresebb állapot |
| `S03_student_dashboard_own__success.png` | diák dashboard saját nézet, kitöltött / haladási állapot |
| `S04_student_dashboard_shared.png` | velem megosztott kvízek tab |
| `S06_topics_panel.png` | témák panel / téma létrehozó nézet |
| `S07_quiz_modal.png` | új kvíz létrehozása modal |
| `S08_quiz_share_modal__success.png` | kvíz megosztási modal sikeres generált linkkel |
| `S10_quiz_player.png` | kvíz kitöltő képernyő |
| `S11_daily_missions.png` | küldetések oldal |
| `S14_student_dashboard.png` | diák dashboard fő nézet |
| `S15_result.png` | eredmény képernyő |
| `S16_teacher_results.png` | eredmények / analitika képernyő |
| `S17_teacher_dashboard.png` | tanári dashboard |

## Tartalmi minimum képenként

- A képernyő egyértelműen beazonosítható legyen
- Látszódjon a fő CTA vagy fő interakció
- Látszódjon az adott képernyő elsődleges adatforrása is
  - dashboardnál: statok és listák
  - formnál: inputok
  - eredménynél: százalék / statisztika
  - topic detailnél: topic header + legalább egy tartalomblokk

## Mi kell még kötelezően

- `docs/ux/pageflow.png` export
- PR nyitása `docs(ux): GUI/UX dokumentáció` címmel
- a PR leírásába a `docs/ux/README.md` bemásolása
