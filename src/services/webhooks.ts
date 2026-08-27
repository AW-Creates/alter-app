/**
 * Zapier & Custom Webhook Dispatcher
 * Automatically triggers Zapier zaps when users achieve milestones,
 * complete checkpoints, pass Feynman drills, or increment streaks.
 */

const STORAGE_ZAPIER_WEBHOOK = 'alter_zapier_webhook_url';
const STORAGE_WEBHOOK_ENABLED = 'alter_webhook_enabled';

export const getStoredZapierWebhook = (): string => {
  return localStorage.getItem(STORAGE_ZAPIER_WEBHOOK) || '';
};

export const setStoredZapierWebhook = (url: string): void => {
  if (url) {
    localStorage.setItem(STORAGE_ZAPIER_WEBHOOK, url.trim());
    localStorage.setItem(STORAGE_WEBHOOK_ENABLED, 'true');
  } else {
    localStorage.removeItem(STORAGE_ZAPIER_WEBHOOK);
    localStorage.setItem(STORAGE_WEBHOOK_ENABLED, 'false');
  }
};

export const isWebhookEnabled = (): boolean => {
  return localStorage.getItem(STORAGE_WEBHOOK_ENABLED) === 'true';
};

export type WebhookEvent =
  | 'checkpoint_completed'
  | 'feynman_mastered'
  | 'lesson_mastered'
  | 'source_mastered'
  | 'streak_incremented'
  | 'curriculum_generated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  topic: string;
  scholarName?: string;
  details: Record<string, any>;
}

/**
 * Dispatch an event to the configured Zapier / Make webhook URL
 */
export async function dispatchWebhookEvent(
  event: WebhookEvent,
  topic: string,
  details: Record<string, any>
): Promise<boolean> {
  const webhookUrl = getStoredZapierWebhook();
  if (!webhookUrl || !isWebhookEnabled()) return false;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    topic,
    scholarName: 'Altor Scholar',
    details
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'no-cors', // Standard for Zapier catch hooks from client-side
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Webhook dispatch failed:', err);
    return false;
  }
}

/**
 * Test ping for Zapier hook setup
 */
export async function testWebhookPing(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'Please provide a valid https:// URL.' };
  }

  const testPayload: WebhookPayload = {
    event: 'checkpoint_completed',
    timestamp: new Date().toISOString(),
    topic: 'Altor Integration Test',
    scholarName: 'Test Scholar',
    details: {
      message: '✅ Zapier Webhook successfully connected to Altor — University in a Box!',
      proofOfWork: 'Test Proof-of-Work Verification'
    }
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'no-cors',
      body: JSON.stringify(testPayload)
    });

    return {
      success: true,
      message: 'Zapier ping dispatched! Check your Zapier test history.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to ping webhook: ${err.message}`
    };
  }
}
