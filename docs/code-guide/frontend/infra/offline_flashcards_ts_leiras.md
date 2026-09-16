# `infra/offlineFlashcards.ts` leírása

A kártyacsomagok offline tárolása és ismétlési sora. Felhasználónként ment csomagokat és pending review-kat. Az `applyOfflineFlashcardReview` helyben frissíti az ismétlési ütemezést, hogy internet nélkül is azonnali legyen az élmény. A `queueOfflineFlashcardReview` megőrzi a backendnek később elküldendő minősítést, a `syncOfflineFlashcardReviews` pedig visszatérő kapcsolatnál szinkronizál.
