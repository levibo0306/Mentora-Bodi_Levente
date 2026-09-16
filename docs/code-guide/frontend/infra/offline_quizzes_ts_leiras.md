# `infra/offlineQuizzes.ts` leírása

A kvízek offline localStorage-rétege. Felhasználónként külön kulcsot használ, így azonos böngészőn több fiók adatai nem keverednek. Menthető és törölhető a teljes kvíz kérdésekkel együtt. Offline kitöltésnél a választ egy `PendingAttempt` sorba teszi. A `syncOfflineAttempts` internet visszatérésekor sorban elküldi a próbálkozásokat, és csak a sikerteleneket tartja meg.
