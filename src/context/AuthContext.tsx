import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSupabase,
  isSupabaseConfigured,
  syncJourneysToCloud,
  fetchJourneysFromCloud,
  setStoredSupabaseConfig,
  getStoredSupabaseUrl,
  getStoredSupabaseAnonKey
} from '../services/supabase';
import { getStorageMetrics, StorageMetrics, downloadBackupFile } from '../services/storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  tier: 'free' | 'pro' | 'fellow';
  isGuest: boolean;
  createdAt: string;
  syncEnabled: boolean;
}

interface AuthContextType {
  user: UserProfile;
  isAuthModalOpen: boolean;
  isSupabaseActive: boolean;
  storageMetrics: StorageMetrics;
  refreshStorageMetrics: () => void;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>;
  saveLocalProfile: (name: string, email: string, username?: string) => void;
  configureSupabase: (url: string, anonKey: string) => boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  exportBackup: () => void;
}

const STORAGE_KEY_USER = 'altor_user_profile_v1';

const defaultGuestUser: UserProfile = {
  id: 'local_scholar_' + Math.random().toString(36).substring(2, 8),
  name: 'Local Scholar',
  email: '',
  username: 'scholar',
  tier: 'free',
  isGuest: true,
  createdAt: new Date().toISOString(),
  syncEnabled: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user profile from storage', e);
    }
    return defaultGuestUser;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(isSupabaseConfigured());
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics>(getStorageMetrics());

  const refreshStorageMetrics = () => {
    setStorageMetrics(getStorageMetrics());
  };

  // Listen for storage quota error events
  useEffect(() => {
    const handleStorageError = (e: any) => {
      refreshStorageMetrics();
    };
    window.addEventListener('altor_storage_quota_error', handleStorageError);
    return () => window.removeEventListener('altor_storage_quota_error', handleStorageError);
  }, []);

  // Listen for Supabase Auth state changes if configured
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsSupabaseActive(false);
      // Ensure syncEnabled is false if Supabase is not active
      if (user.syncEnabled) {
        setUser((prev) => ({ ...prev, syncEnabled: false }));
      }
      return;
    }

    setIsSupabaseActive(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const profile: UserProfile = {
          id: supaUser.id,
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Scholar',
          email: supaUser.email || '',
          username: (supaUser.user_metadata?.user_name || supaUser.email?.split('@')[0] || 'scholar')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
          avatarUrl: supaUser.user_metadata?.avatar_url,
          tier: 'pro',
          isGuest: false,
          createdAt: supaUser.created_at,
          syncEnabled: true
        };
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(defaultGuestUser);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      refreshStorageMetrics();
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }, [user]);

  const loginWithGoogle = async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (!error) return;
    }

    // Honest notice when Supabase is not configured
    alert(
      'Supabase Cloud Auth is not configured in this deployment.\n\nAltor is operating in Local-First Mode: all your learning journeys and streaks are securely saved in this browser.\n\nYou can customize your local profile or export JSON backups anytime.'
    );
  };

  const loginWithGithub = async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (!error) return;
    }

    // Honest notice when Supabase is not configured
    alert(
      'Supabase Cloud Auth is not configured in this deployment.\n\nAltor is operating in Local-First Mode: all your learning journeys and streaks are securely saved in this browser.\n\nYou can customize your local profile or export JSON backups anytime.'
    );
  };

  const loginWithEmail = async (email: string, name: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name }
        }
      });
      if (!error) {
        alert(`Magic sign-in link sent to ${email}! Check your inbox.`);
        setIsAuthModalOpen(false);
        return;
      }
    }

    // If Supabase is not connected, personalize the Local Scholar profile with their actual name & email
    saveLocalProfile(name || email.split('@')[0], email);
    setIsAuthModalOpen(false);
  };

  const saveLocalProfile = (name: string, email: string, username?: string) => {
    const cleanName = name.trim() || 'Scholar';
    const cleanEmail = email.trim();
    const cleanUsername = (username || cleanName).toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'scholar';

    const updatedUser: UserProfile = {
      ...user,
      id: user.id.startsWith('local_') ? user.id : 'local_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      isGuest: false,
      syncEnabled: false // Honest: local storage only
    };

    setUser(updatedUser);
  };

  const configureSupabase = (url: string, anonKey: string): boolean => {
    setStoredSupabaseConfig(url, anonKey);
    const client = getSupabase();
    const isConfigured = Boolean(client);
    setIsSupabaseActive(isConfigured);
    return isConfigured;
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(defaultGuestUser);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const exportBackup = () => {
    downloadBackupFile();
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
