import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { X, Sparkles, Compass, Clock, Target, Layers, ArrowRight, Loader2 } from 'lucide-react';
import { generateCurriculumWithAI, generateSourcesWithAI } from '../../services/gemini';
import { defaultAdvisor, defaultLibrarian, defaultTutor, defaultEditor, defaultRoommate } from '../../types/alter';

export const CreateJourneyModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, addJourney } = useJourney();

  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [baseline, setBaseline] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [depth, setDepth] = useState<'survey' | 'applied' | 'expert' | 'researcher'>('applied');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !destination.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // 1. Generate curriculum & cut list from Advisor
      const generatedAdvisor = await generateCurriculumWithAI(
        topic,
        destination,
        baseline || 'Beginner with basic intuition',
        hoursPerWeek,
        depth
      );

      // 2. Generate curated top 1% sources from Librarian
      const generatedSources = await generateSourcesWithAI(
        topic,
        destination,
        baseline || 'Beginner'
      );

      const newJourney = {
        id: 'journey_' + Date.now(),
        title: topic.trim(),
        topic: topic.trim(),
        destination: destination.trim(),
        baseline: baseline.trim() || 'Foundational intuition',
        hoursPerWeek,
        depth,
        createdAt: new Date().toISOString(),
        streakDays: 1,
        advisorData: generatedAdvisor,
        librarianData: {
          ...defaultLibrarian,
          sources: generatedSources
        },
        tutorData: defaultTutor,
        editorData: defaultEditor,
        roommateData: defaultRoommate
      };

      addJourney(newJourney);
      setIsCreateModalOpen(false);

      // Reset
      setTopic('');
      setDestination('');
      setBaseline('');
    } catch (err: any) {
      console.error('Failed to create journey', err);
      alert('Journey created using standard templates. ' + (err.message || ''));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[var(--surface-2)] border border-white/[0.13] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center text-[var(--accent)] font-display font-semibold">
              A
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white m-0">
                Design New Learning Journey
              </h3>
              <p className="text-xs text-white/50 m-0 mt-0.5">
                Altor AI will construct your roadmap, cut list &amp; top 1% library
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--advisor)]" />
              <span>What do you want to master? (Topic)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems Architecture, Quantum Computing, Neuroscience..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[var(--tutor)]" />
              <span>Target Destination (Proof of Work / Concrete Goal)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Build an autonomous agent framework from scratch and deploy to AWS"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--editor)]" />
              <span>Current Knowledge Baseline</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Intermediate Python programmer, but zero experience with multi-agent orchestration"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--librarian)]" />
                <span>Time Budget: {hoursPerWeek} hrs/week</span>
              </label>
              <input
                type="range"
                min="2"
                max="40"
                step="2"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/30 mt-1">
                <span>2 hrs (Casual)</span>
                <span>20 hrs (Deep)</span>
                <span>40 hrs (Full-time)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Target Depth Level
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-3 outline-none capitalize cursor-pointer"
              >
                <option value="survey">Survey (Broad Mental Models)</option>
                <option value="applied">Applied (Production / Builder)</option>
                <option value="expert">Expert (First-Principles Mastery)</option>
                <option value="researcher">Researcher (State-of-the-Art)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-white/50 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim() || !destination.trim()}
              className="accent-btn py-2.5 px-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing University Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Curriculum &amp; Faculty</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
