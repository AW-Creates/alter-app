import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { Key, Check, ShieldCheck, Sparkles, X, ExternalLink } from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen } = useJourney();
  const [inputKey, setInputKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsApiKeyModalOpen(false);
    }, 600);
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-2xl p-6 md:p-8">
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_14%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_30%,transparent)] flex items-center justify-center text-[var(--advisor)]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]">Google Gemini API Setup</h2>
            <p className="text-xs text-[var(--ink-2)]">Connect your free Gemini API key to power all 5 A.L.T.E.R. personas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl p-4 text-xs text-[var(--ink-2)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--advisor)] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side &amp; Private</span>
            </div>
            <p className="m-0">
              Your API key is saved directly in your browser's <code className="text-[var(--advisor)] bg-[var(--surface-3)] px-1 py-0.5 rounded font-mono">localStorage</code>. It is never sent to any intermediary server.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-[var(--hairline)]">
              <span className="text-[var(--ink-3)]">Don't have a key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--advisor)] hover:underline font-medium"
              >
                Get a free key from Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[var(--ink-3)] mb-1.5 uppercase tracking-wider font-semibold">
              Gemini API key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-3)] focus:outline-none focus:border-[var(--advisor)] font-mono transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              type="button"
              className="text-xs text-[var(--ink-3)] hover:text-rose-500 transition"
            >
              Clear &amp; Use Demo Mode
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
                    <span>Save Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
