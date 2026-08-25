export type AlterPersona = 'advisor' | 'librarian' | 'tutor' | 'editor' | 'roommate';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  persona?: AlterPersona;
  content: string;
  timestamp: string;
}

export interface CutListItem {
  id: string;
  topic: string;
  reasonToSkip: string;
  alternativeFocus: string;
}

export interface CheckpointProject {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface CurriculumPhase {
  id: string;
  phaseNumber: number;
  title: string;
  duration: string;
  objective: string;
  coreConcepts: string[];
  checkpoint: CheckpointProject;
  completed: boolean;
}

export interface AdvisorData {
  overview: string;
  estimatedWeeks: number;
  phases: CurriculumPhase[];
  cutList: CutListItem[];
  chatHistory: ChatMessage[];
}

export type ReadingStatus = 'unread' | 'reading' | 'mastered' | 'in_progress';

export interface CuratedSource {
  id: string;
  type: 'book' | 'paper' | 'lecture' | 'doc' | 'case_study' | 'podcast';
  title: string;
  authorOrCreator: string;
  url?: string;
  signalScore: number; // 1-10
  whyEssential: string;
  keyTakeaway: string;
  status: ReadingStatus;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sourceReferences?: string[];
  createdAt: string;
}

export interface ConceptCard {
  id: string;
  front?: string;
  back?: string;
  term?: string;
  definition?: string;
  mentalModel?: string;
  pitfall?: string;
}

export interface LibrarianData {
  sources: CuratedSource[];
  groundedNotes?: VaultNote[];
  vaultNotes?: VaultNote[];
  flashcards?: ConceptCard[];
  conceptCards?: ConceptCard[];
  chatHistory: ChatMessage[];
}

export interface FeynmanEvaluation {
  clarityScore: number;
  accuracyScore: number;
  strengths: string[];
  blindSpots: string[];
  simplifiedAnalogy: string;
  tutorFeedback: string;
}

export interface FeynmanSession extends FeynmanEvaluation {
  id: string;
  concept: string;
  userExplanation: string;
  date: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
}

export interface DiagnosticQuiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  score?: number;
  date: string;
}

export interface TutorData {
  chatHistory: ChatMessage[];
  feynmanSessions: FeynmanSession[];
  quizzes: DiagnosticQuiz[];
}

export interface RedlineEdit {
  id?: string;
  originalText: string;
  improvedText: string;
  critiqueReason: string;
}

export interface TextCritique {
  overallScore: number; // 0-100
  verdict: string;
  strengths: string[];
  logicFlaws: string[];
  counterarguments: string[];
  redlines: RedlineEdit[];
  revisedVersion: string;
}

export interface EditorReview extends TextCritique {
  id: string;
  title: string;
  submittedDraft: string;
  mode: 'logic' | 'clarity' | 'steelman' | 'first_principles';
  date: string;
}

export interface EditorData {
  reviews: EditorReview[];
  chatHistory: ChatMessage[];
}

export interface DomainCollision {
  id: string;
  collidingDomain: string; // e.g. "Evolutionary Biology"
  provocativeThesis: string;
  connectionAnalysis: string;
  discussionStarters: string[];
}

export interface RoommateData {
  chatHistory: ChatMessage[];
  collisions: DomainCollision[];
  personaVibe: 'curious_nerd' | 'contrarian_philosopher' | 'hyper_pragmatist' | 'future_visionary';
}

export interface LearningJourney {
  id: string;
  title: string;
  topic: string;
  destination: string; // Target outcome / mastery goal
  baseline: string; // Current knowledge level
  hoursPerWeek: number;
  depth: 'survey' | 'applied' | 'expert' | 'researcher' | 'foundational' | 'practitioner';
  createdAt: string;
  lastActive: string;
  streakDays: number;
  advisorData: AdvisorData;
  librarianData: LibrarianData;
  tutorData: TutorData;
  editorData: EditorData;
  roommateData: RoommateData;
}

export const defaultAdvisor: AdvisorData = {
  overview: 'Architect and deploy production-grade multi-agent autonomous systems using first-principles design.',
  estimatedWeeks: 6,
  phases: [
    {
      id: 'phase_1',
      phaseNumber: 1,
      title: 'Agentic cognitive loops & state machines',
      duration: 'Weeks 1–2',
      objective: 'Master ReAct loops, deterministic planning, and state-driven agent architectures.',
      coreConcepts: ['ReAct Loop', 'State Machines', 'Observation Decoding'],
      checkpoint: {
        id: 'chk_1',
        title: 'Single-Agent Autonomous CLI',
        description: 'Build a working Python/TS agent that navigates filesystem tasks with tool-calling and self-correction.',
        completed: true
      },
      completed: true
    },
    {
      id: 'phase_2',
      phaseNumber: 2,
      title: 'Hierarchical memory & vector retrieval',
      duration: 'Weeks 3–4',
      objective: 'Implement short-term working memory, persistent vector embeddings, and reflection trees.',
      coreConcepts: ['Vector RAG', 'Reflection Trees', 'Context Compaction'],
      checkpoint: {
        id: 'chk_2',
        title: 'Memory-Augmented Research Agent',
        description: 'Deploy an agent that reads 50-page PDFs and synthesizes grounded citations without hallucination.',
        completed: false
      },
      completed: false
    },
    {
      id: 'phase_3',
      phaseNumber: 3,
      title: 'Multi-agent collaboration & production hardening',
      duration: 'Weeks 5–6',
      objective: 'Build supervisor-worker agent networks with self-critique and verification protocols.',
      coreConcepts: ['Supervisor-Worker', 'Consensus Protocols', 'Evaluation Evals'],
      checkpoint: {
        id: 'chk_3',
        title: 'Full Autonomous Code Refactoring Swarm',
        description: 'Deploy a multi-agent swarm that scans repositories, opens pull requests, and runs automated unit tests.',
        completed: false
      },
      completed: false
    }
  ],
  cutList: [
    {
      id: 'cut_1',
      topic: 'LangChain & high-level wrapping frameworks',
      reasonToSkip: 'Excessive abstraction obscures prompt mechanics, state management, and raw API contracts.',
      alternativeFocus: 'Raw API calls with Google Gemini SDK / OpenAI SDK and custom deterministic state machines.'
    },
    {
      id: 'cut_2',
      topic: 'Passive 20-hour YouTube tutorial playlists',
      reasonToSkip: 'Produces illusion of competence without building real architectural intuition.',
      alternativeFocus: 'Reading landmark papers (ReAct, Park et al.) and coding 3 proof-of-work checkpoint projects.'
    }
  ],
  chatHistory: [
    {
      id: 'msg_1',
      sender: 'assistant',
      persona: 'advisor',
      content: "Welcome to your AI agent architecture journey. We've configured your 6-week curriculum and locked in your **cut list**. Check Phase 1 to get started.",
      timestamp: '11:22 PM'
    }
  ]
};

export const defaultLibrarian: LibrarianData = {
  sources: [
    {
      id: 'src_1',
      type: 'paper',
      title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
      authorOrCreator: 'Yao et al. (Princeton & Google Brain)',
      url: 'https://arxiv.org/abs/2210.03629',
      signalScore: 10,
      whyEssential: 'The foundational academic paper that defined how LLMs interleave thought traces with action execution.',
      keyTakeaway: 'Reasoning traces allow models to recover from observation errors and formulate dynamic multi-step plans.',
      status: 'mastered'
    },
    {
      id: 'src_2',
      type: 'paper',
      title: 'Generative Agents: Interactive Simulacra of Human Behavior',
      authorOrCreator: 'Park et al. (Stanford University)',
      url: 'https://arxiv.org/abs/2304.03442',
      signalScore: 10,
      whyEssential: 'Landmark architecture for agent memory: reflection trees, importance scoring, and retrieval mechanics.',
      keyTakeaway: 'Agents must reflect periodically to synthesize higher-order abstractions from raw experiences.',
      status: 'reading'
    },
    {
      id: 'src_3',
      type: 'doc',
      title: 'Google Gemini Function Calling & Structured Outputs Guide',
      authorOrCreator: 'Google AI Documentation',
      url: 'https://ai.google.dev/docs/function_calling',
      signalScore: 9,
      whyEssential: 'Canonical reference on low-latency tool execution and schema-constrained decoding.',
      keyTakeaway: 'Strict JSON schemas prevent 99% of downstream parsing errors in autonomous loops.',
      status: 'unread'
    }
  ],
  groundedNotes: [
    {
      id: 'note_1',
      title: 'The ReAct Loop Anatomy',
      content: '**Observation -> Thought -> Action -> Observation**.\n\nKey finding: Without an explicit thought step before the action step, language models suffer from action degradation and hallucinated parameter calls.',
      tags: ['ReAct', 'Agent Architecture'],
      createdAt: 'Aug 24'
    }
  ],
  flashcards: [
    {
      id: 'card_1',
      front: 'Why do pure ReAct agents enter infinite loops when tools fail?',
      back: 'The observation error is fed back into the context window without updating the higher-level state plan, causing the model to retry the same failed action.'
    },
    {
      id: 'card_2',
      front: 'What is Context Compaction in multi-turn autonomous agents?',
      back: 'Summarizing or pruning prior tool execution outputs to preserve attention window budget while maintaining key state variables.'
    }
  ],
  chatHistory: []
};

export const defaultTutor: TutorData = {
  chatHistory: [
    {
      id: 'msg_t1',
      sender: 'assistant',
      persona: 'tutor',
      content: "Ready for your Socratic drill? Let's test your fundamental intuition: **why does a naive ReAct agent get stuck in infinite repetition loops, and what is the simplest structural mechanism to break the cycle?**",
      timestamp: '11:22 PM'
    }
  ],
  feynmanSessions: [],
  quizzes: []
};

export const defaultEditor: EditorData = {
  reviews: [],
  chatHistory: []
};

export const defaultRoommate: RoommateData = {
  chatHistory: [
    {
      id: 'msg_r1',
      sender: 'assistant',
      persona: 'roommate',
      content: "Yo! Have you realized that multi-agent supervisor hierarchies are basically just military command structures from the Roman legions? A centurion doesn't micromanage individual sword swings — they set boundaries and let local units execute. How can we apply Roman decimation/rotation principles to pruning slow agent nodes?",
      timestamp: '11:22 PM'
    }
  ],
  collisions: [],
  personaVibe: 'curious_nerd'
};
