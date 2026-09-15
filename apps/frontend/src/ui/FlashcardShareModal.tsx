import { useState } from "react";
import { shareFlashcardPack } from "../api/flashcards";

type Props = { packId: string; title: string; onClose: () => void };

export function FlashcardShareModal({ packId, title, onClose }: Props) {
  const [recipientsText, setRecipientsText] = useState("");
  const [links, setLinks] = useState<Array<{ token: string; recipient_email?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const recipients = recipientsText.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean);
      const result = await shareFlashcardPack(packId, recipients);
      setLinks(result.tokens);
    } catch (reason: any) {
      setError(reason?.message ?? "Nem sikerült megosztani a Flashcards csomagot.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="modal-overlay active" onClick={onClose}>
    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
      <div className="modal-header"><h2 className="modal-title">Flashcards megosztása</h2><button className="close-btn" onClick={onClose}>&times;</button></div>
      <div className="modal-body">
        <div className="summary-row"><strong>{title}</strong></div>
        {error && <div className="inline-status error">{error}</div>}
        {!links.length ? <>
          <div className="input-group"><label>Címzettek email címei (opcionális)</label><textarea rows={3} value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} placeholder="diak@iskola.hu, masik@iskola.hu" /></div>
          <p className="section-help">Email nélkül általános kód készül, amelyet a címzett a Flashcards oldalon adhat hozzá.</p>
          <button className="btn btn-primary" disabled={loading} onClick={generate}>{loading ? "Generálás..." : "Megosztási kód készítése"}</button>
        </> : <div className="share-code-list">
          {links.map((link) => <div className="summary-row" key={link.token}>
            <span>{link.recipient_email ?? "Általános kód"}</span><strong>{link.token}</strong>
            <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(link.token)}>Másolás</button>
          </div>)}
        </div>}
      </div>
    </div>
  </div>;
}
