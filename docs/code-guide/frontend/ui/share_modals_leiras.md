# Megosztási modalok leírása

## `ShareModal.tsx`

Kvízek megosztása. Opcionális email címzetteket és továbbosztási engedélyt fogad, majd linkeket/tokeneket generál. Másolás, email és WhatsApp műveleteket kínál. `sourceToken` esetén egy már megosztott kvízt oszt tovább.

## `TopicShareModal.tsx`

Témák megosztása. Címzetteket és `allowReshare` értéket küld a topic API-nak, majd tokeneket jelenít meg és másol.

## `FlashcardShareModal.tsx`

Kártyacsomag megosztása. A címzettlistát soronként vagy vesszővel értelmezi, meghívja a flashcard share API-t, majd a létrejött linkeket mutatja.

Mindhárom komponens ugyanazt a mintát követi: lokális form state → API kérés → generált tokenek → másolható eredmény → bezárás.
