import React, { useRef } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { AlterPersona } from '../../types/alter';
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  FileEdit,
  Users,
  Plus,
  Flame,
  Key,
  Download,
  Upload,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { exportAllData, importAllData } from '../../services/storage';

export const Navbar: React.FC = () => {
  const {
    journeys,
    activeJourney,
    activePersona,
    setActiveJourneyId,
    setActivePersona,
    apiKey,
    setIsApiKeyModalOpen,
    setIsCreateModalOpen
  } = useJourney();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const personas: { id: AlterPersona; label: string; letter: string; icon: any; color: string; border: string; bg: string }[] = [
    {
      id: 'advisor',
      label: 'Advisor',
      letter: 'A',
      icon: GraduationCap,
      color: 'text-indigo-400',
      border: 'border-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'librarian',
      label: 'Librarian',
      letter: 'L',
      icon: BookOpen,
      color: 'text-sky-400',
      border: 'border-sky-500',
      bg: 'bg-sky-500/10'
    },
    {
      id: 'tutor',
      label: 'Tutor',
      letter: 'T',
      icon: Lightbulb,
      color: 'text-emerald-400',
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'editor',
      label: 'Editor',
      letter: 'E',
      icon: FileEdit,
      color: 'text-amber-400',
      border: 'border-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'roommate',
      label: 'Roommate',
      letter: 'R',
      icon: Users,
      color: 'text-pink-400',
      border: 'border-pink-500',
      bg: 'bg-pink-500/10'
    }
  ];

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alter-university-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllData(content);
        if (success) {
          window.location.reload();
        } else {
          alert('Invalid backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand & Journey Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300 text-sm">
                    A
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">A.L.T.E.R.</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded border border-slate-700">
                    Univ
                  </span>
                </div>
              </div>
            </div>

            {/* Course / Journey Dropdown */}
            <div className="relative flex items-center min-w-0 max-w-[200px] sm:max-w-[280px]">
              <select
                value={activeJourney?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreateModalOpen(true);
                  } else {
                    setActiveJourneyId(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-sky-500 truncate cursor-pointer transition"
              >
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
                <option value="__new__">+ New Learning Journey...</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Create New Learning Journey"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Desktop A-L-T-E-R Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl space-x-1">
            {personas.map((p) => {
              const Icon = p.icon;
              const isActive = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `${p.bg} ${p.color} shadow-sm border ${p.border}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className="w-4 h-4 rounded bg-slate-900 text-[10px] font-bold flex items-center justify-center">
                    {p.letter}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons: Streak, API key, Export/Import */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            {activeJourney && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
                title={`${activeJourney.streakDays} Day Learning Streak`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse-subtle" />
                <span>{activeJourney.streakDays}d</span>
              </div>
            )}

            {/* API Key / Mode Status */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                apiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Configure Gemini API Key"
            >
              {apiKey ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Gemini Live</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Demo Mode</span>
                </>
              )}
            </button>

            {/* Export / Import Dropdown */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={handleExport}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Export / Backup All Journeys (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Import Journeys from Backup"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
