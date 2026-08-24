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
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'paper':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'lecture':
        return <Video className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 border border-sky-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase tracking-wider">
              L — Knowledge Librarian & Grounded Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated Signals & Grounding Notes
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Filter the 99% noise of YouTube tutorials and surface the top 1% highest-signal books, seminal papers, and first-principles mental models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCurateMore}
              disabled={isCurating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
            >
              {isCurating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Curate Top 1% Sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sources & Grounding Vault */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'sources'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Curated Sources ({librarianData.sources.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'vault'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Grounded Notes ({librarianData.vaultNotes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'concepts'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Mental Models</span>
            </button>
          </div>

          {/* Sources List */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {librarianData.sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                        {getTypeIcon(source.type)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{source.title}</h3>
                        <p className="text-xs text-slate-400">By {source.authorOrCreator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">
                        Signal: {source.signalScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-sky-400 font-semibold">Why Essential:</strong> {source.whyEssential}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      <strong className="text-slate-300 font-semibold">Key Takeaway:</strong> {source.keyTakeaway}
                    </p>
                  </div>

                  {/* Footer status buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateSourceStatus(source.id, 'unread')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          source.status === 'unread'
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => updateSourceStatus(source.id, 'in_progress')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          source.status === 'in_progress'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Reading
                      </button>
                      <button
                        onClick={() => updateSourceStatus(source.id, 'mastered')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          source.status === 'mastered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-500 hover:text-slate-300'
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
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-semibold"
                      >
                        <span>Open Source</span>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Notes in your vault ground future AI conversations with your Tutor & Editor.
                </span>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Grounding Note</span>
                </button>
              </div>

              {isAddingNote && (
                <form onSubmit={handleAddNote} className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 space-y-3">
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Note title (e.g. Core Consensus Theorem)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    rows={4}
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Paste insights, excerpts, or personal synthesis..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={newNoteTag}
                      onChange={(e) => setNewNoteTag(e.target.value)}
                      placeholder="Tag (e.g. First Principles)"
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 w-48 focus:outline-none focus:border-sky-500"
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
                        className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {librarianData.vaultNotes.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-100">{note.title}</h4>
                      <span className="text-[10px] text-slate-500">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                    <div className="flex gap-1.5 pt-1">
                      {note.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-sky-400"
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
                <div key={card.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100">{card.term}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Definition:</strong> {card.definition}
                  </p>
                  <p className="text-xs text-sky-300 leading-relaxed">
                    <strong className="text-slate-400">Mental Model:</strong> {card.mentalModel}
                  </p>
                  <p className="text-xs text-rose-300 leading-relaxed">
                    <strong className="text-slate-400">Common Pitfall:</strong> {card.pitfall}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Librarian Chat */}
        <div className="lg:col-span-5 flex flex-col h-[780px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Research Librarian Desk</h3>
                <p className="text-[11px] text-slate-400">Ask for literature synthesis, seminal papers & cheat sheets</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {librarianData.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 text-xs font-bold">
                    L
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
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

            {isLoading && (
              <div className="flex gap-3 items-center text-sky-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Librarian is synthesizing authoritative sources...</span>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/30 flex flex-wrap gap-1.5">
            {[
              'Summarize the top 3 papers in 1 paragraph each',
              'Give me a first-principles cheatsheet of core formulas',
              'What is the single most important book to read?'
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputText(qp)}
                className="text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                {qp}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for high-signal sources, summaries, or citations..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-950 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
