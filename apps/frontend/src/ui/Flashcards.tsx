import { useEffect, useMemo, useState } from "react";
import { createFlashcardPack, deleteFlashcardPack, Flashcard, FlashcardPack, getFlashcardPack, getFlashcardPacks, getFlashcardPackStats, importQuizAsPack, NewCard, reviewFlashcard } from "../api/flashcards";
import { getTopics, Topic } from "../api/topics";
import { getQuizzes, Quiz } from "../api/quizzes";
import { useAuth } from "../context/AuthContext";
import { trackActivity } from "../api/users";

type Props = { topicId?: string | null };
const emptyCard = (): NewCard => ({ front: "", back: "" });

export const Flashcards = ({ topicId: fixedTopicId = null }: Props) => {
  const { user } = useAuth();
  const [packs, setPacks] = useState<FlashcardPack[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [topicId, setTopicId] = useState<string | null>(fixedTopicId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [draftCards, setDraftCards] = useState<NewCard[]>([emptyCard(), emptyCard()]);
  const [activePack, setActivePack] = useState<(FlashcardPack & { cards: Flashcard[] }) | null>(null);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<any[] | null>(null);
  const [statsPackId, setStatsPackId] = useState<string | null>(null);
  const [importQuizId, setImportQuizId] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPacks = async () => setPacks(await getFlashcardPacks(fixedTopicId));
  useEffect(() => { loadPacks(); }, [fixedTopicId]);
  useEffect(() => {
    Promise.all([getTopics(), getQuizzes()]).then(([topicData, quizData]) => { setTopics(topicData); setQuizzes(quizData); });
  }, []);

  const validCards = useMemo(() => draftCards.filter((card) => card.front.trim() && card.back.trim()), [draftCards]);
  const importableQuizzes = useMemo(() => fixedTopicId ? quizzes.filter((quiz) => quiz.topic_id === fixedTopicId) : quizzes, [quizzes, fixedTopicId]);
  const updateCard = (position: number, field: keyof NewCard, value: string) =>
    setDraftCards((cards) => cards.map((card, index) => index === position ? { ...card, [field]: value } : card));

  const createPack = async () => {
    if (!title.trim() || !validCards.length) return;
    setBusy(true);
    try {
      await createFlashcardPack({ title, description, topic_id: topicId, cards: validCards });
      setTitle(""); setDescription(""); setDraftCards([emptyCard(), emptyCard()]); await loadPacks();
    } finally { setBusy(false); }
  };

  const importQuiz = async () => {
    if (!importQuizId) return;
    setBusy(true);
    try { await importQuizAsPack(importQuizId); setImportQuizId(""); await loadPacks(); }
    finally { setBusy(false); }
  };

  const openPack = async (pack: FlashcardPack) => {
    const data = await getFlashcardPack(pack.id);
    const due = data.cards.filter((card) => new Date(card.due_at).getTime() <= Date.now());
    const selected = due.length ? due : data.cards;
    setActivePack(data); setQueue([...selected].sort(() => Math.random() - 0.5)); setIndex(0); setFlipped(false); setStats(null); setStatsPackId(null);
  };

  const rate = async (quality: number) => {
    const card = queue[index];
    if (!activePack || !card) return;
    await reviewFlashcard(activePack.id, card.id, quality);
    if (index + 1 >= queue.length && user?.role === "student") {
      await trackActivity("complete_flashcard_session", { pack_id: activePack.id });
    }
    setFlipped(false); setIndex((current) => current + 1);
  };

  const current = queue[index];
  if (activePack) {
    return (
      <section className="pack-study card">
        <button className="text-button" onClick={() => { setActivePack(null); loadPacks(); }}>← Vissza a packekhez</button>
        <div className="pack-study-heading"><div><span className="eyebrow">Fókusz mód</span><h2>{activePack.title}</h2></div><strong>{Math.min(index + 1, queue.length)} / {queue.length}</strong></div>
        {current ? <>
          <button className={`study-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)}>
            <span className="study-side-label">{flipped ? "Válasz" : "Fogalom"}</span>
            <span>{flipped ? current.back : current.front}</span>
            <small>Kattints a fordításhoz</small>
          </button>
          {flipped && <div className="recall-actions">
            <button onClick={() => rate(1)} className="recall again">Újra<small>1 nap</small></button>
            <button onClick={() => rate(3)} className="recall hard">Nehéz<small>rövidebb idő</small></button>
            <button onClick={() => rate(4)} className="recall good">Ment<small>SM-2 ütemezés</small></button>
            <button onClick={() => rate(5)} className="recall easy">Könnyű<small>hosszabb idő</small></button>
          </div>}
        </> : <div className="study-complete"><div className="study-complete-mark">✓</div><h2>Mai kör kész</h2><p>{queue.length} kártyát ismételtél át. A következő kör már az emlékezésedhez igazodik.</p><button className="btn btn-primary" onClick={() => setActivePack(null)}>Befejezés</button></div>}
      </section>
    );
  }

  return <div className="flashcard-workspace">
    <section className="pack-intro"><div><span className="eyebrow">Tanulókártyák</span><h2>Fogalmak, egy helyen.</h2><p>A téma a tantárgyi polc, a pack pedig egy együtt gyakorolható fogalomkészlet.</p></div><div className="pack-count"><strong>{packs.length}</strong><span>pack</span></div></section>
    <div className="pack-tools">
      <details className="card pack-builder" open={packs.length === 0 ? true : undefined}>
        <summary>+ Új kártyapack összeállítása</summary>
        <div className="pack-builder-body">
          <div className="form-grid"><label>Pack neve<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Például: Sejtbiológia alapfogalmak" /></label><label>Téma<select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)} disabled={fixedTopicId !== null}><option value="">Nincs témához rendelve</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label></div>
          <label>Rövid leírás<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mire készült ez a pack?" /></label>
          <div className="card-editor-list">{draftCards.map((card, position) => <div className="card-editor-row" key={position}><span>{position + 1}</span><input value={card.front} onChange={(e) => updateCard(position, "front", e.target.value)} placeholder="Fogalom vagy kérdés" /><textarea value={card.back} onChange={(e) => updateCard(position, "back", e.target.value)} placeholder="Definíció vagy válasz" /><button aria-label="Kártya törlése" onClick={() => setDraftCards((cards) => cards.filter((_, index) => index !== position))}>×</button></div>)}</div>
          <div className="builder-actions"><button className="btn btn-secondary" onClick={() => setDraftCards((cards) => [...cards, emptyCard()])}>+ Új sor</button><button className="btn btn-primary" disabled={busy || !title.trim() || !validCards.length} onClick={createPack}>{busy ? "Mentés..." : `${validCards.length} kártya mentése`}</button></div>
        </div>
      </details>
      <div className="card quiz-import"><div><span className="eyebrow">Gyorsindítás</span><h3>Kvízből pack</h3><p>Minden kérdésből egy kártya, a helyes válaszból hátlap készül.</p></div><select value={importQuizId} onChange={(e) => setImportQuizId(e.target.value)}><option value="">Válassz kvízt...</option>{importableQuizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}</select><button className="btn btn-primary" disabled={!importQuizId || busy} onClick={importQuiz}>Generálás</button></div>
    </div>
    {packs.length === 0 ? <div className="empty-state"><p>Még nincs kártyapack. Hozd létre az elsőt legalább egy kártyával.</p></div> : <div className="pack-grid">{packs.map((pack) => <article className="pack-tile" key={pack.id}><div className="pack-tile-top"><span>{pack.topic_name ?? "Önálló pack"}</span><strong>{pack.card_count}</strong></div><h3>{pack.title}</h3><p>{pack.description || "Gyakorlásra kész fogalomcsomag."}</p><div className="pack-progress"><span>{pack.due_count || pack.card_count} esedékes</span><span>{pack.review_count} ismétlés</span></div><div className="pack-actions"><button className="btn btn-primary" onClick={() => openPack(pack)}>Gyakorlás</button>{pack.owner_id === user?.id && <><button className="btn btn-secondary" onClick={async () => { setStats(await getFlashcardPackStats(pack.id)); setStatsPackId(pack.id); }}>Statisztika</button><button className="text-button danger" onClick={async () => { if (confirm("Törlöd a teljes packet?")) { await deleteFlashcardPack(pack.id); await loadPacks(); } }}>Törlés</button></>}</div>{stats && statsPackId === pack.id && <div className="pack-stats">{stats.length ? stats.map((row) => <div key={row.student_id}><strong>{row.username}</strong><span>{row.reviews} ismétlés · {row.success_rate}%</span></div>) : <span>Még nincs tanulási adat.</span>}</div>}</article>)}</div>}
  </div>;
};
