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
  Loader2
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateSourcesWithAI } from '../../services/gemini';
import { CuratedSource, ReadingStatus } from '../../types/alter';

export const LibrarianView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [activeSubTab, setActiveSubTab] = useState<'sources' | 'notes' | 'models'>('sources');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCurating, setIsCurating] = useState(false);

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
          sources: [...newSources, ...prev.librarianData.sources.filter(s => !newSources.some(ns => ns.title === s.title))]
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

  const handleAddGroundedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote = {
      id: 'note_' + Date.now(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      sourceReferences: [activeJourney.topic],
      tags: ['First Principles', 'Grounded'],
      createdAt: new Date().toLocaleDateString()
    };

    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        groundedNotes: [newNote, ...(prev.librarianData.groundedNotes || prev.librarianData.vaultNotes || [])]
      }
    }));

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const quickPrompts = [
    'Summarize the top 3 papers in 1 paragraph each',
    'Give me a first-principles cheatsheet',
    'What is the single most important book?'
  ];

  return (
    <div className="layout animate-fade-in">
      {/* Left Column: Hero, Subtabs, Sources/Notes */}
      <div>
        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="role-chip">
                <span className="dot"></span>
                L — KNOWLEDGE LIBRARIAN &amp; GROUNDED VAULT
              </div>
              <h1>Curated Signals &amp; Grounding Notes</h1>
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
            Filter the 99% noise of YouTube tutorials and surface the top 1% highest-signal books, seminal papers,
            and first-principles mental models.
          </p>
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
                  className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-2.5 outline-none"
                  required
                />
                <textarea
                  placeholder="Distill the core thesis, quote citations, and connect insights..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-2.5 outline-none font-mono"
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
                  <h4 style={{ margin: 0 }}>{note.title}</h4>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>{note.createdAt}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
                  <MarkdownRenderer content={note.content} />
                </div>
                <div style={{ display: 'flex', gap: '6px', paddingTop: '6px' }}>
                  {note.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--hairline)',
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent)'
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Mental Models Flashcards */}
        {activeSubTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {flashcards.map((card) => (
              <div key={card.id} className="card space-y-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-label" style={{ margin: 0, color: 'var(--accent)' }}>
                    Mental Model
                  </span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>Mastery Card</span>
                </div>
                <h4 style={{ margin: 0 }}>{card.front || card.term}</h4>
                <p className="source-row" style={{ marginTop: '6px', borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
                  {card.back || card.definition || card.mentalModel}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Research Librarian Desk Chat */}
      <div className="sidebar-card">
        <div className="chat-head">
          <div className="chat-avatar">
            <BookOpen size={17} />
          </div>
          <div>
            <h4>Research librarian desk</h4>
            <p>Literature synthesis, papers &amp; cheat sheets</p>
          </div>
        </div>

        <div className="chat-body">
          {librarianData.chatHistory.length === 0 ? (
            <div className="empty-hint">
              Ask for a synthesis and the Librarian's answer will appear here.
            </div>
          ) : (
            librarianData.chatHistory.map((msg) => (
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
            ))
          )}

          {isLoading && (
            <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Librarian is retrieving seminal sources...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="suggestions">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => setInputText(qp)}
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask for high-signal sources, summaries, or citations..."
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="send"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
