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
  Briefcase
} from 'lucide-react';
import { AlterPersona } from '../../types/alter';

interface LandingPageProps {
  onEnterApp: () => void;
}

type CategoryType = 'all' | 'business' | 'creative' | 'finance' | 'tech';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { setIsCreateModalOpen } = useJourney();
  const { user, setIsAuthModalOpen } = useAuth();

  const [activeFacultyTab, setActiveFacultyTab] = useState<AlterPersona>('advisor');
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [activeCaseStudy, setActiveCaseStudy] = useState<string>('ebook');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Interactive Hero Simulator state
  const [simTopic, setSimTopic] = useState('E-Book Publishing Business');
  const [isSimulating, setIsSimulating] = useState(false);

  const heroPresetTopics = [
    { label: '📚 E-Book Publishing Empire', value: 'E-Book Publishing Business' },
    { label: '🌿 Indoor Herb Gardening', value: 'Organic Culinary Herb & Urban Gardening' },
    { label: '💰 Personal Finance & Investing', value: 'Personal Finance & Cash-Flow Investing' },
    { label: '🤖 Autonomous AI Agents', value: 'Autonomous AI Agents' },
    { label: '⚡ DIY Electronics & ESP32', value: 'DIY Electronics & Embedded Systems' },
    { label: '🗣️ Public Speaking & Keynotes', value: 'Executive Persuasion & Public Speaking' }
  ];

  const simulatedOutputs: Record<string, { brief: string; cutList: string[]; phase1: string; checkpoint: string }> = {
    'E-Book Publishing Business': {
      brief: 'Master niche topic validation, first-principles outline structuring, high-conversion copy, direct-to-consumer digital distribution, and automated launch funnels.',
      cutList: [
        'Skip 3-month traditional publisher query letter rituals.',
        'Skip generic social media follower growth schemes before having a validated manuscript.',
        'Avoid complex paid ad campaigns until your landing page conversion rate is proven.'
      ],
      phase1: 'Phase 1: Market Gap Validation & 1-Page Thesis Outline (Weeks 1–2)',
      checkpoint: 'Write a validated 10-chapter book proposal with sample chapter, pre-order Gumroad landing page, and 50 early waitlist signups.'
    },
    'Organic Culinary Herb & Urban Gardening': {
      brief: 'Master indoor container biology, soil microbial ecology, PAR spectrum light cycles, nutrient feeding schedules, and continuous vegetative pruning.',
      cutList: [
        'Skip 100-acre commercial farming agronomy manuals.',
        'Skip synthetic chemical pesticide guides for indoor culinary greens.',
        'Avoid expensive automated greenhouse kits before learning manual moisture & light balancing.'
      ],
      phase1: 'Phase 1: Seed Germination, Soil Aeration & Spectrum Lighting (Weeks 1–2)',
      checkpoint: 'Set up a 4-pot indoor nursery with custom organic potting mix, full-spectrum LED light schedule, and germinate basil, rosemary, and thyme seedlings.'
    },
    'Personal Finance & Cash-Flow Investing': {
      brief: 'Deconstruct cash-flow allocation, high-yield debt elimination, index fund portfolio rebalancing, tax-advantaged accounts, and real estate cash-on-cash underwriting.',
      cutList: [
        'Skip speculative day-trading Discord channels and meme coin pumps.',
        'Skip high-fee financial advisor mutual fund brochures.',
        'Avoid complex option straddles before mastering core index fund asset allocation.'
      ],
      phase1: 'Phase 1: Cash Flow Audit, Emergency Reserves & Index Foundations (Weeks 1–2)',
      checkpoint: 'Build an automated monthly cash-flow spreadsheet modeling a 3-fund Boglehead portfolio, tax deductions, and a 10-year retirement projection.'
    },
    'Autonomous AI Agents': {
      brief: 'Master first-principles agentic cognitive loops, hierarchical memory architectures, deterministic planning, and self-correcting swarm coordination.',
      cutList: [
        'Skip superficial LangChain "hello world" wrapper tutorials.',
        'Skip generic prompt engineering blogs without evaluation harnesses.',
        'Avoid building toy chatbots with zero state persistence or tool grounding.'
      ],
      phase1: 'Phase 1: Agentic Cognitive Loops & State Machines (Weeks 1–2)',
      checkpoint: 'Ship an autonomous ReAct loop with deterministic state transitions, memory recall, and tool execution verification in Python/TypeScript.'
    },
    'DIY Electronics & Embedded Systems': {
      brief: 'Master microcontroller architectures, GPIO registers, breadboard prototyping, I2C/SPI bus protocols, and power-efficient C/C++ firmware.',
      cutList: [
        'Skip 30 hours of dry semiconductor chemistry theory.',
        'Skip high-level Python Raspberry Pi scripts that hide the hardware registers.',
        'Avoid buying bloated pre-built kits without learning manual schematic wiring.'
      ],
      phase1: 'Phase 1: Microcontroller Registers, Power & Breadboarding (Weeks 1–2)',
      checkpoint: 'Wire an ESP32 with a BME280 sensor over I2C on a breadboard, read raw telemetry registers in C++, and put the chip into deep sleep (<15µA).'
    },
    'Executive Persuasion & Public Speaking': {
      brief: 'Master narrative story architecture, rhetorical contrast framing, vocal modulation, impromptu rebuttal sparring, and keynote presentation delivery.',
      cutList: [
        'Skip superficial slide transition animations and visual clutter.',
        'Skip memorizing scripted speeches word-for-word without understanding core beat markers.',
        'Avoid reading bullet points directly from slides.'
      ],
      phase1: 'Phase 1: Core Thesis Framing & 3-Act Narrative Arc (Weeks 1–2)',
      checkpoint: 'Deliver and record a 5-minute impromptu persuasive pitch on video, evaluated for thesis clarity, pacing, and zero filler words.'
    }
  };

  const currentSim = simulatedOutputs[simTopic] || simulatedOutputs['E-Book Publishing Business'];

  const handleSelectSim = (topic: string) => {
    setIsSimulating(true);
    setSimTopic(topic);
    setTimeout(() => setIsSimulating(false), 250);
  };

  const handleLaunchWithTopic = () => {
    setIsCreateModalOpen(true);
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
      advisorCut: 'Skip traditional 6-month agent query loops; focus on pain validation & Gumroad distribution.',
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
      proofOfWork: 'Automated 10-Year Wealth Spreadsheet & Stress-Tested Real Estate Underwriting Model'
    },
    {
      id: 'hardware',
      category: 'tech',
      title: 'DIY Electronics & ESP32 IoT Sensor Engineering',
      tag: 'Hardware & Embedded',
      icon: Cpu,
      color: 'text-[var(--editor)]',
      border: 'border-[var(--editor)]',
      advisorCut: 'Skip 40 hours of dry semiconductor chemistry; focus on GPIO registers & I2C protocols.',
      tutorDrill: '"Explain how an ADC converts analog voltage to a 12-bit binary number without technical jargon."',
      editorAudit: 'Audits PCB schematics and detects interrupt service routine race conditions.',
      roommateSpark: 'Sensor Sampling × Mammalian Respiration Rates',
      proofOfWork: 'Custom Soldered ESP32 Weather Node with I2C Telemetry & Deep Sleep (<15µA)'
    },
    {
      id: 'ai',
      category: 'tech',
      title: 'Autonomous AI Agents & Systems Architecture',
      tag: 'AI Engineering',
      icon: Terminal,
      color: 'text-[var(--advisor)]',
      border: 'border-[var(--advisor)]',
      advisorCut: 'Skip superficial LangChain wrappers; master state machines & MCP tool evaluation.',
      tutorDrill: '"Why do cyclic graph loops require deterministic state persistence during tool failure?"',
      editorAudit: 'Exposes lack of idempotent retry execution in payment agent workflows.',
      roommateSpark: 'Agent Swarms × Roman Legionary Tactical Command',
      proofOfWork: 'Production Python ReAct Agent Engine with Vector Recall & MCP Tools'
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
    }
  ];

  const filteredCaseStudies = activeCategory === 'all'
    ? caseStudies
    : caseStudies.filter(cs => cs.category === activeCategory);

  const selectedStudy = caseStudies.find(cs => cs.id === activeCaseStudy) || caseStudies[0];

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] font-sans selection:bg-[var(--accent)] selection:text-[#04050a] overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[rgba(4,5,10,0.85)] backdrop-blur-md border-b border-white/[0.07] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a3550] to-[#10141d] border border-white/[0.13] flex items-center justify-center font-display font-bold text-sm text-[var(--advisor)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              A
            </div>
            <div className="font-display font-semibold text-lg text-white tracking-tight flex items-center gap-2">
              Altor
              <span className="text-[10px] font-mono tracking-widest text-white/40 border border-white/[0.13] rounded px-1.5 py-0.5">
                UNIV
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-white/60 font-medium">
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#examples" className="hover:text-white transition">What You Can Master</a>
            <a href="#faculty" className="hover:text-white transition">The 5 Faculty</a>
            <a href="#matrix" className="hover:text-white transition">University vs. Altor</a>
            <a href="#pricing" className="hover:text-white transition">Tiers</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Sign In / Profile Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white/80 hover:text-white transition flex items-center gap-1.5"
            >
              <User size={13} />
              <span>{user.isGuest ? 'Sign In / Sync' : user.username}</span>
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-lg bg-[var(--surface-3)] hover:border-white/[0.2] border border-white/[0.1] text-xs font-semibold text-white transition flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(94,184,245,0.12),transparent_70%)]" />
        
        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(94,184,245,0.08)] border border-[rgba(94,184,245,0.25)] text-xs font-mono text-[var(--advisor)] tracking-wide">
            <Sparkles size={13} className="text-[var(--advisor)]" />
            <span>THE AUTONOMOUS UNIVERSITY FOR AMBITIOUS MINDS</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Master Any Discipline. <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-[var(--advisor)] bg-clip-text text-transparent">
              Build Your University in a Box.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-sans">
            From writing a profitable book to indoor gardening, financial investing, hardware hacking, or AI systems.
            Five specialized AI faculty members cut the noise, drill your intuition, and guide you to real proof-of-work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={handleLaunchWithTopic}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-sm shadow-[0_0_30px_rgba(94,184,245,0.3)] transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>Start Learning Free — No Credit Card</span>
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-white/[0.1] text-white/80 hover:text-white font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <span>See 4-Step Interactive Guide</span>
              <ChevronRight size={15} />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 pt-1 text-xs font-mono text-white/40">
            <span>✓ 100% Free Forever Tier</span>
            <span>•</span>
            <span>✓ Bring-Your-Own API Key</span>
            <span>•</span>
            <span>✓ Local &amp; Cloud Vault</span>
          </div>
        </div>

        {/* 2.5 Hero Interactive Sandbox / Journey Simulator */}
        <div className="mt-14 relative z-10 max-w-5xl mx-auto rounded-2xl bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border border-white/[0.12] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--advisor)] uppercase tracking-wider mb-1">
                <Radio size={14} className="animate-pulse text-[var(--advisor)]" />
                Live Curriculum Simulator
              </div>
              <h3 className="font-display text-xl font-bold text-white m-0">
                Test the Academic Advisor Engine Right Now
              </h3>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {heroPresetTopics.map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => handleSelectSim(topic.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    simTopic === topic.value
                      ? 'bg-[var(--advisor)] text-[#04050a] font-semibold shadow-sm'
                      : 'bg-[var(--surface-3)] text-white/60 hover:text-white border border-white/[0.07]'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-white/[0.07]">
                <div className="text-[11px] font-mono uppercase text-white/40 tracking-wider mb-1">
                  Strategic Advisor Brief
                </div>
                <p className="text-sm text-white/90 leading-relaxed m-0 font-sans">
                  {currentSim.brief}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-l-2 border-white/[0.07] border-l-[var(--advisor)]">
                <div className="text-[11px] font-mono uppercase text-[var(--advisor)] tracking-wider mb-1">
                  Active Milestone
                </div>
                <h4 className="text-sm font-semibold text-white m-0 mb-1.5">
                  {currentSim.phase1}
                </h4>
                <p className="text-xs text-white/60 m-0 leading-relaxed">
                  <strong className="text-white">Proof of Work:</strong> {currentSim.checkpoint}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[rgba(234,176,84,0.25)] space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--editor)] text-xs font-semibold">
                  <ShieldAlert size={14} />
                  <span>The Sandeep Swadia "Cut List" (What to Skip)</span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-white/60 pl-2">
                  {currentSim.cutList.map((cut, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-mono">✕</span>
                      <span>{cut}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLaunchWithTopic}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--surface-3)] to-[color-mix(in_srgb,var(--advisor)_20%,var(--surface-3))] hover:border-[var(--advisor)] border border-white/[0.15] text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
              >
                <span>Launch Full University for "{simTopic}" →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive 4-Step Walkthrough Guide */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)]">
            HOW ALTOR WORKS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            The 4-Step Cognitive Mastery Loop
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            How five AI mentors transform your ambition into structured, verifiable mastery without the fluff.
          </p>
        </div>

        {/* 4 Interactive Step Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-8">
          {[
            { step: 1, title: '1. Declare Destination', desc: 'Define precise outcome & hours/week' },
            { step: 2, title: '2. Lock in The Cut List', desc: 'Skip the 90% commodity noise' },
            { step: 3, title: '3. Socratic Sparring', desc: 'Feynman drills & logic audits' },
            { step: 4, title: '4. Ship Proof of Work', desc: 'Verifiable portfolio artifacts' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveWalkthroughStep(s.step)}
              className={`p-4 rounded-xl border text-left transition ${
                activeWalkthroughStep === s.step
                  ? 'bg-[var(--surface-3)] border-[var(--advisor)] shadow-lg shadow-black/40'
                  : 'bg-[var(--surface-2)] border-white/[0.07] text-white/50 hover:text-white hover:border-white/[0.15]'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1 font-display">{s.title}</div>
              <div className="text-[11px] text-white/50 leading-relaxed font-sans">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Walkthrough Interactive Sandbox State Card */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[var(--surface-2)] border border-white/[0.1] p-6 sm:p-8 shadow-card">
          {activeWalkthroughStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full bg-[var(--advisor)]/10 text-[var(--advisor)] border border-[var(--advisor)]/25 text-[10px] font-mono uppercase">
                  Step 1: The Starting Line
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  Declare Any Destination (Coding, Cooking, Books, or Finance)
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  Instead of generic goals like "learn finance" or "learn to code", you define a sharp outcome:
                  <em> "Underwrite my first multi-family property"</em> or <em>"Publish my first non-fiction e-book"</em>.
                </p>
                <div className="text-xs font-mono text-white/50 space-y-1.5">
                  <div>✓ Calibrated to your baseline knowledge</div>
                  <div>✓ Tailored to your weekly schedule (5 to 20 hrs/week)</div>
                  <div>✓ Instant customized 5-Faculty Board generation</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3 font-mono text-xs">
                <div className="text-white/40 text-[11px]">User Input Prompt:</div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] text-[var(--advisor)]">
                  Topic: "Indoor Urban Gardening"<br />
                  Destination: "Continuous weekly culinary herb harvest in a small apartment"<br />
                  Pacing: 6 hrs/week · Depth: Practical Builder
                </div>
              </div>
            </div>
          )}

          {activeWalkthroughStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full bg-[var(--editor)]/10 text-[var(--editor)] border border-[var(--editor)]/25 text-[10px] font-mono uppercase">
                  Step 2: Sandeep Swadia Cut List
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  The Advisor Cuts the 90% Commodity Fluff
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  The #1 reason learners burn out is cognitive overload. Your Academic Advisor explicitly tells you
                  what <strong>NOT</strong> to waste your time on, keeping your velocity high.
                </p>
                <div className="text-xs font-mono text-white/50 space-y-1.5">
                  <div>✓ Prevents tutorial hell and video bingeing</div>
                  <div>✓ Identifies high-signal 1% foundational books and papers</div>
                  <div>✓ Organizes milestones with clear checkpoints</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2.5 font-mono text-xs">
                <div className="text-[var(--editor)] font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>The Cut List Strategy:</span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-white/70 font-sans">
                  <div className="p-2 rounded bg-rose-500/10 text-rose-300">✕ SKIP: 30 hours of commercial farming soil chemistry</div>
                  <div className="p-2 rounded bg-[var(--tutor)]/10 text-[var(--tutor)]">✓ FOCUS: Potting soil aeration, PAR light spectrum, and vegetative node pruning</div>
                </div>
              </div>
            </div>
          )}

          {activeWalkthroughStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full bg-[var(--tutor)]/10 text-[var(--tutor)] border border-[var(--tutor)]/25 text-[10px] font-mono uppercase">
                  Step 3: Active Sparring
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  Socratic Sparring, Feynman Drills &amp; Logic Audits
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  No passive multiple-choice tests. The Socratic Tutor forces you to explain concepts in plain language,
                  grades your clarity, while the Analytical Editor audits your draft essays or project schematics.
                </p>
                <div className="text-xs font-mono text-white/50 space-y-1.5">
                  <div>✓ Instant clarity &amp; accuracy grading (0–100)</div>
                  <div>✓ Unproven assumption and blind spot detection</div>
                  <div>✓ Cross-domain collisions with distant fields</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Clarity Score</span>
                    <div className="text-lg font-bold font-display text-[var(--tutor)]">96/100</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Blind Spots</span>
                    <div className="text-lg font-bold font-display text-[var(--advisor)]">0 Detected</div>
                  </div>
                </div>
                <p className="text-xs text-white/80 italic m-0 p-2.5 rounded-lg bg-[var(--surface-2)]">
                  "Mastery Verified: You explained node pinching auxin hormones cleanly without hiding behind botanical jargon."
                </p>
              </div>
            </div>
          )}

          {activeWalkthroughStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full bg-[var(--roommate)]/10 text-[var(--roommate)] border border-[var(--roommate)]/25 text-[10px] font-mono uppercase">
                  Step 4: Real Proof of Work
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  Ship Verifiable Deliverables &amp; Build Your Portfolio
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  You graduate each phase by completing a tangible project: a published book, a live web application,
                  a functioning indoor garden, a financial model, or a recorded speech.
                </p>
                <div className="text-xs font-mono text-white/50 space-y-1.5">
                  <div>✓ Verifiable public URL (altor.app/@yourname)</div>
                  <div>✓ Share on LinkedIn, GitHub, or client proposals</div>
                  <div>✓ Concrete evidence of real-world competence</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2 text-xs">
                  <span className="font-semibold text-white">Verified Deliverable</span>
                  <span className="text-[var(--tutor)] font-mono text-[11px]">100% Passed</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] text-xs text-white/80 leading-relaxed">
                  Artifact: 4-Tier Vertical Indoor Micro-Herb Setup (Basil, Rosemary, Thyme)<br />
                  Status: 100% Germinated &amp; Continuous Vegetative Yield Logged
                </div>
                <button
                  onClick={handleLaunchWithTopic}
                  className="w-full py-2.5 rounded-lg bg-[var(--advisor)] text-[#04050a] font-bold text-xs"
                >
                  Start Your First Journey →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Expanded Multidisciplinary Showcase (What You Can Master) */}
      <section id="examples" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--tutor)]">
            REAL-WORLD CASE STUDIES
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Learn Anything. From Books to Botany to Code.
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            See how the 5 Faculty members guide everyday creators, writers, investors, gardeners, and developers from Day 0 to Shipped Proof-of-Work.
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
                  ? 'bg-[var(--surface-3)] text-white border border-white/[0.2] shadow-sm'
                  : 'bg-[var(--surface-1)] text-white/50 border border-white/[0.07] hover:text-white'
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
                className="card p-6 flex flex-col justify-between bg-[var(--surface-2)] border border-white/[0.08] hover:border-white/[0.18] transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${cs.color}`}>
                      {cs.tag}
                    </span>
                    <Icon size={16} className={cs.color} />
                  </div>

                  <h4 className="font-display text-base font-bold text-white m-0 leading-snug">
                    {cs.title}
                  </h4>

                  <div className="space-y-2 text-xs text-white/70 border-t border-white/[0.07] pt-3 font-sans">
                    <div>
                      <strong className="text-white/90">Cut List:</strong> {cs.advisorCut}
                    </div>
                    <div>
                      <strong className="text-white/90">Socratic Drill:</strong> <em>{cs.tutorDrill}</em>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.07]">
                  <div className="text-[10px] font-mono text-[var(--tutor)] uppercase mb-1 font-semibold">
                    ✓ Final Checkpoint Deliverable:
                  </div>
                  <div className="text-xs text-white/90 font-medium leading-snug">
                    {cs.proofOfWork}
                  </div>
                  <button
                    onClick={() => {
                      setSimTopic(cs.title);
                      setIsCreateModalOpen(true);
                    }}
                    className="mt-3 w-full py-2 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] border border-white/[0.1] text-xs font-semibold text-white/90 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Start This Track</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. The 5 Faculty Framework */}
      <section id="faculty" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)]">
            THE A.L.T.E.R. FRAMEWORK
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Meet Your 5-Member AI Faculty Board
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Each persona is hyper-calibrated for a specific phase of the cognitive mastery loop.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'advisor' as AlterPersona, letter: 'A', name: 'Academic Advisor', color: 'text-[var(--advisor)]', border: 'border-[var(--advisor)]' },
            { id: 'librarian' as AlterPersona, letter: 'L', name: 'Knowledge Librarian', color: 'text-[var(--librarian)]', border: 'border-[var(--librarian)]' },
            { id: 'tutor' as AlterPersona, letter: 'T', name: 'Socratic Tutor', color: 'text-[var(--tutor)]', border: 'border-[var(--tutor)]' },
            { id: 'editor' as AlterPersona, letter: 'E', name: 'Analytical Editor', color: 'text-[var(--editor)]', border: 'border-[var(--editor)]' },
            { id: 'roommate' as AlterPersona, letter: 'R', name: 'Lateral Roommate', color: 'text-[var(--roommate)]', border: 'border-[var(--roommate)]' }
          ].map((fac) => (
            <button
              key={fac.id}
              onClick={() => setActiveFacultyTab(fac.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition ${
                activeFacultyTab === fac.id
                  ? `bg-[var(--surface-3)] ${fac.color} ${fac.border} shadow-lg shadow-black/40`
                  : 'bg-[var(--surface-1)] text-white/50 border-white/[0.07] hover:text-white hover:border-white/[0.15]'
              }`}
            >
              <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center bg-white/[0.05]">
                {fac.letter}
              </span>
              <span>{fac.name}</span>
            </button>
          ))}
        </div>

        {/* Faculty Panel Preview */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[var(--surface-2)] border border-white/[0.1] p-6 sm:p-8 shadow-card">
          {activeFacultyTab === 'advisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="role-chip" style={{ color: 'var(--advisor)' }}>
                  <span className="dot" style={{ background: 'var(--advisor)' }}></span>
                  A — ACADEMIC ADVISOR
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Ruthless Roadmaps &amp; The Sandeep Swadia Cut List
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  The Advisor breaks your destination into rigorous, milestone-driven phases. Most importantly, it locks in your
                  <strong> Cut List</strong>: the exact frameworks, tutorials, and noise to explicitly ignore so you never waste weeks on commodity fluff.
                </p>
                <div className="space-y-2 text-xs font-mono text-white/50 pt-2">
                  <div className="flex items-center gap-2">✓ Milestone-based Proof-of-Work Checkpoints</div>
                  <div className="flex items-center gap-2">✓ Pacing &amp; Depth Customization (10 hrs/week)</div>
                  <div className="flex items-center gap-2">✓ Swadia "What to Skip" Rule</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="flex justify-between items-center text-xs text-white/40 font-mono border-b border-white/[0.07] pb-2">
                  <span>Advisor Office Hours</span>
                  <span className="text-[var(--advisor)]">Live Strategy Session</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] text-xs text-white/80 leading-relaxed font-sans">
                  "I've configured your 6-week curriculum for E-Book Publishing. We are skipping traditional publisher query letters and going straight to reader pain validation and Gumroad pre-orders."
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-3)] text-[11px] text-[var(--advisor)] font-mono">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Signal 10/10 Source Curation &amp; NotebookLM Vault
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  Filters through thousands of SEO-bloated articles to give you only seminal papers, foundational textbooks,
                  and architectural breakdowns. Synthesize insights into a NotebookLM-style Grounded Vault.
                </p>
                <div className="space-y-2 text-xs font-mono text-white/50 pt-2">
                  <div className="flex items-center gap-2">✓ Signal Score (1–10/10) on every resource</div>
                  <div className="flex items-center gap-2">✓ Reading status tracking (Unread / Reading / Mastered)</div>
                  <div className="flex items-center gap-2">✓ Mental Model Mastery Flashcards</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="source-card m-0">
                  <div className="source-head">
                    <div>
                      <p className="source-title text-sm">Write Useful Books</p>
                      <p className="source-author text-xs">Rob Fitzpatrick</p>
                    </div>
                    <span className="signal-badge">Signal 10/10</span>
                  </div>
                  <p className="source-row text-xs">
                    <b>Why essential —</b> The definitive playbook for structuring nonfiction books that recommend themselves via word-of-mouth.
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Active Recall &amp; The Feynman Technique Studio
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  Your 24/7 intellectual sparring partner. Explain complex concepts in plain English; the Tutor grades your clarity,
                  exposes hidden blind spots, and quizzes edge cases.
                </p>
                <div className="space-y-2 text-xs font-mono text-white/50 pt-2">
                  <div className="flex items-center gap-2">✓ Clarity &amp; Accuracy Scoring (0–100)</div>
                  <div className="flex items-center gap-2">✓ Jargon Detection &amp; Child Analogy Generation</div>
                  <div className="flex items-center gap-2">✓ Edge-Case Diagnostic Quizzes</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Clarity</span>
                    <div className="text-lg font-bold font-display text-[var(--tutor)]">98/100</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Blind Spots</span>
                    <div className="text-lg font-bold font-display text-[var(--advisor)]">0 Found</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] text-xs text-white/70 italic">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Logic Pressure-Testing &amp; Steelmanning
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  Submit design documents, essays, or architectural proposals. The Editor audits your logic, extracts unproven assumptions,
                  steelmans the strongest counterargument, and delivers surgical redlines.
                </p>
                <div className="space-y-2 text-xs font-mono text-white/50 pt-2">
                  <div className="flex items-center gap-2">✓ Unproven assumption detection</div>
                  <div className="flex items-center gap-2">✓ Steelmanned counterargument synthesis</div>
                  <div className="flex items-center gap-2">✓ Surgical side-by-side redline diffs</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2.5 font-mono text-xs">
                <div className="text-[var(--editor)] font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  Steelmanned Counterargument:
                </div>
                <p className="text-[11.5px] text-white/70 font-sans leading-relaxed m-0 p-3 rounded-lg bg-[var(--surface-2)]">
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
                  R — LATERAL-THINKING ROOMMATE
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Cross-Disciplinary Domain Collisions
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  Break out of local intellectual maximums. Collide your core topic with Evolutionary Biology, Roman Military Strategy,
                  Jazz Improvisation, or Cybernetics to uncover non-obvious breakthroughs.
                </p>
                <div className="space-y-2 text-xs font-mono text-white/50 pt-2">
                  <div className="flex items-center gap-2">✓ Domain Collision Engine (Topic × Distant Field)</div>
                  <div className="flex items-center gap-2">✓ Unfiltered late-night dorm lounge debates</div>
                  <div className="flex items-center gap-2">✓ Creative analogical problem solving</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-3">
                <div className="p-3 rounded-lg bg-[color-mix(in_srgb,var(--roommate)_10%,var(--surface-2))] border border-[color-mix(in_srgb,var(--roommate)_25%,transparent)] text-xs text-white/90">
                  <span className="font-bold text-[var(--roommate)]">Collision: Book Launches × Viral Growth Loops</span>
                  <p className="mt-1 text-[11.5px] text-white/70 italic leading-relaxed m-0">
                    "Embed a free bonus chapter accessible only if the reader shares their personalized quote card on social media."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Public Proof-of-Work Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface-1)] border border-white/[0.12] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(94,184,245,0.15),transparent_70%)]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)]">
                VERIFIABLE CREDENTIALS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Your Public Autodidact Proof-of-Work Portfolio
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                Every milestone checkpoint you complete generates a permanent, verifiable proof card. Share your live portfolio on Twitter, LinkedIn, or client proposals.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-white/[0.1] text-xs font-mono text-white/80">
                  altor.app/@{user.username || 'scholar'}
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-[var(--advisor)] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Claim Handle</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[var(--surface-1)] border border-white/[0.1] p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--advisor)]/20 text-[var(--advisor)] font-bold text-xs flex items-center justify-center font-display">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">Alex Vance</div>
                      <div className="text-[10px] text-white/40 font-mono">3 Mastered Disciplines · 42 Checkpoints</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[var(--tutor)]/10 text-[var(--tutor)] text-[10px] font-mono border border-[var(--tutor)]/20">
                    Verified Fellow
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-white/[0.07] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Digital Product Strategy Guide</span>
                      <span className="text-[10px] font-mono text-[var(--tutor)]">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-white/50 m-0">Live Product: gumroad.com/alex/digital-creator-playbook (100 Pre-Orders)</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-white/[0.07] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">ESP32 Telemetry Firmware</span>
                      <span className="text-[10px] font-mono text-[var(--advisor)]">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-white/50 m-0">Repository: github.com/alex/esp32-sensor-node (Deep Sleep &lt;15µA)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comparison Matrix */}
      <section id="matrix" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--tutor)]">
            THE VALUE ARBITRAGE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Traditional Higher Ed vs. Altor
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Compare 4-year institutional debt with autonomous, first-principles cognitive leverage.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse border border-white/[0.07] rounded-2xl overflow-hidden bg-[var(--surface-2)]">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[var(--surface-1)] text-xs font-mono uppercase tracking-wider text-white/50">
                <th className="p-4 sm:p-5">Dimension</th>
                <th className="p-4 sm:p-5 text-rose-300">Traditional University</th>
                <th className="p-4 sm:p-5 text-[var(--advisor)] font-bold">Altor (University in a Box)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07] text-xs sm:text-sm">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Annual Cost</td>
                <td className="p-4 sm:p-5 text-white/50">$50,000 – $80,000 / year (Debt)</td>
                <td className="p-4 sm:p-5 text-[var(--tutor)] font-semibold">$0 Free — $15 / month</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Pacing &amp; Duration</td>
                <td className="p-4 sm:p-5 text-white/50">Rigid 4-Year Monolith</td>
                <td className="p-4 sm:p-5 text-white font-medium">Self-Driven Hyper-Velocity (4–8 Weeks)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Curriculum Freshness</td>
                <td className="p-4 sm:p-5 text-white/50">3 to 5-year-old slides</td>
                <td className="p-4 sm:p-5 text-white font-medium">Real-Time First-Principles &amp; ArXiv Papers</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Feedback Frequency</td>
                <td className="p-4 sm:p-5 text-white/50">TA grading once per month</td>
                <td className="p-4 sm:p-5 text-white font-medium">24/7 Instant Socratic &amp; Logic Sparring</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Signal-to-Noise Ratio</td>
                <td className="p-4 sm:p-5 text-white/50">Bloated general education credits</td>
                <td className="p-4 sm:p-5 text-white font-medium">Ruthless "Cut List" (Skip 90% commodity noise)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Proof of Mastery</td>
                <td className="p-4 sm:p-5 text-white/50">Paper Diploma</td>
                <td className="p-4 sm:p-5 text-[var(--advisor)] font-semibold">Shipped Checkpoint Artifacts &amp; Repositories</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Pricing Tiers */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--advisor)]">
            TRANSPARENT VALUE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Generous Free Forever. <br />
            Upgrade for Cognitive Superpowers.
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
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
          <div className="rounded-2xl bg-[var(--surface-2)] border border-white/[0.08] p-8 flex flex-col justify-between shadow-card hover:border-white/[0.15] transition">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Free Scholar</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-white">$0</span>
                  <span className="text-xs text-white/40">/ forever</span>
                </div>
                <p className="text-xs text-white/60 mt-2 font-sans">
                  The complete autodidactic learning suite. Master any subject with zero paywalls.
                </p>
              </div>

              <div className="space-y-3 text-xs text-white/80 border-t border-white/[0.07] pt-6 font-sans">
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
              onClick={handleLaunchWithTopic}
              className="mt-8 w-full py-3 rounded-xl bg-[var(--surface-3)] hover:border-white/[0.2] border border-white/[0.1] text-xs font-semibold text-white transition"
            >
              Start Free Today
            </button>
          </div>

          {/* Pro Autodidact */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[var(--surface-3)] to-[var(--surface-2)] border-2 border-[var(--advisor)] p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(94,184,245,0.15)] transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[var(--advisor)] text-[#04050a] text-[10.5px] font-mono font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--advisor)] tracking-wider">Pro Autodidact</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-white">
                    {billingCycle === 'annual' ? '$12' : '$15'}
                  </span>
                  <span className="text-xs text-white/40">/ month {billingCycle === 'annual' && '(billed annually)'}</span>
                </div>
                <p className="text-xs text-white/60 mt-2 font-sans">
                  For creators, investors, engineers, and knowledge workers who demand peak cognitive velocity.
                </p>
              </div>

              <div className="space-y-3 text-xs text-white/90 border-t border-white/[0.07] pt-6 font-sans">
                <div className="text-[11px] font-mono text-[var(--advisor)] uppercase font-semibold">
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
              onClick={handleLaunchWithTopic}
              className="mt-8 w-full py-3.5 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-lg shadow-[rgba(94,184,245,0.25)] transition transform hover:-translate-y-0.5"
            >
              Start 14-Day Pro Trial
            </button>
          </div>

          {/* Fellow Quad */}
          <div className="rounded-2xl bg-[var(--surface-2)] border border-white/[0.08] p-8 flex flex-col justify-between shadow-card hover:border-white/[0.15] transition">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--roommate)] tracking-wider">Fellow Quad</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-display font-bold text-white">
                    {billingCycle === 'annual' ? '$24' : '$29'}
                  </span>
                  <span className="text-xs text-white/40">/ month {billingCycle === 'annual' && '(billed annually)'}</span>
                </div>
                <p className="text-xs text-white/60 mt-2 font-sans">
                  For study groups, research labs, team upskilling, and elite polymaths.
                </p>
              </div>

              <div className="space-y-3 text-xs text-white/80 border-t border-white/[0.07] pt-6 font-sans">
                <div className="text-[11px] font-mono text-[var(--roommate)] uppercase font-semibold">
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
              onClick={handleLaunchWithTopic}
              className="mt-8 w-full py-3 rounded-xl bg-[var(--surface-3)] hover:border-white/[0.2] border border-white/[0.1] text-xs font-semibold text-white transition"
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
          <blockquote className="font-display text-2xl sm:text-4xl font-semibold text-white leading-relaxed italic max-w-3xl mx-auto">
            "In an age of infinite AI leverage, the self-directed mind inherits the world. The passive consumer inherits obsolete knowledge."
          </blockquote>

          <p className="text-xs font-mono text-white/40 tracking-widest uppercase">
            — The Altor Autodidactic Creed
          </p>

          <div className="pt-8">
            <button
              onClick={handleLaunchWithTopic}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--advisor)] to-[var(--tutor)] text-[#04050a] font-bold text-base shadow-[0_0_50px_rgba(94,184,245,0.35)] transition transform hover:-translate-y-1 hover:brightness-110 flex items-center gap-2.5 mx-auto"
            >
              <GraduationCap size={20} />
              <span>Enter the Academy Free →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-12 px-6 bg-[var(--surface-1)] text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white/[0.05] border border-white/[0.1] flex items-center justify-center font-display text-[10px] text-white">
              A
            </div>
            <span className="font-semibold text-white/80">Altor — University in a Box</span>
          </div>

          <div>
            Built for ambitious autodidacts across every discipline. Inspired by the A.L.T.E.R. Framework.
          </div>

          <div className="flex gap-6">
            <button onClick={onEnterApp} className="hover:text-white transition">App Dashboard</button>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#examples" className="hover:text-white transition">Case Studies</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
