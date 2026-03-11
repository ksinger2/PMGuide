"use client";

import { useState, useCallback } from "react";
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryScore {
  category: string;
  score: number;
  label: string;
}

interface Finding {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  sectionRef?: string;
}

interface CritiqueResult {
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

interface CritiquePanelProps {
  resumeId: string;
  extractedText: string;
  sections?: Array<{
    type: string;
    title: string;
    content: string;
    startLine: number;
    endLine: number;
  }>;
  onCritiqueComplete?: (findings: Finding[]) => void;
}

// ---------------------------------------------------------------------------
// Severity styles
// ---------------------------------------------------------------------------

const severityConfig = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: "text-red-500",
    label: "High",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
    label: "Medium",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-500",
    label: "Low",
  },
};

function scoreColor(score: number): string {
  if (score >= 67) return "text-green-600";
  if (score >= 34) return "text-amber-600";
  return "text-red-600";
}

function scoreBarColor(score: number): string {
  if (score >= 67) return "bg-green-500";
  if (score >= 34) return "bg-amber-500";
  return "bg-red-500";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={score >= 67 ? "#22c55e" : score >= 34 ? "#f59e0b" : "#ef4444"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span
        className={`absolute text-2xl font-bold ${scoreColor(score)}`}
        data-testid="overall-score"
      >
        {score}
      </span>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[finding.severity];

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} p-4`}
      data-testid={`finding-${finding.id}`}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${config.icon}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800">
                {finding.title}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}
              >
                {config.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{finding.category}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="mt-0.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={16} className="mt-0.5 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 pl-7">
          <p className="text-sm text-slate-700">{finding.description}</p>

          {finding.originalText && (
            <div className="rounded-md bg-white/60 p-3">
              <p className="text-xs font-medium text-slate-500">Original</p>
              <p className="mt-1 text-sm text-slate-600 line-through">
                {finding.originalText}
              </p>
            </div>
          )}

          {finding.suggestedText && (
            <div className="rounded-md bg-white/60 p-3">
              <p className="text-xs font-medium text-green-600">Suggested</p>
              <p className="mt-1 text-sm text-slate-800">
                {finding.suggestedText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CritiquePanel({
  resumeId,
  extractedText,
  sections,
  onCritiqueComplete,
}: CritiquePanelProps) {
  const { state } = useProfile();
  const [critique, setCritique] = useState<CritiqueResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");

  const runCritique = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRawText("");
    setCritique(null);

    try {
      const res = await fetch("/api/resume/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          extractedText,
          sections,
          profile: state.profile ?? undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error?.message ?? `Request failed (${res.status})`);
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        setError("Failed to read response stream.");
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === "text" && parsed.text) {
              accumulated += parsed.text;
              setRawText(accumulated);
            }
          } catch {
            // Partial JSON, skip
          }
        }
      }

      // Parse accumulated JSON
      // Strip markdown code fences if present
      let jsonStr = accumulated.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      try {
        const result = JSON.parse(jsonStr) as CritiqueResult;
        setCritique(result);
        onCritiqueComplete?.(result.findings);
      } catch {
        setError(
          "Failed to parse critique results. The AI response was not valid JSON."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, extractedText, sections, state.profile]);

  // Initial state — show "Get Critique" button
  if (!critique && !isLoading && !error) {
    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-6 text-center"
        data-testid="critique-ready"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
          <Sparkles size={24} className="text-primary-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          Ready to analyze
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Get an AI-powered critique of your resume with actionable feedback.
        </p>
        <button
          type="button"
          onClick={runCritique}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          data-testid="critique-start"
        >
          <BarChart3 size={16} />
          Get Critique
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-6"
        data-testid="critique-loading"
      >
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">
            Analyzing your resume with Claude Sonnet 4...
          </p>
        </div>
        {rawText && (
          <div className="mt-4 max-h-32 overflow-hidden rounded-md bg-slate-50 p-3">
            <p className="text-xs text-slate-400 font-mono truncate">
              {rawText.slice(-200)}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6"
        data-testid="critique-error"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Critique failed
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={runCritique}
              className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200 transition-colors hover:bg-red-50"
              data-testid="critique-retry"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (!critique) return null;

  const highCount = critique.findings.filter((f) => f.severity === "high").length;
  const medCount = critique.findings.filter((f) => f.severity === "medium").length;
  const lowCount = critique.findings.filter((f) => f.severity === "low").length;

  return (
    <div className="space-y-6" data-testid="critique-results">
      {/* Score Overview */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <ScoreRing score={critique.overallScore} />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-800">
              Resume Score
            </h3>
            <p className="mt-1 text-sm text-slate-600">{critique.summary}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
              {highCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  {highCount} critical
                </span>
              )}
              {medCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {medCount} improvements
                </span>
              )}
              {lowCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {lowCount} suggestions
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-800">
          Category Breakdown
        </h3>
        <div className="mt-4 space-y-3">
          {critique.categoryScores.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{cat.label}</span>
                <span className={`font-medium ${scoreColor(cat.score)}`}>
                  {cat.score}/100
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(cat.score)}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {critique.strengths.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <h3 className="text-sm font-semibold text-green-800">Strengths</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {critique.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Findings */}
      {critique.findings.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Findings ({critique.findings.length})
          </h3>
          <div className="space-y-3">
            {critique.findings
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.severity] - order[b.severity];
              })
              .map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
          </div>
        </div>
      )}

      {/* Re-run */}
      <div className="text-center">
        <button
          type="button"
          onClick={runCritique}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          data-testid="critique-rerun"
        >
          <BarChart3 size={16} />
          Re-analyze
        </button>
      </div>
    </div>
  );
}
