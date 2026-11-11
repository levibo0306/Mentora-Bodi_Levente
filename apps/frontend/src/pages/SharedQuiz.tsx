import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../api/http";

type SharedQuestion = { id: string; prompt: string; options: string[] };
type SharedQuizData = {
  quiz: { id: string; title: string; description?: string };
  questions: SharedQuestion[];
};
type SharedQuizResponse = Omit<SharedQuizData, "questions"> & {
  questions: Array<Omit<SharedQuestion, "options"> & { options: string[] | string }>;
};
type SubmitResult = { score: number; max: number };

function SharedPage({ children }: { children: ReactNode }) {
  return <main className="shared-quiz-page">{children}</main>;
}

function CenteredCard({ children }: { children: ReactNode }) {
  return <div className="shared-quiz-centered"><div className="result-card">{children}</div></div>;
}

function ResultView({ result, onBack }: { result: SubmitResult; onBack: () => void }) {
  const percentage = result.max > 0 ? Math.round((result.score / result.max) * 100) : 0;
  const passed = percentage >= 50;

  return (
    <CenteredCard>
      <div className="shared-quiz-result-icon">{passed ? "🎉" : "📚"}</div>
      <h2 className="shared-quiz-result-title">{passed ? "Gratulálunk!" : "Jó próbálkozás!"}</h2>
      <div className={`shared-quiz-score ${passed ? "passed" : "retry"}`}>{percentage}%</div>
      <div className="shared-quiz-score-detail">{result.score} / {result.max} helyes válasz</div>
      <div className="shared-quiz-result-message">
        {passed
          ? "✨ Remek teljesítmény! Gratulálunk a sikeres eredményhez!"
          : "💪 Ne add fel! Próbáld meg újra, és biztosan sikerülni fog!"}
      </div>
      <div className="shared-quiz-result-actions">
        <button onClick={onBack} className="btn btn-secondary">← Vissza</button>
        <button onClick={() => window.location.reload()} className="btn btn-primary">🔄 Újrapróbálom</button>
      </div>
    </CenteredCard>
  );
}

export function SharedQuiz() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<SharedQuizData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Érvénytelen link");
      setLoading(false);
      return;
    }

    api<SharedQuizResponse>(`/api/share/${token}`)
      .then((data) => setQuizData({
        ...data,
        questions: data.questions.map((question) => ({
          ...question,
          options: typeof question.options === "string" ? JSON.parse(question.options) : question.options,
        })),
      }))
      .catch((reason: unknown) => {
        console.error("Quiz load error:", reason);
        setError(getErrorMessage(reason, "Nem sikerült betölteni a kvízt. Ellenőrizd a linket!"));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      setResult(await api<SubmitResult>(`/api/share/${token}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }));
    } catch (reason) {
      console.error(reason);
      alert("Hiba történt a kiértékelés során");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => navigate("/");

  if (loading) {
    return (
      <SharedPage>
        <CenteredCard>
          <div className="shared-quiz-loading-icon">⏳</div>
          <p>Kvíz betöltése...</p>
        </CenteredCard>
      </SharedPage>
    );
  }

  if (error || !quizData) {
    return (
      <SharedPage>
        <CenteredCard>
          <div className="shared-quiz-result-icon">❌</div>
          <h2 className="shared-quiz-error-title">Hiba történt</h2>
          <p>{error ?? "Nem sikerült betölteni a kvízt"}</p>
          <button onClick={goBack} className="btn btn-primary">Vissza a főoldalra</button>
        </CenteredCard>
      </SharedPage>
    );
  }

  if (quizData.questions.length === 0) {
    return (
      <SharedPage>
        <CenteredCard>
          <h2>Ez a kvíz még üres</h2>
          <p>Nincs kitölthető kérdés a megosztott kvízben.</p>
          <button onClick={goBack} className="btn btn-primary">Vissza a főoldalra</button>
        </CenteredCard>
      </SharedPage>
    );
  }

  if (result) return <SharedPage><ResultView result={result} onBack={goBack} /></SharedPage>;

  const question = quizData.questions[currentStep];
  const selectedOption = answers[question.id];
  const isLastQuestion = currentStep === quizData.questions.length - 1;
  const progress = ((currentStep + 1) / quizData.questions.length) * 100;
  const next = () => isLastQuestion ? void submit() : setCurrentStep((step) => step + 1);

  return (
    <SharedPage>
      <section className="shared-quiz-header">
        <div className="shared-quiz-heading-row">
          <div>
            <h1>{quizData.quiz.title}</h1>
            {quizData.quiz.description && <p>{quizData.quiz.description}</p>}
          </div>
          <div className="shared-quiz-counter">{currentStep + 1} / {quizData.questions.length}</div>
        </div>
        <div className="shared-quiz-progress"><div style={{ width: `${progress}%` }} /></div>
      </section>

      <section className="shared-quiz-question-card">
        <h2>{question.prompt}</h2>
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={`${question.id}-${index}`}
              onClick={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
              className={`option-card ${selectedOption === index ? "selected" : ""}`}
            >
              <span className="option-radio" />
              <span>{option}</span>
            </button>
          ))}
        </div>
        <div className="shared-quiz-navigation">
          <button
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            className="btn btn-secondary"
            disabled={currentStep === 0}
          >
            ← Előző
          </button>
          <button onClick={next} className="btn btn-primary" disabled={selectedOption === undefined || submitting}>
            {submitting ? "Kiértékelés..." : isLastQuestion ? "✓ Befejezés" : "Következő →"}
          </button>
        </div>
      </section>

      <footer className="shared-quiz-footer">Powered by <strong>Mentora</strong> 🎓</footer>
    </SharedPage>
  );
}
