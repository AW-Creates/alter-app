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
import { VoiceInputButton } from '../common/VoiceInputButton';
import { chatWithPersona, critiqueTextWithAI, hasActiveApiKey } from '../../services/gemini';
import { TextCritique } from '../../types/alter';

export const EditorView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage, editorDraftPayload } = useJourney();
  const [draftText, setDraftText] = useState('');
  const [critiqueMode, setCritiqueMode] = useState<'logic' | 'clarity' | 'steelman' | 'first_principles'>('logic');
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<TextCritique | null>(null);

  React.useEffect(() => {
    if (editorDraftPayload && editorDraftPayload !== draftText) {
      setDraftText(editorDraftPayload);
      setCritiqueMode('first_principles');
    }
  }, [editorDraftPayload]);

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
    <div className="layout editor-grid animate-fade-in">
      {/* Left Column: Draft Submission & Critique */}
      <div>
        <form onSubmit={handleRunCritique} className="card" style={{ marginBottom: critiqueResult ? '16px' : 0 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="card-label m-0 flex items-center gap-2 text-[var(--ink)]">
              <FileEdit size={15} color="var(--accent)" strokeWidth={2} />
              SUBMIT DRAFT FOR EDITORIAL PRESSURE-TEST
            </p>
            {hasActiveApiKey() ? (
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded font-bold">
                🛡️ Live AI Analysis
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase bg-[var(--surface-3)] text-[var(--ink-3)] border border-[var(--hairline)] px-2 py-0.5 rounded font-bold">
                ⚡ Local Analytical Engine
              </span>
            )}
          </div>

          <div className="segmented" style={{ width: 'fit-content', marginBottom: '8px' }}>
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

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--ink-3)]">DRAFT / PROPOSAL TEXT</span>
            <VoiceInputButton
              onTranscript={(transcript) =>
                setDraftText((prev) => (prev ? `${prev} ${transcript}` : transcript))
              }
            />
          </div>

          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Paste your essay paragraph, technical design proposal, architectural justification, or click the mic to speak..."
            className="draft-area"
            required
          />

          <button
            type="submit"
            disabled={isCritiquing || !draftText.trim()}
            className="accent-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {isCritiquing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Running analytical audit...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Run editorial pressure-test</span>
              </>
            )}
          </button>
        </form>

        {/* Critique Output Card */}
        {critiqueResult && (
          <div className="card space-y-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--hairline)', paddingBottom: '12px' }}>
              <span className="font-display font-semibold text-[var(--ink)] text-base">Editorial Verdict</span>
              <span className="signal-badge" style={{ color: 'var(--editor)', borderColor: 'rgba(234,176,84,0.3)', background: 'rgba(234,176,84,0.1)' }}>
                Score: {critiqueResult.overallScore}/100
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--ink-2)', fontStyle: 'italic', margin: 0 }}>"{critiqueResult.verdict}"</p>

            {/* Logic Flaws */}
            {critiqueResult.logicFlaws && critiqueResult.logicFlaws.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Identified Logic Gaps &amp; Assumptions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[var(--ink-2)]">
                  {critiqueResult.logicFlaws.map((flaw, i) => (
                    <li key={i}><span className="text-[var(--ink)]">{flaw}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steelmanned Counterarguments */}
            {critiqueResult.counterarguments && critiqueResult.counterarguments.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-[var(--editor)] flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Steelmanned Counterargument:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[var(--ink-2)]">
                  {critiqueResult.counterarguments.map((ca, i) => (
                    <li key={i}><span className="text-[var(--ink)]">{ca}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Redlines */}
            {critiqueResult.redlines && critiqueResult.redlines.length > 0 && (
              <div className="space-y-2 text-xs pt-2 border-t border-[var(--hairline)]">
                <span className="font-semibold text-[var(--ink)]">Surgical Redline Edits:</span>
                <div className="space-y-2">
                  {critiqueResult.redlines.map((rl, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] space-y-1 font-mono text-[11.5px]">
                      <div className="text-rose-600 dark:text-rose-400/80 line-through">- {rl.originalText}</div>
                      <div className="text-[var(--tutor)]">+ {rl.improvedText}</div>
                      <div className="text-[var(--ink-3)] text-[10.5px] font-sans pt-1">Why: {rl.critiqueReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revised Version */}
            {critiqueResult.revisedVersion && (
              <div className="space-y-2 pt-2 border-t border-[var(--hairline)]">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-semibold text-xs text-[var(--ink)]">Polished Revision:</span>
                  <button
                    onClick={handleCopyRevised}
                    className="open-link"
                    style={{ fontSize: '11px', cursor: 'pointer', background: 'transparent', border: 'none' }}
                  >
                    {isCopied ? <Check size={12} className="text-[var(--tutor)]" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--ink-2)] leading-relaxed font-sans">
                  {critiqueResult.revisedVersion}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Editor Desk Sparring */}
      <div className="sidebar-card" style={{ position: 'static' }}>
        <div className="chat-head">
          <div className="chat-avatar">
            <FileEdit size={17} />
          </div>
          <div>
            <h4>Editor's desk sparring</h4>
            <p>Debate revisions, thesis statements &amp; arguments</p>
          </div>
        </div>

        <div className="chat-body">
          {editorData.chatHistory.length === 0 ? (
            <div className="empty-hint">
              Submit a draft on the left, or challenge the Editor directly below.
            </div>
          ) : (
            editorData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`msg ${
                  msg.sender === 'user'
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface-1))]'
                    : ''
                }`}
                style={{ marginBottom: '12px' }}
              >
                <MarkdownRenderer content={msg.content} />
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))
          )}

          {isChatLoading && (
            <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Editor is pressure-testing arguments...</span>
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

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Challenge the editor or defend your thesis..."
          />
          <VoiceInputButton
            onTranscript={(transcript) =>
              setChatInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
            }
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="accent-btn"
            style={{ padding: '9px 12px', borderRadius: '8px' }}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
