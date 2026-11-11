import { useState, useEffect, useRef, type FormEvent } from 'react';
import { createQuiz, createQuestion, updateQuestion, updateQuiz, getQuiz, getQuizQuestions, generateQuestionsAI, generateQuestionsFromDocument, type CreateQuestionDto } from '../api/quizzes';
import { getTopics, Topic } from '../api/topics';
import { getErrorMessage } from '../api/http';
import { QuizBasicsStep } from './quiz-form/QuizBasicsStep';
import { QuestionEditor } from './quiz-form/QuestionEditor';
import { QuizReviewStep } from './quiz-form/QuizReviewStep';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [aiTopic, setAiTopic] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiSourceStatus, setAiSourceStatus] = useState('');
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
        setTopicId(q.topic_id ?? null);
      }).catch(console.error);
      
      // Kérdések betöltése
      getQuizQuestions(quizId).then(qs => {
        const mapped = qs.map(q => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation ?? undefined,
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

  const resetQuestionEditor = () => {
    setCurrentPrompt('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setDifficulty(3);
    setEditingIndex(null);
  };

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
        } catch (err: unknown) {
          setError(getErrorMessage(err, "Nem sikerült frissíteni a kérdést"));
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
    
    resetQuestionEditor();
    setError(null);
  };

  const handleGenerateQuestions = async () => {
    if (!aiFile && aiTopic.trim().length < 50) {
      setError("A tananyag legyen legalább 50 karakter hosszú.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const controller = new AbortController();
    generationController.current = controller;
    try {
      const result = aiFile
        ? await generateQuestionsFromDocument(aiFile, aiCount, controller.signal)
        : null;
      const generated = result?.questions ?? await generateQuestionsAI(aiTopic.trim(), aiCount, controller.signal);
      setQuestions((current) => [...current, ...generated]);
      setAiTopic("");
      if (result) {
        setAiSourceStatus(
          result.source.truncated
            ? `${result.source.filename}: ${result.source.characters.toLocaleString("hu-HU")} karakterből az első 7 000 került feldolgozásra.`
            : `${result.source.filename}: ${result.source.characters.toLocaleString("hu-HU")} karakter feldolgozva.`,
        );
        setAiFile(null);
      } else {
        setAiSourceStatus("A bemásolt tananyag feldolgozva.");
      }
    } catch (err: unknown) {
      setError(err instanceof DOMException && err.name === "AbortError"
        ? "A generálást megszakítottad."
        : getErrorMessage(err, "Nem sikerült kérdéseket generálni."));
    } finally {
      generationController.current = null;
      setIsGenerating(false);
    }
  };

  const generationStatus = generationElapsed < 15
    ? "Az AI-modell betöltése és a tananyag feldolgozása..."
    : generationElapsed < 45
      ? "A kérdések összeállítása folyamatban van..."
      : "Az AI-modell még dolgozik. Az első generálás akár 1–2 percig is tarthat.";

  const handleSubmit = async (e: FormEvent) => {
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Nem sikerült elmenteni a kvízt."));
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
        <QuizBasicsStep
          title={title}
          description={description}
          mode={mode}
          topicId={topicId}
          topics={topics}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onModeChange={setMode}
          onTopicChange={setTopicId}
        />
      )}

      {step === 2 && (
        <>
          <div className="card section ai-question-builder">
            <div className="ai-builder-heading">
              <div>
                <span className="eyebrow">AI · Ollama</span>
                <h3>Kérdések tananyagból</h3>
                <p>Illeszd be a forrásszöveget, vagy tölts fel PDF/DOCX dokumentumot. A kérdések először a szerkeszthető listába kerülnek.</p>
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
              disabled={!!aiFile}
            />
            <div className="ai-document-upload">
              <label>
                PDF vagy DOCX feltöltése
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={isGenerating}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > 8 * 1024 * 1024) {
                      setError("A dokumentum legfeljebb 8 MB lehet.");
                      event.target.value = "";
                      setAiFile(null);
                      return;
                    }
                    setAiFile(file);
                    if (file) {
                      setAiTopic("");
                      setError(null);
                      setAiSourceStatus(`${file.name} kiválasztva.`);
                    }
                  }}
                />
              </label>
              {aiFile && (
                <button type="button" className="text-button" onClick={() => { setAiFile(null); setAiSourceStatus(""); }}>
                  Fájl eltávolítása
                </button>
              )}
            </div>
            {aiSourceStatus && <div className="inline-status success">{aiSourceStatus}</div>}
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
                  disabled={isGenerating || (!aiFile && aiTopic.trim().length < 50)}
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

          <QuestionEditor
            prompt={currentPrompt}
            options={options}
            correctIndex={correctIndex}
            difficulty={difficulty}
            isEditing={editingIndex !== null}
            onPromptChange={setCurrentPrompt}
            onOptionsChange={setOptions}
            onCorrectIndexChange={setCorrectIndex}
            onDifficultyChange={setDifficulty}
            onSave={handleAddQuestion}
            onCancel={resetQuestionEditor}
          />

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
        <QuizReviewStep
          title={title}
          mode={mode}
          questions={questions}
          totalQuestions={totalQuestions}
          hasPendingQuestion={!!pendingQuestion}
        />
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
