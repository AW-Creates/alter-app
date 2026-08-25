import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { X, Key, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, apiKey, setApiKey } = useJourney();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  if (!isApiKeyModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim() || null);
    setIsApiKeyModalOpen(false);
  };

  const handleRemove = () => {
    setApiKey(null);
    setInputKey('');
    setIsApiKeyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--surface-2)] border border-white/[0.13] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(95,219,158,0.1)] border border-[rgba(95,219,158,0.25)] flex items-center justify-center text-[var(--tutor)]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white m-0">Gemini AI Settings</h3>
              <p className="text-[11px] text-white/50 m-0">Unlock live generative intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[var(--surface-1)] border border-white/[0.07] focus:border-[var(--accent)] text-white text-xs rounded-lg p-2.5 pr-16 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white font-mono"
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--surface-1)] border border-white/[0.07] p-3 text-xs text-white/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--tutor)] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="text-[11.5px] leading-relaxed m-0">
              Your API key is stored strictly in your browser's local storage and is sent directly to Google Gemini APIs. It never touches our servers.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline pt-1"
            >
              <span>Get a free API key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="pt-2 flex justify-between items-center">
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-400 hover:text-rose-300 transition"
              >
                Disconnect Key
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition"
              >
                Cancel
              </button>
              <button type="submit" className="accent-btn text-xs py-1.5 px-4">
                Save &amp; Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
