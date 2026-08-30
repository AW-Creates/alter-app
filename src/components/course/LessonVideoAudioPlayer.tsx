import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  GraduationCap,
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
  MicOff,
  Send,
  HelpCircle,
  Award,
  Zap,
  Layers,
  MessageSquare,
  Flame,
  AlertTriangle
} from 'lucide-react';
import {
  DeepDiveAudioOverview,
  DirectTutorAudioLesson,
  LessonVideoDeck,
  LessonSlide,
  InteractiveLesson,
  LiveClassroomTurn
} from '../../types/alter';
import {
  NaturalSpeechSynthesizer,
  VOICE_PRESETS,
  VoicePreset
} from '../../services/voiceEngine';
import { converseSocraticLessonWithAI, evaluateLessonResponseWithAI } from '../../services/gemini';

interface LessonVideoAudioPlayerProps {
  concept: string;
  topic: string;
  lessonTitle?: string;
  plainEnglishAnalogy?: string;
  coreExplanation?: string;
  socraticChallenge?: string;
  audioOverview?: DeepDiveAudioOverview;
  directLectureAudio?: DirectTutorAudioLesson;
  videoDeck?: LessonVideoDeck;
  onMasteryEarned?: () => void;
}

export const LessonVideoAudioPlayer: React.FC<LessonVideoAudioPlayerProps> = ({
  concept,
  topic,
  lessonTitle,
  plainEnglishAnalogy,
  coreExplanation,
  socraticChallenge,
  audioOverview,
  directLectureAudio,
  videoDeck,
  onMasteryEarned
}) => {
  // Navigation Tabs: 1-on-1 Masterclass Lecture vs Live Voice Classroom vs Socratic Sparring
  const [activeTab, setActiveTab] = useState<'lecture' | 'live_classroom' | 'sparring'>('lecture');

  // Voice Engine State
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('athena');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentSpokenChunk, setCurrentSpokenChunk] = useState<string>('');

  // 1-on-1 Lecture Slide State
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Live Conversational Classroom (Gemini Live Audio Experience) State
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const [liveChatInput, setLiveChatInput] = useState<string>('');
  const [isTutorThinking, setIsTutorThinking] = useState<boolean>(false);
  const [classroomTurns, setClassroomTurns] = useState<LiveClassroomTurn[]>([]);
  const [activeCheckInQuestion, setActiveCheckInQuestion] = useState<string>('');

  // Socratic Sparring State
  const [sparringInput, setSparringInput] = useState<string>('');
  const [isEvaluatingSparring, setIsEvaluatingSparring] = useState<boolean>(false);
  const [sparringResult, setSparringResult] = useState<{
    mastered: boolean;
    score: number;
    strengths: string;
    nuanceOrGap: string;
    coachingVerdict: string;
  } | null>(null);

  // Canvas & Speech Synthesizer Refs
  const synthRef = useRef<NaturalSpeechSynthesizer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Synthesizer
  useEffect(() => {
    synthRef.current = new NaturalSpeechSynthesizer(selectedVoiceId);
    synthRef.current.setPlaybackRate(playbackSpeed);

    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Update voice preset when changed
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setPreset(selectedVoiceId);
    }
  }, [selectedVoiceId]);

  // Update playback speed
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  // Stop speech when switching main tabs
  useEffect(() => {
    synthRef.current?.stop();
    setIsPlayingAudio(false);
  }, [activeTab]);

  // Safe Fallback Slide Deck (Direct 1-on-1 Masterclass from Tutor to Learner)
  const fallbackVideoDeck: LessonVideoDeck = videoDeck || {
    title: `Masterclass: ${concept}`,
    totalSlides: 4,
    slides: [
      {
        slideNumber: 1,
        title: `1. The Big Picture & Intuition`,
        subtitle: `First-Principles Intuition for ${concept}`,
        bulletPoints: [
          `Why conventional tutorials overcomplicate ${concept}.`,
          `The core mental model: ${plainEnglishAnalogy || `Decouple state observation from side-effect execution.`}`,
          `How world-class practitioners apply this in production.`
        ],
        visualDiagram: `┌──────────────────────────────────────────────┐\n│         CORE FOUNDATION: ${concept.toUpperCase()}          │\n├──────────────────────────────────────────────┤\n│  1. Input / Goal  ──►  2. State Loop  ──►  3. Proof of Work  │\n└──────────────────────────────────────────────┘`,
        voiceoverScript: `Welcome to your 1-on-1 masterclass on ${concept}. Before we write any code or templates, understand the core intuition: ${plainEnglishAnalogy || 'focus on the primary feedback loop'}. When you master this, building systems becomes second nature.`
      },
      {
        slideNumber: 2,
        title: `2. Architecture & Mechanics`,
        subtitle: `Step-by-Step System Flow`,
        bulletPoints: [
          `Pillar 1: Explicit Input & State Contracts.`,
          `Pillar 2: Deterministic execution with error recovery boundaries.`,
          `Pillar 3: Fast feedback loops for continuous validation.`
        ],
        visualDiagram: `[ Client / User Goal ]\n       │\n       ▼\n[ ${concept} Core Engine ] ──► ( Automated Verification )\n       │\n       ▼\n[ Verified Tangible Deliverable ]`,
        voiceoverScript: `Here is the underlying architecture. Notice how every state transition passes through explicit validation checkpoints before advancing.`
      },
      {
        slideNumber: 3,
        title: `3. Tactical Implementation Blueprint`,
        subtitle: `Executable Code Template & Starter Scaffold`,
        bulletPoints: [
          `Step 1: Enforce strict schema constraints.`,
          `Step 2: Catch exceptions and convert them into observation state.`,
          `Step 3: Enforce hard iteration ceilings to prevent runaway loops.`
        ],
        codeSnippet: `// Production Implementation Blueprint for ${concept}\nexport async function executeCoreLoop(input: any) {\n  // 1. Validate boundary constraints\n  if (!input) throw new Error("Invalid state");\n  \n  // 2. Execute high-leverage action\n  const result = await processStep(input);\n  \n  // 3. Return verified deliverable\n  return { success: true, deliverable: result, timestamp: Date.now() };\n}`,
        voiceoverScript: `Take a look at the starter blueprint on the right. You can copy this directly into your scratchpad to build your prototype.`
      },
      {
        slideNumber: 4,
        title: `4. Traps to Cut & Capstone Challenge`,
        subtitle: `The Anti-Fluff Cut List & Socratic Check`,
        bulletPoints: [
          `⚠️ Skip bloated frameworks that hide errors behind magic abstractions.`,
          `⚠️ Never optimize until your basic loop produces verified value.`,
          `🎯 Capstone: Solve the Socratic Sparring dilemma to earn verified mastery.`
        ],
        voiceoverScript: `Finally, keep your cut list in mind: skip superficial tutorial fluff, master the core loop, and let's test your understanding in the live classroom.`
      }
    ]
  };

  const activeSlides = fallbackVideoDeck.slides || [];
  const currentSlide = activeSlides[currentSlideIdx] || activeSlides[0];

  // --------------------------------------------------------------------------
  // Web Audio Oscilloscope Waveform Animation
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const numBars = 28;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        const amp = isPlayingAudio || isLiveMicActive
          ? Math.sin(phase + i * 0.35) * 0.45 + 0.55
          : 0.12;
        const barHeight = Math.max(4, amp * height * (isPlayingAudio || isLiveMicActive ? 0.8 : 0.2));
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isLiveMicActive) {
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(1, '#fb7185');
        } else {
          grad.addColorStop(0, '#5fdb9e');
          grad.addColorStop(1, '#a855f7');
        }

        ctx.fillStyle = isPlayingAudio || isLiveMicActive ? grad : 'rgba(150, 150, 150, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2.5);
        ctx.fill();
      }

      phase += 0.09 * playbackSpeed;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingAudio, isLiveMicActive, playbackSpeed]);

  // --------------------------------------------------------------------------
  // Live Speech Recognition (Microphone for Live Classroom)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const spokenText = lastResult[0].transcript.trim();
          if (spokenText) {
            handleStudentVoiceMessage(spokenText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsLiveMicActive(false);
        }
      };

      recognition.onend = () => {
        if (isLiveMicActive) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isLiveMicActive]);

  const toggleLiveMic = () => {
    if (!recognitionRef.current) {
      alert('Live speech recognition is supported in Chrome, Edge, and Safari.');
      return;
    }

    if (isLiveMicActive) {
      recognitionRef.current.stop();
      setIsLiveMicActive(false);
    } else {
      // If tutor is currently speaking, stop it so user can talk
      synthRef.current?.stop();
      setIsPlayingAudio(false);
      try {
        recognitionRef.current.start();
        setIsLiveMicActive(true);
      } catch (err) {
        console.warn('Recognition start failed', err);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Slide Lecture Voiceover Handler
  // --------------------------------------------------------------------------
  const handlePlaySlideVoiceover = (slideIdx: number) => {
    if (!synthRef.current || isMuted) return;

    const slide = activeSlides[slideIdx];
    if (!slide) {
      setIsPlayingAudio(false);
      return;
    }

    const scriptToSpeak = `${slide.title}. ${slide.voiceoverScript}`;
    setIsPlayingAudio(true);

    synthRef.current.speakText(scriptToSpeak, {
      onChunk: (chunk) => setCurrentSpokenChunk(chunk),
      onEnd: () => {
        if (slideIdx < activeSlides.length - 1) {
          setTimeout(() => {
            setCurrentSlideIdx(slideIdx + 1);
            handlePlaySlideVoiceover(slideIdx + 1);
          }, 1000);
        } else {
          setIsPlayingAudio(false);
          setCurrentSpokenChunk('');
        }
      },
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleTogglePlayLecture = () => {
    if (isPlayingAudio) {
      synthRef.current?.stop();
      setIsPlayingAudio(false);
    } else {
      handlePlaySlideVoiceover(currentSlideIdx);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < activeSlides.length - 1) {
      const next = currentSlideIdx + 1;
      setCurrentSlideIdx(next);
      if (isPlayingAudio) handlePlaySlideVoiceover(next);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      const prev = currentSlideIdx - 1;
      setCurrentSlideIdx(prev);
      if (isPlayingAudio) handlePlaySlideVoiceover(prev);
    }
  };

  // --------------------------------------------------------------------------
  // Live Conversational Classroom Logic (Hands-free Voice / Text Q&A)
  // --------------------------------------------------------------------------
  const handleStudentVoiceMessage = async (text: string) => {
    if (!text.trim() || isTutorThinking) return;

    // Interrupt any ongoing speech
    synthRef.current?.stop();
    setIsPlayingAudio(false);

    // 1. Add student turn
    const studentTurn: LiveClassroomTurn = {
      id: `turn-student-${Date.now()}`,
      speaker: 'student',
      content: text.trim(),
      stageName: 'Live Discussion',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...classroomTurns, studentTurn];
    setClassroomTurns(updatedHistory);
    setIsTutorThinking(true);

    try {
      const convHistory = updatedHistory.map((t) => ({
        speaker: t.speaker,
        content: t.content
      }));

      const reply = await converseSocraticLessonWithAI(
        topic,
        concept,
        'Live 1-on-1 Socratic Classroom Discussion',
        convHistory,
        text.trim()
      );

      const tutorTurn: LiveClassroomTurn = {
        id: `turn-tutor-${Date.now()}`,
        speaker: 'tutor',
        content: reply.tutorSpeech,
        stageName: reply.stageName || 'Direct Instruction & Socratic Follow-up',
        tutorFeedback: reply.tutorFeedbackOnStudent,
        checkInQuestion: reply.checkInQuestion,
        isCompleted: reply.isConceptMastered,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setClassroomTurns((prev) => [...prev, tutorTurn]);
      if (reply.checkInQuestion) {
        setActiveCheckInQuestion(reply.checkInQuestion);
      }

      // Speak Tutor's response with natural voice
      if (!isMuted && synthRef.current) {
        setIsPlayingAudio(true);
        synthRef.current.speakText(reply.tutorSpeech, {
          onChunk: (chunk) => setCurrentSpokenChunk(chunk),
          onEnd: () => {
            setIsPlayingAudio(false);
            setCurrentSpokenChunk('');
          }
        });
      }
    } catch (err) {
      console.error('Live classroom error', err);
    } finally {
      setIsTutorThinking(false);
    }
  };

  const handleSendTextQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveChatInput.trim()) return;
    const q = liveChatInput.trim();
    setLiveChatInput('');
    handleStudentVoiceMessage(q);
  };

  // --------------------------------------------------------------------------
  // Socratic Sparring Evaluation
  // --------------------------------------------------------------------------
  const handleEvaluateSparringChallenge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const challengeText = socraticChallenge || `How does ${concept} prevent cascading failures in production?`;
    if (!sparringInput.trim() || isEvaluatingSparring) return;

    setIsEvaluatingSparring(true);
    try {
      const result = await evaluateLessonResponseWithAI(
        concept,
        challengeText,
        sparringInput.trim()
      );

      setSparringResult(result);

      // Speak feedback
      if (!isMuted && synthRef.current) {
        const spokenVerdict = `${result.coachingVerdict}. ${result.strengths}. ${result.nuanceOrGap}`;
        synthRef.current.speakText(spokenVerdict);
      }

      if (result.mastered) {
        onMasteryEarned?.();
      }
    } catch (err) {
      console.error('Sparring evaluation error', err);
    } finally {
      setIsEvaluatingSparring(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="card p-0 overflow-hidden border-2 border-[var(--tutor)]/40 bg-[var(--surface-1)] shadow-2xl rounded-2xl mb-6">
      {/* Top Header: 1-on-1 Mode Switcher, Voice Profile & Waveform */}
      <div className="p-3 sm:p-4 bg-[var(--surface-2)]/80 border-b border-[var(--hairline)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Concept Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--tutor)]/15 border border-[var(--tutor)]/30 text-[var(--tutor)] flex items-center justify-center font-bold shadow-xs">
            <GraduationCap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tutor)] font-bold bg-[var(--tutor)]/10 px-2 py-0.5 rounded border border-[var(--tutor)]/20">
                1-on-1 Interactive Socratic Studio
              </span>
            </div>
            <h4 className="font-display font-bold text-sm sm:text-base text-[var(--ink)] m-0 mt-0.5">
              {concept}
            </h4>
          </div>
        </div>

        {/* Center & Right: Mode Tabs + Voice Persona Selector */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-[var(--surface-3)] p-1 rounded-xl border border-[var(--hairline)]">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lecture'
                  ? 'bg-[var(--tutor)] text-[#04050a] font-bold shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Tv size={13} />
              <span>1-on-1 Masterclass Lecture</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('live_classroom');
                if (classroomTurns.length === 0) {
                  // Seed initial welcome turn from Professor
                  setClassroomTurns([
                    {
                      id: `turn-0-${Date.now()}`,
                      speaker: 'tutor',
                      content: `Hello! I am your dedicated tutor for **${concept}**. You can ask me questions anytime via live voice or text, or ask me to explain any part of this topic with practical examples. What would you like to explore first?`,
                      stageName: 'Welcome & Direct Q&A',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'live_classroom'
                  ? 'bg-[var(--advisor)] text-[#04050a] font-bold shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Mic size={13} />
              <span>🎙️ Live Voice Classroom (Gemini Live)</span>
            </button>

            <button
              onClick={() => setActiveTab('sparring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sparring'
                  ? 'bg-amber-500 text-[#04050a] font-bold shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Award size={13} />
              <span>🥊 Socratic Sparring Check</span>
            </button>
          </div>

          {/* Voice Persona Selector */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-3)] px-2.5 py-1 rounded-xl border border-[var(--hairline)] text-xs font-mono">
            <span className="text-[var(--ink-3)] hidden lg:inline">Voice:</span>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="bg-transparent text-[var(--ink)] border-none outline-none font-bold cursor-pointer text-xs"
            >
              {VOICE_PRESETS.map((vp) => (
                <option key={vp.id} value={vp.id} className="bg-[var(--surface-2)] text-[var(--ink)]">
                  {vp.name} ({vp.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: 1-ON-1 DIRECT MASTERCLASS LECTURE (TUTOR TO LEARNER)               */}
      {/* ========================================================================= */}
      {activeTab === 'lecture' && (
        <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
          {/* Cinematic Presentation Canvas */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#060911] via-[#0a0f1d] to-[#04060c] border-2 border-[var(--tutor)]/40 p-5 sm:p-8 min-h-[360px] flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--tutor)]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--advisor)]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Slide Header */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--tutor)] text-[#04050a] text-[10px] font-mono font-bold uppercase tracking-wider">
                  Slide {currentSlide.slideNumber} of {activeSlides.length}
                </span>
                <span className="text-xs font-mono text-[var(--tutor)] font-bold">
                  Direct 1-on-1 Collegiate Masterclass
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

            {/* Slide Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4 relative z-10 items-center">
              {/* Left Column: Key Principles */}
              <div className="lg:col-span-6 space-y-2.5">
                {(currentSlide.bulletPoints || []).map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[var(--tutor)]/20 text-[var(--tutor)] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Visual Diagram / Code */}
              <div className="lg:col-span-6">
                {currentSlide.codeSnippet ? (
                  <div className="relative rounded-xl bg-[#030509] border border-[var(--hairline-strong)] p-3 text-[11px] font-mono text-[var(--ink-2)] overflow-x-auto shadow-inner">
                    <button
                      onClick={() => handleCopyCode(currentSlide.codeSnippet!)}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-[var(--surface-3)] text-xs text-[var(--ink)] hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre className="m-0 leading-relaxed font-mono text-cyan-300">
                      <code>{currentSlide.codeSnippet}</code>
                    </pre>
                  </div>
                ) : currentSlide.visualDiagram ? (
                  <div className="rounded-xl bg-[#030509] border border-[var(--hairline-strong)] p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner">
                    <pre className="m-0 leading-relaxed font-mono whitespace-pre">
                      {currentSlide.visualDiagram}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Spoken Narration Transcript Bar with Audio Waveform */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)]/90 border border-[var(--hairline)] text-xs text-[var(--ink)] leading-relaxed relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <Mic size={15} className={`text-[var(--tutor)] flex-shrink-0 mt-0.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                <div className="truncate">
                  <strong className="text-[var(--tutor)]">Tutor Lecture:</strong> "{currentSpokenChunk || currentSlide.voiceoverScript}"
                </div>
              </div>

              {/* Audio Waveform */}
              <canvas ref={canvasRef} width={120} height={24} className="h-6 w-28 flex-shrink-0" />
            </div>
          </div>

          {/* Masterclass Controls */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIdx === 0}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev Slide</span>
              </button>

              <button
                onClick={handleTogglePlayLecture}
                className="px-4 py-1.5 rounded-lg bg-[var(--tutor)] text-[#04050a] hover:brightness-110 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isPlayingAudio ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                <span>{isPlayingAudio ? 'Pause Lecture' : 'Play Spoken Lecture'}</span>
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

            {/* Speed & Mute */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
                  const nextRate = rates[(rates.indexOf(playbackSpeed) + 1) % rates.length];
                  setPlaybackSpeed(nextRate);
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-[var(--hairline)] text-xs font-mono font-bold text-[var(--ink)] transition cursor-pointer"
              >
                {playbackSpeed}x Speed
              </button>

              <button
                onClick={() => {
                  if (!isMuted) synthRef.current?.stop();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition cursor-pointer"
              >
                {isMuted ? <VolumeX size={16} className="text-rose-500" /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: LIVE VOICE CONVERSATIONAL CLASSROOM (GEMINI LIVE AUDIO MODE)      */}
      {/* ========================================================================= */}
      {activeTab === 'live_classroom' && (
        <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
          {/* Live Audio Room HUD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--advisor)_14%,var(--surface-2))] via-[var(--surface-2)] to-[color-mix(in_srgb,var(--tutor)_12%,var(--surface-2))] border-2 border-[var(--advisor)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLiveMicActive
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[var(--advisor)] text-[#04050a]'
                }`}>
                  <Radio size={11} />
                  {isLiveMicActive ? 'Live Voice Active (Speak Freely)' : 'Gemini Live Voice Mode'}
                </span>
                <span className="text-xs font-mono text-[var(--ink-3)]">
                  {VOICE_PRESETS.find((v) => v.id === selectedVoiceId)?.name} is listening
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--ink)] m-0">
                1-on-1 Interactive Socratic Classroom
              </h3>
              <p className="text-xs text-[var(--ink-2)] m-0 max-w-xl">
                Speak directly with your tutor or type below. Ask for real-world code examples, clarify edge cases, or request a diagnostic check-in.
              </p>
            </div>

            {/* Hands-free Microphone Button + Oscilloscope */}
            <div className="flex items-center gap-3">
              <canvas ref={canvasRef} width={140} height={36} className="h-9 w-32 hidden sm:block" />

              <button
                onClick={toggleLiveMic}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isLiveMicActive
                    ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.5)] animate-pulse'
                    : 'bg-[var(--advisor)] text-[#04050a] hover:brightness-110'
                }`}
              >
                {isLiveMicActive ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isLiveMicActive ? 'Mute Live Mic' : 'Start Live Voice'}</span>
              </button>
            </div>
          </div>

          {/* Conversational Stream */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {classroomTurns.map((turn) => {
              const isTutor = turn.speaker === 'tutor';

              return (
                <div
                  key={turn.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isTutor
                      ? 'bg-[var(--surface-2)]/80 border-[var(--tutor)]/30'
                      : 'bg-[var(--surface-3)]/90 border-[var(--hairline-strong)] ml-6'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isTutor
                        ? 'bg-[var(--tutor)]/20 text-[var(--tutor)] border border-[var(--tutor)]/40'
                        : 'bg-[var(--advisor)]/20 text-[var(--advisor)] border border-[var(--advisor)]/40'
                    }`}
                  >
                    {isTutor ? 'T' : 'You'}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)]">
                        {isTutor ? VOICE_PRESETS.find((v) => v.id === selectedVoiceId)?.name || 'Master Tutor' : 'You (Student)'}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ink-3)]">
                        {turn.timestamp}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink)] font-sans m-0">
                      {turn.content}
                    </p>

                    {turn.checkInQuestion && (
                      <div className="p-3 rounded-lg bg-[var(--tutor)]/10 border border-[var(--tutor)]/30 mt-2 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase font-bold text-[var(--tutor)] flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>Tutor's Socratic Follow-Up Probe:</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--ink)] m-0">
                          {turn.checkInQuestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTutorThinking && (
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--tutor)]/30 flex items-center gap-2.5 text-xs text-[var(--tutor)]">
                <Sparkles size={14} className="animate-spin" />
                <span>Tutor is formulating response &amp; synthesizing audio...</span>
              </div>
            )}
          </div>

          {/* Quick Question Starters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-mono text-[var(--ink-3)] whitespace-nowrap">Quick Probes:</span>
            {[
              `"Can you explain ${concept} with a real-world example?"`,
              `"What is the single biggest failure mode to avoid?"`,
              `"Give me a concrete code template for this"`,
              `"Quiz me on this concept right now"`
            ].map((starter, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleStudentVoiceMessage(starter.replace(/"/g, ''))}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs text-[var(--ink-2)] hover:text-[var(--ink)] whitespace-nowrap transition cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>

          {/* Live Text Input Form */}
          <form onSubmit={handleSendTextQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder={`Ask your tutor anything about ${concept}...`}
              value={liveChatInput}
              onChange={(e) => setLiveChatInput(e.target.value)}
              className="flex-1 bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-xs text-[var(--ink)] rounded-xl px-3.5 py-2.5 outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!liveChatInput.trim() || isTutorThinking}
              className="px-4 py-2.5 rounded-xl bg-[var(--advisor)] text-[#04050a] hover:brightness-110 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              <Send size={13} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: SOCRATIC SPARRING & MASTERY VERIFICATION                          */}
      {/* ========================================================================= */}
      {activeTab === 'sparring' && (
        <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
          {/* Socratic Challenge Scenario Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[var(--surface-2)] to-amber-500/5 border-2 border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-500 font-bold">
              <Zap size={14} className="animate-pulse" />
              <span>Applied Socratic Dilemma Challenge:</span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)] m-0 leading-relaxed">
              "{socraticChallenge || `Imagine you deploy ${concept} in production and the downstream service returns HTTP 429 Rate Limits. How would you structure your loop to backoff and self-heal without exceeding your step budget?`}"
            </h3>
            <p className="text-xs text-[var(--ink-2)] m-0">
              Speak or type your solution below. The Tutor will grade your first-principles reasoning and unlock verified mastery.
            </p>
          </div>

          {/* Student Answer Input with Live Voice Dictation */}
          <form onSubmit={handleEvaluateSparringChallenge} className="space-y-3">
            <div className="relative">
              <textarea
                rows={4}
                value={sparringInput}
                onChange={(e) => setSparringInput(e.target.value)}
                placeholder="Explain your approach from first principles: What invariants do you check, what error recovery step occurs, and how do you prevent cascading failures?"
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-amber-500 text-xs sm:text-sm text-[var(--ink)] rounded-xl p-3.5 outline-none font-sans leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleLiveMic}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isLiveMicActive
                    ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse'
                    : 'bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink-2)] hover:text-[var(--ink)]'
                }`}
              >
                <Mic size={13} />
                <span>{isLiveMicActive ? 'Recording Voice...' : 'Dictate with Voice'}</span>
              </button>

              <button
                type="submit"
                disabled={!sparringInput.trim() || isEvaluatingSparring}
                className="px-5 py-2 rounded-xl bg-amber-500 text-[#04050a] hover:brightness-110 font-bold text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-40 cursor-pointer"
              >
                {isEvaluatingSparring ? <Sparkles size={13} className="animate-spin" /> : <Award size={13} />}
                <span>{isEvaluatingSparring ? 'Evaluating Response...' : 'Submit to Tutor for Mastery Grading →'}</span>
              </button>
            </div>
          </form>

          {/* Sparring Evaluation Feedback Card */}
          {sparringResult && (
            <div
              className={`p-5 rounded-2xl border-2 space-y-3 animate-fade-in ${
                sparringResult.mastered
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-amber-500/10 border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sparringResult.mastered ? (
                    <Check size={18} className="text-emerald-400 font-bold" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-400" />
                  )}
                  <span className="font-display font-bold text-base text-[var(--ink)]">
                    {sparringResult.mastered ? 'Verified Concept Mastery Unlocked!' : 'Good Effort — Refinement Recommended'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)]">
                  Score: {sparringResult.score}/100
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <strong className="text-[var(--ink)]">Tutor's Verdict:</strong>{' '}
                  <span className="text-[var(--ink-2)]">{sparringResult.coachingVerdict}</span>
                </div>
                <div>
                  <strong className="text-emerald-400">Strengths:</strong>{' '}
                  <span className="text-[var(--ink-2)]">{sparringResult.strengths}</span>
                </div>
                <div>
                  <strong className="text-amber-400">Nuance / Gaps:</strong>{' '}
                  <span className="text-[var(--ink-2)]">{sparringResult.nuanceOrGap}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
