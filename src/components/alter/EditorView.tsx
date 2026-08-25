import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  FileEdit,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, critiqueTextWithAI } from '../../services/gemini';
import { TextCritique } from '../../types/alter';

export const EditorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [draftText, setDraftText] = useState('');
  const [critiqueMode, setCritiqueMode] = useState<'logic' | 'clarity' | 'steelman' | 'first_principles'>('logic');
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<TextCritique | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!activeJourney) return null;

  const { editorData } = activeJourney;

  const handleRunCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim() || isCritiquing) return;

    setIsCritiquing(true);
    try {
      const result = await critiqueTextWithAI(draftText, critiqueMode);
      setCritiqueResult(result);
    } catch (err) {
      console.error('Critique failed', err);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    addChatMessage('editor', { sender: 'user', content: userMsg, persona: 'editor' });
    setIsChatLoading(true);

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
        content: `⚠️ Editor error: ${err.message || 'Check connection.'}`,
        persona: 'editor'
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyRevised = () => {
    if (!critiqueResult?.revisedVersion) return;
    navigator.clipboard.writeText(critiqueResult.revisedVersion);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const quickPrompts = [
    "Where's the weakest logical link in my thesis?",
    'Steelman the strongest counterargument',
    'Rewrite this paragraph without any fluff'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-[22px] items-start animate-fade-in">
      {/* Left Column: Draft Submission & Critique */}
      <div className="space-y-4">
        <form onSubmit={handleRunCritique} className="altor-card">
          <p className="card-label flex items-center gap-2 text-white">
            <FileEdit className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>SUBMIT DRAFT FOR EDITORIAL PRESSURE-TEST</span>
          </p>

          <div className="segmented mb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setCritiqueMode('logic')}
              className={critiqueMode === 'logic' ? 'active' : ''}
            >
              Logic audit
            </button>
            <button
              type="button"
              onClick={() => setCritiqueMode('clarity')}
              className={critiqueMode === 'clarity' ? 'active' : ''}
            >
              Clarity &amp; fluff
            </button>
            <button
              type="button"
              onClick={() => setCritiqueMode('steelman')}
              className={critiqueMode === 'steelman' ? 'active' : ''}
            >
              Steelman counter
            </button>
            <button
              type="button"
              onClick={() => setCritiqueMode('first_principles')}
              className={critiqueMode === 'first_principles' ? 'active' : ''}
            >
              1st principles
            </button>
          </div>

          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Paste your essay paragraph, technical design proposal, architectural justification, or synthesis..."
            rows={7}
            className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-3.5 outline-none font-sans leading-relaxed my-3"
            required
          />

          <button
            type="submit"
            disabled={isCritiquing || !draftText.trim()}
            className="accent-btn w-full justify-center py-3"
          >
            {isCritiquing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running analytical audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run editorial pressure-test</span>
              </>
            )}
          </button>
        </form>

        {/* Critique Output Card */}
        {critiqueResult && (
          <div className="altor-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <span className="font-display font-semibold text-white text-base">Editorial Verdict</span>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-semibold">
                Score: {critiqueResult.overallScore}/100
              </span>
            </div>

            <p className="text-xs text-white/80 italic m-0">"{critiqueResult.verdict}"</p>

            {/* Logic Flaws */}
            {critiqueResult.logicFlaws && critiqueResult.logicFlaws.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Identified Logic Gaps &amp; Assumptions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  {critiqueResult.logicFlaws.map((flaw, i) => (
                    <li key={i}><span className="text-white/80">{flaw}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steelmanned Counterarguments */}
            {critiqueResult.counterarguments && critiqueResult.counterarguments.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-[var(--editor)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Steelmanned Counterargument:
                </span>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  {critiqueResult.counterarguments.map((ca, i) => (
                    <li key={i}><span className="text-white/80">{ca}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Redlines */}
            {critiqueResult.redlines && critiqueResult.redlines.length > 0 && (
              <div className="space-y-2 text-xs pt-2 border-t border-white/[0.07]">
                <span className="font-semibold text-white">Surgical Redline Edits:</span>
                <div className="space-y-2">
                  {critiqueResult.redlines.map((rl, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-white/[0.07] space-y-1 font-mono text-[11.5px]">
                      <div className="text-rose-400/80 line-through">- {rl.originalText}</div>
                      <div className="text-[var(--tutor)]">+ {rl.improvedText}</div>
                      <div className="text-white/40 text-[10.5px] font-sans pt-1">Why: {rl.critiqueReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revised Version */}
            {critiqueResult.revisedVersion && (
              <div className="space-y-2 pt-2 border-t border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">Polished Revision:</span>
                  <button
                    onClick={handleCopyRevised}
                    className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-[var(--tutor)]" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-white/[0.07] text-xs text-white/80 leading-relaxed font-sans">
                  {critiqueResult.revisedVersion}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Editor Desk Sparring */}
      <div className="sidebar-card" style={{ position: 'static', height: '640px' }}>
        <div className="chat-head">
          <div className="chat-avatar">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[14.5px] font-semibold text-white m-0">Editor's desk sparring</h4>
            <p className="text-xs text-white/40 m-0">Debate revisions, thesis statements &amp; arguments</p>
          </div>
        </div>

        <div className="chat-body space-y-3">
          {editorData.chatHistory.length === 0 ? (
            <div className="text-xs text-white/40 text-center py-16 px-4">
              Submit a draft on the left, or challenge the Editor directly below.
            </div>
          ) : (
            editorData.chatHistory.map((msg) => (
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
            ))
          )}

          {isChatLoading && (
            <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Editor is pressure-testing arguments...</span>
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

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Challenge the editor or defend your thesis..."
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
  );
};
