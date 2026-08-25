import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  GraduationCap,
  Target,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateCurriculumWithAI } from '../../services/gemini';

export const AdvisorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!activeJourney) return null;

  const { advisorData } = activeJourney;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    addChatMessage('advisor', { sender: 'user', content: userMsg, persona: 'advisor' });
    setIsLoading(true);

    try {
      const history = advisorData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const reply = await chatWithPersona('advisor', activeJourney, userMsg, history);
      addChatMessage('advisor', { sender: 'assistant', content: reply, persona: 'advisor' });
    } catch (err: any) {
      addChatMessage('advisor', {
        sender: 'assistant',
        content: `⚠️ Error communicating with Advisor: ${err.message || 'Check API key or connection.'}`,
        persona: 'advisor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckpoint = (phaseId: string) => {
    updateActiveJourney((prev) => {
      const updatedPhases = prev.advisorData.phases.map((p) => {
        if (p.id === phaseId) {
          const newCheckpointState = !p.checkpoint.completed;
          return {
            ...p,
            checkpoint: { ...p.checkpoint, completed: newCheckpointState },
            completed: newCheckpointState
          };
        }
        return p;
      });
      return {
        ...prev,
        advisorData: { ...prev.advisorData, phases: updatedPhases }
      };
    });
  };

  const handleRegenerateCurriculum = async () => {
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

  const quickPrompts = [
    'What should I prioritize this week?',
    'How do I test if I have mastered Phase 1?',
    'Should I skip or learn framework X?',
    'Review my progress against my destination'
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 border border-hairline p-6 md:p-8 shadow-card">
        <div className="pointer-events-none absolute -top-[40%] -left-[10%] w-[60%] h-[180%] bg-[radial-gradient(circle,rgba(94,184,245,0.14),transparent_65%)]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-advisor/8 text-advisor border border-advisor/30 text-[11px] font-mono tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-advisor" />
                A — ACADEMIC ADVISOR
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeJourney.hoursPerWeek} hrs/week
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Depth: <span className="capitalize text-slate-300 font-medium">{activeJourney.depth}</span>
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              {activeJourney.topic}
            </h1>
            <div className="flex items-start gap-2 text-slate-300 text-sm pt-1">
              <Target className="w-4 h-4 text-tutor flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase font-mono text-slate-500 tracking-wider mr-1">
                  Destination:
                </span>
                <span>{activeJourney.destination}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRegenerateCurriculum}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-3 hover:border-advisor/40 text-slate-100 hover:text-advisor border border-hairline-strong text-xs font-semibold transition disabled:opacity-50 flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Regenerate syllabus &amp; cut list</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Curriculum & Cut List, Right: Strategy Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Syllabus & The Cut List */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Strategic Overview */}
          {advisorData.overview && (
            <div className="bg-surface-2 border border-hairline rounded-2xl p-5 shadow-card">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Advisor strategic brief
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {advisorData.overview}
              </p>
            </div>
          )}

          {/* 1. Milestone Roadmap / Curriculum Phases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-advisor" />
                <h2 className="font-display text-lg font-semibold text-white">Curriculum roadmap</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {advisorData.phases.filter((p) => p.completed).length} of {advisorData.phases.length} phases complete
              </span>
            </div>

            <div className="space-y-4">
              {advisorData.phases.map((phase) => (
                <div
                  key={phase.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    phase.completed
                      ? 'bg-surface-1 border-tutor/25 shadow-card'
                      : 'bg-surface-1 border-hairline shadow-card hover:border-hairline-strong'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full font-mono text-xs flex items-center justify-center border ${
                        phase.completed
                          ? 'bg-tutor/15 text-tutor border-tutor/35'
                          : 'bg-white/[0.03] text-slate-400 border-hairline-strong'
                      }`}>
                        {phase.phaseNumber}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">{phase.title}</h3>
                        <span className="text-xs text-advisor font-mono">{phase.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCheckpoint(phase.id)}
                      className="p-1 text-slate-500 hover:text-tutor transition"
                      title={phase.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {phase.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-tutor fill-tutor/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3 pl-[34px]">
                    {phase.objective}
                  </p>

                  {/* Core Concept Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 pl-[34px]">
                    {phase.coreConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white/[0.03] border border-hairline text-slate-300 rounded-md text-[11px] font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>

                  {/* Checkpoint Deliverable */}
                  {phase.checkpoint && (
                    <div
                      onClick={() => toggleCheckpoint(phase.id)}
                      className={`ml-[34px] cursor-pointer rounded-lg rounded-l-none border border-l-2 p-3 text-xs transition flex items-start gap-2.5 ${
                        phase.checkpoint.completed
                          ? 'bg-surface-2 border-hairline border-l-tutor/60 text-tutor'
                          : 'bg-surface-2 border-hairline border-l-advisor/50 text-slate-300 hover:border-hairline-strong'
                      }`}
                    >
                      <div className="mt-0.5">
                        {phase.checkpoint.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-tutor" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <span>Checkpoint: {phase.checkpoint.title}</span>
                          <span className="text-[10px] font-mono uppercase tracking-wide text-tutor/80">Proof of work</span>
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-normal">
                          {phase.checkpoint.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. The CUT LIST (Crucial Sandeep Swadia Feature) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-editor" />
              <div>
                <h2 className="font-display text-lg font-semibold text-white flex flex-wrap items-center gap-2">
                  The cut list
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-editor/8 text-editor border border-editor/30">
                    Sandeep Swadia rule
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ruthlessly eliminate low-signal tutorials, obsolete tech, and vanity topics to prevent cognitive fatigue.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {advisorData.cutList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg rounded-l-none bg-surface-1 border border-hairline border-l-2 border-l-editor/50 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2 text-slate-100 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-editor flex-shrink-0" />
                    <span>Do not learn: {item.topic}</span>
                  </div>

                  <div className="text-xs text-slate-400 pl-6 space-y-1.5">
                    <p>
                      <strong className="text-slate-200 font-semibold">Why skip —</strong> {item.reasonToSkip}
                    </p>
                    <p>
                      <strong className="text-tutor font-semibold">High-leverage alternative —</strong>{' '}
                      <span className="text-slate-200">{item.alternativeFocus}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Socratic Strategy Chat */}
        <div className="lg:col-span-5 flex flex-col h-[560px] lg:h-[780px] lg:sticky lg:top-20 bg-surface-2 border border-hairline rounded-2xl shadow-lift overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-advisor/15 border border-advisor/30 flex items-center justify-center text-advisor flex-shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Academic advisor office hours</h3>
                <p className="text-[11px] text-slate-500">Strategy, curriculum adjustments &amp; prioritizations</p>
              </div>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {advisorData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-advisor/15 border border-advisor/30 flex items-center justify-center text-advisor flex-shrink-0 text-xs font-mono font-semibold">
                    A
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-advisor text-slate-950 font-medium rounded-tr-none'
                      : 'bg-surface-1 border border-hairline text-slate-200 rounded-tl-none'
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                  <div className={`text-[10px] text-right mt-1.5 opacity-70 ${msg.sender === 'user' ? 'text-slate-950/70' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-advisor text-xs">
                <div className="w-7 h-7 rounded-lg bg-advisor/15 border border-advisor/30 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Advisor is reviewing your strategy...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-hairline flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-surface-1 border border-hairline hover:border-advisor/40 hover:text-advisor px-2.5 py-1.5 rounded-full transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-hairline flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask your Advisor about syllabus, pacing, or bottlenecks..."
              className="flex-1 bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-advisor transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-lg bg-advisor hover:brightness-110 text-slate-950 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
