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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-950/80 via-slate-900 to-slate-900 border border-pink-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider">
              R — Lateral-Thinking Roommate
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cross-Disciplinary Collisions & Late-Night Debates
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Your late-night dorm sparring partner. Connects your discipline with distant fields, sparks unconventional analogies, and pushes your thinking outside standard dogmas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerateCollision()}
              disabled={isColliding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
            >
              {isColliding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              <span>Spark Random Collision</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cross-Domain Collision Engine */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Domain Collision Preset Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Cross-Discipline Collision Engine</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick a distant domain to collide with <strong>{activeJourney.topic}</strong>:
            </p>

            <div className="flex flex-wrap gap-2">
              {collisionPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleGenerateCollision(preset)}
                  disabled={isColliding}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 border border-slate-800 hover:border-pink-500/30 text-xs font-semibold transition disabled:opacity-50"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Or enter custom field (e.g. Quantum Physics, Culinary Arts)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={() => {
                  if (customDomain.trim()) {
                    handleGenerateCollision(customDomain.trim());
                    setCustomDomain('');
                  }
                }}
                disabled={isColliding || !customDomain.trim()}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                Collide
              </button>
            </div>
          </div>

          {/* Active Collision Card */}
          {currentCollision && (
            <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-6 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-300 font-bold text-xs flex items-center justify-center">
                    ⚡
                  </span>
                  <h4 className="text-sm font-bold text-pink-400">
                    {activeJourney.topic} × {currentCollision.collidingDomain}
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white leading-snug">
                  "{currentCollision.provocativeThesis}"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {currentCollision.connectionAnalysis}
                </p>
              </div>

              {/* Discussion Starters */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Late-Night Debate Sparks
                </h5>
                <div className="space-y-2">
                  {currentCollision.discussionStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(`Let's debate this: ${starter}`)}
                      className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 hover:text-pink-300 transition flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-pink-400 font-bold">Q{idx + 1}:</span>
                      <span>{starter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Roommate Chat */}
        <div className="lg:col-span-5 flex flex-col h-[780px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Dorm Lounge Brainstorm</h3>
                <p className="text-[11px] text-slate-400">Unfiltered lateral discussions & creative collisions</p>
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
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0 text-xs font-bold">
                    R
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-pink-600 text-white rounded-tr-none'
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
              <div className="flex gap-3 items-center text-pink-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Roommate is concocting a wild counter-theory...</span>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/30 flex flex-wrap gap-1.5">
            {[
              'Give me a crazy thought experiment about this',
              'What would Machiavelli say about this architecture?',
              'How does this relate to evolutionary fitness?'
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                {qp}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Debate a theory, pitch a wild analogy, or test a hypothesis..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
