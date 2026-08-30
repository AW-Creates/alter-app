import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  FileEdit,
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  X,
  Compass,
  Zap,
  Target
} from 'lucide-react';

export const OnboardingGuideModal: React.FC = () => {
  const { isOnboardingTourOpen, setIsOnboardingTourOpen, activeJourney, setActivePersona, navigateToTutorConcept } = useJourney();
  const [step, setStep] = useState<number>(1);

  if (!isOnboardingTourOpen) return null;

  const currentTopic = activeJourney?.topic || activeJourney?.title || 'your chosen subject';
  const firstCourseTitle = activeJourney?.advisorData?.phases?.[0]?.courses?.[0]?.title ||
    activeJourney?.advisorData?.phases?.[0]?.coreConcepts?.[0] ||
    'Core Fundamentals';

  const handleStartLearning = () => {
    setIsOnboardingTourOpen(false);
    setActivePersona('tutor');
    navigateToTutorConcept(firstCourseTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--advisor)]/40 shadow-2xl p-6 md:p-8 text-[var(--ink)] my-8">
        {/* Close Button */}
        <button
          onClick={() => setIsOnboardingTourOpen(false)}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--advisor)]/20 text-[var(--advisor)] flex items-center justify-center font-bold text-sm">
              {step}/3
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--ink-3)]">
              {step === 1 && 'Welcome to Altor'}
              {step === 2 && 'Meet Your 5-Persona Faculty'}
              {step === 3 && 'Your Step-by-Step Learning Loop'}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[var(--advisor)]' : 'w-2 bg-[var(--hairline)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SLIDE 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--advisor)]/20 to-[var(--tutor)]/20 border border-[var(--advisor)]/40 flex items-center justify-center text-[var(--advisor)] shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">
                  Welcome to Altor
                </h2>
                <p className="text-sm text-[var(--ink-2)]">
                  Your personalized, AI-powered autodidactic university in a box.
                </p>
              </div>
            </div>

            <div className="p-4.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
              <p className="text-sm leading-relaxed text-[var(--ink-1)]">
                Most online courses either dump 20 hours of passive video on you or leave you with zero direction.
              </p>
              <p className="text-sm leading-relaxed text-[var(--ink-1)] font-medium">
                Altor is designed around a single principle: <span className="text-[var(--advisor)] font-bold">Applied Mastery Through Step-by-Step Structured Teaching</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--hairline)] text-center space-y-1">
                <div className="text-xl">🗺️</div>
                <div className="text-xs font-bold text-[var(--ink)]">3-Phase Roadmap</div>
                <div className="text-[11px] text-[var(--ink-3)]">No fluff. Structured chronological courses.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--hairline)] text-center space-y-1">
                <div className="text-xl">💡</div>
                <div className="text-xs font-bold text-[var(--ink)]">1-on-1 Socratic Tutor</div>
                <div className="text-[11px] text-[var(--ink-3)]">Teaches you concepts from scratch with real examples.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--hairline)] text-center space-y-1">
                <div className="text-xl">🛠️</div>
                <div className="text-xs font-bold text-[var(--ink)]">Tangible Deliverables</div>
                <div className="text-[11px] text-[var(--ink-3)]">Build real projects & get them pressure-tested.</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: MEET THE 5 FACULTY PERSONAS */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--tutor)]" />
                Meet Your 5-Persona Faculty
              </h2>
              <p className="text-xs text-[var(--ink-3)] mt-0.5">
                Each persona specializes in a different part of your learning journey:
              </p>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--advisor)]/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--advisor)]/15 text-[var(--advisor)] font-bold text-sm">
                  🎓
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--advisor)] text-sm">Academic Advisor</div>
                  <div className="text-[var(--ink-2)] mt-0.5">
                    Your curriculum architect. Houses your 3-Phase Roadmap, Chronological Courses (1.1, 1.2, 1.3), Milestone Checkpoints, and the Cut List.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--tutor)]/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--tutor)]/15 text-[var(--tutor)] font-bold text-sm">
                  💡
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--tutor)] text-sm">Socratic Tutor</div>
                  <div className="text-[var(--ink-2)] mt-0.5">
                    Your private instructor. Delivers structured interactive masterclasses, explains analogies, checks your understanding, and quizzes your intuition.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--librarian)]/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--librarian)]/15 text-[var(--librarian)] font-bold text-sm">
                  📚
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--librarian)] text-sm">Knowledge Librarian</div>
                  <div className="text-[var(--ink-2)] mt-0.5">
                    Your research vault. Curates the top 1% definitive books, seminal research papers, and grounded notes so you read only high-signal material.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--editor)]/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--editor)]/15 text-[var(--editor)] font-bold text-sm">
                  ✍️
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--editor)] text-sm">Analytical Editor</div>
                  <div className="text-[var(--ink-2)] mt-0.5">
                    Your critical reviewer. Submits your project drafts, pitch decks, code snippets, or essays to tough logic audits and steelman critique.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--roommate)]/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--roommate)]/15 text-[var(--roommate)] font-bold text-sm">
                  🛋️
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--roommate)] text-sm">Creative Roommate</div>
                  <div className="text-[var(--ink-2)] mt-0.5">
                    Your late-night brainstorming partner. Connects your topic with unexpected analogies from physics, game design, biology, and architecture.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: THE 3-STEP LEARNING LOOP */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--advisor)]" />
                How to Progress Through {currentTopic}
              </h2>
              <p className="text-xs text-[var(--ink-3)] mt-0.5">
                Follow this simple 3-step loop to guarantee you achieve real mastery:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--advisor)]/20 text-[var(--advisor)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-[var(--ink)]">Check Your Advisor Roadmap</div>
                  <div className="text-[var(--ink-2)]">
                    Look at your 3 phases and click <strong>"Start Course 1.1"</strong>.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--tutor)]/20 text-[var(--tutor)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-[var(--ink)]">1-on-1 Socratic Live Classroom</div>
                  <div className="text-[var(--ink-2)]">
                    Engage in live turn-by-turn conversational sparring with your Socratic Tutor via voice or text. Get concrete analogies and verify mastery.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--editor)]/20 text-[var(--editor)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-[var(--ink)]">Build Your Milestone Deliverable</div>
                  <div className="text-[var(--ink-2)]">
                    Complete your Phase 1 project deliverable, paste your work into the Editor for feedback, and mark Phase 1 complete!
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_10%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_25%,transparent)] flex items-center justify-between">
              <div className="text-xs">
                <div className="font-semibold text-[var(--advisor)]">Ready to begin your journey?</div>
                <div className="text-[var(--ink-3)] text-[11px]">First Up: <strong>{firstCourseTitle}</strong></div>
              </div>
              <button
                onClick={handleStartLearning}
                className="px-4 py-2 rounded-xl bg-[var(--advisor)] hover:bg-[var(--advisor)]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5" />
                Enter Live Classroom Now →
              </button>
            </div>
          </div>
        )}

        {/* NAVIGATION CONTROLS */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--hairline)]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink)] font-semibold text-xs flex items-center gap-1.5 border border-[var(--hairline)] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[var(--advisor)] hover:bg-[var(--advisor)]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleStartLearning}
              className="px-5 py-2.5 rounded-xl bg-[var(--tutor)] hover:bg-[var(--tutor)]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              Enter Live Socratic Classroom →
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
