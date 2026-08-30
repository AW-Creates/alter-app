// Netlify Serverless Function: /.netlify/functions/generate
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'UNCONFIGURED_SERVER_KEY',
        message: 'No GEMINI_API_KEY environment variable configured on Netlify. Please use client-side BYOK.'
      })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      prompt,
      systemInstruction,
      model = 'gemini-2.0-flash',
      jsonMode = false,
      enableSearchGrounding = false,
      contents: customContents
    } = body;

    const contents = customContents || [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const payload = {
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal Netlify function error' })
    };
  }
}
