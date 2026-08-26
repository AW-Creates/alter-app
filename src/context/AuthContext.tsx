import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured, syncJourneysToCloud, fetchJourneysFromCloud } from '../services/supabase';

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
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const STORAGE_KEY_USER = 'altor_user_profile_v1';

const defaultGuestUser: UserProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  name: 'Scholar (Guest)',
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

  // Listen for Supabase Auth state changes if configured
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

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
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
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

    // Seamless offline/demo fallback
    const updatedUser: UserProfile = {
      ...user,
      id: 'google_' + Date.now(),
      name: 'Alex Vance',
      email: 'alex.vance@example.com',
      username: 'alexvance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isGuest: false,
      syncEnabled: true
    };
    setUser(updatedUser);
    setIsAuthModalOpen(false);
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

    // Seamless offline/demo fallback
    const updatedUser: UserProfile = {
      ...user,
      id: 'github_' + Date.now(),
      name: 'Jordan Lee',
      email: 'jordan.lee@github.com',
      username: 'jordanlee-dev',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isGuest: false,
      syncEnabled: true
    };
    setUser(updatedUser);
    setIsAuthModalOpen(false);
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

    const updatedUser: UserProfile = {
      ...user,
      id: 'email_' + Date.now(),
      name: name || email.split('@')[0],
      email: email,
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      isGuest: false,
      syncEnabled: true
    };
    setUser(updatedUser);
    setIsAuthModalOpen(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        isSupabaseActive,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithGithub,
        loginWithEmail,
        logout,
        updateProfile
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
