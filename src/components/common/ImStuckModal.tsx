import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  Clock,
  Code2,
  Scissors,
  Flame,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Play,
  RotateCcw
} from 'lucide-react';
import { triageStuckStudentWithAI } from '../../services/gemini';
import { VoiceInputButton } from './VoiceInputButton';
import { StuckTriageResult } from '../../types/alter';

interface ImStuckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImStuckModal: React.FC<ImStuckModalProps> = ({ isOpen, onClose }) => {
  const { activeJourney } = useJourney();
  const [blockerCategory, setBlockerCategory] = useState<string>('Overwhelmed by Scope & Next Steps');
  const [blockerDetails, setBlockerDetails] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<StuckTriageResult | null>(null);
  const [copiedScaffold, setCopiedScaffold] = useState(false);

  // 5-minute sprint timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 mins

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  if (!isOpen || !activeJourney) return null;

  const currentPhase = activeJourney.advisorData.phases.find((p) => !p.completed) || activeJourney.advisorData.phases[0];
  const currentConcept = currentPhase?.coreConcepts?.[0] || activeJourney.topic;

  const handleTriage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTriaging(true);
    setTriageResult(null);

    try {
      const result = await triageStuckStudentWithAI(
        activeJourney.topic,
        currentPhase?.title || 'Foundations',
        currentConcept,
        blockerCategory,
        blockerDetails || 'Feeling friction and stalling on next step.'
      );
      setTriageResult(result);
    } catch (err) {
      console.error('Triage failed', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleCopyScaffold = () => {
    if (!triageResult?.starterScaffold) return;
    navigator.clipboard.writeText(triageResult.starterScaffold);
    setCopiedScaffold(true);
    setTimeout(() => setCopiedScaffold(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface-1)] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6 text-[var(--ink)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-amber-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span>Momentum SOS · Dean of Acceleration</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] m-0">
                Break Through the Block &amp; Get Unstuck
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

        {/* Diagnostic Form */}
        {!triageResult ? (
          <form onSubmit={handleTriage} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-2">
                What is causing friction or slowing you down right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'Overwhelmed by Scope & Next Steps', icon: '🧱', label: 'Overwhelmed by Scope', sub: "Don't know the exact 1st step" },
                  { id: 'Confusing Technical Bug or Concept', icon: '🐛', label: 'Technical Bug / Concept', sub: 'Stuck on syntax or logic error' },
                  { id: 'Procrastination & Low Energy', icon: '⌛', label: 'Procrastination / Drift', sub: 'Losing motivation & focus' },
                  { id: 'Blank Page Paralysis', icon: '✍️', label: 'Blank Page Paralysis', sub: 'Need a starter scaffold/template' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setBlockerCategory(item.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      blockerCategory === item.id
                        ? 'bg-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-2))] border-[var(--advisor)] text-[var(--ink)] font-semibold shadow-xs'
                        : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--hairline-strong)]'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-[var(--ink)]">{item.label}</div>
                      <div className="text-[11px] text-[var(--ink-3)] m-0">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">
                  Specific Details (What were you trying to build or solve?):
                </label>
                <VoiceInputButton
                  onTranscript={(transcript) =>
                    setBlockerDetails((prev) => (prev ? `${prev} ${transcript}` : transcript))
                  }
                />
              </div>
              <textarea
                placeholder="e.g. I'm trying to write the first paragraph of my landing page / I don't know how to wire the sensor data to C++ / I keep putting off starting Phase 1..."
                value={blockerDetails}
                onChange={(e) => setBlockerDetails(e.target.value)}
                rows={3}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="ghost-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTriaging}
                className="accent-btn"
                style={{ padding: '10px 20px', borderRadius: '12px' }}
              >
                {isTriaging ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Analyzing Bottleneck...</span>
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    <span>Unblock Me in 5 Minutes →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Triage Result Prescription */
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Blocker Diagnostic */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>Root Diagnostic:</span>
              </div>
              <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans font-medium">
                {triageResult.blockerSummary}
              </p>
            </div>

            {/* 1. The 5-Minute Micro-Action */}
            <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-2))] border-2 border-[var(--advisor)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[11px] uppercase font-bold text-[var(--advisor)] flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Your 5-Minute Micro-Step (Immediate Friction-Free Win)</span>
                </div>

                {/* 5-Min Timer Button */}
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    isTimerRunning
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-[var(--surface-3)] text-[var(--ink)] border border-[var(--hairline-strong)]'
                  }`}
                >
                  <Flame size={12} />
                  <span>{isTimerRunning ? `Sprint Timer: ${formatTime(secondsRemaining)}` : 'Start 5-Min Sprint'}</span>
                </button>
              </div>

              <p className="text-sm font-bold text-[var(--ink)] m-0 leading-relaxed font-sans">
                {triageResult.microAction5Min}
              </p>
            </div>

            {/* 2. Starter Scaffold / Template */}
            {triageResult.starterScaffold && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)] flex items-center gap-1.5">
                    <Code2 size={14} />
                    <span>Starter Scaffold (Zero Blank Page):</span>
                  </div>
                  <button
                    onClick={handleCopyScaffold}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-[11px] font-medium text-[var(--ink)] transition flex items-center gap-1"
                  >
                    {copiedScaffold ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedScaffold ? 'Copied!' : 'Copy Scaffold'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-[var(--void)] rounded-lg text-[11px] font-mono text-[var(--ink-2)] overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                  {triageResult.starterScaffold}
                </pre>
              </div>
            )}

            {/* 3. The 80% Complexity Cut */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
              <div className="font-mono text-[11px] uppercase font-bold text-[var(--editor)] flex items-center gap-1.5">
                <Scissors size={13} />
                <span>What to Completely Ignore Right Now (Cut List):</span>
              </div>
              <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                {triageResult.complexityReductionCut}
              </p>
            </div>

            {/* Mindset Reframing */}
            <p className="text-[11.5px] italic text-[var(--ink-3)] text-center m-0 pt-1">
              "{triageResult.mindsetReframing}"
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
              <button
                onClick={() => setTriageResult(null)}
                className="ghost-btn"
              >
                <RotateCcw size={12} />
                <span>Try Different Blocker</span>
              </button>

              <button
                onClick={onClose}
                className="accent-btn"
                style={{ padding: '10px 22px', borderRadius: '12px' }}
              >
                <CheckCircle2 size={14} />
                <span>I'm Back on Track! Let's Build →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
