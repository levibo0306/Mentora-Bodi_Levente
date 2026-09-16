import React, { useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Navbar } from "./ui/Navbar";
import { Login } from "./pages/Login";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { Results } from "./pages/Results";
import { Missions } from "./pages/Missions";
import { Profile } from "./pages/Profile";
import { TopicDetail } from "./pages/TopicDetail";
import { Modal } from "./ui/Modal"; 
import { useAuth } from "./context/AuthContext";
import { QuizPlayer } from "./ui/QuizPlayer";
import { SharedQuiz } from "./pages/SharedQuiz";
import { SharedWithMe } from "./ui/SharedWithMe";
import { SharedAdd } from "./ui/SharedAdd";
import { DashboardOverview } from "./ui/DashboardOverview";
import { TopicsPanel } from "./ui/TopicsPanel";
import { ErrorToaster } from "./ui/ErrorToaster";
import { Feedback } from "./pages/Feedback";
import { trackActivity } from "./api/users";
import { Flashcards } from "./ui/Flashcards";
import { FlashcardLibrary } from "./pages/FlashcardLibrary";

// --- Dashboard Komponens ---
const Dashboard = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  
  // A fő navigáció célokat mutat; a saját/megosztott választás a kvízeken belül marad.
  const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards' | 'add' | 'topics'>('quizzes');
  const [quizSource, setQuizSource] = useState<'own' | 'shared'>('own');

  const handleCreateClick = () => {
    setEditingQuizId(null);
    setShowModal(true);
  };

  const handleEditClick = (id: string) => {
    setEditingQuizId(id);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshKey(prev => prev + 1);
    setEditingQuizId(null);
  };

  const isStudent = user?.role === 'student';

  const studentSectionTitle = activeTab === "flashcards"
    ? "Tanulókártyák"
    : activeTab === "topics"
      ? "Témák"
      : activeTab === "add"
        ? "Tartalom hozzáadása"
        : "Kvízeim";

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
            <button className="btn btn-primary dashboard-primary-action" onClick={handleCreateClick}>
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
              <Link to="/results" className="btn btn-secondary btn-sm">
                Eredmények
              </Link>
              <Link to="/flashcards" className="btn btn-secondary btn-sm">
                Flashcards
              </Link>
            </div>
          </div>
        )}

        {!isStudent && <TopicsPanel />}

        <div className="section-header">
          <div>
            <h2 className="section-title">{isStudent ? studentSectionTitle : "Saját kvízeim"}</h2>
            {isStudent && <p className="section-subtitle">Itt találod a tanuláshoz szükséges tartalmakat.</p>}
          </div>
          
          {(!isStudent || activeTab === "quizzes") && <button className="btn btn-primary btn-sm" onClick={handleCreateClick}>
              + Új kvíz
          </button>}
        </div>

        {/* TAB SWITCHER - csak diákoknak */}
        {isStudent && (
          <div className="tabs">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`tab ${activeTab === 'quizzes' ? "active" : ""}`}
            >
              <span aria-hidden="true">📚</span> Kvízek
            </button>
            <button
              onClick={() => {
                setActiveTab('flashcards');
                trackActivity("visit_flashcards").catch(() => undefined);
              }}
              className={`tab ${activeTab === 'flashcards' ? "active" : ""}`}
            >
              <span aria-hidden="true">🗂️</span> Kártyák
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`tab ${activeTab === 'add' ? "active" : ""}`}
            >
              <span aria-hidden="true">➕</span> Hozzáadás
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`tab ${activeTab === 'topics' ? "active" : ""}`}
            >
              <span aria-hidden="true">🧩</span> Témák
            </button>
          </div>
        )}

        {/* A diákpanelek csatolva maradnak, így fülváltáskor nincs újratöltés vagy layout-ugrás. */}
        {isStudent ? (
          <div className="dashboard-tab-content">
            <section hidden={activeTab !== "quizzes"} aria-label="Kvízek">
              <div className="content-panel">
                <div className="segment-control" aria-label="Kvízek szűrése">
                  <button className={quizSource === "own" ? "active" : ""} onClick={() => setQuizSource("own")}>Saját kvízek</button>
                  <button className={quizSource === "shared" ? "active" : ""} onClick={() => setQuizSource("shared")}>Velem megosztva</button>
                </div>
                <div hidden={quizSource !== "own"}>
                  <QuizList key={refreshKey} onEdit={handleEditClick} />
                </div>
                <div hidden={quizSource !== "shared"}>
                  <SharedWithMe key={`shared-${refreshKey}`} />
                </div>
              </div>
            </section>

            <section hidden={activeTab !== "flashcards"} aria-label="Tanulókártyák">
              <Flashcards />
            </section>

            <section hidden={activeTab !== "add"} aria-label="Tartalom hozzáadása">
              <SharedAdd
                onAdded={(destination) => {
                  if (destination === "shared") {
                    setActiveTab("quizzes");
                    setQuizSource("shared");
                  } else {
                    setActiveTab(destination);
                  }
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            </section>

            <section hidden={activeTab !== "topics"} aria-label="Témák">
              <TopicsPanel />
            </section>
          </div>
        ) : (
          <QuizList key={refreshKey} onEdit={handleEditClick} />
        )}

        {/* Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title={editingQuizId ? "Kvíz Szerkesztése" : "Új Kvíz Létrehozása"}
        >
          <CreateQuizForm 
            quizId={editingQuizId} 
            onSuccess={handleSuccess} 
          />
        </Modal>
      </div>
    </div>
  );
};

// --- Protected Route ---
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "teacher" | "student";
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    ); 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// --- Main App Component ---
export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const openTracked = React.useRef(false);

  React.useEffect(() => {
    if (user?.role === "student" && !openTracked.current) {
      openTracked.current = true;
      trackActivity("app_open").catch(() => undefined);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (user?.role !== "student") return;
    const event = location.pathname === "/profile" ? "visit_profile"
      : location.pathname === "/missions" ? "visit_missions"
      : location.pathname === "/flashcards" ? "visit_flashcards"
      : null;
    if (event) trackActivity(event).catch(() => undefined);
  }, [location.pathname, user?.role]);

  return (
    <div>
      <ErrorToaster />
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><FlashcardLibrary /></ProtectedRoute>} />
        
        {/* PUBLIC ROUTE - Nincs védelem! */}
        <Route path="/shared/:token" element={<SharedQuiz />} />
        <Route
          path="/results"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <Missions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics/:id"
          element={
            <ProtectedRoute>
              <TopicDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/play/:id"
          element={
            <ProtectedRoute>
              <QuizPlayer />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
