type Props = {
  prompt: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  isEditing: boolean;
  onPromptChange: (value: string) => void;
  onOptionsChange: (value: string[]) => void;
  onCorrectIndexChange: (value: number) => void;
  onDifficultyChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function QuestionEditor(props: Props) {
  const changeOption = (index: number, value: string) => {
    const nextOptions = [...props.options];
    nextOptions[index] = value;
    props.onOptionsChange(nextOptions);
  };

  return (
    <div className="card section question-builder">
      <h3>{props.isEditing ? "Kérdés szerkesztése" : "Új kérdés hozzáadása"}</h3>
      <input
        className="prompt-input"
        placeholder="Kérdés szövege..."
        value={props.prompt}
        onChange={(event) => props.onPromptChange(event.target.value)}
      />
      <div className="options-grid">
        {props.options.map((option, index) => (
          <div key={index} className="option-row">
            <input type="radio" checked={props.correctIndex === index} onChange={() => props.onCorrectIndexChange(index)} />
            <input value={option} onChange={(event) => changeOption(index, event.target.value)} placeholder={`Válasz ${index + 1}`} />
          </div>
        ))}
      </div>
      <div className="difficulty-slider">
        <label>Nehézség: <strong>{props.difficulty}</strong></label>
        <input type="range" min="1" max="5" value={props.difficulty} onChange={(event) => props.onDifficultyChange(Number(event.target.value))} />
      </div>
      <div className="question-actions">
        <button type="button" onClick={props.onSave} className="btn-add">
          {props.isEditing ? "Mentés" : "Kérdés mentése a listába"}
        </button>
        {props.isEditing && <button type="button" className="btn btn-secondary" onClick={props.onCancel}>Mégse</button>}
      </div>
    </div>
  );
}
