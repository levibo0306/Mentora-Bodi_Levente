# Beadás előtti ellenőrzőlista

A publikus környezet részletes beállítása: [DEPLOYMENT.md](DEPLOYMENT.md).

## Lokális ellenőrzés

- [ ] `npm ci`
- [ ] `npm run verify`
- [ ] `npm run test:e2e`
- [ ] új adatbázisnál schema betöltése, majd `npm run migrate`
- [ ] `npm run seed`
- [ ] teacher és student belépés kipróbálása
- [ ] PDF/DOCX generálás kipróbálása futó Ollamával
- [ ] `git status` csak szándékos változásokat mutat

## Git/GitHub

- [ ] változások átnézése és commitolása
- [ ] push a beadandó branchre
- [ ] GitHub Actions mindkét jobja zöld
- [ ] repository URL és beadandó commit SHA rögzítése

## Hosting

- [ ] PostgreSQL létrehozása és migrálása
- [ ] backend környezeti változók beállítása
- [ ] backend publikus URL ellenőrzése a `/health` végponton
- [ ] frontend `VITE_API_BASE_URL` beállítása
- [ ] backend `CORS_ORIGINS` beállítása a frontend HTTPS originjére
- [ ] publikus frontend smoke teszt

## Demo

- [ ] előre seedelt tanár és diák fiók
- [ ] legalább egy megosztott téma, kvíz és Flashcards-csomag
- [ ] legalább két korábbi adaptív kitöltés
- [ ] Ollama és `qwen3:4b` előre elindítva
- [ ] egy rövid, szövegréteges PDF tartalékban
- [ ] 5–7 perces demo-forgatókönyv
