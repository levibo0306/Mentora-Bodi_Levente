# `ui/CreateQuizForm.tsx` leírása

## Szerepe

A kvíz létrehozásának és szerkesztésének háromlépéses wizardja.

## Állapot és lépések

1. Alapadatok: cím, leírás, gyakorlás/vizsga mód és téma.
2. Kérdések: kézi kérdésírás vagy AI-generálás szövegből/PDF/DOCX-ből.
3. Áttekintés és végleges mentés.

## Fontos függvények

- `getQuestionFromInput`: validálja és DTO-vá alakítja az aktuális kérdést.
- `handleAddQuestion`: új kérdést tesz a lokális listába vagy frissíti a szerkesztettet.
- `handleGenerateQuestions`: megszakítható AI-kérést indít, kezeli a dokumentum metaadatait és a hosszabb várakozás státuszát.
- `handleSubmit`: ellenőrzi a függő kérdést, létrehozza/frissíti a kvízt, majd egyenként elmenti az új kérdéseket.

Szerkesztési módban a `quizId` alapján külön betölti az alapadatokat és kérdéseket. Az `onSuccess` visszajelzi a szülő dashboardnak, hogy zárja be a modalt és frissítse a listát.
