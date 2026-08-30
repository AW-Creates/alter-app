// ============================================================================
// NATURAL NEURAL VOICE & LIVE SPEECH SYNTHESIS ENGINE
// ============================================================================

export interface VoicePreset {
  id: string;
  name: string;
  role: string;
  gender: 'female' | 'male';
  preferredVoiceNames: string[];
  pitch: number;
  rate: number;
  description: string;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'athena',
    name: 'Professor Athena',
    role: 'Socratic Academic Dean',
    gender: 'female',
    preferredVoiceNames: [
      'Microsoft Jenny Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Google US English',
      'Samantha',
      'Victoria',
      'Karen',
      'en-US-Neural2-F',
      'en-US-Standard-C'
    ],
    pitch: 1.04,
    rate: 0.98,
    description: 'Warm, articulate, and encouraging academic pacing.'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Master Systems Builder',
    gender: 'male',
    preferredVoiceNames: [
      'Microsoft Guy Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Google UK English Male',
      'Daniel',
      'Alex',
      'en-US-Neural2-D',
      'en-US-Standard-B'
    ],
    pitch: 0.94,
    rate: 1.02,
    description: 'Direct, pragmatic, and high-tempo builder cadence.'
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Calm Socratic Guide',
    gender: 'male',
    preferredVoiceNames: [
      'Microsoft Eric Online (Natural)',
      'Google US English',
      'Fred',
      'Oliver',
      'en-US-Neural2-A'
    ],
    pitch: 1.0,
    rate: 0.96,
    description: 'Calm, thoughtful, and analytical first-principles tone.'
  }
];

let availableVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (availableVoices.length > 0) return availableVoices;

  availableVoices = window.speechSynthesis.getVoices();
  return availableVoices;
}

// Pre-load voices on startup
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the highest quality neural or natural system voice for a preset.
 */
export function matchBestVoice(preset: VoicePreset): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // 1. Try exact match from preferred natural voice names
  for (const preferred of preset.preferredVoiceNames) {
    const found = voices.find(
      (v) => v.name.toLowerCase().includes(preferred.toLowerCase()) || v.voiceURI.toLowerCase().includes(preferred.toLowerCase())
    );
    if (found) return found;
  }

  // 2. Search for any Neural / Natural / Online English voices
  const naturalEnglish = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Neural') ||
        v.name.includes('Online') ||
        v.name.includes('Google') ||
        v.name.includes('Enhanced'))
  );
  if (naturalEnglish) return naturalEnglish;

  // 3. Fallback to any English voice matching gender heuristic
  const fallbackEnglish = voices.find((v) => v.lang.startsWith('en'));
  return fallbackEnglish || voices[0] || null;
}

/**
 * Splits text into natural sentence chunks with punctuation-aware pauses
 * to eliminate monotonous robotic drone.
 */
export function chunkTextForNaturalSpeech(text: string): string[] {
  // Clean markdown syntax, code fences, and links before speaking
  const sanitized = text
    .replace(/```[\s\S]*?```/g, 'Here is the code blueprint displayed on screen.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[┌─┐├┤│└┘▼▲◄►]/g, '')
    .trim();

  // Split by sentence boundaries (.!?) while retaining delimiters
  const sentences = sanitized.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [sanitized];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

export class NaturalSpeechSynthesizer {
  private isSpeaking = false;
  private isPaused = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activePreset: VoicePreset = VOICE_PRESETS[0];
  private playbackRateMultiplier = 1.0;

  constructor(presetId: string = 'athena') {
    this.setPreset(presetId);
  }

  public setPreset(presetId: string) {
    const found = VOICE_PRESETS.find((p) => p.id === presetId);
    if (found) this.activePreset = found;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRateMultiplier = rate;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Speaks text chunk by chunk with natural cadence, pitch inflection, and boundary callbacks.
   */
  public async speakText(
    text: string,
    options?: {
      onStart?: () => void;
      onChunk?: (chunk: string, index: number, total: number) => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }

    this.stop();
    const chunks = chunkTextForNaturalSpeech(text);
    if (chunks.length === 0) {
      options?.onEnd?.();
      return;
    }

    this.isSpeaking = true;
    this.isPaused = false;
    options?.onStart?.();

    const voice = matchBestVoice(this.activePreset);

    for (let i = 0; i < chunks.length; i++) {
      if (!this.isSpeaking) break;

      const chunk = chunks[i];
      options?.onChunk?.(chunk, i, chunks.length);

      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) utterance.voice = voice;

        // Apply natural cadence settings
        utterance.rate = this.activePreset.rate * this.playbackRateMultiplier;
        
        // Question inflection: slightly raise pitch if sentence ends with '?'
        const isQuestion = chunk.endsWith('?');
        utterance.pitch = isQuestion
          ? this.activePreset.pitch * 1.08
          : this.activePreset.pitch;

        utterance.onend = () => {
          // Slight natural breathing pause between sentences (120ms)
          setTimeout(resolve, 120);
        };

        utterance.onerror = (e) => {
          console.warn('Speech chunk error', e);
          resolve();
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      });
    }

    this.isSpeaking = false;
    options?.onEnd?.();
  }

  public getSpeakingState() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      preset: this.activePreset
    };
  }
}
