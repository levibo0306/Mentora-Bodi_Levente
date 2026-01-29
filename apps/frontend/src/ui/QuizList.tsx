import React from "react";
import type { Quiz } from "../core/quizLogic";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "./EmptyState";

type Props = {
  quizzes: Quiz[];
  onCreateClick?: () => void;
  onDeleteClick?: (id: string) => void;
  onShareClick?: (id: string) => void;
};

export const QuizList: React.FC<Props> = ({ quizzes, onCreateClick, onDeleteClick, onShareClick }) => {
  const { user } = useAuth();

  if (!quizzes || quizzes.length === 0) return <EmptyState onCreateClick={onCreateClick} />;

  return (
    <div className="quiz-grid">
      {quizzes.map((q) => (
        <div key={q.id} className="quiz-card">
          <div className="quiz-title">{q.title}</div>

          {user?.role === "teacher" && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => onShareClick?.(q.id)}>🔗 Share</button>
              <button type="button" onClick={() => onDeleteClick?.(q.id)}>🗑 Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
