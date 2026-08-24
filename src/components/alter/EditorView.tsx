import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  FileEdit,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Copy,
  Check,
  Flame,
  ArrowRight,
  Split,
  MessageSquare
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, critiqueTextWithAI } from '../../services/gemini';
import { EditorReview } from '../../types/alter';

export const EditorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [draftText, setDraftText] = useState('');
  const [critiqueMode, setCritiqueMode] = useState<'logic' | 'clarity' | 'steelman' | 'first_principles'>('logic');
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [currentReview, setCurrentReview] = useState<EditorReview | null>(null);
  const [copied, setCopied] = useState(false);

  // Chat state
  const [inputText, setInputText] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  if (!activeJourney) return null;

  const { editorData } = activeJourney;

  const handleCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;

    setIsCritiquing(true);
    try {
      const review = await critiqueTextWithAI(draftText.trim(), critiqueMode);
      setCurrentReview(review);
      updateActiveJourney((prev) => ({
        ...prev,
        editorData: {
          ...prev.editorData,
          reviews: [review, ...prev.editorData.reviews]
        }
      }));
    } catch (err) {
      console.error('Failed to critique draft', err);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleCopyRevised = () => {
    if (!currentReview) return;
    navigator.clipboard.writeText(currentReview.revisedVersion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingChat) return;

    const userMsg = inputText.trim();
    setInputText('');
    addChatMessage('editor', { sender: 'user', content: userMsg, persona: 'editor' });
    setIsLoadingChat(true);

    try {
      const history = editorData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const reply = await chatWithPersona('editor', activeJourney, userMsg, history);
      addChatMessage('editor', { sender: 'assistant', content: reply, persona: 'editor' });
    } catch (err: any) {
      addChatMessage('editor', {
        sender: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        persona: 'editor'
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              E — Analytical Editor & Pressure-Tester
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rigorous Intellectual Pressure-Testing
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Zero sycophancy. The Editor stress-tests your writing, logic, architecture proposals, and mental models through unsparing redlines and steelmanned counterarguments.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Draft Input & Review Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Draft Input Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-400" />
                <span>Submit Draft for Editorial Pressure-Test</span>
              </h3>
            </div>

            <form onSubmit={handleCritique} className="space-y-4">
              {/* Critique Mode Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'logic', label: 'Logic Audit' },
                  { id: 'clarity', label: 'Clarity & Fluff' },
                  { id: 'steelman', label: 'Steelman Counter' },
                  { id: 'first_principles', label: '1st Principles' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCritiqueMode(m.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                      critiqueMode === m.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={7}
                required
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Paste your essay paragraph, technical design proposal, architectural justification, or synthesis..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
              />

              <button
                type="submit"
                disabled={isCritiquing || !draftText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isCritiquing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pressure-Testing Logic & Phrasing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Editorial Pressure-Test</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Review Results */}
          {currentReview && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Editorial Verdict
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{currentReview.verdict}</h3>
                </div>
                <div className="text-center bg-slate-950 border border-amber-500/20 px-3.5 py-1.5 rounded-xl">
                  <div className="text-xl font-black text-amber-400">{currentReview.overallScore}%</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Rigor Score</div>
                </div>
              </div>

              {/* Logic Flaws & Counterarguments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>Logic Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentReview.logicFlaws.map((flaw, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-rose-400">•</span>
                        <span>{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>Steelmanned Counterarguments</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentReview.counterarguments.map((ca, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-400">•</span>
                        <span>{ca}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Surgical Redlines */}
              {currentReview.redlines.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Surgical Redline Edits
                  </h4>
                  <div className="space-y-2.5">
                    {currentReview.redlines.map((r) => (
                      <div key={r.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 text-xs">
                        <div className="text-rose-400/90 line-through font-mono text-[11px]">
                          - {r.originalText}
                        </div>
                        <div className="text-emerald-400 font-mono text-[11px] font-medium">
                          + {r.improvedText}
                        </div>
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                          Rationale: {r.critiqueReason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revised Version */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Editor's Polished Revision
                  </h4>
                  <button
                    onClick={handleCopyRevised}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs text-slate-200 leading-relaxed font-sans">
                  {currentReview.revisedVersion}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Editor Sparring Chat */}
        <div className="lg:col-span-5 flex flex-col h-[780px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Editor's Desk Sparring</h3>
                <p className="text-[11px] text-slate-400">Debate revisions, thesis statements & arguments</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {editorData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 text-xs font-bold">
                    E
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
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

            {isLoadingChat && (
              <div className="flex gap-3 items-center text-amber-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Editor is pressure-testing your logic...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Challenge the editor or defend your thesis..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={isLoadingChat || !inputText.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
