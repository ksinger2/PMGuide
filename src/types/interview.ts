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

export interface ModelAnswer {
  tagline: string;
  steps: ModelStep[];
  keyInsights: string[];
  watchOut: string[];
}

// ---------------------------------------------------------------------------
// Interview session state
// ---------------------------------------------------------------------------

export type InterviewScreen = "home" | "setup" | "active" | "analyzing" | "results";
export type InterviewMode = "interview" | "practice";

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
