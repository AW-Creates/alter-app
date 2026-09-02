import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  generateCurriculumWithAI,
  generateSourcesWithAI,
  generateDiagnosticQuestionsWithAI,
  evaluateDiagnosticAnswersWithAI
} from '../../services/gemini';
import {
  Sparkles,
  X,
  Target,
  Compass,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { DiagnosticQuestion, DiagnosticAssessment } from '../../types/alter';

export const CreateJourneyModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createJourney, updateActiveJourney, setActiveJourneyId, setIsApiKeyModalOpen } = useJourney();

  // Wizard Steps: 'input' | 'grill_loading' | 'grill_quiz' | 'grill_evaluating' | 'grill_summary'
  const [modalStep, setModalStep] = useState<'input' | 'grill_loading' | 'grill_quiz' | 'grill_evaluating' | 'grill_summary'>('input');

  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [baseline, setBaseline] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [depth, setDepth] = useState<'foundational' | 'practitioner' | 'expert' | 'researcher'>('practitioner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Diagnostic Grill State
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(null);

  if (!isCreateModalOpen) return null;

  const handleStartGrill = async () => {
    if (!topic.trim()) return;
    setModalStep('grill_loading');
    setCurrentQIndex(0);
    setAnswers({});
    setCurrentAnswerText('');
    setAssessment(null);

    setModalError(null);
    try {
      const qList = await generateDiagnosticQuestionsWithAI(
        topic.trim(),
        destination.trim(),
        baseline.trim() || 'Beginner'
      );
      setQuestions(qList);
      setModalStep('grill_quiz');
    } catch (err: any) {
      console.error('Failed to generate diagnostic probes', err);
      if (err?.message === 'UNCONFIGURED_SERVER_KEY' || err?.message?.includes('UNCONFIGURED_SERVER_KEY')) {
        setModalError(
          'Shared live AI proxy is unconfigured (missing GEMINI_SHARED_API_KEY). You can add your personal Gemini or OpenRouter key in Settings, or use Direct Launch for our pre-built specialized curriculum.'
        );
      } else if (err?.message?.includes('free requests')) {
        setModalError(err.message);
      } else {
        setModalError(`Diagnostic intake error: ${err?.message || 'Check connection.'}`);
      }
      setModalStep('input');
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswerText.trim() && !answers[currentQIndex]) return;

    const finalAnswer = currentAnswerText.trim() || answers[currentQIndex] || '';
    const updatedAnswers = { ...answers, [currentQIndex]: finalAnswer };
    setAnswers(updatedAnswers);
    setCurrentAnswerText('');

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setCurrentAnswerText(updatedAnswers[currentQIndex + 1] || '');
    } else {
      handleEvaluateGrill(updatedAnswers);
    }
  };

  const handleEvaluateGrill = async (finalAnswers: Record<number, string>) => {
    setModalStep('grill_evaluating');

    const qaPairs = questions.map((q, idx) => ({
      question: q.question,
      answer: finalAnswers[idx] || 'Not answered',
      type: q.type
    }));

    try {
      const result = await evaluateDiagnosticAnswersWithAI(topic.trim(), qaPairs);
      setAssessment(result);
      setModalStep('grill_summary');
    } catch (err) {
      console.error('Diagnostic evaluation failed', err);
      setModalStep('grill_summary');
    }
  };

  const handleDirectOrCalibratedLaunch = async (useCalibrated: boolean = false) => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const effectiveTopic = useCalibrated && assessment?.refinedTopic ? assessment.refinedTopic : topic.trim();
      const effectiveDest = useCalibrated && assessment?.refinedDestination ? assessment.refinedDestination : destination.trim() || `Master ${topic.trim()} with verifiable proof-of-work`;
      const effectiveBaseline = useCalibrated && assessment?.actualBaselineAssessment ? assessment.actualBaselineAssessment : baseline.trim() || 'Beginner fundamentals';

      // 1. Create Journey
      const journey = createJourney({
        title: effectiveTopic,
        topic: effectiveTopic,
        destination: effectiveDest,
        baseline: effectiveBaseline,
        hoursPerWeek,
        depth
      });

      // 2. Generate custom Curriculum (with diagnostic injection if available)
      const advisorData = await generateCurriculumWithAI(
        effectiveTopic,
        effectiveDest,
        effectiveBaseline,
        hoursPerWeek,
        depth,
        useCalibrated ? assessment || undefined : undefined
      );

      // 3. Generate Sources
      const initialSources = await generateSourcesWithAI(
        effectiveTopic,
        effectiveDest,
        effectiveBaseline
      );

      // 4. Update Journey
      updateActiveJourney((prev) => ({
        ...prev,
        diagnosticAssessment: useCalibrated && assessment ? assessment : undefined,
        advisorData: {
          ...advisorData,
          chatHistory: [
            {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              persona: 'advisor',
              content: useCalibrated && assessment
                ? `🎯 **Diagnostic Calibration Complete**: Based on your Socratic intake assessment, I have personalized your curriculum to target your exact knowledge gaps (*${assessment.criticalGapsToFill.join(', ')}*). Let's master Phase 1!`
                : `Welcome to **${effectiveTopic}**! I've engineered your ${advisorData.estimatedWeeks}-week modular curriculum and locked in your **Cut List**. Check out Phase 1 below to begin.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        },
        librarianData: {
          ...prev.librarianData,
          sources: initialSources
        }
      }));

      setActiveJourneyId(journey.id);
      setIsCreateModalOpen(false);
      // Reset state
      setModalStep('input');
      setTopic('');
      setDestination('');
      setBaseline('');
    } catch (err) {
      console.error('Failed to generate journey', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--advisor)]/40 shadow-2xl p-6 md:p-8 my-8 text-[var(--ink)]">
        <button
          onClick={() => !isGenerating && setIsCreateModalOpen(false)}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INITIAL INPUT FORM */}
        {modalStep === 'input' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] flex items-center justify-center text-[var(--advisor)] shadow-sm font-bold font-mono">
                🎯
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--ink)] m-0">Create a New Learning Journey</h2>
                <p className="text-xs text-[var(--ink-2)] m-0">
                  Your AI Advisor will generate a tailored curriculum, milestones, and a strict <span className="text-[var(--advisor)] font-semibold">Cut List</span>.
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleStartGrill(); }} className="space-y-5">
              {/* Topic */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                  <Compass className="w-3.5 h-3.5 text-[var(--advisor)]" />
                  What do you want to master? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Create My Own Digital Product, Algorithmic Futures Trading, Rust..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--advisor)] focus:outline-none transition"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                  <Target className="w-3.5 h-3.5 text-[var(--advisor)]" />
                  Target Outcome / Destination (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ship a live SaaS web app with Stripe billing; pass a prop firm evaluation"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--advisor)] focus:outline-none transition"
                />
              </div>

              {/* Baseline */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-[var(--advisor)]" />
                  Current Knowledge Baseline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Familiar with React frontend, zero backend experience"
                  value={baseline}
                  onChange={(e) => setBaseline(e.target.value)}
                  className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--advisor)] focus:outline-none transition"
                />
              </div>

              {/* Hours per week & Depth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[var(--advisor)]" />
                    Time Commitment: {hoursPerWeek} hrs/week
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={2}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-[var(--advisor)]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                    Target Depth Level
                  </label>
                  <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value as any)}
                    className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-3 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--advisor)] focus:outline-none"
                  >
                    <option value="foundational">Foundational (First Principles)</option>
                    <option value="practitioner">Practitioner (Applied Production)</option>
                    <option value="expert">Expert (Deep Mechanics)</option>
                    <option value="researcher">Researcher (Cutting Edge)</option>
                  </select>
                </div>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-500 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{modalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition cursor-pointer flex-shrink-0 whitespace-nowrap"
                  >
                    Configure Key
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleStartGrill}
                  disabled={!topic.trim() || isGenerating}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] text-xs font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>🎓 Chat with Advisor to Personalize (Recommended) →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectOrCalibratedLaunch(false)}
                  disabled={!topic.trim() || isGenerating}
                  className="py-3 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Direct Launch →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: LOADING DIAGNOSTIC PROBES */}
        {modalStep === 'grill_loading' && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--advisor)] mx-auto" />
            <p className="font-bold text-sm text-[var(--ink)]">
              Formulating Friendly Diagnostic Questions...
            </p>
            <p className="text-xs text-[var(--ink-3)] max-w-md mx-auto">
              Preparing thoughtful questions to understand your vision, hands-on background, and starting level.
            </p>
          </div>
        )}

        {/* STEP 3: ANSWERING DIAGNOSTIC PROBES */}
        {modalStep === 'grill_quiz' && currentQ && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)]">
              <span>Probe {currentQIndex + 1} of {questions.length}</span>
              <span className="capitalize text-[var(--advisor)] font-bold">
                {currentQ.type.replace('_', ' ').replace(/technical/i, 'Foundational')}
              </span>
            </div>

            <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--advisor)] h-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
              <p className="font-bold text-sm sm:text-base text-[var(--ink)] m-0 leading-relaxed font-sans">
                {currentQ.question}
              </p>
              <p className="text-[11px] text-[var(--ink-3)] m-0 font-mono">
                💡 <em>Why we ask: {currentQ.contextReason}</em>
              </p>
            </div>

            {currentQ.suggestedOptions && currentQ.suggestedOptions.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[var(--ink-3)]">
                  Quick-Select or customize below:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {currentQ.suggestedOptions.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setCurrentAnswerText(opt)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition flex items-start gap-2 ${
                        currentAnswerText === opt
                          ? 'bg-[var(--surface-3)] border-[var(--advisor)] text-[var(--advisor)] font-bold'
                          : 'bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-60 mt-0.5">👉</span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--ink)]">
                  Your Response:
                </label>
                <VoiceInputButton
                  onTranscript={(t) =>
                    setCurrentAnswerText((prev) => (prev ? `${prev} ${t}` : t))
                  }
                />
              </div>

              <textarea
                placeholder="Type or click the microphone to speak your answer to the Intake Advisor..."
                value={currentAnswerText}
                onChange={(e) => setCurrentAnswerText(e.target.value)}
                rows={3}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
              <button
                type="button"
                onClick={() => {
                  if (currentQIndex > 0) {
                    setCurrentQIndex((prev) => prev - 1);
                    setCurrentAnswerText(answers[currentQIndex - 1] || '');
                  } else {
                    setModalStep('input');
                  }
                }}
                className="ghost-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentQIndex === 0 ? 'Back to Setup' : 'Previous Probe'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={!currentAnswerText.trim() && !answers[currentQIndex]}
                className="accent-btn"
                style={{ padding: '8px 18px', borderRadius: '10px' }}
              >
                <span>{currentQIndex === questions.length - 1 ? 'Analyze & Calibrate →' : 'Next Probe →'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: EVALUATING GRILL ANSWERS */}
        {modalStep === 'grill_evaluating' && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--advisor)] mx-auto" />
            <p className="font-bold text-sm text-[var(--ink)]">
              Personalizing Your 3-Phase Roadmap...
            </p>
            <p className="text-xs text-[var(--ink-3)] max-w-md mx-auto">
              Analyzing your answers, adding starter modules to bridge knowledge gaps, and cutting out low-value distractions.
            </p>
          </div>
        )}

        {/* STEP 5: CALIBRATED PROFILE SUMMARY */}
        {modalStep === 'grill_summary' && assessment && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-2))] border-2 border-[var(--advisor)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--advisor)]" />
                  <span className="font-bold text-sm text-[var(--ink)]">
                    Diagnostic Assessment &amp; Calibration Complete
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--advisor)] text-[#04050a]">
                  Score: {assessment.diagnosticScore || 84}/100
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[var(--ink)]">
                <p className="m-0">
                  <strong>Refined Destination:</strong> {assessment.refinedDestination}
                </p>
                <p className="m-0 text-[var(--ink-2)]">
                  <strong>Assessed True Baseline:</strong> {assessment.actualBaselineAssessment}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmed Strengths (Skip Re-teaching):</span>
                </div>
                <div className="space-y-1 text-xs text-[var(--ink)]">
                  {assessment.masteredStrengths.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Gaps to Fill (Phase 1 Priority):</span>
                </div>
                <div className="space-y-1 text-xs text-[var(--ink)]">
                  {assessment.criticalGapsToFill.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[var(--hairline)]">
              <button
                type="button"
                onClick={handleStartGrill}
                className="ghost-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-test</span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectOrCalibratedLaunch(true)}
                disabled={isGenerating}
                className="accent-btn"
                style={{ padding: '10px 22px', borderRadius: '12px', fontSize: '13px' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Adaptive Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Launch Calibrated Journey →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
