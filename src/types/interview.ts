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

// ===========================================================================
// GENERIC MODEL ANSWER (for non-product-design question types)
// ===========================================================================

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

export interface OpeningReflection {
  spaceContext: string;           // What's interesting/challenging about this space
  whyItMatters: string;           // Why this company should care
  initialAngle: string;           // Your hypothesis or unique perspective
}

export interface ProblemAnalysis {
  psychologicalProblems: string[];
  functionalProblems: string[];
  behavioralProblems: string[];
  prioritizedProblem: string;
  howPrioritized: string;
  whyThisProblem: string;
}

export interface BrainstormedSolution {
  name: string;
  description: string;
  prosAndCons: string;
}

export interface SolutionRisk {
  risk: string;
  type: "technical" | "adoption" | "competitive" | "organizational";
  mitigation: string;
}

export interface SolutionPrioritization {
  chosenSolution: string;
  howPrioritized: string;
  whyThisWins: string;
  risks: SolutionRisk[];
}

export interface MvpDesign {
  coreFeatures: string[];
  explicitExclusions: string[];
  successCriteria: string;
  learningGoals: string;
}

/** Generic model answer for non-product-design question types */
export interface GenericModelAnswer {
  openingReflection?: OpeningReflection;
  tagline: string;
  platformContext?: PlatformContext;
  segmentAnalysis?: SegmentAnalysis;
  problemAnalysis?: ProblemAnalysis;
  solutionBrainstorm?: BrainstormedSolution[];
  solutionPrioritization?: SolutionPrioritization;
  mvpDesign?: MvpDesign;
  steps: ModelStep[];
  keyInsights: string[];
  watchOut: string[];
}

// ===========================================================================
// PRODUCT DESIGN MODEL ANSWER (13-Step Formula)
// ===========================================================================

/** Step 1: Landscape — Why does this question matter? */
export interface Landscape {
  industryContext: string;        // What's happening in this space
  companyBenefit: string;         // Why this company should care
  transformativePotential: string; // What could change if done well
}

/** Stakeholder in the ecosystem with evaluation scores */
export interface Stakeholder {
  name: string;                   // e.g., "Creators", "Advertisers", "Parents"
  role: string;                   // What they do in the ecosystem
  incentives: string;             // What they want
  currentPain: string;            // What frustrates them today
}

/** Step 3: Ecosystem — ALL stakeholders */
export interface Ecosystem {
  stakeholders: Stakeholder[];
  ecosystemDynamics: string;      // How stakeholders interact/depend on each other
}

/** Evaluation score for prioritization matrix */
export type Score = 1 | 2 | 3 | 4 | 5;

/** Stakeholder evaluation for prioritization matrix */
export interface StakeholderEvaluation {
  name: string;
  tamScore: Score;                // 1-5: Market size/value
  tamRationale: string;
  underservedScore: Score;        // 1-5: Gap in current solutions
  underservedRationale: string;
  missionScore: Score;            // 1-5: Alignment with company mission
  missionRationale: string;
  totalScore: number;             // Sum of scores
}

/** Step 4: Stakeholder prioritization with full matrix */
export interface StakeholderPrioritization {
  evaluations: StakeholderEvaluation[];  // ALL stakeholders scored
  chosen: string;                 // Which stakeholder group
  whyChosen: string;              // Synthesis of why this one wins
  tradeoff: string;               // What we sacrifice
}

/** User segment within the prioritized stakeholder group */
export interface Segment {
  name: string;                   // Behavioral name (NOT demographic)
  description: string;            // Who they are
  keyCharacteristic: string;      // What defines this segment
  currentBehavior: string;        // How they solve this today
}

/** Segment evaluation for prioritization matrix */
export interface SegmentEvaluation {
  name: string;
  tamScore: Score;
  tamRationale: string;
  underservedScore: Score;
  underservedRationale: string;
  missionScore: Score;
  missionRationale: string;
  totalScore: number;
}

/** Step 6: Segment prioritization with full matrix */
export interface SegmentPrioritization {
  evaluations: SegmentEvaluation[];  // ALL segments scored
  chosen: string;                 // Which segment
  whyChosen: string;              // Synthesis of why this one wins
  tradeoff: string;               // What we sacrifice
}

/** Psychological pain — fears, frustrations, anxieties, aspirations */
export interface PsychologicalPain {
  pain: string;                   // The pain point
  emotion: string;                // The feeling (fear, frustration, anxiety, aspiration)
  intensity: "low" | "medium" | "high";
}

/** Behavioral pain — habits, friction, patterns */
export interface BehavioralPain {
  pain: string;                   // The pain point
  currentWorkaround: string;      // How they cope today
  frequency: "rare" | "occasional" | "frequent" | "constant";
}

/** Functional pain — tasks, efficiency, utility */
export interface FunctionalPain {
  pain: string;                   // The pain point
  impact: string;                 // What it costs them (time, money, effort)
  jtbd: string;                   // Job-to-be-done framing
}

/** Step 7: Pain points — 3 dimensions */
export interface PainPoints {
  psychological: PsychologicalPain[];
  behavioral: BehavioralPain[];
  functional: FunctionalPain[];
}

/** Pain point evaluation for prioritization matrix */
export interface PainPointEvaluation {
  pain: string;                   // The pain point text
  type: "psychological" | "behavioral" | "functional";
  severityScore: Score;           // 1-5: How bad is it
  severityRationale: string;
  frequencyScore: Score;          // 1-5: How often it happens
  frequencyRationale: string;
  missionScore: Score;            // 1-5: Alignment with mission
  missionRationale: string;
  totalScore: number;             // Sum of scores
}

/** Step 8: Pain point prioritization with full matrix */
export interface PainPointPrioritization {
  evaluations: PainPointEvaluation[];  // ALL pain points scored
  chosen: string;                 // Which pain point
  whyChosen: string;              // Synthesis of why this one wins
}

/** Solution idea */
export interface Solution {
  name: string;
  description: string;
  novelty: string;                // What's clever or different about this
  prosAndCons: string;
}

/** Solution evaluation for prioritization matrix */
export interface SolutionEvaluation {
  name: string;
  impactScore: Score;             // 1-5: User/business impact
  impactRationale: string;
  effortScore: Score;             // 1-5: Feasibility (5=easy, 1=hard)
  effortRationale: string;
  differentiationScore: Score;    // 1-5: Competitive advantage
  differentiationRationale: string;
  totalScore: number;             // Sum of scores
}

/** Step 10: Solution prioritization with full matrix */
export interface SolutionPrioritizationV2 {
  evaluations: SolutionEvaluation[];  // ALL solutions scored
  chosen: string;                 // Which solution
  whyChosen: string;              // Synthesis of why this one wins
}

/** Risk with severity */
export interface Risk {
  risk: string;
  type: "technical" | "adoption" | "competitive" | "organizational";
  severity: "low" | "medium" | "high";
  mitigation: string;
}

/** Success metrics sub-object */
export interface SuccessMetrics {
  northStar: string;              // Primary metric
  leading: string[];              // Early indicators
  guardrails: string[];           // What we don't want to hurt
}

/** Step 12: MVP + Metrics */
export interface MvpAndMetrics {
  coreFeatures: string[];
  explicitExclusions: string[];
  successMetrics: SuccessMetrics;
  learningGoals: string;
}

/** Step 13: Summary */
export interface Summary {
  recap: string;                  // 2-3 sentence recap
  keyInsight: string;             // The ONE thing to remember
  watchOut: string;               // Primary risk/pitfall
}

/** 13-Step Product Design Model Answer */
export interface ProductDesignModelAnswer {
  landscape: Landscape;                              // Step 1
  mission: string;                                   // Step 2
  ecosystem: Ecosystem;                              // Step 3
  stakeholderPrioritization: StakeholderPrioritization; // Step 4
  segmentation: Segment[];                           // Step 5
  segmentPrioritization: SegmentPrioritization;      // Step 6
  painPoints: PainPoints;                            // Step 7
  painPointPrioritization: PainPointPrioritization;  // Step 8
  solutions: Solution[];                             // Step 9
  solutionPrioritization: SolutionPrioritizationV2;  // Step 10
  risks: Risk[];                                     // Step 11
  mvpAndMetrics: MvpAndMetrics;                      // Step 12
  summary: Summary;                                  // Step 13
}

// ===========================================================================
// Union type and type guard
// ===========================================================================

export type ModelAnswer = GenericModelAnswer | ProductDesignModelAnswer;

/** Type guard to check if a model answer is the 13-step product design format */
export function isProductDesignModelAnswer(
  answer: ModelAnswer
): answer is ProductDesignModelAnswer {
  return (
    "landscape" in answer &&
    "mission" in answer &&
    "ecosystem" in answer &&
    "stakeholderPrioritization" in answer &&
    "segmentation" in answer &&
    "segmentPrioritization" in answer &&
    "painPoints" in answer &&
    "painPointPrioritization" in answer &&
    "solutions" in answer &&
    "solutionPrioritization" in answer &&
    "risks" in answer &&
    "mvpAndMetrics" in answer &&
    "summary" in answer
  );
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
