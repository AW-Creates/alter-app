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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8">
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Google Gemini API Setup</h2>
            <p className="text-xs text-slate-400">Connect your free Gemini API key to power all 5 A.L.T.E.R. personas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side & Private</span>
            </div>
            <p>
              Your API key is saved directly in your browser's <code className="text-sky-300">localStorage</code>. It is never sent to any intermediary server.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
              <span className="text-slate-400">Don't have a key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium underline"
              >
                Get a free key from Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1.5 uppercase tracking-wider">
              Gemini API key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              type="button"
              className="text-xs text-slate-400 hover:text-rose-400 transition"
            >
              Clear & Use Demo Mode
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Save & Activate
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
