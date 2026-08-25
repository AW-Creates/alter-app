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
    'What would Machiavelli say?',
    'How does this relate to evolutionary fitness?'
  ];

  return (
    <div className="space-y-[22px] animate-fade-in">
      {/* Hero Card */}
      <div className="hero-card">
        <div className="hero-top">
          <div>
            <div className="role-chip">
              <span className="dot"></span>
              R — LATERAL-THINKING ROOMMATE
            </div>
            <h1>Cross-Disciplinary Collisions &amp; Late-Night Debates</h1>
          </div>
          <button
            onClick={() => handleTriggerCollision()}
            disabled={isColliding}
            className="accent-btn"
          >
            {isColliding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Shuffle size={14} />
            )}
            <span>Spark random collision</span>
          </button>
        </div>
        <p className="hero-sub">
          Your late-night dorm sparring partner. Connects your discipline with distant fields,
          sparks unconventional analogies, and pushes your thinking outside standard dogmas.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="layout roommate-grid">
        {/* Left Column: Collision Engine & Results */}
        <div>
          <div className="card" style={{ marginBottom: activeCollision ? '16px' : 0 }}>
            <p className="card-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontSize: '14.5px', textTransform: 'none', letterSpacing: 0 }}>
              <Zap size={16} color="var(--accent)" strokeWidth={2} />
              Cross-discipline collision engine
            </p>
            <p className="source-row" style={{ marginTop: 0, marginBottom: 0 }}>
              Pick a distant domain to collide with <b>{activeJourney.topic}</b>:
            </p>

            {/* Preset Domain Chips */}
            <div className="domain-chips">
              {presetDomains.map((domain) => (
                <div
                  key={domain}
                  onClick={() => handleTriggerCollision(domain)}
                  className="domain-chip"
                >
                  <Zap size={12} strokeWidth={2} />
                  <span>{domain}</span>
                </div>
              ))}
            </div>

            {/* Custom Input */}
            <div className="custom-row">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Or enter a custom field (e.g. quantum physics, culinary arts)..."
                className="custom-input"
              />
              <button
                onClick={() => {
                  if (customDomain.trim()) {
                    handleTriggerCollision(customDomain.trim());
                    setCustomDomain('');
                  }
                }}
                disabled={isColliding || !customDomain.trim()}
                className="collide-btn"
              >
                Collide
              </button>
            </div>
          </div>

          {/* Active Collision Result Card */}
          {activeCollision && (
            <div className="card space-y-4 animate-slide-up" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--hairline)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent)" />
                  <h4 style={{ margin: 0, fontSize: '16px' }}>
                    {activeJourney.topic} × {activeCollision.collidingDomain}
                  </h4>
                </div>
                <span className="signal-badge" style={{ color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
                  Lateral Synthesis
                </span>
              </div>

              <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent) 8%, var(--surface-1))', border: '1px solid color-mix(in srgb, var(--accent) 22%, transparent)', fontSize: '13px', color: 'var(--ink)', lineHeight: '1.6', fontWeight: 600, fontStyle: 'italic' }}>
                "{activeCollision.provocativeThesis}"
              </div>

              <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
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
                        className="starter"
                        style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0' }}
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
        <div className="sidebar-card" style={{ position: 'static' }}>
          <div className="chat-head">
            <div className="chat-avatar">
              <Users size={17} />
            </div>
            <div>
              <h4>Dorm lounge brainstorm</h4>
              <p>Unfiltered lateral discussions &amp; creative collisions</p>
            </div>
          </div>

          <div className="chat-body">
            {roommateData.chatHistory.map((msg) => (
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

            {isChatLoading && (
              <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono py-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Roommate is making wild cross-disciplinary connections...</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="suggestions">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setChatInput(qp)}
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Debate a theory, pitch a wild analogy, or test a hypothesis..."
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
