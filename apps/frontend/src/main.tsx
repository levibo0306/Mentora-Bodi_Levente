import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./index";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";
import { submitQuizAttempt } from "./api/quizzes";
import { syncOfflineAttempts } from "./infra/offlineQuizzes";
import { reviewFlashcard } from "./api/flashcards";
import { syncOfflineFlashcardReviews } from "./infra/offlineFlashcards";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(console.error));
}

const syncOfflineWork = () => Promise.all([
  syncOfflineAttempts(submitQuizAttempt),
  syncOfflineFlashcardReviews(reviewFlashcard),
]).catch(console.error);
window.addEventListener("online", syncOfflineWork);
syncOfflineWork();
