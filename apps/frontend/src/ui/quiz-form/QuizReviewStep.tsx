import type { CreateQuestionDto } from "../../api/quizzes";

type Props = {
  title: string;
  mode: "practice" | "assessment";
  questions: Array<CreateQuestionDto & { id?: string }>;
  totalQuestions: number;
  hasPendingQuestion: boolean;
};

export function QuizReviewStep({ title, mode, questions, totalQuestions, hasPendingQuestion }: Props) {
  return (
    <div className="card section">
      <h3>Áttekintés</h3>
      <div className="summary-grid">
        <div className="summary-item"><div className="summary-label">Cím</div><div className="summary-value">{title || "—"}</div></div>
        <div className="summary-item"><div className="summary-label">Mód</div><div className="summary-value">{mode === "assessment" ? "Vizsga" : "Gyakorlás"}</div></div>
        <div className="summary-item"><div className="summary-label">Kérdések</div><div className="summary-value">{totalQuestions}</div></div>
      </div>
      <div className="summary-list">
        {questions.slice(0, 5).map((question, index) => (
          <div key={`${question.prompt}-${index}`} className="summary-row">{index + 1}. {question.prompt}</div>
        ))}
        {questions.length > 5 && <div className="summary-row muted">+ {questions.length - 5} további kérdés</div>}
      </div>
      {hasPendingQuestion && (
        <div className="summary-warning">Van egy még el nem mentett kérdésed. Mentsd el a listába, mielőtt véglegesítesz.</div>
      )}
    </div>
  );
}
