import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/http';

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

type QuizData = {
  quiz: {
    id: string;
    title: string;
    description?: string;
  };
  questions: Question[];
};

type SubmitResult = {
  score: number;
  max: number;
};

export const SharedQuiz: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Kvíz betöltése
  useEffect(() => {
    if (!token) {
      setError('Érvénytelen link');
      setLoading(false);
      return;
    }

    api<QuizData>(`/api/share/${token}`)
      .then(data => {
        // Parse options if they're strings
        const parsedQuestions = data.questions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        setQuizData({
          ...data,
          questions: parsedQuestions
        });
      })
      .catch(err => {
        console.error('Quiz load error:', err);
        setError('Nem sikerült betölteni a kvízt. Ellenőrizd a linket!');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelect = (optionIndex: number) => {
    const currentQ = quizData!.questions[currentStep];
    setAnswers({ ...answers, [currentQ.id]: optionIndex });
  };

  const handleNext = () => {
    if (currentStep < quizData!.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await api<SubmitResult>(`/api/share/${token}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
      setResult(res);
    } catch (err) {
      alert('Hiba történt a kiértékelés során');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading állapot
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px 60px',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#666' }}>Kvíz betöltése...</div>
        </div>
      </div>
    );
  }

  // Hiba állapot
  if (error || !quizData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="result-card">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--danger)' }}>
            Hiba történt
          </h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
            {error || 'Nem sikerült betölteni a kvízt'}
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
          >
            Vissza a főoldalra
          </button>
        </div>
      </div>
    );
  }

  if (quizData.questions.length === 0) {
    return (
      <div className="result-card">
        <h2>Ez a kvíz még üres</h2>
        <p>Nincs kitölthető kérdés a megosztott kvízben.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Vissza a főoldalra
        </button>
      </div>
    );
  }

  // Eredmény nézet
  if (result) {
    const percentage = Math.round((result.score / result.max) * 100);
    const isPassed = percentage >= 50;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div className="result-card">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            {isPassed ? '🎉' : '📚'}
          </div>

          <h2 style={{
            fontSize: '32px',
            marginBottom: '20px',
            color: 'var(--dark)',
            fontWeight: '700'
          }}>
            {isPassed ? 'Gratulálunk!' : 'Jó próbálkozás!'}
          </h2>

          <div style={{
            fontSize: '72px',
            fontWeight: '700',
            background: isPassed 
              ? 'linear-gradient(135deg, var(--success), #00d4aa)'
              : 'linear-gradient(135deg, var(--danger), #ff8fa3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '20px 0'
          }}>
            {percentage}%
          </div>

          <div style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '30px'
          }}>
            {result.score} / {result.max} helyes válasz
          </div>

          <div style={{
            background: 'var(--light)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              {isPassed 
                ? '✨ Remek teljesítmény! Gratulálunk a sikeres eredményhez!'
                : '💪 Ne add fel! Próbáld meg újra, és biztosan sikerülni fog!'
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              ← Vissza
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
              style={{ padding: '16px 40px', fontSize: '16px' }}
            >
              🔄 Újrapróbálom
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Játék nézet
  const currentQuestion = quizData.questions[currentStep];
  const selectedOption = answers[currentQuestion.id];
  const progress = ((currentStep + 1) / quizData.questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 30px',
        background: 'white',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--dark)',
              margin: '0 0 8px 0'
            }}>
              {quizData.quiz.title}
            </h1>
            {quizData.quiz.description && (
              <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
                {quizData.quiz.description}
              </p>
            )}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #FF8C61)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {currentStep + 1} / {quizData.questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          background: '#E0E0E0',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #FF8C61)',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* Question Card */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        padding: '50px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--dark)',
          marginBottom: '40px',
          lineHeight: '1.5'
        }}>
          {currentQuestion.prompt}
        </h2>

        <div className="options-container">
          {currentQuestion.options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`option-card ${selectedOption === idx ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="option-radio"></div>
              <span style={{ fontSize: '16px' }}>{option}</span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <button
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={currentStep === 0}
            style={{
              opacity: currentStep === 0 ? 0.5 : 1,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              padding: '14px 28px',
              fontSize: '15px'
            }}
          >
            ← Előző
          </button>

          <button
            onClick={handleNext}
            className="btn btn-primary"
            disabled={selectedOption === undefined || submitting}
            style={{
              opacity: selectedOption === undefined ? 0.5 : 1,
              cursor: selectedOption === undefined ? 'not-allowed' : 'pointer',
              padding: '14px 28px',
              fontSize: '15px',
              minWidth: '140px'
            }}
          >
            {submitting ? (
              'Kiértékelés...'
            ) : currentStep === quizData.questions.length - 1 ? (
              '✓ Befejezés'
            ) : (
              'Következő →'
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: '900px',
        margin: '30px auto 0',
        textAlign: 'center',
        color: 'white',
        fontSize: '14px',
        opacity: 0.8
      }}>
        Powered by <strong>Mentora</strong> 🎓
      </div>
    </div>
  );
};
