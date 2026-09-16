# `ui/QuizList.tsx` leírása

Saját vagy témához szűrt kvízek listája. Betölti a kvízeket és témákat, nehézségi badge-et számít, majd kártyákat jelenít meg. A fő műveletek az indítás és megosztás; az offline mentés, szerkesztés és törlés a „További lehetőségek” alatt van.

Fontos függvények: `fetchList` újratölti a listát, `handleDelete` megerősítés után töröl, `handleShare` megnyitja a `ShareModal`-t, `toggleOffline` letölti a teljes kvízt és kérdéseket vagy eltávolítja a lokális példányt. A `fixedTopicId` prop miatt a komponens a témaoldalon is használható.
