import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  accentColor?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSpeechRecognition(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (transcript.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionInstance) return;

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  if (!hasSpeechRecognition) {
    return (
      <button
        type="button"
        disabled
        className={`p-2 rounded-xl border border-[var(--hairline)] opacity-40 cursor-not-allowed bg-[var(--surface-2)] text-[var(--ink-3)] ${className}`}
        title="Voice dictation is supported in Chrome, Edge, and Safari."
      >
        <Mic className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl border transition flex items-center justify-center relative ${
        isListening
          ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
          : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--hairline-strong)]'
      } ${className}`}
      title={isListening ? 'Stop voice recording' : 'Speak to dictate (Socratic Voice)'}
    >
      {isListening ? (
        <>
          <Mic className="w-4 h-4 text-rose-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
