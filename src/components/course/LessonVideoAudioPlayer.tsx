import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Headphones,
  Tv,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Copy,
  Check,
  Radio,
  BookOpen,
  Mic,
  Video,
  FileText
} from 'lucide-react';
import { DeepDiveAudioOverview, LessonVideoDeck, LessonSlide, PodcastDialogueLine } from '../../types/alter';

interface LessonVideoAudioPlayerProps {
  concept: string;
  topic: string;
  audioOverview?: DeepDiveAudioOverview;
  videoDeck?: LessonVideoDeck;
}

export const LessonVideoAudioPlayer: React.FC<LessonVideoAudioPlayerProps> = ({
  concept,
  topic,
  audioOverview,
  videoDeck
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'audio' | 'video'>('audio');
  
  // Audio Podcast Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioLineIdx, setActiveAudioLineIdx] = useState(0);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Video Slide Player State
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlayingVideoSlides, setIsPlayingVideoSlides] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Safe fallback data if none provided
  const fallbackAudio: DeepDiveAudioOverview = audioOverview || {
    title: `Deep-Dive Audio Overview: ${concept}`,
    duration: '3:45 min podcast',
    hosts: {
      host1: 'Dr. Sarah (Lead Strategist)',
      host2: 'Leo (Curious Builder)'
    },
    keyTakeaway: `Master the core first-principles loop of ${concept} before optimizing secondary details.`,
    dialogue: [
      {
        id: 'line-1',
        speaker: 'Sarah',
        text: `Hey everyone, welcome back to the Altor Deep-Dive! Today, we are breaking down "${concept}" for anyone learning ${topic}.`,
        timestamp: '0:00'
      },
      {
        id: 'line-2',
        speaker: 'Leo',
        text: `Right! And honestly, when I first heard about "${concept}", it sounded super intimidating. But Sarah, you said there is an everyday analogy that makes this click instantly?`,
        timestamp: '0:18'
      },
      {
        id: 'line-3',
        speaker: 'Sarah',
        text: `Exactly, Leo. Think of it like building a house. Beginners often obsess over the paint color on the walls, but "${concept}" is the concrete foundation. If the foundation is solid, everything else is easy.`,
        timestamp: '0:42'
      },
      {
        id: 'line-4',
        speaker: 'Leo',
        text: `That makes total sense! So what is the number one trap that beginners fall into when they start working with "${concept}"?`,
        timestamp: '1:10'
      },
      {
        id: 'line-5',
        speaker: 'Sarah',
        text: `The biggest trap is premature complexity. They try to do 10 things at once instead of mastering the single core feedback loop. You want to get your first proof-of-work running in under 20 minutes.`,
        timestamp: '1:35'
      },
      {
        id: 'line-6',
        speaker: 'Leo',
        text: `Love that. Start small, build momentum, and verify every step. Let's dive straight into the hands-on blueprint!`,
        timestamp: '2:05'
      }
    ]
  };

  const fallbackVideoDeck: LessonVideoDeck = videoDeck || {
    title: `Visual Masterclass: ${concept}`,
    totalSlides: 4,
    slides: [
      {
        slideNumber: 1,
        title: `1. The Big Picture: ${concept}`,
        subtitle: `First-Principles Intuition & Core Problem`,
        bulletPoints: [
          `Why conventional explanations make "${concept}" overly complicated.`,
          `The core mental model: Eliminate fluff and focus on the primary value outcome.`,
          `How world-class builders approach this in practice.`
        ],
        visualDiagram: `┌──────────────────────────────────────────────┐\n│         CORE FOUNDATION: ${concept.toUpperCase()}          │\n├──────────────────────────────────────────────┤\n│  1. Input / Goal  ──►  2. State Loop  ──►  3. Proof of Work  │\n└──────────────────────────────────────────────┘`,
        voiceoverScript: `Welcome to this visual masterclass on ${concept}. In this lesson, we break down the fundamental mental models and build your Day 1 proof of work.`
      },
      {
        slideNumber: 2,
        title: `2. Architecture & Mechanics`,
        subtitle: `The Step-by-Step System Flow`,
        bulletPoints: [
          `Pillar 1: Explicit Input & State Contracts.`,
          `Pillar 2: Deterministic execution with error boundaries.`,
          `Pillar 3: Fast feedback loops for continuous validation.`
        ],
        visualDiagram: `[ Client / User ]\n       │\n       ▼\n[ ${concept} Core Engine ] ──► ( Automated Checks )\n       │\n       ▼\n[ Tangible Asset / Deliverable ]`,
        voiceoverScript: `Here is the system architecture. Notice how every step passes through an explicit validation checkpoint before advancing.`
      },
      {
        slideNumber: 3,
        title: `3. Tactical Implementation Blueprint`,
        subtitle: `Actionable Checklist & Starter Template`,
        bulletPoints: [
          `Step 1: Define strict scope and boundary constraints.`,
          `Step 2: Scaffold the minimal working prototype.`,
          `Step 3: Test with real scenarios and measure tangible output.`
        ],
        codeSnippet: `// Implementation Blueprint for ${concept}\nexport function executeCoreStep(input: any) {\n  // 1. Validate constraints\n  if (!input) throw new Error("Invalid state");\n  \n  // 2. Execute high-leverage action\n  const result = processCoreLoop(input);\n  \n  // 3. Return verified deliverable\n  return { success: true, deliverable: result };\n}`,
        voiceoverScript: `Review the starter implementation on the right. You can copy this directly into your scratchpad to build your module.`
      },
      {
        slideNumber: 4,
        title: `4. Traps to Cut & Checkpoint Mission`,
        subtitle: `The Anti-Fluff Cut List & Capstone Task`,
        bulletPoints: [
          `⚠️ Skip bloated boilerplate and low-signal tutorials.`,
          `⚠️ Do not optimize until your basic loop produces verified value.`,
          `🎯 Deliverable: Build and submit your hands-on deliverable to the Analytical Editor.`
        ],
        voiceoverScript: `Finally, keep your cut list in mind. Avoid premature complexity, and test your understanding with the Socratic challenge below.`
      }
    ]
  };

  const activeDialogue = fallbackAudio.dialogue || [];
  const activeSlides = fallbackVideoDeck.slides || [];
  const currentSlide = activeSlides[currentSlideIdx] || activeSlides[0];

  // Stop any active speech synthesis on unmount or tab switch
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeMediaTab]);

  // Audio Speech Synthesis Handler
  const speakAudioLine = (lineIdx: number) => {
    if (!('speechSynthesis' in window) || isAudioMuted) return;

    window.speechSynthesis.cancel();
    const line = activeDialogue[lineIdx];
    if (!line) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = audioPlaybackRate;
    
    // Voice modulation: Higher pitch for Sarah, standard/lower for Leo
    if (line.speaker === 'Sarah') {
      utterance.pitch = 1.15;
    } else {
      utterance.pitch = 0.9;
    }

    utterance.onend = () => {
      if (lineIdx < activeDialogue.length - 1) {
        setActiveAudioLineIdx(lineIdx + 1);
        speakAudioLine(lineIdx + 1);
      } else {
        setIsPlayingAudio(false);
        setActiveAudioLineIdx(0);
      }
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakAudioLine(activeAudioLineIdx);
    }
  };

  const handleSeekAudioLine = (idx: number) => {
    setActiveAudioLineIdx(idx);
    if (isPlayingAudio) {
      speakAudioLine(idx);
    }
  };

  // Video Slide Auto-Play & Speech Handler
  const speakSlideScript = (slideIdx: number) => {
    if (!('speechSynthesis' in window) || isAudioMuted) return;

    window.speechSynthesis.cancel();
    const slide = activeSlides[slideIdx];
    if (!slide) {
      setIsPlayingVideoSlides(false);
      return;
    }

    const textToSpeak = `${slide.title}. ${slide.voiceoverScript}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = audioPlaybackRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (isPlayingVideoSlides && slideIdx < activeSlides.length - 1) {
        setTimeout(() => {
          setCurrentSlideIdx(slideIdx + 1);
          speakSlideScript(slideIdx + 1);
        }, 1200);
      } else {
        setIsPlayingVideoSlides(false);
      }
    };

    utterance.onerror = () => {
      setIsPlayingVideoSlides(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlayVideoSlides = () => {
    if (isPlayingVideoSlides) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingVideoSlides(false);
    } else {
      setIsPlayingVideoSlides(true);
      speakSlideScript(currentSlideIdx);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < activeSlides.length - 1) {
      const nextIdx = currentSlideIdx + 1;
      setCurrentSlideIdx(nextIdx);
      if (isPlayingVideoSlides) {
        speakSlideScript(nextIdx);
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      const prevIdx = currentSlideIdx - 1;
      setCurrentSlideIdx(prevIdx);
      if (isPlayingVideoSlides) {
        speakSlideScript(prevIdx);
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="card p-0 overflow-hidden border-2 border-[var(--tutor)]/40 bg-[var(--surface-1)] shadow-xl rounded-2xl mb-6">
      {/* Top Header: Mode Selector & Duration Info */}
      <div className="p-3 sm:p-4 bg-[var(--surface-2)]/80 border-b border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--tutor)]/15 border border-[var(--tutor)]/30 text-[var(--tutor)] flex items-center justify-center font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--tutor)] font-bold">
              Multimedia Masterclass Player
            </div>
            <h4 className="font-display font-bold text-sm sm:text-base text-[var(--ink)] m-0">
              {concept}
            </h4>
          </div>
        </div>

        {/* Format Toggle: NotebookLM Audio Podcast vs Video Lecture Slides */}
        <div className="flex items-center gap-1.5 bg-[var(--surface-3)] p-1 rounded-xl border border-[var(--hairline)] self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveMediaTab('audio');
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              setIsPlayingVideoSlides(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeMediaTab === 'audio'
                ? 'bg-[var(--tutor)] text-[#04050a] font-bold shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Headphones size={13} />
            <span>2-Host Audio Podcast</span>
          </button>

          <button
            onClick={() => {
              setActiveMediaTab('video');
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              setIsPlayingVideoSlides(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeMediaTab === 'video'
                ? 'bg-[var(--advisor)] text-[#04050a] font-bold shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Tv size={13} />
            <span>Video Masterclass Slides</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: NOTEBOOKLM-STYLE 2-HOST DEEP-DIVE AUDIO PODCAST                   */}
      {/* ========================================================================= */}
      {activeMediaTab === 'audio' && (
        <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
          {/* Podcast Studio Banner & Waveform */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-2))] via-[var(--surface-2)] to-[color-mix(in_srgb,var(--advisor)_10%,var(--surface-2))] border border-[var(--tutor)]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[var(--tutor)] text-[#04050a] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Radio size={10} className={isPlayingAudio ? 'animate-pulse' : ''} />
                  NotebookLM Style
                </span>
                <span className="text-xs font-mono text-[var(--ink-3)]">
                  ⏱️ {fallbackAudio.duration}
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)] m-0">
                {fallbackAudio.title}
              </h3>
              <p className="text-xs text-[var(--ink-2)] m-0">
                Featuring <strong>{fallbackAudio.hosts.host1}</strong> &amp; <strong>{fallbackAudio.hosts.host2}</strong>
              </p>
            </div>

            {/* Visual Animated Audio Waveform */}
            <div className="flex items-center gap-1 h-8 px-4 py-2 rounded-xl bg-[var(--surface-1)]/80 border border-[var(--hairline)]">
              {[18, 28, 14, 32, 24, 10, 30, 20, 26, 12, 22, 16].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full bg-[var(--tutor)] transition-all duration-300 ${
                    isPlayingAudio ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(6, (h * (i % 3 + 1)) % 28 + 6)}px` : `${h / 2}px`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Audio Player Controls Bar */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlayAudio}
                className="w-10 h-10 rounded-xl bg-[var(--tutor)] text-[#04050a] hover:brightness-110 flex items-center justify-center shadow-md transition cursor-pointer font-bold"
                title={isPlayingAudio ? 'Pause audio overview' : 'Play audio overview'}
              >
                {isPlayingAudio ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => handleSeekAudioLine(Math.max(0, activeAudioLineIdx - 1))}
                disabled={activeAudioLineIdx === 0}
                className="p-2 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition disabled:opacity-40 cursor-pointer"
                title="Previous segment"
              >
                <Rewind size={15} />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => handleSeekAudioLine(Math.min(activeDialogue.length - 1, activeAudioLineIdx + 1))}
                disabled={activeAudioLineIdx >= activeDialogue.length - 1}
                className="p-2 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition disabled:opacity-40 cursor-pointer"
                title="Next segment"
              >
                <FastForward size={15} />
              </button>

              {/* Active Time / Segment indicator */}
              <span className="text-xs font-mono text-[var(--ink-2)] ml-2 hidden sm:inline">
                Segment {activeAudioLineIdx + 1} of {activeDialogue.length}
              </span>
            </div>

            {/* Speed & Mute Controls */}
            <div className="flex items-center gap-2">
              {/* Speed toggle */}
              <button
                onClick={() => {
                  const rates = [1, 1.25, 1.5, 2];
                  const nextRate = rates[(rates.indexOf(audioPlaybackRate) + 1) % rates.length];
                  setAudioPlaybackRate(nextRate);
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs font-mono font-bold text-[var(--ink)] transition cursor-pointer"
                title="Change playback speed"
              >
                {audioPlaybackRate}x Speed
              </button>

              {/* Mute toggle */}
              <button
                onClick={() => {
                  if (!isAudioMuted && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }
                  setIsAudioMuted(!isAudioMuted);
                }}
                className="p-2 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition cursor-pointer"
                title={isAudioMuted ? 'Unmute voice audio' : 'Mute voice audio'}
              >
                {isAudioMuted ? <VolumeX size={16} className="text-rose-500" /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Interactive Synced Live Transcript */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)] font-semibold px-1">
              <span>🎙️ Live Synced Transcript (Click any line to play)</span>
              <span>2 AI Co-Hosts</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {activeDialogue.map((line, idx) => {
                const isActive = idx === activeAudioLineIdx;
                const isSarah = line.speaker === 'Sarah';

                return (
                  <div
                    key={line.id || idx}
                    onClick={() => handleSeekAudioLine(idx)}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-[var(--surface-3)] border-[var(--tutor)] shadow-sm'
                        : 'bg-[var(--surface-2)]/60 border-[var(--hairline)] hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {/* Speaker Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isSarah
                          ? 'bg-[var(--tutor)]/20 text-[var(--tutor)] border border-[var(--tutor)]/40'
                          : 'bg-[var(--advisor)]/20 text-[var(--advisor)] border border-[var(--advisor)]/40'
                      }`}
                    >
                      {isSarah ? 'S' : 'L'}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--ink)]">
                          {isSarah ? 'Dr. Sarah (Strategist)' : 'Leo (Builder)'}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--ink-3)]">
                          {line.timestamp || `0:${idx * 20 < 10 ? '0' : ''}${idx * 20}`}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed m-0 font-sans ${
                        isActive ? 'text-[var(--ink)] font-medium' : 'text-[var(--ink-2)]'
                      }`}>
                        "{line.text}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: VISUAL VIDEO MASTERCLASS PRESENTATION SLIDES (COURSERA / UDEMY)    */}
      {/* ========================================================================= */}
      {activeMediaTab === 'video' && (
        <div className="p-4 sm:p-6 space-y-4 animate-fade-in" ref={videoContainerRef}>
          {/* Cinematic Slide Screen (16:9 Aspect Ratio) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#070a12] to-[#0d1320] border-2 border-[var(--advisor)]/40 p-5 sm:p-8 min-h-[340px] flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--advisor)]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--tutor)]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Slide Header */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--advisor)] text-[#04050a] text-[10px] font-mono font-bold uppercase tracking-wider">
                  Slide {currentSlide.slideNumber} of {activeSlides.length}
                </span>
                <span className="text-xs font-mono text-[var(--advisor)] font-bold">
                  {topic} · University Masterclass
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] m-0 pt-2">
                {currentSlide.title}
              </h3>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm font-sans text-[var(--ink-2)] m-0">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Body: Bullets + Diagram / Code */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4 relative z-10 items-center">
              {/* Left Column: Key Bullet Points */}
              <div className="lg:col-span-6 space-y-2.5">
                {(currentSlide.bulletPoints || []).map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[var(--advisor)]/15 text-[var(--advisor)] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Visual ASCII Diagram or Code */}
              <div className="lg:col-span-6">
                {currentSlide.codeSnippet ? (
                  <div className="relative rounded-xl bg-[#04050a] border border-[var(--hairline-strong)] p-3 text-[11px] font-mono text-[var(--ink-2)] overflow-x-auto shadow-inner">
                    <button
                      onClick={() => handleCopyCode(currentSlide.codeSnippet!)}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-[var(--surface-3)] text-xs text-[var(--ink)] hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre className="m-0 leading-relaxed font-mono">
                      <code>{currentSlide.codeSnippet}</code>
                    </pre>
                  </div>
                ) : currentSlide.visualDiagram ? (
                  <div className="rounded-xl bg-[#04050a] border border-[var(--hairline-strong)] p-3 text-[11px] font-mono text-[var(--advisor)] overflow-x-auto shadow-inner">
                    <pre className="m-0 leading-relaxed font-mono whitespace-pre">
                      {currentSlide.visualDiagram}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Slide Voiceover Script / Subtitle Bar */}
            <div className="p-3 rounded-xl bg-[var(--surface-1)]/90 border border-[var(--hairline)] text-xs text-[var(--ink)] leading-relaxed relative z-10 flex items-start gap-2">
              <Mic size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong>Narrator:</strong> "{currentSlide.voiceoverScript}"
              </div>
            </div>
          </div>

          {/* Slide Deck Navigation Controls */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIdx === 0}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous Slide</span>
              </button>

              <button
                onClick={handleTogglePlayVideoSlides}
                className="px-4 py-1.5 rounded-lg bg-[var(--advisor)] text-[#04050a] hover:brightness-110 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isPlayingVideoSlides ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                <span>{isPlayingVideoSlides ? 'Pause Presentation' : 'Auto-Play Lecture'}</span>
              </button>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIdx === activeSlides.length - 1}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Next Slide</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Slide Dots Scrubber */}
            <div className="flex items-center gap-1.5">
              {activeSlides.map((_, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => {
                    setCurrentSlideIdx(sIdx);
                    if (isPlayingVideoSlides) speakSlideScript(sIdx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    sIdx === currentSlideIdx
                      ? 'w-6 bg-[var(--advisor)]'
                      : 'bg-[var(--hairline-strong)] hover:bg-[var(--ink-3)]'
                  }`}
                  title={`Go to Slide ${sIdx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
