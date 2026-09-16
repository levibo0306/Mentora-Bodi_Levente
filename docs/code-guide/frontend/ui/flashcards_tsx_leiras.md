# `ui/Flashcards.tsx` leírása

Összetett tanulókártya-munkaterület. Kezeli a csomaglistát, témaszűrést, kézi csomagépítést, kvízből importálást, tokenes hozzáadást, megosztást, offline mentést és a gyakorló módot.

A gyakorlásnál az aktív csomag kártyáiból queue készül. A felhasználó felfedi a hátoldalt, majd 1–6 minőséget ad; ez online review API-ra vagy offline sorba kerül. A minőség módosítja az ismétlési adatokat. Egy teljes kör befejezése aktivitásként is rögzül. A komponens a frontend flashcard API-t, topic/quiz API-kat és az offline modult köti össze.
