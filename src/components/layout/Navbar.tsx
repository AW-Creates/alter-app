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
    <div className="topnav">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">A</div>
        Altor <span className="brand-tag">UNIV</span>
      </div>

      {/* Journey Selection */}
      <div className="journey-select">
        <select
          value={activeJourney?.id || ''}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              setIsCreateModalOpen(true);
            } else {
              setActiveJourneyId(e.target.value);
            }
          }}
        >
          {journeys.map((j) => (
            <option key={j.id} value={j.id} className="bg-[#0e131f] text-white">
              {j.title}
            </option>
          ))}
          <option value="__new__" className="bg-[#0e131f] text-[#5eb8f5]">
            + New Learning Journey...
          </option>
        </select>
        <ChevronDown size={12} strokeWidth={2} />
      </div>

      {/* New Button */}
      <button onClick={() => setIsCreateModalOpen(true)} className="new-btn">
        <Plus size={13} strokeWidth={2} />
        <span>New</span>
      </button>

      {/* Persona Tabs */}
      <div className="persona-tabs" id="tabs">
        {personas.map((p) => {
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              style={{ '--tab-color': p.colorVar } as React.CSSProperties}
              className={`ptab ${isActive ? 'active' : ''}`}
            >
              <span className="letter">{p.letter}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="nav-right">
        {activeJourney && (
          <span className="streak">
            🔥 {activeJourney.streakDays}d streak
          </span>
        )}

        <button onClick={() => setIsApiKeyModalOpen(true)} className="demo-mode">
          {apiKey ? (
            <>
              <Sparkles size={13} className="text-[#5fdb9e]" />
              <span>Gemini Live</span>
            </>
          ) : (
            <>
              <Key size={13} />
              <span>Demo mode</span>
            </>
          )}
        </button>

        <button onClick={handleExport} className="icon-btn" title="Export Backup (JSON)">
          <Download size={14} strokeWidth={2} />
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="icon-btn" title="Import Backup">
          <Upload size={14} strokeWidth={2} />
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
  );
};
