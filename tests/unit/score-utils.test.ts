import { describe, it, expect } from "vitest";
import {
  computeOverallScore,
  computeCategoryScoresFromFindings,
  validateCritiqueResult,
  CATEGORY_WEIGHTS,
} from "@/lib/resume/score-utils";

describe("computeOverallScore", () => {
  it("computes weighted average from all 6 categories", () => {
    const scores = [
      { category: "impact_metrics", score: 90, label: "Impact & Metrics" },
      { category: "pm_language", score: 80, label: "PM-Specific Language" },
      { category: "relevance", score: 85, label: "Relevance" },
      { category: "clarity", score: 88, label: "Clarity & Conciseness" },
      { category: "structure", score: 92, label: "Structure" },
      { category: "completeness", score: 78, label: "Completeness" },
    ];
    // 90*0.30 + 85*0.20 + 80*0.15 + 88*0.15 + 92*0.10 + 78*0.10
    // = 27 + 17 + 12 + 13.2 + 9.2 + 7.8 = 86.2 → 86
    const result = computeOverallScore(scores);
    expect(result).toBe(86);
  });

  it("treats missing categories as score 0", () => {
    const scores = [
      { category: "impact_metrics", score: 100, label: "Impact & Metrics" },
    ];
    const result = computeOverallScore(scores);
    expect(result).toBe(30);
  });

  it("returns 0 for empty category array", () => {
    expect(computeOverallScore([])).toBe(0);
  });

  it("handles all perfect scores", () => {
    const scores = Object.keys(CATEGORY_WEIGHTS).map((cat) => ({
      category: cat,
      score: 100,
      label: cat,
    }));
    expect(computeOverallScore(scores)).toBe(100);
  });

  it("handles all zero scores", () => {
    const scores = Object.keys(CATEGORY_WEIGHTS).map((cat) => ({
      category: cat,
      score: 0,
      label: cat,
    }));
    expect(computeOverallScore(scores)).toBe(0);
  });
});

describe("computeCategoryScoresFromFindings", () => {
  it("returns 100 for all categories when no findings", () => {
    const scores = computeCategoryScoresFromFindings([]);
    expect(scores).toHaveLength(6);
    for (const s of scores) {
      expect(s.score).toBe(100);
    }
  });

  it("deducts 15 per high severity finding", () => {
    const findings = [
      { id: "f-1", severity: "high" as const, category: "impact_metrics", title: "T", description: "D" },
    ];
    const scores = computeCategoryScoresFromFindings(findings);
    const impact = scores.find((s) => s.category === "impact_metrics");
    expect(impact?.score).toBe(85);
  });

  it("deducts 8 per medium severity finding", () => {
    const findings = [
      { id: "f-1", severity: "medium" as const, category: "clarity", title: "T", description: "D" },
    ];
    const scores = computeCategoryScoresFromFindings(findings);
    const clarity = scores.find((s) => s.category === "clarity");
    expect(clarity?.score).toBe(92);
  });

  it("deducts 3 per low severity finding", () => {
    const findings = [
      { id: "f-1", severity: "low" as const, category: "structure", title: "T", description: "D" },
    ];
    const scores = computeCategoryScoresFromFindings(findings);
    const structure = scores.find((s) => s.category === "structure");
    expect(structure?.score).toBe(97);
  });

  it("accumulates deductions for multiple findings in same category", () => {
    const findings = [
      { id: "f-1", severity: "high" as const, category: "impact_metrics", title: "T1", description: "D1" },
      { id: "f-2", severity: "medium" as const, category: "impact_metrics", title: "T2", description: "D2" },
      { id: "f-3", severity: "low" as const, category: "impact_metrics", title: "T3", description: "D3" },
    ];
    const scores = computeCategoryScoresFromFindings(findings);
    const impact = scores.find((s) => s.category === "impact_metrics");
    // 100 - 15 - 8 - 3 = 74
    expect(impact?.score).toBe(74);
  });

  it("clamps score at 0 (never negative)", () => {
    const findings = Array.from({ length: 10 }, (_, i) => ({
      id: `f-${i}`,
      severity: "high" as const,
      category: "impact_metrics",
      title: `T${i}`,
      description: `D${i}`,
    }));
    const scores = computeCategoryScoresFromFindings(findings);
    const impact = scores.find((s) => s.category === "impact_metrics");
    expect(impact?.score).toBe(0);
  });

  it("is deterministic — same input always produces same output", () => {
    const findings = [
      { id: "f-1", severity: "high" as const, category: "impact_metrics", title: "T1", description: "D1" },
      { id: "f-2", severity: "medium" as const, category: "pm_language", title: "T2", description: "D2" },
      { id: "f-3", severity: "low" as const, category: "relevance", title: "T3", description: "D3" },
    ];
    const run1 = computeCategoryScoresFromFindings(findings);
    const run2 = computeCategoryScoresFromFindings(findings);
    const run3 = computeCategoryScoresFromFindings(findings);
    expect(run1).toEqual(run2);
    expect(run2).toEqual(run3);
  });

  it("only affects the relevant category", () => {
    const findings = [
      { id: "f-1", severity: "high" as const, category: "clarity", title: "T1", description: "D1" },
    ];
    const scores = computeCategoryScoresFromFindings(findings);
    const nonClarity = scores.filter((s) => s.category !== "clarity");
    for (const s of nonClarity) {
      expect(s.score).toBe(100);
    }
  });
});

describe("validateCritiqueResult", () => {
  const validRaw = {
    summary: "Good resume overall.",
    findings: [
      {
        id: "f-001",
        severity: "high",
        category: "impact_metrics",
        title: "Missing metrics",
        description: "Several bullets lack quantified outcomes.",
      },
    ],
    strengths: ["Strong PM language", "Clear structure"],
  };

  it("computes scores from findings, not AI-provided scores", () => {
    const result = validateCritiqueResult(validRaw);
    // 1 high finding in impact_metrics: 100 - 15 = 85
    const impact = result.categoryScores.find((c) => c.category === "impact_metrics");
    expect(impact?.score).toBe(85);
    // All other categories have no findings: 100
    const others = result.categoryScores.filter((c) => c.category !== "impact_metrics");
    for (const c of others) {
      expect(c.score).toBe(100);
    }
  });

  it("ignores AI-provided categoryScores if present", () => {
    const raw = {
      ...validRaw,
      categoryScores: [
        { category: "impact_metrics", score: 50, label: "Impact" },
      ],
    };
    const result = validateCritiqueResult(raw);
    // Score comes from findings (85), not from AI's 50
    const impact = result.categoryScores.find((c) => c.category === "impact_metrics");
    expect(impact?.score).toBe(85);
  });

  it("produces all 6 category scores", () => {
    const result = validateCritiqueResult(validRaw);
    expect(result.categoryScores).toHaveLength(6);
  });

  it("handles missing findings gracefully", () => {
    const raw = { ...validRaw, findings: undefined };
    const result = validateCritiqueResult(raw);
    expect(result.findings).toEqual([]);
    // No findings = all categories at 100
    expect(result.overallScore).toBe(100);
  });

  it("normalizes invalid severity to low", () => {
    const raw = {
      ...validRaw,
      findings: [
        {
          id: "f-001",
          severity: "critical", // invalid
          category: "impact_metrics",
          title: "Test",
          description: "Test desc",
        },
      ],
    };
    const result = validateCritiqueResult(raw);
    expect(result.findings[0].severity).toBe("low");
  });

  it("throws for non-object input", () => {
    expect(() => validateCritiqueResult(null)).toThrow();
    expect(() => validateCritiqueResult("string")).toThrow();
    expect(() => validateCritiqueResult(42)).toThrow();
  });

  it("handles empty strengths array", () => {
    const raw = { ...validRaw, strengths: [] };
    const result = validateCritiqueResult(raw);
    expect(result.strengths).toEqual([]);
  });

  it("preserves profileSuggestions when present", () => {
    const raw = {
      ...validRaw,
      profileSuggestions: [
        { field: "keyMetrics", value: "ARR", suggestion: "Add to resume" },
      ],
    };
    const result = validateCritiqueResult(raw);
    expect(result.profileSuggestions).toHaveLength(1);
    expect(result.profileSuggestions?.[0].field).toBe("keyMetrics");
  });
});
