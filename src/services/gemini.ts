import { SYSTEM_PROMPTS, GENERATOR_PROMPTS } from './prompts';
import {
  AdvisorData,
  CuratedSource,
  DiagnosticQuiz,
  DomainCollision,
  EditorReview,
  FeynmanSession,
  LearningJourney,
  AlterPersona
} from '../types/alter';
import { queryGroundedAI, getStoredPerplexityKey } from './grounding';

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

  if (!apiKey) {
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
        coreConcepts: ['Core Primitives', 'System Constraints', 'Key Abstraction Layers'],
        checkpoint: {
          id: `cp-1`,
          title: 'Foundational Synthesis Document',
          description: 'Explain the core mechanics from zero assumptions in a 2-page first-principles brief.',
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
        coreConcepts: ['State Management & Flows', 'Bottlenecks & Optimization', 'Trade-off Analysis'],
        checkpoint: {
          id: `cp-2`,
          title: 'Working Prototype / Deconstructed Case Study',
          description: 'Build a functioning minimal viable implementation or complete a deep autopsy of a benchmark system.',
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
        coreConcepts: ['End-to-End Orchestration', 'Production Hardening', 'Original Synthesis'],
        checkpoint: {
          id: `cp-3`,
          title: 'Public Capstone Artifact',
          description: 'Publish a tangible, public asset (open-source tool, published essay, or interactive system).',
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
