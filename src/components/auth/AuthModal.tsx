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
                Scholar Profile &amp; Data Storage
              </h3>
              <p className="text-xs text-[var(--ink-2)] m-0">
                Manage your local profile, storage quota, JSON backups &amp; cloud sync.
              </p>
            </div>
          </div>
        </div>

        {/* Honest Storage Architecture Banner */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <HardDrive size={15} className="text-[var(--advisor)]" />
              <span>Storage Mode:</span>
            </div>
            {isSupabaseActive ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[11px] font-mono font-bold flex items-center gap-1">
                <Cloud size={12} /> Supabase Cloud Sync (Active)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-[var(--surface-3)] border border-[var(--hairline)] text-[var(--ink-2)] text-[11px] font-mono font-bold flex items-center gap-1">
                <Shield size={12} className="text-[var(--advisor)]" /> Local Storage (This Browser)
              </span>
            )}
          </div>

          {/* Storage Quota Usage Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-3)]">
              <span>Used: {storageMetrics.formattedUsed} / ~5 MB</span>
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

        {/* 1-Click Backup Export / Import */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--advisor)_10%,var(--surface-2))] to-[var(--surface-2)] border border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Download size={14} className="text-[var(--advisor)]" />
              <span>Full Data Backup &amp; Portability</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-3)]">100% Client-Side</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportBackup}
              className="py-2 px-3 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download size={13} />
              <span>Export Backup (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline-strong)] text-[var(--ink)] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Upload size={13} />
              <span>Restore Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
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
