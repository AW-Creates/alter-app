import { AlterPersona, LearningJourney } from '../types/alter';
import { SYSTEM_PROMPTS } from './prompts';

const STORAGE_OPENROUTER_KEY = 'alter_openrouter_api_key';
const STORAGE_PREFERRED_MODEL = 'alter_preferred_openrouter_model';

export const OPENROUTER_PRESETS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Elite Prose & Editor)', tag: 'Recommended for Editor' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Deep Chain-of-Thought Reasoning)', tag: 'Recommended for Tutor' },
  { id: 'perplexity/sonar', name: 'Perplexity Sonar (Live Real-Time Web Search)', tag: 'Recommended for Librarian' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (Fast Polymath)', tag: 'Fast & Versatile' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (High Velocity)', tag: 'Balanced' }
];

export const getStoredOpenRouterKey = (): string => {
  return localStorage.getItem(STORAGE_OPENROUTER_KEY) || '';
};

export const setStoredOpenRouterKey = (key: string): void => {
  if (key) {
    localStorage.setItem(STORAGE_OPENROUTER_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_OPENROUTER_KEY);
  }
};

export const getStoredPreferredModel = (): string => {
  return localStorage.getItem(STORAGE_PREFERRED_MODEL) || 'anthropic/claude-3.5-sonnet';
};

export const setStoredPreferredModel = (model: string): void => {
  localStorage.setItem(STORAGE_PREFERRED_MODEL, model);
};

/**
 * Call OpenRouter Chat Completions API
 */
export async function callOpenRouter(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  modelOverride?: string,
  temperature = 0.7
): Promise<string> {
  const apiKey = getStoredOpenRouterKey();
  if (!apiKey) {
    throw new Error('MISSING_OPENROUTER_KEY');
  }

  const model = modelOverride || getStoredPreferredModel();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://altor.app',
      'X-Title': 'Altor — University in a Box'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `OpenRouter API error (${response.status})`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('Empty response from OpenRouter');
  }

  return choice;
}

/**
 * Smart persona routing for OpenRouter: Pick the absolute best model for each faculty persona
 */
export function getRecommendedModelForPersona(persona: AlterPersona): string {
  switch (persona) {
    case 'editor':
      return 'anthropic/claude-3.5-sonnet';
    case 'tutor':
      return 'deepseek/deepseek-r1';
    case 'librarian':
      return 'perplexity/sonar';
    case 'roommate':
      return 'anthropic/claude-3.5-sonnet';
    case 'advisor':
    default:
      return 'anthropic/claude-3.5-sonnet';
  }
}
