import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type { Quiz } from "./core/quizLogic";
import { fetchQuizzes, createQuiz, deleteQuiz, shareQuiz } from "./api/quizzes";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./ui/Navbar";
import { Login } from "./pages/Login";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { ErrorState } from "./ui/ErrorState";
import { MetricsPanel } from "./ui/MetricsPanel";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const App: React.FC = () => {
  const nav = useNavigate();
  const { user, isAuthenticated, logout } = useAuth(); // ✅ EZ HIÁNYZOTT

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchQuizzes();
      setQuizzes(data);
    } catch (e: any) {
      setError(e?.message ?? "Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1) Csak akkor töltsük be, ha authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ✅ 2) Kijelentkezéskor tisztítás
  useEffect(() => {
    if (isAuthenticated) return;
    setQuizzes([]);
    setError(null);
    setLoading(false);
  }, [isAuthenticated]);

  // ✅ 3) Ha 401/unauthorized, dobjuk vissza loginra + logout (hogy token is törlődjön)
  useEffect(() => {
    if (!error) return;
    if (error.toLowerCase().includes("unauthorized")) {
      logout?.();
      nav("/login");
    }
  }, [error, nav, logout]);

  const handleCreate = async (title: string) => {
    try {
      setError(null);
      await createQuiz(title);
      await load();
      setSuccessMessage("Sikeres mentés");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (e: any) {
      setError(e?.message ?? "Hiba történt");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Biztos törlöd?")) return;
    try {
      setError(null);
      await deleteQuiz(id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Törlés sikertelen");
    }
  };

  const handleShare = async (id: string) => {
    try {
      setError(null);
      const { token } = await shareQuiz(id);
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      alert(`Share link: ${url}`);
    } catch (e: any) {
      setError(e?.message ?? "Megosztás sikertelen");
    }
  };

 const canCreate = !!user;

 const Dashboard = (
  <div>
    {loading && <p>Betöltés…</p>}
    {error && <ErrorState message={error} onRetry={load} />}

    {!loading && !error && (
      <>
        {successMessage && <p>{successMessage}</p>}

        {/* ide jön majd a create gomb */}
       <QuizList
  quizzes={quizzes}
  onCreateClick={() => nav("/create")}
  onDeleteClick={handleDelete}
  onShareClick={handleShare}
/>

        <button type="button" onClick={() => setShowMetrics((v) => !v)}>
          {showMetrics ? "Metrikák elrejtése" : "Metrikák megjelenítése"}
        </button>
        {showMetrics && <MetricsPanel />}
      </>
    )}
  </div>
);

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={<ProtectedRoute>{Dashboard}</ProtectedRoute>}
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                {canCreate && <CreateQuizForm onSubmit={handleCreate} />}
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
