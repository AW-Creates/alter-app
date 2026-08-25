import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  chatWithPersona,
  evaluateFeynmanWithAI,
  generateQuizWithAI
} from '../../services/gemini';
import { FeynmanEvaluation, QuizQuestion } from '../../types/alter';

export const TutorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [tutorMode, setTutorMode] = useState<'socratic' | 'feynman' | 'quiz'>('socratic');

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

  const { tutorData } = activeJourney;

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
      const questions = await generateQuizWithAI(activeJourney.topic, 'Core First Principles & Invariants');
      setQuizQuestions(questions);
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
    'Walk me through the mathematical proof or derivation'
  ];

  return (
    <div className="space-y-[22px] animate-fade-in">
      {/* Hero Card */}
      <div className="hero-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2.5 relative z-10">
          <div>
            <div className="role-chip">
              <span className="dot"></span>
              <span>T — SOCRATIC MIDNIGHT TUTOR</span>
            </div>
            <h1 className="font-display font-semibold text-2xl sm:text-[34px] tracking-tight text-white m-0 mb-2">
              Active Recall &amp; Diagnostic Gap Finder
            </h1>
          </div>
          <div className="segmented">
            <button
              onClick={() => setTutorMode('socratic')}
              className={tutorMode === 'socratic' ? 'active' : ''}
            >
              Socratic dialogue
            </button>
            <button
              onClick={() => setTutorMode('feynman')}
              className={tutorMode === 'feynman' ? 'active' : ''}
            >
              Feynman drill
            </button>
            <button
              onClick={() => {
                setTutorMode('quiz');
                if (quizQuestions.length === 0) handleGenerateDiagnosticQuiz();
              }}
              className={tutorMode === 'quiz' ? 'active' : ''}
            >
              Diagnostic quiz
            </button>
          </div>
        </div>
        <p className="text-[14.5px] text-white/60 max-w-[74ch] leading-relaxed m-0 relative z-10">
          True mastery comes from active deduction. Test your understanding through Socratic sparring,
          the Feynman Technique, and edge-case quizzes.
        </p>
      </div>

      {/* Mode 1: Socratic Dialogue Grid */}
      {tutorMode === 'socratic' && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-[22px] items-start">
          {/* Left Cards */}
          <div className="space-y-4">
            <div className="altor-card">
              <HelpCircle className="w-5 h-5 text-[var(--accent)] mb-2.5" />
              <h4 className="text-[14.5px] font-semibold text-white m-0 mb-2">The Socratic principle</h4>
              <p className="text-[13px] text-white/60 leading-relaxed m-0">
                Your Tutor will not spoon-feed you answers. It asks targeted questions that challenge you to
                deduce the underlying mechanism yourself.
              </p>
            </div>

            <div className="altor-card">
              <p className="card-label">Recommended Socratic starters</p>
              <div className="space-y-2">
                {starters.map((st, i) => (
                  <div
                    key={i}
                    onClick={() => setInputText(st)}
                    className="text-xs text-white/60 hover:text-white bg-[var(--surface-1)] hover:bg-white/[0.04] border border-white/[0.07] hover:border-[var(--accent)] rounded-[9px] p-3 cursor-pointer transition italic"
                  >
                    "{st}"
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Socratic Session Sidebar Card */}
          <div className="sidebar-card" style={{ position: 'static', height: '640px' }}>
            <div className="chat-head">
              <div className="chat-avatar">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[14.5px] font-semibold text-white m-0">1-on-1 Socratic session</h4>
                <p className="text-xs text-white/40 m-0">Targeting cognitive edge cases</p>
              </div>
            </div>

            <div className="chat-body space-y-3">
              {tutorData.chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg ${
                    msg.sender === 'user'
                      ? 'bg-[var(--surface-3)] border-white/[0.13] text-white'
                      : ''
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                  <div className="msg-time">{msg.timestamp}</div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Tutor is preparing a diagnostic question...</span>
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
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="send-btn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mode 2: Feynman Drill */}
      {tutorMode === 'feynman' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[22px] items-start">
          <form onSubmit={handleEvaluateFeynman} className="altor-card space-y-4">
            <p className="card-label">The Feynman Technique Studio</p>
            <p className="text-xs text-white/60 leading-relaxed m-0">
              Pick a complex concept. Explain it in plain English as if teaching a smart 10-year-old. No buzzwords.
            </p>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Concept to Explain</label>
              <input
                type="text"
                placeholder="e.g. Backpropagation, CAP Theorem, Transformer Attention..."
                value={feynmanConcept}
                onChange={(e) => setFeynmanConcept(e.target.value)}
                className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-2.5 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Your Plain-Language Explanation</label>
              <textarea
                placeholder="Break it down simply without hiding behind technical jargon..."
                value={feynmanExplanation}
                onChange={(e) => setFeynmanExplanation(e.target.value)}
                rows={6}
                className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-2.5 outline-none font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isEvaluatingFeynman}
              className="accent-btn w-full justify-center py-2.5"
            >
              {isEvaluatingFeynman ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Feynman clarity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Grade Feynman Explanation</span>
                </>
              )}
            </button>
          </form>

          {/* Results */}
          <div className="space-y-4">
            {feynmanResult ? (
              <div className="altor-card space-y-4">
                <p className="card-label">Socratic Evaluation &amp; Diagnostics</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] text-center">
                    <span className="text-[10px] font-mono uppercase text-white/40">Clarity</span>
                    <div className="text-2xl font-display font-bold text-[var(--accent)] mt-1">
                      {feynmanResult.clarityScore}/100
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] text-center">
                    <span className="text-[10px] font-mono uppercase text-white/40">Accuracy</span>
                    <div className="text-2xl font-display font-bold text-[var(--tutor)] mt-1">
                      {feynmanResult.accuracyScore}/100
                    </div>
                  </div>
                </div>

                {feynmanResult.simplifiedAnalogy && (
                  <div className="p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface-1))] border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] text-xs space-y-1">
                    <span className="font-semibold text-white">Intuitive Master Analogy:</span>
                    <p className="text-white/80 italic leading-relaxed m-0">"{feynmanResult.simplifiedAnalogy}"</p>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-white">Identified Blind Spots:</span>
                  <ul className="list-disc list-inside space-y-1 text-white/60">
                    {feynmanResult.blindSpots?.map((bs, i) => (
                      <li key={i}><span className="text-white/80">{bs}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-white/[0.07] text-xs text-white/70 leading-relaxed">
                  <span className="font-semibold text-white">Tutor Coaching: </span>
                  {feynmanResult.tutorFeedback}
                </div>
              </div>
            ) : (
              <div className="altor-card flex flex-col items-center justify-center text-center py-20 text-white/30 space-y-2">
                <Award className="w-8 h-8 opacity-30" />
                <p className="text-xs">Submit your Feynman explanation to receive instant clarity and gap analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Diagnostic Quiz */}
      {tutorMode === 'quiz' && (
        <div className="altor-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-white m-0">Edge-Case Knowledge Diagnostic</h3>
              <p className="text-xs text-white/50 m-0 mt-0.5">3-Question First-Principles Challenge</p>
            </div>
            <button
              onClick={handleGenerateDiagnosticQuiz}
              disabled={isGeneratingQuiz}
              className="ghost-btn text-xs py-1.5 px-3 self-start"
            >
              {isGeneratingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>New Diagnostic Quiz</span>
            </button>
          </div>

          {isGeneratingQuiz ? (
            <div className="py-20 text-center text-xs font-mono text-[var(--accent)] flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating diagnostic questions...</span>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="space-y-3 p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07]">
                  <p className="text-sm font-semibold text-white">
                    <span className="text-[var(--accent)] font-mono mr-2">Q{qIdx + 1}.</span>
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let btnStyle = 'bg-[var(--surface-2)] border-white/[0.07] text-white/70 hover:border-white/[0.13]';

                      if (showResults) {
                        if (isCorrect) btnStyle = 'bg-[rgba(95,219,158,0.1)] border-[var(--tutor)] text-[var(--tutor)] font-semibold';
                        else if (isSelected && !isCorrect) btnStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                      } else if (isSelected) {
                        btnStyle = 'bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface-3))] border-[var(--accent)] text-white font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectAnswer(qIdx, optIdx)}
                          className={`text-left p-3 rounded-lg border text-xs transition flex items-start gap-2 ${btnStyle}`}
                        >
                          <span className="font-mono text-[10px] opacity-50 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-white/[0.07] text-xs text-white/70 leading-relaxed mt-2">
                      <span className="font-semibold text-white">First-Principles Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                {!showResults ? (
                  <button
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(userAnswers).length < quizQuestions.length}
                    className="accent-btn"
                  >
                    Check Answers
                  </button>
                ) : (
                  <button onClick={handleGenerateDiagnosticQuiz} className="accent-btn">
                    Next Diagnostic Challenge
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
