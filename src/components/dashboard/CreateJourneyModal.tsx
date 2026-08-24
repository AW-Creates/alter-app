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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8 my-8">
        <button
          onClick={() => !isGenerating && setIsCreateModalOpen(false)}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Create a New Learning Journey</h2>
            <p className="text-xs text-slate-400">
              Your AI Advisor will generate a tailored curriculum, milestones, and a strict <span className="text-sky-400 font-semibold">Cut List</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              What discipline or skill do you want to master?
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Systems Architecture, Classical Stoicism, Fullstack React & AI..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              What is your Target Destination? (Proof of Mastery)
            </label>
            <textarea
              required
              rows={2}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Build and deploy a multi-node Raft consensus cluster, write an authoritative essay series, or launch a SaaS..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Baseline */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Current Baseline Knowledge
            </label>
            <input
              type="text"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              placeholder="e.g. Comfortable with basic Python and networking fundamentals, but zero distributed state experience..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Hours & Depth Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Time Commitment
                </span>
                <span className="text-sky-400 font-bold">{hoursPerWeek} hrs/week</span>
              </label>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Light (2h)</span>
                <span>Standard (8h)</span>
                <span>Intensive (20h+)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Depth Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['foundational', 'practitioner', 'expert', 'researcher'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                      depth === d
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim() || !destination.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:opacity-90 text-slate-950 shadow-lg shadow-sky-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing University in a Box...</span>
                </>
              ) : (
                <>
                  <span>Launch Journey</span>
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
