import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdaptiveQuizQuestions, submitQuizAttempt, QuizResult } from "../api/quizzes";
import { getOfflineQuiz, queueOfflineAttempt } from "../infra/offlineQuizzes";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correct_index?: number;
};

export const QuizPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [offline, setOffline] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    getAdaptiveQuizQuestions(id)
      .then((data) => setQuestions(data))
      .catch(() => {
        const downloaded = getOfflineQuiz(id);
        if (downloaded) {
          setQuestions(downloaded.questions);
          setOffline(true);
          return;
        }
        setLoadError("A kvíz nem érhető el. Kapcsolódj az internethez, vagy töltsd le előre offline használatra.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (idx: number) => {
    const currentQ = questions[currentStep];
    setAnswers({ ...answers, [currentQ.id]: idx });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!id) return;
    try {
      setLoading(true);
      if (offline) {
        const correct = questions.filter((question) => answers[question.id] === question.correct_index).length;
        const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
        queueOfflineAttempt(id, answers);
        setResult({ score, correct, total: questions.length });
        return;
      }
      const res = await submitQuizAttempt(id, answers);
      setResult(res);
    } catch (e) {
      alert("Hiba a kiértékeléskor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    );
  }
  
  // HA NINCS KÉRDÉS
  if (questions.length === 0) {
    return (
      <div className="result-card">
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>{loadError ? "A kvíz nem tölthető be" : "Ez a kvíz még üres!"}</h3>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {loadError || "Még nincsenek kérdések ebben a kvízben."}
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Vissza a főoldalra
        </button>
      </div>
    );
  }

  // EREDMÉNY NÉZET
  if (result) {
    const percentage = result.score;
    const isPassed = percentage >= 50;
    
    return (
      <div className="result-card">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {isPassed ? '🎉' : '📚'}
        </div>
        
        <h2 style={{ 
          fontSize: '32px', 
          marginBottom: '20px',
          color: 'var(--dark)'
        }}>
          {isPassed ? 'Gratulálunk!' : 'Még gyakorolnod kell!'}
        </h2>
        
        <div className="result-score" style={{
          color: isPassed ? 'var(--success)' : 'var(--danger)'
        }}>
          {percentage}%
        </div>
        
        <div className="result-details">
          {result.correct} / {result.total} helyes válasz
        </div>
        {offline && <p className="offline-note">Offline kitöltés. Az eredmény internetkapcsolatkor automatikusan szinkronizálódik.</p>}

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
          style={{ marginTop: '30px', padding: '16px 40px' }}
        >
          Vissza a Dashboardra
        </button>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
          style={{ marginTop: '12px', padding: '14px 40px' }}
        >
          🔄 Újrapróbálom
        </button>
      </div>
    );
  }

  // JÁTÉK NÉZET
  const question = questions[currentStep];
  const selectedOption = answers[question.id];

  return (
    <div className="quiz-player-container">
      {/* Haladásjelző */}
      <div className="progress-bar">
        <span style={{ fontWeight: '600', color: 'var(--dark)' }}>
          Kérdés {currentStep + 1} / {questions.length}
        </span>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Kilépés
        </button>
      </div>
      {offline && <div className="offline-banner">Offline mód</div>}
      {!offline && <div className="adaptive-banner">Személyre szabott gyakorlás · a kérdéssor a korábbi eredményeidhez igazodik</div>}

      {/* Kérdés Kártya */}
      <div className="question-card">
        <h2 className="question-text">{question.prompt}</h2>

        <div className="options-container">
          {question.options.map((opt, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`option-card ${selectedOption === idx ? 'selected' : ''}`}
            >
              <div className="option-radio"></div>
              <span>{opt}</span>
            </div>
          ))}
        </div>

        <div className="quiz-navigation">
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={selectedOption === undefined}
            style={{ 
              opacity: selectedOption === undefined ? 0.5 : 1,
              padding: '14px 32px',
              fontSize: '16px'
            }}
          >
            {currentStep === questions.length - 1 ? "Befejezés" : "Következő →"}
          </button>
        </div>
      </div>
    </div>
  );
};
