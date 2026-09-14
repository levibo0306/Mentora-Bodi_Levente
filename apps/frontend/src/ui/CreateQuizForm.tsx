import React, { useState, useEffect, useRef } from 'react';
import { createQuiz, createQuestion, updateQuestion, updateQuiz, getQuiz, generateQuestionsAI, CreateQuestionDto } from '../api/quizzes';
import { getTopics, Topic } from '../api/topics';
import { api } from '../api/http';

interface Props {
  quizId?: string | null;
  onSuccess: () => void;
}

export const CreateQuizForm = ({ quizId, onSuccess }: Props) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'practice' | 'assessment'>('practice');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Array<CreateQuestionDto & { id?: string }>>([]);

  // Aktuális kérdés szerkesztése
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); 
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState(3); // Alapértelmezett: Medium (3)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationElapsed, setGenerationElapsed] = useState(0);
  const generationController = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      // Kvíz alapadatok betöltése
      getQuiz(quizId).then(q => {
        setTitle(q.title);
        setDescription(q.description || '');
        setMode(q.mode || 'practice');
        setTopicId((q as any).topic_id ?? null);
      }).catch(console.error);
      
      // Kérdések betöltése
      api<any[]>(`/api/quizzes/${quizId}/questions`).then(qs => {
        const mapped = qs.map(q => ({
            id: q.id,
            prompt: q.prompt,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            difficulty: q.difficulty || 3
        }));
        setQuestions(mapped);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [quizId]);

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

  useEffect(() => {
    if (!isGenerating) return;
    const startedAt = Date.now();
    setGenerationElapsed(0);
    const timer = window.setInterval(() => {
      setGenerationElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => () => generationController.current?.abort(), []);

  const getQuestionFromInput = (): CreateQuestionDto | null => {
    if (!currentPrompt.trim()) return null;

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return null;

    return {
      prompt: currentPrompt,
      options: validOptions,
      correct_index: correctIndex,
      explanation: explanation || undefined,
      difficulty: difficulty
    };
  };

  const handleAddQuestion = async () => {
    const q = getQuestionFromInput();
    if (!q) {
      setError("Legalább a kérdést és 2 választ töltsd ki!");
      return;
    }
    if (editingIndex !== null) {
      const current = questions[editingIndex];
      if (current?.id && quizId) {
        try {
          const updated = await updateQuestion(quizId, current.id, q);
          const copy = [...questions];
          copy[editingIndex] = { ...q, id: updated.id };
          setQuestions(copy);
        } catch (err: any) {
          setError(err.message || "Nem sikerült frissíteni a kérdést");
          return;
        }
      } else {
        const copy = [...questions];
        copy[editingIndex] = { ...q };
        setQuestions(copy);
      }
    } else {
      setQuestions([...questions, q]);
    }
    
    // Mezők ürítése
    setCurrentPrompt('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setDifficulty(3);
    setEditingQuestionId(null);
    setEditingIndex(null);
    setError(null);
  };

  const handleGenerateQuestions = async () => {
    if (aiTopic.trim().length < 50) {
      setError("A tananyag legyen legalább 50 karakter hosszú.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const controller = new AbortController();
    generationController.current = controller;
    try {
      const generated = await generateQuestionsAI(aiTopic.trim(), aiCount, controller.signal);
      setQuestions((current) => [...current, ...generated]);
      setAiTopic("");
    } catch (err: any) {
      setError(err?.name === "AbortError" ? "A generálást megszakítottad." : err.message || "Nem sikerült kérdéseket generálni.");
    } finally {
      generationController.current = null;
      setIsGenerating(false);
    }
  };

  const generationStatus = generationElapsed < 15
    ? "A helyi modell betöltése és a tananyag feldolgozása..."
    : generationElapsed < 45
      ? "A kérdések összeállítása folyamatban van..."
      : "A helyi modell még dolgozik. Az első generálás akár 1–2 percig is tarthat.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const allQuestions = [...questions];
      const pending = getQuestionFromInput();
      if (editingIndex !== null && pending) {
        throw new Error("Mentsd el a szerkesztett kérdést a listába, mielőtt véglegesítesz!");
      }
      if (pending) allQuestions.push(pending);

      if (allQuestions.length === 0) throw new Error("Adj hozzá legalább egy kérdést!");

      let id = quizId;
      if (quizId) {
        await updateQuiz(quizId, { title, description, mode, topic_id: topicId ?? undefined });
      } else {
        const newQuiz = await createQuiz({ title, description, mode, topic_id: topicId ?? undefined });
        id = newQuiz.id;
      }

      // Új kérdések mentése (csak amelyeknek nincs id)
      for (const q of allQuestions) {
        if (!("id" in q) || !q.id) {
          await createQuestion(id!, q);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pendingQuestion = getQuestionFromInput();
  const totalQuestions = questions.length + (pendingQuestion ? 1 : 0);
  const canProceedBasics = title.trim().length > 0;
  const canProceedQuestions = totalQuestions > 0 && editingIndex === null;

  return (
    <form onSubmit={handleSubmit} className="create-quiz-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="wizard-steps">
        <button type="button" className={`wizard-step ${step >= 1 ? "active" : ""}`} onClick={() => setStep(1)}>
          1. Alapadatok
        </button>
        <button type="button" className={`wizard-step ${step >= 2 ? "active" : ""}`} onClick={() => step >= 2 && setStep(2)}>
          2. Kérdések
        </button>
        <button type="button" className={`wizard-step ${step >= 3 ? "active" : ""}`} onClick={() => step >= 3 && setStep(3)}>
          3. Áttekintés
        </button>
      </div>

      {step === 1 && (
        <div className="card section">
          <h3>Alapadatok</h3>
          <div className="input-group">
            <label>Kvíz címe</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Leírás</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="input-group">
            <label>Mód</label>
            <select value={mode} onChange={e => setMode(e.target.value as any)}>
              <option value="practice">Gyakorlás</option>
              <option value="assessment">Vizsga</option>
            </select>
          </div>
          <div className="input-group">
            <label>Téma</label>
            <select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)}>
              <option value="">Nincs téma</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="card section ai-question-builder">
            <div className="ai-builder-heading">
              <div>
                <span className="eyebrow">Helyi AI · Qwen3</span>
                <h3>Kérdések tananyagból</h3>
                <p>Illeszd be a forrásszöveget. A kérdések először a szerkeszthető listába kerülnek.</p>
              </div>
              <label>
                Kérdések száma
                <select value={aiCount} onChange={(event) => setAiCount(Number(event.target.value))}>
                  {[3, 5, 8, 10].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
            </div>
            <textarea
              value={aiTopic}
              onChange={(event) => setAiTopic(event.target.value)}
              placeholder="Másold ide a jegyzetet vagy tananyagot, amelyből a kérdések készüljenek..."
              rows={7}
              maxLength={7000}
            />
            <div className="ai-builder-actions">
              <small>{aiTopic.length.toLocaleString("hu-HU")} / 7 000 karakter</small>
              <div className="ai-action-buttons">
                {isGenerating && (
                  <button type="button" className="btn btn-secondary" onClick={() => generationController.current?.abort()}>
                    Megszakítás
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isGenerating || aiTopic.trim().length < 50}
                  onClick={handleGenerateQuestions}
                >
                  {isGenerating ? `Generálás · ${generationElapsed} mp` : `${aiCount} kérdés generálása`}
                </button>
              </div>
            </div>
            {isGenerating && (
              <div className="ai-generation-status" role="status" aria-live="polite">
                <span className="ai-spinner" />
                <span>{generationStatus}</span>
              </div>
            )}
          </div>

          <div className="card section question-builder">
            <h3>{editingQuestionId ? "Kérdés szerkesztése" : "Új kérdés hozzáadása"}</h3>
            <input 
              className="prompt-input"
              placeholder="Kérdés szövege..." 
              value={currentPrompt} 
              onChange={e => setCurrentPrompt(e.target.value)} 
            />

            <div className="options-grid">
              {options.map((opt, idx) => (
                <div key={idx} className="option-row">
                  <input 
                    type="radio" 
                    checked={correctIndex === idx} 
                    onChange={() => setCorrectIndex(idx)} 
                  />
                  <input 
                    value={opt} 
                    onChange={e => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }} 
                    placeholder={`Válasz ${idx + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="difficulty-slider">
              <label>Nehézség: <strong>{difficulty}</strong></label>
              <input 
                type="range" min="1" max="5" 
                value={difficulty} 
                onChange={e => setDifficulty(Number(e.target.value))} 
              />
            </div>

            <div className="question-actions">
              <button type="button" onClick={handleAddQuestion} className="btn-add">
                {editingQuestionId ? "Mentés" : "Kérdés mentése a listába"}
              </button>
              {editingQuestionId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingQuestionId(null);
                    setEditingIndex(null);
                    setCurrentPrompt('');
                    setOptions(['', '', '', '']);
                    setCorrectIndex(0);
                    setExplanation('');
                    setDifficulty(3);
                  }}
                >
                  Mégse
                </button>
              )}
            </div>
          </div>

          <div className="card section">
            <h3>Mentett kérdések</h3>
            {questions.length === 0 && <div className="empty-subtle">Még nincs mentett kérdés.</div>}
            {questions.map((q, idx) => (
              <div key={q.id ?? idx} className="question-list-item">
                <div>
                  <div className="question-title">{q.prompt}</div>
                  <div className="question-meta">Válaszok: {q.options.length} · Helyes: {q.correct_index + 1}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingQuestionId(q.id ?? null);
                    setEditingIndex(idx);
                    setCurrentPrompt(q.prompt);
                    setOptions([...q.options, '', '', '', ''].slice(0, Math.max(4, q.options.length)));
                    setCorrectIndex(q.correct_index);
                    setExplanation(q.explanation ?? '');
                    setDifficulty(q.difficulty ?? 3);
                  }}
                >
                  Szerkesztés
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <div className="card section">
          <h3>Áttekintés</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Cím</div>
              <div className="summary-value">{title || "—"}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Mód</div>
              <div className="summary-value">{mode === "assessment" ? "Vizsga" : "Gyakorlás"}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Kérdések</div>
              <div className="summary-value">{totalQuestions}</div>
            </div>
          </div>
          <div className="summary-list">
            {questions.slice(0, 5).map((q, idx) => (
              <div key={`${q.prompt}-${idx}`} className="summary-row">{idx + 1}. {q.prompt}</div>
            ))}
            {questions.length > 5 && (
              <div className="summary-row muted">+ {questions.length - 5} további kérdés</div>
            )}
          </div>
          {pendingQuestion && (
            <div className="summary-warning">
              Van egy még el nem mentett kérdésed. Mentsd el a listába, mielőtt véglegesítesz.
            </div>
          )}
        </div>
      )}

      <div className="wizard-actions">
        {step > 1 && (
          <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            ← Vissza
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={(step === 1 && !canProceedBasics) || (step === 2 && !canProceedQuestions)}
          >
            Következő →
          </button>
        )}
        {step === 3 && (
          <button type="submit" className="btn-submit" disabled={loading || !!pendingQuestion}>
            {loading ? 'Mentés...' : 'Kvíz véglegesítése'}
          </button>
        )}
      </div>
    </form>
  );
};
