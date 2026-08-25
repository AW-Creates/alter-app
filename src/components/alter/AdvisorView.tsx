import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  GraduationCap,
  Target,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  RefreshCw,
  Clock,
  Layers,
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
    'Should I skip framework X?',
    'How do I test if I have mastered Phase 1?'
  ];

  return (
    <div className="layout animate-fade-in">
      {/* Left Column: Hero, Strategic Brief, Phases, Cut List */}
      <div>
        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="role-chip">
                <span className="dot"></span>
                A — ACADEMIC ADVISOR
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
            <span className="capitalize font-medium text-white">{activeJourney.depth}</span>.
          </p>
        </div>

        {/* Strategic Overview Brief */}
        {advisorData.overview && (
          <div className="card">
            <p className="card-label">Advisor strategic brief</p>
            <p className="hero-sub" style={{ maxWidth: 'none' }}>
              {advisorData.overview}
            </p>
          </div>
        )}

        {/* Phases List */}
        <div className="space-y-4 mb-4">
          {advisorData.phases.map((phase) => (
            <div
              key={phase.id}
              className="card"
              style={{
                borderLeft: phase.completed ? '2px solid var(--tutor)' : '2px solid var(--accent)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ margin: 0 }}>
                  Phase {phase.phaseNumber} — {phase.title}
                </h4>
                <button
                  onClick={() => toggleCheckpoint(phase.id)}
                  className="p-1 text-white/30 hover:text-[var(--tutor)] transition cursor-pointer bg-transparent border-none"
                  title={phase.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {phase.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--tutor)]" />
                  ) : (
                    <Circle size={18} className="text-white/20 hover:text-white/40" />
                  )}
                </button>
              </div>

              <p className="source-row" style={{ marginTop: '2px' }}>
                {phase.duration} · {phase.objective}
              </p>

              {/* Core Concept Tags */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {phase.coreConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[var(--surface-1)] border border-white/[0.07] text-white/60 rounded text-[11px] font-mono"
                  >
                    {concept}
                  </span>
                ))}
              </div>

              {/* Checkpoint Deliverable */}
              {phase.checkpoint && (
                <div
                  onClick={() => toggleCheckpoint(phase.id)}
                  className={`cursor-pointer rounded-xl p-3 border text-xs transition flex items-start gap-2.5 mt-2 ${
                    phase.checkpoint.completed
                      ? 'bg-[rgba(95,219,158,0.06)] border-[rgba(95,219,158,0.2)] text-white/90'
                      : 'bg-[var(--surface-1)] border-white/[0.07] text-white/70 hover:border-white/[0.13]'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {phase.checkpoint.completed ? (
                      <CheckCircle2 size={15} className="text-[var(--tutor)]" />
                    ) : (
                      <Circle size={15} className="text-white/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Checkpoint: {phase.checkpoint.title}</span>
                      <span className="text-[10px] font-mono uppercase text-[var(--accent)]">
                        Proof of Work
                      </span>
                    </div>
                    <p className="text-white/50 text-[11.5px] mt-0.5 leading-normal">
                      {phase.checkpoint.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* The Cut List */}
        {advisorData.cutList && advisorData.cutList.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--editor)]" />
              <h3 className="font-display font-semibold text-base text-white m-0">The Cut List</h3>
              <span className="text-[10px] font-mono uppercase bg-[rgba(234,176,84,0.1)] text-[var(--editor)] border border-[rgba(234,176,84,0.25)] px-1.5 py-0.5 rounded">
                Sandeep Swadia Rule
              </span>
            </div>
            <div className="space-y-2.5">
              {advisorData.cutList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-[var(--surface-1)] border border-[rgba(234,176,84,0.2)] p-4 space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 text-[var(--editor)] font-semibold text-xs">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>SKIP: {item.topic}</span>
                  </div>
                  <div className="text-white/50 pl-5 space-y-0.5 text-[11.5px] leading-relaxed">
                    <p>
                      <strong className="text-white/70">Why:</strong> {item.reasonToSkip}
                    </p>
                    <p>
                      <strong className="text-[var(--tutor)]">Alternative Focus:</strong>{' '}
                      <span className="text-white/80">{item.alternativeFocus}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Sticky Sidebar Chat (Office Hours) */}
      <div className="sidebar-card">
        <div className="chat-head">
          <div className="chat-avatar">
            <GraduationCap size={17} />
          </div>
          <div>
            <h4>Academic advisor office hours</h4>
            <p>Strategy, pacing &amp; prioritization</p>
          </div>
        </div>

        <div className="chat-body">
          {advisorData.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`msg ${
                msg.sender === 'user'
                  ? 'bg-[var(--surface-3)] border-white/[0.13] text-white'
                  : ''
              }`}
              style={{ marginBottom: '12px' }}
            >
              <MarkdownRenderer content={msg.content} />
              <div className="msg-time">{msg.timestamp}</div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Advisor is strategizing...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="suggestions">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => setInputText(qp)}
              className="sugg"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="chat-input">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your Advisor about syllabus, pacing, or bottlenecks..."
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="send"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
