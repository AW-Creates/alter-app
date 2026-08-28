import { SYSTEM_PROMPTS, GENERATOR_PROMPTS } from './prompts';
import {
  AdvisorData,
  CuratedSource,
  DiagnosticQuiz,
  DiagnosticQuestion,
  DiagnosticAssessment,
  DomainCollision,
  EditorReview,
  FeynmanSession,
  LearningJourney,
  AlterPersona,
  InteractiveLesson,
  SourceDeepDive,
  StuckTriageResult
} from '../types/alter';
import { queryGroundedAI, getStoredPerplexityKey } from './grounding';
import { getStoredOpenRouterKey, callOpenRouter, getRecommendedModelForPersona } from './openrouter';

const STORAGE_API_KEY = 'alter_gemini_api_key';

export const getStoredApiKey = (): string => {
  return localStorage.getItem(STORAGE_API_KEY) || '';
};

export const setStoredApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_API_KEY);
  }
};

const extractJsonFromResponse = <T>(text: string): T => {
  try {
    // Look for ```json ... ``` or first [ or {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf('}') + 1;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf(']') + 1;
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const extracted = text.substring(startIdx, endIdx);
      return JSON.parse(extracted) as T;
    }
    throw new Error('Failed to parse AI response into structured data.');
  }
};

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  model = 'gemini-2.0-flash',
  enableSearchGrounding = false
): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2500
    }
  };

  if (enableSearchGrounding) {
    payload.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) {
    throw new Error('Empty response from Gemini');
  }
  return candidate;
}

// ----------------------------------------------------
// Persona Chat Stream / Call
// ----------------------------------------------------
export async function chatWithPersona(
  persona: AlterPersona,
  journey: LearningJourney,
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; text: string }[]
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[persona](journey);
  const apiKey = getStoredApiKey();
  const openRouterKey = getStoredOpenRouterKey();

  // 1. If OpenRouter Key is configured, route to best specialized model (Claude 3.5 / DeepSeek R1)
  if (openRouterKey && !apiKey) {
    try {
      const model = getRecommendedModelForPersona(persona);
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatHistory.map((m) => ({
          role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.text
        })),
        { role: 'user' as const, content: userMessage }
      ];
      return await callOpenRouter(messages, model, persona === 'roommate' ? 0.9 : 0.6);
    } catch (err) {
      console.warn('OpenRouter chat routing failed, falling back to simulated', err);
    }
  }

  if (!apiKey && !openRouterKey) {
    // Simulated Persona Responses for Demo Mode
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getSimulatedPersonaResponse(persona, journey, userMessage);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const contents = [
    ...chatHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: persona === 'roommate' ? 0.9 : 0.6,
      maxOutputTokens: 2000
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API error (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

// ----------------------------------------------------
// Generators with Simulation Fallbacks
// ----------------------------------------------------

export async function generateCurriculumWithAI(
  topic: string,
  destination: string,
  baseline: string,
  hoursPerWeek: number,
  depth: string,
  diagnostic?: DiagnosticAssessment
): Promise<AdvisorData> {
  const apiKey = getStoredApiKey();
  const perplexityKey = getStoredPerplexityKey();

  if (!apiKey && !perplexityKey) {
    await new Promise((r) => setTimeout(r, 1000));
    return getSimulatedCurriculum(topic, destination, diagnostic);
  }

  const prompt = GENERATOR_PROMPTS.generateCurriculum(topic, destination, baseline, hoursPerWeek, depth, diagnostic);
  
  let raw = '';
  try {
    // Attempt with Google Search Grounding to verify modern frameworks vs deprecated cuts
    raw = await callGemini(
      prompt,
      'You are an elite academic curriculum architect and dean. Ground your recommendations in current, live industry standards and verified first principles.',
      'gemini-2.0-flash',
      true
    );
  } catch (err) {
    // Fallback without search grounding if quota/search issues occur
    raw = await callGemini(prompt, 'You are an elite academic curriculum architect and dean.', 'gemini-2.0-flash', false);
  }

  const parsed = extractJsonFromResponse<{
    overview: string;
    estimatedWeeks: number;
    phases: any[];
    cutList: any[];
  }>(raw);

  return {
    overview: parsed.overview || `Targeted curriculum for ${topic}`,
    estimatedWeeks: parsed.estimatedWeeks || 8,
    phases: (parsed.phases || []).map((p, idx) => ({
      id: `phase-${idx + 1}-${Date.now()}`,
      phaseNumber: p.phaseNumber || idx + 1,
      title: p.title || `Phase ${idx + 1}`,
      duration: p.duration || '2 weeks',
      objective: p.objective || '',
      coreConcepts: p.coreConcepts || [],
      checkpoint: {
        id: `cp-${idx + 1}-${Date.now()}`,
        title: p.checkpoint?.title || 'Phase Checkpoint Project',
        description: p.checkpoint?.description || 'Build proof-of-work',
        completed: false
      },
      completed: false
    })),
    cutList: (parsed.cutList || []).map((c, idx) => ({
      id: `cut-${idx + 1}-${Date.now()}`,
      topic: c.topic || 'Outdated Tutorial',
      reasonToSkip: c.reasonToSkip || 'Low leverage / cognitive noise',
      alternativeFocus: c.alternativeFocus || 'Focus on foundational mental models'
    })),
    chatHistory: []
  };
}

export async function generateSourcesWithAI(
  topic: string,
  destination: string,
  baseline: string
): Promise<CuratedSource[]> {
  const apiKey = getStoredApiKey();
  const perplexityKey = getStoredPerplexityKey();

  if (!apiKey && !perplexityKey) {
    await new Promise((r) => setTimeout(r, 900));
    return getSimulatedSources(topic);
  }

  // 1. Try real-time web grounding via Google Search or Perplexity Sonar
  try {
    const groundedPrompt = `Find the top 5 most authoritative, seminal books, official documentation, or seminal research papers for mastering "${topic}" (goal: ${destination}). Return a strictly valid JSON array of objects with keys: "type" ('book'|'paper'|'doc'|'case_study'), "title", "authorOrCreator", "url" (valid https URL or official site), "signalScore" (integer 8-10), "whyEssential" (1 sentence), "keyTakeaway" (1 sentence).`;
    
    const groundedResult = await queryGroundedAI(
      groundedPrompt,
      'You are an elite academic research librarian. Use live web search to verify real existing titles, authors, and URLs. Output only raw JSON.'
    );

    if (groundedResult.text) {
      const parsed = extractJsonFromResponse<any[]>(groundedResult.text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s, idx) => ({
          id: `source-${idx + 1}-${Date.now()}`,
          type: s.type || 'book',
          title: s.title || 'Seminal Source',
          authorOrCreator: s.authorOrCreator || 'Author',
          url: s.url || groundedResult.citations[idx]?.url || '',
          signalScore: s.signalScore || 10,
          whyEssential: s.whyEssential || 'Top 1% high signal material.',
          keyTakeaway: s.keyTakeaway || 'Foundational intuition',
          status: 'unread'
        }));
      }
    }
  } catch (err) {
    console.warn('Grounded source generation fallback to standard prompt', err);
  }

  // 2. Direct Gemini Search Grounding fallback
  const prompt = GENERATOR_PROMPTS.generateSources(topic, destination, baseline);
  const raw = await callGemini(prompt, 'You are a master academic research librarian.', 'gemini-2.0-flash', true);
  const parsed = extractJsonFromResponse<any[]>(raw);

  return parsed.map((s, idx) => ({
    id: `source-${idx + 1}-${Date.now()}`,
    type: s.type || 'book',
    title: s.title || 'Seminal Source',
    authorOrCreator: s.authorOrCreator || 'Author',
    url: s.url || '',
    signalScore: s.signalScore || 10,
    whyEssential: s.whyEssential || 'Top 1% high signal material.',
    keyTakeaway: s.keyTakeaway || 'Foundational intuition',
    status: 'unread'
  }));
}

export async function evaluateFeynmanWithAI(
  concept: string,
  userExplanation: string
): Promise<FeynmanSession> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1000));
    return getSimulatedFeynman(concept, userExplanation);
  }

  const prompt = GENERATOR_PROMPTS.evaluateFeynman(concept, userExplanation);
  const raw = await callGemini(prompt, 'You are a legendary Socratic professor applying the Feynman Technique.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `feynman-${Date.now()}`,
    concept,
    userExplanation,
    clarityScore: parsed.clarityScore || 85,
    accuracyScore: parsed.accuracyScore || 85,
    strengths: parsed.strengths || ['Good intuition'],
    blindSpots: parsed.blindSpots || ['Clarify assumptions'],
    simplifiedAnalogy: parsed.simplifiedAnalogy || 'Think of it like a library index card system...',
    tutorFeedback: parsed.tutorFeedback || 'Strong grasp of core principles.',
    date: new Date().toLocaleDateString()
  };
}

export async function generateQuizWithAI(
  topic: string,
  specificFocus: string
): Promise<DiagnosticQuiz> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 900));
    return getSimulatedQuiz(topic, specificFocus);
  }

  const prompt = GENERATOR_PROMPTS.generateQuiz(topic, specificFocus);
  const raw = await callGemini(prompt, 'You are a diagnostic examiner finding knowledge gaps.');
  const parsed = extractJsonFromResponse<any[]>(raw);

  return {
    id: `quiz-${Date.now()}`,
    topic: specificFocus || topic,
    questions: parsed.map((q, idx) => ({
      id: `q-${idx + 1}`,
      question: q.question,
      options: q.options || [],
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || ''
    })),
    date: new Date().toLocaleDateString()
  };
}

export async function critiqueTextWithAI(
  draft: string,
  mode: 'logic' | 'clarity' | 'steelman' | 'first_principles'
): Promise<EditorReview> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1000));
    return getSimulatedCritique(draft, mode);
  }

  const prompt = GENERATOR_PROMPTS.critiqueText(draft, mode);
  const raw = await callGemini(prompt, 'You are a rigorous, award-winning academic and strategic editor.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `review-${Date.now()}`,
    title: draft.slice(0, 30) + '...',
    submittedDraft: draft,
    mode,
    overallScore: parsed.overallScore || 80,
    verdict: parsed.verdict || 'Promising thesis with identifiable logical gaps.',
    strengths: parsed.strengths || [],
    logicFlaws: parsed.logicFlaws || [],
    counterarguments: parsed.counterarguments || [],
    redlines: (parsed.redlines || []).map((r: any, idx: number) => ({
      id: `redline-${idx + 1}`,
      originalText: r.originalText,
      improvedText: r.improvedText,
      critiqueReason: r.critiqueReason
    })),
    revisedVersion: parsed.revisedVersion || draft,
    date: new Date().toLocaleDateString()
  };
}

export async function generateCollisionWithAI(
  topic: string,
  candidateDomain?: string
): Promise<DomainCollision> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 800));
    return getSimulatedCollision(topic, candidateDomain);
  }

  const prompt = GENERATOR_PROMPTS.generateCollision(topic, candidateDomain);
  const raw = await callGemini(prompt, 'You are an intellectual lateral thinker bridging distant domains.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `collision-${Date.now()}`,
    collidingDomain: parsed.collidingDomain || 'Evolutionary Biology',
    provocativeThesis: parsed.provocativeThesis || `How ${topic} behaves like an ecological ecosystem`,
    connectionAnalysis: parsed.connectionAnalysis || 'Cross-disciplinary synthesis',
    discussionStarters: parsed.discussionStarters || []
  };
}

export async function teachConceptWithAI(
  topic: string,
  concept: string,
  destination: string,
  baseline: string
): Promise<InteractiveLesson> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1000));
    return getSimulatedLesson(topic, concept);
  }

  const prompt = GENERATOR_PROMPTS.teachConcept(topic, concept, destination, baseline);
  const raw = await callGemini(prompt, 'You are a master professor delivering a high-impact interactive masterclass.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `lesson-${Date.now()}`,
    concept,
    lessonTitle: parsed.lessonTitle || `Mastering ${concept}: Zero-to-Hero Blueprint`,
    estimatedReadTime: parsed.estimatedReadTime || '8 min masterclass',
    plainEnglishAnalogy: parsed.plainEnglishAnalogy || `Think of ${concept} like a load-bearing foundation in a skyscraper...`,
    whyNovicesGetConfused: parsed.whyNovicesGetConfused || 'Most beginners get confused by surface syntax before understanding the underlying state machine and feedback loop.',
    laymanExplanation: parsed.laymanExplanation || parsed.coreExplanation || 'Core foundational breakdown...',
    architecturalDiagramOrFlow: parsed.architecturalDiagramOrFlow || '┌──────────┐\n│  Input   │ ──► [ Process ] ──► [ Output ]\n└──────────┘',
    mechanicsMarkdown: parsed.mechanicsMarkdown || parsed.coreExplanation || 'Deep first-principles technical breakdown...',
    corePrimitives: parsed.corePrimitives || [
      { name: 'Control Loop', role: 'Manages step execution and termination criteria', explanation: 'Orchestrates the active state transitions and decides when the final goal is met.' },
      { name: 'State Context', role: 'Maintains running history and observations', explanation: 'Accumulates previous actions and results so the system does not repeat mistakes.' },
      { name: 'Execution Vector', role: 'Interacts with tools and environment', explanation: 'Safely executes side-effects with timeout and exception boundaries.' }
    ],
    implementationGuide: parsed.implementationGuide || [
      'Step 1: Define strict input and output type interfaces.',
      'Step 2: Establish the loop termination condition to prevent infinite recursion.',
      'Step 3: Implement tool calling with schema validation.',
      'Step 4: Catch and format runtime errors as observation state for self-correction.'
    ],
    codeOrTemplate: parsed.codeOrTemplate || `// First-Principles Implementation Blueprint
export async function runAgentLoop(task: string, maxIterations = 5) {
  let state = { task, history: [], isFinished: false };
  
  for (let i = 0; i < maxIterations; i++) {
    // 1. Reason / Plan
    const plan = await reasonNextStep(state);
    if (plan.action === 'FINISH') {
      state.isFinished = true;
      return plan.finalAnswer;
    }
    
    // 2. Execute Action
    try {
      const observation = await executeTool(plan.action, plan.args);
      state.history.push({ plan, observation });
    } catch (err: any) {
      state.history.push({ plan, observation: \`Error: \${err.message}\` });
    }
  }
  return state;
}`,
    howMastersUseIt: parsed.howMastersUseIt || 'Top 1% engineers avoid heavy magic abstractions; they write clean, deterministic state loops with explicit observability.',
    commonPitfalls: parsed.commonPitfalls || [
      'Infinite Loops: Forgetting a hard iteration limit or token ceiling.',
      'Unchecked Tool Output: Passing massive 100KB raw API payloads into the prompt context window.'
    ],
    cutListFluff: parsed.cutListFluff || 'Skip superficial tutorials that hide the loop behind black-box wrappers without teaching state handling.',
    coreExplanation: parsed.coreExplanation || parsed.mechanicsMarkdown || 'Comprehensive masterclass synthesis.',
    keyTakeaways: parsed.keyTakeaways || [
      '1. Explicit state transitions beat opaque prompts every time.',
      '2. Errors from tools must be fed back as observations for self-healing.',
      '3. Always bound iterations and validate schema contracts.'
    ],
    socraticChallenge: parsed.socraticChallenge || 'How would you adapt this architecture to recover when an external API times out after 3 retries?',
    practiceTask: parsed.practiceTask || 'Write a 20-line working prototype of this loop in the scratchpad below and click "Send to Editor" for redline review.',
    mastered: false,
    createdAt: new Date().toLocaleDateString()
  };
}

export async function evaluateLessonResponseWithAI(
  concept: string,
  challenge: string,
  studentResponse: string
): Promise<{ mastered: boolean; score: number; strengths: string; nuanceOrGap: string; coachingVerdict: string }> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      mastered: true,
      score: 94,
      strengths: 'Outstanding first-principles deduction! You clearly identified the state transition invariant and designed an explicit error-recovery boundary.',
      nuanceOrGap: 'In production systems, consider adding exponential backoff jitter to prevent thundering herd problems during upstream outages.',
      coachingVerdict: 'Concept Verified & Mastered! You have demonstrated true applied architectural understanding.'
    };
  }

  const prompt = GENERATOR_PROMPTS.evaluateLessonResponse(concept, challenge, studentResponse);
  const raw = await callGemini(prompt, 'You are a Socratic tutor evaluating conceptual mastery.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    mastered: parsed.mastered ?? true,
    score: parsed.score ?? 90,
    strengths: parsed.strengths || 'Strong conceptual logic demonstrated.',
    nuanceOrGap: parsed.nuanceOrGap || 'Consider stress-testing under extreme load.',
    coachingVerdict: parsed.coachingVerdict || 'Concept Verified & Mastered.'
  };
}

export async function generateDiagnosticQuestionsWithAI(
  topic: string,
  destination: string,
  baseline: string
): Promise<DiagnosticQuestion[]> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 600));
    return getSimulatedDiagnosticQuestions(topic, destination);
  }

  const prompt = GENERATOR_PROMPTS.generateDiagnosticQuestions(topic, destination, baseline);
  const raw = await callGemini(prompt, 'You are an elite Socratic intake professor grilling a prospective student.');
  const parsed = extractJsonFromResponse<any[]>(raw);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((q, idx) => ({
      id: q.id || `diag-${idx + 1}`,
      type: q.type || (idx === 0 ? 'clarification' : idx === 1 ? 'claimed_baseline' : 'technical_probe'),
      question: q.question,
      contextReason: q.contextReason || 'Calibrates curriculum to your exact frontier of competence',
      suggestedOptions: q.suggestedOptions || []
    }));
  }

  return getSimulatedDiagnosticQuestions(topic, destination);
}

export async function conductAdvisorIntakeTurnWithAI(
  topic: string,
  history: Array<{ sender: 'advisor' | 'user'; content: string }>,
  userResponse?: string
): Promise<{
  advisorMessage: string;
  suggestedQuickReplies: string[];
  isInterviewComplete: boolean;
  turnStage: string;
}> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 600));
    return getSimulatedAdvisorIntakeTurn(topic, history, userResponse);
  }

  const prompt = GENERATOR_PROMPTS.conductAdvisorIntakeTurn(topic, history, userResponse);
  const raw = await callGemini(
    prompt,
    'You are a warm, welcoming, and encouraging AI Academic Advisor conducting a 1-on-1 friendly intake conversation.'
  );
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    advisorMessage: parsed.advisorMessage || `Tell me more about what you'd love to achieve with ${topic}!`,
    suggestedQuickReplies: parsed.suggestedQuickReplies || ['I want to build a complete project', 'I am starting from scratch', 'I have basic experience'],
    isInterviewComplete: parsed.isInterviewComplete ?? false,
    turnStage: parsed.turnStage || 'conversation'
  };
}

export async function evaluateDiagnosticAnswersWithAI(
  topic: string,
  qaPairs: Array<{ question: string; answer: string; type?: string }>
): Promise<DiagnosticAssessment> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 800));
    return getSimulatedDiagnosticEvaluation(topic, qaPairs);
  }

  const prompt = GENERATOR_PROMPTS.evaluateDiagnosticAnswers(topic, qaPairs);
  const raw = await callGemini(prompt, 'You are a supportive, insightful Academic Advisor creating a personalized curriculum.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    refinedTopic: parsed.refinedTopic || topic,
    refinedDestination: parsed.refinedDestination || `Master ${topic} with a real-world project`,
    actualBaselineAssessment: parsed.actualBaselineAssessment || 'Curious autodidact with specific strengths and areas to build confidence',
    masteredStrengths: parsed.masteredStrengths || ['Clear motivation and strategic vision'],
    criticalGapsToFill: parsed.criticalGapsToFill || ['Foundational core steps and starter confidence'],
    recommendedStartingPhase: parsed.recommendedStartingPhase || 1,
    recommendedCutList: parsed.recommendedCutList || ['Skip generic low-value video lectures', 'Avoid passive consumption without building'],
    diagnosticScore: parsed.diagnosticScore || 80,
    whyCustomizedExplanation: parsed.whyCustomizedExplanation || `We customized your roadmap to focus on hands-on building while ensuring you master foundational concepts first.`,
    addedCoursesReason: parsed.addedCoursesReason || `We added Phase 1 foundational checkpoints so you have 100% confidence before moving to advanced milestones.`,
    subtractedCoursesReason: parsed.subtractedCoursesReason || `We cut out unnecessary fluff so you save dozens of hours and focus on what works.`,
    phasesSummary: parsed.phasesSummary || [
      {
        phaseNumber: 1,
        title: 'Foundations & First Prototype',
        duration: 'Weeks 1-2',
        tangibleAsset: 'Working First Prototype / Outline',
        whyThisOrder: 'Validates your core idea and builds initial momentum with zero overwhelm.'
      },
      {
        phaseNumber: 2,
        title: 'Core Build & Execution',
        duration: 'Weeks 3-4',
        tangibleAsset: 'Complete Functional Milestone',
        whyThisOrder: 'Develops the primary asset using the validated foundations from Phase 1.'
      },
      {
        phaseNumber: 3,
        title: 'Polish, Launch & Real-World Results',
        duration: 'Weeks 5-6',
        tangibleAsset: 'Live Published Deliverable',
        whyThisOrder: 'Brings your project into the real world for feedback and tangible proof.'
      }
    ]
  };
}

export async function converseSocraticLessonWithAI(
  topic: string,
  concept: string,
  currentStage: string,
  history: Array<{ speaker: string; content: string }>,
  studentInput?: string
): Promise<{
  tutorSpeech: string;
  stageName: string;
  tutorFeedbackOnStudent?: string;
  checkInQuestion: string;
  isConceptMastered: boolean;
}> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 700));
    return getSimulatedSocraticTurn(concept, currentStage, studentInput);
  }

  const prompt = GENERATOR_PROMPTS.converseSocraticLesson(topic, concept, currentStage, history, studentInput);
  const raw = await callGemini(prompt, 'You are a lively, interactive Socratic master professor in a 1-on-1 private lesson.');
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    tutorSpeech: parsed.tutorSpeech || `Let's break down ${concept} from first principles.`,
    stageName: parsed.stageName || currentStage,
    tutorFeedbackOnStudent: parsed.tutorFeedbackOnStudent || undefined,
    checkInQuestion: parsed.checkInQuestion || 'How would you apply this invariant in a live failure scenario?',
    isConceptMastered: parsed.isConceptMastered ?? false
  };
}

export async function synthesizeSourceWithAI(
  sourceTitle: string,
  author: string,
  topic: string
): Promise<SourceDeepDive> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 900));
    return getSimulatedSourceDeepDive(sourceTitle, author, topic);
  }

  const prompt = GENERATOR_PROMPTS.synthesizeSource(sourceTitle, author, topic);
  const raw = await callGemini(
    prompt,
    'You are a world-class university professor directly teaching seminal concepts from zero to hero.'
  );
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `dive-${Date.now()}`,
    sourceTitle: parsed.sourceTitle || sourceTitle,
    author: parsed.author || author,
    topic: parsed.topic || topic,
    estimatedTime: parsed.estimatedTime || '8 min masterclass',
    bigIdea: parsed.bigIdea || 'Central thesis and paradigm shift.',
    topMentalModels: parsed.topMentalModels || [
      { model: 'First-Principles Deconstruction', explanation: 'Break down complex problems into basic truths that cannot be deduced any further.' }
    ],
    practicalApplication: parsed.practicalApplication || 'How to apply this in your project.',
    cutListFluff: parsed.cutListFluff || 'Historical background chapters can be skipped.',
    plainEnglishIntuition: parsed.plainEnglishIntuition || {
      coreMetaphor: `Think of ${sourceTitle} like building a sturdy suspension bridge: before decorating the towers, you must anchor the bedrock cables.`,
      whyNovicesGetConfused: 'Beginners focus on superficial tools rather than understanding the underlying system constraint.',
      laymanExplanation: `To master ${sourceTitle}, you must start with the simplest possible invariant and build upward without unnecessary jargon.`
    },
    mechanicsAndAnatomy: parsed.mechanicsAndAnatomy || {
      architecturalDiagramOrFlow: `[ Input ] ──► [ Core Mechanism ] ──► [ Output Feedback Loop ]`,
      deepExplanationMarkdown: `### How It Works Under the Hood\n\nThe fundamental breakthrough of ${sourceTitle} is organizing execution into structured, self-correcting feedback loops.`,
      corePrimitives: [
        { name: 'Core Primitive 1', role: 'Input Processing', explanation: 'Decomposes the incoming objective into discrete actionable units.' },
        { name: 'Core Primitive 2', role: 'Execution Engine', explanation: 'Runs the primary operation against real-world constraints.' },
        { name: 'Core Primitive 3', role: 'Observation Loop', explanation: 'Inspects feedback and updates state before proceeding.' }
      ]
    },
    implementationBlueprint: parsed.implementationBlueprint || {
      stepByStepGuide: [
        'Step 1: Isolate the core invariant and define your input/output schema.',
        'Step 2: Implement the minimal viable loop without premature optimization.',
        'Step 3: Test failure boundaries and edge cases before scaling.'
      ],
      codeOrTemplate: `// Minimal Tactical Implementation of ${sourceTitle}\nfunction executeConcept(input) {\n  const state = initializeState(input);\n  return processLoop(state);\n}`,
      howMastersUseIt: 'Top practitioners automate feedback validation and decouple state management from business logic.'
    },
    trapsAndCutList: parsed.trapsAndCutList || {
      commonPitfalls: [
        'Prematurely adding secondary features before the core loop is proven.',
        'Ignoring failure feedback and letting errors compound silently.'
      ],
      cutListFluff: parsed.cutListFluff || 'Skip historical anecdotes and outdated legacy benchmarks.'
    },
    socraticSparring: parsed.socraticSparring || {
      realWorldScenario: `You are building a mission-critical system in ${topic} with strict latency and zero tolerance for hallucinations.`,
      challengeQuestion: `How would you apply the core lessons of ${sourceTitle} to guarantee that unexpected errors trigger immediate self-correction rather than crashing the system?`,
      sampleStrongAnswer: 'By wrapping execution in an explicit Thought-Action-Observation loop with state checkpointing.'
    }
  };
}

export async function triageStuckStudentWithAI(
  topic: string,
  phaseTitle: string,
  currentConcept: string,
  blockerType: string,
  blockerDetails: string
): Promise<StuckTriageResult> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 900));
    return getSimulatedStuckTriage(topic, blockerType, blockerDetails);
  }

  const prompt = GENERATOR_PROMPTS.triageStuckStudent(
    topic,
    phaseTitle,
    currentConcept,
    blockerType,
    blockerDetails
  );
  const raw = await callGemini(
    prompt,
    'You are an empathetic, ultra-pragmatic Dean of Momentum & Acceleration in an elite autodidactic academy.'
  );
  const parsed = extractJsonFromResponse<any>(raw);

  return {
    id: `triage-${Date.now()}`,
    blockerSummary: parsed.blockerSummary || 'Overwhelm caused by trying to solve too many variables simultaneously.',
    microAction5Min: parsed.microAction5Min || 'Write down the single input and single expected output of your next step.',
    starterScaffold: parsed.starterScaffold || '// Minimal Starter Scaffold\nfunction executeStep() {\n  // 1. Fill in basic variable\n  const input = "test";\n  return input;\n}',
    complexityReductionCut: parsed.complexityReductionCut || 'Ignore styling, edge cases, and scalability. Focus only on the happy path.',
    mindsetReframing: parsed.mindsetReframing || 'Make it work before you make it good. Make it good before you make it fast.',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function getSimulatedAdvisorIntakeTurn(
  topic: string,
  history: Array<{ sender: 'advisor' | 'user'; content: string }>,
  userResponse?: string
): {
  advisorMessage: string;
  suggestedQuickReplies: string[];
  isInterviewComplete: boolean;
  turnStage: string;
} {
  const turnCount = history.filter((h) => h.sender === 'user').length;
  const isEbook = topic.toLowerCase().includes('book') || topic.toLowerCase().includes('publish');
  const isGarden = topic.toLowerCase().includes('garden') || topic.toLowerCase().includes('herb') || topic.toLowerCase().includes('plant');
  const isBake = topic.toLowerCase().includes('sourdough') || topic.toLowerCase().includes('bake') || topic.toLowerCase().includes('bread');
  const isTrade = topic.toLowerCase().includes('trade') || topic.toLowerCase().includes('forex') || topic.toLowerCase().includes('future');
  const isDigitalProduct = topic.toLowerCase().includes('digital product') || topic.toLowerCase().includes('saas') || topic.toLowerCase().includes('app');

  if (turnCount === 0) {
    if (isEbook) {
      return {
        advisorMessage: `Hey there! 👋 I'm your Academic Advisor. Welcome to Altor!\n\nBefore we build your personalized curriculum for **${topic}**, I want to get crystal clear on your vision so we don't give you a cookie-cutter plan.\n\nTell me about the e-book you want to create! What is the topic, who is your dream reader, and what's the main transformation you want them to get?`,
        suggestedQuickReplies: [
          'A practical non-fiction guide solving a specific problem',
          'A creative story or memoir to inspire others',
          'A technical breakdown / reference guide for professionals',
          'I have general ideas, but need help choosing the most profitable niche'
        ],
        isInterviewComplete: false,
        turnStage: 'vision'
      };
    }

    if (isGarden) {
      return {
        advisorMessage: `Hey there! 🌿 I'm your Academic Advisor. Welcome to Altor!\n\nBefore we map out your customized roadmap for **${topic}**, tell me about your dream garden! Are you setting up a kitchen windowsill with culinary herbs, an indoor grow tent, or a balcony container garden?`,
        suggestedQuickReplies: [
          'Kitchen windowsill culinary herbs (basil, thyme, rosemary)',
          'Indoor LED grow-light herb & microgreen station',
          'Balcony or small patio organic container garden',
          'Starting 100% from scratch and need help picking the best starter greens'
        ],
        isInterviewComplete: false,
        turnStage: 'vision'
      };
    }

    if (isBake) {
      return {
        advisorMessage: `Hey! 🍞 I'm your Academic Advisor. Welcome to Altor!\n\nBefore we engineer your customized baking curriculum for **${topic}**, tell me what your dream outcome is! Do you want to master baking blistered, open-crumb sourdough at home, or are you hoping to start a micro-bakery selling to neighbors?`,
        suggestedQuickReplies: [
          'Master consistent, open-crumb artisan sourdough loaves for my family',
          'Launch a weekend cottage food micro-bakery for local customers',
          'Learn sourdough starter maintenance and troubleshooting from zero'
        ],
        isInterviewComplete: false,
        turnStage: 'vision'
      };
    }

    return {
      advisorMessage: `Hey there! 👋 I'm your Academic Advisor. Welcome to Altor!\n\nBefore we build your customized curriculum for **${topic}**, I'd love to chat for 2 minutes so we understand your exact dream and current starting point.\n\nTell me: What would a completely successful project or outcome look like for you in **${topic}**?`,
      suggestedQuickReplies: [
        `Create a finished, real-world project or deliverable in ${topic}`,
        `Master the core foundations so I have 100% confidence`,
        `Build a commercial product or service to sell to clients`
      ],
      isInterviewComplete: false,
      turnStage: 'vision'
    };
  }

  if (turnCount === 1) {
    return {
      advisorMessage: `Awesome! That gives me a very clear picture of where you want to end up.\n\nNow tell me about your hands-on background with this: Have you ever tried doing anything related to **${topic}** before (even small experiments, reading books, or trying tutorials), or are you starting 100% from square one?`,
      suggestedQuickReplies: [
        'Complete beginner — starting from absolute zero',
        'I have read books and watched videos, but have never built a complete project',
        'I have basic hands-on experience and want to level up to an advanced standard'
      ],
      isInterviewComplete: false,
      turnStage: 'background'
    };
  }

  if (turnCount === 2) {
    if (isEbook) {
      return {
        advisorMessage: `Great context! Let's do a quick foundational check:\n\nWhen writing a successful e-book, how would you approach validating reader demand and outlining chapter milestones before writing 200 pages? Or is market validation something you'd like us to teach you from the ground up?`,
        suggestedQuickReplies: [
          'I usually just start writing drafts and figure out marketing later',
          'I know I should validate with a landing page or survey, but need a step-by-step checklist',
          'Brand new to me — please teach me the step-by-step validation process from scratch!'
        ],
        isInterviewComplete: false,
        turnStage: 'knowledge_probe'
      };
    }

    if (isGarden) {
      return {
        advisorMessage: `Got it! Quick foundational question:\n\nIn indoor container gardening, how comfortable are you with balancing soil aeration/drainage vs watering schedules and LED light distance? Or is indoor plant biology something you want to learn step-by-step?`,
        suggestedQuickReplies: [
          'My plants often get overwatered or dry out; I need a clear watering & light guide',
          'I understand basic potting soil, but struggle with lighting schedules and nutrient feeding',
          'Brand new to indoor plant care — please teach me the core essentials from scratch!'
        ],
        isInterviewComplete: false,
        turnStage: 'knowledge_probe'
      };
    }

    if (isTrade) {
      return {
        advisorMessage: `Understood! Quick foundational check:\n\nWhen you place a live trade, what's your understanding of how Bid vs. Ask spreads and slippage affect your entry, and how do you calculate position size so you never risk more than 1-2% of your capital?`,
        suggestedQuickReplies: [
          'I understand candlestick charts, but struggle with order book execution and position sizing math',
          'I know the difference between Bid and Ask, but need a disciplined risk management rulebook',
          'Brand new to order book mechanics — please teach me proper risk management from zero!'
        ],
        isInterviewComplete: false,
        turnStage: 'knowledge_probe'
      };
    }

    if (isDigitalProduct) {
      return {
        advisorMessage: `Got it! Quick practical check:\n\nWhen setting up a digital product or SaaS, how comfortable are you with handling customer authentication and automated billing webhooks? Or is backend data flow something you'd like to learn step-by-step?`,
        suggestedQuickReplies: [
          'I can build nice frontend layouts, but backend databases and Stripe billing are brand new to me',
          'I have never written code or databases — I need a clear step-by-step fullstack or no-code path',
          'I know how to code APIs, but need guidance on conversion funnels and launch architecture'
        ],
        isInterviewComplete: false,
        turnStage: 'knowledge_probe'
      };
    }

    return {
      advisorMessage: `Got it! Quick foundational check:\n\nIn **${topic}**, what is the single biggest question, obstacle, or concept that you currently feel uncertain about when trying to reach your goal?`,
      suggestedQuickReplies: [
        'Knowing what step to take first without getting overwhelmed',
        'Understanding how to turn theoretical knowledge into a tangible finished project',
        'Avoiding common beginner mistakes and knowing what fluff to skip'
      ],
      isInterviewComplete: false,
      turnStage: 'knowledge_probe'
    };
  }

  // Turn 3+: Ready to synthesize
  return {
    advisorMessage: `Thank you for sharing that! That gives me everything I need.\n\nI can see exactly where you are today and what missing puzzle pieces we need to fill in. I'm ready to customize your complete 3-phase curriculum, cut out the distractions, and show you why each step is in that exact order.`,
    suggestedQuickReplies: ['View My Personalized Curriculum →'],
    isInterviewComplete: true,
    turnStage: 'ready_to_synthesize'
  };
}

function getSimulatedDiagnosticQuestions(topic: string, destination: string): DiagnosticQuestion[] {
  const isEbook = topic.toLowerCase().includes('book') || topic.toLowerCase().includes('publish');
  const isGarden = topic.toLowerCase().includes('garden') || topic.toLowerCase().includes('herb');
  const isBake = topic.toLowerCase().includes('sourdough') || topic.toLowerCase().includes('bake');
  const isTrade = topic.toLowerCase().includes('trade') || topic.toLowerCase().includes('forex') || topic.toLowerCase().includes('future');
  const isDigitalProduct = topic.toLowerCase().includes('digital product') || topic.toLowerCase().includes('saas') || topic.toLowerCase().includes('app');
  
  if (isEbook) {
    return [
      {
        id: 'diag-1',
        type: 'clarification',
        question: 'What kind of e-book are you aiming to write and publish?',
        contextReason: 'Determines the ideal outline structure, target audience, and distribution platform.',
        suggestedOptions: [
          'A practical non-fiction guide solving a specific problem',
          'A creative story, memoir, or essay collection',
          'A technical reference handbook for professionals',
          'A short checklist & resource guide for beginners'
        ]
      },
      {
        id: 'diag-2',
        type: 'claimed_baseline',
        question: 'What is your current writing and publishing experience so far?',
        contextReason: 'Helps us skip beginner outlining if you already write, or guide you from zero.',
        suggestedOptions: [
          'Complete beginner — I have never written a book or published online',
          'I write blog posts or articles, but have never structured a complete multi-chapter book',
          'I have written draft chapters, but struggle with editing, formatting, and selling'
        ]
      },
      {
        id: 'diag-3',
        type: 'technical_probe',
        question: 'Before writing 100+ pages, how would you test whether readers actually want to buy this specific topic?',
        contextReason: 'Checks whether you understand audience validation before spending months writing.',
        suggestedOptions: [
          'Create a 1-page pre-order landing page or survey to collect early email waitlist signups',
          'Write the entire manuscript in secret and then post it on social media',
          'Send query letters to traditional publishers'
        ]
      }
    ];
  }

  if (isGarden) {
    return [
      {
        id: 'diag-1',
        type: 'clarification',
        question: 'What type of indoor garden are you setting up?',
        contextReason: 'Different plants require completely different soil mixes, container depths, and light cycles.',
        suggestedOptions: [
          'Kitchen windowsill culinary herb garden (basil, thyme, mint)',
          'Indoor LED grow-light shelf for microgreens and salad greens',
          'Balcony or patio container vegetable garden'
        ]
      },
      {
        id: 'diag-2',
        type: 'claimed_baseline',
        question: 'What is your hands-on experience with caring for indoor plants?',
        contextReason: 'Ensures we start with foolproof starter herbs without overwhelming you.',
        suggestedOptions: [
          'Absolute beginner — I have never grown plants before',
          'I have kept houseplants alive, but want to grow edible culinary herbs successfully',
          'Experienced gardener looking to master year-round indoor grow-light optimization'
        ]
      },
      {
        id: 'diag-3',
        type: 'technical_probe',
        question: 'What is the most common reason indoor culinary herbs turn yellow or wilt, and how do you prevent it?',
        contextReason: 'Tests your practical understanding of soil drainage and root aeration vs overwatering.',
        suggestedOptions: [
          'Overwatering and poor container drainage suffocating the root system',
          'Not giving them enough chemical fertilizer in the first week',
          'Keeping them in soil that stays completely dry for weeks'
        ]
      }
    ];
  }

  if (isDigitalProduct) {
    return [
      {
        id: 'diag-1',
        type: 'clarification',
        question: 'What exact format of digital product are you aiming to build?',
        contextReason: 'Different digital products require completely different tech stacks and execution loops.',
        suggestedOptions: [
          'A paid B2B SaaS web app with Stripe subscriptions',
          'A digital template & workflow pack (Notion, Figma, Airtable)',
          'A paid developer API or data pipeline service',
          'A high-ticket video cohort or interactive digital workshop'
        ]
      },
      {
        id: 'diag-2',
        type: 'claimed_baseline',
        question: 'What is your current hands-on development and deployment experience?',
        contextReason: 'Ensures we start at your exact technical frontier without skipping essential prerequisites.',
        suggestedOptions: [
          'Complete beginner — I have never written code or deployed a database',
          'Familiar with HTML/CSS/React frontend, but new to backend databases & Stripe billing',
          'Experienced developer — I want to ship fast and focus on conversion architectures'
        ]
      },
      {
        id: 'diag-3',
        type: 'technical_probe',
        question: 'When a customer pays via Stripe, what security measure ensures an attacker cannot spoof the payment webhook event to grant themselves free access?',
        contextReason: 'Tests your practical understanding of secure payment architecture vs. surface-level tutorial knowledge.',
        suggestedOptions: [
          'Verify the Stripe-Signature header using the endpoint signing secret before processing the event payload',
          'Check if the customer email exists in the local database query',
          'Use a simple shared API token in the query params'
        ]
      }
    ];
  }

  if (isTrade) {
    return [
      {
        id: 'diag-1',
        type: 'clarification',
        question: 'What specific instrument and time horizon are you planning to trade?',
        contextReason: 'Futures, Forex, and Options operate with radically different margin rules and tick values.',
        suggestedOptions: [
          'Index Futures (ES / NQ / MES / MNQ) intraday scalping',
          'Forex Major Currency Pairs (EUR/USD, GBP/USD) swing trading',
          'Automated algorithmic trading strategies in Python'
        ]
      },
      {
        id: 'diag-2',
        type: 'claimed_baseline',
        question: 'How would you honestly rate your live execution and risk management background?',
        contextReason: 'Separates theoretical chart reading from real order book execution competence.',
        suggestedOptions: [
          'I have read books on candlestick patterns, but have never traded live order flow',
          'I trade with real capital but struggle with position sizing and drawdowns',
          'I have a profitable mechanical strategy and want to scale account size'
        ]
      },
      {
        id: 'diag-3',
        type: 'technical_probe',
        question: 'If ES Futures are quoted at Bid: 5200.00 / Ask: 5200.25 and you submit a Market Buy, at what price will you be filled, and what is your slippage risk during high-volatility news?',
        contextReason: 'Tests whether you understand order book liquidity and market vs limit mechanics.',
        suggestedOptions: [
          'Filled immediately at 5200.25 (the Ask), with high slippage risk if the Ask book thins out',
          'Filled at 5200.00 (the Bid) with guaranteed zero slippage',
          'Filled at the midpoint 5200.125 automatically'
        ]
      }
    ];
  }

  return [
    {
      id: 'diag-1',
      type: 'clarification',
      question: `What specific goal or project are you hoping to create in ${topic}?`,
      contextReason: 'Translates broad interests into an exact, tangible target outcome.',
      suggestedOptions: [
        `Build and complete a finished, real-world project in ${topic}`,
        `Master the core fundamentals from scratch with zero confusion`,
        `Create a professional deliverable or service in ${topic}`
      ]
    },
    {
      id: 'diag-2',
      type: 'claimed_baseline',
      question: `What is your current hands-on background with ${topic}?`,
      contextReason: 'Establishes your self-assessed starting point so we meet you where you are.',
      suggestedOptions: [
        'Complete beginner — starting from square one',
        'I know some basic ideas, but have never built an end-to-end project',
        'I have basic experience and want to fill in my knowledge gaps'
      ]
    },
    {
      id: 'diag-3',
      type: 'technical_probe',
      question: `What do you feel is the most challenging part of getting started with ${topic}?`,
      contextReason: 'Helps us tailor Phase 1 to directly eliminate your biggest bottleneck.',
      suggestedOptions: [
        'Knowing what step to take first without getting overwhelmed',
        'Finding clear, practical guides that avoid confusing jargon',
        'Staying consistent and having clear milestones to track progress'
      ]
    }
  ];
}

function getSimulatedDiagnosticEvaluation(
  topic: string,
  qaPairs: Array<{ question: string; answer: string; type?: string }>
): DiagnosticAssessment {
  const answerSummary = qaPairs.map((q) => q.answer).join(' ');
  const isBeginner = answerSummary.toLowerCase().includes('beginner') || answerSummary.toLowerCase().includes('never') || answerSummary.toLowerCase().includes('zero') || answerSummary.toLowerCase().includes('square one');
  
  const isEbook = topic.toLowerCase().includes('book') || topic.toLowerCase().includes('publish');
  const isGarden = topic.toLowerCase().includes('garden') || topic.toLowerCase().includes('herb');
  const isTrade = topic.toLowerCase().includes('trade') || topic.toLowerCase().includes('forex');
  const isDigitalProduct = topic.toLowerCase().includes('digital product') || topic.toLowerCase().includes('saas');

  if (isEbook) {
    return {
      refinedTopic: 'Publishing & Selling My First E-Book',
      refinedDestination: 'Write, design, and launch a validated 10-chapter e-book with an automated Gumroad pre-order landing page',
      actualBaselineAssessment: isBeginner 
        ? 'Great creative ideas and motivation; needs a step-by-step framework for outline validation, formatting, and direct sales.'
        : 'Comfortable with writing drafts; needs practical guidance on audience pre-sales and automated store funnels.',
      masteredStrengths: [
        'Clear vision for target readers and core message',
        'High motivation to create a tangible published asset'
      ],
      criticalGapsToFill: [
        'Testing topic demand with a 1-page landing page before writing 200 pages',
        'EPUB/PDF formatting, cover design, and setting up automated payment checkout'
      ],
      recommendedStartingPhase: 1,
      diagnosticScore: isBeginner ? 70 : 85,
      whyCustomizedExplanation: `Because you want to write a book that actually sells, we customized Phase 1 to validate your concept with real readers first—so you never spend months writing in secret only to hear crickets.`,
      addedCoursesReason: `We added 'Phase 1: Idea Validation & Landing Page Setup' so you can collect early email signups before drafting the full manuscript.`,
      subtractedCoursesReason: `We cut out 3-month traditional publisher query letters and expensive PR firms because you're publishing direct to readers.`,
      recommendedCutList: [
        'Skip sending query letters to traditional publishing gatekeepers',
        'Skip complex paid advertising until your landing page conversion is proven'
      ],
      phasesSummary: [
        {
          phaseNumber: 1,
          title: 'Phase 1: Market Validation & Chapter Outline',
          duration: 'Weeks 1-2',
          tangibleAsset: '1-Page Book Proposal + Gumroad Waitlist Page with 25 signups',
          whyThisOrder: 'Validates reader interest first so you write with 100% confidence.'
        },
        {
          phaseNumber: 2,
          title: 'Phase 2: Focused Manuscript Drafting & Cover Design',
          duration: 'Weeks 3-4',
          tangibleAsset: 'Complete 10-Chapter Manuscript + Professional 3D Cover',
          whyThisOrder: 'Drafts the core content using the validated chapter outline from Phase 1.'
        },
        {
          phaseNumber: 3,
          title: 'Phase 3: Formatting, Store Launch & First 50 Sales',
          duration: 'Weeks 5-6',
          tangibleAsset: 'Live Published E-Book accepting orders on Gumroad/Amazon',
          whyThisOrder: 'Brings your finished book to market and generates real-world readers.'
        }
      ]
    };
  }

  if (isGarden) {
    return {
      refinedTopic: 'Organic Culinary Herb & Urban Gardening',
      refinedDestination: 'Build a flourishing 4-pot indoor organic culinary herb nursery with automated LED lighting and continuous fresh harvests',
      actualBaselineAssessment: isBeginner
        ? 'Enthusiastic beginner; needs a foolproof starter checklist for soil drainage, watering schedules, and light placement.'
        : 'Basic houseplant care experience; needs guidance on pruning kinetics and continuous culinary harvesting.',
      masteredStrengths: [
        'Clear space and excitement to grow fresh organic herbs at home',
        'Appreciation for fresh culinary ingredients'
      ],
      criticalGapsToFill: [
        'Preventing overwatering through proper container drainage and aeration',
        'Balancing full-spectrum LED light distance and daily light cycles'
      ],
      recommendedStartingPhase: 1,
      diagnosticScore: isBeginner ? 65 : 82,
      whyCustomizedExplanation: `We tailored your roadmap to start with the top 3 easiest, highest-flavor culinary herbs (basil, thyme, mint) so you get quick wins in your first 14 days without frustration.`,
      addedCoursesReason: `We added 'Phase 1: Soil Mix, Drainage & Germination' to ensure your roots stay healthy and never rot.`,
      subtractedCoursesReason: `We cut out commercial 100-acre agricultural chemistry and synthetic pesticides because you're growing clean food indoors.`,
      recommendedCutList: [
        'Skip industrial commercial farming agronomy textbooks',
        'Avoid synthetic chemical pesticides for indoor culinary greens'
      ],
      phasesSummary: [
        {
          phaseNumber: 1,
          title: 'Phase 1: Container Setup, Soil Mix & Seed Germination',
          duration: 'Weeks 1-2',
          tangibleAsset: '4-Pot Indoor Herb Station with Sprouting Seedlings',
          whyThisOrder: 'Establishes healthy root drainage and strong initial sprouts.'
        },
        {
          phaseNumber: 2,
          title: 'Phase 2: Vegetative Growth, Lighting & Nutrient Feeding',
          duration: 'Weeks 3-4',
          tangibleAsset: 'Bushy, Thriving Herb Nursery with Full-Spectrum LED Schedule',
          whyThisOrder: 'Builds lush leaf volume using the established root systems.'
        },
        {
          phaseNumber: 3,
          title: 'Phase 3: Continuous Pruning, Propagation & Kitchen Harvest',
          duration: 'Weeks 5-6',
          tangibleAsset: 'Weekly Fresh Herb Harvests for Cooking + Rooted Cuttings',
          whyThisOrder: 'Teaches ongoing harvest methods so your plants produce for months.'
        }
      ]
    };
  }

  return {
    refinedTopic: topic,
    refinedDestination: `Complete a finished, real-world project and master the core foundations of ${topic}`,
    actualBaselineAssessment: isBeginner 
      ? `Enthusiastic autodidact starting from scratch; ready for a clear, step-by-step foundation with zero jargon.`
      : `Solid conceptual awareness; ready to fill specific execution gaps and build a polished project.`,
    masteredStrengths: [
      'High motivation and clear goal orientation',
      'Desire for practical hands-on results over passive theory'
    ],
    criticalGapsToFill: [
      'Step-by-step foundational workflow and starter setup',
      'Hands-on execution confidence and error troubleshooting'
    ],
    recommendedStartingPhase: 1,
    diagnosticScore: isBeginner ? 68 : 84,
    whyCustomizedExplanation: `We structured your roadmap so every single phase ends with a real, tangible project you can see and touch—ensuring you build real confidence at every step.`,
    addedCoursesReason: `We added Phase 1 foundational checkpoints to give you an easy, quick win in your first 2 weeks.`,
    subtractedCoursesReason: `We cut out dry theoretical lectures and confusing jargon so you spend 80% of your time actually building.`,
    recommendedCutList: [
      'Skip generic superficial video tutorials that talk without demonstrating practical steps',
      'Avoid passive reading marathons without hands-on practice'
    ],
    phasesSummary: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Core Foundations & First Working Prototype',
        duration: 'Weeks 1-2',
        tangibleAsset: 'First Working Prototype or Draft Deliverable',
        whyThisOrder: 'Validates your core understanding and gives you an immediate tangible win.'
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Core Execution & In-Depth Build',
        duration: 'Weeks 3-4',
        tangibleAsset: 'Complete Functional Milestone System',
        whyThisOrder: 'Expands your prototype into a robust, comprehensive system.'
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Polish, Launch & Real-World Results',
        duration: 'Weeks 5-6',
        tangibleAsset: 'Live Published Deliverable or Final Showcase',
        whyThisOrder: 'Brings your project to completion and shares it with real users.'
      }
    ]
  };
}

function getSimulatedSocraticTurn(
  concept: string,
  currentStage: string,
  studentInput?: string
): {
  tutorSpeech: string;
  stageName: string;
  tutorFeedbackOnStudent?: string;
  checkInQuestion: string;
  isConceptMastered: boolean;
} {
  if (!studentInput) {
    return {
      tutorSpeech: `Welcome to our live 1-on-1 Socratic session on **${concept}**! Let's start with first principles.\n\nImagine you are building a physical bridge. Before you pick what color to paint the railings, you must calculate the load-bearing stress points. In **${concept}**, the load-bearing stress point is our **state transition invariant**: every action must have an explicit verification check before moving to the next step.`,
      stageName: 'Level 1: Intuition & Invariants',
      checkInQuestion: `In your own words: If our system encounters an unexpected error from an external tool, what should happen to our state loop instead of crashing?`,
      isConceptMastered: false
    };
  }

  return {
    tutorSpeech: `🎯 **Excellent deduction!** You correctly identified that errors must be captured as **observations** in the context window so the system can self-correct.\n\nNow let's look at the mechanics: When writing the execution loop, we always establish a **hard recursion limit** (e.g. max 5 iterations) and validate the schema of incoming tool payloads. This prevents infinite loops and token blowouts.`,
    stageName: 'Level 2: Mechanics & Error Boundaries',
    tutorFeedbackOnStudent: `Strong first-principles reasoning! You grasped the error-as-observation paradigm immediately.`,
    checkInQuestion: `Now let's test a real scenario: If an upstream API returns HTTP 429 (Rate Limit), how would you structure the retry backoff without burning through your iteration ceiling?`,
    isConceptMastered: true
  };
}

function getSimulatedCurriculum(topic: string, destination: string, diagnostic?: DiagnosticAssessment): AdvisorData {
  const isAgent = topic.toLowerCase().includes('agent') || topic.toLowerCase().includes('autonomous');
  const isDigitalProduct = topic.toLowerCase().includes('digital product') || topic.toLowerCase().includes('saas');
  
  if (isDigitalProduct) {
    return {
      overview: `A tailored 6-week roadmap engineered to build, secure, and launch a commercial digital product with automated billing and customer onboarding.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Product Architecture, Database Schemas & Core Invariants',
          duration: 'Weeks 1-2',
          objective: 'Build the foundational database models, authentication, and core application loop.',
          tangibleAsset: 'Working local MVP with authenticated user state and database CRUD.',
          coreConcepts: ['Data Modeling & Relations', 'User Session Auth & JWTs', 'Core Application State Machine'],
          checkpoint: {
            id: 'cp-1',
            title: 'Functional Local MVP',
            description: 'Deploy local database with user login, protected routes, and core feature CRUD.',
            tangibleAsset: 'Working Local Fullstack Application',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Stripe Billing Integration & Webhook Security (Critical Gap-Filler)',
          duration: 'Weeks 3-4',
          objective: 'Implement end-to-end subscription billing with signature-verified webhooks.',
          tangibleAsset: 'Live Stripe Checkout flow with automated customer provisioning and tier limits.',
          coreConcepts: ['Stripe Checkout & Customer Portal', 'Webhook Signature Verification', 'Subscription Lifecycle State Management'],
          checkpoint: {
            id: 'cp-2',
            title: 'Stripe Billing & Webhook Engine',
            description: 'Execute test payments and verify that webhooks update user tiers idempotently.',
            tangibleAsset: 'Verified Stripe Webhook & Billing Engine',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Production Deployment, Landing Page & Customer Launch',
          duration: 'Weeks 5-6',
          objective: 'Deploy to live production domain, configure SEO/analytics, and onboard first 5 paying users.',
          tangibleAsset: 'Live deployed web application accepting real customer payments.',
          coreConcepts: ['Production Edge Deployment', 'Error Monitoring & Telemetry', 'High-Converting Onboarding Funnels'],
          checkpoint: {
            id: 'cp-3',
            title: 'Live Commercial Launch',
            description: 'Ship live on custom domain with working payment processing and onboarding tour.',
            tangibleAsset: 'Live Commercial Web App with Real Payments',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Premature Microservices & Kubernetes',
          reasonToSkip: 'Massive operational complexity with zero customer benefit at MVP stage.',
          alternativeFocus: 'Deploy on a modern serverless edge platform (e.g. Vercel, Supabase, Cloudflare).'
        },
        {
          id: 'cut-2',
          topic: 'Building Custom Auth from Scratch',
          reasonToSkip: 'Security risk and time sink.',
          alternativeFocus: 'Use battle-tested auth (NextAuth, Supabase Auth, Clerk).'
        }
      ],
      chatHistory: []
    };
  }
  return {
    overview: `A razor-sharp 8-week immersion roadmap engineered to take you from foundational concepts to building real-world proof-of-work in ${topic}.`,
    estimatedWeeks: 8,
    phases: [
      {
        id: `phase-1-${Date.now()}`,
        phaseNumber: 1,
        title: 'First-Principles Foundations & Mental Models',
        duration: 'Weeks 1-2',
        objective: 'Master the immutable primitives and mathematical/structural grammar of the field.',
        tangibleAsset: 'A 2-page first-principles architectural blueprint and validated problem brief.',
        coreConcepts: ['Core Primitives', 'System Constraints', 'Key Abstraction Layers'],
        checkpoint: {
          id: `cp-1`,
          title: 'Foundational Synthesis Document',
          description: 'Explain the core mechanics from zero assumptions in a 2-page first-principles brief.',
          tangibleAsset: '2-Page First-Principles Architectural Brief',
          completed: false
        },
        completed: false
      },
      {
        id: `phase-2-${Date.now()}`,
        phaseNumber: 2,
        title: 'Mechanics, Architectures & Edge-Case Dynamics',
        duration: 'Weeks 3-5',
        objective: 'Deconstruct real-world implementations and stress-test failure modes.',
        tangibleAsset: 'A functioning MVP prototype or verified system build deployed live.',
        coreConcepts: ['State Management & Flows', 'Bottlenecks & Optimization', 'Trade-off Analysis'],
        checkpoint: {
          id: `cp-2`,
          title: 'Working Prototype / Deconstructed Case Study',
          description: 'Build a functioning minimal viable implementation or complete a deep autopsy of a benchmark system.',
          tangibleAsset: 'Working Minimal Viable Prototype Deployed Live',
          completed: false
        },
        completed: false
      },
      {
        id: `phase-3-${Date.now()}`,
        phaseNumber: 3,
        title: 'Mastery Capstone & Novel Application',
        duration: 'Weeks 6-8',
        objective: `Achieve the target destination: "${destination}".`,
        tangibleAsset: 'A published public portfolio masterwork (open-source tool, live product, or published article).',
        coreConcepts: ['End-to-End Orchestration', 'Production Hardening', 'Original Synthesis'],
        checkpoint: {
          id: `cp-3`,
          title: 'Public Capstone Artifact',
          description: 'Publish a tangible, public asset (open-source tool, published essay, or interactive system).',
          tangibleAsset: 'Public Masterwork Artifact & Portfolio Showcase',
          completed: false
        },
        completed: false
      }
    ],
    cutList: [
      {
        id: 'cut-1',
        topic: 'Introductory YouTube "Tutorial Hell" & 10-hour generic video courses',
        reasonToSkip: 'Passive watching creates false competence without building cognitive retention or tactile muscle memory.',
        alternativeFocus: 'Read source documentation and implement minimal code/concept prototypes immediately.'
      },
      {
        id: 'cut-2',
        topic: 'Obsolete legacy toolchains and secondary hype frameworks',
        reasonToSkip: 'Distracts from fundamental architectural patterns that remain invariant across 20+ years.',
        alternativeFocus: 'Stick strictly to foundational invariants and canonical industry standards.'
      },
      {
        id: 'cut-3',
        topic: 'Memorizing syntax quirks and encyclopedic edge cases',
        reasonToSkip: 'AI agents and docs can query syntax in 2 seconds; understanding the architectural trade-offs is where human leverage lives.',
        alternativeFocus: 'High-level systems thinking and error-surface mapping.'
      }
    ],
    chatHistory: []
  };
}

function getSimulatedSources(topic: string): CuratedSource[] {
  return [
    {
      id: `src-1`,
      type: 'book',
      title: `The Canonical Reference on ${topic}`,
      authorOrCreator: 'Definitive Pioneer / Classic Authority',
      signalScore: 10,
      whyEssential: 'The seminal text that established the standard vocabulary and design patterns in this discipline.',
      keyTakeaway: 'Focus on invariant principles rather than transient implementations.',
      status: 'unread'
    },
    {
      id: `src-2`,
      type: 'paper',
      title: `Seminal Architecture Paper on ${topic}`,
      authorOrCreator: 'Top Research Institute / Lab',
      signalScore: 10,
      whyEssential: 'Groundbreaking paper that solved the critical scalability and correctness bottlenecks in the domain.',
      keyTakeaway: 'Simplicity and modular decoupling outperform complex optimizations.',
      status: 'unread'
    },
    {
      id: `src-3`,
      type: 'lecture',
      title: `MIT / Stanford Masterclass Deep Dive`,
      authorOrCreator: 'Distinguished Professor',
      signalScore: 9,
      whyEssential: 'Unpacks rigorous mathematical and conceptual foundations with zero marketing fluff.',
      keyTakeaway: 'Understanding boundary conditions is the key to deep intuition.',
      status: 'unread'
    }
  ];
}

function getSimulatedFeynman(concept: string, userExplanation: string): FeynmanSession {
  return {
    id: `feynman-${Date.now()}`,
    concept,
    userExplanation,
    clarityScore: 88,
    accuracyScore: 84,
    strengths: [
      'Strong, intuitive grasp of the core mechanism.',
      'Avoided unnecessary pseudo-technical buzzwords.'
    ],
    blindSpots: [
      'Slightly underspecified how the system handles failure or edge conditions.',
      'Could make the relationship between input state and final output more explicit.'
    ],
    simplifiedAnalogy: `Imagine a busy restaurant kitchen: instead of the chef running to every customer's table (monolithic bottleneck), waiters act as message queues passing tickets back and forth asynchronously.`,
    tutorFeedback: 'Outstanding explanation! To reach master-level clarity, challenge yourself to explain the exact failure boundary: what happens when the queue fills up?',
    date: new Date().toLocaleDateString()
  };
}

function getSimulatedQuiz(topic: string, specificFocus: string): DiagnosticQuiz {
  return {
    id: `quiz-${Date.now()}`,
    topic: specificFocus || topic,
    date: new Date().toLocaleDateString(),
    questions: [
      {
        id: 'q-1',
        question: `When designing a core component in ${specificFocus || topic}, what is the primary structural trade-off between latency and consistency?`,
        options: [
          'High throughput always guarantees instantaneous linearizable consistency.',
          'Under network partitioning, a distributed system must choose between availability and strict consistency.',
          'Consistency can be maintained with zero latency overhead using caching alone.',
          'Partition tolerance is optional in modern networks.'
        ],
        correctIndex: 1,
        explanation: 'According to first-principles systems theory (CAP theorem), any distributed state machine facing network partitions must balance immediate availability against linearizable consistency guarantees.'
      },
      {
        id: 'q-2',
        question: 'Which of the following represents a classic anti-pattern when applying first-principles reasoning to this domain?',
        options: [
          'Deconstructing problems to basic axioms and building upward.',
          'Premature optimization based on assumed bottlenecks rather than measured profiles.',
          'Separating state mutations from side-effect-free pure computations.',
          'Validating boundary edge cases before happy paths.'
        ],
        correctIndex: 1,
        explanation: 'Premature optimization creates unnecessary complexity without empirical evidence of necessity, violating simplicity principles.'
      }
    ]
  };
}

function getSimulatedCritique(draft: string, mode: string): EditorReview {
  return {
    id: `review-${Date.now()}`,
    title: draft.slice(0, 30) + '...',
    submittedDraft: draft,
    mode: mode as any,
    overallScore: 82,
    verdict: 'Compelling core argument, but relies on unproven implicit assumptions in paragraph 1 and contains slight phrasing redundancy.',
    strengths: [
      'Clear overarching thesis with high relevance.',
      'Energetic flow and direct voice.'
    ],
    logicFlaws: [
      'The transition between the problem premise and the proposed solution assumes causality where only correlation was shown.',
      'Lacks explicit boundary conditions: under what scenarios would this hypothesis fail?'
    ],
    counterarguments: [
      'A skeptic could argue that resource constraints in real-world scenarios make this ideal model impractical without compromise.'
    ],
    redlines: [
      {
        id: 'r-1',
        originalText: 'In order to really achieve success in this area...',
        improvedText: 'To succeed in this domain...',
        critiqueReason: 'Eliminates filler words and sharpens punch.'
      },
      {
        id: 'r-2',
        originalText: 'It is basically obvious that...',
        improvedText: 'First-principles evidence shows that...',
        critiqueReason: 'Replaces colloquial hand-waving with an empirical grounding statement.'
      }
    ],
    revisedVersion: `To succeed in this domain, we must anchor our system in proven first-principles. Rather than relying on surface-level heuristics, an intentional architecture decouples execution from orchestration, ensuring long-term resilience.`,
    date: new Date().toLocaleDateString()
  };
}

function getSimulatedCollision(topic: string, candidateDomain?: string): DomainCollision {
  const domain = candidateDomain || 'Evolutionary Biology';
  return {
    id: `collision-${Date.now()}`,
    collidingDomain: domain,
    provocativeThesis: `What if ${topic} behaves not like an engineered clockwork machine, but like a Darwinian adaptive ecosystem with selection pressures?`,
    connectionAnalysis: `When we view ${topic} through the lens of ${domain}, we realize that rigid static planning is fragile. Systems that survive are not the most rigidly optimized, but those with modular variation, rapid feedback loops, and redundancy against sudden environmental shifts.`,
    discussionStarters: [
      `How could we introduce "mutation and selection" into our learning or design process for ${topic}?`,
      `What are the invisible "energy constraints" that limit growth in ${topic}?`,
      `Where is our current model overly adapted to a past environment that no longer exists?`
    ]
  };
}

function getSimulatedPersonaResponse(
  persona: AlterPersona,
  journey: LearningJourney,
  userMessage: string
): string {
  switch (persona) {
    case 'advisor':
      return `🎓 **Advisor**: You're focusing on the right direction for **${journey.topic}**. Regarding "${userMessage}": let's map this directly to your target destination (*${journey.destination}*). Remember our **Cut List** — don't get sidetracked by secondary details right now. What is the single highest-leverage deliverable you can build today?`;
    case 'librarian':
      return `📚 **Librarian**: When researching "${userMessage}", 90% of search results will be low-signal tutorials. Instead, focus on the seminal primary documentation and core architectural papers. Would you like me to synthesize the 3 core mental models underlying this concept?`;
    case 'tutor':
      return `💡 **Tutor**: Interesting thought on "${userMessage}"! Let's test your intuition before I explain further: *If you had to explain this concept to someone with zero technical background using only an analogy from everyday life, how would you describe it?*`;
    case 'editor':
      return `✍️ **Editor**: Let's pressure-test your statement. You mentioned: "${userMessage}". While the sentiment is clear, what is the hidden assumption here? If a harsh critic argued the exact opposite, what undeniable evidence would you use to defend your stance?`;
    case 'roommate':
      return `🛋️ **Roommate**: Dude, you know what that reminds me of? That is EXACTLY like how slime molds optimize Tokyo's railway network! If we treat "${userMessage}" not as a static problem, but as an emergent network, how does that completely flip the solution on its head?`;
  }
}

function getSimulatedLesson(topic: string, concept: string): any {
  const isTech = topic.toLowerCase().includes('agent') ||
    topic.toLowerCase().includes('code') ||
    topic.toLowerCase().includes('program') ||
    topic.toLowerCase().includes('software') ||
    topic.toLowerCase().includes('python') ||
    topic.toLowerCase().includes('rust') ||
    topic.toLowerCase().includes('electron') ||
    topic.toLowerCase().includes('system') ||
    topic.toLowerCase().includes('saas') ||
    topic.toLowerCase().includes('data') ||
    topic.toLowerCase().includes('ai');

  if (!isTech) {
    return {
      id: `lesson-${Date.now()}`,
      concept,
      lessonTitle: `Masterclass: ${concept} (Step-by-Step Blueprint)`,
      estimatedReadTime: '8 min masterclass',
      plainEnglishAnalogy: `Think of ${concept} like preparing a recipe or laying a foundation. If you rush ahead to the final presentation before getting the core ingredients and timing right, the final result will fall flat.`,
      whyNovicesGetConfused: `Most beginners try to jump straight to complicated techniques or expensive gear before understanding the basic, reliable step-by-step process.`,
      laymanExplanation: `To master **${concept}** in **${topic}**, you must focus on the essential principles that produce 80% of the results.\n\nEvery successful execution follows three simple steps: **Preparation & Setup**, **Clear Execution**, and **Verification & Fine-Tuning**. By sticking to this structure, you avoid overwhelm and build real, lasting competence.`,
      architecturalDiagramOrFlow: `┌───────────────────────────────────────────────────────────┐
│              STEP-BY-STEP EXECUTION FLOW: ${concept.toUpperCase()}
│
│   1. [ PREPARATION ]: Setup Workspace & Gather Essentials
│            │
│            ▼
│   2. [ CORE EXECUTION ]: Carry Out the Primary Action
│            │
│            ▼
│   3. [ VERIFICATION ]: Check Quality Against Target Standard
│            │
│            ▼
│   4. [ REFINEMENT ]: Adjust & Document Key Takeaways
└───────────────────────────────────────────────────────────┘`,
      mechanicsMarkdown: `### The 3 Core Pillars of ${concept}

#### 1. Clear Preparation
Before starting, ensure all prerequisites and conditions are met. Rushing the setup is the #1 cause of beginner frustration.

#### 2. Deliberate Execution
Follow the proven steps methodically. Do not attempt advanced shortcuts until the standard routine becomes second nature.

#### 3. Continuous Feedback
Observe the results of each step immediately. Catching small variations early prevents major errors later.`,
      corePrimitives: [
        {
          name: 'Preparation Protocol',
          role: 'Ensures optimal initial conditions and materials',
          explanation: 'Eliminates friction before execution begins and guarantees repeatable results.'
        },
        {
          name: 'Core Action Step',
          role: 'The primary value-generating action',
          explanation: 'Focuses energy strictly on high-impact execution rather than unnecessary distractions.'
        },
        {
          name: 'Quality Verification',
          role: 'Inspects and validates the output',
          explanation: 'Provides immediate feedback so you can course-correct before moving forward.'
        }
      ],
      implementationGuide: [
        'Step 1: Set up your workspace and organize your core materials.',
        'Step 2: Follow the foundational protocol step-by-step without skipping ahead.',
        'Step 3: Perform an immediate quality check against the target outcome.',
        'Step 4: Troubleshoot any minor discrepancies using the checklist below.',
        'Step 5: Record your observations to build consistency.'
      ],
      codeOrTemplate: `### Practical Execution Sheet & Action Checklist: ${concept}

1. Objective:
   - Primary Goal: Master the essential practical deliverable for ${concept}.
   - Success Metric: Tangible output ready for verification.

2. Step-by-Step Action Steps:
   [ ] Step 1: Complete setup & verify conditions
   [ ] Step 2: Execute core process according to instructions
   [ ] Step 3: Run quality review against standards
   [ ] Step 4: Refine and record final output

3. Troubleshooting & Notes:
   - If output differs from expectations, review step 1 setup conditions first.
   - Keep notes on what worked best for future repetitions.`,
      howMastersUseIt: `World-class practitioners focus obsessively on mastering the fundamentals with consistent discipline rather than relying on gimmicks.`,
      commonPitfalls: [
        'Rushing the Setup: Skipping preparation steps in an effort to finish quickly.',
        'Overcomplicating: Adding unnecessary complexity before mastering the baseline protocol.',
        'Ignoring Feedback: Failing to inspect work after each step.'
      ],
      cutListFluff: `Skip generic lifestyle blogs and theoretical manuals that add unnecessary fluff without actionable steps.`,
      coreExplanation: `Comprehensive, practical masterclass on ${concept}.`,
      keyTakeaways: [
        `1. Preparation dictates 80% of your final quality.`,
        `2. Keep the process simple and repeatable before adding variations.`,
        `3. Verify each step before moving on to the next.`
      ],
      socraticChallenge: `If unexpected conditions arise during your execution of ${concept}, what is the first check you should perform to get back on track?`,
      practiceTask: `Complete the action checklist above and write your 1-paragraph summary in the scratchpad to review with the Editor.`,
      mastered: false,
      createdAt: new Date().toLocaleDateString()
    };
  }

  return {
    id: `lesson-${Date.now()}`,
    concept,
    lessonTitle: `Masterclass: ${concept} (Zero-to-Hero)`,
    estimatedReadTime: '8 min masterclass',
    plainEnglishAnalogy: `Think of ${concept} like a load-bearing foundation in civil engineering. If you focus only on interior decoration (surface tricks) before the foundation is poured, the entire structure collapses under real-world load.`,
    whyNovicesGetConfused: `Most beginners try to memorize framework syntax or copy-paste high-level wrappers before understanding the underlying state machine, control flow, and error-recovery boundaries.`,
    laymanExplanation: `To master **${concept}** in **${topic}**, you must decouple the immutable core principles from transient library code.\n\nEvery production system boils down to three sequential phases: **State Perception**, **Deterministic Action Selection**, and **Closed-Loop Feedback Integration**. When you master this cycle, you can build original architectures without getting trapped in tutorial hell.`,
    architecturalDiagramOrFlow: `┌───────────────────────────────────────────────────────────┐
│              FIRST-PRINCIPLES CYCLE OF ${concept.toUpperCase()}
│
│   1. [ INPUT STATE ]: Incoming goal payload + Context
│            │
│            ▼
│   2. [ EVALUATE ]: Rules & Schema Verification
│            │
│            ▼
│   3. [ EXECUTE ]: Deterministic Action Vector
│            │
│            ▼
│   4. [ OBSERVE ]: Environment Feedback / Error Intercept
│            │
│            ▼
│   5. [ RECOVER / FINISH ]: State Update & Next Iteration
└───────────────────────────────────────────────────────────┘`,
    mechanicsMarkdown: `### Under the Hood: The 3 Core Pillars of ${concept}

#### 1. Explicit State Transitions
State must never be implicitly hidden inside callback closures. Maintain an immutable event log so every decision can be inspected, replayed, and debugged.

#### 2. Exception & Error Isolation
External environments fail constantly (rate limits, network timeouts, invalid JSON). A master architecture intercepts every error and feeds it back into the decision loop rather than crashing.

#### 3. Bounded Recursion & Safeguards
Always enforce a strict iteration ceiling (e.g. \`maxSteps = 5\`) and schema validation to guarantee the system terminates safely.`,
    corePrimitives: [
      {
        name: 'Controller / State Engine',
        role: 'Directs the active execution cycle and transition conditions',
        explanation: 'Maintains running history and determines whether the objective has been achieved or requires another step.'
      },
      {
        name: 'Execution Vector (Tool/Action)',
        role: 'Executes side-effects and interfaces with reality',
        explanation: 'Enforces timeout limits, authentication headers, and schema validation before touching external systems.'
      },
      {
        name: 'Feedback Interceptor',
        role: 'Catches and structures environmental responses',
        explanation: 'Formats raw stdout, API status codes, and error traces into clean observations for subsequent cycles.'
      }
    ],
    implementationGuide: [
      'Step 1: Define explicit TypeScript interfaces for State, Action, and Observation.',
      'Step 2: Build a deterministic for-loop with a hard max-iteration ceiling.',
      'Step 3: Implement tool calling with schema validation.',
      'Step 4: Catch exceptions and route error messages back into the observation log.',
      'Step 5: Write unit tests verifying recovery from 404 and 500 error scenarios.'
    ],
    codeOrTemplate: `// Production Implementation Blueprint: ${concept}
export interface SystemState {
  task: string;
  stepCount: number;
  history: Array<{ action: string; result: string }>;
  isComplete: boolean;
}

export async function executeMasteryLoop(task: string, maxSteps = 5): Promise<string> {
  const state: SystemState = { task, stepCount: 0, history: [], isComplete: false };
  
  while (state.stepCount < maxSteps && !state.isComplete) {
    state.stepCount++;
    
    // 1. Determine next action
    const nextAction = await planStep(state);
    if (nextAction.type === 'COMPLETE') {
      state.isComplete = true;
      return nextAction.output;
    }
    
    // 2. Execute safely with error boundary
    try {
      const output = await executeAction(nextAction);
      state.history.push({ action: nextAction.name, result: output });
    } catch (err: any) {
      state.history.push({ action: nextAction.name, result: \`Exception: \${err.message}\` });
    }
  }
  
  return \`Completed \${state.stepCount} steps with final state verified.\`;
}`,
    howMastersUseIt: `Top 1% engineers avoid heavy magic abstractions; they write clean, deterministic loops with explicit observability and comprehensive error handling.`,
    commonPitfalls: [
      'Infinite Loops: Forgetting to decrement counters or set a hard iteration boundary.',
      'Unchecked Context Accumulation: Passing multi-megabyte payloads directly into the prompt buffer.',
      'Silent Failures: Swallowing catch block errors instead of providing them to the decision engine.'
    ],
    cutListFluff: `Skip superficial tutorials that hide the loop behind black-box framework wrappers without teaching fundamental state handling.`,
    coreExplanation: `Comprehensive first-principles masterclass on ${concept}.`,
    keyTakeaways: [
      `1. Explicit state transitions beat opaque prompts every single time.`,
      `2. Errors from external tools must be treated as valuable observation state for self-healing.`,
      `3. Always bound iterations and enforce strict schema boundaries.`
    ],
    socraticChallenge: `Imagine you deployed this ${concept} architecture in production and an upstream service suddenly returns HTTP 429 Rate Limits. How would you design the loop to handle backoff and jitter without blowing through your maximum step budget?`,
    practiceTask: `Write a 20-line working prototype of this loop in the scratchpad below and click "Send to Editor" for redline review.`,
    mastered: false,
    createdAt: new Date().toLocaleDateString()
  };
}

function getSimulatedSourceDeepDive(sourceTitle: string, author: string, topic: string): any {
  const isReAct = sourceTitle.toLowerCase().includes('react') || sourceTitle.toLowerCase().includes('reasoning');

  if (isReAct) {
    return {
      id: `dive-${Date.now()}`,
      sourceTitle: "ReAct: Synergizing Reasoning and Acting in Language Models",
      author: "Shunyu Yao et al. (Princeton & Google Brain)",
      topic: topic || "Autonomous AI Agents",
      estimatedTime: "8 min masterclass",
      bigIdea: "AI models fail when they only reason (hallucinations) or only act (mindless execution). ReAct interleaves internal reasoning traces ('Thoughts') with external tool execution ('Actions') and sensory feedback ('Observations') to create self-correcting autonomous agents.",
      topMentalModels: [
        {
          model: "The Thought-Action-Observation Triad",
          explanation: "Never execute an action without first explaining WHY (Thought), and never take a second action without first inspecting what the previous action returned (Observation)."
        },
        {
          model: "Working Memory as Context Accumulation",
          explanation: "The agent's state isn't hidden in black-box weights; it is an open transcript where past errors become visible clues for the next step."
        },
        {
          model: "Reality-Grounded Error Recovery",
          explanation: "When a tool throws an error (e.g. 404 or syntax bug), a ReAct agent treats the error message as an Observation, reasons about what went wrong, and tries an alternative path."
        }
      ],
      practicalApplication: "Use ReAct to build agents that connect to real APIs, SQL databases, and search engines with guaranteed error recovery loops instead of one-shot prompt guessing.",
      cutListFluff: "You can safely skip Section 4's academic HotpotQA and ALFWorld benchmark comparison tables unless you are publishing a research paper.",
      
      // Level 0: Plain-English Intuition
      plainEnglishIntuition: {
        coreMetaphor: "Imagine trying to solve a complex murder mystery completely with your eyes closed and zero notes vs. having a detective's evidence board. If you do it in your head, you forget details and invent false memories. ReAct gives the AI that evidence board: it thinks ('Thought: I need to check the suspect's alibi'), walks over to check the phone logs ('Action: QueryDatabase'), reads what was found ('Observation: Call made at 9 PM'), and updates its theory ('Thought: Alibi is broken, let's arrest!') until the case is solved.",
        whyNovicesGetConfused: "Most beginners think AI agents just need longer prompts or bigger models. But pure thinking (Chain-of-Thought) is blind to live data, and pure tool-calling (Function Calling) has no multi-step strategy. ReAct binds them into an interleaved loop.",
        laymanExplanation: "Before ReAct was introduced in late 2022, AI systems suffered from two massive failure modes:\n\n1. **The Hallucination Trap (Pure Reasoning)**: The AI thought deeply in a closed bubble, but because it had no live connection to reality, when it hit a missing fact, it confidently fabricated plausible lies.\n\n2. **The Mindless Execution Trap (Pure Acting)**: The AI executed API calls or search queries without strategic reasoning, getting trapped in dumb repetitive loops when an error occurred.\n\nReAct's paradigm shift was dead simple: **Alternate between thinking and doing.** The AI writes an explicit thought, runs one action, reads the environment's observation, and uses that observation to formulate its next thought."
      },

      // Level 1: First-Principles Mechanics & Under-the-Hood
      mechanicsAndAnatomy: {
        architecturalDiagramOrFlow: `┌────────────────────────────────────────────────────────────┐
│                    THE REACT ENGINE LOOP                   │
│                                                            │
│   1. [ USER GOAL ]: "Find current price of stock ABC"      │
│                │                                           │
│                ▼                                           │
│   2. [ THOUGHT 1 ]: "I need to query the market API"       │
│                │                                           │
│                ▼                                           │
│   3. [ ACTION 1 ]: SearchTicker["ABC"]                     │
│                │                                           │
│                ▼                                           │
│   4. [ OBSERVATION 1 ]: "Ticker ABC = $142.50 (+3.2%)"     │
│                │                                           │
│                ▼                                           │
│   5. [ THOUGHT 2 ]: "I have the verified price."           │
│                │                                           │
│                ▼                                           │
│   6. [ FINISH ]: "ABC is currently trading at $142.50."    │
└────────────────────────────────────────────────────────────┘`,
        deepExplanationMarkdown: "### Under the Hood: The 4 Core Invariants of ReAct\n\n#### 1. Stop Tokens & Control Handoff\nThe LLM is prompted to generate text only up to the 'Action:' line. Once it outputs the action name and arguments, the system halts LLM generation, parses the action, executes it in a sandbox (Python/API), and appends the result as 'Observation:'.\n\n#### 2. Dynamic Working Memory\nThe LLM context window acts as the dynamic blackboard. Every step accumulates Thought 1, Action 1, Observation 1, Thought 2...\n\n#### 3. Self-Correction on Exceptions\nIf Action 1 returns an error (e.g. Observation 1: API Error 401 Unauthorized), the model sees that failure in its history, generates Thought 2: The API token failed, let me fall back to web scraping, and gracefully recovers.",
        corePrimitives: [
          {
            name: "Thought (Reasoning Trace)",
            role: "Decomposes sub-goals and plans next step",
            explanation: "Allows the model to reflect, track what has been accomplished so far, and determine which tool is best suited."
          },
          {
            name: "Action (Execution Vector)",
            role: "Interacts with the external environment",
            explanation: "Specifies the exact tool name and parameter payload to execute in the host environment."
          },
          {
            name: "Observation (Reality Anchor)",
            role: "Captures environment feedback",
            explanation: "Raw strings, API payloads, or errors returned by tools and injected back into the prompt context."
          }
        ]
      },

      // Level 2: Tactical Code Implementation
      implementationBlueprint: {
        stepByStepGuide: [
          "Step 1: Write a System Prompt declaring available tools with JSON/regex parameter schemas.",
          "Step 2: Initialize an empty history transcript with the user prompt.",
          "Step 3: Call the LLM with stop token set to ['Observation:', '\\nObservation'].",
          "Step 4: Parse the 'Action: ToolName[Args]' string and invoke your local Python/JS tool function.",
          "Step 5: Append 'Observation: <result>' to the transcript and loop until 'Action: Finish[...]'"
        ],
        codeOrTemplate: `# Minimal 30-Line ReAct Agent in Python
import re

TOOLS = {
    "Search": lambda q: f"Result for {q}: Founded in 1976 by Steve Jobs.",
    "Calculate": lambda expr: str(eval(expr))
}

SYSTEM_PROMPT = """Answer questions using Thought, Action, Observation steps.
Available Tools:
- Search[query]
- Calculate[expression]
- Finish[final answer]
"""

def run_react_agent(query, llm_fn, max_steps=5):
    transcript = f"{SYSTEM_PROMPT}\\nQuestion: {query}\\n"
    
    for step in range(max_steps):
        response = llm_fn(transcript, stop=["Observation:"])
        transcript += response + "\\n"
        
        # Check for completion
        if "Finish[" in response:
            return re.search(r"Finish\\[(.*)\\]", response).group(1)
            
        # Parse Action
        match = re.search(r"Action:\\s*(\\w+)\\[(.*)\\]", response)
        if match:
            tool_name, tool_arg = match.groups()
            tool_fn = TOOLS.get(tool_name, lambda x: "Error: Tool not found")
            obs = tool_fn(tool_arg)
            transcript += f"Observation: {obs}\\n"
            
    return "Error: Max steps exceeded."`,
        howMastersUseIt: "Top production frameworks (LangGraph, Google Antigravity SDK, CrewAI) use typed Pydantic models for Actions and apply Context Compression to prevent Observation token bloat."
      },

      // Level 3: Traps & Cut-List
      trapsAndCutList: {
        commonPitfalls: [
          "1. Infinite Action Loops: The agent repeats the exact same failed tool query over and over. Fix: Add cycle-detection and inject a warning thought.",
          "2. Context Window Exhaustion: Injecting 20,000-word raw JSON responses into Observation. Fix: Truncate or summarize all tool outputs to under 500 tokens before feeding back.",
          "3. Lack of Fallback Paths: If the LLM generates a malformed action syntax, the parser crashes. Fix: Return a syntax correction error inside the Observation so the agent fixes its formatting."
        ],
        cutListFluff: "Ignore academic benchmark tables and synthetic QA dataset evaluations in Section 4. Focus 100% on the core loop algorithm in Section 3."
      },

      // Level 4: Socratic Sparring Check
      socraticSparring: {
        realWorldScenario: "You are deploying an autonomous ReAct assistant for an e-commerce platform. A user asks: 'Where is my order #9921 and can you expedite delivery to tomorrow?'",
        challengeQuestion: "Write out the exact Thought 1 -> Action 1 -> Observation 1 -> Thought 2 -> Action 2 sequence your agent should generate to safely check the warehouse tracking system and policy rules before promising expedited delivery.",
        sampleStrongAnswer: "Thought 1: I need to query the order tracking database for order #9921 to find its current status and carrier.\\nAction 1: LookupOrder[9921]\\nObservation 1: Order #9921 is in transit via FedEx Ground, scheduled for Friday. Expedited air upgrade is eligible for $15.\\nThought 2: The order is eligible for upgrade, but it incurs a $15 fee. I must not charge the user automatically without confirmation. I will explain the status and ask for confirmation.\\nAction 2: Finish[Your order #9921 is currently in transit for Friday delivery. We can expedite it to tomorrow for a $15 fee. Would you like me to process this upgrade?]"
      }
    };
  }

  // General Zero-to-Hero Masterclass Fallback
  return {
    id: `dive-${Date.now()}`,
    sourceTitle,
    author,
    topic: topic || "First-Principles Mastery",
    estimatedTime: "7 min masterclass",
    bigIdea: `The central premise of "${sourceTitle}" is that mastery in ${topic} comes from understanding foundational system dynamics rather than memorizing transient rules.`,
    topMentalModels: [
      {
        model: "First-Principles Deconstruction",
        explanation: "Break down complex problems into basic truths that cannot be deduced any further, then build reasoned solutions upward."
      },
      {
        model: "Signal vs. Noise Filtering",
        explanation: "Ignore 90% of surface chatter and focus exclusively on the 10% of variables that determine 90% of outcomes."
      },
      {
        model: "Antifragile Feedback Loops",
        explanation: "Design your learning and execution so that unexpected errors make your understanding stronger rather than shattering your progress."
      }
    ],
    practicalApplication: `Apply these insights by building minimal testable prototypes in ${topic} every week, ruthlessly cutting low-signal tutorials.`,
    cutListFluff: `You can safely skip the introductory historical anecdotes in Chapters 1-2 and the outdated appendix case studies.`,
    
    plainEnglishIntuition: {
      coreMetaphor: `Think of ${sourceTitle} like the structural skeleton of a skyscraper: if you only focus on the paint and windows (surface tricks) before the steel beams are bolted, the whole building collapses under stress.`,
      whyNovicesGetConfused: "Novices try to memorize every specific rule rather than grasping the single constraint that governs all of them.",
      laymanExplanation: `To truly master the lessons of ${sourceTitle}, you don't need encyclopedic memorization. You need to understand the fundamental tension: how to trade off speed, certainty, and resources to achieve a reliable outcome in ${topic}.`
    },
    mechanicsAndAnatomy: {
      architecturalDiagramOrFlow: `[ Clear Starter Goal ] ──► [ Practical Execution ] ──► [ Quality Check ] ──► [ Refinement & Result ]`,
      deepExplanationMarkdown: `### The Core Anatomy of ${sourceTitle}\n\n1. **The Core Pillar**: Every field has 1-2 essential foundations that dictate 80% of real-world results.\n2. **The Feedback Loop**: Master practitioners construct tight routines where mistakes are caught immediately.\n3. **De-risking Assumptions**: Systematically test your understanding with real practice rather than passive reading.`,
      corePrimitives: [
        { name: "Pillar 1: Core Foundation", role: "Essential Basis", explanation: "Defines the fundamental rules and baseline setup." },
        { name: "Pillar 2: Action Engine", role: "Primary Execution", explanation: "Transforms plans into tangible, verified deliverables." },
        { name: "Pillar 3: Feedback Loop", role: "Quality Guardrail", explanation: "Catches mistakes early before they compound." }
      ]
    },
    implementationBlueprint: {
      stepByStepGuide: [
        "Step 1: Isolate your immediate goal into a single clear milestone.",
        "Step 2: Build the minimal working prototype, outline, or draft in under 2 hours.",
        "Step 3: Test your output against real-world standards.",
        "Step 4: Refine and polish only after the baseline works reliably."
      ],
      codeOrTemplate: `### Practical Execution Blueprint for ${sourceTitle}

1. Action Plan:
   - Primary Goal: Deliver the core milestone for ${topic}.
   - Standard: Clean, tested, and verified.

2. Step-by-Step Execution:
   [ ] Step 1: Set up core parameters and requirements
   [ ] Step 2: Carry out primary execution flow
   [ ] Step 3: Verify output against quality criteria
   [ ] Step 4: Polish deliverable and document learnings`,
      howMastersUseIt: "Top practitioners apply this by ruthlessly prioritizing the core value deliverable before getting distracted by non-essential polish."
    },
    trapsAndCutList: {
      commonPitfalls: [
        "Premature polish: Spending hours on styling or decoration before the core function works.",
        "Tutorial overwhelm: Reading 10 variations of the same advice instead of building one tangible project."
      ],
      cutListFluff: "Skip generic introductory fluff and outdated case studies that add no direct execution value."
    },
    socraticSparring: {
      realWorldScenario: `You are working on a project in ${topic} with a tight timeline and unexpected challenges.`,
      challengeQuestion: `How would you apply the primary lesson of "${sourceTitle}" to decide what 80% of non-essential tasks to cut while guaranteeing your final deliverable succeeds?`,
      sampleStrongAnswer: "Identify the single highest-value action that directly creates tangible progress and cut all secondary distractions until the core outcome is proven."
    }
  };
}

function getSimulatedStuckTriage(topic: string, blockerType: string, blockerDetails: string): StuckTriageResult {
  return {
    id: `triage-${Date.now()}`,
    blockerSummary: `You are facing ${blockerType.toLowerCase().replace(/_/g, ' ')} in ${topic}: feeling friction on "${blockerDetails.slice(0, 40) || 'next step'}".`,
    microAction5Min: `Set a timer for 5 minutes. Do NOT try to build the whole feature. Just open a blank scratch file and write the 3 plain-English bullet points of what your function/deliverable should return.`,
    starterScaffold: `// 5-Minute Minimal Scaffold for ${topic}
// Step 1: Input variable
const projectInput = "Core deliverable draft";

// Step 2: Simplest possible execution
function executeMinimalPass() {
  console.log("Momentum restored: shipping step 1 of ${topic}");
  return { status: "progressing", readyForNext: true };
}

executeMinimalPass();`,
    complexityReductionCut: `Cut out all edge-case error handling, responsiveness polish, and secondary features. Get the simplest happy path working first.`,
    mindsetReframing: `Remember: Done is infinitely better than perfect. A messy working draft gives you something to refine; a blank page gives you nothing.`,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
