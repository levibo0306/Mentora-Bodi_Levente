import React, { useState } from "react";
import { shareTopic } from "../api/topics";
import { getErrorMessage } from "../api/http";

type Props = {
  topicId: string;
  topicName: string;
  isOpen: boolean;
  onClose: () => void;
};

export const TopicShareModal: React.FC<Props> = ({ topicId, topicName, isOpen, onClose }) => {
  const [recipientsText, setRecipientsText] = useState("");
  const [allowReshare, setAllowReshare] = useState(false);
  const [links, setLinks] = useState<Array<{ token: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const recipients = recipientsText
        .split(/[,\n;]/g)
        .map((r) => r.trim())
        .filter(Boolean);
      const res = await shareTopic(topicId, recipients.length ? recipients : undefined, allowReshare);
      setLinks(res.tokens.map((t) => ({ token: t.token })));
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Nem sikerült a megosztás"));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📤 Téma megosztása</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="card section">
            <div><strong>{topicName}</strong></div>
          </div>

          {error && <div className="inline-status error">{error}</div>}

          {links.length === 0 && (
            <>
              <div className="input-group">
                <label>Címzettek email címei (opcionális)</label>
                <textarea
                  rows={2}
                  value={recipientsText}
                  onChange={(e) => setRecipientsText(e.target.value)}
                />
              </div>
              <label className="share-options" style={{ marginBottom: "12px" }}>
                <input
                  type="checkbox"
                  checked={allowReshare}
                  onChange={(e) => setAllowReshare(e.target.checked)}
                />
                Továbbosztható
              </label>
              <button className="btn btn-primary" onClick={generate} disabled={loading}>
                {loading ? "Generálás..." : "Kód generálása"}
              </button>
            </>
          )}

          {links.length > 0 && (
            <div className="card section">
              {links.map((l, i) => (
                <div key={`${l.token}-${i}`} style={{ marginBottom: "12px" }}>
                  <div className="summary-row">Kód: {l.token}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => copy(l.token)}>
                    Kód másolása
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
