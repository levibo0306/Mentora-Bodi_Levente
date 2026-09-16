# Gyökér `package.json` leírása

A monorepo központi npm konfigurációja. Workspace-ként kezeli az `apps/frontend` és `apps/backend` csomagokat, ezért a gyökérből indítható mindkét oldal. A scriptjei delegálják a fejlesztői szervert, buildet és teszteket a megfelelő workspace-nek. A közös függőségek és lock fájl biztosítják, hogy ugyanazok a verziók települjenek minden gépen.
