import React, { useRef } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { AlterPersona } from '../../types/alter';
import {
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

  const personas: { id: AlterPersona; label: string; letter: string; colorVar: string }[] = [
    { id: 'advisor', label: 'Advisor', letter: 'A', colorVar: 'var(--advisor)' },
    { id: 'librarian', label: 'Librarian', letter: 'L', colorVar: 'var(--librarian)' },
    { id: 'tutor', label: 'Tutor', letter: 'T', colorVar: 'var(--tutor)' },
    { id: 'editor', label: 'Editor', letter: 'E', colorVar: 'var(--editor)' },
    { id: 'roommate', label: 'Roommate', letter: 'R', colorVar: 'var(--roommate)' }
  ];

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `altor-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    <header className="sticky top-0 z-30 flex items-center gap-4 sm:gap-6 px-4 sm:px-7 py-3 bg-[#090b12]/90 backdrop-blur-md border-b border-white/[0.07] transition-all">
      {/* Brand */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center font-display font-semibold text-sm text-[var(--accent)] transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          A
        </div>
        <div className="flex items-center gap-2 font-display font-semibold text-[17px] text-white">
          <span>Altor</span>
          <span className="font-mono text-[10px] tracking-widest text-white/40 border border-white/[0.13] rounded px-1.5 py-0.5 font-normal">
            UNIV
          </span>
        </div>
      </div>

      {/* Journey Select Dropdown */}
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
          className="w-full appearance-none bg-[var(--surface-2)] border border-white/[0.07] hover:border-white/[0.13] text-white/70 hover:text-white text-xs sm:text-[13px] rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-[var(--accent)] truncate cursor-pointer transition"
        >
          {journeys.map((j) => (
            <option key={j.id} value={j.id} className="bg-[var(--surface-2)] text-white">
              {j.title}
            </option>
          ))}
          <option value="__new__" className="bg-[var(--surface-2)] text-[var(--accent)] font-semibold">
            + New Learning Journey...
          </option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 pointer-events-none" />
      </div>

      {/* New Journey Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="hidden lg:flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white bg-transparent hover:bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] rounded-lg px-3 py-1.5 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New</span>
      </button>

      {/* Segmented Persona Tabs (Desktop) */}
      <nav className="hidden md:flex items-center gap-0.5 ml-2 bg-[var(--surface-1)] border border-white/[0.07] rounded-[9px] p-[3px]">
        {personas.map((p) => {
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              style={{ '--tab-color': p.colorVar } as React.CSSProperties}
              className={`flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-md font-medium transition-all ${
                isActive
                  ? 'text-white bg-[var(--surface-3)] shadow-[0_0_0_1px_rgba(255,255,255,0.13),inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-[4px] font-mono text-[9.5px] font-bold flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-[var(--tab-color)]/20 text-[var(--tab-color)]'
                    : 'bg-white/[0.05] text-inherit'
                }`}
              >
                {p.letter}
              </span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Streak */}
        {activeJourney && (
          <span className="font-mono text-xs text-[var(--tutor)] bg-[rgba(95,219,158,0.08)] border border-[rgba(95,219,158,0.22)] px-2.5 py-1 rounded-[7px] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-[var(--tutor)]" />
            <span>{activeJourney.streakDays}d streak</span>
          </span>
        )}

        {/* Demo / API Mode */}
        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="text-xs text-white/60 hover:text-white border border-white/[0.07] hover:border-white/[0.13] rounded-[7px] px-3 py-1.5 flex items-center gap-1.5 transition"
        >
          {apiKey ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[var(--tutor)]" />
              <span className="hidden sm:inline">Gemini Live</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-white/40" />
              <span className="hidden sm:inline">Demo mode</span>
            </>
          )}
        </button>

        {/* Export / Import */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={handleExport}
            className="w-8 h-8 flex items-center justify-center border border-white/[0.07] hover:border-white/[0.13] rounded-[7px] text-white/40 hover:text-white/70 transition"
            title="Export Backup (JSON)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 flex items-center justify-center border border-white/[0.07] hover:border-white/[0.13] rounded-[7px] text-white/40 hover:text-white/70 transition"
            title="Import Backup"
          >
            <Upload className="w-3.5 h-3.5" />
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
    </header>
  );
};
