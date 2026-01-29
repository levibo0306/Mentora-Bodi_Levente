import { useState } from "react";
import { api } from "../api/http";

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function CreateQuizForm({ onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState("Földrajz Kvíz");
  const [description, setDescription] = useState("Teszteld a tudásod országokról és fővárosokról");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/api/quizzes", {
        method: "POST",
        body: JSON.stringify({ title, description, questions: [] }),
      });
      onSuccess(); // Siker!
    } catch (err: any) {
      setError(err.message || "Hiba történt.");
    } finally {
      setLoading(false);
    }
  }

  // Ez a JSX szerkezet pontosan követi a test.html "modal-content" részét
  return (
    <div className="modal active" onClick={(e) => { if(e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Új Kvíz Létrehozása</h2>
          <button className="close-modal" onClick={onCancel}>×</button>
        </div>

        {error && <div style={{ color: "var(--danger)", marginBottom: "15px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Kvíz címe</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Pl. Történelem alapok"
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label>Leírás</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Rövid leírás a kvízről"
              disabled={loading}
            />
          </div>

          <div className="share-section">
            <div className="share-title">Beállítások</div>
            <div className="share-options">
                <label>
                    <input type="checkbox" defaultChecked />
                    Megosztás a diákjaimmal
                </label>
                <label>
                    <input type="checkbox" />
                    Nyilvános kvíz
                </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Mentés..." : "Kvíz Létrehozása"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Mégse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}