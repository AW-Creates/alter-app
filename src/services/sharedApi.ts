const STORAGE_GUEST_ID = 'alter_guest_id_v1';
const STORAGE_SHARED_USAGE = 'altor_shared_usage_cache_v1';
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

  const res = await fetch('/api/generate', {
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

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    updateStoredSharedUsage(0);
    throw new Error(
      data.message ||
        `You've used your ${DEFAULT_DAILY_LIMIT} free requests for today. Add your own Gemini API key for unlimited access.`
    );
  }

  if (res.status === 503) {
    throw new Error('UNCONFIGURED_SERVER_KEY');
  }

  if (!res.ok) {
    throw new Error(data.error || `Shared proxy error (${res.status})`);
  }

  const text = data.text || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const remaining =
    typeof data.remaining === 'number' ? data.remaining : Math.max(0, usage.remaining - 1);
  updateStoredSharedUsage(remaining);

  return { text, remaining };
}
