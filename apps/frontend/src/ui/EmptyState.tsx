import React from "react";

type EmptyStateProps = {
  onCreateClick?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div>
      <p>Nincs még kvízed</p>
      <button type="button" onClick={onCreateClick}>
        Új kvíz létrehozása
      </button>
    </div>
  );
};
