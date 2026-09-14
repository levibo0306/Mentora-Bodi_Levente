import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { claimTopic, createTopic, deleteTopic, getTopics, Topic } from "../api/topics";
import { Link } from "react-router-dom";
import { TopicShareModal } from "./TopicShareModal";

export const TopicsPanel = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [color, setColor] = useState("");
  const [shareTopic, setShareTopic] = useState<Topic | null>(null);
  const [claimValue, setClaimValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    const data = await getTopics();
    setTopics(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createTopic({ name, description, subject, grade, color });
    setName("");
    setDescription("");
    setSubject("");
    setGrade("");
    setColor("");
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a témát?")) return;
    await deleteTopic(id);
    await load();
  };

  const handleClaim = async () => {
    setStatus(null);
    const token = claimValue.trim().split("/shared/").pop() || "";
    if (!token) return;
    try {
      await claimTopic(token);
      setStatus("Sikeresen hozzáadva.");
      setClaimValue("");
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? "Nem sikerült hozzáadni.");
    }
  };

  return (
    <div className="card section">
      <div className="section-header">
        <div>
          <h3>Témák</h3>
          <p className="section-help">Egy téma közös polcra rendezi a hozzá tartozó kvízeket és kártyapackeket. Megosztáskor a teljes tanulási egység eljut a diákhoz.</p>
        </div>
      </div>

      {isTeacher && (
        <div className="topic-create">
          <div className="input-group">
            <label>Téma neve</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Leírás</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Tantárgy</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Évfolyam</label>
            <input value={grade} onChange={(e) => setGrade(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Szín (opcionális)</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#FF6B35" />
          </div>
          <button className="btn btn-primary btn-sm" type="button" onClick={handleCreate}>
            + Téma létrehozása
          </button>
        </div>
      )}

      {!isTeacher && (
        <div className="topic-claim">
          <div className="input-group">
            <label>Téma kód vagy link</label>
            <input value={claimValue} onChange={(e) => setClaimValue(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" type="button" onClick={handleClaim}>
            Hozzáadás
          </button>
          {status && <div className="inline-status">{status}</div>}
        </div>
      )}

      <div className="topic-list">
        {topics.map((t) => (
          <div key={t.id} className="topic-row">
            <div>
              <div className="topic-title">{t.name}</div>
              <div className="topic-meta">
                {t.subject ? `${t.subject} · ` : ""}{t.grade ?? ""}
              </div>
            </div>
            {isTeacher && (
              <div className="topic-actions">
                <Link className="btn btn-secondary btn-sm" to={`/topics/${t.id}`}>
                  Megnyitás
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => setShareTopic(t)}>
                  Megosztás
                </button>
                <button className="btn btn-danger-soft btn-sm" onClick={() => handleDelete(t.id)}>
                  Törlés
                </button>
              </div>
            )}
            {!isTeacher && (
              <div className="topic-actions">
                <Link className="btn btn-secondary btn-sm" to={`/topics/${t.id}`}>
                  Megnyitás
                </Link>
              </div>
            )}
          </div>
        ))}
        {topics.length === 0 && <div className="empty-subtle">Még nincs témád.</div>}
      </div>

      {shareTopic && (
        <TopicShareModal
          topicId={shareTopic.id}
          topicName={shareTopic.name}
          isOpen={!!shareTopic}
          onClose={() => setShareTopic(null)}
        />
      )}
    </div>
  );
};
