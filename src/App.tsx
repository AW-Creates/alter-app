import React, { useState, useEffect } from 'react';
import { useJourney } from './context/JourneyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { ApiKeyModal } from './components/layout/ApiKeyModal';
import { CreateJourneyModal } from './components/dashboard/CreateJourneyModal';
import { PricingModal } from './components/layout/PricingModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { AdvisorView } from './components/alter/AdvisorView';
import { LibrarianView } from './components/alter/LibrarianView';
import { TutorView } from './components/alter/TutorView';
import { EditorView } from './components/alter/EditorView';
import { RoommateView } from './components/alter/RoommateView';
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  FileEdit,
  Users,
  Plus,
  Compass,
  Sparkles,
  X
} from 'lucide-react';
import { AlterPersona } from './types/alter';

export const AppContent: React.FC = () => {
  const { activeJourney, activePersona, setActivePersona, setIsCreateModalOpen } = useJourney();
  const { user, setIsAuthModalOpen } = useAuth();
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(activeJourney ? 'app' : 'landing');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-screen', activePersona);
  }, [activePersona]);

  // If a new journey is created, auto-switch to app view
  useEffect(() => {
    if (activeJourney) {
      setViewMode('app');
    }
  }, [activeJourney?.id]);

  const mobileNavItems: { id: AlterPersona; label: string; letter: string; icon: any; colorVar: string }[] = [
    { id: 'advisor', label: 'Advisor', letter: 'A', icon: GraduationCap, colorVar: 'var(--advisor)' },
    { id: 'librarian', label: 'Librarian', letter: 'L', icon: BookOpen, colorVar: 'var(--librarian)' },
    { id: 'tutor', label: 'Tutor', letter: 'T', icon: Lightbulb, colorVar: 'var(--tutor)' },
    { id: 'editor', label: 'Editor', letter: 'E', icon: FileEdit, colorVar: 'var(--editor)' },
    { id: 'roommate', label: 'Roommate', letter: 'R', icon: Users, colorVar: 'var(--roommate)' },
  ];

  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] font-sans">
        <LandingPage onEnterApp={() => setViewMode('app')} />
        <ApiKeyModal />
        <CreateJourneyModal />
        <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[#04050a]">
      {/* Top Navbar */}
      <Navbar
        onOpenLanding={() => setViewMode('landing')}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Guest Mode Cloud Sync Banner */}
      {user.isGuest && activeJourney && showSyncBanner && (
        <div className="bg-[color-mix(in_srgb,var(--advisor)_10%,var(--surface-1))] border-b border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] px-4 py-2 flex items-center justify-between text-xs text-[var(--ink)] transition">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Sparkles size={14} className="text-[var(--advisor)] flex-shrink-0" />
            <span className="truncate">
              Studying <strong>{activeJourney.title}</strong> in Guest Mode. <span className="hidden sm:inline text-[var(--ink-2)]">Create a free scholar account to preserve your streak &amp; sync across devices.</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-[var(--advisor)] text-[#04050a] font-bold text-[11px] hover:brightness-110 shadow-sm transition"
            >
              Sign Up / Sync
            </button>
            <button
              onClick={() => setShowSyncBanner(false)}
              className="p-1 text-[var(--ink-3)] hover:text-[var(--ink)] transition"
              title="Dismiss banner"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="screen active">
        {activeJourney ? (
          <>
            {activePersona === 'advisor' && <AdvisorView />}
            {activePersona === 'librarian' && <LibrarianView />}
            {activePersona === 'tutor' && <TutorView />}
            {activePersona === 'editor' && <EditorView />}
            {activePersona === 'roommate' && <RoommateView />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-center text-[var(--accent)]">
              <Compass size={32} />
            </div>
            <h2 className="text-2xl font-display font-semibold text-[var(--ink)] m-0">Welcome to Altor</h2>
            <p className="text-sm text-[var(--ink-2)] max-w-md m-0">
              Create your first learning journey to unleash your personal AI University in a Box.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="accent-btn"
            >
              <Plus size={15} />
              <span>Create First Journey</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-1)]/95 backdrop-blur-lg border-t border-[var(--hairline)] px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePersona === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePersona(item.id)}
                style={{ '--tab-color': item.colorVar } as React.CSSProperties}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isActive
                    ? 'text-[var(--ink)] bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--hairline-strong)]'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-mono font-bold px-1 rounded transition-colors ${
                      isActive ? 'bg-[var(--tab-color)]/20 text-[var(--tab-color)]' : 'bg-[var(--hairline)] text-[var(--ink-3)]'
                    }`}
                  >
                    {item.letter}
                  </span>
                </div>
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Modals */}
      <ApiKeyModal />
      <CreateJourneyModal />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
