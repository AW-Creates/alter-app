import { SYSTEM_PROMPTS, GENERATOR_PROMPTS } from './prompts';
import {
  AdvisorData,
  CuratedSource,
  DiagnosticQuiz,
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
  depth: string
): Promise<AdvisorData> {
  const apiKey = getStoredApiKey();
  const perplexityKey = getStoredPerplexityKey();

  if (!apiKey && !perplexityKey) {
    await new Promise((r) => setTimeout(r, 1000));
    return getSimulatedCurriculum(topic, destination);
  }

  const prompt = GENERATOR_PROMPTS.generateCurriculum(topic, destination, baseline, hoursPerWeek, depth);
  
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

// ----------------------------------------------------
// Simulation Engines (for offline / instant demo mode)
// ----------------------------------------------------

function getSimulatedCurriculum(topic: string, destination: string): AdvisorData {
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
│   2. [ EVALUATE ]: Invariants & Schema Verification
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
    mechanicsMarkdown: `### Under the Hood: The 3 Non-Negotiable Invariants of ${concept}

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
      architecturalDiagramOrFlow: `[ Objective / Constraint ] ──► [ First-Principles Analysis ] ──► [ Tactical Execution ] ──► [ Error Verification ]`,
      deepExplanationMarkdown: `### The Deep Anatomy of ${sourceTitle}\n\n1. **The Invariant Primitive**: Every system has 1-2 core variables that dictate 80% of its performance.\n2. **The Feedback Mechanism**: High performers construct tight loops where mistakes are caught within minutes rather than weeks.\n3. **De-risking Assumptions**: Systematically isolate what you don't know and run lightweight stress-tests.`,
      corePrimitives: [
        { name: "Primitive 1: Core Constraint", role: "Boundary Condition", explanation: "Defines the physical or logical limit of what is possible." },
        { name: "Primitive 2: Execution Engine", role: "Workhorse", explanation: "Transforms inputs into verifiable deliverables." },
        { name: "Primitive 3: Error Loop", role: "Quality Guardrail", explanation: "Catches failure modes before they propagate downstream." }
      ]
    },
    implementationBlueprint: {
      stepByStepGuide: [
        "Step 1: Isolate the core problem statement into a single testable sentence.",
        "Step 2: Build the minimal viable prototype or thesis in under 2 hours.",
        "Step 3: Pressure-test your output against extreme edge cases.",
        "Step 4: Refactor and optimize only after the baseline works flawlessly."
      ],
      codeOrTemplate: `// Tactical Execution Blueprint for ${sourceTitle}\nfunction executeStrategy(inputData) {\n  const baseline = validatePrimitives(inputData);\n  const output = runCorePipeline(baseline);\n  return verifyIntegrity(output);\n}`,
      howMastersUseIt: "Top 1% practitioners apply this by ruthlessly prioritizing the bottleneck constraint before optimizing non-essential parts."
    },
    trapsAndCutList: {
      commonPitfalls: [
        "Premature optimization: Trying to solve edge cases before the basic flow works.",
        "Tutorial hell: Reading 10 variations of the same advice instead of building one working artifact."
      ],
      cutListFluff: "Skip the generic motivational preamble in Chapter 1 and the outdated case studies in the appendix."
    },
    socraticSparring: {
      realWorldScenario: `You are leading a project in ${topic} with a tight deadline and unexpected setbacks.`,
      challengeQuestion: `How would you apply the primary mental model of "${sourceTitle}" to decide what 80% of tasks to immediately cut while guaranteeing the final deliverable succeeds?`,
      sampleStrongAnswer: "Identify the critical path invariant that directly delivers value to the end user and eliminate all secondary polish until the core loop is validated."
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
