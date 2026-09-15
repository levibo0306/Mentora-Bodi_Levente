import { useState } from "react";
import { api } from "../api/http";
import { claimFlashcardPack } from "../api/flashcards";
import { claimTopic } from "../api/topics";

type ShareableType = "quiz" | "topic" | "flashcards";
type DestinationTab = "shared" | "topics" | "flashcards";

type Props = {
  onAdded: (destination: DestinationTab) => void;
};

const shareableTypes: Array<{
  id: ShareableType;
  icon: string;
  title: string;
  description: string;
}> = [
  { id: "quiz", icon: "📚", title: "Kvíz", description: "Egy megosztott kvíz felvétele" },
  { id: "topic", icon: "🧩", title: "Téma", description: "Kvízek és Flashcards együtt" },
  { id: "flashcards", icon: "🗂️", title: "Flashcards", description: "Egy teljes fogalomcsomag" },
];

export const SharedAdd = ({ onAdded }: Props) => {
  const [type, setType] = useState<ShareableType>("quiz");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const extractToken = (input: string) => {
    const trimmed = input.trim();
    const match = trimmed.match(/\/shared\/([A-Za-z0-9_-]+)/);
    if (match) return match[1];
    return trimmed;
  };

  const handleAdd = async () => {
    const token = extractToken(value);
    if (!token || token.length < 6) {
      setStatus("error");
      setMessage("Adj meg egy érvényes kódot vagy linket.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      if (type === "quiz") {
        await api<{ token: string }>("/api/share/claim", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
      } else if (type === "topic") {
        await claimTopic(token);
      } else {
        await claimFlashcardPack(token);
      }
      setStatus("success");
      setMessage(`A ${type === "quiz" ? "kvíz" : type === "topic" ? "téma" : "Flashcards"} sikeresen hozzáadva.`);
      setValue("");
      onAdded(type === "quiz" ? "shared" : type === "topic" ? "topics" : "flashcards");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Nem sikerült hozzáadni.");
    }
  };

  return (
    <div className="card section shared-add">
      <div>
        <span className="eyebrow">Megosztott tartalom</span>
        <h3>Mit szeretnél hozzáadni?</h3>
        <p className="section-help">Válaszd ki a tartalom típusát, majd illeszd be a kapott kódot vagy linket.</p>
      </div>
      <div className="shared-add-types" role="radiogroup" aria-label="Hozzáadandó tartalom típusa">
        {shareableTypes.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={type === option.id}
            className={`shared-add-type ${type === option.id ? "active" : ""}`}
            onClick={() => {
              setType(option.id);
              setStatus("idle");
              setMessage("");
            }}
          >
            <span>{option.icon}</span>
            <strong>{option.title}</strong>
            <small>{option.description}</small>
          </button>
        ))}
      </div>
      <div className="input-group">
        <label>{type === "quiz" ? "Kvíz" : type === "topic" ? "Téma" : "Flashcards"} linkje vagy kódja</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
          placeholder="Például: ABCD1234 vagy https://.../shared/ABCD1234"
        />
      </div>
      <button className="btn btn-primary shared-add-submit" type="button" onClick={handleAdd} disabled={status === "loading" || !value.trim()}>
        {status === "loading" ? "Hozzáadás..." : `${type === "quiz" ? "Kvíz" : type === "topic" ? "Téma" : "Flashcards"} hozzáadása`}
      </button>
      {message && (
        <div className={`inline-status ${status}`}>
          {message}
        </div>
      )}
    </div>
  );
};
