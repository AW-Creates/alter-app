import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Users,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Shuffle,
  Coffee,
  Globe,
  Radio,
  Flame,
  MessageSquare
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateCollisionWithAI } from '../../services/gemini';
import { DomainCollision } from '../../types/alter';

export const RoommateView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [currentCollision, setCurrentCollision] = useState<DomainCollision | null>(null);
  const [customDomain, setCustomDomain] = useState('');

  if (!activeJourney) return null;

  const { roommateData } = activeJourney;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    addChatMessage('roommate', { sender: 'user', content: userMsg, persona: 'roommate' });
    setIsLoading(true);

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
        content: `⚠️ Error: ${err.message}`,
        persona: 'roommate'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCollision = async (targetDomain?: string) => {
    setIsColliding(true);
    try {
      const collision = await generateCollisionWithAI(activeJourney.topic, targetDomain);
      setCurrentCollision(collision);
      updateActiveJourney((prev) => ({
        ...prev,
        roommateData: {
          ...prev.roommateData,
          collisions: [collision, ...prev.roommateData.collisions]
        }
      }));
    } catch (err) {
      console.error('Failed to generate collision', err);
    } finally {
      setIsColliding(false);
    }
  };

  const collisionPresets = [
    'Evolutionary Biology',
    'Roman Military Strategy',
    'Jazz Improvisation',
    'Cybernetics & Feedback Loops',
    'Behavioral Economics',
    'Architecture & Urban Planning'
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 border border-hairline p-6 md:p-8 shadow-card">
        <div className="pointer-events-none absolute -top-[40%] -left-[10%] w-[60%] h-[180%] bg-[radial-gradient(circle,rgba(238,127,184,0.14),transparent_65%)]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-roommate/8 text-roommate border border-roommate/30 text-[11px] font-mono tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-roommate" />
              R — LATERAL-THINKING ROOMMATE
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Cross-Disciplinary Collisions &amp; Late-Night Debates
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Your late-night dorm sparring partner. Connects your discipline with distant fields, sparks unconventional analogies, and pushes your thinking outside standard dogmas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerateCollision()}
              disabled={isColliding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-roommate hover:brightness-110 text-slate-950 font-semibold text-xs transition disabled:opacity-50 flex-shrink-0"
            >
              {isColliding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              <span>Spark random collision</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cross-Domain Collision Engine */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Domain Collision Preset Selector */}
          <div className="bg-surface-2 border border-hairline rounded-2xl p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-roommate" />
                <span>Cross-discipline collision engine</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick a distant domain to collide with <strong className="text-slate-200">{activeJourney.topic}</strong>:
            </p>

            <div className="flex flex-wrap gap-2">
              {collisionPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleGenerateCollision(preset)}
                  disabled={isColliding}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-1 hover:bg-roommate/10 text-slate-300 hover:text-roommate border border-hairline hover:border-roommate/35 text-xs font-medium transition disabled:opacity-50"
                >
                  <Zap className="w-3 h-3 text-roommate flex-shrink-0" />
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-hairline">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Or enter custom field (e.g. Quantum Physics, Culinary Arts)..."
                className="flex-1 bg-surface-1 border border-hairline rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-roommate"
              />
              <button
                onClick={() => {
                  if (customDomain.trim()) {
                    handleGenerateCollision(customDomain.trim());
                    setCustomDomain('');
                  }
                }}
                disabled={isColliding || !customDomain.trim()}
                className="px-4 py-2 rounded-lg bg-roommate hover:brightness-110 text-slate-950 font-semibold text-xs transition disabled:opacity-50"
              >
                Collide
              </button>
            </div>
          </div>

          {/* Active Collision Card */}
          {currentCollision && (
            <div className="bg-surface-2 border border-roommate/25 rounded-2xl p-6 space-y-5 animate-fade-in shadow-card">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roommate/15 text-roommate font-mono text-xs flex items-center justify-center border border-roommate/30">
                    <Zap className="w-3 h-3" />
                  </span>
                  <h4 className="text-sm font-semibold text-roommate">
                    {activeJourney.topic} × {currentCollision.collidingDomain}
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-white leading-snug">
                  "{currentCollision.provocativeThesis}"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {currentCollision.connectionAnalysis}
                </p>
              </div>

              {/* Discussion Starters */}
              <div className="space-y-2.5 pt-3 border-t border-hairline">
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-roommate/80">
                  Late-night debate sparks
                </h5>
                <div className="space-y-2">
                  {currentCollision.discussionStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(`Let's debate this: ${starter}`)}
                      className="w-full text-left p-3 rounded-lg bg-surface-1 hover:border-roommate/30 border border-hairline text-xs text-slate-300 hover:text-roommate transition flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-roommate font-mono font-semibold">Q{idx + 1}:</span>
                      <span>{starter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Roommate Chat */}
        <div className="lg:col-span-5 flex flex-col h-[560px] lg:h-[780px] lg:sticky lg:top-20 bg-surface-2 border border-hairline rounded-2xl shadow-lift overflow-hidden">
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-roommate/15 border border-roommate/30 flex items-center justify-center text-roommate flex-shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Dorm lounge brainstorm</h3>
                <p className="text-[11px] text-slate-500">Unfiltered lateral discussions &amp; creative collisions</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {roommateData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-roommate/15 border border-roommate/30 flex items-center justify-center text-roommate flex-shrink-0 text-xs font-mono font-semibold">
                    R
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-roommate text-slate-950 font-medium rounded-tr-none'
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
              <div className="flex gap-3 items-center text-roommate text-xs">
                <div className="w-7 h-7 rounded-lg bg-roommate/15 border border-roommate/30 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Roommate is concocting a wild counter-theory...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-hairline flex flex-wrap gap-1.5">
            {[
              'Give me a crazy thought experiment about this',
              'What would Machiavelli say about this architecture?',
              'How does this relate to evolutionary fitness?'
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-surface-1 border border-hairline hover:border-roommate/40 hover:text-roommate px-2.5 py-1.5 rounded-full transition"
              >
                {qp}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-hairline flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Debate a theory, pitch a wild analogy, or test a hypothesis..."
              className="flex-1 bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-roommate transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-lg bg-roommate hover:brightness-110 text-slate-950 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
