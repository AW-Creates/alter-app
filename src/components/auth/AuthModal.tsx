import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    logout,
    updateProfile
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'profile'>(
    user.isGuest ? 'signin' : 'profile'
  );
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await loginWithEmail(email.trim(), name.trim());
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setIsSavingProfile(true);
    updateProfile({ username: usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') });
    setTimeout(() => {
      setIsSavingProfile(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 text-[var(--ink-3)] hover:text-[var(--ink)] transition p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)]"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center font-display font-bold text-base text-[var(--advisor)] shadow-md mx-auto">
            A
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--ink)] tracking-tight">
            {user.isGuest
              ? authMode === 'signin'
                ? 'Sign in to Altor Academy'
                : 'Create Your Scholar Account'
              : 'Scholar Profile & Cloud Sync'}
          </h3>
          <p className="text-xs text-[var(--ink-2)]">
            {user.isGuest
              ? 'Sync your curricula, grounded notes, and streak across all devices.'
              : 'Manage your portfolio handle, plan tier, and encrypted backup.'}
          </p>
        </div>

        {/* Unauthenticated / Guest View */}
        {user.isGuest ? (
          <div className="space-y-4">
            {/* 1-Click OAuth Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] hover:bg-[var(--surface-3)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-3 transition shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={loginWithGithub}
                className="w-full py-3 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-3 transition"
              >
                <Github size={16} />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-[var(--hairline)]" />
              <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">or email passcode</span>
              <div className="flex-1 border-t border-[var(--hairline)]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">Your Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Marie Curie"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none pl-9"
                    />
                    <User size={14} className="absolute left-3 top-3.5 text-[var(--ink-3)]" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[var(--ink-2)] mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="scholar@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-3 outline-none pl-9"
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-3.5 text-[var(--ink-3)]" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-md transition"
              >
                {authMode === 'signin' ? 'Sign In / Instant Sync' : 'Create Scholar Account'}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)] transition"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated User Profile View */
          <div className="space-y-5">
            {/* User Badge */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[var(--hairline-strong)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--advisor)_18%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] flex items-center justify-center text-[var(--advisor)] font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--ink)] text-xs truncate">{user.name}</div>
                <div className="text-[11px] text-[var(--ink-3)] truncate font-mono">{user.email || 'Cloud Account'}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--tutor)_15%,transparent)] text-[var(--tutor)] border border-[color-mix(in_srgb,var(--tutor)_30%,transparent)] text-[10px] font-mono uppercase font-semibold">
                {user.tier}
              </span>
            </div>

            {/* Public Portfolio Handle */}
            <form onSubmit={handleSaveUsername} className="space-y-2">
              <label className="block text-[11px] font-medium text-[var(--ink-2)]">
                Public Proof-of-Work Portfolio URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[var(--surface-2)] border border-[var(--hairline)] focus-within:border-[var(--advisor)] rounded-xl px-3 py-2 text-xs">
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
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-3)] hover:border-[var(--accent)] border border-[var(--hairline-strong)] text-xs font-semibold text-[var(--ink)] transition"
                >
                  {isSavingProfile ? <Check size={13} className="text-[var(--tutor)]" /> : 'Save'}
                </button>
              </div>
            </form>

            {/* Cloud Sync Status */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Cloud size={16} className="text-[var(--advisor)]" />
                <div>
                  <div className="font-semibold text-[var(--ink)]">Cloud Encrypted Backup</div>
                  <div className="text-[10px] text-[var(--ink-3)]">Auto-syncs across Desktop &amp; Mobile</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[var(--tutor)] font-semibold flex items-center gap-1">
                <Check size={12} /> Active
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-3)] hover:border-[var(--hairline-strong)] border border-[var(--hairline)] text-[var(--ink)] font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
