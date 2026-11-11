import type { Topic } from "../../api/topics";

type QuizMode = "practice" | "assessment";

type Props = {
  title: string;
  description: string;
  mode: QuizMode;
  topicId: string | null;
  topics: Topic[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onModeChange: (value: QuizMode) => void;
  onTopicChange: (value: string | null) => void;
};

export function QuizBasicsStep(props: Props) {
  return (
    <div className="card section">
      <h3>Alapadatok</h3>
      <div className="input-group">
        <label>Kvíz címe</label>
        <input value={props.title} onChange={(event) => props.onTitleChange(event.target.value)} required />
      </div>
      <div className="input-group">
        <label>Leírás</label>
        <textarea value={props.description} onChange={(event) => props.onDescriptionChange(event.target.value)} rows={3} />
      </div>
      <div className="input-group">
        <label>Mód</label>
        <select value={props.mode} onChange={(event) => props.onModeChange(event.target.value as QuizMode)}>
          <option value="practice">Gyakorlás</option>
          <option value="assessment">Vizsga (egyszer tölthető ki)</option>
        </select>
      </div>
      <div className="input-group">
        <label>Téma</label>
        <select value={props.topicId ?? ""} onChange={(event) => props.onTopicChange(event.target.value || null)}>
          <option value="">Nincs téma</option>
          {props.topics.filter((topic) => topic.is_owner).map((topic) => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
