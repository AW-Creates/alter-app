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
  tangibleAsset?: string; // e.g. "Live deployed landing page with waitlist form"
  completed: boolean;
}

export interface CurriculumPhase {
  id: string;
  phaseNumber: number;
  title: string;
  duration: string;
  objective: string;
  tangibleAsset?: string; // What physical/digital artifact exists after this phase
  coreConcepts: string[];
  checkpoint: CheckpointProject;
  completed: boolean;
}

export interface StuckTriageResult {
  id: string;
  blockerSummary: string;
  microAction5Min: string;
  starterScaffold: string;
  complexityReductionCut: string;
  mindsetReframing: string;
  createdAt: string;
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
  jargonUsed?: string[];
  simplifiedAnalogySuggestion?: string;
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

export interface InteractiveLesson {
  id: string;
  concept: string;
  lessonTitle: string;
  estimatedReadTime: string;
  plainEnglishAnalogy: string;
  coreExplanation: string;
  keyTakeaways: string[];
  socraticChallenge: string;
  practiceTask: string;
  
  // Progressive Zero-to-Hero Masterclass Modules
  whyNovicesGetConfused?: string;
  laymanExplanation?: string;
  architecturalDiagramOrFlow?: string;
  mechanicsMarkdown?: string;
  corePrimitives?: { name: string; role: string; explanation: string }[];
  implementationGuide?: string[];
  codeOrTemplate?: string;
  howMastersUseIt?: string;
  commonPitfalls?: string[];
  cutListFluff?: string;

  mastered?: boolean;
  studentResponse?: string;
  tutorEvaluation?: string;
  userScore?: number;
  userDraftCode?: string;
  createdAt: string;
}

export interface SourceDeepDive {
  id: string;
  sourceTitle: string;
  author: string;
  topic?: string;
  estimatedTime?: string;
  bigIdea: string;
  topMentalModels: { model: string; explanation: string }[];
  practicalApplication: string;
  cutListFluff: string;

  // Progressive Zero-to-Hero Masterclass Modules
  plainEnglishIntuition?: {
    coreMetaphor: string;
    whyNovicesGetConfused: string;
    laymanExplanation: string;
  };
  mechanicsAndAnatomy?: {
    architecturalDiagramOrFlow: string;
    deepExplanationMarkdown: string;
    corePrimitives: { name: string; role: string; explanation: string }[];
  };
  implementationBlueprint?: {
    stepByStepGuide: string[];
    codeOrTemplate: string;
    howMastersUseIt: string;
  };
  trapsAndCutList?: {
    commonPitfalls: string[];
    cutListFluff: string;
  };
  socraticSparring?: {
    realWorldScenario: string;
    challengeQuestion: string;
    sampleStrongAnswer: string;
  };

  mastered?: boolean;
  userScore?: number;
  userSparringResponse?: string;
  tutorEvaluationFeedback?: string;
}

export interface TutorData {
  chatHistory: ChatMessage[];
  feynmanSessions: FeynmanSession[];
  quizzes: DiagnosticQuiz[];
  lessons?: InteractiveLesson[];
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

export interface DiagnosticQuestion {
  id: string;
  question: string;
  type: 'clarification' | 'claimed_baseline' | 'technical_probe';
  contextReason: string;
  suggestedOptions?: string[];
}

export interface DiagnosticAssessment {
  refinedTopic: string;
  refinedDestination: string;
  actualBaselineAssessment: string;
  masteredStrengths: string[];
  criticalGapsToFill: string[];
  recommendedStartingPhase: number;
  recommendedCutList: string[];
  diagnosticScore?: number;
}

export interface LiveClassroomTurn {
  id: string;
  speaker: 'tutor' | 'student';
  content: string;
  stageName: string; // e.g. "Level 1: Plain Metaphor", "Level 2: Architecture Flow", "Level 3: Code Implementation"
  checkInQuestion?: string;
  studentAnswer?: string;
  tutorFeedback?: string;
  isCompleted?: boolean;
  timestamp: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  topic: string;
  destination: string; // Target outcome / mastery goal
  baseline: string; // Current knowledge level
  diagnosticAssessment?: DiagnosticAssessment;
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
