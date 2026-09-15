import { useEffect, useMemo, useState } from "react";
import { claimFlashcardPack, createFlashcardPack, deleteFlashcardPack, Flashcard, FlashcardPack, getFlashcardPack, getFlashcardPacks, getFlashcardPackStats, importQuizAsPack, NewCard, reviewFlashcard } from "../api/flashcards";
import { getTopics, Topic } from "../api/topics";
import { getImportableQuizzes, Quiz } from "../api/quizzes";
import { useAuth } from "../context/AuthContext";
import { trackActivity } from "../api/users";
import { FlashcardShareModal } from "./FlashcardShareModal";
import {
  applyOfflineFlashcardReview,
  asOfflinePackSummary,
  getOfflineFlashcardPack,
  listOfflineFlashcardPacks,
  queueOfflineFlashcardReview,
  removeOfflineFlashcardPack,
  saveOfflineFlashcardPack,
} from "../infra/offlineFlashcards";

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
  const [sharePack, setSharePack] = useState<FlashcardPack | null>(null);
  const [claimCode, setClaimCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [activeOffline, setActiveOffline] = useState(false);
  const [offlinePackIds, setOfflinePackIds] = useState(() => new Set(listOfflineFlashcardPacks().map((pack) => pack.id)));
  const [offlineBusyId, setOfflineBusyId] = useState("");

  const loadPacks = async () => {
    const offline = listOfflineFlashcardPacks(fixedTopicId);
    setOfflinePackIds(new Set(listOfflineFlashcardPacks().map((pack) => pack.id)));
    try {
      const online = await getFlashcardPacks(fixedTopicId);
      const onlineIds = new Set(online.map((pack) => pack.id));
      setPacks([...online, ...offline.filter((pack) => !onlineIds.has(pack.id)).map(asOfflinePackSummary)]);
    } catch {
      setPacks(offline.map(asOfflinePackSummary));
      if (offline.length) setStatus("Offline mód: a letöltött Flashcards csomagok érhetők el.");
    }
  };
  useEffect(() => { loadPacks(); }, [fixedTopicId]);
  useEffect(() => {
    Promise.all([getTopics(), getImportableQuizzes()])
      .then(([topicData, quizData]) => { setTopics(topicData); setQuizzes(quizData); })
      .catch(() => { setTopics([]); setQuizzes([]); });
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

  const claimPack = async () => {
    if (!claimCode.trim()) return;
    setBusy(true); setStatus(null);
    try {
      await claimFlashcardPack(claimCode.trim());
      setClaimCode(""); setStatus("A Flashcards csomag megjelent a könyvtáradban."); await loadPacks();
    } catch (error: any) { setStatus(error?.message ?? "Nem sikerült hozzáadni a Flashcards csomagot."); }
    finally { setBusy(false); }
  };

  const openPack = async (pack: FlashcardPack) => {
    let data: FlashcardPack & { cards: Flashcard[] };
    let isOffline = false;
    try {
      data = await getFlashcardPack(pack.id);
      if (offlinePackIds.has(pack.id)) saveOfflineFlashcardPack(data);
    } catch {
      const downloaded = getOfflineFlashcardPack(pack.id);
      if (!downloaded) {
        setStatus("Ez a csomag nincs letöltve. Kapcsolódj az internethez az első megnyitáshoz.");
        return;
      }
      data = downloaded;
      isOffline = true;
    }
    const due = data.cards.filter((card) => new Date(card.due_at).getTime() <= Date.now());
    const selected = due.length ? due : data.cards;
    setActivePack(data); setActiveOffline(isOffline); setQueue([...selected].sort(() => Math.random() - 0.5)); setIndex(0); setFlipped(false); setStats(null); setStatsPackId(null);
  };

  const toggleOffline = async (pack: FlashcardPack) => {
    setOfflineBusyId(pack.id);
    setStatus(null);
    try {
      if (offlinePackIds.has(pack.id)) {
        removeOfflineFlashcardPack(pack.id);
        setOfflinePackIds((current) => {
          const next = new Set(current);
          next.delete(pack.id);
          return next;
        });
        setStatus(`A(z) „${pack.title}” offline példánya törölve.`);
      } else {
        const data = await getFlashcardPack(pack.id);
        saveOfflineFlashcardPack(data);
        setOfflinePackIds((current) => new Set(current).add(pack.id));
        setStatus(`A(z) „${pack.title}” internet nélkül is gyakorolható.`);
      }
    } catch (error: any) {
      setStatus(error?.message ?? "Nem sikerült letölteni a Flashcards csomagot.");
    } finally {
      setOfflineBusyId("");
    }
  };

  const rate = async (quality: number) => {
    const card = queue[index];
    if (!activePack || !card) return;
    let reviewedOffline = activeOffline || !navigator.onLine;
    if (!reviewedOffline) {
      try {
        await reviewFlashcard(activePack.id, card.id, quality);
        if (offlinePackIds.has(activePack.id)) applyOfflineFlashcardReview(activePack.id, card.id, quality);
      } catch {
        reviewedOffline = true;
      }
    }
    if (reviewedOffline) {
      if (!getOfflineFlashcardPack(activePack.id)) {
        saveOfflineFlashcardPack(activePack);
        setOfflinePackIds((currentIds) => new Set(currentIds).add(activePack.id));
      }
      applyOfflineFlashcardReview(activePack.id, card.id, quality);
      queueOfflineFlashcardReview(activePack.id, card.id, quality);
      setActiveOffline(true);
    }
    if (index + 1 >= queue.length && user?.role === "student" && !reviewedOffline) {
      await trackActivity("complete_flashcard_session", { pack_id: activePack.id }).catch(() => undefined);
    }
    setFlipped(false); setIndex((current) => current + 1);
  };

  const current = queue[index];
  if (activePack) {
    return (
      <section className="pack-study card">
        <button className="text-button" onClick={() => { setActivePack(null); loadPacks(); }}>← Vissza a Flashcards csomagokhoz</button>
        {activeOffline && <div className="offline-banner">Offline mód · az értékelések később szinkronizálódnak</div>}
        <div className="pack-study-heading"><div><span className="eyebrow">Fókusz mód</span><h2>{activePack.title}</h2></div><strong>{Math.min(index + 1, queue.length)} / {queue.length}</strong></div>
        {current ? <>
          <button className={`study-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)}>
            <span className="study-side-label">{flipped ? "Válasz" : "Fogalom"}</span>
            <span>{flipped ? current.back : current.front}</span>
            <small>Kattints a fordításhoz</small>
          </button>
          {flipped && <div className="recall-actions" aria-label="Mennyire emlékeztél a válaszra?">
            <button onClick={() => rate(1)} className="recall again">Nem tudtam<small>Ma újra megmutatjuk</small></button>
            <button onClick={() => rate(3)} className="recall hard">Nehezen ment<small>Hamarosan újra előjön</small></button>
            <button onClick={() => rate(4)} className="recall good">Tudtam<small>Néhány nap múlva ismételjük</small></button>
            <button onClick={() => rate(5)} className="recall easy">Nagyon könnyű<small>Később kerül elő</small></button>
          </div>}
        </> : <div className="study-complete"><div className="study-complete-mark">✓</div><h2>Mai kör kész</h2><p>{queue.length} kártyát ismételtél át. A következő kör már az emlékezésedhez igazodik.</p><button className="btn btn-primary" onClick={() => setActivePack(null)}>Befejezés</button></div>}
      </section>
    );
  }

  return <div className="flashcard-workspace">
    <section className="pack-intro"><div><span className="eyebrow">Flashcards</span><h2>Fogalmak, egy helyen.</h2><p>A téma a tantárgyi polc, a Flashcards csomag pedig egy együtt gyakorolható fogalomkészlet.</p></div><div className="pack-count"><strong>{packs.length}</strong><span>csomag</span></div></section>
    <div className="pack-tools">
      <details className="card pack-builder" open={packs.length === 0 ? true : undefined}>
        <summary>+ Új Flashcards csomag összeállítása</summary>
        <div className="pack-builder-body">
          <div className="form-grid"><label>Csomag neve<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Például: Sejtbiológia alapfogalmak" /></label><label>Téma<select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)} disabled={fixedTopicId !== null}><option value="">Nincs témához rendelve</option>{topics.filter((topic) => topic.is_owner).map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label></div>
          <label>Rövid leírás<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mire készült ez a Flashcards csomag?" /></label>
          <div className="card-editor-list">{draftCards.map((card, position) => <div className="card-editor-row" key={position}><span>{position + 1}</span><input value={card.front} onChange={(e) => updateCard(position, "front", e.target.value)} placeholder="Fogalom vagy kérdés" /><textarea value={card.back} onChange={(e) => updateCard(position, "back", e.target.value)} placeholder="Definíció vagy válasz" /><button aria-label="Kártya törlése" onClick={() => setDraftCards((cards) => cards.filter((_, index) => index !== position))}>×</button></div>)}</div>
          <div className="builder-actions"><button className="btn btn-secondary" onClick={() => setDraftCards((cards) => [...cards, emptyCard()])}>+ Új sor</button><button className="btn btn-primary" disabled={busy || !title.trim() || !validCards.length} onClick={createPack}>{busy ? "Mentés..." : `${validCards.length} kártya mentése`}</button></div>
        </div>
      </details>
      <div className="card quiz-import"><div><span className="eyebrow">Gyorsindítás</span><h3>Kvízből Flashcards</h3><p>Minden kérdésből egy kártya készül. A hátlapon a helyes válasz és a részletes magyarázat jelenik meg.</p></div><select value={importQuizId} onChange={(e) => setImportQuizId(e.target.value)}><option value="">Válassz saját vagy megosztott kvízt...</option>{importableQuizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}</select><button className="btn btn-primary" disabled={!importQuizId || busy} onClick={importQuiz}>Flashcards létrehozása</button></div>
    </div>
    <div className="card flashcard-claim"><div><strong>Megosztott Flashcards hozzáadása</strong><span>Írd be a kapott kódot.</span></div><input value={claimCode} onChange={(event) => setClaimCode(event.target.value)} placeholder="Megosztási kód" /><button className="btn btn-secondary" disabled={busy || !claimCode.trim()} onClick={claimPack}>Hozzáadás</button></div>
    {status && <div className="inline-status">{status}</div>}
    {packs.length === 0 ? <div className="empty-state"><p>Még nincs Flashcards csomagod. Hozd létre az elsőt legalább egy kártyával.</p></div> : <div className="pack-grid">{packs.map((pack) => <article className="pack-tile" key={pack.id}><div className="pack-tile-top"><span>{pack.topic_name ?? "Önálló Flashcards"}{offlinePackIds.has(pack.id) ? " · Offline" : ""}</span><strong>{pack.card_count}</strong></div><h3>{pack.title}</h3><p>{pack.description || "Gyakorlásra kész fogalomcsomag."}</p><div className="pack-progress"><span>{pack.due_count || pack.card_count} esedékes</span><span>{pack.review_count} ismétlés</span></div><div className="pack-actions"><button className="btn btn-primary" onClick={() => openPack(pack)}>Gyakorlás</button><button className="btn btn-secondary" disabled={offlineBusyId === pack.id} onClick={() => toggleOffline(pack)}>{offlineBusyId === pack.id ? "Mentés..." : offlinePackIds.has(pack.id) ? "Offline törlése" : "Offline letöltés"}</button>{pack.owner_id === user?.id && <><button className="btn btn-secondary" onClick={() => setSharePack(pack)}>Megosztás</button><button className="btn btn-secondary" onClick={async () => { setStats(await getFlashcardPackStats(pack.id)); setStatsPackId(pack.id); }}>Statisztika</button><button className="text-button danger" onClick={async () => { if (confirm("Törlöd a teljes Flashcards csomagot?")) { await deleteFlashcardPack(pack.id); removeOfflineFlashcardPack(pack.id); await loadPacks(); } }}>Törlés</button></>}</div>{stats && statsPackId === pack.id && <div className="pack-stats">{stats.length ? stats.map((row) => <div key={row.student_id}><strong>{row.username}</strong><span>{row.reviews} ismétlés · {row.success_rate}%</span></div>) : <span>Még nincs tanulási adat.</span>}</div>}</article>)}</div>}
    {sharePack && <FlashcardShareModal packId={sharePack.id} title={sharePack.title} onClose={() => setSharePack(null)} />}
  </div>;
};
