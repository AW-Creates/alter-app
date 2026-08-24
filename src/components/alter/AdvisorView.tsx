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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                A — Academic Advisor
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeJourney.hoursPerWeek} hrs/week
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Depth: <span className="capitalize text-indigo-300 font-semibold">{activeJourney.depth}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeJourney.topic}
            </h1>
            <div className="flex items-start gap-2 text-slate-300 text-sm pt-1">
              <Target className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mr-1">
                  Destination:
                </span>
                <span>{activeJourney.destination}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRegenerateCurriculum}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition disabled:opacity-50 flex-shrink-0"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            )}
            <span>Regenerate Syllabus & Cut List</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Curriculum & Cut List, Right: Strategy Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Syllabus & The Cut List */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Strategic Overview */}
          {advisorData.overview && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Advisor Strategic Brief
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
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Curriculum Roadmap</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {advisorData.phases.filter((p) => p.completed).length} of {advisorData.phases.length} Phases Complete
              </span>
            </div>

            <div className="space-y-4">
              {advisorData.phases.map((phase) => (
                <div
                  key={phase.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    phase.completed
                      ? 'bg-slate-900/40 border-emerald-500/30 shadow-sm'
                      : 'bg-slate-900 border-slate-800 shadow-md hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-xs flex items-center justify-center border border-indigo-500/30">
                        {phase.phaseNumber}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{phase.title}</h3>
                        <span className="text-xs text-indigo-400 font-medium">{phase.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCheckpoint(phase.id)}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition"
                      title={phase.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {phase.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {phase.objective}
                  </p>

                  {/* Core Concept Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {phase.coreConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[11px] font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>

                  {/* Checkpoint Deliverable */}
                  {phase.checkpoint && (
                    <div
                      onClick={() => toggleCheckpoint(phase.id)}
                      className={`cursor-pointer rounded-xl p-3 border text-xs transition flex items-start gap-2.5 ${
                        phase.checkpoint.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        {phase.checkpoint.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100 flex items-center justify-between">
                          <span>Checkpoint: {phase.checkpoint.title}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-400">Proof of Work</span>
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
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  The Cut List
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sandeep Swadia Rule
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ruthlessly eliminate low-signal tutorials, obsolete tech, and vanity topics to prevent cognitive fatigue.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {advisorData.cutList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-900/80 border border-amber-500/20 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>DO NOT LEARN: {item.topic}</span>
                  </div>

                  <div className="text-xs text-slate-400 pl-6 space-y-1">
                    <p>
                      <strong className="text-slate-300 font-semibold">Why Skip:</strong> {item.reasonToSkip}
                    </p>
                    <p>
                      <strong className="text-emerald-400 font-semibold">High-Leverage Alternative:</strong>{' '}
                      <span className="text-slate-200">{item.alternativeFocus}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Socratic Strategy Chat */}
        <div className="lg:col-span-5 flex flex-col h-[780px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Academic Advisor Office Hours</h3>
                <p className="text-[11px] text-slate-400">Strategy, curriculum adjustments & prioritizations</p>
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
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 text-xs font-bold">
                    A
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
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
              <div className="flex gap-3 items-center text-indigo-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Advisor is reviewing your strategy...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/30 flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask your Advisor about syllabus, pacing, or bottlenecks..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
