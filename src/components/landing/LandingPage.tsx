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
  HardDrive
} from 'lucide-react';
import { AlterPersona } from '../../types/alter';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { setIsCreateModalOpen } = useJourney();
  const { user, setIsAuthModalOpen } = useAuth();

  const [activeFacultyTab, setActiveFacultyTab] = useState<AlterPersona>('advisor');
  const [activeCaseStudy, setActiveCaseStudy] = useState<'hardware' | 'ai' | 'quant' | 'bio'>('hardware');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Interactive Hero Simulator state
  const [simTopic, setSimTopic] = useState('Autonomous AI Agents');
  const [isSimulating, setIsSimulating] = useState(false);

  const heroPresetTopics = [
    'Autonomous AI Agents',
    'Distributed Systems',
    'DIY Electronics & Embedded Systems',
    'Quantum Computing',
    'Bioinformatics & CRISPR'
  ];

  const simulatedOutputs: Record<string, { brief: string; cutList: string[]; phase1: string; checkpoint: string }> = {
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
    'Distributed Systems': {
      brief: 'Deconstruct consensus protocols, fault tolerance, replication semantics, Raft/Paxos state machines, and eventual consistency at scale.',
      cutList: [
        'Skip basic REST CRUD tutorials and toy microservice recipes.',
        'Skip superficial cloud provider managed service marketing docs.',
        'Avoid monolithic toy setups that gloss over network partitions.'
      ],
      phase1: 'Phase 1: Failure Modes, RPCs & Consensus Protocols (Weeks 1–2)',
      checkpoint: 'Implement a distributed Raft consensus cluster from scratch that survives 2 node crashes and recovers state deterministically.'
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
    'Quantum Computing': {
      brief: 'Build intuition for Hilbert spaces, qubit superposition, quantum entanglement, circuit synthesis, and Shor/Grover quantum algorithms.',
      cutList: [
        'Skip hand-wavy popular science metaphors with zero linear algebra.',
        'Skip pure quantum hardware engineering unless building cryogenic dilution refrigerators.',
        'Avoid superficial Python Qiskit copy-pasting without understanding the state vectors.'
      ],
      phase1: 'Phase 1: Linear Algebra Foundations & Quantum State Vectors (Weeks 1–2)',
      checkpoint: 'Write a full matrix state vector quantum circuit simulator in 200 lines of code and prove Bell inequality violations.'
    },
    'Bioinformatics & CRISPR': {
      brief: 'Unpack sequence alignment algorithms, genomic variant calling pipelines, structural biology modeling, and RNA-guided Cas9/Cas12 cleavage mechanisms.',
      cutList: [
        'Skip outdated manual BLAST web interface clickthroughs.',
        'Skip generic introductory biology textbook chapters on taxonomy.',
        'Avoid memorizing raw gene accession lists without automated programmatic retrieval.'
      ],
      phase1: 'Phase 1: Dynamic Programming & Genomic Sequence Alignment (Weeks 1–2)',
      checkpoint: 'Build a Needleman-Wunsch & Smith-Waterman sequence aligner with affine gap penalties and test on real viral genomes.'
    }
  };

  const currentSim = simulatedOutputs[simTopic] || simulatedOutputs['Autonomous AI Agents'];

  const handleSelectSim = (topic: string) => {
    setIsSimulating(true);
    setSimTopic(topic);
    setTimeout(() => setIsSimulating(false), 300);
  };

  const handleLaunchWithTopic = () => {
    setIsCreateModalOpen(true);
  };

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
            <a href="#faculty" className="hover:text-white transition">The 5 Faculty</a>
            <a href="#examples" className="hover:text-white transition">Real Use Cases</a>
            <a href="#dilemma" className="hover:text-white transition">The Dilemma</a>
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
              <span>{user.isGuest ? 'Sign In / Sync' : user.name}</span>
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
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(94,184,245,0.12),transparent_70%)]" />
        
        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(94,184,245,0.08)] border border-[rgba(94,184,245,0.25)] text-xs font-mono text-[var(--advisor)] tracking-wide">
            <Sparkles size={13} className="text-[var(--advisor)]" />
            <span>THE AUTONOMOUS COGNITIVE OPERATING SYSTEM</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Stop Watching Tutorials. <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-[var(--advisor)] bg-clip-text text-transparent">
              Build Your University in a Box.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-sans">
            Master any high-leverage skill in weeks, not years. Five specialized AI faculty members architect your syllabus,
            cut the 90% commodity noise, pressure-test your logic, and force proof-of-work mastery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchWithTopic}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-sm shadow-[0_0_30px_rgba(94,184,245,0.3)] transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>Start Learning Free — No Credit Card</span>
            </button>
            <a
              href="#examples"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-white/[0.1] text-white/80 hover:text-white font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <span>See Real-World Case Studies</span>
              <ChevronRight size={15} />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-mono text-white/40">
            <span>✓ 100% Free Forever Tier</span>
            <span>•</span>
            <span>✓ Bring-Your-Own API Key</span>
            <span>•</span>
            <span>✓ Local &amp; Cloud Vault</span>
          </div>
        </div>

        {/* 2.5 Hero Interactive Sandbox / Journey Simulator */}
        <div className="mt-16 relative z-10 max-w-5xl mx-auto rounded-2xl bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border border-white/[0.12] p-6 sm:p-8 shadow-2xl">
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
                  key={topic}
                  onClick={() => handleSelectSim(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    simTopic === topic
                      ? 'bg-[var(--advisor)] text-[#04050a] font-semibold shadow-sm'
                      : 'bg-[var(--surface-3)] text-white/60 hover:text-white border border-white/[0.07]'
                  }`}
                >
                  {topic}
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
                  <span>The Sandeep Swadia "Cut List"</span>
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

      {/* 3. Real-World Multidisciplinary Showcase (Show, Don't Tell) */}
      <section id="examples" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--tutor)]">
            UNIVERSAL COGNITIVE OS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Learn Anything. Ship Tangible Proof.
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Altor isn't just for software developers. See how the 5 Faculty members guide learners across hardware engineering, quantitative finance, bioinformatics, and systems architecture.
          </p>
        </div>

        {/* Case Study Switcher */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {[
            { id: 'hardware' as const, label: '⚡ DIY Electronics & Hardware', icon: Cpu, color: 'border-[var(--editor)] text-[var(--editor)]' },
            { id: 'ai' as const, label: '🤖 Autonomous AI Agents', icon: Terminal, color: 'border-[var(--advisor)] text-[var(--advisor)]' },
            { id: 'quant' as const, label: '📈 Quantitative Finance', icon: TrendingUp, color: 'border-[var(--tutor)] text-[var(--tutor)]' },
            { id: 'bio' as const, label: '🧬 Bioinformatics & CRISPR', icon: Dna, color: 'border-[var(--roommate)] text-[var(--roommate)]' }
          ].map((cs) => {
            const Icon = cs.icon;
            const isActive = activeCaseStudy === cs.id;
            return (
              <button
                key={cs.id}
                onClick={() => setActiveCaseStudy(cs.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition ${
                  isActive
                    ? `bg-[var(--surface-3)] ${cs.color} shadow-lg shadow-black/40`
                    : 'bg-[var(--surface-1)] text-white/50 border-white/[0.07] hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{cs.label}</span>
              </button>
            );
          })}
        </div>

        {/* Case Study Detailed Showcase Card */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[var(--surface-2)] border border-white/[0.1] p-6 sm:p-8 shadow-card space-y-6">
          {activeCaseStudy === 'hardware' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[var(--editor)] uppercase tracking-wider">
                    Discipline: DIY Electronics &amp; IoT Hardware
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white m-0 mt-1">
                    Building an Autonomous ESP32 Environmental Sensor Station
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[rgba(234,176,84,0.1)] border border-[rgba(234,176,84,0.3)] text-[var(--editor)] text-xs font-mono">
                  6-Week Autodidactic Arc
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Advisor & Cut List */}
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--advisor)] flex items-center gap-1.5">
                    <GraduationCap size={15} />
                    <span>Advisor's Ruthless Cut List</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong className="text-rose-400">Skip:</strong> 40 hours of dry semiconductor quantum physics equations.
                    <br /><strong className="text-[var(--tutor)]">Focus:</strong> Microcontroller GPIO registers, breadboard wiring, and I2C sensor bus protocols.
                  </p>
                </div>

                {/* Tutor Feynman Drill */}
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--tutor)] flex items-center gap-1.5">
                    <Lightbulb size={15} />
                    <span>Tutor's Socratic Feynman Drill</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0 italic">
                    "Explain how an ADC converts analog voltage from a thermistor into a 12-bit binary number as if explaining to a 10-year-old."
                  </p>
                </div>

                {/* Roommate Cross-Domain Collision */}
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--roommate)] flex items-center gap-1.5">
                    <Zap size={15} />
                    <span>Roommate's Lateral Spark</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong>Embedded Firmware × Mammalian Respiration:</strong> Implement dynamic sampling rate adjustment triggered by sudden ambient airflow shifts.
                  </p>
                </div>
              </div>

              {/* Shipped Proof-of-Work Deliverable */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--surface-3)] to-[color-mix(in_srgb,var(--tutor)_10%,var(--surface-3))] border border-[var(--tutor)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono text-[var(--tutor)] uppercase tracking-wider font-semibold">
                    ✓ Final Verifiable Proof-of-Work Checkpoint
                  </span>
                  <div className="font-semibold text-white text-sm">
                    Custom Soldered ESP32 Board with I2C BME280 Telemetry &amp; Deep-Sleep (&lt;15µA)
                  </div>
                </div>
                <button
                  onClick={handleLaunchWithTopic}
                  className="px-4 py-2 rounded-lg bg-[var(--tutor)] text-[#04050a] font-bold text-xs whitespace-nowrap"
                >
                  Start This Hardware Track →
                </button>
              </div>
            </div>
          )}

          {activeCaseStudy === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[var(--advisor)] uppercase tracking-wider">
                    Discipline: Autonomous AI &amp; Systems Architecture
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white m-0 mt-1">
                    Building a Self-Correcting ReAct Swarm from Scratch
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[rgba(94,184,245,0.1)] border border-[rgba(94,184,245,0.3)] text-[var(--advisor)] text-xs font-mono">
                  6-Week Autodidactic Arc
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--advisor)] flex items-center gap-1.5">
                    <GraduationCap size={15} />
                    <span>Advisor's Ruthless Cut List</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong className="text-rose-400">Skip:</strong> Superficial LangChain wrapper tutorials and generic prompt blogs.
                    <br /><strong className="text-[var(--tutor)]">Focus:</strong> Deterministic state transitions, memory recall, and tool verification harnesses.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--editor)] flex items-center gap-1.5">
                    <FileEdit size={15} />
                    <span>Editor's Logic Audit</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    "Identified flaw: Your multi-agent swarm lacks idempotent tool execution. If network timeouts trigger a retry, financial ledger transactions duplicate."
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--roommate)] flex items-center gap-1.5">
                    <Zap size={15} />
                    <span>Roommate's Lateral Spark</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong>Agent Swarms × Roman Legionary Command:</strong> Model decentralized worker cohorts reporting to tactical Centurion supervisors.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--surface-3)] to-[color-mix(in_srgb,var(--advisor)_10%,var(--surface-3))] border border-[var(--advisor)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono text-[var(--advisor)] uppercase tracking-wider font-semibold">
                    ✓ Final Verifiable Proof-of-Work Checkpoint
                  </span>
                  <div className="font-semibold text-white text-sm">
                    Production Python Agent Engine with MCP Tool Protocol, Vector Recall, &amp; Verification
                  </div>
                </div>
                <button
                  onClick={handleLaunchWithTopic}
                  className="px-4 py-2 rounded-lg bg-[var(--advisor)] text-[#04050a] font-bold text-xs whitespace-nowrap"
                >
                  Start This AI Track →
                </button>
              </div>
            </div>
          )}

          {activeCaseStudy === 'quant' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[var(--tutor)] uppercase tracking-wider">
                    Discipline: Quantitative Finance &amp; Stochastic Volatility
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white m-0 mt-1">
                    Stochastic Calculus &amp; Statistical Arbitrage Backtester
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[rgba(95,219,158,0.1)] border border-[rgba(95,219,158,0.3)] text-[var(--tutor)] text-xs font-mono">
                  8-Week Autodidactic Arc
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--advisor)] flex items-center gap-1.5">
                    <GraduationCap size={15} />
                    <span>Advisor's Cut List</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong className="text-rose-400">Skip:</strong> Retail chart-pattern trading indicators (RSI/MACD nonsense).
                    <br /><strong className="text-[var(--tutor)]">Focus:</strong> Itô's Lemma, Brownian motion, and mean-reverting Ornstein-Uhlenbeck processes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--librarian)] flex items-center gap-1.5">
                    <BookOpen size={15} />
                    <span>Librarian's Signal Curation</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    John Hull's <em>Options, Futures &amp; Derivatives</em> (Signal 10/10) + Jim Simons' statistical arbitrage lecture transcripts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--editor)] flex items-center gap-1.5">
                    <FileEdit size={15} />
                    <span>Editor's Backtest Audit</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    "Look-ahead bias detected in line 84: You are referencing closing prices at t=0 when determining execution fills."
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--surface-3)] to-[color-mix(in_srgb,var(--tutor)_10%,var(--surface-3))] border border-[var(--tutor)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono text-[var(--tutor)] uppercase tracking-wider font-semibold">
                    ✓ Final Verifiable Proof-of-Work Checkpoint
                  </span>
                  <div className="font-semibold text-white text-sm">
                    Vectorized Statistical Arbitrage Backtester with Slippage &amp; Sharpe Ratios
                  </div>
                </div>
                <button
                  onClick={handleLaunchWithTopic}
                  className="px-4 py-2 rounded-lg bg-[var(--tutor)] text-[#04050a] font-bold text-xs whitespace-nowrap"
                >
                  Start This Quant Track →
                </button>
              </div>
            </div>
          )}

          {activeCaseStudy === 'bio' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[var(--roommate)] uppercase tracking-wider">
                    Discipline: Bioinformatics &amp; Computational Genomics
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white m-0 mt-1">
                    Building a Genomic Needleman-Wunsch Sequence Aligner
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[rgba(238,127,184,0.1)] border border-[rgba(238,127,184,0.3)] text-[var(--roommate)] text-xs font-mono">
                  6-Week Autodidactic Arc
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--advisor)] flex items-center gap-1.5">
                    <GraduationCap size={15} />
                    <span>Advisor's Cut List</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong className="text-rose-400">Skip:</strong> Memorizing taxonomy trees and manual web portal clicking.
                    <br /><strong className="text-[var(--tutor)]">Focus:</strong> Dynamic programming matrices, affine gap scoring, and FASTQ parsing in Rust.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--tutor)] flex items-center gap-1.5">
                    <Lightbulb size={15} />
                    <span>Tutor's Socratic Session</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0 italic">
                    "Why does affine gap penalty model biological insertions and deletions more accurately than a simple linear penalty?"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-white/[0.07] space-y-2">
                  <div className="text-xs font-semibold text-[var(--roommate)] flex items-center gap-1.5">
                    <Zap size={15} />
                    <span>Roommate's Lateral Spark</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    <strong>CRISPR Guide RNA × Regex Lexer Engines:</strong> Compare Cas9 mismatch tolerance with fuzzy string search finite state automata.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--surface-3)] to-[color-mix(in_srgb,var(--roommate)_10%,var(--surface-3))] border border-[var(--roommate)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono text-[var(--roommate)] uppercase tracking-wider font-semibold">
                    ✓ Final Verifiable Proof-of-Work Checkpoint
                  </span>
                  <div className="font-semibold text-white text-sm">
                    Custom Rust Sequence Alignment Engine Processing Viral FASTA Datasets
                  </div>
                </div>
                <button
                  onClick={handleLaunchWithTopic}
                  className="px-4 py-2 rounded-lg bg-[var(--roommate)] text-[#04050a] font-bold text-xs whitespace-nowrap"
                >
                  Start This Genomic Track →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. The Autodidact Dilemma (Problem Agitation) */}
      <section id="dilemma" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--editor)]">
            THE ROOT FAILURE MODE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Why 95% of Self-Learners Give Up in Week 3
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            The problem was never your intelligence or discipline. You've been trying to learn complex, frontier fields
            without an intellectual faculty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 space-y-3 bg-[var(--surface-2)] border border-white/[0.07] hover:border-white/[0.15] transition">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <X size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold text-white m-0">1. Tutorial Hell &amp; Passive Consumption</h3>
            <p className="text-xs text-white/60 leading-relaxed m-0">
              Watching 40 hours of Udemy or YouTube videos creates the <em>Illusion of Competence</em>. Your brain recognizes
              the concepts while watching, but retains 0% when staring at a blank terminal.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-[var(--surface-2)] border border-white/[0.07] hover:border-white/[0.15] transition">
            <div className="w-10 h-10 rounded-xl bg-[rgba(234,176,84,0.1)] border border-[rgba(234,176,84,0.25)] flex items-center justify-center text-[var(--editor)]">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold text-white m-0">2. The Feedback Vacuum</h3>
            <p className="text-xs text-white/60 leading-relaxed m-0">
              Generic AI chatbots are people-pleasers: they validate your flawed premises and write code for you. You don't have
              a ruthless Socratic tutor or analytical editor poking holes in your logic.
            </p>
          </div>

          <div className="card p-6 space-y-3 bg-[var(--surface-2)] border border-white/[0.07] hover:border-white/[0.15] transition">
            <div className="w-10 h-10 rounded-xl bg-[rgba(95,219,158,0.1)] border border-[rgba(95,219,158,0.25)] flex items-center justify-center text-[var(--tutor)]">
              <Target size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold text-white m-0">3. Zero Verifiable Proof-of-Work</h3>
            <p className="text-xs text-white/60 leading-relaxed m-0">
              Certificates of completion from online course platforms carry zero weight. The market only rewards individuals
              who can point to tangible, verifiable artifacts and first-principles architectures.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Meet Your 5-Faculty Board */}
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
                  "I've configured your 6-week curriculum for Autonomous AI Agents. We are skipping high-level framework wrappers and going straight to first-principles state machine loops."
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-3)] text-[11px] text-[var(--advisor)] font-mono">
                  → Checkpoint 1: Ship deterministic state machine with replayable execution trace.
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
                      <p className="source-title text-sm">The Art of Electronics</p>
                      <p className="source-author text-xs">Horowitz &amp; Hill (Cambridge)</p>
                    </div>
                    <span className="signal-badge">Signal 10/10</span>
                  </div>
                  <p className="source-row text-xs">
                    <b>Why essential —</b> The gold standard circuit intuition Bible without abstract fluff.
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
                    <div className="text-lg font-bold font-display text-[var(--tutor)]">94/100</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Blind Spots</span>
                    <div className="text-lg font-bold font-display text-[var(--advisor)]">1 Found</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] text-xs text-white/70 italic">
                  "Blind Spot: You explained voltage dividers, but forgot how the load impedance in parallel affects the output."
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
                  "If the sensor sampling interrupt triggers during an active flash write, the ESP32 will trigger a panic core reset."
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
                  <span className="font-bold text-[var(--roommate)]">Collision: Embedded IoT × Jazz Improvisation</span>
                  <p className="mt-1 text-[11.5px] text-white/70 italic leading-relaxed m-0">
                    "Just as jazz players adapt syncopation around a steady bass rhythm, your sensor node can modulate transmission frequencies dynamically when packet collision noise spikes."
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
                Every milestone checkpoint you complete generates a permanent, verifiable proof card. Share your live portfolio on GitHub, Twitter, or resume applications.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-white/[0.1] text-xs font-mono text-white/80">
                  altor.app/@{user.username || 'yourname'}
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
                      <span className="font-semibold text-white">ESP32 Telemetry Firmware</span>
                      <span className="text-[10px] font-mono text-[var(--tutor)]">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-white/50 m-0">Repository: github.com/alex/esp32-sensor-node (Deep Sleep &lt;15µA)</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-white/[0.07] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Autonomous ReAct Loop Engine</span>
                      <span className="text-[10px] font-mono text-[var(--advisor)]">100% Passed</span>
                    </div>
                    <p className="text-[11px] text-white/50 m-0">Repository: github.com/alex/react-agent-mcp (Full Evaluation Trace)</p>
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
                  For engineers, researchers, founders, and knowledge workers who demand peak cognitive velocity.
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
            Built for ambitious autodidacts. Inspired by the A.L.T.E.R. Framework.
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
