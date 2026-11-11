import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { trackActivity } from "./api/users";
import { Dashboard } from "./pages/Dashboard";
import { Feedback } from "./pages/Feedback";
import { FlashcardLibrary } from "./pages/FlashcardLibrary";
import { Login } from "./pages/Login";
import { Missions } from "./pages/Missions";
import { Profile } from "./pages/Profile";
import { Results } from "./pages/Results";
import { SharedQuiz } from "./pages/SharedQuiz";
import { TopicDetail } from "./pages/TopicDetail";
import { ErrorToaster } from "./ui/ErrorToaster";
import { Navbar } from "./ui/Navbar";
import { ProtectedRoute } from "./ui/ProtectedRoute";
import { QuizPlayer } from "./ui/QuizPlayer";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const appOpenTracked = useRef(false);

  useEffect(() => {
    if (user?.role === "student" && !appOpenTracked.current) {
      appOpenTracked.current = true;
      trackActivity("app_open").catch(() => undefined);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "student") return;

    const activityByPath: Record<string, Parameters<typeof trackActivity>[0]> = {
      "/profile": "visit_profile",
      "/missions": "visit_missions",
      "/flashcards": "visit_flashcards",
    };
    const activity = activityByPath[location.pathname];
    if (activity) trackActivity(activity).catch(() => undefined);
  }, [location.pathname, user?.role]);

  return (
    <>
      <ErrorToaster />
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/shared/:token" element={<SharedQuiz />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><FlashcardLibrary /></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/topics/:id" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
        <Route path="/play/:id" element={<ProtectedRoute><QuizPlayer /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute requiredRole="teacher"><Results /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
