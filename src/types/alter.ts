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
  mastered?: boolean;
  studentResponse?: string;
  tutorEvaluation?: string;
  createdAt: string;
}

export interface SourceDeepDive {
  id: string;
  sourceTitle: string;
  author: string;
  bigIdea: string;
  topMentalModels: { model: string; explanation: string }[];
  practicalApplication: string;
  cutListFluff: string;
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
