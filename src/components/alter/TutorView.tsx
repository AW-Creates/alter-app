import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Lightbulb,
  Send,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Award,
  GraduationCap,
  BookOpen,
  Check,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  chatWithPersona,
  evaluateFeynmanWithAI,
  generateQuizWithAI,
  teachConceptWithAI,
  evaluateLessonResponseWithAI
} from '../../services/gemini';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { dispatchWebhookEvent } from '../../services/webhooks';
import { FeynmanEvaluation, QuizQuestion, InteractiveLesson } from '../../types/alter';

export const TutorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [tutorMode, setTutorMode] = useState<'masterclass' | 'socratic' | 'feynman' | 'quiz'>('masterclass');

  // Masterclass lesson state
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [activeLesson, setActiveLesson] = useState<InteractiveLesson | null>(null);
  const [sparringResponse, setSparringResponse] = useState('');
  const [isEvaluatingSparring, setIsEvaluatingSparring] = useState(false);
  const [sparringResult, setSparringResult] = useState<any>(null);

  // Socratic chat state
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Feynman drill state
  const [feynmanConcept, setFeynmanConcept] = useState('');
  const [feynmanExplanation, setFeynmanExplanation] = useState('');
  const [isEvaluatingFeynman, setIsEvaluatingFeynman] = useState(false);
  const [feynmanResult, setFeynmanResult] = useState<FeynmanEvaluation | null>(null);

  // Diagnostic Quiz state
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!activeJourney) return null;

  const { tutorData, advisorData } = activeJourney;
  const allConcepts = advisorData.phases.flatMap((p) => p.coreConcepts || []);

  // Initialize selected concept on first load if none selected
  useEffect(() => {
    if (!selectedConcept && allConcepts.length > 0) {
      setSelectedConcept(allConcepts[0]);
    }
  }, [allConcepts, selectedConcept]);

  // Load existing lesson for selected concept if already cached
  useEffect(() => {
    if (selectedConcept) {
      const cached = (tutorData.lessons || []).find((l) => l.concept === selectedConcept);
      if (cached) {
        setActiveLesson(cached);
        setSparringResult(
          cached.tutorEvaluation
            ? {
                mastered: cached.mastered,
                coachingVerdict: cached.tutorEvaluation,
                strengths: 'Previously evaluated',
                nuanceOrGap: ''
              }
            : null
        );
      } else {
        setActiveLesson(null);
        setSparringResult(null);
      }
    }
  }, [selectedConcept, tutorData.lessons]);

  const handleGenerateLesson = async (conceptToTeach?: string) => {
    const concept = conceptToTeach || selectedConcept || allConcepts[0];
    if (!concept || isGeneratingLesson) return;

    setIsGeneratingLesson(true);
    setSparringResult(null);
    setSparringResponse('');

    try {
      const lesson = await teachConceptWithAI(
        activeJourney.topic,
        concept,
        activeJourney.destination,
        activeJourney.baseline
      );

      setActiveLesson(lesson);

      // Save to journey context
      updateActiveJourney((prev) => {
        const existing = prev.tutorData.lessons || [];
        const filtered = existing.filter((l) => l.concept !== concept);
        return {
          ...prev,
          tutorData: {
            ...prev.tutorData,
            lessons: [...filtered, lesson]
          }
        };
      });
    } catch (err) {
      console.error('Failed to generate masterclass lesson', err);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleEvaluateSparring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !sparringResponse.trim() || isEvaluatingSparring) return;

    setIsEvaluatingSparring(true);
    try {
      const evalResult = await evaluateLessonResponseWithAI(
        activeLesson.concept,
        activeLesson.socraticChallenge,
        sparringResponse.trim()
      );

      setSparringResult(evalResult);

      // Update lesson in state & context
      const updatedLesson: InteractiveLesson = {
        ...activeLesson,
        mastered: evalResult.mastered,
        studentResponse: sparringResponse.trim(),
        tutorEvaluation: evalResult.coachingVerdict
      };

      setActiveLesson(updatedLesson);

      updateActiveJourney((prev) => {
        const existing = prev.tutorData.lessons || [];
        const filtered = existing.filter((l) => l.concept !== activeLesson.concept);
        return {
          ...prev,
          tutorData: {
            ...prev.tutorData,
            lessons: [...filtered, updatedLesson]
          }
        };
      });

      if (evalResult.mastered) {
        dispatchWebhookEvent('feynman_mastered', activeJourney.topic, {
          concept: activeLesson.concept,
          clarityScore: evalResult.score,
          accuracyScore: evalResult.score,
          strengths: [evalResult.strengths]
        });
      }
    } catch (err) {
      console.error('Sparring evaluation failed', err);
    } finally {
      setIsEvaluatingSparring(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    addChatMessage('tutor', { sender: 'user', content: userMsg, persona: 'tutor' });
    setIsLoading(true);

    try {
      const history = tutorData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const reply = await chatWithPersona('tutor', activeJourney, userMsg, history);
      addChatMessage('tutor', { sender: 'assistant', content: reply, persona: 'tutor' });
    } catch (err: any) {
      addChatMessage('tutor', {
        sender: 'assistant',
        content: `⚠️ Socratic session error: ${err.message || 'Check connection.'}`,
        persona: 'tutor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateFeynman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feynmanConcept.trim() || !feynmanExplanation.trim() || isEvaluatingFeynman) return;

    setIsEvaluatingFeynman(true);
    try {
      const evalResult = await evaluateFeynmanWithAI(feynmanConcept, feynmanExplanation);
      setFeynmanResult(evalResult);

      if (evalResult.clarityScore >= 80) {
        dispatchWebhookEvent('feynman_mastered', activeJourney.topic, {
          concept: feynmanConcept,
          clarityScore: evalResult.clarityScore,
          accuracyScore: evalResult.accuracyScore,
          strengths: evalResult.strengths
        });
      }
    } catch (err) {
      console.error('Feynman evaluation failed', err);
    } finally {
      setIsEvaluatingFeynman(false);
    }
  };

  const handleGenerateDiagnosticQuiz = async () => {
    setIsGeneratingQuiz(true);
    setUserAnswers({});
    setShowResults(false);
    try {
      const quiz = await generateQuizWithAI(activeJourney.topic, 'Core First Principles & Invariants');
      setQuizQuestions(quiz.questions || []);
    } catch (err) {
      console.error('Quiz generation failed', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const selectAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const starters = [
    'Quiz me on the core invariant of Phase 1',
    'Give me a real-world edge case scenario to solve',
    'What is the fundamental flaw in naive implementations?',
    'Walk me through the derivation from first principles'
  ];

  return (
    <div className="space-y-[22px] animate-fade-in">
      {/* Hero Card */}
      <div className="hero-card">
        <div className="hero-top">
          <div>
            <div className="role-chip">
              <span className="dot"></span>
              T — SOCRATIC MASTER TUTOR
            </div>
            <h1>Interactive Masterclass &amp; Concept Sparring</h1>
          </div>
          <div className="segmented">
            <button
              onClick={() => setTutorMode('masterclass')}
              className={tutorMode === 'masterclass' ? 'active font-bold text-[var(--tutor)]' : ''}
            >
              🎓 Masterclass Lessons
            </button>
            <button
              onClick={() => setTutorMode('socratic')}
              className={tutorMode === 'socratic' ? 'active' : ''}
            >
              💬 Socratic Dialogue
            </button>
            <button
              onClick={() => setTutorMode('feynman')}
              className={tutorMode === 'feynman' ? 'active' : ''}
            >
              🧠 Feynman Studio
            </button>
            <button
              onClick={() => {
                setTutorMode('quiz');
                if (quizQuestions.length === 0) handleGenerateDiagnosticQuiz();
              }}
              className={tutorMode === 'quiz' ? 'active' : ''}
            >
              🎯 Diagnostic Quiz
            </button>
          </div>
        </div>
        <p className="hero-sub">
          True mastery comes from being taught from first principles and applying active deduction.
          Choose a concept below to start your personal AI masterclass lesson.
        </p>
      </div>

      {/* Mode 1: Interactive Masterclass Lessons (The Core Teaching Engine) */}
      {tutorMode === 'masterclass' && (
        <div className="space-y-6">
          {/* Concept Selector Pills */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-[var(--tutor)]" />
                <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">
                  Select a Concept to Learn:
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--ink-3)]">
                {(tutorData.lessons || []).filter((l) => l.mastered).length} / {allConcepts.length} Concepts Mastered
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {allConcepts.map((concept, idx) => {
                const isMastered = (tutorData.lessons || []).some(
                  (l) => l.concept === concept && l.mastered
                );
                const isSelected = selectedConcept === concept;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedConcept(concept);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[var(--surface-3)] text-[var(--tutor)] border-[var(--tutor)] shadow-sm font-bold'
                        : isMastered
                        ? 'bg-[var(--surface-1)] text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-[var(--surface-1)] text-[var(--ink-2)] border-[var(--hairline)] hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span>{concept}</span>
                    {isMastered && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Lesson View / Generation Area */}
          {activeLesson ? (
            <div className="card space-y-6 border-[var(--tutor)]/40 bg-[var(--surface-1)] shadow-card">
              {/* Lesson Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--tutor)] uppercase tracking-wider mb-1 font-semibold">
                    <Sparkles size={14} className="text-[var(--tutor)]" />
                    <span>Interactive Masterclass · {activeLesson.estimatedReadTime}</span>
                    {activeLesson.mastered && (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold ml-2">
                        ✓ Mastered
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[var(--ink)] m-0">
                    {activeLesson.lessonTitle}
                  </h2>
                </div>

                <button
                  onClick={() => handleGenerateLesson(selectedConcept)}
                  disabled={isGeneratingLesson}
                  className="ghost-btn self-start sm:self-auto"
                  title="Regenerate this lesson"
                >
                  <RotateCcw size={13} />
                  <span>Refresh Lesson</span>
                </button>
              </div>

              {/* Intuition Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-1))] to-[var(--surface-2)] border border-[color-mix(in_srgb,var(--tutor)_30%,transparent)]">
                <div className="text-[11px] font-mono uppercase text-[var(--tutor)] tracking-wider font-bold mb-1 flex items-center gap-1.5">
                  <Lightbulb size={14} />
                  <span>The Plain-English Intuition (Metaphor)</span>
                </div>
                <p className="text-sm text-[var(--ink)] leading-relaxed m-0 italic font-sans">
                  "{activeLesson.plainEnglishAnalogy}"
                </p>
              </div>

              {/* Core First-Principles Lecture */}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--ink)]">
                <MarkdownRenderer content={activeLesson.coreExplanation} />
              </div>

              {/* Key Takeaways Checklist */}
              {activeLesson.keyTakeaways && activeLesson.keyTakeaways.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[var(--ink-3)] tracking-wider font-bold">
                    🔑 Key First-Principles Takeaways:
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--ink)]">
                    {activeLesson.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Socratic Sparring Checkpoint */}
              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border-2 border-[var(--tutor)] space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--tutor)] font-bold">
                  <Zap size={15} />
                  <span>Socratic Sparring Check: Prove Your Understanding</span>
                </div>

                <p className="text-sm font-semibold text-[var(--ink)] leading-relaxed m-0">
                  {activeLesson.socraticChallenge}
                </p>

                {sparringResult && (
                  <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--tutor)]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={15} /> Score: {sparringResult.score || 90}/100 — {sparringResult.mastered ? 'Verified Mastered' : 'Needs Polish'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                      <strong>Tutor Evaluation:</strong> {sparringResult.coachingVerdict}
                    </p>
                    {sparringResult.strengths && (
                      <p className="text-[11.5px] text-[var(--ink-2)] m-0">
                        <strong className="text-emerald-500">Strengths:</strong> {sparringResult.strengths}
                      </p>
                    )}
                    {sparringResult.nuanceOrGap && (
                      <p className="text-[11.5px] text-[var(--ink-2)] m-0">
                        <strong className="text-amber-500">Nuance to Keep in Mind:</strong> {sparringResult.nuanceOrGap}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handleEvaluateSparring} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--ink-2)]">
                      Your Answer (Explain how you would resolve this challenge):
                    </label>
                    <VoiceInputButton
                      onTranscript={(transcript) =>
                        setSparringResponse((prev) => (prev ? `${prev} ${transcript}` : transcript))
                      }
                    />
                  </div>

                  <textarea
                    placeholder="Type your explanation or click the microphone to speak your answer to the Tutor..."
                    value={sparringResponse}
                    onChange={(e) => setSparringResponse(e.target.value)}
                    rows={3}
                    className="draft-area"
                    style={{ minHeight: '90px', margin: 0 }}
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!sparringResponse.trim() || isEvaluatingSparring}
                      className="accent-btn"
                    >
                      {isEvaluatingSparring ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Tutor is Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Verify Understanding &amp; Spar with Tutor →</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Prompt to generate Masterclass lesson */
            <div className="card text-center py-12 px-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-2))] border border-[var(--tutor)]/30 text-[var(--tutor)] flex items-center justify-center mx-auto shadow-sm">
                <GraduationCap size={28} />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-display text-xl font-bold text-[var(--ink)] m-0">
                  Ready to Master "{selectedConcept || 'this concept'}"?
                </h3>
                <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0">
                  Your Socratic Professor will teach you this concept from first principles with vivid analogies, tactical mechanics, and an interactive sparring check.
                </p>
              </div>

              <button
                onClick={() => handleGenerateLesson()}
                disabled={isGeneratingLesson}
                className="accent-btn mx-auto"
                style={{ padding: '12px 24px', borderRadius: '12px' }}
              >
                {isGeneratingLesson ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Professor is preparing your masterclass...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} fill="currentColor" />
                    <span>Start Masterclass on "{selectedConcept || 'Concept'}" →</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Socratic Dialogue Grid */}
      {tutorMode === 'socratic' && (
        <div className="layout tutor-grid">
          {/* Left Cards */}
          <div>
            <div className="card">
              <HelpCircle className="principle-icon" size={20} />
              <h4>The Socratic principle</h4>
              <p className="source-row" style={{ marginTop: 0 }}>
                Your Tutor will not spoon-feed you answers. It asks targeted questions that challenge you to
                deduce the underlying mechanism yourself.
              </p>
            </div>

            <div className="card">
              <p className="card-label">Recommended Socratic starters</p>
              {starters.map((st, i) => (
                <div
                  key={i}
                  onClick={() => setInputText(st)}
                  className="starter"
                >
                  "{st}"
                </div>
              ))}
            </div>
          </div>

          {/* Right Socratic Session Sidebar Card */}
          <div className="sidebar-card" style={{ position: 'static' }}>
            <div className="chat-head">
              <div className="chat-avatar">
                <Lightbulb size={17} />
              </div>
              <div>
                <h4>1-on-1 Socratic session</h4>
                <p>Targeting cognitive edge cases</p>
              </div>
            </div>

            <div className="chat-body">
              {tutorData.chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg ${
                    msg.sender === 'user'
                      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface-1))]'
                      : ''
                  }`}
                  style={{ marginBottom: '12px' }}
                >
                  <MarkdownRenderer content={msg.content} />
                  <div className="msg-time">{msg.timestamp}</div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono py-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Tutor is preparing a diagnostic challenge...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Explain your reasoning or ask a conceptual question..."
              />
              <VoiceInputButton
                onTranscript={(transcript) =>
                  setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
                }
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="accent-btn"
                style={{ padding: '9px 12px', borderRadius: '8px' }}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mode 3: Feynman Drill */}
      {tutorMode === 'feynman' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[22px] items-start">
          <form onSubmit={handleEvaluateFeynman} className="card space-y-4">
            <p className="card-label">The Feynman Technique Studio</p>
            <p className="source-row" style={{ marginTop: 0 }}>
              Pick a complex concept. Explain it in plain English as if teaching a smart 10-year-old. No buzzwords.
            </p>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-2)] mb-1">Concept to Explain</label>
              <input
                type="text"
                placeholder="e.g. Backpropagation, CAP Theorem, Transformer Attention..."
                value={feynmanConcept}
                onChange={(e) => setFeynmanConcept(e.target.value)}
                className="w-full bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--accent)] text-[var(--ink)] text-xs rounded-lg p-2.5 outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[var(--ink-2)]">Your Plain-Language Explanation</label>
                <VoiceInputButton
                  onTranscript={(transcript) =>
                    setFeynmanExplanation((prev) => (prev ? `${prev} ${transcript}` : transcript))
                  }
                />
              </div>
              <textarea
                placeholder="Break it down simply without hiding behind technical jargon (or click the microphone to speak)..."
                value={feynmanExplanation}
                onChange={(e) => setFeynmanExplanation(e.target.value)}
                rows={6}
                className="draft-area"
                style={{ minHeight: '140px', margin: '6px 0 12px' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isEvaluatingFeynman}
              className="accent-btn w-full"
            >
              {isEvaluatingFeynman ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Evaluating clarity &amp; spotting blind spots...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Evaluate Feynman explanation</span>
                </>
              )}
            </button>
          </form>

          {/* Evaluation Result */}
          {feynmanResult ? (
            <div className="card space-y-4 border-[var(--tutor)]/40 bg-[var(--surface-1)] animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="card-label">Tutor evaluation report</p>
                <div className="flex gap-2 text-xs font-mono font-semibold">
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--tutor)]">
                    Clarity: {feynmanResult.clarityScore}/100
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--accent)]">
                    Accuracy: {feynmanResult.accuracyScore}/100
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">Strengths</h4>
                <ul className="text-xs text-[var(--ink)] space-y-1 list-disc pl-4">
                  {feynmanResult.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Subtle Blind Spots</h4>
                <ul className="text-xs text-[var(--ink-2)] space-y-1 list-disc pl-4">
                  {feynmanResult.blindSpots.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[var(--surface-2)] rounded-lg border border-[var(--hairline)]">
                <h4 className="text-xs font-bold text-[var(--tutor)] uppercase tracking-wide mb-1">Simplified Metaphor</h4>
                <p className="text-xs text-[var(--ink)] leading-relaxed italic m-0 font-sans">
                  "{feynmanResult.simplifiedAnalogy}"
                </p>
              </div>

              <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0 border-t border-[var(--hairline)] pt-3">
                <strong>Tutor Advice:</strong> {feynmanResult.tutorFeedback}
              </p>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center p-8 text-[var(--ink-3)] min-h-[280px]">
              <Award size={32} className="mb-2 opacity-40 text-[var(--tutor)]" />
              <p className="text-xs max-w-xs m-0">
                Submit an explanation to receive diagnostic grading on clarity, conceptual blind spots, and vivid analogies.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 4: Diagnostic Quiz */}
      {tutorMode === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">Diagnostic First-Principles Quiz</h3>
              <p className="text-xs text-[var(--ink-2)] m-0 mt-0.5">3 edge-case scenarios testing invariant principles.</p>
            </div>
            <button
              onClick={handleGenerateDiagnosticQuiz}
              disabled={isGeneratingQuiz}
              className="ghost-btn"
            >
              {isGeneratingQuiz ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>Regenerate quiz</span>
            </button>
          </div>

          {isGeneratingQuiz ? (
            <div className="card flex items-center justify-center p-12 text-xs text-[var(--ink-2)] font-mono gap-2">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              <span>Generating diagnostic scenarios...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="card space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--tutor)] bg-[var(--surface-2)] px-2 py-0.5 rounded">
                      Q{qIdx + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-[var(--ink)] leading-relaxed m-0 flex-1">
                      {q.question}
                    </h4>
                  </div>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let optionClass = 'bg-[var(--surface-1)] border-[var(--hairline)] hover:border-[var(--hairline-strong)] text-[var(--ink-2)]';

                      if (showResults) {
                        if (isCorrect) {
                          optionClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          optionClass = 'bg-rose-500/10 border-rose-500 text-rose-500';
                        }
                      } else if (isSelected) {
                        optionClass = 'bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-1))] border-[var(--accent)] text-[var(--ink)] font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => selectAnswer(qIdx, optIdx)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${optionClass}`}
                        >
                          <span>{opt}</span>
                          {showResults && isCorrect && (
                            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                          )}
                          {showResults && isSelected && !isCorrect && (
                            <XCircle size={15} className="text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 bg-[var(--surface-2)] rounded-lg text-xs border border-[var(--hairline)] space-y-1">
                      <div className="font-semibold text-[var(--accent)] text-[11px] uppercase tracking-wider font-mono">
                        Explanation &amp; Invariant:
                      </div>
                      <p className="text-[var(--ink)] leading-relaxed m-0 font-sans">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-2">
                {!showResults ? (
                  <button
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="accent-btn"
                  >
                    <span>Check Answers</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateDiagnosticQuiz}
                    className="accent-btn"
                  >
                    <span>Try Another Diagnostic Quiz</span>
                    <Sparkles size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
