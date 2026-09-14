import { useEffect, useMemo, useState } from "react";
import { getQuizzes, getQuizResults, Quiz, QuizAttempt, QuizResults } from "../api/quizzes";
import { PageLayout } from "../ui/PageLayout";

export const Results = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
        if (data.length > 0) setSelectedQuizId(data[0].id);
      } catch (err) {
        console.error("Nem sikerült betölteni a kvízeket", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getQuizResults(selectedQuizId);
        setResults(data);
        setSelectedAttemptId(data.attempts[0]?.id ?? "");
      } catch (err) {
        console.error("Nem sikerült betölteni az eredményeket", err);
        setResults(null);
        setSelectedAttemptId("");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedQuizId]);

  const selectedAttempt: QuizAttempt | null = useMemo(() => {
    if (!results || !selectedAttemptId) return null;
    return results.attempts.find((a) => a.id === selectedAttemptId) ?? null;
  }, [results, selectedAttemptId]);

  return (
    <PageLayout
      title="Eredmények"
      subtitle="Kvízenkénti teljesítmény, próbálkozások és válaszstatisztikák."
    >
        <div className="results-toolbar card">
          <label htmlFor="results-quiz">Kvíz kiválasztása</label>
          <select
            id="results-quiz"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            {quizzes.length === 0 && <option value="">Nincs elérhető kvíz</option>}
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading">Betöltés...</div>}

        {!loading && quizzes.length === 0 && (
          <div className="empty-state">
            <p>Még nincs olyan kvízed, amelyhez eredményeket lehetne megjeleníteni.</p>
          </div>
        )}

        {!loading && results && (
          <>
            <div className="results-grid">
              <section className="results-card">
                <h2 className="results-card-title">Próbálkozások</h2>
                {results.attempts.length === 0 && (
                  <div className="empty-subtle">Még nincs kitöltés ennél a kvíznél.</div>
                )}
                {results.attempts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAttemptId(a.id)}
                    className={`attempt-row ${a.id === selectedAttemptId ? "active" : ""}`}
                  >
                    <span className="attempt-student">{a.student_email ?? "Anonim"}</span>
                    <span className="attempt-meta">
                      <strong>{a.score}%</strong>
                      {new Date(a.created_at).toLocaleString("hu-HU")}
                    </span>
                  </button>
                ))}
              </section>

              <section className="results-card">
                <h2 className="results-card-title">Válaszok</h2>
                {!selectedAttempt && <div className="empty-subtle">Válassz egy próbálkozást.</div>}
                {selectedAttempt && results.questions.map((q) => {
                  const selected = selectedAttempt.answers?.[q.id];
                  const correct = q.correct_index;
                  return (
                    <div key={q.id} className="answer-detail">
                      <div className="answer-prompt">{q.prompt}</div>
                      <div className="answer-value">
                        Válasz:{" "}
                        <strong className={selected === correct ? "is-correct" : "is-wrong"}>
                          {selected !== undefined ? q.options[selected] : "Nincs válasz"}
                        </strong>
                      </div>
                      <div className="answer-correct">
                        Helyes: {q.options[correct]}
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>

            <section className="results-card results-breakdown">
              <h2 className="results-card-title">Kérdésenkénti statisztika</h2>
              {results.stats.map((s) => {
                const q = results.questions.find((qq) => qq.id === s.question_id);
                if (!q) return null;
                const total = Math.max(s.total, 1);
                return (
                  <div key={s.question_id} className="question-stat">
                    <div className="answer-prompt">{q.prompt}</div>
                    {q.options.map((opt, idx) => {
                      const count = s.counts[idx] ?? 0;
                      const pct = Math.round((count / total) * 100);
                      const isCorrect = idx === s.correct_index;
                      return (
                        <div key={`${s.question_id}-${idx}`} className="option-stat">
                          <div className="option-stat-label">
                            <span className={isCorrect ? "is-correct" : ""}>
                              {isCorrect ? "Helyes: " : ""}{opt}
                            </span>
                            <span>{count} válasz ({pct}%)</span>
                          </div>
                          <div className="option-stat-track">
                            <div
                              className={`option-stat-fill ${isCorrect ? "correct" : ""}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </section>
          </>
        )}
    </PageLayout>
  );
};
