// Vercel Serverless Function: /api/generate
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'UNCONFIGURED_SERVER_KEY',
      message: 'No GEMINI_API_KEY environment variable is configured on this serverless deployment. Please provide a client-side BYOK key in settings.'
    });
  }

  try {
    const {
      prompt,
      systemInstruction,
      model = 'gemini-2.0-flash',
      jsonMode = false,
      enableSearchGrounding = false,
      contents: customContents
    } = req.body || {};

    if (!prompt && (!customContents || customContents.length === 0)) {
      return res.status(400).json({ error: 'Missing prompt or contents in request body' });
    }

    const contents = customContents || [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const payload = {
      contents,
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2500
      }
    };

    if (jsonMode) {
      payload.generationConfig.responseMimeType = 'application/json';
    }

    if (enableSearchGrounding) {
      payload.tools = [{ googleSearch: {} }];
    }

    const url = https://generativelanguage.googleapis.com/v1beta/models/:generateContent?key=;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || Upstream Gemini API error ()
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error processing AI generation.' });
  }
}
