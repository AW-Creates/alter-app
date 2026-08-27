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
  ArrowLeft,
  Loader2,
  Award,
  GraduationCap,
  BookOpen,
  Check,
  Play,
  RotateCcw,
  Zap,
  Code2,
  Copy,
  FileEdit,
  AlertTriangle,
  Scissors,
  Layers,
  Flame,
  Terminal,
  Bookmark
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  chatWithPersona,
  evaluateFeynmanWithAI,
  generateQuizWithAI,
  teachConceptWithAI,
  evaluateLessonResponseWithAI,
  converseSocraticLessonWithAI
} from '../../services/gemini';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { dispatchWebhookEvent } from '../../services/webhooks';
import { FeynmanEvaluation, QuizQuestion, InteractiveLesson, LiveClassroomTurn } from '../../types/alter';

export const TutorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage, targetTutorConcept, sendToEditor } = useJourney();
  const [tutorMode, setTutorMode] = useState<'masterclass' | 'socratic' | 'feynman' | 'quiz'>('masterclass');

  // Masterclass lesson state
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [activeLesson, setActiveLesson] = useState<InteractiveLesson | null>(null);
  const [masterclassTab, setMasterclassTab] = useState<'intuition' | 'mechanics' | 'code' | 'traps' | 'sparring'>('intuition');
  
  // Socratic sparring state
  const [sparringResponse, setSparringResponse] = useState('');
  const [isEvaluatingSparring, setIsEvaluatingSparring] = useState(false);
  const [sparringResult, setSparringResult] = useState<any>(null);

  // Scratchpad / Practice state
  const [draftCode, setDraftCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Socratic chat / live classroom state
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classroomTurns, setClassroomTurns] = useState<LiveClassroomTurn[]>([]);
  const [classroomAnswer, setClassroomAnswer] = useState('');
  const [isClassroomLoading, setIsClassroomLoading] = useState(false);
  const [isClassroomMastered, setIsClassroomMastered] = useState(false);
  const [activeCheckInQuestion, setActiveCheckInQuestion] = useState('');

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

  // Handle external navigation to specific concept from Advisor
  useEffect(() => {
    if (targetTutorConcept && targetTutorConcept !== selectedConcept) {
      setSelectedConcept(targetTutorConcept);
      setTutorMode('masterclass');
    }
  }, [targetTutorConcept]);

  // Initialize selected concept on first load if none selected
  useEffect(() => {
    if (!selectedConcept && allConcepts.length > 0) {
      setSelectedConcept(allConcepts[0]);
    }
  }, [allConcepts, selectedConcept]);

  // Load existing lesson for selected concept or auto-generate if missing
  useEffect(() => {
    if (selectedConcept) {
      const cached = (tutorData.lessons || []).find((l) => l.concept === selectedConcept);
      if (cached) {
        setActiveLesson(cached);
        setDraftCode(cached.userDraftCode || cached.codeOrTemplate || '');
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
        // Auto-generate lesson if not yet created
        handleGenerateLesson(selectedConcept);
      }
    }
  }, [selectedConcept, tutorData.lessons]);

  const handleGenerateLesson = async (conceptToTeach?: string) => {
    const concept = conceptToTeach || selectedConcept || allConcepts[0];
    if (!concept || isGeneratingLesson) return;

    setIsGeneratingLesson(true);
    setSparringResult(null);
    setSparringResponse('');
    setMasterclassTab('intuition');

    try {
      const lesson = await teachConceptWithAI(
        activeJourney.topic,
        concept,
        activeJourney.destination,
        activeJourney.baseline
      );

      setActiveLesson(lesson);
      setDraftCode(lesson.codeOrTemplate || '');

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
        tutorEvaluation: evalResult.coachingVerdict,
        userScore: evalResult.score,
        userDraftCode: draftCode
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
        dispatchWebhookEvent('lesson_mastered', activeJourney.topic, {
          concept: activeLesson.concept,
          score: evalResult.score,
          coachingVerdict: evalResult.coachingVerdict
        });
      }
    } catch (err) {
      console.error('Failed to evaluate sparring response', err);
    } finally {
      setIsEvaluatingSparring(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeLesson?.codeOrTemplate) return;
    navigator.clipboard.writeText(activeLesson.codeOrTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendDraftToEditor = () => {
    const payload = draftCode || activeLesson?.codeOrTemplate || '';
    if (!payload.trim()) return;
    sendToEditor(payload);
  };

  const handleInitClassroom = async (conceptToTeach: string) => {
    setIsClassroomLoading(true);
    setIsClassroomMastered(false);
    setClassroomAnswer('');

    try {
      const initialTurn = await converseSocraticLessonWithAI(
        activeJourney.topic,
        conceptToTeach,
        'Level 1: Intuition & Everyday Metaphor',
        []
      );

      setClassroomTurns([
        {
          id: `turn-0-${Date.now()}`,
          speaker: 'tutor',
          content: initialTurn.tutorSpeech,
          stageName: initialTurn.stageName || 'Level 1: Intuition & Everyday Metaphor',
          checkInQuestion: initialTurn.checkInQuestion,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setActiveCheckInQuestion(initialTurn.checkInQuestion || '');
    } catch (err) {
      console.error('Failed to init live classroom', err);
    } finally {
      setIsClassroomLoading(false);
    }
  };

  const handleSubmitClassroomAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!classroomAnswer.trim() || isClassroomLoading) return;

    const studentAnswerText = classroomAnswer.trim();
    setClassroomAnswer('');
    setIsClassroomLoading(true);

    // 1. Append student turn
    const studentTurn: LiveClassroomTurn = {
      id: `turn-${Date.now()}`,
      speaker: 'student',
      content: studentAnswerText,
      stageName: classroomTurns[classroomTurns.length - 1]?.stageName || 'Check-In',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...classroomTurns, studentTurn];
    setClassroomTurns(updatedHistory);

    try {
      const convHistory = updatedHistory.map((t) => ({
        speaker: t.speaker,
        content: t.content
      }));

      const currentStage = classroomTurns.length <= 2 
        ? 'Level 2: First-Principles Mechanics & Loop Flow'
        : classroomTurns.length <= 4
        ? 'Level 3: Implementation Blueprint & Live Code'
        : 'Level 4: Edge-Case Failure Recovery & Sparring';

      const tutorResponse = await converseSocraticLessonWithAI(
        activeJourney.topic,
        selectedConcept,
        currentStage,
        convHistory,
        studentAnswerText
      );

      const nextTutorTurn: LiveClassroomTurn = {
        id: `turn-tutor-${Date.now()}`,
        speaker: 'tutor',
        content: tutorResponse.tutorSpeech,
        stageName: tutorResponse.stageName || currentStage,
        tutorFeedback: tutorResponse.tutorFeedbackOnStudent,
        checkInQuestion: tutorResponse.checkInQuestion,
        isCompleted: tutorResponse.isConceptMastered,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setClassroomTurns((prev) => [...prev, nextTutorTurn]);
      setActiveCheckInQuestion(tutorResponse.checkInQuestion || '');

      if (tutorResponse.isConceptMastered) {
        setIsClassroomMastered(true);
        // Mark concept mastered in Journey
        updateActiveJourney((prev) => {
          const currentLessons = prev.tutorData.lessons || [];
          const existing = currentLessons.find((l) => l.concept === selectedConcept);
          const updatedLesson: InteractiveLesson = existing
            ? { ...existing, mastered: true, userScore: 95 }
            : {
                id: `lesson-${Date.now()}`,
                concept: selectedConcept,
                lessonTitle: selectedConcept,
                estimatedReadTime: '15 min',
                plainEnglishAnalogy: tutorResponse.tutorSpeech,
                coreExplanation: tutorResponse.tutorSpeech,
                keyTakeaways: ['Understood from first principles in live 1-on-1 dialogue.'],
                mastered: true,
                userScore: 95,
                whyNovicesGetConfused: 'Grasped through live Socratic dialogue.',
                laymanExplanation: tutorResponse.tutorSpeech,
                architecturalDiagramOrFlow: '',
                mechanicsMarkdown: '',
                corePrimitives: [],
                implementationGuide: [],
                codeOrTemplate: '',
                howMastersUseIt: '',
                commonPitfalls: [],
                cutListFluff: '',
                socraticChallenge: tutorResponse.checkInQuestion || '',
                practiceTask: 'Live session completed',
                createdAt: new Date().toISOString()
              };

          return {
            ...prev,
            tutorData: {
              ...prev.tutorData,
              lessons: [
                ...currentLessons.filter((l) => l.concept !== selectedConcept),
                updatedLesson
              ]
            }
          };
        });

        dispatchWebhookEvent('lesson_mastered', activeJourney.topic, {
          concept: selectedConcept,
          mode: 'live_socratic_classroom',
          score: 95
        });
      }
    } catch (err) {
      console.error('Failed to converse with live tutor', err);
    } finally {
      setIsClassroomLoading(false);
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
      const quiz = await generateQuizWithAI(activeJourney.topic, 'Core First Principles & Tactical Invariants');
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
      {/* Hero Header */}
      <div className="hero-card">
        <div className="hero-top">
          <div>
            <div className="role-chip">
              <span className="dot"></span>
              T — SOCRATIC MASTER TUTOR
            </div>
            <h1>Interactive Masterclasses &amp; Applied Sparring</h1>
          </div>
          <div className="segmented">
            <button
              onClick={() => setTutorMode('masterclass')}
              className={tutorMode === 'masterclass' ? 'active font-bold text-[var(--tutor)]' : ''}
            >
              🎓 Zero-to-Hero Lessons
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
          True mastery comes from first-principles deduction, concrete code blueprints, and active sparring.
          Select any concept below to start your progressive masterclass.
        </p>
      </div>

      {/* Mode 1: Interactive Zero-to-Hero Masterclass Lessons */}
      {tutorMode === 'masterclass' && (
        <div className="space-y-6">
          {/* Concept Selector Bar */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-[var(--tutor)]" />
                <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">
                  Select a Concept to Master:
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
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Lesson View / Generation Area */}
          {isGeneratingLesson ? (
            <div className="card p-12 text-center space-y-3 border-[var(--tutor)]/30">
              <Loader2 size={32} className="animate-spin text-[var(--tutor)] mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-[var(--ink)]">
                  Deconstructing "{selectedConcept}" from First Principles...
                </p>
                <p className="text-xs text-[var(--ink-3)]">
                  Generating plain-English intuition, architectural loop diagram, copyable code blueprint, and Socratic challenge.
                </p>
              </div>
            </div>
          ) : activeLesson ? (
            <div className="card space-y-6 border-[var(--tutor)]/40 bg-[var(--surface-1)] shadow-card">
              {/* Lesson Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--tutor)] uppercase tracking-wider mb-1 font-semibold">
                    <Sparkles size={14} className="text-[var(--tutor)]" />
                    <span>Zero-to-Hero Masterclass · {activeLesson.estimatedReadTime}</span>
                    {activeLesson.mastered && (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold ml-2">
                        ✓ Verified Mastered ({activeLesson.userScore || 94}/100)
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
                  title="Regenerate this masterclass lesson"
                >
                  <RotateCcw size={13} />
                  <span>Refresh Lesson</span>
                </button>
              </div>

              {/* 5-Level Progress Stepper */}
              <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3 overflow-x-auto gap-1">
                {[
                  { id: 'intuition', num: '1', label: 'Plain Intuition', icon: '🐣' },
                  { id: 'mechanics', num: '2', label: 'Mechanics & Flow', icon: '⚙️' },
                  { id: 'code', num: '3', label: 'Code Blueprint', icon: '💻' },
                  { id: 'traps', num: '4', label: 'Traps & Cuts', icon: '⚠️' },
                  { id: 'sparring', num: '5', label: 'Socratic Sparring', icon: '🥊' }
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setMasterclassTab(step.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      masterclassTab === step.id
                        ? 'bg-[var(--tutor)] text-[#04050a] font-bold shadow-xs'
                        : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span>Level {step.num}: {step.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: PLAIN INTUITION (LEVEL 0) */}
              {masterclassTab === 'intuition' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Metaphor Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-1))] to-[var(--surface-2)] border-2 border-[var(--tutor)]/50 space-y-1.5">
                    <div className="text-[11px] font-mono uppercase text-[var(--tutor)] tracking-wider font-bold flex items-center gap-1.5">
                      <Lightbulb size={14} />
                      <span>The Plain-English Intuition (Zero Jargon Required):</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--ink)] leading-relaxed m-0 font-sans">
                      "{activeLesson.plainEnglishAnalogy}"
                    </p>
                  </div>

                  {/* Why Novices Get Confused */}
                  {activeLesson.whyNovicesGetConfused && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10.5px] uppercase font-bold text-amber-500 mb-0.5">
                          Why Beginners Get Confused by this Topic:
                        </div>
                        <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                          {activeLesson.whyNovicesGetConfused}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Layman Breakdown */}
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                    <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                      📖 Foundations: What Is Actually Happening Here?
                    </div>
                    <div className="text-xs sm:text-[12.5px] text-[var(--ink)] leading-relaxed font-sans space-y-2">
                      <MarkdownRenderer
                        content={activeLesson.laymanExplanation || activeLesson.coreExplanation}
                      />
                    </div>
                  </div>

                      {/* Key Takeaways */}
                      {activeLesson.keyTakeaways && activeLesson.keyTakeaways.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                            🔑 Core Principles &amp; Takeaways:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {activeLesson.keyTakeaways.map((takeaway, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                                <div className="font-bold text-[var(--ink)] text-xs flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-[var(--tutor)] text-[#04050a] font-mono text-[10px] flex items-center justify-center font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>Core Rule #{idx + 1}</span>
                                </div>
                                <p className="text-[11.5px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                                  {takeaway}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                  {/* Next Navigation */}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setMasterclassTab('mechanics')}
                      className="accent-btn"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next: Level 2 — See Mechanics &amp; Loop Diagram →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MECHANICS & FLOW (LEVEL 1) */}
              {masterclassTab === 'mechanics' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Flow Diagram */}
                  {activeLesson.architecturalDiagramOrFlow && (
                    <div className="p-4 rounded-xl bg-[var(--void)] border border-[var(--hairline-strong)] space-y-2">
                      <div className="font-mono text-[11px] uppercase font-bold text-[var(--tutor)] flex items-center gap-1.5">
                        <Layers size={13} />
                        <span>Process Loop &amp; Architectural Flowchart:</span>
                      </div>
                      <pre className="p-3 bg-[var(--surface-1)] rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                        {activeLesson.architecturalDiagramOrFlow}
                      </pre>
                    </div>
                  )}

                  {/* Deep Mechanics */}
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                    <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                      ⚙️ Under-the-Hood Technical Anatomy:
                    </div>
                    <div className="text-xs sm:text-[12.5px] text-[var(--ink)] leading-relaxed font-sans">
                      <MarkdownRenderer
                        content={activeLesson.mechanicsMarkdown || activeLesson.coreExplanation}
                      />
                    </div>
                  </div>

                  {/* Core Primitives */}
                  {activeLesson.corePrimitives && (
                    <div className="space-y-2">
                      <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                        🧩 Core Primitives in this Architecture:
                      </div>
                      <div className="space-y-2">
                        {activeLesson.corePrimitives.map((prim, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-[var(--tutor)]/20 text-[var(--tutor)] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--ink)]">{prim.name}</span>
                                <span className="text-[10px] font-mono uppercase bg-[var(--surface-3)] px-1.5 py-0.2 rounded text-[var(--ink-3)]">
                                  {prim.role}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                                {prim.explanation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="pt-3 flex justify-between items-center">
                    <button onClick={() => setMasterclassTab('intuition')} className="ghost-btn">
                      <ArrowLeft size={12} />
                      <span>Back to Intuition</span>
                    </button>
                    <button
                      onClick={() => setMasterclassTab('code')}
                      className="accent-btn"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next: Level 3 — Tactical Code Blueprint →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CODE BLUEPRINT & LIVE SCRATCHPAD (LEVEL 2) */}
              {masterclassTab === 'code' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Tactical Execution Guide */}
                  {activeLesson.implementationGuide && (
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                      <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
                        <Zap size={13} />
                        <span>Tactical Execution Guide (How to Build It):</span>
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {activeLesson.implementationGuide.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                            <span className="font-mono font-bold text-emerald-500 flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executable Code Template */}
                  {activeLesson.codeOrTemplate && (
                    <div className="p-4 rounded-xl bg-[var(--void)] border border-[var(--hairline-strong)] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--tutor)] flex items-center gap-1.5">
                          <Code2 size={13} />
                          <span>Production Implementation Blueprint:</span>
                        </div>
                        <button
                          onClick={handleCopyCode}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-[11px] font-mono text-[var(--ink)] transition flex items-center gap-1"
                        >
                          {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-[var(--surface-1)] rounded-lg text-[11px] font-mono text-[var(--ink-2)] overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                        {activeLesson.codeOrTemplate}
                      </pre>
                    </div>
                  )}

                  {/* Interactive Practice Sandbox / Scratchpad */}
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border-2 border-[var(--tutor)]/40 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal size={15} className="text-[var(--tutor)]" />
                        <span className="font-bold text-xs text-[var(--ink)]">
                          🛠️ Live Practice Sandbox / Code Scratchpad
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--ink-3)]">
                        {activeLesson.practiceTask || 'Write your code and send to Editor for review'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--ink-2)] m-0">
                      👉 <strong>Task:</strong> {activeLesson.practiceTask || 'Write a working prototype of this loop and test your assumptions.'}
                    </p>

                    <textarea
                      placeholder="// Write your code prototype or implementation plan here..."
                      value={draftCode}
                      onChange={(e) => setDraftCode(e.target.value)}
                      rows={5}
                      className="w-full bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--tutor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none font-mono leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setDraftCode(activeLesson.codeOrTemplate || '')}
                        className="ghost-btn text-xs"
                      >
                        <span>Reset to Blueprint Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendDraftToEditor}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--editor)] hover:brightness-110 text-[#04050a] text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <FileEdit size={13} />
                        <span>🔍 Send Draft to Analytical Editor for Redline Critique →</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="pt-3 flex justify-between items-center">
                    <button onClick={() => setMasterclassTab('mechanics')} className="ghost-btn">
                      <ArrowLeft size={12} />
                      <span>Back to Mechanics</span>
                    </button>
                    <button
                      onClick={() => setMasterclassTab('traps')}
                      className="accent-btn"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next: Level 4 — Traps &amp; Cut-List →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TRAPS & CUT LIST (LEVEL 3) */}
              {masterclassTab === 'traps' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Common Pitfalls */}
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                    <div className="font-mono text-[11px] uppercase font-bold text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      <span>Beginner Traps &amp; Common Failure Modes:</span>
                    </div>
                    <div className="space-y-2">
                      {(activeLesson.commonPitfalls || [
                        'Premature optimization: Adding multi-layer complexity before proving the basic loop works.',
                        'Ignoring error feedback from environment exceptions.'
                      ]).map((trap, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-rose-500/20 text-xs text-[var(--ink)] leading-relaxed">
                          {trap}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cut-List Fluff */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                    <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                      <Scissors size={13} />
                      <span>The Cut-List: What to Safely Skip on this Topic:</span>
                    </div>
                    <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                      {activeLesson.cutListFluff || 'Skip bloated frameworks and focus on pure first-principles state loops.'}
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="pt-3 flex justify-between items-center">
                    <button onClick={() => setMasterclassTab('code')} className="ghost-btn">
                      <ArrowLeft size={12} />
                      <span>Back to Code</span>
                    </button>
                    <button
                      onClick={() => setMasterclassTab('sparring')}
                      className="accent-btn"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next: Level 5 — Socratic Sparring Check →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: SOCRATIC SPARRING CHECK (LEVEL 4) */}
              {masterclassTab === 'sparring' && (
                <div className="space-y-4 animate-fade-in">
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
                            <CheckCircle2 size={15} /> Score: {sparringResult.score || 94}/100 — {sparringResult.mastered ? 'Verified Mastered' : 'Needs Polish'}
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
                              <Flame size={14} />
                              <span>Verify Understanding &amp; Spar with Tutor →</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button onClick={() => setMasterclassTab('traps')} className="ghost-btn">
                      <ArrowLeft size={12} />
                      <span>Back to Traps</span>
                    </button>

                    <button
                      onClick={() => {
                        const nextIdx = allConcepts.indexOf(selectedConcept) + 1;
                        if (nextIdx < allConcepts.length) {
                          setSelectedConcept(allConcepts[nextIdx]);
                        }
                      }}
                      disabled={allConcepts.indexOf(selectedConcept) >= allConcepts.length - 1}
                      className="accent-btn"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next Concept in Curriculum →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-10 text-xs text-[var(--ink-3)]">
              Select a concept above to load its Zero-to-Hero Masterclass.
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Live 1-on-1 Socratic Classroom */}
      {tutorMode === 'socratic' && (
        <div className="space-y-6">
          {/* Concept Selector Bar */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-[var(--tutor)]" />
                <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">
                  Select a Concept for Live 1-on-1 Socratic Lesson:
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--ink-3)]">
                {(tutorData.lessons || []).filter((l) => l.mastered).length} / {allConcepts.length} Mastered
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
                      handleInitClassroom(concept);
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
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Classroom Dialogue Container */}
          <div className="card p-0 overflow-hidden border-2 border-[var(--tutor)]/40 bg-[var(--surface-1)] shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-[var(--tutor)] uppercase font-bold tracking-wider">
                    LIVE SOCRATIC CLASSROOM (1-ON-1 INTERACTIVE)
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-[var(--ink)] m-0">
                    Teaching: {selectedConcept || 'First Principles'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isClassroomMastered && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold font-mono flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>✓ Concept Mastered</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleInitClassroom(selectedConcept)}
                  disabled={isClassroomLoading}
                  className="ghost-btn text-xs"
                >
                  <RotateCcw size={12} />
                  <span>Restart Lesson</span>
                </button>
              </div>
            </div>

            {/* Dialogue Turns Stream */}
            <div className="p-5 space-y-4 max-h-[550px] overflow-y-auto bg-[var(--surface-1)]">
              {classroomTurns.length === 0 && !isClassroomLoading ? (
                <div className="text-center py-12 space-y-3">
                  <Lightbulb size={32} className="text-[var(--tutor)] mx-auto opacity-60" />
                  <p className="font-bold text-sm text-[var(--ink)]">
                    Ready to start your 1-on-1 Socratic lesson on "{selectedConcept}"?
                  </p>
                  <p className="text-xs text-[var(--ink-3)] max-w-md mx-auto">
                    The Socratic Tutor will teach you turn-by-turn with plain analogies, live code blueprints, and interactive check-in probes.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleInitClassroom(selectedConcept)}
                    className="accent-btn mx-auto"
                    style={{ padding: '8px 20px', borderRadius: '10px' }}
                  >
                    <Play size={13} />
                    <span>Start Live Lesson →</span>
                  </button>
                </div>
              ) : (
                classroomTurns.map((turn, tIdx) => (
                  <div key={turn.id || tIdx} className="space-y-2.5 animate-fade-in">
                    {turn.speaker === 'tutor' ? (
                      <div className="space-y-2">
                        {/* Stage Tag */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[var(--tutor)]/20 text-[var(--tutor)] flex items-center justify-center text-[10px] font-bold font-mono">
                            T
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[var(--tutor)] uppercase tracking-wider">
                            {turn.stageName || 'Socratic Professor'}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            {turn.timestamp}
                          </span>
                        </div>

                        {/* Optional Tutor Feedback on previous student answer */}
                        {turn.tutorFeedback && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-[var(--ink)] space-y-1">
                            <div className="font-mono text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                              <Sparkles size={11} />
                              <span>Socratic Evaluation of Your Previous Response:</span>
                            </div>
                            <p className="m-0 leading-relaxed font-sans">{turn.tutorFeedback}</p>
                          </div>
                        )}

                        {/* Tutor Main Content */}
                        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--ink)] leading-relaxed space-y-2 shadow-xs">
                          <MarkdownRenderer content={turn.content} />
                        </div>

                        {/* Active Check-In Question container */}
                        {turn.checkInQuestion && tIdx === classroomTurns.length - 1 && !isClassroomMastered && (
                          <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-2))] border-2 border-[var(--tutor)] space-y-2 shadow-sm animate-pulse-subtle">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase font-bold text-[var(--tutor)]">
                              <HelpCircle size={14} />
                              <span>Socratic Check-In Probe (Your Turn):</span>
                            </div>
                            <p className="font-bold text-xs sm:text-sm text-[var(--ink)] m-0 leading-relaxed font-sans">
                              {turn.checkInQuestion}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Student Response Bubble */
                      <div className="flex flex-col items-end space-y-1 pl-8">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            {turn.timestamp}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[var(--ink-2)]">
                            You (Scholar)
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[var(--tutor)] text-[#04050a] font-medium text-xs max-w-[90%] shadow-xs leading-relaxed">
                          {turn.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isClassroomLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--ink-2)] font-mono animate-pulse">
                  <Loader2 size={14} className="animate-spin text-[var(--tutor)]" />
                  <span>Socratic Professor is listening &amp; formulating next pedagogical stage...</span>
                </div>
              )}

              {/* Mastered Banner */}
              {isClassroomMastered && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-[var(--tutor)]/20 border-2 border-emerald-500 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={20} className="text-emerald-500" />
                      <span className="font-bold text-sm text-[var(--ink)]">
                        🏆 Concept Mastered &amp; Verified by Socratic Professor!
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      Score: 95/100
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed">
                    You have successfully reasoned through the first-principles invariants, mechanics, and failure modes of <strong>{selectedConcept}</strong>.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = allConcepts.indexOf(selectedConcept) + 1;
                        if (nextIdx < allConcepts.length) {
                          const nextConcept = allConcepts[nextIdx];
                          setSelectedConcept(nextConcept);
                          handleInitClassroom(nextConcept);
                        }
                      }}
                      disabled={allConcepts.indexOf(selectedConcept) >= allConcepts.length - 1}
                      className="accent-btn text-xs"
                      style={{ padding: '8px 18px', borderRadius: '10px' }}
                    >
                      <span>Next Concept in Curriculum →</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Bottom Response Footer */}
            {!isClassroomMastered && classroomTurns.length > 0 && (
              <div className="p-4 border-t border-[var(--hairline)] bg-[var(--surface-2)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-[var(--ink-3)] font-semibold">
                    💡 Respond to the Professor (Type or click microphone to speak):
                  </label>
                  <VoiceInputButton
                    onTranscript={(t) =>
                      setClassroomAnswer((prev) => (prev ? `${prev} ${t}` : t))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <textarea
                    placeholder="Explain your deduction or reasoning to the Socratic Professor..."
                    value={classroomAnswer}
                    onChange={(e) => setClassroomAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitClassroomAnswer();
                      }
                    }}
                    rows={2}
                    className="flex-1 bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--tutor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none resize-none font-sans leading-relaxed"
                  />

                  <button
                    type="button"
                    onClick={() => handleSubmitClassroomAnswer()}
                    disabled={!classroomAnswer.trim() || isClassroomLoading}
                    className="px-4 py-2 rounded-xl bg-[var(--tutor)] hover:brightness-110 text-[#04050a] text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm cursor-pointer self-end h-[58px]"
                  >
                    {isClassroomLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        <span className="hidden sm:inline">Submit →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Feynman Studio */}
      {tutorMode === 'feynman' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-2 text-[var(--tutor)] font-mono text-xs uppercase font-bold">
              <Sparkles size={15} />
              <span>The Feynman Technique Drill: Explain It to a 10-Year-Old</span>
            </div>
            <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed">
              If you cannot explain a concept using simple everyday language and zero jargon, you do not truly understand it yet.
            </p>

            <form onSubmit={handleEvaluateFeynman} className="space-y-3">
              <input
                type="text"
                placeholder="Concept to explain (e.g. Backpropagation, CAP Theorem, Discounted Cash Flow)..."
                value={feynmanConcept}
                onChange={(e) => setFeynmanConcept(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--tutor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none"
                required
              />

              <div className="flex items-center justify-between">
                <label className="text-xs text-[var(--ink-3)] font-mono">
                  Your Layman Explanation (No Jargon Allowed):
                </label>
                <VoiceInputButton
                  onTranscript={(transcript) =>
                    setFeynmanExplanation((prev) => (prev ? `${prev} ${transcript}` : transcript))
                  }
                />
              </div>

              <textarea
                placeholder="Explain the concept as if speaking to a curious 10-year-old..."
                value={feynmanExplanation}
                onChange={(e) => setFeynmanExplanation(e.target.value)}
                rows={4}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--tutor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none leading-relaxed font-sans"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!feynmanConcept.trim() || !feynmanExplanation.trim() || isEvaluatingFeynman}
                  className="accent-btn"
                >
                  {isEvaluatingFeynman ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Auditing Layman Clarity...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Evaluate with Feynman Auditor →</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {feynmanResult && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-[var(--tutor)]" />
                    <span className="font-bold text-sm text-[var(--ink)]">Feynman Audit Verdict</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      Clarity: {feynmanResult.clarityScore}/100
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      Accuracy: {feynmanResult.accuracyScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--ink)]">
                  <p className="m-0">
                    <strong>Strengths:</strong> {feynmanResult.strengths}
                  </p>
                  {feynmanResult.jargonUsed && feynmanResult.jargonUsed.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <strong>Jargon Detected:</strong> {feynmanResult.jargonUsed.join(', ')}
                    </div>
                  )}
                  {feynmanResult.simplifiedAnalogySuggestion && (
                    <p className="m-0 text-[var(--ink-2)]">
                      <strong>Suggested Analogy:</strong> {feynmanResult.simplifiedAnalogySuggestion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 4: Diagnostic Scenario Quiz */}
      {tutorMode === 'quiz' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--tutor)] font-mono text-xs uppercase font-bold">
                <HelpCircle size={15} />
                <span>Tactical Scenario-Based Diagnostic Quiz</span>
              </div>
              <button
                onClick={handleGenerateDiagnosticQuiz}
                disabled={isGeneratingQuiz}
                className="ghost-btn text-xs"
              >
                {isGeneratingQuiz ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                <span>New Quiz</span>
              </button>
            </div>

            {isGeneratingQuiz ? (
              <div className="text-center py-10 text-xs text-[var(--ink-3)] space-y-2">
                <Loader2 size={24} className="animate-spin text-[var(--tutor)] mx-auto" />
                <p>Generating high-stakes scenario dilemmas...</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
                    <p className="font-bold text-xs text-[var(--ink)] m-0">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[qIdx] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;

                        let style = 'bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--ink-2)]';
                        if (isSelected && !showResults) {
                          style = 'bg-[var(--surface-3)] border-[var(--tutor)] text-[var(--tutor)] font-bold';
                        } else if (showResults) {
                          if (isCorrect) {
                            style = 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold';
                          } else if (isSelected) {
                            style = 'bg-rose-500/10 border-rose-500 text-rose-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => selectAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-start gap-2.5 ${style}`}
                          >
                            <span className="font-mono text-[11px] font-bold mt-0.5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {showResults && isCorrect && <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />}
                            {showResults && isSelected && !isCorrect && <XCircle size={15} className="text-rose-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--ink-2)]">
                        <strong>First-Principles Rationale:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  {!showResults ? (
                    <button
                      onClick={() => setShowResults(true)}
                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                      className="accent-btn"
                    >
                      <span>Submit Answers &amp; Check Rationale →</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateDiagnosticQuiz}
                      className="accent-btn"
                    >
                      <span>Take Another Scenario Quiz →</span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
