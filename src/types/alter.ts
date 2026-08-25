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

export interface CuratedSource {
  id: string;
  type: 'book' | 'paper' | 'lecture' | 'doc' | 'case_study' | 'podcast';
  title: string;
  authorOrCreator: string;
  url?: string;
  signalScore: number; // 1-10
  whyEssential: string;
  keyTakeaway: string;
  status: 'unread' | 'in_progress' | 'mastered';
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface ConceptCard {
  id: string;
  term: string;
  definition: string;
  mentalModel: string;
  pitfall: string;
}

export interface LibrarianData {
  sources: CuratedSource[];
  vaultNotes: VaultNote[];
  conceptCards: ConceptCard[];
  chatHistory: ChatMessage[];
}

export interface FeynmanSession {
  id: string;
  concept: string;
  userExplanation: string;
  clarityScore: number; // 0-100
  accuracyScore: number; // 0-100
  strengths: string[];
  blindSpots: string[];
  simplifiedAnalogy: string;
  tutorFeedback: string;
  date: string;
}

export interface QuizQuestion {
  id: string;
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
  id: string;
  originalText: string;
  improvedText: string;
  critiqueReason: string;
}

export interface EditorReview {
  id: string;
  title: string;
  submittedDraft: string;
  mode: 'logic' | 'clarity' | 'steelman' | 'first_principles';
  overallScore: number; // 0-100
  verdict: string;
  strengths: string[];
  logicFlaws: string[];
  counterarguments: string[];
  redlines: RedlineEdit[];
  revisedVersion: string;
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
  depth: 'foundational' | 'practitioner' | 'expert' | 'researcher';
  createdAt: string;
  lastActive: string;
  streakDays: number;
  advisorData: AdvisorData;
  librarianData: LibrarianData;
  tutorData: TutorData;
  editorData: EditorData;
  roommateData: RoommateData;
}
