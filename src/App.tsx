import React, { useEffect } from 'react';
import { useJourney } from './context/JourneyContext';
import { Navbar } from './components/layout/Navbar';
import { ApiKeyModal } from './components/layout/ApiKeyModal';
import { CreateJourneyModal } from './components/dashboard/CreateJourneyModal';
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
  Compass
} from 'lucide-react';
import { AlterPersona } from './types/alter';

export const AppContent: React.FC = () => {
  const { activeJourney, activePersona, setActivePersona, setIsCreateModalOpen } = useJourney();

  useEffect(() => {
    document.body.setAttribute('data-screen', activePersona);
  }, [activePersona]);

  const mobileNavItems: { id: AlterPersona; label: string; letter: string; icon: any; colorVar: string }[] = [
    { id: 'advisor', label: 'Advisor', letter: 'A', icon: GraduationCap, colorVar: 'var(--advisor)' },
    { id: 'librarian', label: 'Librarian', letter: 'L', icon: BookOpen, colorVar: 'var(--librarian)' },
    { id: 'tutor', label: 'Tutor', letter: 'T', icon: Lightbulb, colorVar: 'var(--tutor)' },
    { id: 'editor', label: 'Editor', letter: 'E', icon: FileEdit, colorVar: 'var(--editor)' },
    { id: 'roommate', label: 'Roommate', letter: 'R', icon: Users, colorVar: 'var(--roommate)' },
  ];

  return (
    <div className="min-h-screen bg-[var(--void)] text-white flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[#04050a]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-7 py-6 pb-24 md:pb-12">
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
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[var(--accent)]">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white">Welcome to Altor</h2>
            <p className="text-sm text-white/60 max-w-md">
              Create your first learning journey to unleash your personal AI University in a Box.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="accent-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Journey</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for Android / iOS) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090b12]/95 backdrop-blur-lg border-t border-white/[0.07] px-2 py-1.5 shadow-2xl">
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
                    ? 'text-white bg-[var(--surface-3)] shadow-[0_0_0_1px_rgba(255,255,255,0.13)]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-mono font-bold px-1 rounded transition-colors ${
                      isActive ? 'bg-[var(--tab-color)]/20 text-[var(--tab-color)]' : 'bg-white/[0.05] text-white/40'
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
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
