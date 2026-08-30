import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  BookOpen,
  Send,
  Plus,
  ExternalLink,
  Sparkles,
  Bookmark,
  CheckCircle,
  FileText,
  Lightbulb,
  Loader2,
  Globe,
  GraduationCap,
  X,
  Check,
  Zap,
  Layers,
  ArrowRight,
  ArrowLeft,
  Code2,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Flame,
  RotateCcw,
  Scissors,
  HelpCircle
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import {
  chatWithPersona,
  generateSourcesWithAI,
  synthesizeSourceWithAI,
  evaluateLessonResponseWithAI
} from '../../services/gemini';
import { CuratedSource, ReadingStatus, SourceDeepDive } from '../../types/alter';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { LessonVideoAudioPlayer } from '../course/LessonVideoAudioPlayer';

export const LibrarianView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage, setActivePersona } = useJourney();
  const [activeSubTab, setActiveSubTab] = useState<'sources' | 'notes' | 'models'>('sources');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCurating, setIsCurating] = useState(false);

  // Zero-to-Hero Masterclass Teaching Modal state
  const [selectedSourceForDeepDive, setSelectedSourceForDeepDive] = useState<CuratedSource | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<SourceDeepDive | null>(null);
  const [isSynthesizingSource, setIsSynthesizingSource] = useState(false);
  const [masterclassTab, setMasterclassTab] = useState<'intuition' | 'mechanics' | 'code' | 'traps' | 'sparring'>('intuition');

  // Socratic Sparring State
  const [sparringAnswer, setSparringAnswer] = useState('');
  const [isEvaluatingSparring, setIsEvaluatingSparring] = useState(false);
  const [sparringEvaluation, setSparringEvaluation] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // New Note state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!activeJourney) return null;

  const { librarianData } = activeJourney;
  const groundedNotes = librarianData.groundedNotes || librarianData.vaultNotes || [];
  const flashcards = librarianData.flashcards || librarianData.conceptCards || [];

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const userMsg = (customMsg || inputText).trim();
    if (!userMsg || isLoading) return;

    if (!customMsg) setInputText('');
    addChatMessage('librarian', { sender: 'user', content: userMsg, persona: 'librarian' });
    setIsLoading(true);

    try {
      const history = librarianData.chatHistory.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.content
      }));

      const reply = await chatWithPersona('librarian', activeJourney, userMsg, history);
      addChatMessage('librarian', { sender: 'assistant', content: reply, persona: 'librarian' });
    } catch (err: any) {
      addChatMessage('librarian', {
        sender: 'assistant',
        content: `⚠️ Librarian desk error: ${err.message || 'Check connection.'}`,
        persona: 'librarian'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurateTopSources = async () => {
    setIsCurating(true);
    try {
      const newSources = await generateSourcesWithAI(
        activeJourney.topic,
        activeJourney.destination,
        activeJourney.baseline
      );
      updateActiveJourney((prev) => ({
        ...prev,
        librarianData: {
          ...prev.librarianData,
          sources: [
            ...newSources,
            ...prev.librarianData.sources.filter((s) => !newSources.some((ns) => ns.title === s.title))
          ]
        }
      }));
    } catch (err) {
      console.error('Error curating sources', err);
    } finally {
      setIsCurating(false);
    }
  };

  const updateSourceStatus = (sourceId: string, status: ReadingStatus) => {
    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        sources: prev.librarianData.sources.map((s) => (s.id === sourceId ? { ...s, status } : s))
      }
    }));
  };

  const handleOpenDeepDive = async (source: CuratedSource) => {
    setSelectedSourceForDeepDive(source);
    setIsSynthesizingSource(true);
    setDeepDiveData(null);
    setMasterclassTab('intuition');
    setSparringAnswer('');
    setSparringEvaluation(null);

    try {
      const deepDive = await synthesizeSourceWithAI(
        source.title,
        source.authorOrCreator,
        activeJourney.topic
      );
      setDeepDiveData(deepDive);
    } catch (err) {
      console.error('Failed to synthesize source', err);
    } finally {
      setIsSynthesizingSource(false);
    }
  };

  const handleEvaluateSparring = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sparringAnswer.trim() || !deepDiveData) return;

    setIsEvaluatingSparring(true);
    try {
      const evalResult = await evaluateLessonResponseWithAI(
        deepDiveData.sourceTitle,
        deepDiveData.socraticSparring?.challengeQuestion || deepDiveData.bigIdea,
        sparringAnswer
      );
      setSparringEvaluation(evalResult);

      if (evalResult.mastered && selectedSourceForDeepDive) {
        updateSourceStatus(selectedSourceForDeepDive.id, 'mastered');
      }
    } catch (err) {
      console.error('Failed to evaluate sparring', err);
    } finally {
      setIsEvaluatingSparring(false);
    }
  };

  const handleCopyCode = () => {
    if (!deepDiveData?.implementationBlueprint?.codeOrTemplate) return;
    navigator.clipboard.writeText(deepDiveData.implementationBlueprint.codeOrTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveDeepDiveToNotes = () => {
    if (!deepDiveData) return;

    const noteTitle = `Zero-to-Hero Masterclass: ${deepDiveData.sourceTitle}`;
    const noteContent = `## 🎓 Masterclass: ${deepDiveData.sourceTitle} (by ${deepDiveData.author})\n\n### 🐣 Level 0: Plain-English Intuition\n${deepDiveData.plainEnglishIntuition?.coreMetaphor || deepDiveData.bigIdea}\n\n${deepDiveData.plainEnglishIntuition?.laymanExplanation || ''}\n\n### ⚙️ Level 1: Under-the-Hood Mechanics\n\`\`\`\n${deepDiveData.mechanicsAndAnatomy?.architecturalDiagramOrFlow || ''}\n\`\`\`\n${deepDiveData.mechanicsAndAnatomy?.deepExplanationMarkdown || ''}\n\n### 💻 Level 2: Tactical Implementation\n${(deepDiveData.implementationBlueprint?.stepByStepGuide || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n\`\`\`\n${deepDiveData.implementationBlueprint?.codeOrTemplate || ''}\n\`\`\`\n\n### ⚠️ Level 3: Traps & Cut List\n* **Traps**: ${(deepDiveData.trapsAndCutList?.commonPitfalls || []).join('; ')}\n* **Skip**: ${deepDiveData.cutListFluff || deepDiveData.trapsAndCutList?.cutListFluff}`;

    const newNote = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      tags: [activeJourney.topic.toLowerCase().split(' ')[0], 'zero-to-hero-masterclass']
    };

    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        groundedNotes: [newNote, ...groundedNotes]
      }
    }));

    setSelectedSourceForDeepDive(null);
    setActiveSubTab('notes');
  };

  const handleAddGroundedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      tags: [activeJourney.topic.toLowerCase().split(' ')[0]]
    };

    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        groundedNotes: [newNote, ...groundedNotes]
      }
    }));

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="layout-2col">
      {/* Left Column: Knowledge Vault & Curated Sources */}
      <div className="space-y-6">
        {/* Librarian Header */}
        <div className="section-head">
          <div className="flex items-center gap-3">
            <div className="persona-avatar persona-avatar-librarian">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="persona-role text-[var(--librarian)]">Knowledge Librarian</div>
              <h2 className="font-display font-bold text-2xl text-[var(--ink)] m-0">
                Primary Sources &amp; Masterclass Vault
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCurateTopSources}
              disabled={isCurating}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--librarian)] text-xs font-semibold text-[var(--ink)] transition flex items-center gap-1.5 shadow-2xs"
            >
              {isCurating ? <Loader2 size={13} className="animate-spin text-[var(--librarian)]" /> : <Sparkles size={13} className="text-[var(--librarian)]" />}
              <span>Curate Top 1% Sources</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-2">
          {[
            { id: 'sources', label: 'Curated Canonical Works', count: librarianData.sources.length },
            { id: 'notes', label: 'Grounded Notes Vault', count: groundedNotes.length },
            { id: 'models', label: 'Mental Model Cards', count: flashcards.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeSubTab === tab.id
                  ? 'bg-[color-mix(in_srgb,var(--librarian)_12%,var(--surface-2))] text-[var(--ink)] font-bold border border-[color-mix(in_srgb,var(--librarian)_30%,transparent)]'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[var(--surface-3)] rounded text-[var(--ink-3)]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Curated Sources */}
        {activeSubTab === 'sources' && (
          <div className="space-y-3.5">
            {librarianData.sources.length === 0 ? (
              <div className="card p-8 text-center space-y-3 border-[var(--librarian)]/30">
                <BookOpen size={32} className="text-[var(--librarian)] mx-auto opacity-70" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-base text-[var(--ink)]">
                    No Primary Sources Curated Yet
                  </h4>
                  <p className="text-xs text-[var(--ink-3)] max-w-md mx-auto leading-relaxed font-sans">
                    The Librarian curates the top 1% definitive books, research papers, and case studies for <strong>{activeJourney.topic}</strong>.
                  </p>
                </div>
                <button
                  onClick={handleCurateTopSources}
                  disabled={isCurating}
                  className="accent-btn mx-auto cursor-pointer"
                  style={{ background: 'var(--librarian)', padding: '8px 20px', borderRadius: '10px' }}
                >
                  {isCurating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Curating Top 1% Sources...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Curate Top 1% Sources Now →</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              librarianData.sources.map((source) => (
                <div key={source.id} className="source-card">
                  <div className="source-head">
                    <div>
                      <p className="source-title">{source.title}</p>
                      <p className="source-author">By {source.authorOrCreator}</p>
                    </div>
                    <span className="signal-badge">
                      Signal {source.signalScore}/10
                    </span>
                  </div>

                  <p className="source-row">
                    <b>Why essential —</b> {source.whyEssential}
                  </p>
                  <p className="source-row" style={{ marginTop: '4px' }}>
                    <b>Key takeaway —</b> {source.keyTakeaway}
                  </p>

                  {/* Direct Zero-to-Hero Teaching Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenDeepDive(source)}
                      className="px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--librarian)_12%,var(--surface-2))] hover:bg-[color-mix(in_srgb,var(--librarian)_20%,var(--surface-2))] border border-[color-mix(in_srgb,var(--librarian)_35%,transparent)] text-xs font-semibold text-[var(--librarian)] transition flex items-center gap-1.5 shadow-2xs group cursor-pointer"
                    >
                      <GraduationCap size={14} className="group-hover:scale-110 transition-transform" />
                      <span>🎓 Teach Me This Source (Zero to Hero Masterclass) →</span>
                    </button>
                  </div>

                  <div className="source-footer">
                    <div className="status-pills">
                      {(['unread', 'reading', 'mastered'] as ReadingStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateSourceStatus(source.id, st)}
                          className={`status-pill capitalize ${
                            source.status === st ? 'active' : ''
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-link"
                      >
                        <span>Open primary source ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Grounded Notes */}
        {activeSubTab === 'notes' && (
          <div className="space-y-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="card-label" style={{ margin: 0 }}>NotebookLM-Style Knowledge Vault</span>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="ghost-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <Plus size={13} />
                <span>New Grounded Note</span>
              </button>
            </div>

            {isAddingNote && (
              <form onSubmit={handleAddGroundedNote} className="card space-y-3">
                <p className="card-label">Create Grounded Note</p>
                <input
                  type="text"
                  placeholder="Note Title / Synthesis Topic..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--accent)] text-[var(--ink)] text-xs rounded-lg p-2.5 outline-none"
                  required
                />
                <textarea
                  placeholder="Distill the core thesis, quote citations, and connect insights..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--accent)] text-[var(--ink)] text-xs rounded-lg p-2.5 outline-none font-mono"
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="ghost-btn"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="accent-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {groundedNotes.map((note) => (
              <div key={note.id} className="card space-y-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: 'var(--ink)' }}>{note.title}</h4>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>{note.createdAt}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
                  <MarkdownRenderer content={note.content} />
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 pt-1">
                    {note.tags.map((t, idx) => (
                      <span key={idx} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Mental Models */}
        {activeSubTab === 'models' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flashcards.length > 0 ? (
              flashcards.map((card) => (
                <div key={card.id} className="card space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--librarian)]">
                    <Lightbulb size={13} />
                    <span>{card.term || card.front || 'Core Principle'}</span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                    {card.definition || card.back || card.mentalModel}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-xs text-[var(--ink-3)]">
                No flashcards created yet. Ask the Librarian to extract mental model flashcards from your curated sources!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Sticky Librarian Chat Desk */}
      <div className="chat-panel">
        <div className="chat-head">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--librarian)] animate-pulse" />
            <h3 className="font-display font-semibold text-sm text-[var(--ink)] m-0">
              Librarian Research Desk
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[var(--ink-3)]">NotebookLM Mode</span>
        </div>

        <div className="chat-body">
          {librarianData.chatHistory.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-xs text-[var(--ink-3)]">
              <BookOpen size={28} className="mx-auto text-[var(--librarian)] opacity-50" />
              <p className="font-medium text-[var(--ink-2)]">Welcome to the Research Librarian Desk.</p>
              <p className="text-[11.5px] max-w-[240px] mx-auto">
                Ask me to cross-reference primary sources, synthesize literature, or extract first-principles mental models.
              </p>
            </div>
          ) : (
            librarianData.chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[var(--librarian)] text-[#04050a] font-medium'
                      : 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--hairline)]'
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[var(--ink-3)] font-mono p-2">
              <Loader2 size={13} className="animate-spin text-[var(--librarian)]" />
              <span>Librarian is synthesizing sources...</span>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Librarian about any paper, book, or grounded concept..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--librarian)] text-[var(--ink)] text-xs rounded-xl px-3.5 py-2.5 outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-[var(--librarian)] text-[#04050a] hover:brightness-110 disabled:opacity-50 transition"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* FULL ZERO-TO-HERO INTERACTIVE MASTERCLASS MODAL */}
      {selectedSourceForDeepDive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--surface-1)] border-2 border-[var(--librarian)]/40 rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)]">
            {/* Masterclass Header */}
            <div className="p-5 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--surface-2)]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_18%,transparent)] border border-[color-mix(in_srgb,var(--librarian)_35%,transparent)] text-[var(--librarian)] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[var(--librarian)] uppercase font-bold tracking-wider bg-[color-mix(in_srgb,var(--librarian)_12%,transparent)] px-2 py-0.5 rounded border border-[color-mix(in_srgb,var(--librarian)_25%,transparent)]">
                      Zero-to-Hero Interactive Masterclass
                    </span>
                    <span className="text-xs font-mono text-[var(--ink-3)]">
                      ⏱️ {deepDiveData?.estimatedTime || '8 min read'} · Signal 10/10
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] m-0 mt-0.5">
                    {selectedSourceForDeepDive.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedSourceForDeepDive(null);
                    setActivePersona('tutor');
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--ink)] font-medium transition"
                  title="Open in Socratic Tutor Studio"
                >
                  <Sparkles size={12} className="text-[var(--tutor)]" />
                  <span>Open in Tutor</span>
                </button>

                <button
                  onClick={() => setSelectedSourceForDeepDive(null)}
                  className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isSynthesizingSource ? (
              <div className="p-16 flex flex-col items-center justify-center space-y-4 text-xs text-[var(--ink-2)]">
                <Loader2 size={32} className="animate-spin text-[var(--librarian)]" />
                <div className="text-center space-y-1">
                  <p className="font-semibold text-sm text-[var(--ink)]">Building Canonical Reading Guide...</p>
                  <p className="text-[11.5px] text-[var(--ink-3)]">Deconstructing core thesis, high-yield chapters, and mental model heuristics.</p>
                </div>
              </div>
            ) : deepDiveData ? (
              <>
                {/* Canonical Reading Guide Navigation */}
                <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-2 bg-[var(--surface-1)] overflow-x-auto gap-2">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'intuition', label: '📖 Seminal Thesis & Synthesis', icon: '💡' },
                      { id: 'mechanics', label: '🗺️ High-Yield Chapter Map', icon: '📑' },
                      { id: 'code', label: '🧠 Mental Models & Heuristics', icon: '⚡' }
                    ].map((step) => (
                      <button
                        key={step.id}
                        onClick={() => setMasterclassTab(step.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                          masterclassTab === step.id
                            ? 'bg-[var(--librarian)] text-[#04050a] font-bold shadow-xs'
                            : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        <span>{step.icon}</span>
                        <span>{step.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const prompt = `I've just reviewed the canonical synthesis of "${selectedSourceForDeepDive.title}". How does its core thesis specifically apply to my project goal (${activeJourney.destination})?`;
                      setSelectedSourceForDeepDive(null);
                      handleSendMessage({ preventDefault: () => {} } as any, prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_15%,var(--surface-2))] border border-[var(--librarian)] text-[var(--librarian)] hover:bg-[var(--librarian)] hover:text-[#04050a] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>💬 Discuss at Desk</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Synthesis Content Area */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs leading-relaxed">
                  {/* Multimedia Overview Audio / Visual Deck */}
                  <LessonVideoAudioPlayer
                    concept={selectedSourceForDeepDive.title}
                    topic={activeJourney.topic}
                    lessonTitle={deepDiveData?.sourceTitle || selectedSourceForDeepDive.title}
                    plainEnglishAnalogy={deepDiveData?.plainEnglishIntuition?.coreMetaphor || deepDiveData?.bigIdea}
                    coreExplanation={deepDiveData?.mechanicsAndAnatomy?.deepExplanationMarkdown || deepDiveData?.bigIdea}
                    socraticChallenge={deepDiveData?.socraticSparring?.challengeQuestion}
                  />

                  {/* TAB 1: SEMINAL THESIS & SYNTHESIS */}
                  {masterclassTab === 'intuition' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Big Idea Thesis Card */}
                      <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_12%,var(--surface-2))] border-2 border-[var(--librarian)]/60 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-[var(--librarian)]">
                          <Lightbulb size={15} />
                          <span>The Seminal Paradigm Shift / Core Thesis:</span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-[var(--ink)] m-0 leading-relaxed font-sans">
                          {deepDiveData.bigIdea || deepDiveData.plainEnglishIntuition?.coreMetaphor}
                        </p>
                      </div>

                      {/* Plain-English Breakdown */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                          📖 Foundations &amp; Plain-English Deconstruction:
                        </div>
                        <div className="text-xs sm:text-[12.5px] text-[var(--ink)] leading-relaxed font-sans space-y-2">
                          <MarkdownRenderer
                            content={
                              deepDiveData.plainEnglishIntuition?.laymanExplanation ||
                              deepDiveData.mechanicsAndAnatomy?.deepExplanationMarkdown ||
                              deepDiveData.bigIdea
                            }
                          />
                        </div>
                      </div>

                      {/* Why Beginners Get Confused */}
                      {deepDiveData.plainEnglishIntuition?.whyNovicesGetConfused && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-mono text-[10.5px] uppercase font-bold text-amber-500 mb-0.5">
                              Why Beginners Get Confused by this Work:
                            </div>
                            <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                              {deepDiveData.plainEnglishIntuition.whyNovicesGetConfused}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Next Step */}
                      <div className="pt-2 flex justify-between items-center">
                        <button
                          onClick={handleSaveDeepDiveToNotes}
                          className="ghost-btn text-xs"
                        >
                          <Bookmark size={12} />
                          <span>Save to Vault Notes</span>
                        </button>
                        <button
                          onClick={() => setMasterclassTab('mechanics')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: High-Yield Chapter Map →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HIGH-YIELD CHAPTER MAP & TRIAGE */}
                  {masterclassTab === 'mechanics' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Flow Diagram */}
                      {deepDiveData.mechanicsAndAnatomy?.architecturalDiagramOrFlow && (
                        <div className="p-4 rounded-xl bg-[var(--void)] border border-[var(--hairline-strong)] space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-[var(--librarian)] flex items-center gap-1.5">
                            <Layers size={13} />
                            <span>System Architecture &amp; Conceptual Flow:</span>
                          </div>
                          <pre className="p-3 bg-[var(--surface-1)] rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                            {deepDiveData.mechanicsAndAnatomy.architecturalDiagramOrFlow}
                          </pre>
                        </div>
                      )}

                      {/* High Yield Map & The Cut List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>High-Yield Focus Sections (Read Deeply):</span>
                          </div>
                          <p className="text-xs text-[var(--ink)] leading-relaxed m-0 font-sans">
                            {deepDiveData.practicalApplication ||
                              'Focus on core conceptual definitions, architectural tradeoffs, and canonical design patterns.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                            <Scissors size={14} />
                            <span>The Cut List: What to Safely Skip:</span>
                          </div>
                          <p className="text-xs text-[var(--ink)] leading-relaxed m-0 font-sans">
                            {deepDiveData.cutListFluff ||
                              deepDiveData.trapsAndCutList?.cutListFluff ||
                              'Historical context chapters, deprecated syntax examples, and theoretical edge cases with low real-world relevance.'}
                          </p>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between items-center">
                        <button onClick={() => setMasterclassTab('intuition')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Thesis</span>
                        </button>
                        <button
                          onClick={() => setMasterclassTab('code')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: Mental Models &amp; Heuristics →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MENTAL MODELS & HEURISTICS */}
                  {masterclassTab === 'code' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Mental Model Cards */}
                      <div className="space-y-2.5">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                          🧠 Core Mental Models Extracted from this Work:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {deepDiveData.topMentalModels.map((mm, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
                              <div className="font-bold text-[var(--ink)] text-xs flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[var(--librarian)] text-[#04050a] font-mono text-[10px] flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <span>{mm.model}</span>
                              </div>
                              <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                                {mm.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practical Application */}
                      {deepDiveData.practicalApplication && (
                        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-[var(--accent)] flex items-center gap-1.5">
                            <Sparkles size={13} />
                            <span>Practical Production Takeaway:</span>
                          </div>
                          <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                            {deepDiveData.practicalApplication}
                          </p>
                        </div>
                      )}

                      {/* Conversational Launch CTA */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--librarian)_15%,var(--surface-2))] to-[var(--surface-2)] border-2 border-[var(--librarian)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
                            <BookOpen size={14} className="text-[var(--librarian)]" />
                            <span>Debate &amp; Apply this Source with the Librarian</span>
                          </div>
                          <p className="text-[11px] text-[var(--ink-2)] m-0 font-sans">
                            Ask questions, test analogies, and explore edge cases in real-time conversation.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const prompt = `I've just reviewed "${selectedSourceForDeepDive.title}". Let's discuss how its primary mental model ("${deepDiveData.topMentalModels[0]?.model || 'Core Thesis'}") relates to building my milestone project.`;
                            setSelectedSourceForDeepDive(null);
                            handleSendMessage({ preventDefault: () => {} } as any, prompt);
                          }}
                          className="accent-btn shrink-0"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Start Live Discussion at Desk →</span>
                        </button>
                      </div>

                      {/* Navigation Footer */}
                      <div className="pt-2 flex justify-between items-center">
                        <button onClick={() => setMasterclassTab('mechanics')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Chapter Map</span>
                        </button>
                        <button
                          onClick={handleSaveDeepDiveToNotes}
                          className="ghost-btn text-xs"
                        >
                          <Bookmark size={12} />
                          <span>Save Guide to Vault Notes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
