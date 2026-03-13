// ---------------------------------------------------------------------------
// Companies & scenarios
// ---------------------------------------------------------------------------

export type NegotiationCompany =
  | "google"
  | "meta"
  | "amazon"
  | "netflix"
  | "anthropic"
  | "openai"
  | "roblox"
  | "apple"
  | "microsoft"
  | "any";

export type ScenarioType =
  | "initial-offer"
  | "counter-offer"
  | "no-leverage"
  | "equity-focus"
  | "exploding-offer"
  | "title-negotiation"
  | "retention";

export type DifficultyLevel = "friendly" | "realistic" | "hardball";

// ---------------------------------------------------------------------------
// Screens & modes
// ---------------------------------------------------------------------------

export type NegotiationScreen =
  | "home"
  | "setup"
  | "active"
  | "analyzing"
  | "results"
  | "expert-setup"
  | "expert-viewing"
  | "coach"
  | "tips"
  | "calculator";

export type NegotiationMode =
  | "simulator"
  | "expert"
  | "coach"
  | "tips"
  | "calculator";

// ---------------------------------------------------------------------------
// Simulator config & data
// ---------------------------------------------------------------------------

export interface SimulatorConfig {
  company: NegotiationCompany;
  scenario: ScenarioType;
  difficulty: DifficultyLevel;
  targetRole: string;
  currentComp?: number;
  offerDetails?: OfferDetails;
}

export interface OfferDetails {
  base: number;
  equity: number;
  equityType: "rsu" | "options" | "profit-interest";
  vestingSchedule: "4-year-1-cliff" | "4-year-equal" | "custom";
  signOn: number;
  bonus: number;
  bonusPercentage?: number;
  level?: string;
}

export interface NegotiationTurn {
  role: "user" | "recruiter";
  content: string;
  timestamp: string;
  tactic?: string;
}

export interface CoachNote {
  turnIndex: number;
  tactic: string;
  effectiveness: "strong" | "neutral" | "weak";
  tip: string;
}

export interface BudgetCeiling {
  base: { floor: number; target: number; ceiling: number };
  equity: { floor: number; target: number; ceiling: number };
  signing: { floor: number; target: number; ceiling: number };
}

// ---------------------------------------------------------------------------
// Feedback & scoring
// ---------------------------------------------------------------------------

export interface NegotiationRubricRow {
  signal: string;
  score: "Very Weak" | "Weak" | "Neutral" | "Strong" | "Very Strong";
  note: string;
}

export interface TacticUsed {
  tactic: string;
  effectiveness: "strong" | "neutral" | "weak";
  example: string;
}

export interface NegotiationMistake {
  mistake: string;
  impact: string;
  whatInstead: string;
}

export interface ProjectedOutcome {
  originalOffer: number;
  finalOffer: number;
  deltaDollars: number;
  deltaPercent: number;
  budgetCeiling: BudgetCeiling;
}

export interface NegotiationFeedback {
  overall: string;
  score: number;
  scoreLabel: string;
  projectedOutcome: ProjectedOutcome;
  rubric: NegotiationRubricRow[];
  tacticsUsed: TacticUsed[];
  mistakes: NegotiationMistake[];
  emailTemplate?: string;
  oneChange: string;
}

// ---------------------------------------------------------------------------
// Expert mode
// ---------------------------------------------------------------------------

export interface ExpertTurn {
  role: "candidate" | "recruiter";
  content: string;
  tactic?: string;
  why?: string;
}

export interface ExpertNegotiation {
  scenario: string;
  company: string;
  difficulty: string;
  transcript: ExpertTurn[];
  summary: string;
  totalCompGain: string;
  keyTakeaways: string[];
}

// ---------------------------------------------------------------------------
// Offer calculator
// ---------------------------------------------------------------------------

export interface CalculatorOffer {
  id: string;
  label: string;
  company: string;
  base: number;
  equity: number;
  vestingYears: number;
  signOn: number;
  bonus: number;
  location: string;
}

// ---------------------------------------------------------------------------
// Session history
// ---------------------------------------------------------------------------

export interface NegotiationHistoryEntry {
  id: string;
  mode: NegotiationMode;
  company: string;
  scenario?: string;
  score?: number;
  scoreLabel?: string;
  summary: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------

export interface NegotiationSessionState {
  screen: NegotiationScreen;
  mode: NegotiationMode | null;
  config: SimulatorConfig | null;
  turns: NegotiationTurn[];
  currentMessage: string;
  budgetCeiling: BudgetCeiling | null;
  scenarioContext: string;
  coachNotes: CoachNote[];
  currentFeedback: NegotiationFeedback | null;
  currentModelNegotiation: ExpertNegotiation | null;
  expertConfig: { company: NegotiationCompany; scenario: ScenarioType; difficulty: DifficultyLevel } | null;
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  calculatorOffers: CalculatorOffer[];
  activeTipCategory: string | null;
  history: NegotiationHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}
