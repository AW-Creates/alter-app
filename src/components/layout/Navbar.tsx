import React, { useState, useRef, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAuth } from '../../context/AuthContext';
import { AlterPersona } from '../../types/alter';
import {
  Plus,
  Flame,
  Key,
  Download,
  Upload,
  ChevronDown,
  Sparkles,
  Zap,
  HelpCircle,
  CreditCard,
  User,
  Share2,
  FileText,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  FileEdit,
  Users,
  GraduationCap
} from 'lucide-react';
import { exportAllData, importAllData } from '../../services/storage';
import { downloadObsidianMarkdown, downloadNotionCSV } from '../../services/exporter';
import { checkSharedServerHealth, isSharedServerUnconfigured } from '../../services/sharedApi';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onOpenLanding?: () => void;
  onOpenPricing?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLanding, onOpenPricing }) => {
  const {
    journeys,
    activeJourney,
    activePersona,
    setActiveJourneyId,
    setActivePersona,
    apiKey,
    setIsApiKeyModalOpen,
    setIsCreateModalOpen,
    setIsOnboardingTourOpen
  } = useJourney();

  const { user, setIsAuthModalOpen } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreMenuOpen(false);
    };

    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreMenuOpen]);

  // Silently verify if server proxy has shared key configured without charging user quota
  useEffect(() => {
    if (!apiKey && !localStorage.getItem('alter_openrouter_api_key')) {
      checkSharedServerHealth();
    }
  }, [apiKey]);

  const personas: { id: AlterPersona; label: string; letter: string; colorVar: string; icon: any }[] = [
    { id: 'advisor', label: 'Advisor', letter: 'A', colorVar: 'var(--advisor)', icon: GraduationCap },
    { id: 'librarian', label: 'Librarian', letter: 'L', colorVar: 'var(--librarian)', icon: BookOpen },
    { id: 'tutor', label: 'Tutor', letter: 'T', colorVar: 'var(--tutor)', icon: Lightbulb },
    { id: 'editor', label: 'Editor', letter: 'E', colorVar: 'var(--editor)', icon: FileEdit },
    { id: 'roommate', label: 'Roommate', letter: 'R', colorVar: 'var(--roommate)', icon: Users }
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
    setIsMoreMenuOpen(false);
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
    setIsMoreMenuOpen(false);
  };

  return (
    <header className="topnav w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 bg-[var(--surface-1)]/90 backdrop-blur-md border-b border-[var(--hairline)] sticky top-0 z-40 transition-colors">
      {/* Left Section: Brand, Journey Selector & New Button */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
        {/* Brand */}
        <button
          onClick={onOpenLanding}
          className="brand flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 hover:opacity-85 transition flex-shrink-0"
          title="View Altor Overview & Landing Page"
        >
          <div className="brand-mark w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-[var(--hairline-strong)] flex items-center justify-center font-serif font-bold text-xs sm:text-sm text-[var(--advisor)] shadow-2xs">
            A
          </div>
          <span className="font-display font-bold text-sm sm:text-base text-[var(--ink)] tracking-tight hidden xs:inline">
            Altor <span className="brand-tag text-[9px] font-mono uppercase px-1 py-0.2 bg-[var(--surface-3)] text-[var(--advisor)] rounded">UNIV</span>
          </span>
        </button>

        {/* Journey Selection Dropdown */}
        <div className="journey-select flex items-center bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] rounded-lg px-2 sm:px-2.5 py-1 text-xs text-[var(--ink)] transition min-w-0 max-w-[130px] sm:max-w-[170px] md:max-w-[220px] lg:max-w-[260px] shadow-2xs">
          <select
            value={activeJourney?.id || ''}
            onChange={(e) => {
              if (e.target.value === '__new__') {
                setIsCreateModalOpen(true);
              } else {
                setActiveJourneyId(e.target.value);
              }
            }}
            className="bg-transparent border-none text-inherit text-xs outline-none cursor-pointer truncate w-full pr-1 font-medium"
          >
            {journeys.map((j) => (
              <option key={j.id} value={j.id} className="bg-[var(--surface-2)] text-[var(--ink)]">
                {j.title}
              </option>
            ))}
            <option value="__new__" className="bg-[var(--surface-2)] text-[var(--accent)] font-bold">
              + New Learning Journey...
            </option>
          </select>
          <ChevronDown size={11} strokeWidth={2} className="text-[var(--ink-3)] flex-shrink-0" />
        </div>

        {/* New Journey Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="new-btn flex items-center gap-1 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] rounded-lg px-2 sm:px-2.5 py-1 transition flex-shrink-0 cursor-pointer shadow-2xs"
          title="Create New Learning Journey"
        >
          <Plus size={12} strokeWidth={2} className="text-[var(--advisor)]" />
          <span className="hidden sm:inline font-medium">New</span>
        </button>
      </div>

      {/* Center Section: Responsive Persona Tabs (Hidden on mobile where bottom bar active) */}
      <div className="persona-tabs hidden md:flex items-center gap-1 bg-[var(--surface-2)]/80 border border-[var(--hairline)] rounded-xl p-1 shadow-2xs" id="tabs">
        {personas.map((p) => {
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              style={{ '--tab-color': p.colorVar } as React.CSSProperties}
              className={`ptab flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                isActive
                  ? 'bg-[var(--surface-3)] text-[var(--ink)] border-[var(--hairline-strong)] shadow-xs font-bold'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface-3)]/50 border-transparent'
              }`}
              title={`Switch to ${p.label} persona`}
            >
              <span
                className={`letter w-4 h-4 rounded text-[9.5px] font-mono font-bold flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--tab-color)_25%,transparent)] text-[var(--tab-color)]'
                    : 'bg-white/5 text-inherit'
                }`}
              >
                {p.letter}
              </span>
              <span className="hidden xl:inline">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Section: Streak, Guide, Theme, and Unified More Menu */}
      <div className="nav-right flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Streak Counter */}
        {activeJourney && (
          <div className="streak flex items-center gap-1 text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-lg shadow-2xs">
            <Flame size={12} className="text-amber-500 fill-amber-500" />
            <span>{activeJourney.streakDays}d</span>
          </div>
        )}

        {/* Live / Shared / Demo Mode Status Pill */}
        {(() => {
          const hasPersonalKey = Boolean(apiKey || localStorage.getItem('alter_openrouter_api_key'));
          const isUnconfigured = isSharedServerUnconfigured();
          const usage = JSON.parse(localStorage.getItem('altor_shared_usage_cache_v1') || '{"remaining":5}');
          const remaining = typeof usage.remaining === 'number' ? usage.remaining : 5;

          if (hasPersonalKey) {
            return (
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-500"
                title="Personal API Key Connected (Unlimited Live AI). Click to manage."
              >
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Live AI Active</span>
              </button>
            );
          }

          if (!isUnconfigured && remaining > 0) {
            return (
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400"
                title={`Shared Free Tier (${remaining}/5 live AI requests remaining today). Click to add your own key for unlimited.`}
              >
                <Zap size={12} className="text-sky-400" />
                <span>Free Tier ({remaining}/5)</span>
              </button>
            );
          }

          return (
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500"
              title={
                isUnconfigured
                  ? 'Shared server key unconfigured. Running in Demo Mode. Click to add your own Gemini or OpenRouter API key.'
                  : 'Daily free quota reached. Running in Simulated Demo Mode. Click to add your own API key.'
              }
            >
              <Zap size={12} className="text-amber-500" />
              <span>Demo Mode</span>
              <span className="underline ml-0.5 text-[10px]">Add Key</span>
            </button>
          );
        })()}

        {/* Guide Tour Opener */}
        <button
          onClick={() => setIsOnboardingTourOpen(true)}
          className="demo-mode flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] text-xs font-bold text-[var(--ink)] transition shadow-2xs cursor-pointer"
          title="Interactive 1-Minute Walkthrough"
        >
          <Sparkles size={12} className="text-[var(--advisor)]" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Unified "••• More" Responsive Dropdown Menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            className={`icon-btn w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer shadow-2xs ${
              isMoreMenuOpen
                ? 'bg-[var(--surface-3)] border-[var(--advisor)] text-[var(--advisor)]'
                : 'bg-[var(--surface-2)] border-[var(--hairline)] hover:border-[var(--hairline-strong)] text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
            title="More Options & Utilities"
            aria-expanded={isMoreMenuOpen}
          >
            <MoreHorizontal size={15} />
          </button>

          {/* Dropdown Menu Popover */}
          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl py-2 z-50 animate-fade-in divide-y divide-[var(--hairline)] text-xs">
              {/* Profile & Sync */}
              <div className="px-2 py-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
                  Scholar Account
                </div>
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[var(--advisor)]" />
                    <span className="font-medium">
                      {user.isGuest ? 'Scholar Profile & Backup' : user.name || user.username}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${user.syncEnabled ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-[var(--surface-3)] text-[var(--ink-3)] border border-[var(--hairline)]'}`}>
                    {user.syncEnabled ? 'Cloud Sync' : 'Local'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsApiKeyModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Key size={14} className={apiKey ? 'text-emerald-500' : 'text-[var(--ink-3)]'} />
                    <span className="font-medium">AI API Key & Live Mode</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${apiKey ? 'bg-emerald-500/15 text-emerald-500' : 'bg-[var(--surface-3)] text-[var(--ink-3)]'}`}>
                    {apiKey ? 'Live' : 'Demo'}
                  </span>
                </button>

                {onOpenPricing && (
                  <button
                    onClick={() => {
                      onOpenPricing();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                  >
                    <CreditCard size={14} className="text-[var(--tutor)]" />
                    <span className="font-medium">Membership Tiers & Pricing</span>
                  </button>
                )}
              </div>

              {/* Exports & Knowledge Graph */}
              {activeJourney && (
                <div className="px-2 py-1.5 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
                    Knowledge Exports
                  </div>
                  <button
                    onClick={() => {
                      downloadObsidianMarkdown(activeJourney);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                    title="Export Knowledge Graph to Obsidian (.md with [[Wikilinks]])"
                  >
                    <FileText size={14} className="text-[var(--advisor)]" />
                    <span>Export Obsidian Markdown (.md)</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadNotionCSV(activeJourney);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                    title="Export Syllabus to Notion (.csv Database)"
                  >
                    <Share2 size={14} className="text-[var(--librarian)]" />
                    <span>Export Notion Syllabus (.csv)</span>
                  </button>
                </div>
              )}

              {/* Backups & Platform */}
              <div className="px-2 py-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
                  Data & Backup
                </div>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                >
                  <Download size={14} className="text-[var(--ink-2)]" />
                  <span>Export Backup (JSON)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink)] transition text-left cursor-pointer"
                >
                  <Upload size={14} className="text-[var(--ink-2)]" />
                  <span>Import Backup (JSON)</span>
                </button>

                {onOpenLanding && (
                  <button
                    onClick={() => {
                      onOpenLanding();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] transition text-left cursor-pointer"
                  >
                    <HelpCircle size={14} />
                    <span>Altor Manifesto & About</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Backup Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
};
