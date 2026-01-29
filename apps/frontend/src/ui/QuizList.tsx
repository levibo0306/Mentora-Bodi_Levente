import { useEffect, useState } from "react";
import { api } from "../api/http";

type Quiz = {
  id: string;
  title: string;
  description: string;
  questionCount?: number;
};

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Adatok lekérése
    api<Quiz[]>("/api/quizzes")
      .then((data) => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nem sikerült betölteni a kvízeket.");
        setLoading(false);
      });
  }, []); // Az üres array miatt csak mount-kor fut, DE mivel a szülőben változtatjuk a `key`-t, az egész komponens újratöltődik!

  if (loading) return <div style={{ color: "white" }}>Betöltés...</div>;
  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (quizzes.length === 0) return <div style={{ color: "white", opacity: 0.8 }}>Még nincsenek kvízeid. Hozz létre egyet!</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ color: "var(--secondary)", marginBottom: "0.5rem" }}>{quiz.title}</h3>
          <p style={{ color: "#666", flexGrow: 1 }}>{quiz.description}</p>
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
            <button className="btn-secondary" style={{ width: "100%" }}>Megnyitás</button>
          </div>
        </div>
      ))}
    </div>
  );
}