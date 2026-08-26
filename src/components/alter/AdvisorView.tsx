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
  Globe
} from 'lucide-react';
import { generateCurriculumWithAI, chatWithPersona } from '../../services/gemini';

export const AdvisorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!activeJourney) return null;

  const { advisorData } = activeJourney;

  // Toggle completion of a milestone checkpoint
  const toggleCheckpoint = (phaseId: string) => {
    updateActiveJourney((prev) => {
      const updatedPhases = prev.advisorData.phases.map((p) => {
        if (p.id === phaseId) {
          const completed = !p.completed;
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
            <span className="capitalize font-medium text-[var(--ink)]">{activeJourney.depth}</span>.
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
                <h4 style={{ margin: 0, color: 'var(--ink)' }}>
                  Phase {phase.phaseNumber} — {phase.title}
                </h4>
                <button
                  onClick={() => toggleCheckpoint(phase.id)}
                  className="p-1 text-[var(--ink-3)] hover:text-[var(--tutor)] transition cursor-pointer bg-transparent border-none"
                  title={phase.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {phase.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--tutor)]" />
                  ) : (
                    <Circle size={18} className="text-[var(--ink-3)] hover:text-[var(--ink-2)]" />
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
                    className="px-2 py-0.5 bg-[var(--surface-1)] border border-[var(--hairline)] text-[var(--ink-2)] rounded text-[11px] font-mono"
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
                      ? 'bg-[color-mix(in_srgb,var(--tutor)_8%,var(--surface-1))] border-[color-mix(in_srgb,var(--tutor)_35%,transparent)] text-[var(--ink)]'
                      : 'bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--hairline-strong)]'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {phase.checkpoint.completed ? (
                      <CheckCircle2 size={15} className="text-[var(--tutor)]" />
                    ) : (
                      <Circle size={15} className="text-[var(--ink-3)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--ink)] flex items-center justify-between">
                      <span>Checkpoint: {phase.checkpoint.title}</span>
                      <span className="text-[10px] font-mono uppercase text-[var(--accent)] font-semibold">
                        Proof of Work
                      </span>
                    </div>
                    <p className="text-[var(--ink-2)] text-[11.5px] mt-0.5 leading-normal m-0">
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
              <p>Strategy, pacing &amp; prioritization</p>
            </div>
          </div>

          <div className="chat-body">
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
                <span>Advisor is reviewing your pacing &amp; strategy...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="suggestions">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="sugg"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask your Advisor about syllabus, pacing, or cuts..."
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
