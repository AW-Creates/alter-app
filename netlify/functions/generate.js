// Netlify Serverless Function: /.netlify/functions/generate
import { getStore } from '@netlify/blobs';

const DAILY_LIMIT = 5;
const MODEL = 'gemini-2.0-flash';
const MAX_PROMPT_CHARS = 25000;

// In-memory usage map for function instances (fallback if Blobs is unprovisioned or fails)
const memStore = new Map();

async function getUsage(usageKey) {
  try {
    const store = getStore('shared-api-usage');
    const val = await store.get(usageKey);
    if (val !== null && val !== undefined) {
      return parseInt(val, 10) || 0;
    }
  } catch (_e) {
    // Graceful fallback to memory store
  }
  return memStore.get(usageKey) || 0;
}

async function incrementUsage(usageKey, count) {
  try {
    const store = getStore('shared-api-usage');
    await store.set(usageKey, String(count));
  } catch (_e) {
    // Graceful fallback to memory store
  }
  memStore.set(usageKey, count);
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const guestId = (event.headers && (event.headers['x-guest-id'] || event.headers['client-ip'])) || 'guest_anon';
  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `${guestId}:${today}`;

  const currentUsage = await getUsage(usageKey);
  if (currentUsage >= DAILY_LIMIT) {
    return {
      statusCode: 429,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `You've used your ${DAILY_LIMIT} free requests for today. Add your own Gemini API key for unlimited access.`
      })
    };
  }

  const apiKey =
    process.env.GEMINI_SHARED_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'UNCONFIGURED_SERVER_KEY',
        message: 'No GEMINI_SHARED_API_KEY environment variable configured on Netlify. Please use client-side BYOK.'
      })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      prompt,
      systemInstruction,
      model = MODEL,
      jsonMode = false,
      enableSearchGrounding = false,
      contents: customContents
    } = body;

    if (!prompt && (!customContents || customContents.length === 0)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing prompt or contents' })
      };
    }

    if (prompt && prompt.length > MAX_PROMPT_CHARS) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt exceeds maximum character limit' })
      };
    }

    const contents = customContents || [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2500
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    if (jsonMode) {
      payload.generationConfig.responseMimeType = 'application/json';
    }

    if (enableSearchGrounding) {
      payload.tools = [{ googleSearch: {} }];
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errData?.error?.message || `Upstream Gemini API error (${response.status})`
        })
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    await incrementUsage(usageKey, currentUsage + 1);

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        remaining: Math.max(0, DAILY_LIMIT - (currentUsage + 1)),
        candidates: data.candidates
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Internal Netlify function error' })
    };
  }
}
