import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Sparkles,
  X,
  Target,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import {
  generateDiagnosticQuestionsWithAI,
  evaluateDiagnosticAnswersWithAI,
  generateCurriculumWithAI,
  generateSourcesWithAI
} from '../../services/gemini';
import { DiagnosticQuestion, DiagnosticAssessment, LearningJourney } from '../../types/alter';

interface DiagnosticIntakeModalProps {
  isOpen: boolean;
  initialTopic: string;
  onClose: () => void;
  onLaunchJourney: () => void;
}

export const DiagnosticIntakeModal: React.FC<DiagnosticIntakeModalProps> = ({
  isOpen,
  initialTopic,
  onClose,
  onLaunchJourney
}) => {
  const { createJourney, updateActiveJourney, setActiveJourneyId } = useJourney();

  const [topic, setTopic] = useState(initialTopic);
  const [step, setStep] = useState<'loading_questions' | 'answering' | 'evaluating' | 'profile_ready'>('loading_questions');
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(null);
  const [isBuildingCurriculum, setIsBuildingCurriculum] = useState(false);

  useEffect(() => {
    if (isOpen && initialTopic) {
      setTopic(initialTopic);
      loadDiagnosticQuestions(initialTopic);
    }
  }, [isOpen, initialTopic]);

  const loadDiagnosticQuestions = async (topicToProbe: string) => {
    setStep('loading_questions');
    setCurrentQIndex(0);
    setAnswers({});
    setCurrentAnswerText('');
    setAssessment(null);

    try {
      const qList = await generateDiagnosticQuestionsWithAI(topicToProbe, '', 'Beginner to Intermediate');
      setQuestions(qList);
      setStep('answering');
    } catch (err) {
      console.error('Failed to load diagnostic questions', err);
      setStep('answering');
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQIndex];

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
      // Evaluate all answers
      handleRunEvaluation(updatedAnswers);
    }
  };

  const handleRunEvaluation = async (finalAnswers: Record<number, string>) => {
    setStep('evaluating');

    const qaPairs = questions.map((q, idx) => ({
      question: q.question,
      answer: finalAnswers[idx] || 'Not answered',
      type: q.type
    }));

    try {
      const result = await evaluateDiagnosticAnswersWithAI(topic, qaPairs);
      setAssessment(result);
      setStep('profile_ready');
    } catch (err) {
      console.error('Diagnostic evaluation failed', err);
      setStep('profile_ready');
    }
  };

  const handleFinalLaunch = async () => {
    if (!assessment) return;
    setIsBuildingCurriculum(true);

    try {
      // 1. Create the Journey locally with diagnostic data
      const newJourney = createJourney({
        title: assessment.refinedTopic || topic,
        topic: assessment.refinedTopic || topic,
        destination: assessment.refinedDestination,
        baseline: assessment.actualBaselineAssessment,
        hoursPerWeek: 8,
        depth: 'practitioner'
      });

      // 2. Generate Adaptive Gap-Filling Curriculum
      const advisorData = await generateCurriculumWithAI(
        assessment.refinedTopic || topic,
        assessment.refinedDestination,
        assessment.actualBaselineAssessment,
        8,
        'practitioner',
        assessment
      );

      // 3. Generate Canonical Sources
      const initialSources = await generateSourcesWithAI(
        assessment.refinedTopic || topic,
        assessment.refinedDestination,
        assessment.actualBaselineAssessment
      );

      // 4. Update the newly created journey
      updateActiveJourney((prev) => ({
        ...prev,
        diagnosticAssessment: assessment,
        advisorData: {
          ...advisorData,
          chatHistory: [
            {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              persona: 'advisor',
              content: `🎯 **Diagnostic Calibration Complete**: Based on your Socratic intake assessment, I have personalized your curriculum to target your exact knowledge gaps (*${assessment.criticalGapsToFill.join(', ')}*). Let's master Phase 1!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        },
        librarianData: {
          ...prev.librarianData,
          sources: initialSources
        }
      }));

      setActiveJourneyId(newJourney.id);
      onClose();
      onLaunchJourney();
    } catch (err) {
      console.error('Failed to launch calibrated journey', err);
    } finally {
      setIsBuildingCurriculum(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[var(--surface-1)] border-2 border-[var(--advisor)]/40 rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--surface-2)]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_18%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-[var(--advisor)] flex items-center justify-center flex-shrink-0 shadow-xs font-bold font-mono">
              🎯
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--advisor)] uppercase font-bold tracking-wider">
                Socratic Diagnostic Intake &amp; Baseline Calibration
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--ink)] m-0">
                Calibrating: {topic}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {step === 'loading_questions' && (
            <div className="py-12 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-[var(--advisor)] mx-auto" />
              <p className="font-bold text-sm text-[var(--ink)]">
                Formulating Socratic Diagnostic Probes...
              </p>
              <p className="text-xs text-[var(--ink-3)]">
                Analyzing domain invariants and edge cases to test your exact frontier of competence.
              </p>
            </div>
          )}

          {step === 'answering' && currentQ && (
            <div className="space-y-4 animate-fade-in">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)]">
                <span>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="capitalize text-[var(--advisor)] font-bold">
                  {currentQ.type.replace('_', ' ')}
                </span>
              </div>

              <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--advisor)] h-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
                <p className="font-bold text-sm sm:text-base text-[var(--ink)] m-0 leading-relaxed font-sans">
                  {currentQ.question}
                </p>
                <p className="text-[11px] text-[var(--ink-3)] m-0 font-mono">
                  💡 <em>Why we ask: {currentQ.contextReason}</em>
                </p>
              </div>

              {/* Suggested Options */}
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

              {/* Custom Voice/Text Input */}
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

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
                <button
                  onClick={() => {
                    if (currentQIndex > 0) {
                      setCurrentQIndex((prev) => prev - 1);
                      setCurrentAnswerText(answers[currentQIndex - 1] || '');
                    }
                  }}
                  disabled={currentQIndex === 0}
                  className="ghost-btn disabled:opacity-30"
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={!currentAnswerText.trim() && !answers[currentQIndex]}
                  className="accent-btn"
                  style={{ padding: '8px 18px', borderRadius: '10px' }}
                >
                  <span>{currentQIndex === questions.length - 1 ? 'Analyze & Calibrate →' : 'Next Question →'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 'evaluating' && (
            <div className="py-12 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-[var(--advisor)] mx-auto" />
              <p className="font-bold text-sm text-[var(--ink)]">
                Synthesizing Your Competence Profile...
              </p>
              <p className="text-xs text-[var(--ink-3)]">
                Calibrating your true baseline, separating buzzwords from core invariants, and mapping gap-filling modules.
              </p>
            </div>
          )}

          {step === 'profile_ready' && assessment && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-2))] border-2 border-[var(--advisor)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[var(--advisor)]" />
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

              {/* Strengths & Gaps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Confirmed Strengths */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Confirmed Strengths (Skip Re-teaching):</span>
                  </div>
                  <div className="space-y-1 text-xs text-[var(--ink)]">
                    {assessment.masteredStrengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Gaps */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
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

              {/* Recommended Cut List */}
              {assessment.recommendedCutList && assessment.recommendedCutList.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
                  <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                    ✂️ Tailored Cut-List for Your Level:
                  </div>
                  <div className="space-y-1 text-xs text-[var(--ink-2)]">
                    {assessment.recommendedCutList.map((c, idx) => (
                      <p key={idx} className="m-0">
                        🚫 {c}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Launch Action */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={() => loadDiagnosticQuestions(topic)}
                  className="ghost-btn"
                >
                  <RotateCcw size={13} />
                  <span>Re-test</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalLaunch}
                  disabled={isBuildingCurriculum}
                  className="accent-btn"
                  style={{ padding: '10px 22px', borderRadius: '12px', fontSize: '13px' }}
                >
                  {isBuildingCurriculum ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Synthesizing Adaptive Curriculum...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Launch Calibrated Journey →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
