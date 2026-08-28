import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  FileEdit,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Flame,
  Check,
  X,
  Target,
  Layers,
  ChevronRight,
  Play,
  Lock,
  Globe,
  Radio,
  Cpu,
  TrendingUp,
  Dna,
  Terminal,
  User,
  Shield,
  ExternalLink,
  Code,
  HardDrive,
  BookMarked,
  Sprout,
  DollarSign,
  PenTool,
  Mic,
  Briefcase,
  Search,
  Clock,
  MessageSquare,
  Award,
  Coffee,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { AlterPersona } from '../../types/alter';
import { ThemeToggle } from '../common/ThemeToggle';
import { DiagnosticIntakeModal } from '../common/DiagnosticIntakeModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

type CategoryType = 'all' | 'business' | 'creative' | 'finance' | 'tech';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { createJourney, updateActiveJourney, setActiveJourneyId, setIsCreateModalOpen } = useJourney();
  const { user, setIsAuthModalOpen } = useAuth();

  const [activeFacultyTab, setActiveFacultyTab] = useState<AlterPersona>('advisor');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Custom User Input Goal in Hero
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [simTopic, setSimTopic] = useState('Publishing & Selling My First E-Book');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [diagnosticTopic, setDiagnosticTopic] = useState('');

  const heroSuggestions = [
    { label: '📚 E-Book Empire', value: 'Publishing & Selling My First E-Book' },
    { label: '🌿 Indoor Herb Gardening', value: 'Organic Culinary Herb & Urban Gardening' },
    { label: '💰 Real Estate & Finance', value: 'Personal Wealth, Real Estate & Cash-Flow Investing' },
    { label: '🍞 Sourdough Micro-Bakery', value: 'Artisan Sourdough Baking & Micro-Bakery Business' },
    { label: '🗣️ Public Speaking & Pitching', value: 'Executive Persuasion & High-Stakes Public Speaking' },
    { label: '🤖 Autonomous AI Agents', value: 'Autonomous AI Agents & Systems Architecture' },
    { label: '⚡ DIY Electronics & ESP32', value: 'DIY Electronics & ESP32 IoT Sensors' }
  ];

  interface SimOutputData {
    brief: string;
    whyThisOrder: string;
    phases: Array<{
      phaseNumber: number;
      title: string;
      duration: string;
      checkpoint: string;
    }>;
    cutList: string[];
  }

  const simulatedOutputs: Record<string, SimOutputData> = {
    'Publishing & Selling My First E-Book': {
      brief: 'Validate your target readers, structure a compelling chapter-by-chapter outline, write clear actionable chapters, and launch direct pre-orders on Gumroad or Amazon with zero publisher gatekeepers.',
      whyThisOrder: 'We validate your concept with a waitlist in Phase 1 before you write hundreds of pages, draft the core manuscript in Phase 2, and launch the store in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Market Validation & 1-Page Thesis Outline',
          duration: 'Weeks 1–2',
          checkpoint: 'Create a 1-page book proposal, sample chapter outline, and a pre-order Gumroad landing page with 25 early signups.'
        },
        {
          phaseNumber: 2,
          title: 'Focused Manuscript Drafting & Cover Design',
          duration: 'Weeks 3–4',
          checkpoint: 'Complete your full 10-chapter manuscript, professional 3D cover art, and export clean EPUB/PDF files.'
        },
        {
          phaseNumber: 3,
          title: 'Direct Store Launch & First 50 Readers',
          duration: 'Weeks 5–6',
          checkpoint: 'Launch your live payment checkout, publish reader bonuses, and generate your first 50 paid reader downloads.'
        }
      ],
      cutList: [
        'Skip 3-month traditional publisher query letters and gatekeeper rituals.',
        'Skip generic social media follower growth schemes before having a validated outline.',
        'Avoid expensive paid ad campaigns until your landing page conversion is proven.'
      ]
    },
    'Organic Culinary Herb & Urban Gardening': {
      brief: 'Master indoor container biology, soil microbial drainage, full-spectrum LED light placement, watering schedules, and continuous culinary harvesting.',
      whyThisOrder: 'We establish strong root aeration and germination in Phase 1, grow lush vegetative foliage in Phase 2, and master continuous pruning and kitchen harvesting in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Container Setup, Soil Mix & Seed Germination',
          duration: 'Weeks 1–2',
          checkpoint: 'Set up a 4-pot indoor nursery with custom organic potting mix, full-spectrum LED light schedule, and germinate basil, rosemary, and thyme.'
        },
        {
          phaseNumber: 2,
          title: 'Vegetative Foliage, Lighting & Nutrient Feeding',
          duration: 'Weeks 3–4',
          checkpoint: 'Develop bushy, thriving herb plants with automated light timers and organic compost tea feeding.'
        },
        {
          phaseNumber: 3,
          title: 'Continuous Pruning, Propagation & Kitchen Harvests',
          duration: 'Weeks 5–6',
          checkpoint: 'Harvest weekly fresh culinary greens for cooking and propagate healthy stem cuttings for endless new plants.'
        }
      ],
      cutList: [
        'Skip 100-acre commercial farming agronomy manuals.',
        'Skip synthetic chemical pesticides for indoor culinary greens.',
        'Avoid expensive automated greenhouse kits before learning manual moisture & light balancing.'
      ]
    },
    'Personal Wealth, Real Estate & Cash-Flow Investing': {
      brief: 'Deconstruct cash-flow allocation, high-yield debt elimination, index fund portfolio rebalancing, tax-advantaged accounts, and real estate cash-on-cash underwriting.',
      whyThisOrder: 'We lock in your cash flow foundation in Phase 1, build automated index portfolios in Phase 2, and underwrite cash-flowing real estate deals in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Cash Flow Audit, Emergency Reserves & Index Foundations',
          duration: 'Weeks 1–2',
          checkpoint: 'Build an automated monthly cash-flow spreadsheet modeling a 3-fund Boglehead portfolio and a 10-year retirement roadmap.'
        },
        {
          phaseNumber: 2,
          title: 'Tax Optimization, Roth Backdoors & Asset Allocation',
          duration: 'Weeks 3–4',
          checkpoint: 'Set up automated tax-advantaged savings funnels and execute your first dollar-cost averaged index investment.'
        },
        {
          phaseNumber: 3,
          title: 'Real Estate Cash-on-Cash Underwriting & Deal Analysis',
          duration: 'Weeks 5–6',
          checkpoint: 'Underwrite 3 live rental property listings to calculate net operating income, cap rate, and cash-on-cash return.'
        }
      ],
      cutList: [
        'Skip speculative day-trading Discord channels and meme coin pumps.',
        'Skip high-fee financial advisor mutual fund brochures.',
        'Avoid complex option straddles before mastering core index fund asset allocation.'
      ]
    },
    'Artisan Sourdough Baking & Micro-Bakery Business': {
      brief: 'Master wild yeast fermentation kinetics, hydration baker percentages, gluten matrix development, Dutch oven steam baking, and local cottage food regulations.',
      whyThisOrder: 'We culture a vigorous wild sourdough starter in Phase 1, master dough shaping and baking in Phase 2, and scale cottage bakery batching in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Wild Starter Culturing, Hydration Ratios & Bulk Fermentation',
          duration: 'Weeks 1–2',
          checkpoint: 'Culture an active, bubbly sourdough starter and master 75% hydration stretch-and-fold fermentation timing.'
        },
        {
          phaseNumber: 2,
          title: 'Dough Shaping, Scoring & Dutch Oven Steam Baking',
          duration: 'Weeks 3–4',
          checkpoint: 'Bake 2 blistered, open-crumb sourdough boules with razor scoring and deep caramelized crusts.'
        },
        {
          phaseNumber: 3,
          title: 'Weekend Micro-Bakery Batching & Cottage Sales',
          duration: 'Weeks 5–6',
          checkpoint: 'Bake a 6-loaf batch, package with custom bakery labels, and calculate cottage food profit margins.'
        }
      ],
      cutList: [
        'Skip industrial commercial yeast mass-production manuals.',
        'Skip buying $3,000 professional deck ovens before mastering Dutch oven heat retention.',
        'Avoid complex decorative scoring before mastering core fermentation timing.'
      ]
    },
    'Executive Persuasion & High-Stakes Public Speaking': {
      brief: 'Master narrative story architecture, rhetorical contrast framing, vocal modulation, impromptu rebuttal sparring, and keynote presentation delivery.',
      whyThisOrder: 'We craft your core thesis and 3-act narrative in Phase 1, master vocal delivery and body language in Phase 2, and deliver a live keynote in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Core Thesis Framing & 3-Act Narrative Arc',
          duration: 'Weeks 1–2',
          checkpoint: 'Write and record a 5-minute impromptu persuasive pitch on video, evaluated for thesis clarity and pacing.'
        },
        {
          phaseNumber: 2,
          title: 'Vocal Modulation, Pause Dynamics & Slide Minimalism',
          duration: 'Weeks 3–4',
          checkpoint: 'Design a 7-slide visual narrative deck and deliver a seamless 10-minute presentation with zero filler words.'
        },
        {
          phaseNumber: 3,
          title: 'Impromptu Q&A Sparring & High-Stakes Keynote',
          duration: 'Weeks 5–6',
          checkpoint: 'Defend your thesis live in a 15-minute hostile Q&A session with confident, grounded rebuttals.'
        }
      ],
      cutList: [
        'Skip superficial slide transition animations and visual clutter.',
        'Skip memorizing scripted speeches word-for-word without understanding core beat markers.',
        'Avoid reading bullet points directly from slides.'
      ]
    },
    'Autonomous AI Agents & Systems Architecture': {
      brief: 'Master first-principles agentic cognitive loops, hierarchical memory architectures, deterministic planning, and self-correcting tool-use workflows.',
      whyThisOrder: 'We build the deterministic ReAct cognitive loop in Phase 1, attach external tools and memory in Phase 2, and orchestrate multi-agent coordination in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Agentic Cognitive Loops & State Machines',
          duration: 'Weeks 1–2',
          checkpoint: 'Ship an autonomous ReAct loop with state transitions, memory recall, and tool execution verification.'
        },
        {
          phaseNumber: 2,
          title: 'Tool Grounding, Vector Memory & Error Self-Correction',
          duration: 'Weeks 3–4',
          checkpoint: 'Integrate MCP tool calling, embeddings semantic search, and an automated retry-reflection loop.'
        },
        {
          phaseNumber: 3,
          title: 'Multi-Agent Swarm Orchestration & Evaluation Benchmarks',
          duration: 'Weeks 5–6',
          checkpoint: 'Deploy a multi-agent team with leader-follower task delegation evaluated across 20 synthetic tasks.'
        }
      ],
      cutList: [
        'Skip superficial wrapper tutorials with zero persistent state.',
        'Skip generic prompt engineering blogs without automated evaluation harnesses.',
        'Avoid building toy chatbots with zero tool grounding.'
      ]
    },
    'DIY Electronics & ESP32 IoT Sensors': {
      brief: 'Master microcontroller architectures, GPIO registers, breadboard prototyping, I2C/SPI bus protocols, and power-efficient C/C++ firmware.',
      whyThisOrder: 'We wire breadboards and read raw registers in Phase 1, connect WiFi/MQTT telemetry in Phase 2, and design custom PCB enclosures in Phase 3.',
      phases: [
        {
          phaseNumber: 1,
          title: 'Microcontroller Registers, Power & Breadboarding',
          duration: 'Weeks 1–2',
          checkpoint: 'Wire an ESP32 with a BME280 sensor over I2C on a breadboard, read sensor registers, and trigger deep sleep (<15µA).'
        },
        {
          phaseNumber: 2,
          title: 'Wireless Telemetry, MQTT & Home Automation',
          duration: 'Weeks 3–4',
          checkpoint: 'Transmit encrypted sensor telemetry over MQTT to Home Assistant with an automated live dashboard.'
        },
        {
          phaseNumber: 3,
          title: 'Custom PCB Schematic Design & 3D Printed Enclosure',
          duration: 'Weeks 5–6',
          checkpoint: 'Design a 2-layer PCB in KiCad and 3D print a snap-fit enclosure for wall mounting.'
        }
      ],
      cutList: [
        'Skip 30 hours of dry semiconductor chemistry theory.',
        'Skip high-level Python scripts that hide hardware registers.',
        'Avoid buying bloated pre-built kits without learning manual schematic wiring.'
      ]
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalInput.trim()) return;
    setIsSimulating(true);
    const entered = customGoalInput.trim();
    setSimTopic(entered);

    if (!simulatedOutputs[entered]) {
      simulatedOutputs[entered] = {
        brief: `Master ${entered} step-by-step with structured milestone phases, curated core insights, and hands-on practice.`,
        whyThisOrder: `We build your foundation in Phase 1, develop the primary project in Phase 2, and launch/polish in Phase 3.`,
        phases: [
          {
            phaseNumber: 1,
            title: `Phase 1: Core Foundations & Starter Project in ${entered}`,
            duration: 'Weeks 1–2',
            checkpoint: `Complete and showcase your first working prototype or outline in ${entered}.`
          },
          {
            phaseNumber: 2,
            title: `Phase 2: Core Execution & In-Depth Build`,
            duration: 'Weeks 3–4',
            checkpoint: `Develop your comprehensive, full-scale project in ${entered}.`
          },
          {
            phaseNumber: 3,
            title: `Phase 3: Polish, Launch & Real-World Results`,
            duration: 'Weeks 5–6',
            checkpoint: `Publish or demonstrate your finished masterwork deliverable in ${entered}.`
          }
        ],
        cutList: [
          `Skip introductory fluff and passive video bingeing on ${entered}.`,
          `Avoid memorizing isolated trivia without hands-on application.`,
          `Cut outdated manuals and non-essential edge-case distractions.`
        ]
      };
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 250);
  };

  const currentSim = simulatedOutputs[simTopic] || {
    brief: `Master ${simTopic} step-by-step with structured milestone phases, curated core insights, and hands-on practice.`,
    whyThisOrder: `We build your foundation in Phase 1, develop the primary project in Phase 2, and launch/polish in Phase 3.`,
    phases: [
      {
        phaseNumber: 1,
        title: `Phase 1: Core Foundations & Starter Project in ${simTopic}`,
        duration: 'Weeks 1–2',
        checkpoint: `Complete and showcase your first working prototype or outline in ${simTopic}.`
      },
      {
        phaseNumber: 2,
        title: `Phase 2: Core Execution & In-Depth Build`,
        duration: 'Weeks 3–4',
        checkpoint: `Develop your comprehensive, full-scale project in ${simTopic}.`
      },
      {
        phaseNumber: 3,
        title: `Phase 3: Polish, Launch & Real-World Results`,
        duration: 'Weeks 5–6',
        checkpoint: `Publish or demonstrate your finished masterwork deliverable in ${simTopic}.`
      }
    ],
    cutList: [
      `Skip introductory fluff and passive video bingeing on ${simTopic}.`,
      `Avoid memorizing isolated trivia without hands-on application.`,
      `Cut outdated manuals and non-essential edge-case distractions.`
    ]
  };

  const handleSelectSuggestion = (topic: string) => {
    setIsSimulating(true);
    setSimTopic(topic);
    setCustomGoalInput(topic);
    setTimeout(() => setIsSimulating(false), 200);
  };

  const handleLaunchWithTopic = (customTopic?: string, customSimData?: any) => {
    const topicToUse = customTopic || simTopic;
    const simDataToUse = customSimData || currentSim;

    // 1. Create the Journey immediately
    const newJourney = createJourney({
      title: topicToUse,
      topic: topicToUse,
      destination: simDataToUse.brief || `Master ${topicToUse} from first principles.`,
      baseline: 'Curious autodidact fundamentals',
      hoursPerWeek: 8,
      depth: 'practitioner'
    });

    // 2. Populate the Advisor roadmap and Sandeep Swadia cut list
    const isAgent = topicToUse.toLowerCase().includes('agent') || topicToUse.toLowerCase().includes('autonomous');
    
    const initialSources = isAgent ? [
      {
        id: `source-1-${Date.now()}`,
        type: 'paper' as const,
        title: "ReAct: Synergizing Reasoning and Acting in Language Models",
        authorOrCreator: "Shunyu Yao et al. (Princeton & Google Brain)",
        status: 'reading' as const,
        whyEssential: "Introduces the seminal Thought-Action-Observation loop that underpins modern autonomous agent architectures.",
        keyTakeaway: "Interleave internal reasoning traces with external tool executions to reduce hallucinations and enable dynamic error recovery.",
        signalScore: 10,
        url: "https://arxiv.org/abs/2210.03629"
      },
      {
        id: `source-2-${Date.now()}`,
        type: 'paper' as const,
        title: "Reflexion: Language Agents with Verbal Reinforcement Learning",
        authorOrCreator: "Noah Shinn et al. (MIT & Northeastern)",
        status: 'unread' as const,
        whyEssential: "Teaches how agents can inspect their own errors and store self-reflections in memory to self-correct on subsequent attempts.",
        keyTakeaway: "Verbal reflection stored in working memory achieves higher task completion than naive prompt retries.",
        signalScore: 10,
        url: "https://arxiv.org/abs/2303.11366"
      },
      {
        id: `source-3-${Date.now()}`,
        type: 'paper' as const,
        title: "Generative Agents: Interactive Simulacra of Human Behavior",
        authorOrCreator: "Joon Sung Park et al. (Stanford & Google)",
        status: 'unread' as const,
        whyEssential: "Defines memory streams, reflection heuristics, and hierarchical planning over extended time horizons.",
        keyTakeaway: "Decouple immediate working memory from long-term associative memory retrieval with importance scoring.",
        signalScore: 9,
        url: "https://arxiv.org/abs/2304.03442"
      }
    ] : [
      {
        id: `source-1-${Date.now()}`,
        type: 'book' as const,
        title: `First Principles of ${topicToUse}`,
        authorOrCreator: "Canonical Field Authority",
        status: 'reading' as const,
        whyEssential: `Foundational work providing the core principles and proven practical framework for ${topicToUse}.`,
        keyTakeaway: "Master the irreducible baseline principles before adding complex tooling layers.",
        signalScore: 10
      }
    ];

    updateActiveJourney((prev) => ({
      ...prev,
      advisorData: {
        ...prev.advisorData,
        overview: simDataToUse.brief || `Master ${topicToUse} with clear milestone deliverables and ruthless Cut-List filtering.`,
        estimatedWeeks: 6,
        phases: [
          {
            id: `phase-1-${Date.now()}`,
            phaseNumber: 1,
            title: (simDataToUse.phase1 || 'Core Foundations').replace(/^Phase 1:\s*/i, ''),
            duration: '2 weeks',
            objective: simDataToUse.brief,
            tangibleAsset: simDataToUse.checkpoint || 'Working MVP Prototype',
            coreConcepts: isAgent 
              ? ['ReAct Cognitive Loop & Stop Tokens', 'Dynamic Tool Schemas & Error Recovery', 'Deterministic State Graphs & Memory']
              : ['First-Principles Foundations', 'Core Mental Models', 'Tactical Implementation'],
            checkpoint: {
              id: `cp-1-${Date.now()}`,
              title: 'Phase 1 Proof of Work',
              description: simDataToUse.checkpoint || 'Build and validate your first working milestone.',
              completed: false
            },
            completed: false
          },
          {
            id: `phase-2-${Date.now()}`,
            phaseNumber: 2,
            title: 'Core Execution & High-Leverage Architecture',
            duration: '2 weeks',
            objective: 'Build and test the primary system under real-world conditions.',
            tangibleAsset: 'Production-Ready Architecture Engine',
            coreConcepts: isAgent 
              ? ['Memory Architectures & Vector Stores', 'Multi-Agent Routing & Handoffs', 'Evaluation Harnesses & Benchmarks']
              : ['Intermediate Mechanics', 'Error Handling & Edge Cases', 'Optimization'],
            checkpoint: {
              id: `cp-2-${Date.now()}`,
              title: 'Phase 2 Deliverable',
              description: 'Deploy real-world system or execute second complete case study.',
              completed: false
            },
            completed: false
          },
          {
            id: `phase-3-${Date.now()}`,
            phaseNumber: 3,
            title: 'Mastery, Synthesis & Capstone Launch',
            duration: '2 weeks',
            objective: 'Complete autonomous mastery and publish tangible proof-of-work.',
            tangibleAsset: 'Live Published Capstone System',
            coreConcepts: isAgent
              ? ['Autonomous Swarm Coordination', 'Security & Prompt Injection Defenses', 'Production Deployment & Monitoring']
              : ['Lateral Synthesis', 'Antifragility', 'Publishing / Shipping'],
            checkpoint: {
              id: `cp-3-${Date.now()}`,
              title: 'Capstone Masterwork',
              description: 'Launch publicly or conduct capstone peer critique.',
              completed: false
            },
            completed: false
          }
        ],
        cutList: (simDataToUse.cutList || []).map((cut: string, idx: number) => ({
          id: `cut-${idx + 1}-${Date.now()}`,
          topic: cut.replace(/^Skip\s+/i, '').replace(/^Avoid\s+/i, ''),
          reasonToSkip: 'Low-leverage distraction / passive consumption trap.',
          alternativeFocus: 'Focus on foundational mental models and tangible proof of work.'
        })),
        chatHistory: [
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            persona: 'advisor',
            content: `Welcome to your learning journey for **${topicToUse}**! I have locked in your custom roadmap and Sandeep Swadia Cut-List below. Check out Phase 1 to begin building your first proof-of-work.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      librarianData: {
        ...prev.librarianData,
        sources: initialSources,
        flashcards: isAgent ? [
          {
            id: `fc-1-${Date.now()}`,
            front: "ReAct Pattern (Reasoning + Acting)",
            back: "Interleaving internal reasoning traces ('Thought') with external tool execution ('Action') and sensory feedback ('Observation') to prevent hallucinations and enable error recovery."
          },
          {
            id: `fc-2-${Date.now()}`,
            front: "Stop Token in Agent Loops",
            back: "Instructing the LLM to generate text only up to 'Action:' so the runtime engine can pause generation, execute the tool in a sandbox, and feed the output back as 'Observation:'."
          }
        ] : prev.librarianData.flashcards
      }
    }));

    // 3. Set active journey and enter app view immediately
    setActiveJourneyId(newJourney.id);
    onEnterApp();
  };

  // Expanded Multidisciplinary Case Studies
  const caseStudies = [
    {
      id: 'ebook',
      category: 'business',
      title: 'Building a Profitable E-Book Publishing Empire',
      tag: 'Digital Solopreneurship',
      icon: BookMarked,
      color: 'text-[var(--advisor)]',
      border: 'border-[var(--advisor)]',
      advisorCut: 'Skip traditional 6-month agent query loops; focus on reader pain validation & Gumroad distribution.',
      tutorDrill: '"Why would someone pay $25 for this book instead of a 5-minute Google search? What is the non-obvious thesis?"',
      editorAudit: 'Audits chapter 1 for passive voice, fluff filler, and vague advice.',
      roommateSpark: 'Book Marketing × Viral Referral Growth Loops',
      proofOfWork: 'Published 55-Page Action Guide with Live Gumroad Checkout & 100 Waitlist Pre-Orders'
    },
    {
      id: 'gardening',
      category: 'creative',
      title: 'Organic Culinary Herb & Urban Micro-Farming',
      tag: 'Lifelong Craft',
      icon: Sprout,
      color: 'text-[var(--tutor)]',
      border: 'border-[var(--tutor)]',
      advisorCut: 'Skip commercial tractor acreage manuals; focus on indoor PAR light cycles & soil microbes.',
      tutorDrill: '"Explain why basil plants bolt to seed and how node pinching redirects vegetative auxin hormones."',
      editorAudit: 'Audits indoor moisture, humidity, and photoperiod logs for mold risk.',
      roommateSpark: 'Companion Planting × Cybernetic Feedback Control',
      proofOfWork: 'Flourishing 4-Tier Vertical Herb Garden Yielding Weekly Fresh Basil, Thyme & Rosemary'
    },
    {
      id: 'finance',
      category: 'finance',
      title: 'Personal Wealth, Real Estate & Cash-Flow Investing',
      tag: 'Financial Independence',
      icon: DollarSign,
      color: 'text-[var(--editor)]',
      border: 'border-[var(--editor)]',
      advisorCut: 'Skip speculative meme stocks & day-trading noise; focus on cap rates & 3-fund index allocations.',
      tutorDrill: '"What is the exact mathematical difference between effective gross income and net operating income (NOI)?"',
      editorAudit: 'Audits real estate underwriting models, exposing optimistic vacancy assumptions.',
      roommateSpark: 'Portfolio Asset Allocation × Ecosystem Resilience Biology',
      proofOfWork: 'Automated 10-Year Wealth Model & Stress-Tested Real Estate Underwriting Model'
    },
    {
      id: 'bakery',
      category: 'business',
      title: 'Artisan Sourdough Baking & Micro-Bakery Business',
      tag: 'Food Craft & Commerce',
      icon: Coffee,
      color: 'text-[var(--editor)]',
      border: 'border-[var(--editor)]',
      advisorCut: 'Skip $3,000 professional deck ovens; master Dutch oven heat retention and cottage food laws.',
      tutorDrill: '"Explain fermentation kinetics and why room temperature changes bulk proofing by hours."',
      editorAudit: 'Audits bakery unit economics and ingredient cost per loaf breakdown.',
      roommateSpark: 'Sourdough Fermentation × Beer Brewing Yeast Culturing',
      proofOfWork: 'Two Blistered Sourdough Boules Baked & Cottage Food Micro-Bakery Sales Page Launched'
    },
    {
      id: 'speech',
      category: 'creative',
      title: 'Executive Persuasion & High-Stakes Public Speaking',
      tag: 'Communication & Leadership',
      icon: Mic,
      color: 'text-[var(--roommate)]',
      border: 'border-[var(--roommate)]',
      advisorCut: 'Skip slide animation tricks; master narrative contrast, rhetorical pauses, and objection handling.',
      tutorDrill: '"Frame the core solution using Aristotle’s Ethos, Pathos, and Logos in under 90 seconds."',
      editorAudit: 'Strikes out filler words and redundant slide bullet points.',
      roommateSpark: 'Keynote Delivery × Stand-up Comedy Timing',
      proofOfWork: 'Recorded 10-Minute Executive Keynote Video Pitch with Objection Matrix'
    },
    {
      id: 'hardware',
      category: 'tech',
      title: 'DIY Electronics & ESP32 IoT Sensor Engineering',
      tag: 'Hardware & Embedded',
      icon: Cpu,
      color: 'text-[var(--advisor)]',
      border: 'border-[var(--advisor)]',
      advisorCut: 'Skip 40 hours of dry semiconductor chemistry; focus on GPIO registers & I2C protocols.',
      tutorDrill: '"Explain how an ADC converts analog voltage to a 12-bit binary number without technical jargon."',
      editorAudit: 'Audits PCB schematics and detects interrupt service routine race conditions.',
      roommateSpark: 'Sensor Sampling × Mammalian Respiration Rates',
      proofOfWork: 'Custom Soldered ESP32 Weather Node with I2C Telemetry & Deep Sleep (<15µA)'
    }
  ];

  const filteredCaseStudies = activeCategory === 'all'
    ? caseStudies
    : caseStudies.filter(cs => cs.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] font-sans selection:bg-[var(--accent)] selection:text-[#04050a] overflow-x-hidden transition-colors duration-300">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--surface-1)]/90 backdrop-blur-md border-b border-[var(--hairline)] px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center font-display font-bold text-sm text-[var(--advisor)] shadow-sm">
              A
            </div>
            <div className="font-display font-semibold text-lg text-[var(--ink)] tracking-tight flex items-center gap-2">
              Altor
              <span className="text-[10px] font-mono tracking-widest text-[var(--ink-3)] border border-[var(--hairline-strong)] rounded px-1.5 py-0.5">
                UNIV
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--ink-2)] font-medium">
            <a href="#how-it-works" className="hover:text-[var(--ink)] transition">How It Teaches You</a>
            <a href="#examples" className="hover:text-[var(--ink)] transition">What You Can Learn</a>
            <a href="#faculty" className="hover:text-[var(--ink)] transition">Your 5 Mentors</a>
            <a href="#matrix" className="hover:text-[var(--ink)] transition">University vs. Altor</a>
            <a href="#pricing" className="hover:text-[var(--ink)] transition">Tiers</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Sign In / Profile Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition flex items-center gap-1.5"
            >
              <User size={13} />
              <span>{user.isGuest ? 'Sign In / Sync' : user.username}</span>
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-lg bg-[var(--surface-3)] hover:border-[var(--accent)] border border-[var(--hairline-strong)] text-xs font-semibold text-[var(--ink)] transition flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Interactive Custom Goal Bar */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(94,184,245,0.12),transparent_70%)]" />
        
        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--advisor)_12%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-xs font-mono text-[var(--advisor)] tracking-wide font-semibold">
            <Sparkles size={13} className="text-[var(--advisor)]" />
            <span>YOUR PERSONAL 5-PROFESSOR AI UNIVERSITY FOR ANYTHING YOU WANT TO LEARN</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--ink)] leading-[1.1]">
            Type Any Goal. <br />
            <span className="bg-gradient-to-r dark:from-white dark:via-slate-200 from-slate-900 via-slate-800 to-[var(--advisor)] bg-clip-text text-transparent">
              Five AI Mentors Teach You Step-by-Step.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[var(--ink-2)] max-w-2xl mx-auto leading-relaxed font-sans">
            Whether you want to launch an e-book business, learn real estate investing, bake artisan sourdough, or code your first app —
            Altor creates your custom curriculum, cuts the fluff, explains concepts in plain English, and guides you to real, tangible proof.
          </p>

          {/* Interactive Custom Topic Search/Creation Bar (Star of Hero) */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form onSubmit={handleCustomSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center bg-[var(--surface-1)] border-2 border-[var(--advisor)] rounded-2xl shadow-md focus-within:shadow-xl transition">
                <Search size={18} className="absolute left-4 text-[var(--advisor)] pointer-events-none" />
                <input
                  type="text"
                  placeholder='Type anything you want to master (e.g. "Sourdough Bakery", "Speak Italian", "Real Estate")...'
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="w-full bg-transparent border-none text-[var(--ink)] text-xs sm:text-sm pl-11 pr-36 py-4 outline-none placeholder-[var(--ink-3)] font-sans"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2.5 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>Build Syllabus</span>
                  <Zap size={13} />
                </button>
              </div>
            </form>

            {/* Suggestions Chips */}
            <div className="flex items-center flex-wrap justify-center gap-2 mt-3 text-xs">
              <span className="text-[var(--ink-3)] font-mono text-[11px]">Or try:</span>
              {heroSuggestions.map((sug) => (
                <button
                  key={sug.value}
                  onClick={() => handleSelectSuggestion(sug.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11.5px] transition ${
                    simTopic === sug.value
                      ? 'bg-[var(--advisor)] text-[#04050a] font-semibold'
                      : 'bg-[var(--surface-1)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--hairline)]'
                  }`}
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-mono text-[var(--ink-3)]">
            <span>✓ 100% Free Forever</span>
            <span>•</span>
            <span>✓ Any Topic on Earth</span>
            <span>•</span>
            <span>✓ No Prior Experience Needed</span>
          </div>
        </div>

        {/* 2.5 Live Custom Curriculum Simulator Output */}
        <div className="mt-12 relative z-10 max-w-5xl mx-auto rounded-2xl bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--hairline-strong)] p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--advisor)] uppercase tracking-wider mb-1 font-semibold">
                <Radio size={14} className="animate-pulse text-[var(--advisor)]" />
                Live Generated Curriculum Preview
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--ink)] m-0">
                Curriculum for: <span className="text-[var(--advisor)]">"{simTopic}"</span>
              </h3>
            </div>

            <button
              onClick={() => handleLaunchWithTopic()}
              className="px-4 py-2 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-md transition flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <span>Launch Full University for "{simTopic}" →</span>
            </button>
          </div>

          {/* Simulator Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--hairline)]">
                <div className="text-[11px] font-mono uppercase text-[var(--ink-3)] tracking-wider mb-1 font-semibold">
                  1. Strategic Advisor Brief (Your Big Picture)
                </div>
                <p className="text-sm text-[var(--ink)] leading-relaxed m-0 font-sans">
                  {currentSim.brief}
                </p>
              </div>

              {/* 3-PHASE STEP-BY-STEP LEARNING ROADMAP */}
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-l-2 border-[var(--hairline)] border-l-[var(--advisor)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase text-[var(--advisor)] tracking-wider font-semibold">
                    2. Your Complete 3-Phase Roadmap (What You'll Actually Build &amp; Why)
                  </div>
                </div>

                <div className="space-y-2">
                  {currentSim.phases.map((ph, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--ink)] font-sans">
                          Phase {ph.phaseNumber}: {ph.title}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--advisor)] font-bold px-2 py-0.5 rounded bg-[var(--surface-1)]">
                          {ph.duration}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[var(--ink-2)] m-0 leading-relaxed">
                        🎯 <strong className="text-[var(--ink)]">What You Build (Real-World Proof):</strong> {ph.checkpoint}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Why this sequence explanation */}
                <div className="p-2.5 rounded-lg bg-[var(--advisor)]/10 border border-[var(--advisor)]/20 text-[11px] text-[var(--ink-2)] font-sans leading-relaxed">
                  💡 <strong className="text-[var(--advisor)]">Why this specific sequence?</strong> {currentSim.whyThisOrder}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[rgba(234,176,84,0.35)] space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--editor)] text-xs font-semibold">
                  <ShieldAlert size={14} />
                  <span>3. The Sandeep Swadia "Cut List" (What to Skip)</span>
                </div>
                <p className="text-[11px] text-[var(--ink-3)] m-0">
                  Save 40+ hours by ignoring generic tutorials, dry theory, and non-essential fluff:
                </p>
                <div className="space-y-1.5 text-[11.5px] text-[var(--ink-2)] pl-2">
                  {currentSim.cutList.map((cut, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-mono font-bold">✕</span>
                      <span>{cut}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosticTopic(customGoalInput.trim() || simTopic);
                    setIsDiagnosticModalOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] text-xs font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <Target size={14} />
                  <span>🎓 Chat with Advisor to Personalize Roadmap (Recommended) →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchWithTopic()}
                  className="py-3 px-4 rounded-xl bg-[var(--surface-3)] hover:border-[var(--advisor)] border border-[var(--hairline-strong)] text-xs font-semibold text-[var(--ink)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Quick Launch →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "How Altor Actually Teaches You" (Demystifying the 5 Faculty) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)] font-semibold">
            HOW IT ACTUALLY WORKS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            How Altor Teaches You (No Experience Needed)
          </h2>
          <p className="text-[var(--ink-2)] text-sm sm:text-base leading-relaxed">
            You don't need to search the internet alone or guess what to study next. Five AI mentors guide you through a complete, friendly learning cycle.
          </p>
        </div>

        {/* 4 Clear Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="card p-6 bg-[var(--surface-1)] border border-[var(--hairline)] space-y-3.5 flex flex-col justify-between shadow-card">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--advisor)_12%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] flex items-center justify-center text-[var(--advisor)] font-bold text-sm">
                1
              </div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] m-0">
                1. Ordered Roadmap &amp; Cut List
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0 font-sans">
                Your <strong>Academic Advisor</strong> organizes your goal into clear, chronological phases (Phase 1 → Phase 2 → Phase 3) and tells you exactly what confusing fluff to skip.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--advisor)] bg-[var(--surface-2)] p-2.5 rounded-lg border border-[var(--hairline)]">
              ✓ Step-by-step ordered timeline<br />
              ✓ Zero tutorial overload
            </div>
          </div>

          {/* Step 2 */}
          <div className="card p-6 bg-[var(--surface-1)] border border-[var(--hairline)] space-y-3.5 flex flex-col justify-between shadow-card">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--librarian)_12%,transparent)] border border-[color-mix(in_srgb,var(--librarian)_35%,transparent)] flex items-center justify-center text-[var(--librarian)] font-bold text-sm">
                2
              </div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] m-0">
                2. Curated Notes &amp; Mental Models
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0 font-sans">
                No need to read 500-page dry textbooks alone. Your <strong>Librarian</strong> summarizes the key mental models and notes directly into your private notebook.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--librarian)] bg-[var(--surface-2)] p-2.5 rounded-lg border border-[var(--hairline)]">
              ✓ Top 1% seminal resources<br />
              ✓ Pre-digested flashcards
            </div>
          </div>

          {/* Step 3 */}
          <div className="card p-6 bg-[var(--surface-1)] border border-[var(--hairline)] space-y-3.5 flex flex-col justify-between shadow-card">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--tutor)_12%,transparent)] border border-[color-mix(in_srgb,var(--tutor)_35%,transparent)] flex items-center justify-center text-[var(--tutor)] font-bold text-sm">
                3
              </div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] m-0">
                3. Friendly 24/7 Socratic Lessons
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0 font-sans">
                Your <strong>Socratic Tutor</strong> explains tricky concepts in plain English ("explain like I'm 10"), answers questions in Office Hours, and checks your understanding with gentle quizzes.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--tutor)] bg-[var(--surface-2)] p-2.5 rounded-lg border border-[var(--hairline)]">
              ✓ "Explain like I'm 10" drills<br />
              ✓ 24/7 Office Hours homework help
            </div>
          </div>

          {/* Step 4 */}
          <div className="card p-6 bg-[var(--surface-1)] border border-[var(--hairline)] space-y-3.5 flex flex-col justify-between shadow-card">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--roommate)_12%,transparent)] border border-[color-mix(in_srgb,var(--roommate)_35%,transparent)] flex items-center justify-center text-[var(--roommate)] font-bold text-sm">
                4
              </div>
              <h3 className="font-display text-base font-bold text-[var(--ink)] m-0">
                4. Build &amp; Polish Real Projects
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed m-0 font-sans">
                You build real things (a published e-book, a garden harvest, an investment sheet, or a coded app). Your <strong>Editor</strong> polishes your work and your <strong>Roommate</strong> keeps it creative.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--roommate)] bg-[var(--surface-2)] p-2.5 rounded-lg border border-[var(--hairline)]">
              ✓ Real tangible deliverables<br />
              ✓ Public portfolio proof card
            </div>
          </div>
        </div>

        {/* A 15-Minute Day in the Life Storyboard */}
        <div className="mt-14 max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--tutor)] uppercase tracking-wider font-semibold">
            <Clock size={15} />
            <span>A 15-Minute Daily Session in Altor</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] m-0">
            How You Make Fast Daily Progress Without Burnout
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-[var(--ink-2)]">
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-2">
                <span className="text-[var(--advisor)] font-mono">01</span>
                <span>Minutes 1–3</span>
              </div>
              <p className="text-[var(--ink-2)] m-0">Check today's phase task &amp; review 2 bite-sized mental model notes.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-2">
                <span className="text-[var(--tutor)] font-mono">02</span>
                <span>Minutes 4–10</span>
              </div>
              <p className="text-[var(--ink-2)] m-0">Chat 1-on-1 with your Tutor, practice a Feynman explanation, and take a quick 2-question quiz.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-2">
                <span className="text-[var(--editor)] font-mono">03</span>
                <span>Minutes 11–15</span>
              </div>
              <p className="text-[var(--ink-2)] m-0">Draft your milestone homework (writing, plan, recipe, or code) and get instant critique from your Editor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Expanded Multidisciplinary Showcase (What You Can Master) */}
      <section id="examples" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--tutor)] font-semibold">
            EXPLORE REAL EXAMPLES
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            Learn Anything on Earth. From Books to Botany to Code.
          </h2>
          <p className="text-[var(--ink-2)] text-sm sm:text-base leading-relaxed">
            See how everyday learners, creators, writers, investors, gardeners, and builders use Altor to achieve real outcomes.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all' as CategoryType, label: 'All Disciplines' },
            { id: 'business' as CategoryType, label: '📚 Business & E-Books' },
            { id: 'creative' as CategoryType, label: '🌿 Gardening & Crafts' },
            { id: 'finance' as CategoryType, label: '💰 Wealth & Finance' },
            { id: 'tech' as CategoryType, label: '⚡ Tech & Hardware' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-[var(--surface-3)] text-[var(--ink)] border border-[var(--hairline-strong)] shadow-sm font-semibold'
                  : 'bg-[var(--surface-1)] text-[var(--ink-3)] border border-[var(--hairline)] hover:text-[var(--ink)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredCaseStudies.map((cs) => {
            const Icon = cs.icon;
            return (
              <div
                key={cs.id}
                className="card p-6 flex flex-col justify-between bg-[var(--surface-1)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] transition space-y-4 shadow-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${cs.color}`}>
                      {cs.tag}
                    </span>
                    <Icon size={16} className={cs.color} />
                  </div>

                  <h4 className="font-display text-base font-bold text-[var(--ink)] m-0 leading-snug">
                    {cs.title}
                  </h4>

                  <div className="space-y-2 text-xs text-[var(--ink-2)] border-t border-[var(--hairline)] pt-3 font-sans">
                    <div>
                      <strong className="text-[var(--ink)]">What to Skip:</strong> {cs.advisorCut}
                    </div>
                    <div>
                      <strong className="text-[var(--ink)]">Socratic Lesson:</strong> <em>{cs.tutorDrill}</em>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--hairline)]">
                  <div className="text-[10px] font-mono text-[var(--tutor)] uppercase mb-1 font-semibold">
                    ✓ What You Actually Build (Proof of Work):
                  </div>
                  <div className="text-xs text-[var(--ink)] font-medium leading-snug">
                    {cs.proofOfWork}
                  </div>
                  <button
                    onClick={() => {
                      handleLaunchWithTopic(cs.title, {
                        brief: `Master ${cs.title} (${cs.tag}) from first principles.`,
                        phase1: `Phase 1: Foundations of ${cs.title}`,
                        checkpoint: cs.proofOfWork,
                        cutList: [cs.advisorCut]
                      });
                    }}
                    className="mt-3 w-full py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition flex items-center justify-center gap-1.5"
                  >
                    <span>Start Learning "{cs.title}" →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Meet Your 5 AI Faculty Mentors */}
      <section id="faculty" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)] font-semibold">
            YOUR 5-PERSON MENTOR BOARD
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            Meet Your 5 Specialized AI Mentors
          </h2>
          <p className="text-[var(--ink-2)] text-sm sm:text-base leading-relaxed">
            Each mentor specializes in one critical phase of your learning journey.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'advisor' as AlterPersona, letter: 'A', name: 'Academic Advisor', color: 'text-[var(--advisor)]', border: 'border-[var(--advisor)]' },
            { id: 'librarian' as AlterPersona, letter: 'L', name: 'Knowledge Librarian', color: 'text-[var(--librarian)]', border: 'border-[var(--librarian)]' },
            { id: 'tutor' as AlterPersona, letter: 'T', name: 'Socratic Tutor', color: 'text-[var(--tutor)]', border: 'border-[var(--tutor)]' },
            { id: 'editor' as AlterPersona, letter: 'E', name: 'Analytical Editor', color: 'text-[var(--editor)]', border: 'border-[var(--editor)]' },
            { id: 'roommate' as AlterPersona, letter: 'R', name: 'Creative Roommate', color: 'text-[var(--roommate)]', border: 'border-[var(--roommate)]' }
          ].map((fac) => (
            <button
              key={fac.id}
              onClick={() => setActiveFacultyTab(fac.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition ${
                activeFacultyTab === fac.id
                  ? `bg-[var(--surface-3)] ${fac.color} ${fac.border} shadow-sm font-semibold`
                  : 'bg-[var(--surface-1)] text-[var(--ink-3)] border-[var(--hairline)] hover:text-[var(--ink)]'
              }`}
            >
              <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center bg-[var(--surface-2)]">
                {fac.letter}
              </span>
              <span>{fac.name}</span>
            </button>
          ))}
        </div>

        {/* Faculty Panel Preview */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] p-6 sm:p-8 shadow-card">
          {activeFacultyTab === 'advisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--advisor)' }}>
                  <span className="dot" style={{ background: 'var(--advisor)' }}></span>
                  A — ACADEMIC ADVISOR
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Step-by-Step Roadmaps &amp; The "What to Skip" Cut List
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                  The Advisor breaks your destination into manageable weekly phases. Most importantly, it gives you your
                  <strong> Cut List</strong>: the exact confusing theories, outdated books, and noise to ignore so you never waste weeks.
                </p>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-3)] pt-2">
                  <div className="flex items-center gap-2">✓ Ordered milestones with real checkpoints</div>
                  <div className="flex items-center gap-2">✓ Tailored to your weekly schedule (5–15 hrs/week)</div>
                  <div className="flex items-center gap-2">✓ Sandeep Swadia "Cut List" rule</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
                <div className="flex justify-between items-center text-xs text-[var(--ink-3)] font-mono border-b border-[var(--hairline)] pb-2">
                  <span>Advisor Office Hours</span>
                  <span className="text-[var(--advisor)]">Live Strategy Session</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--ink)] leading-relaxed font-sans border border-[var(--hairline)]">
                  "I've configured your 6-week curriculum for E-Book Publishing. We are skipping traditional publisher query letters and going straight to reader pain validation and Gumroad pre-orders."
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-3)] text-[11px] text-[var(--advisor)] font-mono font-semibold">
                  → Checkpoint 1: Ship a 10-chapter outline with a live Gumroad pre-order landing page.
                </div>
              </div>
            </div>
          )}

          {activeFacultyTab === 'librarian' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--librarian)' }}>
                  <span className="dot" style={{ background: 'var(--librarian)' }}></span>
                  L — KNOWLEDGE LIBRARIAN &amp; GROUNDED VAULT
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Signal 10/10 Source Curation &amp; NotebookLM Vault
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                  Filters through thousands of SEO-bloated articles to give you only seminal papers, foundational textbooks,
                  and architectural breakdowns. Synthesize insights into a NotebookLM-style Grounded Vault.
                </p>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-3)] pt-2">
                  <div className="flex items-center gap-2">✓ Signal Score (1–10/10) on every resource</div>
                  <div className="flex items-center gap-2">✓ Reading status tracking (Unread / Reading / Mastered)</div>
                  <div className="flex items-center gap-2">✓ Mental Model Mastery Flashcards</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
                <div className="source-card m-0 bg-[var(--surface-1)]">
                  <div className="source-head">
                    <div>
                      <p className="source-title text-sm text-[var(--ink)]">Write Useful Books</p>
                      <p className="source-author text-xs text-[var(--ink-2)]">Rob Fitzpatrick</p>
                    </div>
                    <span className="signal-badge">Signal 10/10</span>
                  </div>
                  <p className="source-row text-xs text-[var(--ink-2)]">
                    <b className="text-[var(--ink)]">Why essential —</b> The definitive playbook for structuring nonfiction books that recommend themselves via word-of-mouth.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFacultyTab === 'tutor' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--tutor)' }}>
                  <span className="dot" style={{ background: 'var(--tutor)' }}></span>
                  T — SOCRATIC MIDNIGHT TUTOR
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Active Recall &amp; The Feynman Technique Studio
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                  Your 24/7 intellectual sparring partner. Explain complex concepts in plain English; the Tutor grades your clarity,
                  exposes hidden blind spots, and quizzes edge cases.
                </p>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-3)] pt-2">
                  <div className="flex items-center gap-2">✓ Clarity &amp; Accuracy Scoring (0–100)</div>
                  <div className="flex items-center gap-2">✓ "Explain like I'm 10" plain language drills</div>
                  <div className="flex items-center gap-2">✓ Quick diagnostic check-in quizzes</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)]">
                    <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase">Clarity</span>
                    <div className="text-lg font-bold font-display text-[var(--tutor)]">98/100</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)]">
                    <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase">Blind Spots</span>
                    <div className="text-lg font-bold font-display text-[var(--advisor)]">0 Found</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--ink-2)] italic border border-[var(--hairline)]">
                  "Clarity Verified: You articulated the core problem-solution thesis cleanly in two crisp sentences."
                </div>
              </div>
            </div>
          )}

          {activeFacultyTab === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--editor)' }}>
                  <span className="dot" style={{ background: 'var(--editor)' }}></span>
                  E — ANALYTICAL EDITOR
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Logic Pressure-Testing &amp; Work Redlines
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                  Submit drafts of your book chapters, business plans, recipes, or investment sheets. The Editor audits your logic, extracts unproven assumptions,
                  steelmans counterarguments, and provides helpful line edits.
                </p>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-3)] pt-2">
                  <div className="flex items-center gap-2">✓ Unproven assumption detection</div>
                  <div className="flex items-center gap-2">✓ Steelmanned counterargument synthesis</div>
                  <div className="flex items-center gap-2">✓ Helpful side-by-side redline diffs</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-2.5 font-mono text-xs">
                <div className="text-[var(--editor)] font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  Steelmanned Counterargument:
                </div>
                <p className="text-[11.5px] text-[var(--ink)] font-sans leading-relaxed m-0 p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)]">
                  "If your e-book pricing exceeds $30 without included templates, digital friction will reduce checkout conversions by 40%."
                </p>
              </div>
            </div>
          )}

          {activeFacultyTab === 'roommate' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--roommate)' }}>
                  <span className="dot" style={{ background: 'var(--roommate)' }}></span>
                  R — CREATIVE ROOMMATE
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Cross-Disciplinary Ideas &amp; Late-Night Sparks
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                  Break out of creative blocks. Collide your core topic with biology, history, music, or business to discover fun, non-obvious breakthroughs.
                </p>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-3)] pt-2">
                  <div className="flex items-center gap-2">✓ Creative Idea Collision Engine</div>
                  <div className="flex items-center gap-2">✓ Fun brainstorming partner</div>
                  <div className="flex items-center gap-2">✓ Creative analogical problem solving</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--ink)]">
                  <span className="font-bold text-[var(--roommate)]">Collision: Book Launches × Viral Growth Loops</span>
                  <p className="mt-1 text-[11.5px] text-[var(--ink-2)] italic leading-relaxed m-0">
                    "Embed a free bonus chapter accessible only if the reader shares their personalized quote card on social media."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Public Proof-of-Work Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--hairline-strong)] p-8 sm:p-12 shadow-card relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(94,184,245,0.15),transparent_70%)]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)] font-semibold">
                VERIFIABLE CREDENTIALS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
                Your Public Proof-of-Work Portfolio
              </h2>
              <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-sans">
                Every milestone checkpoint you complete generates a permanent, verifiable proof card. Share your live portfolio on Twitter, LinkedIn, or client proposals.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline-strong)] text-xs font-mono text-[var(--ink)]">
                  altor.app/@{user.username || 'scholar'}
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-[var(--advisor)] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Claim Handle</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 space-y-3.5 shadow-card">
                <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[color-mix(in_srgb,var(--advisor)_18%,transparent)] text-[var(--advisor)] font-bold text-xs flex items-center justify-center font-display">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[var(--ink)]">Alex Vance</div>
                      <div className="text-[10px] text-[var(--ink-3)] font-mono">3 Mastered Disciplines · 42 Checkpoints</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--tutor)_15%,transparent)] text-[var(--tutor)] text-[10px] font-mono border border-[color-mix(in_srgb,var(--tutor)_30%,transparent)] font-semibold">
                    Verified Fellow
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--ink)]">Digital Product Strategy Guide</span>
                      <span className="text-[10px] font-mono text-[var(--tutor)] font-semibold">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-2)] m-0">Live Product: gumroad.com/alex/digital-creator-playbook (100 Pre-Orders)</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--ink)]">ESP32 Telemetry Firmware</span>
                      <span className="text-[10px] font-mono text-[var(--advisor)] font-semibold">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-2)] m-0">Repository: github.com/alex/esp32-sensor-node (Deep Sleep &lt;15µA)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comparison Matrix */}
      <section id="matrix" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--tutor)] font-semibold">
            THE VALUE ARBITRAGE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            Traditional Higher Ed vs. Altor
          </h2>
          <p className="text-[var(--ink-2)] text-sm sm:text-base leading-relaxed">
            Compare 4-year institutional debt with autonomous, first-principles cognitive leverage.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[var(--hairline)] rounded-2xl overflow-hidden bg-[var(--surface-1)] shadow-card">
            <thead>
              <tr className="border-b border-[var(--hairline)] bg-[var(--surface-2)] text-xs font-mono uppercase tracking-wider text-[var(--ink-3)]">
                <th className="p-4 sm:p-5">Dimension</th>
                <th className="p-4 sm:p-5 text-rose-500 font-bold">Traditional University</th>
                <th className="p-4 sm:p-5 text-[var(--advisor)] font-bold">Altor (University in a Box)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)] text-xs sm:text-sm">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Annual Cost</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">$50,000 – $80,000 / year (Debt)</td>
                <td className="p-4 sm:p-5 text-[var(--tutor)] font-semibold">$0 Free — $15 / month</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Pacing &amp; Duration</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">Rigid 4-Year Monolith</td>
                <td className="p-4 sm:p-5 text-[var(--ink)] font-medium">Self-Driven Hyper-Velocity (4–8 Weeks)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Curriculum Freshness</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">3 to 5-year-old slides</td>
                <td className="p-4 sm:p-5 text-[var(--ink)] font-medium">Real-Time First-Principles &amp; Fresh Sources</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Feedback Frequency</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">TA grading once per month</td>
                <td className="p-4 sm:p-5 text-[var(--ink)] font-medium">24/7 Instant Socratic &amp; Logic Sparring</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Signal-to-Noise Ratio</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">Bloated general education credits</td>
                <td className="p-4 sm:p-5 text-[var(--ink)] font-medium">Ruthless "Cut List" (Skip 90% commodity noise)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-[var(--ink)]">Proof of Mastery</td>
                <td className="p-4 sm:p-5 text-[var(--ink-3)]">Paper Diploma</td>
                <td className="p-4 sm:p-5 text-[var(--advisor)] font-semibold">Shipped Checkpoint Artifacts &amp; Projects</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Pricing Tiers */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--hairline)]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)] font-semibold">
            TRANSPARENT VALUE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            Generous Free Forever. <br />
            Upgrade for Supercharged Velocity.
          </h2>
          <p className="text-[var(--ink-2)] text-sm sm:text-base leading-relaxed">
            You will never be forced to pay to learn. Our Free tier gives you full access to all 5 faculty members.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="segmented">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={billingCycle === 'monthly' ? 'active' : ''}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={billingCycle === 'annual' ? 'active' : ''}
              >
                Annual <span className="text-[10px] text-[var(--tutor)] ml-1 font-mono">SAVE 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Free Scholar */}
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-8 flex flex-col justify-between shadow-card hover:border-[var(--hairline-strong)] transition">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--ink-3)] tracking-wider font-semibold">Free Scholar</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-[var(--ink)]">$0</span>
                  <span className="text-xs text-[var(--ink-3)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-2 font-sans">
                  The complete autodidactic learning suite. Master any subject with zero paywalls.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-6 font-sans">
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span><strong>Full access to all 5 AI Faculty</strong> (Advisor, Librarian, Tutor, Editor, Roommate)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Up to <strong>2 active concurrent learning journeys</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Complete curriculum generation &amp; The Sandeep Swadia Cut List</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Socratic dialogue &amp; text-based Feynman Technique drills</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Bring-Your-Own Gemini API Key (or demo mode)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Local offline vault &amp; JSON data export/import</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchWithTopic()}
              className="mt-8 w-full py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition"
            >
              Start Free Today
            </button>
          </div>

          {/* Pro Autodidact */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border-2 border-[var(--advisor)] p-8 flex flex-col justify-between shadow-card transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[var(--advisor)] text-[#04050a] text-[10.5px] font-mono font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--advisor)] tracking-wider font-semibold">Pro Autodidact</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-[var(--ink)]">
                    {billingCycle === 'annual' ? '$12' : '$15'}
                  </span>
                  <span className="text-xs text-[var(--ink-3)]">/ month {billingCycle === 'annual' && '(billed annually)'}</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-2 font-sans">
                  For creators, investors, engineers, and knowledge workers who demand peak cognitive velocity.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-6 font-sans">
                <div className="text-[11px] font-mono text-[var(--advisor)] uppercase font-bold">
                  Everything in Free, plus:
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited active learning journeys</strong> &amp; full historical archive</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span><strong>Encrypted Cloud Vault Sync</strong> across Mac, Windows, iPad, iPhone, Android</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>🎙️ <strong>Live Audio Voice Socratic Sparring</strong> (Audio Feynman drills on the go)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>⚡ <strong>Hosted Frontier Reasoning Models</strong> (Claude 3.5 Sonnet / DeepSeek R1) included</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>📑 <strong>1-Click Export to Obsidian, Notion &amp; Markdown Graphs</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>🌐 <strong>Automated Public Proof-of-Work Portfolios</strong> (altor.app/@you)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchWithTopic()}
              className="mt-8 w-full py-3.5 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-md transition transform hover:-translate-y-0.5"
            >
              Start 14-Day Pro Trial
            </button>
          </div>

          {/* Fellow Quad */}
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-8 flex flex-col justify-between shadow-card hover:border-[var(--hairline-strong)] transition">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--roommate)] tracking-wider font-semibold">Fellow Quad</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-[var(--ink)]">
                    {billingCycle === 'annual' ? '$24' : '$29'}
                  </span>
                  <span className="text-xs text-[var(--ink-3)]">/ month {billingCycle === 'annual' && '(billed annually)'}</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-2 font-sans">
                  For study groups, research labs, team upskilling, and elite polymaths.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-6 font-sans">
                <div className="text-[11px] font-mono text-[var(--roommate)] uppercase font-bold">
                  Everything in Pro, plus:
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>👥 <strong>Collaborative Quad Study Rooms</strong> (Co-spar with up to 4 study partners)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>📜 <strong>Verifiable Cryptographic Proof-of-Mastery Credentials</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>🧠 <strong>Custom Historical Persona Calibration</strong> (Feynman, von Neumann mode)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check size={16} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>⚡ <strong>Dedicated High-Throughput Inference &amp; Beta Access</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchWithTopic()}
              className="mt-8 w-full py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink)] transition"
            >
              Explore Fellow Quad
            </button>
          </div>
        </div>
      </section>

      {/* 9. The Manifesto & Final CTA */}
      <section id="manifesto" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle,rgba(95,219,158,0.1),transparent_70%)]" />

        <div className="space-y-6 relative z-10">
          <blockquote className="font-display text-2xl sm:text-4xl font-semibold text-[var(--ink)] leading-relaxed italic max-w-3xl mx-auto">
            "In an age of infinite AI leverage, the self-directed mind inherits the world. The passive consumer inherits obsolete knowledge."
          </blockquote>

          <p className="text-xs font-mono text-[var(--ink-3)] tracking-widest uppercase">
            — The Altor Autodidactic Creed
          </p>

          <div className="pt-8">
            <button
              onClick={() => handleLaunchWithTopic()}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--advisor)] to-[var(--tutor)] text-[#04050a] font-bold text-base shadow-lg transition transform hover:-translate-y-1 hover:brightness-110 flex items-center gap-2.5 mx-auto"
            >
              <GraduationCap size={20} />
              <span>Enter the Academy Free →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)] py-12 px-6 bg-[var(--surface-1)] text-xs text-[var(--ink-3)] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-center font-display text-[10px] text-[var(--ink)]">
              A
            </div>
            <span className="font-semibold text-[var(--ink)]">Altor — University in a Box</span>
          </div>

          <div>
            Built for ambitious autodidacts across every discipline. Inspired by the A.L.T.E.R. Framework.
          </div>

          <div className="flex gap-6">
            <button onClick={onEnterApp} className="hover:text-[var(--ink)] transition">App Dashboard</button>
            <a href="#pricing" className="hover:text-[var(--ink)] transition">Pricing</a>
            <a href="#examples" className="hover:text-[var(--ink)] transition">Case Studies</a>
          </div>
        </div>
      </footer>

      {/* Socratic Diagnostic Intake & Baseline Calibration Modal */}
      <DiagnosticIntakeModal
        isOpen={isDiagnosticModalOpen}
        initialTopic={diagnosticTopic || simTopic}
        onClose={() => setIsDiagnosticModalOpen(false)}
        onLaunchJourney={onEnterApp}
      />
    </div>
  );
};
