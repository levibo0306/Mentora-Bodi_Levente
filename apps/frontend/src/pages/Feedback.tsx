import { FormEvent, useEffect, useState } from "react";
import { FeedbackContact, FeedbackMessage, FeedbackTarget, getFeedbackContacts, getFeedbackMessages, getFeedbackTargets, sendFeedbackMessage } from "../api/feedback";
import { PageLayout } from "../ui/PageLayout";
import { useAuth } from "../context/AuthContext";

export function Feedback() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<FeedbackContact[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [targets, setTargets] = useState<FeedbackTarget[]>([]);
  const [targetKey, setTargetKey] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { getFeedbackContacts().then((data) => { setContacts(data); setSelectedId((id) => id || data[0]?.id || ""); }).catch(() => setContacts([])); }, []);
  useEffect(() => {
    if (!selectedId) { setMessages([]); setTargets([]); return; }
    Promise.all([getFeedbackMessages(selectedId), getFeedbackTargets(selectedId)])
      .then(([messageData, targetData]) => {
        setMessages(messageData); setTargets(targetData);
        setTargetKey((value) => targetData.some((target) => `${target.type}:${target.id}` === value) ? value : targetData[0] ? `${targetData[0].type}:${targetData[0].id}` : "");
      }).catch(() => { setMessages([]); setTargets([]); });
  }, [selectedId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !selectedId) return;
    setSending(true);
    try {
      const target = targets.find((item) => `${item.type}:${item.id}` === targetKey) ?? null;
      await sendFeedbackMessage(selectedId, draft.trim(), target);
      setDraft("");
      setMessages(await getFeedbackMessages(selectedId));
    } finally { setSending(false); }
  };

  const selected = contacts.find((contact) => contact.id === selectedId);
  return (
    <PageLayout title="Csevegés" subtitle="Beszéljétek meg a tanulási eredményeket és a felmerülő kérdéseket.">
      <div className="feedback-layout">
        <aside className="feedback-contacts card">
          <h2>{user?.role === "teacher" ? "Diákjaim" : "Tanárok"}</h2>
          {contacts.length === 0 && <p className="empty-subtle">Kapcsolat akkor jelenik meg, ha egy tanár kvízt vagy témát oszt meg egy diákkal.</p>}
          {contacts.map((contact) => (
            <button key={contact.id} className={`feedback-contact ${selectedId === contact.id ? "active" : ""}`} onClick={() => setSelectedId(contact.id)}>
              <strong>{contact.username}</strong><span>{contact.email}</span>
            </button>
          ))}
        </aside>
        <section className="feedback-thread card">
          <div className="feedback-thread-header"><h2>{selected?.username ?? "Válassz kapcsolatot"}</h2><span>{selected?.email}</span></div>
          <div className="feedback-messages">
            {selected && messages.length === 0 && <p className="empty-subtle">Még nincs üzenet. Írj konkrét, segítő visszajelzést.</p>}
            {messages.map((message) => (
              <article key={message.id} className={`feedback-message ${message.author_id === user?.id ? "mine" : ""}`}>
                {message.target_title && <span className="feedback-target">{message.target_type === "quiz" ? "Kvíz" : message.target_type === "flashcards" ? "Flashcards" : "Téma"}: {message.target_title}</span>}
                <div>{message.message}</div><small>{message.author_name} · {new Date(message.created_at).toLocaleString("hu-HU")}</small>
              </article>
            ))}
          </div>
          <form className="feedback-compose" onSubmit={submit}>
            <select value={targetKey} onChange={(event) => setTargetKey(event.target.value)} disabled={!selectedId || sending} aria-label="Visszajelzés célja">
              <option value="">Általános visszajelzés</option>
              {targets.map((target) => <option key={`${target.type}:${target.id}`} value={`${target.type}:${target.id}`}>{target.type === "quiz" ? "Kvíz" : target.type === "flashcards" ? "Flashcards" : "Téma"}: {target.title}</option>)}
            </select>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Írj visszajelzést vagy kérdést..." disabled={!selectedId || sending} />
            <button className="btn btn-primary" disabled={!selectedId || !draft.trim() || sending}>{sending ? "Küldés..." : "Küldés"}</button>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}
