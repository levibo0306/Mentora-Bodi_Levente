export type ReviewItem = {
  question_id: string;
  picked: number | null;
  correct_index: number;
  explanation?: string | null;
};

type Question = { id: string; prompt: string; options: string[] };

/** Per-question feedback after a practice quiz: the learner's answer, the correct one and the explanation. */
export function AnswerReview({ questions, review }: { questions: Question[]; review: ReviewItem[] }) {
  const byId = new Map(review.map((item) => [item.question_id, item]));
  const shown = questions.filter((question) => byId.has(question.id));
  if (!shown.length) return null;

  return (
    <section className="answer-review" aria-label="Kérdésenkénti visszajelzés">
      <h3>Kérdésenkénti visszajelzés</h3>
      <ol>
        {shown.map((question) => {
          const item = byId.get(question.id)!;
          const correct = item.picked === item.correct_index;
          return (
            <li key={question.id} className={`answer-review-item ${correct ? "correct" : "wrong"}`}>
              <div className="answer-review-prompt">{question.prompt}</div>
              <div>
                Válaszod:{" "}
                <strong className={correct ? "is-correct" : "is-wrong"}>
                  {item.picked === null ? "nem válaszoltál" : question.options[item.picked]}
                  {correct ? " ✓" : " ✗"}
                </strong>
              </div>
              {!correct && <div>Helyes válasz: <strong className="is-correct">{question.options[item.correct_index]}</strong></div>}
              {item.explanation && <p className="answer-review-explanation"><span>Magyarázat:</span> {item.explanation}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
