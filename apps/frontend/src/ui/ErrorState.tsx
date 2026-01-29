import React from "react";

type ErrorStateProps = {
  onRetry?: () => void;
  message?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  onRetry,
  message,
}) => {
  return (
    <div>
      <p>{message ?? "Hiba történt"}</p>
      <button type="button" onClick={onRetry}>
        Próbáld újra
      </button>
    </div>
  );
};
