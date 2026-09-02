// Vercel Serverless Function: /api/generate
import { kv } from '@vercel/kv';

const DAILY_LIMIT = 5;
const MODEL = 'gemini-2.0-flash';
const MAX_PROMPT_CHARS = 25000;

// In-memory usage map for serverless instances (fallback if KV is unprovisioned or fails)
const memStore = new Map();

async function getUsage(usageKey) {
  try {
    if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
      const val = await kv.get(usageKey);
      if (val !== null && val !== undefined) {
        return typeof val === 'number' ? val : parseInt(val, 10) || 0;
      }
    }
  } catch (_e) {
    // Graceful fallback to memory store
  }
  return memStore.get(usageKey) || 0;
}

async function incrementUsage(usageKey, count) {
  try {
    if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
      // 26-hour TTL so per-day keys clean themselves up instead of accumulating forever
      await kv.set(usageKey, count, { ex: 60 * 60 * 26 });
    }
  } catch (_e) {
    // Graceful fallback to memory store
  }
  memStore.set(usageKey, count);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const guestId = req.headers['x-guest-id'] || req.headers['x-forwarded-for'] || 'guest_anon';
  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `${guestId}:${today}`;

  const apiKey =
    process.env.GEMINI_SHARED_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'UNCONFIGURED_SERVER_KEY',
      message: 'No GEMINI_SHARED_API_KEY environment variable configured on server.'
    });
  }

  // Zero-cost health check ping (does not count towards user quota)
  if (req.body?.prompt === 'health_check_ping') {
    return res.status(200).json({ status: 'ok', configured: true });
  }

  const currentUsage = await getUsage(usageKey);
  if (currentUsage >= DAILY_LIMIT) {
    return res.status(429).json({
      message: `You've used your ${DAILY_LIMIT} free requests for today. Add your own Gemini API key for unlimited access.`
    });
  }

  try {
    const {
      prompt,
      systemInstruction,
      model = MODEL,
      jsonMode = false,
      enableSearchGrounding = false,
      contents: customContents
    } = req.body || {};

    if (!prompt && (!customContents || customContents.length === 0)) {
      return res.status(400).json({ error: 'Missing prompt or contents in request body' });
    }

    if (prompt && prompt.length > MAX_PROMPT_CHARS) {
      return res.status(400).json({ error: 'Prompt exceeds maximum character limit' });
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
      return res.status(response.status).json({
        error: errData?.error?.message || `Upstream Gemini API error (${response.status})`
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    await incrementUsage(usageKey, currentUsage + 1);

    return res.status(200).json({
      text,
      remaining: Math.max(0, DAILY_LIMIT - (currentUsage + 1)),
      candidates: data.candidates
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error processing AI generation.' });
  }
}
