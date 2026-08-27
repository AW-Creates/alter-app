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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
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
            {librarianData.sources.map((source) => (
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
                    className="px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--librarian)_12%,var(--surface-2))] hover:bg-[color-mix(in_srgb,var(--librarian)_20%,var(--surface-2))] border border-[color-mix(in_srgb,var(--librarian)_35%,transparent)] text-xs font-semibold text-[var(--librarian)] transition flex items-center gap-1.5 shadow-2xs group"
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
            ))}
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
                  <p className="font-semibold text-sm text-[var(--ink)]">Building Zero-to-Hero Progressive Masterclass...</p>
                  <p className="text-[11.5px] text-[var(--ink-3)]">Deconstructing core intuition, mechanics diagram, implementation code, and Socratic challenge.</p>
                </div>
              </div>
            ) : deepDiveData ? (
              <>
                {/* 5-Level Progress Stepper */}
                <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-2 bg-[var(--surface-1)] overflow-x-auto gap-1">
                  {[
                    { id: 'intuition', num: '1', label: 'Plain Intuition', icon: '🐣' },
                    { id: 'mechanics', num: '2', label: 'Deep Mechanics & Flow', icon: '⚙️' },
                    { id: 'code', num: '3', label: 'Tactical Implementation', icon: '💻' },
                    { id: 'traps', num: '4', label: 'Traps & Cut-List', icon: '⚠️' },
                    { id: 'sparring', num: '5', label: 'Socratic Sparring Check', icon: '🥊' }
                  ].map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setMasterclassTab(step.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                        masterclassTab === step.id
                          ? 'bg-[var(--librarian)] text-[#04050a] font-bold shadow-xs'
                          : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span>Level {step.num}: {step.label}</span>
                    </button>
                  ))}
                </div>

                {/* Masterclass Content Area */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs leading-relaxed">
                  {/* LEVEL 0: PLAIN INTUITION & LAYMAN ANALOGY */}
                  {masterclassTab === 'intuition' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Metaphor Card */}
                      <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_12%,var(--surface-2))] border-2 border-[var(--librarian)]/60 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-[var(--librarian)]">
                          <Lightbulb size={15} />
                          <span>The Plain-English Metaphor (Zero Jargon Required):</span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-[var(--ink)] m-0 leading-relaxed font-sans">
                          {deepDiveData.plainEnglishIntuition?.coreMetaphor || deepDiveData.bigIdea}
                        </p>
                      </div>

                      {/* Why Beginners Get Confused */}
                      {deepDiveData.plainEnglishIntuition?.whyNovicesGetConfused && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-mono text-[10.5px] uppercase font-bold text-amber-500 mb-0.5">
                              Why Beginners Get Confused by this Topic:
                            </div>
                            <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                              {deepDiveData.plainEnglishIntuition.whyNovicesGetConfused}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Layman Multi-Paragraph Breakdown */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                          📖 Foundations: What Is Actually Happening Here?
                        </div>
                        <div className="text-xs sm:text-[12.5px] text-[var(--ink)] leading-relaxed font-sans space-y-2">
                          <MarkdownRenderer
                            content={
                              deepDiveData.plainEnglishIntuition?.laymanExplanation ||
                              deepDiveData.bigIdea
                            }
                          />
                        </div>
                      </div>

                      {/* Mental Model Pills */}
                      <div className="space-y-2 pt-1">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                          🧠 Core Mental Models Extracted from this Work:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {deepDiveData.topMentalModels.map((mm, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                              <div className="font-bold text-[var(--ink)] text-xs flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[var(--librarian)] text-[#04050a] font-mono text-[10px] flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <span>{mm.model}</span>
                              </div>
                              <p className="text-[11px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                                {mm.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next Step Button */}
                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => setMasterclassTab('mechanics')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: Level 2 — See Under-the-Hood Mechanics →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LEVEL 1: FIRST-PRINCIPLES MECHANICS & FLOW */}
                  {masterclassTab === 'mechanics' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Flow Diagram */}
                      {deepDiveData.mechanicsAndAnatomy?.architecturalDiagramOrFlow && (
                        <div className="p-4 rounded-xl bg-[var(--void)] border border-[var(--hairline-strong)] space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-[var(--librarian)] flex items-center gap-1.5">
                            <Layers size={13} />
                            <span>Process Loop &amp; Architectural Flowchart:</span>
                          </div>
                          <pre className="p-3 bg-[var(--surface-1)] rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                            {deepDiveData.mechanicsAndAnatomy.architecturalDiagramOrFlow}
                          </pre>
                        </div>
                      )}

                      {/* Deep Explanation */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                          ⚙️ Step-by-Step Deep Anatomy:
                        </div>
                        <div className="text-xs sm:text-[12.5px] text-[var(--ink)] leading-relaxed font-sans">
                          <MarkdownRenderer
                            content={
                              deepDiveData.mechanicsAndAnatomy?.deepExplanationMarkdown ||
                              deepDiveData.practicalApplication
                            }
                          />
                        </div>
                      </div>

                      {/* Core Primitives */}
                      {deepDiveData.mechanicsAndAnatomy?.corePrimitives && (
                        <div className="space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)]">
                            🧩 The 3 Core Elements of this Concept:
                          </div>
                          <div className="space-y-2">
                            {deepDiveData.mechanicsAndAnatomy.corePrimitives.map((prim, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-[var(--librarian)]/20 text-[var(--librarian)] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[var(--ink)]">{prim.name}</span>
                                    <span className="text-[10px] font-mono uppercase bg-[var(--surface-3)] px-1.5 py-0.2 rounded text-[var(--ink-3)]">
                                      {prim.role}
                                    </span>
                                  </div>
                                  <p className="text-[11.5px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                                    {prim.explanation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step Navigation */}
                      <div className="pt-3 flex justify-between items-center">
                        <button onClick={() => setMasterclassTab('intuition')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Intuition</span>
                        </button>
                        <button
                          onClick={() => setMasterclassTab('code')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: Level 3 — Tactical Code Blueprint →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LEVEL 2: TACTICAL IMPLEMENTATION & CODE BLUEPRINT */}
                  {masterclassTab === 'code' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Step-by-Step Tactical Guide */}
                      {deepDiveData.implementationBlueprint?.stepByStepGuide && (
                        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
                            <Zap size={13} />
                            <span>Tactical Execution Playbook (How to Build It):</span>
                          </div>
                          <div className="space-y-1.5 pl-1">
                            {deepDiveData.implementationBlueprint.stepByStepGuide.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                                <span className="font-mono font-bold text-emerald-500 flex-shrink-0">
                                  {idx + 1}.
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code / Template Block */}
                      {deepDiveData.implementationBlueprint?.codeOrTemplate && (
                        <div className="p-4 rounded-xl bg-[var(--void)] border border-[var(--hairline-strong)] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-[11px] uppercase font-bold text-[var(--librarian)] flex items-center gap-1.5">
                              <Code2 size={13} />
                              <span>Executable Implementation Blueprint:</span>
                            </div>
                            <button
                              onClick={handleCopyCode}
                              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-[11px] font-mono text-[var(--ink)] transition flex items-center gap-1"
                            >
                              {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>
                          <pre className="p-3 bg-[var(--surface-1)] rounded-lg text-[11px] font-mono text-[var(--ink-2)] overflow-x-auto leading-relaxed border border-[var(--hairline)] m-0">
                            {deepDiveData.implementationBlueprint.codeOrTemplate}
                          </pre>
                        </div>
                      )}

                      {/* How Masters Use It */}
                      {deepDiveData.implementationBlueprint?.howMastersUseIt && (
                        <div className="p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))] border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] space-y-1">
                          <div className="font-mono text-[10.5px] uppercase font-bold text-[var(--accent)] flex items-center gap-1">
                            <Sparkles size={12} />
                            <span>How Top 1% Masters &amp; Production Teams Apply This:</span>
                          </div>
                          <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                            {deepDiveData.implementationBlueprint.howMastersUseIt}
                          </p>
                        </div>
                      )}

                      {/* Step Navigation */}
                      <div className="pt-3 flex justify-between items-center">
                        <button onClick={() => setMasterclassTab('mechanics')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Mechanics</span>
                        </button>
                        <button
                          onClick={() => setMasterclassTab('traps')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: Level 4 — Traps &amp; Cut-List →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LEVEL 3: TRAPS & CUT LIST */}
                  {masterclassTab === 'traps' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Common Pitfalls */}
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                        <div className="font-mono text-[11px] uppercase font-bold text-rose-500 flex items-center gap-1.5">
                          <AlertTriangle size={14} />
                          <span>Beginner Traps &amp; Common Failure Modes:</span>
                        </div>
                        <div className="space-y-2">
                          {(deepDiveData.trapsAndCutList?.commonPitfalls || [
                            'Premature optimization: Adding complexity before proving the basic loop works.',
                            'Ignoring error feedback and letting hallucinations compound silently.'
                          ]).map((trap, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-rose-500/20 text-xs text-[var(--ink)] leading-relaxed">
                              {trap}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cut-List Fluff */}
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                        <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5">
                          <Scissors size={13} />
                          <span>The Cut-List: What to Safely Ignore in this Book/Paper:</span>
                        </div>
                        <p className="text-xs text-[var(--ink)] m-0 leading-relaxed font-sans">
                          {deepDiveData.trapsAndCutList?.cutListFluff || deepDiveData.cutListFluff}
                        </p>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-3 flex justify-between items-center">
                        <button onClick={() => setMasterclassTab('code')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Code</span>
                        </button>
                        <button
                          onClick={() => setMasterclassTab('sparring')}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <span>Next: Level 5 — Socratic Sparring Check →</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LEVEL 4: SOCRATIC SPARRING CHECK & MASTERY CERTIFICATION */}
                  {masterclassTab === 'sparring' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Scenario Box */}
                      <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-2))] border-2 border-[var(--tutor)]/50 space-y-2 shadow-xs">
                        <div className="font-mono text-[11px] uppercase font-bold text-[var(--tutor)] flex items-center gap-1.5">
                          <GraduationCap size={15} />
                          <span>Socratic Sparring Challenge Checkpoint</span>
                        </div>
                        <p className="text-xs font-semibold text-[var(--ink)] m-0 leading-relaxed font-sans">
                          {deepDiveData.socraticSparring?.realWorldScenario ||
                            `Apply the core mechanics of ${deepDiveData.sourceTitle} to a real-world scenario.`}
                        </p>
                        <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--ink)] font-bold">
                          👉 {deepDiveData.socraticSparring?.challengeQuestion || 'How would you apply this model in production?'}
                        </div>
                      </div>

                      {/* Interactive Sparring Form */}
                      <form onSubmit={handleEvaluateSparring} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[var(--ink)]">
                            Your Solution / Socratic Answer:
                          </label>
                          <VoiceInputButton
                            onTranscript={(transcript) =>
                              setSparringAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript))
                            }
                          />
                        </div>
                        <textarea
                          placeholder="Type or voice-dictate your step-by-step reasoning plan here..."
                          value={sparringAnswer}
                          onChange={(e) => setSparringAnswer(e.target.value)}
                          rows={4}
                          className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--tutor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none leading-relaxed font-mono"
                          required
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isEvaluatingSparring || !sparringAnswer.trim()}
                            className="accent-btn"
                            style={{ padding: '8px 18px', borderRadius: '10px' }}
                          >
                            {isEvaluatingSparring ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Evaluating Socratic Logic...</span>
                              </>
                            ) : (
                              <>
                                <Flame size={14} />
                                <span>Verify Understanding &amp; Spar with Tutor →</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Socratic Evaluation Result */}
                      {sparringEvaluation && (
                        <div className="p-4 rounded-xl bg-[var(--surface-2)] border-2 border-emerald-500/40 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={18} className="text-emerald-500" />
                              <span className="font-bold text-sm text-[var(--ink)]">
                                {sparringEvaluation.mastered ? '✓ Source Concept Verified & Mastered!' : 'Feedback & Nuance Review'}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                              Score: {sparringEvaluation.score || 95}/100
                            </span>
                          </div>

                          <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed">
                            {sparringEvaluation.coachingVerdict || sparringEvaluation.strengths}
                          </p>

                          {sparringEvaluation.nuanceOrGap && (
                            <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-[11.5px] text-[var(--ink-2)]">
                              <strong>💡 Pro-Tip &amp; Edge Case:</strong> {sparringEvaluation.nuanceOrGap}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Final Masterclass Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
                        <button onClick={() => setMasterclassTab('traps')} className="ghost-btn">
                          <ArrowLeft size={12} />
                          <span>Back to Traps</span>
                        </button>

                        <button
                          onClick={handleSaveDeepDiveToNotes}
                          className="accent-btn"
                          style={{ padding: '8px 18px', borderRadius: '10px' }}
                        >
                          <Bookmark size={13} />
                          <span>Save Full Masterclass to Grounded Notes Vault →</span>
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
