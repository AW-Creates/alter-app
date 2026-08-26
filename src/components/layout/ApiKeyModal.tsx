import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Key,
  Check,
  ShieldCheck,
  Sparkles,
  X,
  ExternalLink,
  Globe,
  Zap,
  Search,
  CheckCircle2
} from 'lucide-react';
import {
  getStoredPerplexityKey,
  setStoredPerplexityKey,
  getStoredGroundingProvider,
  setStoredGroundingProvider,
  GroundingProvider
} from '../../services/grounding';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen } = useJourney();
  
  const [geminiKeyInput, setGeminiKeyInput] = useState(apiKey);
  const [perplexityKeyInput, setPerplexityKeyInput] = useState(getStoredPerplexityKey());
  const [groundingProvider, setGroundingProvider] = useState<GroundingProvider>(getStoredGroundingProvider());
  
  const [activeTab, setActiveTab] = useState<'gemini' | 'perplexity' | 'grounding'>('gemini');
  const [saved, setSaved] = useState(false);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    setApiKey(geminiKeyInput.trim());
    setStoredPerplexityKey(perplexityKeyInput.trim());
    setStoredGroundingProvider(groundingProvider);
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsApiKeyModalOpen(false);
    }, 500);
  };

  const handleClear = () => {
    setGeminiKeyInput('');
    setPerplexityKeyInput('');
    setApiKey('');
    setStoredPerplexityKey('');
    setStoredGroundingProvider('auto');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl p-6 md:p-8 my-6">
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] flex items-center justify-center text-[var(--advisor)]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]">AI &amp; Real-Time Search Grounding</h2>
            <p className="text-xs text-[var(--ink-2)]">Configure Gemini, Perplexity, and live Google Search verification</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[var(--hairline)] gap-4 mb-5 text-xs">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gemini'
                ? 'border-[var(--advisor)] text-[var(--advisor)]'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Sparkles size={13} />
            <span>Google Gemini (Core AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('perplexity')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'perplexity'
                ? 'border-[var(--librarian)] text-[var(--librarian)]'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Search size={13} />
            <span>Perplexity / Sonar (Deep Search)</span>
          </button>
        </div>

        {/* Tab 1: Gemini */}
        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--advisor)] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Search Grounding Enabled</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--tutor)] bg-[var(--surface-1)] border border-[var(--hairline)] px-2 py-0.5 rounded">
                  Gemini 2.0 Flash
                </span>
              </div>
              <p className="m-0 leading-relaxed">
                Connect your Google Gemini API key to activate all 5 personas with native <strong>Google Search Grounding</strong> for up-to-date curricula and verified reading lists.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[var(--hairline)]">
                <span className="text-[var(--ink-3)]">Free key at Google AI Studio:</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--advisor)] hover:underline font-medium"
                >
                  Get free Gemini key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--advisor)] font-mono transition"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Perplexity */}
        {activeTab === 'perplexity' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--librarian)] font-semibold">
                <Search className="w-4 h-4" />
                <span>Perplexity Sonar Real-Time Citations</span>
              </div>
              <p className="m-0 leading-relaxed">
                Provide a <strong>Perplexity API Key</strong> or an <strong>OpenRouter API Key</strong> (prefixed with <code className="font-mono text-[var(--librarian)]">sk-or-</code>) to empower the Knowledge Librarian with real-time web research, current papers, and live citations.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[var(--hairline)]">
                <span className="text-[var(--ink-3)]">Get key from Perplexity or OpenRouter:</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--librarian)] hover:underline font-medium"
                >
                  OpenRouter Keys ↗
                </a>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                Perplexity / OpenRouter API Key (Optional)
              </label>
              <input
                type="password"
                value={perplexityKeyInput}
                onChange={(e) => setPerplexityKeyInput(e.target.value)}
                placeholder="pplx-... or sk-or-v1-..."
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--librarian)] font-mono transition"
              />
            </div>

            {/* Provider Preference */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                Default Grounding Search Engine
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'auto' as GroundingProvider, label: 'Auto (Best Match)' },
                  { id: 'gemini_google' as GroundingProvider, label: 'Google Search' },
                  { id: 'perplexity' as GroundingProvider, label: 'Perplexity Sonar' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGroundingProvider(item.id)}
                    className={`py-2 px-2.5 rounded-lg border transition text-center font-medium ${
                      groundingProvider === item.id
                        ? 'bg-[var(--surface-3)] border-[var(--advisor)] text-[var(--ink)] font-semibold'
                        : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-3)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--hairline)] mt-6">
          <button
            onClick={handleClear}
            type="button"
            className="text-xs text-[var(--ink-3)] hover:text-rose-500 transition"
          >
            Clear All &amp; Demo Mode
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApiKeyModalOpen(false)}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="accent-btn"
              style={{ padding: '9px 18px', borderRadius: '10px' }}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved Keys</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
