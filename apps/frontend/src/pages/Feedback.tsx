import { FormEvent, useEffect, useState } from "react";
import { FeedbackContact, FeedbackMessage, getFeedbackContacts, getFeedbackMessages, sendFeedbackMessage } from "../api/feedback";
import { PageLayout } from "../ui/PageLayout";
import { useAuth } from "../context/AuthContext";

export function Feedback() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<FeedbackContact[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { getFeedbackContacts().then((data) => { setContacts(data); setSelectedId((id) => id || data[0]?.id || ""); }).catch(() => setContacts([])); }, []);
  useEffect(() => { if (selectedId) getFeedbackMessages(selectedId).then(setMessages).catch(() => setMessages([])); else setMessages([]); }, [selectedId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !selectedId) return;
    setSending(true);
    try {
      await sendFeedbackMessage(selectedId, draft.trim());
      setDraft("");
      setMessages(await getFeedbackMessages(selectedId));
    } finally { setSending(false); }
  };

  const selected = contacts.find((contact) => contact.id === selectedId);
  return (
    <PageLayout title="Visszajelzések" subtitle="Közös tér a tanulási eredmények megbeszéléséhez.">
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
                <div>{message.message}</div><small>{message.author_name} · {new Date(message.created_at).toLocaleString("hu-HU")}</small>
              </article>
            ))}
          </div>
          <form className="feedback-compose" onSubmit={submit}>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Írj visszajelzést vagy kérdést..." disabled={!selectedId || sending} />
            <button className="btn btn-primary" disabled={!selectedId || !draft.trim() || sending}>{sending ? "Küldés..." : "Küldés"}</button>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}
