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
import { generateCurriculumWithAI, chatWithPersona } from '../../services/gemini';
import { dispatchWebhookEvent } from '../../services/webhooks';

export const AdvisorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage, setActivePersona, navigateToTutorConcept } = useJourney();
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  if (!activeJourney) return null;

  const { advisorData } = activeJourney;

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

  const handleRegenerateCurriculum = async () => {
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
      updateActiveJourney((prev) => ({
        ...prev,
        advisorData: {
          ...newAdvisorData,
          chatHistory: prev.advisorData.chatHistory
        }
      }));
    } catch (err) {
      console.error('Failed to regenerate curriculum', err);
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
            <button
              onClick={handleRegenerateCurriculum}
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
          <p className="hero-sub">
            {activeJourney.destination}. {activeJourney.hoursPerWeek} hrs/week · Depth:{' '}
            <span className="capitalize font-medium text-[var(--ink)]">{activeJourney.depth}</span>.
          </p>
        </div>

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

        {/* Diagnostic Calibration Profile Card */}
        {activeJourney.diagnosticAssessment && (
          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-[var(--advisor)]" />
                <span className="font-bold text-xs text-[var(--ink)]">
                  🎯 Your Calibrated Learning Strategy &amp; Starting Level
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[var(--advisor)]/20 text-[var(--advisor)] px-2 py-0.5 rounded font-bold">
                {activeJourney.diagnosticAssessment.actualBaselineAssessment}
              </span>
            </div>

            <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed font-sans">
              {activeJourney.diagnosticAssessment.whyCustomizedExplanation || 'Curriculum custom-tailored to bridge your exact knowledge gaps.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeJourney.diagnosticAssessment.addedCoursesReason && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="font-bold font-mono text-[10px] block mb-0.5">🟢 ADDED TO FILL GAPS:</span>
                  <span className="text-[11.5px] leading-snug">{activeJourney.diagnosticAssessment.addedCoursesReason}</span>
                </div>
              )}
              {activeJourney.diagnosticAssessment.subtractedCoursesReason && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="font-bold font-mono text-[10px] block mb-0.5">🟡 CUT OUT TO SAVE TIME:</span>
                  <span className="text-[11.5px] leading-snug">{activeJourney.diagnosticAssessment.subtractedCoursesReason}</span>
                </div>
              )}
            </div>
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
                Phase {activePhase.phaseNumber}: {activePhase.title}
              </h3>
              <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed max-w-xl font-sans">
                Next goal: Master <strong>{activePhase.coreConcepts?.[0] || 'core foundations'}</strong> &amp; complete the <em>{activePhase.checkpoint?.title || 'project milestone deliverable'}</em>.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => handleStartPhaseBriefing(activePhase)}
                className="accent-btn"
                style={{ padding: '8px 14px', borderRadius: '10px' }}
                title="Get custom step-by-step briefing from your Advisor"
              >
                <Sparkles size={13} />
                <span>Advisor Briefing</span>
              </button>
            </div>
          </div>
        )}

        {/* Strategic Overview Brief */}
        {advisorData.overview && (
          <div className="card">
            <p className="card-label">Advisor strategic brief</p>
            <p className="hero-sub" style={{ maxWidth: 'none' }}>
              {advisorData.overview}
            </p>
          </div>
        )}

        {/* Chronological Curriculum Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[var(--advisor)]" />
              <h3 className="font-display font-semibold text-base text-[var(--ink)] m-0">
                Curriculum Phases &amp; Action Playbooks
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--ink-3)]">
              {advisorData.phases.filter((p) => p.completed).length} / {advisorData.phases.length} Phases Mastered
            </span>
          </div>

          {advisorData.phases.map((phase) => {
            const isActive = phase.id === activePhase?.id;
            const isCompleted = phase.completed;
            const isSelected = phase.id === currentFocusedPhaseId;

            return (
              <div
                key={phase.id}
                className={`card transition-all ${
                  isActive
                    ? 'border-[var(--advisor)] shadow-md bg-[var(--surface-1)]'
                    : isCompleted
                    ? 'border-[var(--tutor)]/50 bg-[var(--surface-1)]/70'
                    : 'border-[var(--hairline)] bg-[var(--surface-1)]'
                }`}
                style={{
                  borderLeft: isCompleted
                    ? '4px solid var(--tutor)'
                    : isActive
                    ? '4px solid var(--advisor)'
                    : '4px solid var(--hairline-strong)'
                }}
              >
                {/* Phase Header */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--hairline)]">
                      Phase {phase.phaseNumber}
                    </span>
                    <h4 className="m-0 font-display font-bold text-base text-[var(--ink)]">
                      {phase.title}
                    </h4>

                    {isActive && (
                      <span className="text-[10.5px] font-mono uppercase bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] text-[var(--advisor)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] px-2 py-0.5 rounded-full font-bold">
                        ● Current Focus
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-[10.5px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Check size={11} strokeWidth={3} /> Verified Mastered
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleCheckpoint(phase.id)}
                    className="p-1.5 text-[var(--ink-3)] hover:text-[var(--tutor)] transition cursor-pointer bg-transparent border-none"
                    title={isCompleted ? 'Mark phase incomplete' : 'Mark phase complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-[var(--tutor)]" />
                    ) : (
                      <Circle size={20} className="text-[var(--ink-3)] hover:text-[var(--ink-2)]" />
                    )}
                  </button>
                </div>

                <p className="source-row" style={{ marginTop: '2px', marginBottom: '8px' }}>
                  ⏱️ {phase.duration} · {phase.objective}
                </p>

                {/* Tangible Asset Preview */}
                {(phase.tangibleAsset || phase.checkpoint?.tangibleAsset) && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_10%,var(--surface-2))] border border-[color-mix(in_srgb,var(--advisor)_22%,transparent)] flex items-center gap-2.5 text-xs text-[var(--ink)]">
                    <div className="w-6 h-6 rounded-lg bg-[var(--advisor)]/20 text-[var(--advisor)] flex items-center justify-center flex-shrink-0">
                      <Package size={13} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[var(--advisor)] block">
                        Tangible Proof-of-Work Asset Created in this Phase:
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {phase.tangibleAsset || phase.checkpoint?.tangibleAsset}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4-Step Action Playbook */}
                <div className="mt-4 pt-4 border-t border-[var(--hairline)] space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
                    Phase {phase.phaseNumber} Learning Action Playbook:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {/* Action 1: Read Sources */}
                    <button
                      onClick={() => setActivePersona('librarian')}
                      className="p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--librarian)] text-left transition flex items-start gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[color-mix(in_srgb,var(--librarian)_12%,transparent)] border border-[color-mix(in_srgb,var(--librarian)_25%,transparent)] text-[var(--librarian)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--ink)] flex items-center justify-between">
                          <span>1. Study Grounded Sources</span>
                          <ArrowRight size={12} className="text-[var(--librarian)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[var(--ink-2)] m-0 mt-0.5">
                          Open curated top 1% books &amp; papers in Librarian
                        </p>
                      </div>
                    </button>

                    {/* Action 2: Practice Concepts */}
                    <button
                      onClick={() => {
                        if (phase.coreConcepts?.[0]) {
                          navigateToTutorConcept(phase.coreConcepts[0]);
                        } else {
                          setActivePersona('tutor');
                        }
                      }}
                      className="p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--tutor)] text-left transition flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[color-mix(in_srgb,var(--tutor)_12%,transparent)] border border-[color-mix(in_srgb,var(--tutor)_25%,transparent)] text-[var(--tutor)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <GraduationCap size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--ink)] flex items-center justify-between">
                          <span>2. Zero-to-Hero Masterclass</span>
                          <ArrowRight size={12} className="text-[var(--tutor)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[var(--ink-2)] m-0 mt-0.5 truncate max-w-[200px]">
                          Master: {phase.coreConcepts?.[0] || 'Core concepts'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Core Concept Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-mono text-[var(--ink-3)] mr-1">Core Lessons:</span>
                    {(phase.coreConcepts || []).map((concept, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigateToTutorConcept(concept);
                        }}
                        className="px-2.5 py-1 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] hover:border-[var(--tutor)] border border-[var(--hairline)] text-[var(--ink)] rounded-lg text-[11px] font-mono transition flex items-center gap-1.5 font-medium shadow-2xs cursor-pointer group"
                        title={`Click to have Professor teach you "${concept}" from first principles`}
                      >
                        <GraduationCap size={11} className="text-[var(--tutor)] group-hover:scale-110 transition-transform" />
                        <span>Teach Me: {concept}</span>
                        <ArrowRight size={10} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                      </button>
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
              <span className="text-[10px] font-mono uppercase bg-[color-mix(in_srgb,var(--advisor)_10%,transparent)] text-[var(--advisor)] border border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                <Globe size={10} /> Live Grounded
              </span>
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
