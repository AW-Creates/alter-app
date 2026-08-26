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
  CheckCircle2,
  Cpu,
  Webhook,
  Send,
  AlertCircle
} from 'lucide-react';
import {
  getStoredPerplexityKey,
  setStoredPerplexityKey,
  getStoredGroundingProvider,
  setStoredGroundingProvider,
  GroundingProvider
} from '../../services/grounding';
import {
  getStoredOpenRouterKey,
  setStoredOpenRouterKey,
  getStoredPreferredModel,
  setStoredPreferredModel,
  OPENROUTER_PRESETS
} from '../../services/openrouter';
import {
  getStoredZapierWebhook,
  setStoredZapierWebhook,
  testWebhookPing
} from '../../services/webhooks';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen, activeJourney } = useJourney();
  
  const [geminiKeyInput, setGeminiKeyInput] = useState(apiKey);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(getStoredOpenRouterKey());
  const [preferredModel, setPreferredModel] = useState(getStoredPreferredModel());
  const [perplexityKeyInput, setPerplexityKeyInput] = useState(getStoredPerplexityKey());
  const [groundingProvider, setGroundingProvider] = useState<GroundingProvider>(getStoredGroundingProvider());
  const [zapierWebhookInput, setZapierWebhookInput] = useState(getStoredZapierWebhook());
  
  const [activeTab, setActiveTab] = useState<'gemini' | 'openrouter' | 'webhooks'>('gemini');
  const [saved, setSaved] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    setApiKey(geminiKeyInput.trim());
    setStoredOpenRouterKey(openRouterKeyInput.trim());
    setStoredPreferredModel(preferredModel);
    setStoredPerplexityKey(perplexityKeyInput.trim());
    setStoredGroundingProvider(groundingProvider);
    setStoredZapierWebhook(zapierWebhookInput.trim());
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsApiKeyModalOpen(false);
    }, 500);
  };

  const handleClear = () => {
    setGeminiKeyInput('');
    setOpenRouterKeyInput('');
    setPerplexityKeyInput('');
    setZapierWebhookInput('');
    setApiKey('');
    setStoredOpenRouterKey('');
    setStoredPerplexityKey('');
    setStoredZapierWebhook('');
    setStoredGroundingProvider('auto');
  };

  const handleTestWebhook = async () => {
    if (!zapierWebhookInput.trim()) return;
    setIsPinging(true);
    setPingStatus(null);
    const res = await testWebhookPing(zapierWebhookInput.trim());
    setIsPinging(false);
    setPingStatus(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl p-6 md:p-8 my-6">
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] flex items-center justify-center text-[var(--advisor)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]">AI Engines &amp; Integrations Hub</h2>
            <p className="text-xs text-[var(--ink-2)]">Power Altor with Google Gemini, OpenRouter (Claude/DeepSeek), or Zapier Automations</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[var(--hairline)] gap-4 mb-5 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-[var(--advisor)] text-[var(--advisor)]'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Sparkles size={13} />
            <span>Google Gemini (Free Core)</span>
          </button>

          <button
            onClick={() => setActiveTab('openrouter')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'openrouter'
                ? 'border-[var(--editor)] text-[var(--editor)]'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Cpu size={13} />
            <span>OpenRouter (Claude / DeepSeek / Sonar)</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'webhooks'
                ? 'border-[var(--tutor)] text-[var(--tutor)]'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Webhook size={13} />
            <span>Zapier &amp; Webhooks (Sync)</span>
          </button>
        </div>

        {/* Tab 1: Gemini */}
        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--advisor)] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Search Grounding Active</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--tutor)] bg-[var(--surface-1)] border border-[var(--hairline)] px-2 py-0.5 rounded">
                  Gemini 2.0 Flash
                </span>
              </div>
              <p className="m-0 leading-relaxed">
                Connect your Google Gemini API key to activate all 5 faculty personas with native <strong>Google Search Grounding</strong> for up-to-date curricula and verified reading lists.
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

        {/* Tab 2: OpenRouter */}
        {activeTab === 'openrouter' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--editor)] font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Access 400+ Frontier Models with 1 Key</span>
              </div>
              <p className="m-0 leading-relaxed">
                Empower your Analytical Editor with <strong>Claude 3.5 Sonnet</strong>, your Socratic Tutor with <strong>DeepSeek R1</strong> chain-of-thought reasoning, and your Knowledge Librarian with <strong>Perplexity Sonar</strong> web research.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[var(--hairline)]">
                <span className="text-[var(--ink-3)]">Get an OpenRouter Key:</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--editor)] hover:underline font-medium"
                >
                  openrouter.ai/keys
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={openRouterKeyInput}
                onChange={(e) => setOpenRouterKeyInput(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--editor)] font-mono transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                Default Persona Model Preset
              </label>
              <div className="space-y-2">
                {OPENROUTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPreferredModel(preset.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition text-xs ${
                      preferredModel === preset.id
                        ? 'bg-[var(--surface-3)] border-[var(--editor)] text-[var(--ink)] font-semibold'
                        : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-2)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] font-mono text-[var(--editor)] opacity-80">{preset.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Zapier & Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--tutor)] font-semibold">
                <Webhook className="w-4 h-4" />
                <span>Automate Notion, Discord, Slack, or Calendar</span>
              </div>
              <p className="m-0 leading-relaxed">
                Paste a <strong>Zapier "Catch Hook"</strong> URL (or Make.com webhook) to automatically trigger automations whenever you check off a curriculum milestone, pass a Feynman drill, or increase your study streak.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[var(--hairline)]">
                <span className="text-[var(--ink-3)]">Create Zap at Zapier:</span>
                <a
                  href="https://zapier.com/apps/webhook/integrations"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--tutor)] hover:underline font-medium"
                >
                  Zapier Webhook Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
                Zapier / Make Catch Hook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={zapierWebhookInput}
                  onChange={(e) => setZapierWebhookInput(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--tutor)] font-mono transition"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isPinging || !zapierWebhookInput.trim()}
                  className="px-4 py-2.5 rounded-xl border border-[var(--tutor)] bg-[color-mix(in_srgb,var(--tutor)_10%,transparent)] text-[var(--tutor)] hover:bg-[var(--tutor)] hover:text-white font-medium text-xs transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isPinging ? (
                    <span>Pinging...</span>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Test Ping</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {pingStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pingStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {pingStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{pingStatus.message}</span>
              </div>
            )}
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
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Integrations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
