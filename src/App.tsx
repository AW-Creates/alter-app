import React from 'react';
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

  const mobileNavItems: { id: AlterPersona; label: string; letter: string; icon: any; activeClass: string }[] = [
    { id: 'advisor', label: 'Advisor', letter: 'A', icon: GraduationCap, activeClass: 'text-indigo-400 border-indigo-500 bg-indigo-500/10' },
    { id: 'librarian', label: 'Librarian', letter: 'L', icon: BookOpen, activeClass: 'text-sky-400 border-sky-500 bg-sky-500/10' },
    { id: 'tutor', label: 'Tutor', letter: 'T', icon: Lightbulb, activeClass: 'text-emerald-400 border-emerald-500 bg-emerald-500/10' },
    { id: 'editor', label: 'Editor', letter: 'E', icon: FileEdit, activeClass: 'text-amber-400 border-amber-500 bg-amber-500/10' },
    { id: 'roommate', label: 'Roommate', letter: 'R', icon: Users, activeClass: 'text-pink-400 border-pink-500 bg-pink-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
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
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Welcome to A.L.T.E.R.</h2>
            <p className="text-sm text-slate-400 max-w-md">
              Create your first learning journey to unleash your personal AI University in a Box.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Journey</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for Android / iOS) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePersona === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePersona(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isActive
                    ? item.activeClass
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-2 text-[9px] font-black px-1 rounded bg-slate-950 border border-slate-700">
                    {item.letter}
                  </span>
                </div>
                <span className="text-[10px] font-semibold mt-1 truncate max-w-full">
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
