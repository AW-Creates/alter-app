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
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 border border-hairline p-6 md:p-8 shadow-card">
        <div className="pointer-events-none absolute -top-[40%] -left-[10%] w-[60%] h-[180%] bg-[radial-gradient(circle,rgba(234,176,84,0.14),transparent_65%)]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-editor/8 text-editor border border-editor/30 text-[11px] font-mono tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-editor" />
              E — ANALYTICAL EDITOR &amp; PRESSURE-TESTER
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Rigorous Intellectual Pressure-Testing
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
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
          <div className="bg-surface-2 border border-hairline rounded-2xl p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileEdit className="w-3.5 h-3.5 text-editor" />
                <span>Submit draft for editorial pressure-test</span>
              </h3>
            </div>

            <form onSubmit={handleCritique} className="space-y-4">
              {/* Critique Mode Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'logic', label: 'Logic audit' },
                  { id: 'clarity', label: 'Clarity & fluff' },
                  { id: 'steelman', label: 'Steelman counter' },
                  { id: 'first_principles', label: '1st principles' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCritiqueMode(m.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition ${
                      critiqueMode === m.id
                        ? 'bg-editor/16 border-editor/40 text-editor'
                        : 'bg-surface-1 border-hairline text-slate-400 hover:border-hairline-strong'
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
                className="w-full bg-surface-1 border border-hairline rounded-lg p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-editor font-sans leading-relaxed"
              />

              <button
                type="submit"
                disabled={isCritiquing || !draftText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-editor hover:brightness-110 text-slate-950 font-semibold text-xs transition disabled:opacity-50"
              >
                {isCritiquing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pressure-testing logic &amp; phrasing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run editorial pressure-test</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Review Results */}
          {currentReview && (
            <div className="bg-surface-2 border border-editor/25 rounded-2xl p-6 space-y-6 animate-fade-in shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-editor tracking-wider">
                    Editorial verdict
                  </span>
                  <h3 className="font-display text-base font-semibold text-slate-100 mt-0.5">{currentReview.verdict}</h3>
                </div>
                <div className="text-center bg-surface-1 border border-editor/25 px-3.5 py-1.5 rounded-lg">
                  <div className="text-xl font-semibold text-editor">{currentReview.overallScore}%</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Rigor score</div>
                </div>
              </div>

              {/* Logic Flaws & Counterarguments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-surface-1 border border-hairline rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-roommate flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>Logic vulnerabilities</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentReview.logicFlaws.map((flaw, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-roommate">•</span>
                        <span>{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface-1 border border-hairline rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-editor flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>Steelmanned counterarguments</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentReview.counterarguments.map((ca, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-editor">•</span>
                        <span>{ca}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Surgical Redlines */}
              {currentReview.redlines.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Surgical redline edits
                  </h4>
                  <div className="space-y-2.5">
                    {currentReview.redlines.map((r) => (
                      <div key={r.id} className="rounded-lg bg-surface-1 border border-hairline p-3.5 space-y-1.5 text-xs">
                        <div className="text-roommate/90 line-through font-mono text-[11px]">
                          - {r.originalText}
                        </div>
                        <div className="text-tutor font-mono text-[11px] font-medium">
                          + {r.improvedText}
                        </div>
                        <div className="text-[11px] text-slate-500 italic pt-1 border-t border-hairline">
                          Rationale: {r.critiqueReason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revised Version */}
              <div className="space-y-2 pt-2 border-t border-hairline">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-tutor">
                    Editor's polished revision
                  </h4>
                  <button
                    onClick={handleCopyRevised}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-surface-1 border border-hairline hover:border-hairline-strong transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-tutor" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-surface-1 border border-tutor/20 text-xs text-slate-200 leading-relaxed font-sans">
                  {currentReview.revisedVersion}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Editor Sparring Chat */}
        <div className="lg:col-span-5 flex flex-col h-[560px] lg:h-[780px] lg:sticky lg:top-20 bg-surface-2 border border-hairline rounded-2xl shadow-lift overflow-hidden">
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-editor/15 border border-editor/30 flex items-center justify-center text-editor flex-shrink-0">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Editor's desk sparring</h3>
                <p className="text-[11px] text-slate-500">Debate revisions, thesis statements &amp; arguments</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {editorData.chatHistory.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 px-6">
                Submit a draft on the left, or challenge the Editor directly below.
              </div>
            )}
            {editorData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-editor/15 border border-editor/30 flex items-center justify-center text-editor flex-shrink-0 text-xs font-mono font-semibold">
                    E
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-editor text-slate-950 font-medium rounded-tr-none'
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

            {isLoadingChat && (
              <div className="flex gap-3 items-center text-editor text-xs">
                <div className="w-7 h-7 rounded-lg bg-editor/15 border border-editor/30 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Editor is pressure-testing your logic...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-hairline flex flex-wrap gap-1.5">
            {[
              "Where's the weakest logical link?",
              'Steelman the counterargument',
              'Rewrite this without any fluff'
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-surface-1 border border-hairline hover:border-editor/40 hover:text-editor px-2.5 py-1.5 rounded-full transition"
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
              placeholder="Challenge the editor or defend your thesis..."
              className="flex-1 bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-editor transition"
            />
            <button
              type="submit"
              disabled={isLoadingChat || !inputText.trim()}
              className="p-2.5 rounded-lg bg-editor hover:brightness-110 text-slate-950 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
