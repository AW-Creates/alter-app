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
  const { activeJourney, setActivePersona, navigateToTutorConcept, setIsOnboardingTourOpen } = useJourney();
  const [isStuckModalOpen, setIsStuckModalOpen] = useState(false);

  if (!activeJourney) return null;

  const { advisorData, streakDays } = activeJourney;
  const phases = advisorData?.phases || [];
  const totalPhasesCount = phases.length > 0 ? phases.length : 3;
  const activePhase = phases.find((p) => !p.completed) || phases[0];
  const activeCourse = activePhase?.courses?.[0] || {
    title: activePhase?.coreConcepts?.[0] || 'Core Fundamentals',
    courseNumber: `${activePhase?.phaseNumber || 1}.1`
  };

  // Next tangible deliverable text
  const nextTangibleAsset =
    activePhase?.checkpoint?.tangibleAsset ||
    activePhase?.tangibleAsset ||
    activePhase?.checkpoint?.title ||
    'Phase 1 Milestone Deliverable';

  const handleStartMission = () => {
    if (activeCourse?.title) {
      navigateToTutorConcept(activeCourse.title);
    } else {
      setActivePersona('tutor');
    }
  };

  return (
    <>
      <div className="w-full bg-[var(--surface-1)] border-b border-[var(--hairline)] px-4 py-2.5 sm:px-6 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Next Tangible Milestone Horizon */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[color-mix(in_srgb,var(--advisor)_20%,transparent)] to-[color-mix(in_srgb,var(--tutor)_15%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-[var(--advisor)] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
              <Package size={17} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] text-[var(--advisor)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <Play size={9} fill="currentColor" />
                  Active Mission
                </span>
                <span className="text-xs font-mono text-[var(--ink-3)] hidden sm:inline">
                  Phase {activePhase?.phaseNumber || 1} of {totalPhasesCount}
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

          {/* Center: 4-Stage Collegiate Learning Loop Pipeline */}
          <div className="hidden xl:flex items-center gap-2 bg-[var(--surface-2)]/70 px-3 py-1 rounded-xl border border-[var(--hairline)] text-[11px] font-mono">
            <button
              onClick={() => setActivePersona('advisor')}
              className="flex items-center gap-1 text-[var(--advisor)] hover:underline font-bold"
            >
              <span>1. Advisor Plan</span>
            </button>
            <span className="text-[var(--ink-3)]">➔</span>
            <button
              onClick={() => setActivePersona('librarian')}
              className="flex items-center gap-1 text-[var(--librarian)] hover:underline font-bold"
            >
              <span>2. Sources</span>
            </button>
            <span className="text-[var(--ink-3)]">➔</span>
            <button
              onClick={handleStartMission}
              className="flex items-center gap-1 text-[var(--tutor)] hover:underline font-bold animate-pulse"
            >
              <span>3. Tutor Lesson</span>
            </button>
            <span className="text-[var(--ink-3)]">➔</span>
            <button
              onClick={() => setActivePersona('editor')}
              className="flex items-center gap-1 text-[var(--editor)] hover:underline font-bold"
            >
              <span>4. Editor Polish</span>
            </button>
          </div>

          {/* Right: Streak, Guide Tour, Stuck & Direct Start CTA */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-shrink-0 flex-wrap">
            {/* Guide Tour Opener */}
            <button
              onClick={() => setIsOnboardingTourOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs text-[var(--ink-2)] hover:text-[var(--ink)] font-medium transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="View Interactive Altor Walkthrough"
            >
              <HelpCircle size={13} className="text-[var(--advisor)]" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-xs font-mono font-bold text-amber-500 shadow-2xs">
              <Flame size={13} className="text-amber-500 fill-amber-500" />
              <span>{streakDays || 1}d Streak</span>
            </div>

            {/* Anti-Procrastination SOS Button */}
            <button
              onClick={() => setIsStuckModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Click if stuck or overwhelmed"
            >
              <Zap size={12} className="animate-pulse" />
              <span>I'm Stuck</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handleStartMission}
              className="accent-btn cursor-pointer"
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px' }}
            >
              <Play size={11} fill="currentColor" />
              <span>
                Start Course {activeCourse.courseNumber || '1.1'} →
              </span>
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
