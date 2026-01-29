import React, { useEffect, useState } from "react";
import type { Quiz } from "./core/quizLogic";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { ErrorState } from "./ui/ErrorState";
import { fetchQuizzes, createQuiz } from "./api/quizzes";
import { MetricsPanel } from "./ui/MetricsPanel";

export const App: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchQuizzes();
      setQuizzes(data);
    } catch (_e) {
      setError("Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

const handleCreate = async (title: string) => {
  try {
    setError(null);
    await createQuiz(title);
    await load(); 
    setSuccessMessage("Sikeres mentés");
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (_e) {
    setError("Hiba történt");
  }
};

  if (loading) {
    return <p>Betöltés…</p>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      {successMessage && <p>{successMessage}</p>}
      <CreateQuizForm onSubmit={handleCreate} />
      <QuizList quizzes={quizzes} />

      <button type="button" onClick={() => setShowMetrics((v) => !v)}>
        {showMetrics ? "Metrikák elrejtése" : "Metrikák megjelenítése"}
      </button>
      {showMetrics && <MetricsPanel />}
    </div>
  );
};

export default App;
