# `pages/TopicDetail.tsx` leírása

Egy konkrét téma részletező oldala. Az URL `:id` paraméteréből betölti a témát; megnyitását aktivitásként is naplózza. Tanárnál témaszintű statisztikát kér, diáknál a kapcsolódó tartalmakra koncentrál. Ugyanazon az oldalon a `QuizList` és `Flashcards` komponenseket témaazonosítóval szűrve használja.

Ez jó példa komponens-újrahasznosításra: maga az oldal csak koordinál, a kvíz- és kártyalogika a gyermekkomponensekben marad.
