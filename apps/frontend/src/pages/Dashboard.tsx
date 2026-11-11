import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { trackActivity } from "../api/users";
import { CreateQuizForm } from "../ui/CreateQuizForm";
import { DashboardOverview } from "../ui/DashboardOverview";
import { Flashcards } from "../ui/Flashcards";
import { Modal } from "../ui/Modal";
import { QuizList } from "../ui/QuizList";
import { SharedAdd } from "../ui/SharedAdd";
import { SharedWithMe } from "../ui/SharedWithMe";
import { TopicsPanel } from "../ui/TopicsPanel";

type StudentTab = "quizzes" | "flashcards" | "add" | "topics";
type QuizSource = "own" | "shared";

const sectionTitles: Record<StudentTab, string> = {
  quizzes: "Kvízeim",
  flashcards: "Tanulókártyák",
  add: "Tartalom hozzáadása",
  topics: "Témák",
};

export function Dashboard() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudentTab>("quizzes");
  const [quizSource, setQuizSource] = useState<QuizSource>("own");
  const isStudent = user?.role === "student";

  const openQuizForm = (quizId: string | null = null) => {
    setEditingQuizId(quizId);
    setShowModal(true);
  };

  const closeQuizForm = () => {
    setShowModal(false);
    setEditingQuizId(null);
  };

  const handleQuizSaved = () => {
    closeQuizForm();
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="dashboard active">
      <div className="main-content">
        <header className="dashboard-heading">
          <div>
            <span className="eyebrow">{isStudent ? "Tanulói kezdőlap" : "Tanári kezdőlap"}</span>
            <h1>Szia, {user?.username ?? user?.email?.split("@")[0]}!</h1>
            <p>{isStudent ? "Válassz egy tananyagot, és folytasd onnan, ahol abbahagytad." : "Készíts kvízt, vagy nézd meg, hogyan teljesítettek a diákjaid."}</p>
          </div>
          {!isStudent && (
            <button className="btn btn-primary dashboard-primary-action" onClick={() => openQuizForm()}>
              + Új kvíz
            </button>
          )}
        </header>

        <DashboardOverview />

        {!isStudent && (
          <div className="teacher-hq">
            <div className="teacher-hq-row">
              <div className="teacher-hq-title">🎯 Tanári eszközök</div>
              <div className="teacher-hq-sub">Minden tanári eszköz egy helyen</div>
            </div>
            <div className="teacher-hq-actions">
              <Link to="/results" className="btn btn-secondary btn-sm">Eredmények</Link>
              <Link to="/flashcards" className="btn btn-secondary btn-sm">Flashcards</Link>
            </div>
          </div>
        )}

        {!isStudent && <TopicsPanel />}

        <div className="section-header">
          <div>
            <h2 className="section-title">{isStudent ? sectionTitles[activeTab] : "Saját kvízeim"}</h2>
            {isStudent && <p className="section-subtitle">Itt találod a tanuláshoz szükséges tartalmakat.</p>}
          </div>
          {(!isStudent || activeTab === "quizzes") && (
            <button className="btn btn-primary btn-sm" onClick={() => openQuizForm()}>+ Új kvíz</button>
          )}
        </div>

        {isStudent && (
          <div className="tabs">
            <button onClick={() => setActiveTab("quizzes")} className={`tab ${activeTab === "quizzes" ? "active" : ""}`}>
              <span aria-hidden="true">📚</span> Kvízek
            </button>
            <button
              onClick={() => {
                setActiveTab("flashcards");
                trackActivity("visit_flashcards").catch(() => undefined);
              }}
              className={`tab ${activeTab === "flashcards" ? "active" : ""}`}
            >
              <span aria-hidden="true">🗂️</span> Kártyák
            </button>
            <button onClick={() => setActiveTab("add")} className={`tab ${activeTab === "add" ? "active" : ""}`}>
              <span aria-hidden="true">➕</span> Hozzáadás
            </button>
            <button onClick={() => setActiveTab("topics")} className={`tab ${activeTab === "topics" ? "active" : ""}`}>
              <span aria-hidden="true">🧩</span> Témák
            </button>
          </div>
        )}

        {isStudent ? (
          <div className="dashboard-tab-content">
            <section hidden={activeTab !== "quizzes"} aria-label="Kvízek">
              <div className="content-panel">
                <div className="segment-control" aria-label="Kvízek szűrése">
                  <button className={quizSource === "own" ? "active" : ""} onClick={() => setQuizSource("own")}>Saját kvízek</button>
                  <button className={quizSource === "shared" ? "active" : ""} onClick={() => setQuizSource("shared")}>Velem megosztva</button>
                </div>
                <div hidden={quizSource !== "own"}>
                  <QuizList key={refreshKey} onEdit={(id) => openQuizForm(id)} />
                </div>
                <div hidden={quizSource !== "shared"}>
                  <SharedWithMe key={`shared-${refreshKey}`} />
                </div>
              </div>
            </section>

            <section hidden={activeTab !== "flashcards"} aria-label="Tanulókártyák"><Flashcards /></section>
            <section hidden={activeTab !== "add"} aria-label="Tartalom hozzáadása">
              <SharedAdd
                onAdded={(destination) => {
                  if (destination === "shared") {
                    setActiveTab("quizzes");
                    setQuizSource("shared");
                  } else {
                    setActiveTab(destination);
                  }
                  setRefreshKey((value) => value + 1);
                }}
              />
            </section>
            <section hidden={activeTab !== "topics"} aria-label="Témák"><TopicsPanel /></section>
          </div>
        ) : (
          <QuizList key={refreshKey} onEdit={(id) => openQuizForm(id)} />
        )}

        <Modal
          isOpen={showModal}
          onClose={closeQuizForm}
          title={editingQuizId ? "Kvíz Szerkesztése" : "Új Kvíz Létrehozása"}
        >
          <CreateQuizForm quizId={editingQuizId} onSuccess={handleQuizSaved} />
        </Modal>
      </div>
    </div>
  );
}
