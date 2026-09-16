# `ui/FlashcardShareModal.tsx` leírása

Kártyacsomag megosztási modal. A `packId` alapján a `shareFlashcardPack` függvényt hívja, opcionális email címzettekkel. A válasz tokenjeiből másolható linkeket készít. A szülő `Flashcards` komponens akkor rendereli, amikor van kiválasztott `sharePack`; bezáráskor ezt nullázza.
