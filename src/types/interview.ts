import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";

// ---------------------------------------------------------------------------
// Session config
// ---------------------------------------------------------------------------

export type QuestionMode = "generated" | "bank" | "pick";

export interface SessionConfig {
  company: InterviewCompany | "any";
  types: InterviewQuestionType[];
  count: number | "infinite";
  questionMode: QuestionMode;
  pickedQuestions: BankQuestion[];
}

// ---------------------------------------------------------------------------
// Question
// ---------------------------------------------------------------------------

export interface Question {
  id: string;
  text: string;
  type: InterviewQuestionType;
  company: string;
  source: "generated" | "bank" | "picked";
}

export interface BankQuestion {
  id: string;
  text: string;
  type: InterviewQuestionType;
  subCategory: string;
  companyHint?: string;
}

// ---------------------------------------------------------------------------
// Session entry (history)
// ---------------------------------------------------------------------------

export interface SessionEntry {
  company: string;
  type: InterviewQuestionType;
  question: string;
  answer: string;
  score: number;
  scoreLabel: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Feedback (from grading API)
// ---------------------------------------------------------------------------

export type RubricScore = "Very Weak" | "Weak" | "Neutral" | "Strong" | "Very Strong";

export interface RubricRow {
  signal: string;
  score: RubricScore;
  note: string;
}

export interface Feedback {
  overall: string;
  score: number;
  scoreLabel: string;
  rubric: RubricRow[];
  whatWorked: string[];
  toImprove: string[];
  hiringSignal: string;
  oneChange: string;
}

// ---------------------------------------------------------------------------
// Model answer (from model-answer API)
// ---------------------------------------------------------------------------

export interface ModelStep {
  number: number;
  title: string;
  why: string;
  what: string;
  example: string;
}

export type SegmentationLens = "skill" | "motivation" | "role" | "usage" | "context";

export interface SegmentInfo {
  name: string;               // Behavioral name (NOT demographic)
  description: string;        // Who they are + their context
  keyNeed: string;            // Primary unmet need
  currentWorkaround: string;  // How they solve this today
}

export interface SegmentAnalysis {
  segmentationLens: SegmentationLens;
  whyThisLens?: string;           // Why this lens is most actionable for this platform
  segments: SegmentInfo[];
  prioritized: string;
  tradeoff: string;
  mitigation: string;
}

export interface PlatformContext {
  whatItDoesToday: string;        // Current product/platform value proposition
  strategicPriorities: string;    // Company's key goals this feature could serve
  featureFit: string;             // How this feature fits into the existing ecosystem
  dependencies: string;           // Teams, products, or infrastructure this touches
}

// New: Opening reflection for product design
export interface OpeningReflection {
  spaceContext: string;           // What's interesting/challenging about this space
  whyItMatters: string;           // Why this company should care
  initialAngle: string;           // Your hypothesis or unique perspective
}

// New: Comprehensive problem analysis
export interface ProblemAnalysis {
  psychologicalProblems: string[];  // Fears, frustrations, anxieties, aspirations + pain points
  functionalProblems: string[];     // Task/efficiency/utility problems + pain points
  behavioralProblems: string[];     // Habit/friction/pattern problems + pain points
  prioritizedProblem: string;       // The ONE problem to focus on
  howPrioritized: string;           // HOW you chose this (criteria used)
  whyThisProblem: string;           // WHY this problem matters most
}

// New: Solution brainstorm entry
export interface BrainstormedSolution {
  name: string;
  description: string;
  prosAndCons: string;
}

// New: Risk entry
export interface SolutionRisk {
  risk: string;
  type: "technical" | "adoption" | "competitive" | "organizational";
  mitigation: string;
}

// New: Solution prioritization
export interface SolutionPrioritization {
  chosenSolution: string;
  howPrioritized: string;         // Criteria used
  whyThisWins: string;            // What makes it better
  risks: SolutionRisk[];
}

// New: MVP design
export interface MvpDesign {
  coreFeatures: string[];
  explicitExclusions: string[];
  successCriteria: string;
  learningGoals: string;
}

export interface ModelAnswer {
  // New: Opening reflection (product design)
  openingReflection?: OpeningReflection;
  tagline: string;
  platformContext?: PlatformContext;
  segmentAnalysis?: SegmentAnalysis;
  // New: Problem analysis (product design)
  problemAnalysis?: ProblemAnalysis;
  // New: Solution brainstorming (product design)
  solutionBrainstorm?: BrainstormedSolution[];
  // New: Solution prioritization with risks (product design)
  solutionPrioritization?: SolutionPrioritization;
  // New: MVP design (product design)
  mvpDesign?: MvpDesign;
  steps: ModelStep[];
  keyInsights: string[];
  watchOut: string[];
}

// ---------------------------------------------------------------------------
// Interview session state
// ---------------------------------------------------------------------------

export type InterviewScreen = "home" | "setup" | "active" | "analyzing" | "results" | "viewing" | "ask-expert-chat";
export type InterviewMode = "interview" | "practice" | "expert" | "ask-expert";

export interface InterviewSessionState {
  screen: InterviewScreen;
  mode: InterviewMode | null;
  config: SessionConfig | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  currentAnswer: string;
  currentFeedback: Feedback | null;
  currentModelAnswer: ModelAnswer | null;
  questionsUsed: string[];
  sessionEntries: SessionEntry[];
  history: SessionEntry[];
  isLoading: boolean;
  error: string | null;
}
