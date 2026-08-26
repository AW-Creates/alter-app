import { getStoredApiKey } from './gemini';

export type GroundingProvider = 'gemini_google' | 'perplexity' | 'auto';

const STORAGE_PERPLEXITY_KEY = 'alter_perplexity_api_key';
const STORAGE_GROUNDING_PROVIDER = 'alter_grounding_provider';

export const getStoredPerplexityKey = (): string => {
  return localStorage.getItem(STORAGE_PERPLEXITY_KEY) || '';
};

export const setStoredPerplexityKey = (key: string): void => {
  if (key) {
    localStorage.setItem(STORAGE_PERPLEXITY_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_PERPLEXITY_KEY);
  }
};

export const getStoredGroundingProvider = (): GroundingProvider => {
  return (localStorage.getItem(STORAGE_GROUNDING_PROVIDER) as GroundingProvider) || 'auto';
};

export const setStoredGroundingProvider = (provider: GroundingProvider): void => {
  localStorage.setItem(STORAGE_GROUNDING_PROVIDER, provider);
};

export interface GroundedResult {
  text: string;
  citations: { title: string; url: string; snippet?: string }[];
  providerUsed: 'google_search' | 'perplexity' | 'direct_ai' | 'simulation';
  verifiedAt: string;
}

/**
 * Execute real-time web-grounded query using Gemini Google Search or Perplexity Sonar
 */
export async function queryGroundedAI(
  prompt: string,
  systemInstruction: string = 'You are a master academic researcher and fact-checker. Provide truthful, up-to-date information with verified citations.',
  preferProvider?: GroundingProvider
): Promise<GroundedResult> {
  const geminiKey = getStoredApiKey();
  const perplexityKey = getStoredPerplexityKey();
  const activeProvider = preferProvider || getStoredGroundingProvider();

  // 1. Try Perplexity Sonar if explicitly requested or if only Perplexity key is configured
  if (
    (activeProvider === 'perplexity' || (activeProvider === 'auto' && perplexityKey && !geminiKey)) &&
    perplexityKey
  ) {
    try {
      return await callPerplexitySonar(prompt, systemInstruction, perplexityKey);
    } catch (err) {
      console.warn('Perplexity query failed, falling back to Gemini', err);
    }
  }

  // 2. Try Gemini 2.0 with Native Google Search Grounding
  if (geminiKey) {
    try {
      return await callGeminiWithGoogleSearch(prompt, systemInstruction, geminiKey);
    } catch (err) {
      console.warn('Gemini Search Grounding query failed, falling back to direct AI', err);
    }
  }

  // 3. Fallback: Simulation or Basic Response
  return {
    text: '',
    citations: [],
    providerUsed: 'simulation',
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Call Google Gemini with native Google Search Grounding tool
 */
async function callGeminiWithGoogleSearch(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<GroundedResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    tools: [
      {
        googleSearch: {}
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2500
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini Search Grounding error (${res.status})`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || '';

  // Extract real search grounding metadata / citations
  const citations: { title: string; url: string; snippet?: string }[] = [];
  const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

  for (const chunk of groundingChunks) {
    if (chunk.web?.uri) {
      citations.push({
        title: chunk.web.title || 'Web Reference',
        url: chunk.web.uri
      });
    }
  }

  return {
    text,
    citations,
    providerUsed: 'google_search',
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Call Perplexity Sonar online search models via OpenRouter or Perplexity API
 */
async function callPerplexitySonar(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<GroundedResult> {
  // Support both OpenRouter and Direct Perplexity API keys
  const isOpenRouter = apiKey.startsWith('sk-or-');
  const endpoint = isOpenRouter
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.perplexity.ai/chat/completions';

  const model = isOpenRouter ? 'perplexity/sonar' : 'sonar';

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter ? { 'HTTP-Referer': 'https://altor.app', 'X-Title': 'Altor' } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Perplexity error (${res.status})`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const citations: { title: string; url: string }[] = [];

  // Perplexity citations are returned in data.citations array
  if (Array.isArray(data.citations)) {
    data.citations.forEach((url: string, idx: number) => {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        citations.push({
          title: domain,
          url
        });
      } catch {
        citations.push({
          title: `Source [${idx + 1}]`,
          url
        });
      }
    });
  }

  return {
    text,
    citations,
    providerUsed: 'perplexity',
    verifiedAt: new Date().toISOString()
  };
}
