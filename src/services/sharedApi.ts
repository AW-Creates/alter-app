const STORAGE_GUEST_ID = 'alter_guest_id_v1';
const STORAGE_SHARED_USAGE = 'altor_shared_usage_cache_v1';
const STORAGE_SERVER_UNCONFIGURED = 'altor_shared_server_unconfigured_v1';
export const DEFAULT_DAILY_LIMIT = 5;

export const getGuestId = (): string => {
  let id = localStorage.getItem(STORAGE_GUEST_ID);
  if (!id) {
    id =
      'guest_' +
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(STORAGE_GUEST_ID, id);
  }
  return id;
};

export interface SharedProxyUsage {
  date: string;
  remaining: number;
}

export const isSharedServerUnconfigured = (): boolean => {
  return localStorage.getItem(STORAGE_SERVER_UNCONFIGURED) === 'true';
};

export const setSharedServerUnconfigured = (unconfigured: boolean): void => {
  if (unconfigured) {
    localStorage.setItem(STORAGE_SERVER_UNCONFIGURED, 'true');
  } else {
    localStorage.removeItem(STORAGE_SERVER_UNCONFIGURED);
  }
};

export const getStoredSharedUsage = (): SharedProxyUsage => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(STORAGE_SHARED_USAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today && typeof parsed.remaining === 'number') {
        return parsed;
      }
    }
  } catch (e) {}
  return { date: today, remaining: DEFAULT_DAILY_LIMIT };
};

export const updateStoredSharedUsage = (remaining: number): void => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(STORAGE_SHARED_USAGE, JSON.stringify({ date: today, remaining }));
  } catch (e) {}
};

/**
 * Lightweight zero-cost health check that tests if the serverless proxy has GEMINI_SHARED_API_KEY configured.
 * Does not consume any user requests.
 */
export async function checkSharedServerHealth(): Promise<'available' | 'unconfigured' | 'quota_exceeded'> {
  const usage = getStoredSharedUsage();
  if (usage.remaining <= 0) {
    return 'quota_exceeded';
  }

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Id': getGuestId()
      },
      body: JSON.stringify({ prompt: 'health_check_ping' })
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html') || res.status === 404 || res.status === 503) {
      setSharedServerUnconfigured(true);
      return 'unconfigured';
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 503 || data?.error === 'UNCONFIGURED_SERVER_KEY') {
      setSharedServerUnconfigured(true);
      return 'unconfigured';
    }

    if (res.status === 429) {
      updateStoredSharedUsage(0);
      return 'quota_exceeded';
    }

    setSharedServerUnconfigured(false);
    return 'available';
  } catch (_e) {
    setSharedServerUnconfigured(true);
    return 'unconfigured';
  }
}

export async function callSharedProxy(
  prompt?: string,
  systemInstruction?: string,
  enableSearchGrounding = false,
  customContents?: any[],
  model = 'gemini-2.0-flash'
): Promise<{ text: string; remaining: number }> {
  const usage = getStoredSharedUsage();
  if (usage.remaining <= 0) {
    throw new Error(
      `You've used your ${DEFAULT_DAILY_LIMIT} free requests for today. Add your own Gemini API key for unlimited access.`
    );
  }

  let res: Response;
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Id': getGuestId()
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        enableSearchGrounding,
        contents: customContents,
        model
      })
    });
  } catch (netErr: any) {
    throw new Error(netErr?.message || 'Network error reaching shared AI service.');
  }

  const contentType = res.headers.get('content-type') || '';
  // If the endpoint is not handled and returns the SPA's index.html or 404
  if (contentType.includes('text/html') || res.status === 404) {
    setSharedServerUnconfigured(true);
    throw new Error('UNCONFIGURED_SERVER_KEY');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    updateStoredSharedUsage(0);
    throw new Error(
      data.message ||
        `You've used your ${DEFAULT_DAILY_LIMIT} free requests for today. Add your own Gemini API key for unlimited access.`
    );
  }

  if (res.status === 503 || data?.error === 'UNCONFIGURED_SERVER_KEY') {
    setSharedServerUnconfigured(true);
    throw new Error('UNCONFIGURED_SERVER_KEY');
  }

  if (!res.ok) {
    throw new Error(data.error || `Shared proxy error (${res.status})`);
  }

  // Request succeeded: server is definitely configured
  setSharedServerUnconfigured(false);

  const text = data.text || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const remaining =
    typeof data.remaining === 'number' ? data.remaining : Math.max(0, usage.remaining - 1);
  updateStoredSharedUsage(remaining);

  return { text, remaining };
}
