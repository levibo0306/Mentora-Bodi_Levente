# `backend/src/instrument.ts` leírása

Opcionális Sentry hibamegfigyelés inicializálása. Ha nincs `SENTRY_DSN`, nem aktivál külső riportálást. Ha van, beállítja a környezetet és tracing mintavételt. Az `index.ts` nagyon korán importálja, hogy a szerverindítás és route-ok hibái is megfigyelhetők legyenek.
