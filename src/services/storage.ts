import { LearningJourney } from '../types/alter';

const STORAGE_KEY = 'alter_learning_journeys_v1';
const ACTIVE_JOURNEY_KEY = 'alter_active_journey_id_v1';

export interface StorageMetrics {
  usedBytes: number;
  formattedUsed: string;
  estimatedPercentage: number;
  isNearQuota: boolean;
}

export const getStoredJourneys = (): LearningJourney[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleJourneys();
      saveJourneys(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load journeys from storage', e);
    return getInitialSampleJourneys();
  }
};

/**
 * Compact journeys by keeping only the most recent chat turns per persona
 * to recover local storage space when approaching quota limits.
 */
export const compactJourneys = (journeys: LearningJourney[], maxChatTurns = 30): LearningJourney[] => {
  return journeys.map((j) => ({
    ...j,
    advisorData: {
      ...j.advisorData,
      chatHistory: (j.advisorData.chatHistory || []).slice(-maxChatTurns)
    },
    librarianData: {
      ...j.librarianData,
      chatHistory: (j.librarianData.chatHistory || []).slice(-maxChatTurns)
    },
    tutorData: {
      ...j.tutorData,
      chatHistory: (j.tutorData.chatHistory || []).slice(-maxChatTurns)
    },
    editorData: {
      ...j.editorData,
      chatHistory: (j.editorData.chatHistory || []).slice(-maxChatTurns)
    },
    roommateData: {
      ...j.roommateData,
      chatHistory: (j.roommateData.chatHistory || []).slice(-maxChatTurns)
    }
  }));
};

export const saveJourneys = (journeys: LearningJourney[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
    return true;
  } catch (e: any) {
    console.error('Failed to save journeys to storage', e);
    
    // Handle QuotaExceededError
    if (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014
    ) {
      try {
        // Attempt aggressive compaction of old chat histories
        const compacted = compactJourneys(journeys, 15);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compacted));
        console.warn('Storage quota was near limit; successfully compacted historical chat logs.');
        return true;
      } catch (innerErr) {
        console.error('Storage quota exceeded even after compaction.', innerErr);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('altor_storage_quota_error', {
              detail: {
                message: 'Browser storage limit reached. Please export a JSON backup to prevent data loss.'
              }
            })
          );
        }
        return false;
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('altor_storage_quota_error', {
          detail: { message: 'Failed to write to local storage: ' + (e.message || 'Unknown error') }
        })
      );
    }
    return false;
  }
};

export const getStorageMetrics = (): StorageMetrics => {
  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2; // UTF-16 approx 2 bytes per char
      }
    }
  } catch (err) {
    console.warn('Failed to calculate storage metrics', err);
  }

  const maxEstimatedBytes = 5 * 1024 * 1024; // 5 MB typical localStorage quota
  const percentage = Math.min(100, Math.round((totalBytes / maxEstimatedBytes) * 100));

  let formattedUsed = `${(totalBytes / 1024).toFixed(1)} KB`;
  if (totalBytes > 1024 * 1024) {
    formattedUsed = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return {
    usedBytes: totalBytes,
    formattedUsed,
    estimatedPercentage: percentage,
    isNearQuota: percentage >= 80
  };
};

export const getStoredActiveJourneyId = (): string | null => {
  return localStorage.getItem(ACTIVE_JOURNEY_KEY);
};

export const setStoredActiveJourneyId = (id: string): void => {
  localStorage.setItem(ACTIVE_JOURNEY_KEY, id);
};

export const exportAllData = (): string => {
  const journeys = getStoredJourneys();
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    journeys
  };
  return JSON.stringify(data, null, 2);
};

export const downloadBackupFile = (): void => {
  const jsonStr = exportAllData();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `altor_scholar_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importAllData = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.journeys)) {
      saveJourneys(parsed.journeys);
      if (parsed.journeys.length > 0) {
        setStoredActiveJourneyId(parsed.journeys[0].id);
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
};

export function getInitialSampleJourneys(): LearningJourney[] {
  return [
    {
      id: 'journey-ai-agents',
      title: 'Autonomous AI Agents & Multi-Agent Systems',
      topic: 'Autonomous AI Agents',
      destination: 'Architect and deploy production-grade multi-agent autonomous systems using first-principles design.',
      baseline: 'Intermediate TypeScript/Python, understand LLM APIs and prompt engineering.',
      hoursPerWeek: 10,
      depth: 'expert',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      streakDays: 4,
      advisorData: {
        overview: 'Master the architectural foundations of autonomous agents: planning loops, memory hierarchies, tool execution, self-correction, and collaborative swarm dynamics.',
        estimatedWeeks: 6,
        phases: [
          {
            id: 'p1',
            phaseNumber: 1,
            title: 'Agentic Cognitive Loops & State Machines',
            duration: 'Weeks 1-2',
            objective: 'Master ReAct loops, deterministic planning, and state-driven agent architectures.',
            coreConcepts: [
              'ReAct (Reason + Act) Loop mechanics',
              'Tool schemas and structured JSON extraction',
              'Deterministic execution guards and failure recovery'
            ],
            checkpoint: {
              id: 'cp1',
              title: 'Build a Zero-Framework Autonomous CLI Agent',
              description: 'Implement a minimal terminal agent from scratch in TypeScript with tool calling, scratchpad memory, and infinite loop prevention.',
              completed: true
            },
            completed: true
          },
          {
            id: 'p2',
            phaseNumber: 2,
            title: 'Memory Systems & Context Window Management',
            duration: 'Weeks 3-4',
            objective: 'Implement episodic, semantic vector, and hierarchical short/long-term memory.',
            coreConcepts: [
              'Dynamic context compaction and summarization',
              'Hybrid retrieval (Dense + Sparse embeddings)',
              'Entity graphs and temporal state'
            ],
            checkpoint: {
              id: 'cp2',
              title: 'Long-Horizon Memory Store',
              description: 'Create an external memory engine that persists state across 50+ multi-step conversational turns.',
              completed: false
            },
            completed: false
          },
          {
            id: 'p3',
            phaseNumber: 3,
            title: 'Multi-Agent Collaboration & Production Hardening',
            duration: 'Weeks 5-6',
            objective: 'Build supervisor-worker agent networks with self-critique and verification protocols.',
            coreConcepts: [
              'Orchestrator-Subagent delegation topologies',
              'Consensus protocols and debate-based verification',
              'Latency, token budget optimization, and sandboxing'
            ],
            checkpoint: {
              id: 'cp3',
              title: 'Autonomous Production Swarm',
              description: 'Deploy a multi-agent team (Researcher + Coder + Reviewer) that builds a full verified feature autonomously.',
              completed: false
            },
            completed: false
          }
        ],
        cutList: [
          {
            id: 'cut-1',
            topic: 'Bloated third-party "no-code" wrapper frameworks with endless magic abstractions',
            reasonToSkip: 'Hides fundamental failure modes and makes debugging impossible in real production environments.',
            alternativeFocus: 'Write clean, first-principles agent loops with pure API calls and explicit state machines.'
          },
          {
            id: 'cut-2',
            topic: 'Complex RAG chunking debates on basic text datasets',
            reasonToSkip: 'Modern 1M+ token context windows solve 90% of naive retrieval needs; focus on agentic search and reflection instead.',
            alternativeFocus: 'Agent-driven iterative search, query reformulation, and structured tool use.'
          },
          {
            id: 'cut-3',
            topic: 'Passive prompt engineering collection spreadsheets',
            reasonToSkip: 'Static prompts degrade; focus on structured outputs, few-shot dynamic exemplars, and test-driven evaluation suites.',
            alternativeFocus: 'Automated evaluation pipelines and synthetic test benches.'
          }
        ],
        chatHistory: [
          {
            id: 'm1',
            sender: 'assistant',
            persona: 'advisor',
            content: "Welcome to your AI Agent Architecture journey! We've configured your 6-week curriculum and locked in your **Cut List**. Notice what we're skipping: no bloated no-code frameworks. We build from first principles. Check out Phase 1 to get started!",
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      },
      librarianData: {
        sources: [
          {
            id: 's1',
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
            id: 's2',
            type: 'paper',
            title: 'Generative Agents: Interactive Simulacra of Human Behavior',
            authorOrCreator: 'Park et al. (Stanford University)',
            url: 'https://arxiv.org/abs/2304.03442',
            signalScore: 10,
            whyEssential: 'Landmark architecture for agent memory: reflection trees, importance scoring, and retrieval mechanics.',
            keyTakeaway: 'Agents must reflect periodically to synthesize higher-order abstractions from raw experiences.',
            status: 'in_progress'
          },
          {
            id: 's3',
            type: 'doc',
            title: 'Google Gemini Function Calling & Structured Outputs Guide',
            authorOrCreator: 'Google AI Documentation',
            signalScore: 9,
            whyEssential: 'Canonical reference on low-latency tool execution and schema-constrained decoding.',
            keyTakeaway: 'Strict JSON schemas prevent 99% of downstream parsing errors in autonomous loops.',
            status: 'unread'
          }
        ],
        vaultNotes: [
          {
            id: 'n1',
            title: 'The Core Agent Invariant',
            content: 'An autonomous agent is fundamentally a state machine: State(t+1) = Transition(State(t), Action(t), Observation(t)). Everything else (prompts, tools, vector DBs) is just plumbing.',
            tags: ['First Principles', 'Mental Model'],
            createdAt: new Date().toLocaleDateString()
          }
        ],
        conceptCards: [
          {
            id: 'c1',
            term: 'Reflection Loop',
            definition: 'A mechanism where the agent evaluates its own intermediate outputs before executing the next irreversible external action.',
            mentalModel: 'The "Measure twice, cut once" cognitive buffer.',
            pitfall: 'Unbounded self-critique loops that hallucinate flaws on valid outputs.'
          }
        ],
        chatHistory: []
      },
      tutorData: {
        chatHistory: [
          {
            id: 't1',
            sender: 'assistant',
            persona: 'tutor',
            content: "Ready for your Socratic drill? Let's test your fundamental intuition: **Why does a naive ReAct agent get stuck in infinite repetition loops, and what is the simplest structural mechanism to break the cycle?**",
            timestamp: new Date().toLocaleTimeString()
          }
        ],
        feynmanSessions: [],
        quizzes: []
      },
      editorData: {
        reviews: [],
        chatHistory: []
      },
      roommateData: {
        chatHistory: [
          {
            id: 'r1',
            sender: 'assistant',
            persona: 'roommate',
            content: "Yo! Have you realized that multi-agent supervisor hierarchies are basically just military command structures from the Roman legions? A centurion doesn't micromanage individual sword swings—they set boundaries and let local units execute! How can we apply Roman decimation/rotation principles to pruning slow agent nodes?",
            timestamp: new Date().toLocaleTimeString()
          }
        ],
        collisions: [],
        personaVibe: 'curious_nerd'
      }
    }
  ];
}
