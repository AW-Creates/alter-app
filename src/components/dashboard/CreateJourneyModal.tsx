import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { generateCurriculumWithAI, generateSourcesWithAI } from '../../services/gemini';
import {
  Sparkles,
  X,
  Target,
  Compass,
  Clock,
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react';

export const CreateJourneyModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createJourney, updateActiveJourney } = useJourney();

  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [baseline, setBaseline] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [depth, setDepth] = useState<'foundational' | 'practitioner' | 'expert' | 'researcher'>('practitioner');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !destination.trim()) return;

    setIsGenerating(true);

    try {
      // 1. Create the Journey locally
      const journey = createJourney({
        title: topic.trim(),
        topic: topic.trim(),
        destination: destination.trim(),
        baseline: baseline.trim() || 'General curiosity and beginner fundamentals.',
        hoursPerWeek,
        depth
      });

      // 2. Generate custom Curriculum + Cut List via Advisor AI
      const advisorData = await generateCurriculumWithAI(
        topic.trim(),
        destination.trim(),
        baseline.trim() || 'Beginner fundamentals',
        hoursPerWeek,
        depth
      );

      // 3. Generate High-Signal Curated Sources via Librarian AI
      const initialSources = await generateSourcesWithAI(
        topic.trim(),
        destination.trim(),
        baseline.trim() || 'Beginner fundamentals'
      );

      // 4. Update the newly created journey
      updateActiveJourney((prev) => ({
        ...prev,
        advisorData: {
          ...advisorData,
          chatHistory: [
            {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              persona: 'advisor',
              content: `Welcome to **${topic}**! I've engineered your ${advisorData.estimatedWeeks}-week modular curriculum and locked in your **Cut List**. Check out Phase 1 below to begin.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        },
        librarianData: {
          ...prev.librarianData,
          sources: initialSources
        }
      }));

      setIsCreateModalOpen(false);
      // Reset fields
      setTopic('');
      setDestination('');
      setBaseline('');
    } catch (err) {
      console.error('Failed to generate journey', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl p-6 md:p-8 my-8">
        <button
          onClick={() => !isGenerating && setIsCreateModalOpen(false)}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-lg bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] flex items-center justify-center text-[var(--advisor)] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Create a new learning journey</h2>
            <p className="text-xs text-[var(--ink-2)]">
              Your AI Advisor will generate a tailored curriculum, milestones, and a strict <span className="text-[var(--advisor)] font-semibold">Cut List</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
              <Compass className="w-3.5 h-3.5 text-[var(--advisor)]" />
              What discipline or skill do you want to master?
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Systems Architecture, Classical Stoicism, Organic Gardening, Sourdough Bakery..."
              className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--advisor)] transition"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
              <Target className="w-3.5 h-3.5 text-[var(--tutor)]" />
              What is your target destination? (proof of mastery)
            </label>
            <textarea
              required
              rows={2}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Build and deploy a multi-node Raft consensus cluster, write an authoritative e-book series, or launch a micro-bakery..."
              className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--advisor)] transition"
            />
          </div>

          {/* Baseline */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-[var(--editor)]" />
              Current baseline knowledge
            </label>
            <input
              type="text"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              placeholder="e.g. Total beginner with zero experience, or comfortable with the basics..."
              className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--advisor)] transition"
            />
          </div>

          {/* Hours & Depth Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--advisor)]" />
                  Time commitment
                </span>
                <span className="text-[var(--advisor)] font-semibold">{hoursPerWeek} hrs/week</span>
              </label>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-[var(--advisor)] bg-[var(--surface-3)] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)] mt-1 font-mono">
                <span>Light (2h)</span>
                <span>Standard (8h)</span>
                <span>Intensive (20h+)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1.5 font-semibold">
                Target depth level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['foundational', 'practitioner', 'expert', 'researcher'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                      depth === d
                        ? 'bg-[color-mix(in_srgb,var(--advisor)_16%,var(--surface-1))] border-[var(--advisor)] text-[var(--advisor)] font-semibold'
                        : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--hairline-strong)]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--hairline)]">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition disabled:opacity-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim() || !destination.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold bg-[var(--advisor)] hover:brightness-110 text-[#04050a] transition disabled:opacity-50 cursor-pointer w-full sm:w-auto shadow-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing university in a box...</span>
                </>
              ) : (
                <>
                  <span>Launch journey</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
