# `frontend/playwright.config.ts` leírása

Az end-to-end böngészőtesztek konfigurációja. Meghatározza a tesztmappát, párhuzamos futást, CI retry szabályt, Chrome eszközprofilt, trace mentést és a base URL-t. A `webServer` rész automatikusan elindítja a Vite szervert a tesztekhez, helyben pedig újrahasználhat már futó szervert.
