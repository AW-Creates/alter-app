import React, { useState, useEffect, useRef } from 'react';
import { useJourney } from '../../context/JourneyContext';
import {
  Sparkles,
  X,
  Target,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Check,
  Send,
  MessageSquare,
  Scissors
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  conductAdvisorIntakeTurnWithAI,
  evaluateDiagnosticAnswersWithAI,
  generateCurriculumWithAI,
  generateSourcesWithAI
} from '../../services/gemini';
import { DiagnosticAssessment } from '../../types/alter';

interface DiagnosticIntakeModalProps {
  isOpen: boolean;
  initialTopic: string;
  onClose: () => void;
  onLaunchJourney: () => void;
}

interface IntakeChatMessage {
  id: string;
  sender: 'advisor' | 'user';
  content: string;
  options?: string[];
  timestamp: string;
}

export const DiagnosticIntakeModal: React.FC<DiagnosticIntakeModalProps> = ({
  isOpen,
  initialTopic,
  onClose,
  onLaunchJourney
}) => {
  const { createJourney, updateActiveJourney, setActiveJourneyId } = useJourney();

  const [topic, setTopic] = useState(initialTopic);
  const [step, setStep] = useState<'chat' | 'evaluating' | 'profile_ready'>('chat');
  const [chatMessages, setChatMessages] = useState<IntakeChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingTurn, setIsLoadingTurn] = useState(false);
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(null);
  const [isBuildingCurriculum, setIsBuildingCurriculum] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialTopic) {
      setTopic(initialTopic);
      startIntakeConversation(initialTopic);
    }
  }, [isOpen, initialTopic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoadingTurn]);

  const startIntakeConversation = async (topicToStart: string) => {
    setStep('chat');
    setChatMessages([]);
    setInputText('');
    setAssessment(null);
    setIsLoadingTurn(true);

    try {
      const firstTurn = await conductAdvisorIntakeTurnWithAI(topicToStart, []);
      setChatMessages([
        {
          id: `msg-0-${Date.now()}`,
          sender: 'advisor',
          content: firstTurn.advisorMessage,
          options: firstTurn.suggestedQuickReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Failed to start intake conversation', err);
    } finally {
      setIsLoadingTurn(false);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const userText = (customMessage || inputText).trim();
    if (!userText || isLoadingTurn) return;

    setInputText('');

    // 1. Add user message
    const userMsg: IntakeChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChat = [...chatMessages, userMsg];
    setChatMessages(updatedChat);
    setIsLoadingTurn(true);

    // If user has answered at least 3 turns, offer to synthesize
    const userTurnsCount = updatedChat.filter((m) => m.sender === 'user').length;

    try {
      const history = updatedChat.map((m) => ({
        sender: m.sender,
        content: m.content
      }));

      const advisorTurn = await conductAdvisorIntakeTurnWithAI(topic, history, userText);

      if (advisorTurn.isInterviewComplete || userTurnsCount >= 3) {
        // Run full evaluation
        await handleRunEvaluation(updatedChat);
        return;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-adv-${Date.now()}`,
          sender: 'advisor',
          content: advisorTurn.advisorMessage,
          options: advisorTurn.suggestedQuickReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Failed to conduct advisor intake turn', err);
    } finally {
      setIsLoadingTurn(false);
    }
  };

  const handleRunEvaluation = async (finalChat: IntakeChatMessage[]) => {
    setStep('evaluating');

    const qaPairs: Array<{ question: string; answer: string; type?: string }> = [];
    for (let i = 0; i < finalChat.length; i += 2) {
      const q = finalChat[i]?.content || 'Question';
      const a = finalChat[i + 1]?.content || 'Answer';
      qaPairs.push({ question: q, answer: a, type: 'Intake Probe' });
    }

    try {
      const result = await evaluateDiagnosticAnswersWithAI(topic, qaPairs);
      setAssessment(result);
      setStep('profile_ready');
    } catch (err) {
      console.error('Diagnostic evaluation failed', err);
      setStep('profile_ready');
    }
  };

  const handleFinalLaunch = async () => {
    if (!assessment) return;
    setIsBuildingCurriculum(true);

    try {
      // 1. Create the Journey locally with diagnostic data
      const newJourney = createJourney({
        title: assessment.refinedTopic || topic,
        topic: assessment.refinedTopic || topic,
        destination: assessment.refinedDestination,
        baseline: assessment.actualBaselineAssessment,
        hoursPerWeek: 8,
        depth: 'practitioner'
      });

      // 2. Generate Adaptive Gap-Filling Curriculum
      const advisorData = await generateCurriculumWithAI(
        assessment.refinedTopic || topic,
        assessment.refinedDestination,
        assessment.actualBaselineAssessment,
        8,
        'practitioner',
        assessment
      );

      // 3. Generate Canonical Sources
      const initialSources = await generateSourcesWithAI(
        assessment.refinedTopic || topic,
        assessment.refinedDestination,
        assessment.actualBaselineAssessment
      );

      // 4. Update the newly created journey
      updateActiveJourney((prev) => ({
        ...prev,
        diagnosticAssessment: assessment,
        advisorData: {
          ...advisorData,
          chatHistory: [
            {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              persona: 'advisor',
              content: `🎯 **Diagnostic Calibration Complete**: Based on our friendly intake chat, I have personalized your curriculum to focus on what matters most (*${assessment.criticalGapsToFill.join(', ')}*).\n\n${assessment.whyCustomizedExplanation || ''}\n\nLet's get started on Phase 1!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        },
        librarianData: {
          ...prev.librarianData,
          sources: initialSources
        }
      }));

      setActiveJourneyId(newJourney.id);
      onClose();
      onLaunchJourney();
    } catch (err) {
      console.error('Failed to launch calibrated journey', err);
    } finally {
      setIsBuildingCurriculum(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[var(--surface-1)] border-2 border-[var(--advisor)]/40 rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--surface-2)]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_18%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-[var(--advisor)] flex items-center justify-center flex-shrink-0 shadow-xs font-bold font-mono text-base">
              🎓
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--advisor)] uppercase font-bold tracking-wider">
                1-ON-1 ADVISOR INTAKE CONSULTATION
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--ink)] m-0">
                Personalizing: {topic}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* STEP 1: CONVERSATIONAL CHAT */}
          {step === 'chat' && (
            <div className="space-y-4 flex flex-col min-h-[350px]">
              {/* Chat Stream */}
              <div className="space-y-4 flex-1">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2 animate-fade-in">
                    {msg.sender === 'advisor' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[var(--advisor)]/20 text-[var(--advisor)] flex items-center justify-center text-[10px] font-bold font-mono">
                            A
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[var(--advisor)] uppercase tracking-wider">
                            Academic Advisor
                          </span>
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--ink)] leading-relaxed space-y-2 shadow-xs">
                          <MarkdownRenderer content={msg.content} />
                        </div>

                        {/* Quick Reply Pills */}
                        {msg.options && msg.options.length > 0 && !isLoadingTurn && (
                          <div className="pt-1.5 space-y-1.5 pl-2">
                            <div className="text-[11px] font-mono text-[var(--ink-3)]">
                              👉 Quick-select a response or speak below:
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {msg.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSendMessage(opt)}
                                  className="p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-1)] hover:border-[var(--advisor)] hover:text-[var(--advisor)] text-left text-xs transition flex items-start gap-2 text-[var(--ink-2)]"
                                >
                                  <span className="font-mono text-[10px] opacity-50 mt-0.5">💬</span>
                                  <span className="flex-1 font-medium">{opt}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* User Message Bubble */
                      <div className="flex flex-col items-end space-y-1 pl-8">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            {msg.timestamp}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[var(--ink-2)]">
                            You
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[var(--advisor)] text-[#04050a] font-medium text-xs max-w-[90%] shadow-xs leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoadingTurn && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--ink-2)] font-mono animate-pulse">
                    <Loader2 size={14} className="animate-spin text-[var(--advisor)]" />
                    <span>Advisor is listening &amp; personalizing your next question...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* STEP 2: EVALUATION SYNTHESIS */}
          {step === 'evaluating' && (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-[var(--advisor)] mx-auto" />
              <p className="font-bold text-base text-[var(--ink)] m-0">
                Personalizing Your Custom 3-Phase Roadmap...
              </p>
              <p className="text-xs text-[var(--ink-3)] max-w-md mx-auto leading-relaxed">
                Analyzing what you already know, adding starter courses to bridge your knowledge gaps, and cutting out low-value distractions.
              </p>
            </div>
          )}

          {/* STEP 3: CALIBRATED PROFILE & ROADMAP SUMMARY */}
          {step === 'profile_ready' && assessment && (
            <div className="space-y-5 animate-fade-in">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_12%,var(--surface-2))] border-2 border-[var(--advisor)] space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[var(--advisor)]" />
                    <span className="font-bold text-sm text-[var(--ink)]">
                      Your Customized Learning Profile &amp; Roadmap
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--advisor)] text-[#04050a]">
                    Assessed Score: {assessment.diagnosticScore || 80}/100
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[var(--ink)]">
                  <p className="m-0">
                    <strong>Target Destination:</strong> {assessment.refinedDestination}
                  </p>
                  <p className="m-0 text-[var(--ink-2)]">
                    <strong>Starting Baseline:</strong> {assessment.actualBaselineAssessment}
                  </p>
                </div>
              </div>

              {/* WHY WE CUSTOMIZED YOUR ROADMAP (The Rationale) */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2.5">
                <div className="font-mono text-[11px] uppercase font-bold text-[var(--advisor)] flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Why We Customized Your Roadmap (Added vs. Subtracted):</span>
                </div>
                <p className="text-xs text-[var(--ink)] leading-relaxed m-0 font-sans">
                  {assessment.whyCustomizedExplanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Added Modules */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <div className="font-mono text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Courses Added to Fill Gaps:</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                      {assessment.addedCoursesReason || assessment.criticalGapsToFill.join('; ')}
                    </p>
                  </div>

                  {/* Cut Fluff */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="font-mono text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1">
                      <Scissors size={12} />
                      <span>Fluff Cut to Save You Time:</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-2)] m-0 leading-relaxed font-sans">
                      {assessment.subtractedCoursesReason || assessment.recommendedCutList.join('; ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-PHASE TIMELINE PREVIEW */}
              {assessment.phasesSummary && assessment.phasesSummary.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-[var(--ink-3)]">
                    Your Complete 3-Phase Roadmap (What You'll Actually Build):
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {assessment.phasesSummary.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--ink)] font-sans">
                            Phase {p.phaseNumber}: {p.title}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--advisor)] font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)]">
                            {p.duration}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[var(--ink-2)] m-0">
                          🎯 <strong>What You Build:</strong> {p.tangibleAsset}
                        </p>
                        {p.whyThisOrder && (
                          <p className="text-[10.5px] text-[var(--ink-3)] font-mono m-0 pt-0.5">
                            💡 <em>Why this order? {p.whyThisOrder}</em>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Launch Action */}
              <div className="pt-3 flex items-center justify-between border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={() => startIntakeConversation(topic)}
                  className="ghost-btn"
                >
                  <RotateCcw size={13} />
                  <span>Re-do Chat Consultation</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalLaunch}
                  disabled={isBuildingCurriculum}
                  className="accent-btn"
                  style={{ padding: '10px 22px', borderRadius: '12px', fontSize: '13px' }}
                >
                  {isBuildingCurriculum ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Synthesizing Your Custom Academy...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Enter Altor Academy with This Roadmap →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Chat Input Footer (Visible only in Chat step) */}
        {step === 'chat' && (
          <div className="p-4 border-t border-[var(--hairline)] bg-[var(--surface-2)]/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[var(--ink-3)] font-semibold">
                💬 Reply to your Academic Advisor:
              </label>
              <VoiceInputButton
                onTranscript={(t) =>
                  setInputText((prev) => (prev ? `${prev} ${t}` : t))
                }
              />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <textarea
                placeholder="Type or click the microphone to speak your answer to your Advisor..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                className="flex-1 bg-[var(--surface-1)] border border-[var(--hairline)] focus:border-[var(--advisor)] text-[var(--ink)] text-xs rounded-xl p-2.5 outline-none resize-none font-sans leading-relaxed"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoadingTurn}
                className="px-4 py-2 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm cursor-pointer self-end h-[58px]"
              >
                {isLoadingTurn ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    <span className="hidden sm:inline">Send →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
