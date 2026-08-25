import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  BookOpen,
  Bookmark,
  FileText,
  Video,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Tag,
  Lightbulb,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { chatWithPersona, generateSourcesWithAI } from '../../services/gemini';
import { CuratedSource, VaultNote } from '../../types/alter';

export const LibrarianView: React.FC = () => {
  const { activeJourney, updateActiveJourney, addChatMessage } = useJourney();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCurating, setIsCurating] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'vault' | 'concepts'>('sources');

  // New Note Modal state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!activeJourney) return null;

  const { librarianData } = activeJourney;

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
        content: `⚠️ Error: ${err.message}`,
        persona: 'librarian'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurateMore = async () => {
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
          sources: [...prev.librarianData.sources, ...newSources]
        }
      }));
    } catch (err) {
      console.error('Failed to curate sources', err);
    } finally {
      setIsCurating(false);
    }
  };

  const updateSourceStatus = (sourceId: string, status: CuratedSource['status']) => {
    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        sources: prev.librarianData.sources.map((s) => (s.id === sourceId ? { ...s, status } : s))
      }
    }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: VaultNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: newNoteTag ? [newNoteTag.trim()] : ['Core Notes'],
      createdAt: new Date().toLocaleDateString()
    };

    updateActiveJourney((prev) => ({
      ...prev,
      librarianData: {
        ...prev.librarianData,
        vaultNotes: [newNote, ...prev.librarianData.vaultNotes]
      }
    }));

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTag('');
    setIsAddingNote(false);
  };

  const getTypeIcon = (type: CuratedSource['type']) => {
    switch (type) {
      case 'book':
        return <BookOpen className="w-4 h-4 text-librarian" />;
      case 'paper':
        return <FileText className="w-4 h-4 text-tutor" />;
      case 'lecture':
        return <Video className="w-4 h-4 text-advisor" />;
      default:
        return <Bookmark className="w-4 h-4 text-editor" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 border border-hairline p-6 md:p-8 shadow-card">
        <div className="pointer-events-none absolute -top-[40%] -left-[10%] w-[60%] h-[180%] bg-[radial-gradient(circle,rgba(45,212,191,0.14),transparent_65%)]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-librarian/8 text-librarian border border-librarian/30 text-[11px] font-mono tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-librarian" />
              L — KNOWLEDGE LIBRARIAN &amp; GROUNDED VAULT
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Curated Signals &amp; Grounding Notes
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Filter the 99% noise of YouTube tutorials and surface the top 1% highest-signal books, seminal papers, and first-principles mental models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCurateMore}
              disabled={isCurating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-librarian hover:brightness-110 text-slate-950 font-semibold text-xs transition disabled:opacity-50 flex-shrink-0"
            >
              {isCurating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Curate top 1% sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sources & Grounding Vault */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-tabs */}
          <div className="flex items-center gap-5 border-b border-hairline overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-[13px] font-medium transition whitespace-nowrap ${
                activeTab === 'sources'
                  ? 'text-white border-librarian'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Curated sources ({librarianData.sources.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-[13px] font-medium transition whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'text-white border-librarian'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Grounded notes ({librarianData.vaultNotes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-[13px] font-medium transition whitespace-nowrap ${
                activeTab === 'concepts'
                  ? 'text-white border-librarian'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Mental models</span>
            </button>
          </div>

          {/* Sources List */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {librarianData.sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-2xl bg-surface-1 border border-hairline p-5 space-y-3 hover:border-hairline-strong transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-hairline flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(source.type)}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-100 leading-snug">{source.title}</h3>
                        <p className="text-xs text-slate-500">By {source.authorOrCreator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-md bg-tutor/10 text-tutor border border-tutor/25 text-[11px] font-mono">
                        Signal {source.signalScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-slate-100 font-semibold">Why essential —</strong> {source.whyEssential}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      <strong className="text-slate-300 font-semibold">Key takeaway —</strong> {source.keyTakeaway}
                    </p>
                  </div>

                  {/* Footer status buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateSourceStatus(source.id, 'unread')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
                          source.status === 'unread'
                            ? 'bg-librarian/12 text-librarian border-librarian/30'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-hairline-strong'
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => updateSourceStatus(source.id, 'in_progress')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
                          source.status === 'in_progress'
                            ? 'bg-librarian/12 text-librarian border-librarian/30'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-hairline-strong'
                        }`}
                      >
                        Reading
                      </button>
                      <button
                        onClick={() => updateSourceStatus(source.id, 'mastered')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
                          source.status === 'mastered'
                            ? 'bg-librarian/12 text-librarian border-librarian/30'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-hairline-strong'
                        }`}
                      >
                        Mastered
                      </button>
                    </div>

                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-librarian hover:opacity-75 text-xs font-medium"
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

          {/* Vault Notes (NotebookLM Style) */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Notes in your vault ground future AI conversations with your Tutor &amp; Editor.
                </span>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-librarian hover:brightness-110 text-slate-950 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add grounding note</span>
                </button>
              </div>

              {isAddingNote && (
                <form onSubmit={handleAddNote} className="bg-surface-1 border border-librarian/30 rounded-2xl p-4 space-y-3">
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Note title (e.g. Core Consensus Theorem)..."
                    className="w-full bg-surface-2 border border-hairline rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-librarian"
                  />
                  <textarea
                    rows={4}
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Paste insights, excerpts, or personal synthesis..."
                    className="w-full bg-surface-2 border border-hairline rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-librarian"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <input
                      type="text"
                      value={newNoteTag}
                      onChange={(e) => setNewNoteTag(e.target.value)}
                      placeholder="Tag (e.g. First Principles)"
                      className="bg-surface-2 border border-hairline rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 w-48 focus:outline-none focus:border-librarian"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-librarian hover:brightness-110 text-slate-950 text-xs font-semibold"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {librarianData.vaultNotes.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-surface-1 border border-hairline p-5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-100">{note.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-hairline text-[10px] font-medium text-librarian"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts / Mental Models */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              {librarianData.conceptCards.map((card) => (
                <div key={card.id} className="rounded-2xl bg-surface-1 border border-hairline p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-librarian" />
                    <h3 className="text-sm font-semibold text-slate-100">{card.term}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-500 font-medium">Definition —</strong> {card.definition}
                  </p>
                  <p className="text-xs text-librarian leading-relaxed">
                    <strong className="text-slate-500 font-medium">Mental model —</strong> {card.mentalModel}
                  </p>
                  <p className="text-xs text-roommate leading-relaxed">
                    <strong className="text-slate-500 font-medium">Common pitfall —</strong> {card.pitfall}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Librarian Chat */}
        <div className="lg:col-span-5 flex flex-col h-[560px] lg:h-[780px] lg:sticky lg:top-20 bg-surface-2 border border-hairline rounded-2xl shadow-lift overflow-hidden">
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-librarian/15 border border-librarian/30 flex items-center justify-center text-librarian flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Research librarian desk</h3>
                <p className="text-[11px] text-slate-500">Ask for literature synthesis, seminal papers &amp; cheat sheets</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {librarianData.chatHistory.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 px-6">
                Ask for a synthesis and the Librarian's answer will appear here.
              </div>
            )}
            {librarianData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-librarian/15 border border-librarian/30 flex items-center justify-center text-librarian flex-shrink-0 text-xs font-mono font-semibold">
                    L
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-librarian text-slate-950 font-medium rounded-tr-none'
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

            {isLoading && (
              <div className="flex gap-3 items-center text-librarian text-xs">
                <div className="w-7 h-7 rounded-lg bg-librarian/15 border border-librarian/30 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Librarian is synthesizing authoritative sources...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-hairline flex flex-wrap gap-1.5">
            {[
              'Summarize the top 3 papers in 1 paragraph each',
              'Give me a first-principles cheatsheet of core formulas',
              'What is the single most important book to read?'
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-surface-1 border border-hairline hover:border-librarian/40 hover:text-librarian px-2.5 py-1.5 rounded-full transition"
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
              placeholder="Ask for high-signal sources, summaries, or citations..."
              className="flex-1 bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-librarian transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-lg bg-librarian hover:brightness-110 text-slate-950 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
