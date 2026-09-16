import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuiz, getQuizQuestions, getQuizzes, Quiz, deleteQuiz } from "../api/quizzes";
import { getTopics, Topic } from "../api/topics";
import { ShareModal } from "./ShareModal";
import { listOfflineQuizzes, removeOfflineQuiz, saveOfflineQuiz } from "../infra/offlineQuizzes";

interface Props {
  onEdit: (id: string) => void;
  topicId?: string | null;
  hideFilter?: boolean;
}

type DiffBadge = { label: string; class: string };

function getDifficultyStyle(avgDiff: number | string | null | undefined): DiffBadge {
  const n = avgDiff == null ? 3 : Number(avgDiff);
  const rounded = Math.round(Number.isFinite(n) ? n : 3);

  const levels: Record<number, DiffBadge> = {
    1: { label: "Nagyon könnyű", class: "diff-v-easy" },
    2: { label: "Könnyű", class: "diff-easy" },
    3: { label: "Közepes", class: "diff-medium" },
    4: { label: "Nehéz", class: "diff-hard" },
    5: { label: "Nagyon nehéz", class: "diff-v-hard" },
  };

  return levels[rounded] ?? levels[3];
}

export const QuizList = ({ onEdit, topicId: fixedTopicId = null, hideFilter = false }: Props) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<string | null>(fixedTopicId);
  const [offlineIds, setOfflineIds] = useState(() => new Set(listOfflineQuizzes().map((item) => item.quiz.id)));
  const [offlineBusyId, setOfflineBusyId] = useState("");
  const [offlineStatus, setOfflineStatus] = useState("");
  
  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes(topicId);
      setQuizzes(data);
    } catch (error) {
      console.error("Nem sikerült betölteni a kvízeket", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fixedTopicId !== null) {
      setTopicId(fixedTopicId);
    }
  }, [fixedTopicId]);

  useEffect(() => {
    fetchList();
  }, [topicId, fixedTopicId]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await getTopics();
        setTopics(data);
      } catch {
        setTopics([]);
      }
    };
    loadTopics();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a kvízt?")) return;
    try {
      await deleteQuiz(id);
      await fetchList();
    } catch (e) {
      alert("Hiba a törlésnél");
    }
  };

  const handleShare = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShareModalOpen(true);
  };

  const toggleOffline = async (quiz: Quiz) => {
    setOfflineBusyId(quiz.id);
    setOfflineStatus("");
    try {
      if (offlineIds.has(quiz.id)) {
        removeOfflineQuiz(quiz.id);
        setOfflineIds((ids) => {
          const next = new Set(ids);
          next.delete(quiz.id);
          return next;
        });
        setOfflineStatus(`A(z) „${quiz.title}” offline példánya törölve.`);
      } else {
        const [details, questions] = await Promise.all([getQuiz(quiz.id), getQuizQuestions(quiz.id)]);
        if (questions.length === 0) throw new Error("Üres kvízt nem lehet letölteni.");
        saveOfflineQuiz({ ...quiz, ...details }, questions);
        setOfflineIds((ids) => new Set(ids).add(quiz.id));
        setOfflineStatus(`A(z) „${quiz.title}” internet nélkül is kitölthető.`);
      }
    } catch (error: any) {
      setOfflineStatus(error?.message ?? "Nem sikerült letölteni a kvízt.");
    } finally {
      setOfflineBusyId("");
    }
  };

  if (loading) return <div className="loading">Betöltés...</div>;

  return (
    <>
      {!hideFilter && (
        <div className="quiz-filter">
          <label>Téma</label>
          <select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)}>
            <option value="">Összes</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {offlineStatus && <div className="inline-status success offline-status">{offlineStatus}</div>}
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
          <p>{topicId ? "Ebben a témában még nincs kvíz. Válassz másik témát, vagy hozz létre egyet!" : "Még nincs kvízed. Kezdj el egyet létrehozni!"}</p>
        </div>
      ) : <div className="quiz-grid">
        {quizzes.map((quiz) => {
          const diff = getDifficultyStyle((quiz as any).avg_difficulty);

          return (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-header">
                <div
                  className="quiz-header-top"
                  style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
                >
                  {/* Mode jelző */}
                  <span className={`mode-badge ${quiz.mode || "practice"}`}>
                    {quiz.mode === "assessment" ? "🏆 Vizsga" : "📖 Gyakorlás"}
                  </span>

                  {/* Nehézség (AVG kérdés difficulty alapján) */}
                  <div className={`difficulty-badge ${diff.class}`}>{diff.label}</div>
                </div>

                <div className="quiz-title" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  {quiz.title}
                </div>

                <div className="quiz-meta" style={{ color: "#666", marginTop: "4px" }}>
                  {quiz.description || "Nincs leírás"}
                </div>
              </div>

              <div className="quiz-body" style={{ marginTop: "20px" }}>
                <div className="quiz-stats" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                  <div className="quiz-stat">
                    <div className="quiz-stat-value" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                      {quiz.question_count ?? "?"}
                    </div>
                    <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                      Kérdések
                    </div>
                  </div>

                  <div className="quiz-stat">
                    <div className="quiz-stat-value" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                      {quiz.total_attempts ?? 0}
                    </div>
                    <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                      Próbák
                    </div>
                  </div>
                </div>

                <div className="quiz-actions quiz-primary-actions">
                  <Link 
                    to={`/play/${quiz.id}`} 
                    className="btn btn-primary"
                  >
                    ▶ Indítás
                  </Link>
                  {quiz.is_owner !== false && <button
                      onClick={() => handleShare(quiz)}
                      className="btn btn-secondary"
                    >
                      Megosztás
                    </button>}
                </div>
                <details className="quiz-more-actions">
                  <summary>További lehetőségek</summary>
                  <div className="quiz-actions">
                    <button onClick={() => toggleOffline(quiz)} className="btn btn-secondary" disabled={offlineBusyId === quiz.id}>
                      {offlineBusyId === quiz.id ? "Mentés..." : offlineIds.has(quiz.id) ? "Offline példány törlése" : "Mentés offline használatra"}
                    </button>
                    {quiz.is_owner !== false && <button onClick={() => onEdit(quiz.id)} className="btn btn-secondary">Szerkesztés</button>}
                    {quiz.is_owner !== false && <button onClick={() => handleDelete(quiz.id)} className="btn btn-danger-soft">Törlés</button>}
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>}

      {/* Share Modal */}
      {selectedQuiz && (
        <ShareModal
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedQuiz(null);
          }}
        />
      )}
    </>
  );
};
