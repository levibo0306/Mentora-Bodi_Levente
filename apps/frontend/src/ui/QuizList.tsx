import React from "react";
import type { Quiz } from "../core/quizLogic";
import { EmptyState } from "./EmptyState";

type QuizListProps = {
  quizzes: Quiz[];
  onCreateClick?: () => void;
};

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onCreateClick,
}) => {
  if (!quizzes || quizzes.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <ul>
      {quizzes.map((q) => (
        <li key={q.id}>{q.title}</li>
      ))}
    </ul>
  );
};
