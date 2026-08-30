import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  Cloud,
  Check,
  LogOut,
  Github,
  Shield,
  Zap,
  Globe,
  Download,
  Upload,
  Database,
  ChevronDown,
  ChevronUp,
  HardDrive,
  AlertCircle
} from 'lucide-react';
import { importAllData } from '../../services/storage';
import { getStoredSupabaseUrl, getStoredSupabaseAnonKey } from '../../services/supabase';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    isSupabaseActive,
    storageMetrics,
    refreshStorageMetrics,
    setIsAuthModalOpen,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    saveLocalProfile,
    configureSupabase,
    logout,
    updateProfile,
    exportBackup
  } = useAuth();

  const [nameInput, setNameInput] = useState(user.name === 'Local Scholar' ? '' : user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [isSaved, setIsSaved] = useState(false);

  // Custom Supabase Cloud Sync configuration state
  const [isSupabaseSectionOpen, setIsSupabaseSectionOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getStoredSupabaseUrl());
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(getStoredSupabaseAnonKey());
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  // Import JSON file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthModalOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalProfile(nameInput || 'Scholar', emailInput, usernameInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const success = configureSupabase(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    if (success) {
      setSupabaseStatusMsg('✅ Supabase cloud database connected successfully!');
    } else {
      setSupabaseStatusMsg(
        supabaseUrlInput.trim()
          ? '⚠️ Unable to connect to Supabase. Check URL and anon key.'
          : 'Cleared Supabase configuration (reverted to Local Mode).'
      );
    }
    setTimeout(() => setSupabaseStatusMsg(null), 4000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importAllData(content);
        if (ok) {
          refreshStorageMetrics();
          alert('✅ All learning journeys and curricula restored successfully!');
          window.location.reload();
        } else {
          alert('❌ Failed to restore backup. Invalid Altor JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 text-[var(--ink-3)] hover:text-[var(--ink)] transition p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)]"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center font-display font-bold text-sm text-[var(--advisor)] shadow-md">
              A
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[var(--ink)] tracking-tight m-0">
                {isSupabaseActive ? 'Cloud Sync & Scholar Profile' : 'Set up sync'}
              </h3>
              <p className="text-xs text-[var(--ink-2)] m-0 leading-relaxed">
                {isSupabaseActive
                  ? 'Your journeys are automatically synced to your Supabase PostgreSQL cloud backend.'
                  : "This copy of Altor has no cloud backend connected, so account sign-in can't back up your journeys yet."}
              </p>
            </div>
          </div>
        </div>

        {/* OAuth Buttons (Visibly Disabled / Not Connected unless Supabase is configured) */}
        {!isSupabaseActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] opacity-80">
              <div className="flex items-center gap-2.5 text-xs text-[var(--ink-3)] font-medium">
                <svg className="w-4 h-4 text-[var(--ink-3)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--ink-3)] bg-[var(--surface-3)] px-2 py-0.5 rounded-full border border-[var(--hairline)] font-bold">
                Not connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] opacity-80">
              <div className="flex items-center gap-2.5 text-xs text-[var(--ink-3)] font-medium">
                <Github size={16} className="text-[var(--ink-3)]" />
                <span>Continue with GitHub</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--ink-3)] bg-[var(--surface-3)] px-2 py-0.5 rounded-full border border-[var(--hairline)] font-bold">
                Not connected
              </span>
            </div>
          </div>
        )}

        {/* "What you can do right now" Section (Matches HTML Mockup) */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
          <div className="text-xs font-semibold text-[var(--ink-2)]">
            What you can do right now:
          </div>

          <div className="space-y-2">
            <button
              onClick={exportBackup}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-1)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs text-[var(--ink)] font-medium transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Download size={15} className="text-[var(--advisor)]" />
                <span>Export all journeys as a JSON file</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--advisor)] font-bold">1-Click</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-1)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs text-[var(--ink)] font-medium transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Upload size={15} className="text-[var(--tutor)]" />
                <span>Import that file on another device</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--tutor)] font-bold">Restore</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Storage Quota Usage Gauge */}
          <div className="pt-2 border-t border-[var(--hairline)] space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-3)]">
              <span>Local Storage Used: {storageMetrics.formattedUsed} / ~5 MB</span>
              <span>{storageMetrics.estimatedPercentage}% capacity</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  storageMetrics.isNearQuota ? 'bg-rose-500' : 'bg-[var(--advisor)]'
                }`}
                style={{ width: `${storageMetrics.estimatedPercentage}%` }}
              />
            </div>
            {storageMetrics.isNearQuota && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1 font-sans">
                <AlertCircle size={12} />
                <span>Storage nearing limit. Export a JSON backup to protect your curricula.</span>
              </p>
            )}
          </div>
        </div>

        {/* Scholar Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
          <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
            <User size={14} className="text-[var(--tutor)]" />
            <span>Scholar Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Marie Curie"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="scholar@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">
              Public Portfolio Handle
            </label>
            <div className="flex items-center bg-[var(--surface-2)] border border-[var(--hairline)] focus-within:border-[var(--advisor)] rounded-xl px-3 py-2 text-xs">
              <Globe size={13} className="text-[var(--ink-3)] mr-2 flex-shrink-0" />
              <span className="text-[var(--ink-3)] font-mono">altor.app/@</span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-transparent border-none text-[var(--ink)] outline-none font-mono flex-1 min-w-0"
                placeholder="username"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-[var(--surface-3)] hover:border-[var(--accent)] border border-[var(--hairline-strong)] text-xs font-bold text-[var(--ink)] transition flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check size={13} className="text-[var(--tutor)]" /> : null}
              <span>{isSaved ? 'Profile Saved' : 'Save Scholar Profile'}</span>
            </button>

            {!user.isGuest && (
              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <LogOut size={12} />
                <span>Reset to Default</span>
              </button>
            )}
          </div>
        </form>

        {/* Optional Cloud Sync (Supabase PostgreSQL) Accordion */}
        <div className="border-t border-[var(--hairline)] pt-3">
          <button
            type="button"
            onClick={() => setIsSupabaseSectionOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs text-[var(--ink-2)] hover:text-[var(--ink)] font-semibold transition py-1 cursor-pointer bg-transparent border-none"
          >
            <div className="flex items-center gap-2">
              <Database size={14} className="text-[var(--advisor)]" />
              <span>Connect Custom Supabase (Multi-Device Cloud Sync)</span>
            </div>
            {isSupabaseSectionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isSupabaseSectionOpen && (
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 pt-3 animate-fade-in text-xs">
              <p className="text-[11px] text-[var(--ink-3)] leading-relaxed m-0 font-sans">
                To sync your learning journeys across multiple devices without storing data on third-party servers, connect your own free Supabase PostgreSQL project.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">
                  Supabase Project URL (e.g. https://xxx.supabase.co)
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              {supabaseStatusMsg && (
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-[11.5px] font-mono text-[var(--ink)]">
                  {supabaseStatusMsg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[var(--advisor)] text-[#04050a] font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Save &amp; Connect Cloud Sync
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSupabaseUrlInput('');
                    setSupabaseKeyInput('');
                    configureSupabase('', '');
                    setSupabaseStatusMsg('Cleared cloud credentials. Operating in Local Mode.');
                  }}
                  className="py-2 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink-2)] text-xs transition cursor-pointer"
                >
                  Clear Keys
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--hairline)] flex justify-end">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="py-2 px-5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink)] text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
