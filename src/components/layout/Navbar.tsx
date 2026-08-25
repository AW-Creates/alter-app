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
      color: 'text-advisor',
      border: 'border-advisor/40',
      bg: 'bg-advisor/10'
    },
    {
      id: 'librarian',
      label: 'Librarian',
      letter: 'L',
      icon: BookOpen,
      color: 'text-librarian',
      border: 'border-librarian/40',
      bg: 'bg-librarian/10'
    },
    {
      id: 'tutor',
      label: 'Tutor',
      letter: 'T',
      icon: Lightbulb,
      color: 'text-tutor',
      border: 'border-tutor/40',
      bg: 'bg-tutor/10'
    },
    {
      id: 'editor',
      label: 'Editor',
      letter: 'E',
      icon: FileEdit,
      color: 'text-editor',
      border: 'border-editor/40',
      bg: 'bg-editor/10'
    },
    {
      id: 'roommate',
      label: 'Roommate',
      letter: 'R',
      icon: Users,
      color: 'text-roommate',
      border: 'border-roommate/40',
      bg: 'bg-roommate/10'
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
    <header className="sticky top-0 z-40 bg-surface-1/90 backdrop-blur-md border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-2 py-2.5 sm:h-16 sm:py-0 gap-x-2 sm:gap-x-4">

          {/* Brand & Journey Selector */}
          <div className="flex items-center gap-3 min-w-0 order-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-surface-3 to-surface-1 border border-hairline-strong flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="font-display font-semibold text-advisor text-sm">
                  A
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-semibold text-base tracking-tight text-white">A.L.T.E.R.</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-hairline-strong">
                    Univ
                  </span>
                </div>
              </div>
            </div>

            {/* Course / Journey Dropdown */}
            <div className="relative flex items-center min-w-0 max-w-[160px] sm:max-w-[280px]">
              <select
                value={activeJourney?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreateModalOpen(true);
                  } else {
                    setActiveJourneyId(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-surface-2 border border-hairline hover:border-hairline-strong text-slate-200 text-xs sm:text-sm font-medium rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-advisor truncate cursor-pointer transition"
              >
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
                <option value="__new__">+ New Learning Journey...</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-transparent hover:border-hairline-strong text-slate-300 hover:text-white text-xs font-semibold border border-hairline transition"
              title="Create New Learning Journey"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* A-L-T-E-R Navigation Tabs — scrolls horizontally on narrow screens instead of squeezing */}
          <nav className="order-3 sm:order-2 w-full sm:w-auto flex items-center gap-1 p-1 bg-surface-1 border border-hairline rounded-lg overflow-x-auto sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {personas.map((p) => {
              const Icon = p.icon;
              const isActive = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? `${p.bg} ${p.color} shadow-[0_0_0_1px_rgba(255,255,255,0.08)]`
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className={`w-4 h-4 rounded text-[10px] font-mono font-semibold flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-white/[0.05]'}`}>
                    {p.letter}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons: Streak, API key, Export/Import */}
          <div className="order-2 sm:order-3 flex items-center gap-2 ml-auto sm:ml-0">
            {/* Streak */}
            {activeJourney && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tutor/10 border border-tutor/20 text-tutor text-xs font-mono font-semibold"
                title={`${activeJourney.streakDays} Day Learning Streak`}
              >
                <Flame className="w-3.5 h-3.5 fill-tutor text-tutor animate-pulse-subtle" />
                <span>{activeJourney.streakDays}d</span>
              </div>
            )}

            {/* API Key / Mode Status */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                apiKey
                  ? 'bg-tutor/10 border-tutor/30 text-tutor hover:bg-tutor/20'
                  : 'bg-surface-2 border-hairline text-slate-300 hover:border-hairline-strong'
              }`}
              title="Configure Gemini API Key"
            >
              {apiKey ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gemini Live</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Demo Mode</span>
                </>
              )}
            </button>

            {/* Export / Import Dropdown */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg border border-transparent text-slate-500 hover:text-slate-200 hover:border-hairline-strong transition"
                title="Export / Backup All Journeys (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg border border-transparent text-slate-500 hover:text-slate-200 hover:border-hairline-strong transition"
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
