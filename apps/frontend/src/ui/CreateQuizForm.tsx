import React, { useState } from "react";
import { validateQuizForm } from "../core/quizLogic";

type CreateQuizFormProps = {
  onSubmit: (title: string) => void;
};

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateQuizForm({ title })) {
      setError("A cím kötelező");
      return;
    }

    setError(null);
    onSubmit(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Kvíz címe
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Írd be a kvíz címét"
        />
      </label>
      {error && <p>{error}</p>}
      <button type="submit">Mentés</button>
    </form>
  );
};
