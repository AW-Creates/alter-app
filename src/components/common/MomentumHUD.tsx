import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Play
} from 'lucide-react';
import { ImStuckModal } from './ImStuckModal';

export const MomentumHUD: React.FC = () => {
  const { activeJourney, setActivePersona } = useJourney();
  const [isStuckModalOpen, setIsStuckModalOpen] = useState(false);

  if (!activeJourney) return null;

  const { advisorData, streakDays } = activeJourney;
  const phases = advisorData.phases || [];
  const activePhase = phases.find((p) => !p.completed) || phases[0];
  const completedPhasesCount = phases.filter((p) => p.completed).length;

  // Next tangible deliverable text
  const nextTangibleAsset =
    activePhase?.checkpoint?.tangibleAsset ||
    activePhase?.tangibleAsset ||
    activePhase?.checkpoint?.title ||
    'Phase 1 Milestone Deliverable';

  return (
    <>
      <div className="w-full bg-[var(--surface-1)] border-b border-[var(--hairline)] px-4 py-3 sm:px-6 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Next Tangible Milestone Horizon */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[color-mix(in_srgb,var(--advisor)_20%,transparent)] to-[color-mix(in_srgb,var(--tutor)_10%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-[var(--advisor)] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
              <Package size={17} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase bg-[color-mix(in_srgb,var(--advisor)_12%,transparent)] text-[var(--advisor)] border border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] px-2 py-0.5 rounded font-bold">
                  Next Tangible Deliverable Ahead
                </span>
                <span className="text-xs font-mono text-[var(--ink-3)] hidden sm:inline">
                  Phase {activePhase?.phaseNumber || 1} of {phases.length}
                </span>
              </div>

              <div className="text-xs sm:text-sm font-bold text-[var(--ink)] flex items-center gap-1.5 flex-wrap">
                <span>In reach:</span>
                <span className="text-[var(--advisor)] underline decoration-dotted font-display font-semibold">
                  {nextTangibleAsset}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Milestone Asset Pipeline */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
            {phases.map((p, idx) => {
              const isCompleted = p.completed;
              const isCurrent = p.id === activePhase?.id;

              return (
                <React.Fragment key={p.id}>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                        : isCurrent
                        ? 'bg-[var(--surface-2)] border-[var(--advisor)] text-[var(--ink)] font-bold shadow-xs'
                        : 'bg-[var(--surface-2)]/60 border-[var(--hairline)] text-[var(--ink-3)]'
                    }`}
                    title={p.tangibleAsset || p.title}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--advisor)] animate-pulse" />
                    ) : (
                      <Lock size={11} className="opacity-50" />
                    )}
                    <span className="truncate max-w-[110px]">P{p.phaseNumber}: {p.checkpoint?.title || p.title}</span>
                  </div>

                  {idx < phases.length - 1 && (
                    <span className="text-[var(--hairline-strong)] text-xs">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Right: Streak & Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-shrink-0">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-xs font-mono font-bold text-amber-500 shadow-2xs">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>{streakDays || 1}d Streak</span>
            </div>

            {/* Quick Unblocker / SOS Button */}
            <button
              onClick={() => setIsStuckModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Click if you're stuck, procrastinating, or overwhelmed"
            >
              <Zap size={13} className="animate-pulse" />
              <span>I'm Stuck</span>
            </button>

            {/* Continue Masterclass Action */}
            <button
              onClick={() => setActivePersona('tutor')}
              className="accent-btn"
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px' }}
            >
              <Play size={11} fill="currentColor" />
              <span>Continue Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Anti-Procrastination Triage Modal */}
      <ImStuckModal
        isOpen={isStuckModalOpen}
        onClose={() => setIsStuckModalOpen(false)}
      />
    </>
  );
};
