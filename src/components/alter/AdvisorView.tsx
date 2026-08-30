import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  GraduationCap,
  Calendar,
  Layers,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Compass,
  ArrowRight,
  Loader2,
  Globe,
  BookOpen,
  Lightbulb,
  FileEdit,
  Play,
  Flame,
  Check,
  Package,
  Target
} from 'lucide-react';
import { generateCurriculumWithAI, chatWithPersona, hasActiveApiKey, getGenerationTier, getSharedRemainingCount } from '../../services/gemini';
import { dispatchWebhookEvent } from '../../services/webhooks';

export const AdvisorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage, setActivePersona, navigateToTutorConcept, setIsOnboardingTourOpen } = useJourney();
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenConfirmModal, setShowRegenConfirmModal] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  if (!activeJourney) return null;

  const { advisorData } = activeJourney;

  // Count completed checkpoints
  const completedCount = advisorData.phases.filter((p) => p.completed).length;

  // Identify active phase: first incomplete phase, or the first phase
  const activePhase = advisorData.phases.find((p) => !p.completed) || advisorData.phases[0];
  const currentFocusedPhaseId = selectedPhaseId || activePhase?.id || advisorData.phases[0]?.id;

  // Toggle completion of a milestone checkpoint
  const toggleCheckpoint = (phaseId: string) => {
    updateActiveJourney((prev) => {
      let newlyCompletedPhase: any = null;
      const updatedPhases = prev.advisorData.phases.map((p) => {
        if (p.id === phaseId) {
          const completed = !p.completed;
          if (completed) {
            newlyCompletedPhase = p;
          }
          return {
            ...p,
            completed,
            checkpoint: {
              ...p.checkpoint,
              completed
            }
          };
        }
        return p;
      });

      if (newlyCompletedPhase) {
        dispatchWebhookEvent('checkpoint_completed', prev.topic, {
          phaseNumber: newlyCompletedPhase.phaseNumber,
          phaseTitle: newlyCompletedPhase.title,
          checkpointTitle: newlyCompletedPhase.checkpoint?.title || 'Checkpoint',
          checkpointDescription: newlyCompletedPhase.checkpoint?.description || '',
          streakDays: prev.streakDays
        });
      }

      return {
        ...prev,
        advisorData: {
          ...prev.advisorData,
          phases: updatedPhases
        }
      };
    });
  };

  // Office hours chat with Advisor
  const handleSendMessage = async (customMessage?: string) => {
    const text = customMessage || chatInput;
    if (!text.trim() || isSending) return;

    addChatMessage('advisor', { sender: 'user', content: text.trim(), persona: 'advisor' });

    if (!customMessage) setChatInput('');
    setIsSending(true);

    try {
      const history = advisorData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const replyContent = await chatWithPersona(
        'advisor',
        activeJourney,
        text.trim(),
        history
      );

      addChatMessage('advisor', { sender: 'assistant', content: replyContent, persona: 'advisor' });
    } catch (err: any) {
      console.error('Chat error', err);
      addChatMessage('advisor', {
        sender: 'assistant',
        content: `⚠️ Office hours connection error: ${err.message || 'Check connection.'}`,
        persona: 'advisor'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTriggerRegenerate = () => {
    if (completedCount > 0) {
      setShowRegenConfirmModal(true);
    } else {
      executeRegenerate(false);
    }
  };

  const executeRegenerate = async (preserveProgress: boolean) => {
    setShowRegenConfirmModal(false);
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const newAdvisorData = await generateCurriculumWithAI(
        activeJourney.topic,
        activeJourney.destination,
        activeJourney.baseline,
        activeJourney.hoursPerWeek,
        activeJourney.depth
      );

      updateActiveJourney((prev) => {
        let finalPhases = newAdvisorData.phases;
        if (preserveProgress) {
          // Carry over completed status for matching phase numbers
          finalPhases = newAdvisorData.phases.map((newP, idx) => {
            const oldP = prev.advisorData.phases[idx];
            if (oldP && oldP.completed) {
              return {
                ...newP,
                completed: true,
                checkpoint: {
                  ...newP.checkpoint,
                  completed: true
                }
              };
            }
            return newP;
          });
        }

        return {
          ...prev,
          advisorData: {
            ...newAdvisorData,
            phases: finalPhases,
            chatHistory: prev.advisorData.chatHistory
          }
        };
      });
    } catch (err) {
      console.error('Failed to regenerate syllabus', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStartPhaseBriefing = (phase: any) => {
    const briefingPrompt = `Advisor, I am ready to begin Phase ${phase.phaseNumber}: "${phase.title}". Give me my Day 1 kickoff briefing: What should I study first, what common mistakes should I avoid, and how do I build the "${phase.checkpoint?.title || 'proof of work'}" deliverable?`;
    handleSendMessage(briefingPrompt);
  };

  const quickPrompts = [
    `🚀 "Give me my Day-1 kickoff briefing for Phase ${activePhase?.phaseNumber || 1}"`,
    `💡 "Explain "${activePhase?.coreConcepts?.[0] || 'core foundations'}" in plain English"`,
    `🔨 "How should I structure my Phase ${activePhase?.phaseNumber || 1} Proof of Work?"`,
    `⚠️ "What are the common beginner traps in this phase?"`
  ];

  return (
    <div className="layout animate-fade-in">
      {/* Left Column: Hero, Strategic Brief, Phases, Cut List */}
      <div className="space-y-5">
        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="role-chip">
                <span className="dot"></span>
                A — ACADEMIC ADVISOR &amp; DEAN
              </div>
              <h1>{activeJourney.topic}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOnboardingTourOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--advisor)_25%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-[var(--advisor)] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles size={13} />
                <span>🎓 How Altor Works (1-Min Tour)</span>
              </button>
              <button
                onClick={handleTriggerRegenerate}
                disabled={isRegenerating}
                className="ghost-btn"
              >
                {isRegenerating ? (
                  <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Regenerate syllabus</span>
              </button>
            </div>
          </div>
          <p className="hero-sub">
            {activeJourney.destination}. {activeJourney.hoursPerWeek} hrs/week · Depth:{' '}
            <span className="capitalize font-medium text-[var(--ink)]">{activeJourney.depth}</span>.
          </p>
        </div>

        {/* Regeneration Safety Confirmation Modal */}
        {showRegenConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl p-6 text-[var(--ink)] space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)] m-0">Regenerate Syllabus?</h3>
                  <p className="text-xs text-[var(--ink-2)] m-0">You have {completedCount} completed checkpoint{completedCount > 1 ? 's' : ''}.</p>
                </div>
              </div>

              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                Regenerating will redesign your learning path. Would you like to preserve your completed checkpoints or start completely fresh?
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => executeRegenerate(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Preserve Progress (Update Unfinished Phases)</span>
                </button>

                <button
                  onClick={() => executeRegenerate(false)}
                  className="w-full py-2 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-amber-500 font-semibold text-xs border border-[var(--hairline)] transition cursor-pointer"
                >
                  <span>Reset Everything (Start Fresh From Phase 1)</span>
                </button>

                <button
                  onClick={() => setShowRegenConfirmModal(false)}
                  className="w-full py-2 px-4 rounded-xl text-[var(--ink-3)] hover:text-[var(--ink)] text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Phases Mastered Capstone Banner */}
        {advisorData.phases.length > 0 && advisorData.phases.every((p) => p.completed) && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/15 to-[var(--surface-2)] border-2 border-emerald-500/50 shadow-md space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span>🎓</span>
              <span>Curriculum Mastered! Capstone Milestone Complete</span>
            </div>
            <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed font-sans">
              You have completed all {advisorData.phases.length} phases of <strong>{activeJourney.topic}</strong>, validated your milestone deliverables, and mastered the core principles. Ready to publish your capstone project or begin a new domain mastery!
            </p>
          </div>
        )}

        {/* Current Active Mission Banner */}
        {activePhase && !advisorData.phases.every((p) => p.completed) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-1))] to-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-1))] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[var(--advisor)] text-[#04050a] px-2 py-0.5 rounded font-bold">
                  <Play size={10} fill="currentColor" /> Active Mission
                </span>
                <span className="text-xs font-mono text-[var(--ink-3)] font-semibold">
                  Phase {activePhase.phaseNumber} of {advisorData.phases.length}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] m-0">
                {activePhase.title}
              </h3>
              <p className="text-xs text-[var(--ink-2)] line-clamp-1 m-0 font-sans">
                {activePhase.objective}
              </p>
            </div>

            <button
              onClick={() => {
                const firstConcept = activePhase.courses?.[0]?.title || activePhase.coreConcepts?.[0] || 'Core Principles';
                navigateToTutorConcept(firstConcept);
              }}
              className="accent-btn shrink-0"
              style={{ padding: '8px 18px', borderRadius: '10px' }}
            >
              <GraduationCap size={14} />
              <span>Enter Live Socratic Classroom →</span>
            </button>
          </div>
        )}

        {/* Phase List */}
        <div className="space-y-4">
          {advisorData.phases.map((phase) => {
            const isFocused = phase.id === currentFocusedPhaseId;

            return (
              <div
                key={phase.id}
                className={`card transition-all ${
                  isFocused
                    ? 'border-2 border-[var(--advisor)] shadow-md bg-[var(--surface-1)]'
                    : 'border border-[var(--hairline)] hover:border-[var(--hairline-strong)] opacity-90'
                }`}
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--hairline)]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCheckpoint(phase.id)}
                      className="p-1 rounded-lg hover:bg-[var(--surface-2)] transition cursor-pointer text-[var(--advisor)]"
                      title={phase.completed ? 'Mark phase incomplete' : 'Mark phase complete'}
                    >
                      {phase.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--ink-3)]" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[var(--surface-2)] text-[var(--ink-3)] border border-[var(--hairline)] px-2 py-0.5 rounded font-bold">
                          Phase {phase.phaseNumber}
                        </span>
                        <span className="text-xs font-mono text-[var(--ink-3)]">
                          {phase.duration}
                        </span>
                        {phase.completed && (
                          <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-base font-bold text-[var(--ink)] m-0 mt-0.5">
                        {phase.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartPhaseBriefing(phase)}
                      className="ghost-btn text-xs"
                      title="Advisor Kickoff Briefing"
                    >
                      <Sparkles size={12} className="text-[var(--advisor)]" />
                      <span>Advisor Briefing</span>
                    </button>
                  </div>
                </div>

                {/* Phase Objective */}
                <p className="text-xs text-[var(--ink-2)] mt-3 leading-relaxed font-sans m-0">
                  {phase.objective}
                </p>

                {/* Tangible Checkpoint Deliverable Box */}
                {(phase.tangibleAsset || phase.checkpoint?.tangibleAsset) && (
                  <div className="mt-3 p-3 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_10%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] flex items-start gap-2.5">
                    <Package size={16} className="text-[var(--advisor)] shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-[var(--advisor)] block">
                        Tangible Proof-of-Work Asset Created in this Phase:
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {phase.tangibleAsset || phase.checkpoint?.tangibleAsset}
                      </span>
                    </div>
                  </div>
                )}

                {/* Phase Courses Directory */}
                <div className="mt-4 pt-4 border-t border-[var(--hairline)] space-y-3">
                  <div className="space-y-2">
                    {(phase.courses || []).map((course, idx) => (
                      <div
                        key={course.id || idx}
                        className="p-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--tutor)]/60 transition flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--tutor)_14%,transparent)] border border-[color-mix(in_srgb,var(--tutor)_30%,transparent)] text-[var(--tutor)] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {course.courseNumber || `${phase.phaseNumber}.${idx + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--tutor)] transition-colors line-clamp-1">
                              {course.title}
                            </h4>
                            <span className="text-[10px] font-mono text-[var(--ink-3)] shrink-0">
                              ⏱️ {course.estimatedMinutes || 10} min
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[var(--ink-2)] mt-0.5 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <button
                              onClick={() => {
                                navigateToTutorConcept(course.title);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[var(--tutor)] hover:bg-[var(--tutor)]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                              <Play size={11} fill="currentColor" />
                              <span>Start Socratic Lesson →</span>
                            </button>
                            <span className="text-[10px] text-[var(--ink-3)] font-mono">
                              Live 1-on-1 Socratic Classroom
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkpoint Deliverable Box */}
                  {phase.checkpoint && (
                    <div
                      onClick={() => toggleCheckpoint(phase.id)}
                      className={`cursor-pointer rounded-xl p-3.5 border text-xs transition flex items-start gap-3 mt-2 ${
                        phase.checkpoint.completed
                          ? 'bg-[color-mix(in_srgb,var(--tutor)_10%,var(--surface-1))] border-[color-mix(in_srgb,var(--tutor)_35%,transparent)] text-[var(--ink)]'
                          : 'bg-[var(--surface-2)] border-[var(--hairline-strong)] text-[var(--ink)] hover:border-[var(--advisor)]'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {phase.checkpoint.completed ? (
                          <CheckCircle2 size={18} className="text-[var(--tutor)]" />
                        ) : (
                          <Circle size={18} className="text-[var(--ink-3)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--ink)] flex items-center justify-between">
                          <span>3. Phase Checkpoint: {phase.checkpoint.title}</span>
                          <span className="text-[10px] font-mono uppercase bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] px-2 py-0.5 rounded font-bold">
                            {phase.checkpoint.completed ? '✓ Mastered' : 'Proof of Work'}
                          </span>
                        </div>
                        <p className="text-[var(--ink-2)] text-[12px] mt-1 leading-relaxed m-0 font-sans">
                          {phase.checkpoint.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[var(--advisor)] font-medium">
                            {phase.checkpoint.completed
                              ? 'Deliverable verified! Click to uncheck if revising.'
                              : '👉 Click here to mark deliverable complete when finished.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action 4: Editor Audit */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setActivePersona('editor')}
                      className="text-xs font-semibold text-[var(--editor)] hover:underline flex items-center gap-1.5"
                    >
                      <FileEdit size={13} />
                      <span>4. Review and polish your Phase {phase.phaseNumber} project with the Editor →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* The Cut List */}
        {advisorData.cutList && advisorData.cutList.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--editor)]" />
              <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">The Cut List</h3>
              <span className="text-[10px] font-mono uppercase bg-[rgba(234,176,84,0.1)] text-[var(--editor)] border border-[rgba(234,176,84,0.25)] px-1.5 py-0.5 rounded font-semibold">
                Sandeep Swadia Rule
              </span>
              {(() => {
                const tier = getGenerationTier();
                if (tier === 'personal') {
                  return (
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Globe size={10} /> Live Grounded
                    </span>
                  );
                }
                if (tier === 'shared') {
                  return (
                    <span className="text-[10px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/25 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Globe size={10} /> Live Free Tier ({getSharedRemainingCount()}/5)
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-mono uppercase bg-[var(--surface-3)] text-[var(--ink-3)] border border-[var(--hairline)] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Sparkles size={10} /> Curated Baseline
                  </span>
                );
              })()}
            </div>
            <div className="space-y-2.5">
              {advisorData.cutList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-[var(--surface-1)] border border-[rgba(234,176,84,0.25)] p-4 space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 text-[var(--editor)] font-semibold text-xs">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>SKIP: {item.topic}</span>
                  </div>
                  <div className="text-[var(--ink-2)] pl-5 space-y-0.5 text-[11.5px] leading-relaxed">
                    <p className="m-0">
                      <strong className="text-[var(--ink)]">Why:</strong> {item.reasonToSkip}
                    </p>
                    <p className="m-0">
                      <strong className="text-[var(--tutor)] font-semibold">Alternative Focus:</strong>{' '}
                      <span className="text-[var(--ink)]">{item.alternativeFocus}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Sticky Office Hours Chat */}
      <div>
        <div className="sidebar-card">
          <div className="chat-head">
            <div className="chat-avatar">
              <GraduationCap size={16} />
            </div>
            <div>
              <h4>Academic advisor office hours</h4>
              <p>Strategy, pacing &amp; day-1 kickoff</p>
            </div>
          </div>

          <div className="chat-body">
            {/* Proactive Advisor Kickoff Card */}
            {activePhase && advisorData.chatHistory.length <= 1 && (
              <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-br from-[color-mix(in_srgb,var(--advisor)_14%,var(--surface-1))] to-[var(--surface-2)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-xs text-[var(--ink)] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[var(--advisor)]">
                  <Sparkles size={14} />
                  <span>Phase {activePhase.phaseNumber} Ready to Begin</span>
                </div>
                <p className="text-[11.5px] text-[var(--ink-2)] leading-relaxed m-0">
                  Click below to ask your Advisor for your exact Day 1 study sequence, recommended books, and checkpoint blueprint.
                </p>
                <button
                  onClick={() => handleStartPhaseBriefing(activePhase)}
                  className="w-full py-2 rounded-lg bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Play size={11} fill="currentColor" />
                  <span>Start Phase {activePhase.phaseNumber} Kickoff Briefing →</span>
                </button>
              </div>
            )}

            {advisorData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`msg mb-3 ${
                  msg.sender === 'user'
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface-1))]'
                    : ''
                }`}
              >
                <MarkdownRenderer content={msg.content} />
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))}

            {isSending && (
              <div className="msg flex items-center gap-2 text-xs text-[var(--ink-2)] italic">
                <Loader2 size={13} className="animate-spin text-[var(--accent)]" />
                <span>Advisor is preparing your personalized study sequence...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="suggestions">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.replace(/^[^\"]*\"([^\"]+)\".*$/, '$1'))}
                className="sugg text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask your Advisor about starting Phase 1, pacing, or cuts..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || isSending}
              className="accent-btn"
              style={{ padding: '9px 12px', borderRadius: '8px' }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
