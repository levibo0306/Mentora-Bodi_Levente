# `ui/QuizPlayer.tsx` leírása

A bejelentkezett felhasználó kvízkitöltője. Az URL quiz ID-ja alapján először adaptív kérdéssort próbál kérni; hálózati hiba esetén offline mentett kvízre tud visszaesni. Az `answers` kérdésazonosító → válaszindex térkép, a `currentStep` az aktuális kérdés.

Beküldéskor online a `submitQuizAttempt` végpontot hívja. Offline állapotban lokálisan kiszámolja az eredményt, és a próbálkozást szinkronizálási sorba teszi. Az oldal kérdésenként halad, a végén eredménykártyát mutat.
