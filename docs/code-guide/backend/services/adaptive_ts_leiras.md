# `services/adaptive.ts` leírása

Az adaptív kérdéskiválasztás tiszta, adatbázistól független algoritmusa. Az `estimateTargetDifficulty` a közelmúlt átlagpontszámából 1–5 közötti célszintet választ: gyengébb eredménynél könnyebb, erősebbnél nehezebb kérdések jönnek. A `rankAdaptiveQuestions` a jelölteket a célnehézségtől való távolság, korábbi hibák és stabil sorrendi szempontok alapján rendezi, majd a kért limitre vágja. A quiz route használja, külön unit teszt fedi.
