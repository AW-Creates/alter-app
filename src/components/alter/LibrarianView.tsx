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
  Layers
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateSourcesWithAI, synthesizeSourceWithAI } from '../../services/gemini';
import { CuratedSource, ReadingStatus, SourceDeepDive } from '../../types/alter';

export const LibrarianView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [activeSubTab, setActiveSubTab] = useState<'sources' | 'notes' | 'models'>('sources');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCurating, setIsCurating] = useState(false);

  // Deep-Dive Teaching Modal state
  const [selectedSourceForDeepDive, setSelectedSourceForDeepDive] = useState<CuratedSource | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<SourceDeepDive | null>(null);
  const [isSynthesizingSource, setIsSynthesizingSource] = useState(false);

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

  const handleSaveDeepDiveToNotes = () => {
    if (!deepDiveData) return;

    const noteTitle = `Core Lessons: ${deepDiveData.sourceTitle}`;
    const noteContent = `### Big Idea\n${deepDiveData.bigIdea}\n\n### Core Mental Models\n${deepDiveData.topMentalModels
      .map((m) => `* **${m.model}**: ${m.explanation}`)
      .join('\n')}\n\n### Practical Application\n${deepDiveData.practicalApplication}\n\n### Cut-List (What to Skip)\n${deepDiveData.cutListFluff}`;

    const newNote = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      tags: [activeJourney.topic.toLowerCase().split(' ')[0], 'source-deep-dive']
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

  const quickPrompts = [
    'Synthesize the 3 core mental models from our sources',
    'Teach me the single most important rule from these books',
    'What parts of these texts should I skip under the Cut-List?'
  ];

  return (
    <div className="layout animate-fade-in">
      {/* Left Column: Hero, Subtabs, Sources/Notes */}
      <div className="space-y-4">
        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="role-chip">
                <span className="dot"></span>
                L — KNOWLEDGE LIBRARIAN &amp; GROUNDED VAULT
              </div>
              <h1>Curated Signals &amp; Core Source Lessons</h1>
            </div>
            <button
              onClick={handleCurateTopSources}
              disabled={isCurating}
              className="accent-btn"
            >
              {isCurating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Curate top 1% sources</span>
            </button>
          </div>
          <p className="hero-sub">
            Filter the 99% noise of generic tutorials. Altor surfaces seminal books &amp; papers and directly teaches you the core mental models within each.
          </p>
          <div className="flex items-center gap-2 pt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--librarian)] bg-[color-mix(in_srgb,var(--librarian)_10%,transparent)] border border-[color-mix(in_srgb,var(--librarian)_25%,transparent)] px-2.5 py-0.5 rounded-full font-medium">
              <Globe size={11} />
              Live Web Grounded (Google Search &amp; Perplexity)
            </span>
          </div>
        </div>

        {/* Subtabs */}
        <div className="subtabs">
          <button
            onClick={() => setActiveSubTab('sources')}
            className={`subtab ${activeSubTab === 'sources' ? 'active' : ''}`}
          >
            📖 Curated sources ({librarianData.sources.length})
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`subtab ${activeSubTab === 'notes' ? 'active' : ''}`}
          >
            📝 Grounded notes ({groundedNotes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('models')}
            className={`subtab ${activeSubTab === 'models' ? 'active' : ''}`}
          >
            💡 Mental models ({flashcards.length})
          </button>
        </div>

        {/* Tab 1: Sources */}
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

                {/* Direct Teaching Button on Source Card */}
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenDeepDive(source)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--librarian)] text-xs font-semibold text-[var(--librarian)] transition flex items-center gap-1.5"
                  >
                    <GraduationCap size={13} />
                    <span>Teach Me the Core Lessons of this Source →</span>
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
                      <span>Open source ↗</span>
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

      {/* Right Column: Sticky Librarian Chat */}
      <div>
        <div className="sidebar-card">
          <div className="chat-head">
            <div className="chat-avatar">
              <BookOpen size={16} />
            </div>
            <div>
              <h4>Knowledge librarian desk</h4>
              <p>Source synthesis &amp; research queries</p>
            </div>
          </div>

          <div className="chat-body">
            {librarianData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`msg mb-3 ${
                  msg.sender === 'user'
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface-1))]'
                    : ''
                }`}
              >
                <MarkdownRenderer content={msg.content} />
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))}

            {isLoading && (
              <div className="msg flex items-center gap-2 text-xs text-[var(--ink-2)] italic">
                <Loader2 size={13} className="animate-spin text-[var(--accent)]" />
                <span>Librarian is retrieving and synthesizing authoritative materials...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="suggestions">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p);
                }}
                className="sugg text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              placeholder="Ask the Librarian to teach or synthesize any source..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="accent-btn"
              style={{ padding: '9px 12px', borderRadius: '8px' }}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* Source Deep-Dive Teaching Modal */}
      {selectedSourceForDeepDive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--ink)]">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_15%,transparent)] text-[var(--librarian)] flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="text-[10.5px] font-mono text-[var(--librarian)] uppercase font-bold tracking-wider">
                    Executive Source Masterclass
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--ink)] m-0">
                    {selectedSourceForDeepDive.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedSourceForDeepDive(null)}
                className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
              >
                <X size={16} />
              </button>
            </div>

            {isSynthesizingSource ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-xs text-[var(--ink-2)]">
                <Loader2 size={24} className="animate-spin text-[var(--librarian)]" />
                <span>Librarian is extracting top mental models and practical takeaways...</span>
              </div>
            ) : deepDiveData ? (
              <div className="space-y-4 text-xs leading-relaxed">
                {/* Big Idea */}
                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_10%,var(--surface-2))] border border-[color-mix(in_srgb,var(--librarian)_25%,transparent)]">
                  <div className="font-mono text-[11px] uppercase font-bold text-[var(--librarian)] mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>The Big Idea (Paradigm Shift)</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--ink)] m-0 leading-relaxed font-sans">
                    {deepDiveData.bigIdea}
                  </p>
                </div>

                {/* Mental Models */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] uppercase font-bold text-[var(--ink-3)] tracking-wider">
                    🧠 Top 3 First-Principles Mental Models:
                  </div>
                  <div className="space-y-2">
                    {deepDiveData.topMentalModels.map((mm, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                        <div className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-[var(--surface-3)] font-mono text-[10px] flex items-center justify-center text-[var(--librarian)]">
                            {idx + 1}
                          </span>
                          <span>{mm.model}</span>
                        </div>
                        <p className="text-[11.5px] text-[var(--ink-2)] pl-5 m-0 leading-relaxed">
                          {mm.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Application */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                  <div className="font-mono text-[11px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                    <Zap size={13} />
                    <span>How to Apply This Right Now in Your Projects:</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--ink)] m-0 leading-relaxed font-sans">
                    {deepDiveData.practicalApplication}
                  </p>
                </div>

                {/* Cut-List Fluff */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-amber-500/20 space-y-1">
                  <div className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1">
                    <span>✂️ The Cut-List: What to Skip in this Book/Paper</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                    {deepDiveData.cutListFluff}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--hairline)]">
                  <button
                    onClick={() => setSelectedSourceForDeepDive(null)}
                    className="ghost-btn"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveDeepDiveToNotes}
                    className="accent-btn"
                  >
                    <Bookmark size={13} />
                    <span>Save to Grounded Notes Vault</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
