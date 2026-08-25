import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Users,
  Send,
  Zap,
  Shuffle,
  Sparkles,
  MessageSquare,
  Compass,
  Loader2
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateCollisionWithAI } from '../../services/gemini';
import { DomainCollision } from '../../types/alter';

export const RoommateView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [customDomain, setCustomDomain] = useState('');
  const [isColliding, setIsColliding] = useState(false);
  const [activeCollision, setActiveCollision] = useState<DomainCollision | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!activeJourney) return null;

  const { roommateData } = activeJourney;

  const presetDomains = [
    'Evolutionary biology',
    'Roman military strategy',
    'Jazz improvisation',
    'Cybernetics & feedback loops',
    'Behavioral economics',
    'Architecture & urban planning'
  ];

  const handleTriggerCollision = async (domain?: string) => {
    setIsColliding(true);
    try {
      const collision = await generateCollisionWithAI(activeJourney.topic, domain);
      setActiveCollision(collision);
    } catch (err) {
      console.error('Collision failed', err);
    } finally {
      setIsColliding(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    addChatMessage('roommate', { sender: 'user', content: userMsg, persona: 'roommate' });
    setIsChatLoading(true);

    try {
      const history = roommateData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const reply = await chatWithPersona('roommate', activeJourney, userMsg, history);
      addChatMessage('roommate', { sender: 'assistant', content: reply, persona: 'roommate' });
    } catch (err: any) {
      addChatMessage('roommate', {
        sender: 'assistant',
        content: `⚠️ Roommate debate error: ${err.message || 'Check connection.'}`,
        persona: 'roommate'
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const quickPrompts = [
    'Give me a crazy thought experiment',
    'What would Machiavelli say about this?',
    'How does this relate to evolutionary fitness?'
  ];

  return (
    <div className="space-y-[22px] animate-fade-in">
      {/* Hero Card */}
      <div className="hero-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2.5 relative z-10">
          <div>
            <div className="role-chip">
              <span className="dot"></span>
              <span>R — LATERAL-THINKING ROOMMATE</span>
            </div>
            <h1 className="font-display font-semibold text-2xl sm:text-[34px] tracking-tight text-white m-0 mb-2">
              Cross-Disciplinary Collisions &amp; Late-Night Debates
            </h1>
          </div>
          <button
            onClick={() => handleTriggerCollision()}
            disabled={isColliding}
            className="accent-btn flex-shrink-0"
          >
            {isColliding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Shuffle className="w-3.5 h-3.5" />
            )}
            <span>Spark random collision</span>
          </button>
        </div>
        <p className="text-[14.5px] text-white/60 max-w-[74ch] leading-relaxed m-0 relative z-10">
          Your late-night dorm sparring partner. Connects your discipline with distant fields,
          sparks unconventional analogies, and pushes your thinking outside standard dogmas.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-[22px] items-start">
        {/* Left Column: Collision Engine & Results */}
        <div className="space-y-4">
          <div className="altor-card space-y-3">
            <p className="card-label flex items-center gap-2 text-white text-[14.5px] normal-case tracking-normal">
              <Zap className="w-4 h-4 text-[var(--accent)]" />
              <span>Cross-discipline collision engine</span>
            </p>
            <p className="text-[13px] text-white/60 m-0">
              Pick a distant domain to collide with <strong className="text-white">{activeJourney.topic}</strong>:
            </p>

            {/* Preset Domain Chips */}
            <div className="flex flex-wrap gap-2.5 my-3">
              {presetDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleTriggerCollision(domain)}
                  disabled={isColliding}
                  className="flex items-center gap-2 text-[13px] text-white/70 hover:text-white bg-[var(--surface-1)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-1))] border border-white/[0.07] hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] rounded-[9px] px-3 py-2 transition cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                  <span>{domain}</span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2.5 pt-1">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Or enter a custom field (e.g. quantum physics, culinary arts)..."
                className="flex-1 bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg px-3 py-2.5 outline-none font-sans"
              />
              <button
                onClick={() => {
                  if (customDomain.trim()) {
                    handleTriggerCollision(customDomain.trim());
                    setCustomDomain('');
                  }
                }}
                disabled={isColliding || !customDomain.trim()}
                className="accent-btn px-4 py-2 text-xs"
              >
                Collide
              </button>
            </div>
          </div>

          {/* Active Collision Result Card */}
          {activeCollision && (
            <div className="altor-card space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <h4 className="font-display font-semibold text-base text-white m-0">
                    {activeJourney.topic} × {activeCollision.collidingDomain}
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 rounded border border-[color-mix(in_srgb,var(--accent)_25%,transparent)]">
                  Lateral Synthesis
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface-1))] border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-xs text-white/90 leading-relaxed font-semibold italic">
                "{activeCollision.provocativeThesis}"
              </div>

              <div className="text-xs text-white/70 leading-relaxed space-y-2">
                <MarkdownRenderer content={activeCollision.connectionAnalysis} />
              </div>

              {activeCollision.discussionStarters && activeCollision.discussionStarters.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.07] text-xs">
                  <span className="font-semibold text-white">Debate Sparks:</span>
                  <div className="space-y-1.5">
                    {activeCollision.discussionStarters.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(starter)}
                        className="w-full text-left p-2 rounded-lg bg-[var(--surface-1)] hover:bg-white/[0.04] border border-white/[0.07] hover:border-[var(--accent)] text-white/70 hover:text-white text-xs transition"
                      >
                        → {starter}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Dorm Lounge Brainstorm Chat */}
        <div className="sidebar-card" style={{ position: 'static', height: '640px' }}>
          <div className="chat-head">
            <div className="chat-avatar">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[14.5px] font-semibold text-white m-0">Dorm lounge brainstorm</h4>
              <p className="text-xs text-white/40 m-0">Unfiltered lateral discussions &amp; creative collisions</p>
            </div>
          </div>

          <div className="chat-body space-y-3">
            {roommateData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`msg ${
                  msg.sender === 'user'
                    ? 'bg-[var(--surface-3)] border-white/[0.13] text-white'
                    : ''
                }`}
              >
                <MarkdownRenderer content={msg.content} />
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Roommate is making wild cross-disciplinary connections...</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setChatInput(qp)}
                className="sugg text-[11.5px]"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Debate a theory, pitch a wild analogy, or test a hypothesis..."
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="send-btn"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
