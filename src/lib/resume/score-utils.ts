/**
 * Resume score computation and validation utilities.
 *
 * The AI returns category scores; the overall score is computed here
 * as a weighted average to guarantee consistency across runs.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryScore {
  category: string;
  score: number;
  label: string;
}

export interface Finding {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  sectionRef?: string;
  status?: "accepted" | "rejected";
}

export interface CritiqueResult {
  overallScore: number;
  summary: string;
  categoryScores: CategoryScore[];
  findings: Finding[];
  strengths: string[];
  profileSuggestions?: Array<{
    field: string;
    value: string;
    suggestion: string;
  }>;
}

// ---------------------------------------------------------------------------
// Weights — these determine the overall score formula
// ---------------------------------------------------------------------------

export const CATEGORY_WEIGHTS: Record<string, number> = {
  impact_metrics: 0.30,
  relevance: 0.20,
  pm_language: 0.15,
  clarity: 0.15,
  structure: 0.10,
  completeness: 0.10,
};

export const CATEGORY_LABELS: Record<string, string> = {
  impact_metrics: "Impact & Metrics",
  pm_language: "PM-Specific Language",
  relevance: "Relevance",
  clarity: "Clarity & Conciseness",
  structure: "Structure",
  completeness: "Completeness",
};

const REQUIRED_CATEGORIES = Object.keys(CATEGORY_WEIGHTS);

// Severity deduction points — deterministic scoring from findings
const SEVERITY_DEDUCTIONS: Record<string, number> = {
  high: 15,
  medium: 8,
  low: 3,
};

// ---------------------------------------------------------------------------
// Score computation
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Compute category scores deterministically from findings.
 * Each category starts at 100 and loses points per finding based on severity.
 * Same findings → same scores, every time.
 */
export function computeCategoryScoresFromFindings(
  findings: Finding[]
): CategoryScore[] {
  return REQUIRED_CATEGORIES.map((cat) => {
    const catFindings = findings.filter((f) => f.category === cat);
    let deduction = 0;
    for (const f of catFindings) {
      deduction += SEVERITY_DEDUCTIONS[f.severity] ?? 0;
    }
    return {
      category: cat,
      score: clamp(100 - deduction, 0, 100),
      label: CATEGORY_LABELS[cat] || cat,
    };
  });
}

/**
 * Compute overall score as a weighted average of category scores.
 * Missing categories are treated as score 0.
 */
export function computeOverallScore(
  categoryScores: CategoryScore[]
): number {
  const scoreMap = new Map(
    categoryScores.map((c) => [c.category, c.score])
  );

  let weightedSum = 0;
  let totalWeight = 0;

  for (const cat of REQUIRED_CATEGORIES) {
    const weight = CATEGORY_WEIGHTS[cat];
    const score = scoreMap.get(cat) ?? 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate and normalize a raw critique result from the AI.
 * - Clamps all scores to 0-100
 * - Fills missing categories with score 0
 * - Recomputes overallScore from category weights
 */
export function validateCritiqueResult(raw: unknown): CritiqueResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid critique result: expected an object");
  }

  const obj = raw as Record<string, unknown>;

  // Validate findings first — category scores are computed FROM findings
  const rawFindings = Array.isArray(obj.findings) ? obj.findings : [];
  const validSeverities = new Set(["high", "medium", "low"]);
  const findings: Finding[] = rawFindings
    .filter(
      (f): f is Record<string, unknown> => f !== null && typeof f === "object"
    )
    .map((f, i) => ({
      id: String(f.id || `f-${i + 1}`),
      severity: validSeverities.has(String(f.severity))
        ? (String(f.severity) as "high" | "medium" | "low")
        : "low",
      category: String(f.category || ""),
      title: String(f.title || ""),
      description: String(f.description || ""),
      originalText: f.originalText ? String(f.originalText) : undefined,
      suggestedText: f.suggestedText ? String(f.suggestedText) : undefined,
      sectionRef: f.sectionRef ? String(f.sectionRef) : undefined,
    }));

  // Validate strengths
  const strengths = Array.isArray(obj.strengths)
    ? obj.strengths.filter((s) => typeof s === "string").map(String)
    : [];

  // Validate profileSuggestions
  const profileSuggestions = Array.isArray(obj.profileSuggestions)
    ? obj.profileSuggestions
        .filter(
          (p): p is Record<string, unknown> =>
            p !== null && typeof p === "object"
        )
        .map((p) => ({
          field: String(p.field || ""),
          value: String(p.value || ""),
          suggestion: String(p.suggestion || ""),
        }))
    : undefined;

  // Compute category scores deterministically from findings (not AI-generated)
  const categoryScores = computeCategoryScoresFromFindings(findings);

  // Compute overall score from weighted categories
  const overallScore = computeOverallScore(categoryScores);

  return {
    overallScore,
    summary: String(obj.summary || ""),
    categoryScores,
    findings,
    strengths,
    profileSuggestions,
  };
}
