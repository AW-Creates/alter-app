import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Lightbulb,
  Send,
  Loader2,
  Sparkles,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BrainCircuit,
  MessageSquareQuote
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, evaluateFeynmanWithAI, generateQuizWithAI } from '../../services/gemini';
import { DiagnosticQuiz, FeynmanSession } from '../../types/alter';

export const TutorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'socratic' | 'feynman' | 'quiz'>('socratic');

  // Feynman State
  const [feynmanConcept, setFeynmanConcept] = useState('');
  const [feynmanExplanation, setFeynmanExplanation] = useState('');
  const [isEvaluatingFeynman, setIsEvaluatingFeynman] = useState(false);
  const [currentFeynmanResult, setCurrentFeynmanResult] = useState<FeynmanSession | null>(null);

  // Quiz State
  const [quizFocus, setQuizFocus] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<DiagnosticQuiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

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
        content: `⚠️ Error: ${err.message}`,
        persona: 'tutor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateFeynman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feynmanConcept.trim() || !feynmanExplanation.trim()) return;

    setIsEvaluatingFeynman(true);
    try {
      const result = await evaluateFeynmanWithAI(feynmanConcept.trim(), feynmanExplanation.trim());
      setCurrentFeynmanResult(result);
      updateActiveJourney((prev) => ({
        ...prev,
        tutorData: {
          ...prev.tutorData,
          feynmanSessions: [result, ...prev.tutorData.feynmanSessions]
        }
      }));
    } catch (err) {
      console.error('Failed to evaluate Feynman', err);
    } finally {
      setIsEvaluatingFeynman(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingQuiz(true);
    setUserAnswers({});
    setShowQuizResults(false);

    try {
      const quiz = await generateQuizWithAI(activeJourney.topic, quizFocus.trim() || activeJourney.topic);
      setActiveQuiz(quiz);
      updateActiveJourney((prev) => ({
        ...prev,
        tutorData: {
          ...prev.tutorData,
          quizzes: [quiz, ...prev.tutorData.quizzes]
        }
      }));
    } catch (err) {
      console.error('Failed to generate quiz', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (showQuizResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateQuizScore = () => {
    if (!activeQuiz) return 0;
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / activeQuiz.questions.length) * 100);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              T — Socratic Midnight Tutor
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Active Recall & Diagnostic Gap Finder
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              True mastery comes from active deduction. Test your understanding through Socratic sparring, the Feynman Technique, and edge-case quizzes.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl space-x-1">
            <button
              onClick={() => setActiveMode('socratic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMode === 'socratic'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Socratic Dialogue
            </button>
            <button
              onClick={() => setActiveMode('feynman')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMode === 'feynman'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Feynman Drill
            </button>
            <button
              onClick={() => setActiveMode('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMode === 'quiz'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diagnostic Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeMode === 'socratic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>The Socratic Principle</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your Tutor will not spoon-feed you answers. It asks targeted questions that challenge you to deduce the underlying mechanism yourself.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recommended Socratic Starters
              </h4>
              <div className="space-y-2">
                {[
                  'Quiz me on the core invariant of Phase 1',
                  'Give me a real-world edge case scenario to solve',
                  'What is the fundamental flaw in naive implementations?',
                  'Walk me through the mathematical proof or derivation'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 hover:text-emerald-300 transition leading-normal"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col h-[700px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">1-on-1 Socratic Session</h3>
                  <p className="text-[11px] text-slate-400">Targeting cognitive edge cases</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tutorData.chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-xs font-bold">
                      T
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <MarkdownRenderer content={msg.content} />
                    <div className="text-[10px] text-slate-400 text-right mt-1.5 opacity-70">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-center text-emerald-400 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span>Tutor is formulating a diagnostic probe...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Explain your reasoning or ask a conceptual question..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feynman Technique Drill Mode */}
      {activeMode === 'feynman' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageSquareQuote className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Feynman Technique Studio</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <em>"If you can't explain it simply, you don't understand it well enough."</em> — Richard Feynman.
                Select a concept and explain it from zero without jargon.
              </p>

              <form onSubmit={handleEvaluateFeynman} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Concept to Explain
                  </label>
                  <input
                    type="text"
                    required
                    value={feynmanConcept}
                    onChange={(e) => setFeynmanConcept(e.target.value)}
                    placeholder="e.g. Distributed Consensus, Transformer Attention, Gradient Descent..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Simple First-Principles Explanation
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={feynmanExplanation}
                    onChange={(e) => setFeynmanExplanation(e.target.value)}
                    placeholder="Explain the intuition as if to a curious 10-year old or beginner. Use clear analogies..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isEvaluatingFeynman || !feynmanConcept.trim() || !feynmanExplanation.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {isEvaluatingFeynman ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading Clarity & Blind Spots...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Feynman Explanation</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results / Feedback */}
          <div className="lg:col-span-6 space-y-6">
            {currentFeynmanResult ? (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Feynman Evaluation
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-100">{currentFeynmanResult.concept}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xl font-black text-emerald-400">{currentFeynmanResult.clarityScore}%</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-sky-400">{currentFeynmanResult.accuracyScore}%</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                    </div>
                  </div>
                </div>

                {/* Simplified Analogy */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Master Tutor Analogy</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{currentFeynmanResult.simplifiedAnalogy}"
                  </p>
                </div>

                {/* Strengths & Blind Spots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Strengths</span>
                    </h4>
                    <ul className="space-y-1 text-slate-300">
                      {currentFeynmanResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Blind Spots to Sharpen</span>
                    </h4>
                    <ul className="space-y-1 text-slate-300">
                      {currentFeynmanResult.blindSpots.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tutor Feedback */}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                  <strong className="text-slate-100 font-semibold block mb-1">Tutor Feedback:</strong>
                  {currentFeynmanResult.tutorFeedback}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-3">
                <Lightbulb className="w-10 h-10 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-300">No Drill Evaluated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Write out an intuitive explanation of any concept on the left, and your tutor will identify your strengths and subtle blind spots.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnostic Quiz Mode */}
      {activeMode === 'quiz' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Diagnostic Edge-Case Quiz</h3>
                <p className="text-xs text-slate-400">Generate active recall questions to reveal hidden gaps</p>
              </div>

              <form onSubmit={handleGenerateQuiz} className="flex items-center gap-2">
                <input
                  type="text"
                  value={quizFocus}
                  onChange={(e) => setQuizFocus(e.target.value)}
                  placeholder="Specific concept (optional)..."
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isGeneratingQuiz}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isGeneratingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Quiz</span>
                </button>
              </form>
            </div>

            {activeQuiz ? (
              <div className="space-y-6 pt-4 border-t border-slate-800">
                {activeQuiz.questions.map((q, qIdx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  return (
                    <div key={q.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 leading-snug">{q.question}</h4>
                      </div>

                      <div className="space-y-2 pl-8">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[q.id] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                          if (isSelected) {
                            btnStyle = 'bg-sky-500/20 border-sky-500 text-sky-200 font-medium';
                          }
                          if (showQuizResults) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showQuizResults && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {showQuizResults && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResults && (
                        <div className="ml-8 mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                          <strong className="text-emerald-400 font-semibold block mb-1">First-Principles Explanation:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  {showQuizResults ? (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">
                        Score: {calculateQuizScore()}%
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => setShowQuizResults(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                  >
                    Reveal Answers & Explanations
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click "Generate Quiz" to run a diagnostic knowledge-check.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
