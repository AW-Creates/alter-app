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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[22px] items-start animate-fade-in">
      {/* Left Column: Hero, Subtabs, Sources/Notes */}
      <div>
        {/* Hero Card */}
        <div className="hero-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2.5 relative z-10">
            <div>
              <div className="role-chip">
                <span className="dot"></span>
                <span>L — KNOWLEDGE LIBRARIAN &amp; GROUNDED VAULT</span>
              </div>
              <h1 className="font-display font-semibold text-2xl sm:text-[34px] tracking-tight text-white m-0 mb-3">
                Curated Signals &amp; Grounding Notes
              </h1>
            </div>
            <button
              onClick={handleCurateTopSources}
              disabled={isCurating}
              className="accent-btn flex-shrink-0"
            >
              {isCurating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Curate top 1% sources</span>
            </button>
          </div>
          <p className="text-[14.5px] text-white/60 max-w-[74ch] leading-relaxed m-0 relative z-10">
            Filter the 99% noise of tutorials and surface the top 1% highest-signal books, seminal papers,
            and first-principles mental models.
          </p>
        </div>

        {/* Subtabs */}
        <div className="subtabs">
          <button
            onClick={() => setActiveSubTab('sources')}
            className={`subtab ${activeSubTab === 'sources' ? 'active' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curated sources ({librarianData.sources.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`subtab ${activeSubTab === 'notes' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Grounded notes ({groundedNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('models')}
            className={`subtab ${activeSubTab === 'models' ? 'active' : ''}`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Mental models ({flashcards.length})</span>
          </button>
        </div>

        {/* Tab 1: Sources */}
        {activeSubTab === 'sources' && (
          <div className="space-y-3.5">
            {librarianData.sources.map((source) => (
              <div key={source.id} className="source-card">
                <div className="source-head">
                  <div>
                    <p className="source-title text-white font-semibold text-[16.5px] m-0 mb-1 leading-snug">
                      {source.title}
                    </p>
                    <p className="source-author text-xs text-white/40 m-0">
                      By {source.authorOrCreator}
                    </p>
                  </div>
                  <span className="signal-badge">
                    Signal {source.signalScore}/10
                  </span>
                </div>

                <p className="text-[13.5px] text-white/70 leading-relaxed mt-2.5 mb-1">
                  <b className="text-white">Why essential —</b> {source.whyEssential}
                </p>
                <p className="text-[13.5px] text-white/70 leading-relaxed m-0">
                  <b className="text-white">Key takeaway —</b> {source.keyTakeaway}
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
                      className="open-link text-[12.5px] text-[var(--accent)] flex items-center gap-1 hover:underline"
                    >
                      <span>Open source</span>
                      <ExternalLink className="w-3 h-3" />
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
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-white/40 font-mono">NotebookLM-Style Knowledge Artifacts</span>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="ghost-btn text-xs py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Grounded Note</span>
              </button>
            </div>

            {isAddingNote && (
              <form onSubmit={handleAddGroundedNote} className="altor-card space-y-3">
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
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-3 py-1 text-xs text-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="accent-btn text-xs py-1.5 px-4">
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {groundedNotes.map((note) => (
              <div key={note.id} className="altor-card space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[15px] text-white m-0">{note.title}</h4>
                  <span className="text-[10px] font-mono text-white/30">{note.createdAt}</span>
                </div>
                <div className="text-xs text-white/70 leading-relaxed font-sans">
                  <MarkdownRenderer content={note.content} />
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  {note.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[var(--surface-1)] border border-white/[0.07] text-[10px] font-mono text-[var(--accent)]"
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
              <div key={card.id} className="altor-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[var(--accent)]">
                    Mental Model
                  </span>
                  <span className="text-[10px] font-mono text-white/30">Mastery Card</span>
                </div>
                <h4 className="font-semibold text-white text-sm m-0">{card.front || card.term}</h4>
                <p className="text-xs text-white/60 leading-relaxed m-0 border-t border-white/[0.07] pt-2">
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
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[14.5px] font-semibold text-white m-0">Research librarian desk</h4>
            <p className="text-xs text-white/40 m-0">Literature synthesis, papers &amp; cheat sheets</p>
          </div>
        </div>

        <div className="chat-body space-y-3">
          {librarianData.chatHistory.length === 0 ? (
            <div className="text-xs text-white/40 text-center py-16 px-4">
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
              >
                <MarkdownRenderer content={msg.content} />
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-2 items-center text-[var(--accent)] text-xs font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Librarian is retrieving seminal sources...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => setInputText(qp)}
              className="sugg text-[11.5px]"
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
            className="send-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
