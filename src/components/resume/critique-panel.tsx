"use client";

import { useState, useCallback, useEffect } from "react";
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import {
  validateCritiqueResult,
  CATEGORY_WEIGHTS,
  type CritiqueResult,
  type Finding,
} from "@/lib/resume/score-utils";
import { RESUME_CRITIQUE_KEY } from "@/lib/utils/constants";

// Module-level state — survives component mount/unmount cycles
let pendingCritique: {
  resumeId: string;
  promise: Promise<{ result: CritiqueResult | null; error: string | null }>;
} | null = null;

let resolvedCritique: {
  resumeId: string;
  result: CritiqueResult;
} | null = null;

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

function FindingCard({
  finding,
  onAccept,
  onReject,
}: {
  finding: Finding;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[finding.severity];
  const status = finding.status ?? "accepted";
  const hasSuggestion = !!finding.suggestedText;
  const isRejected = status === "rejected";

  return (
    <div
      className={`rounded-lg border ${
        isRejected
          ? "border-red-200 bg-red-50/40 opacity-60"
          : status === "accepted"
            ? `${config.border} ${config.bg}`
            : `${config.border} ${config.bg}`
      } p-4`}
      data-testid={`finding-${finding.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-start justify-between text-left"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${config.icon}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isRejected ? "text-slate-400 line-through" : "text-slate-800"}`}>
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

        {hasSuggestion && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onAccept?.(finding.id)}
              disabled={status === "accepted"}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                status === "accepted"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"
              }`}
              aria-label="Accept suggestion"
              data-testid={`finding-accept-${finding.id}`}
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => onReject?.(finding.id)}
              disabled={status === "rejected"}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                status === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"
              }`}
              aria-label="Reject suggestion"
              data-testid={`finding-reject-${finding.id}`}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 pl-7">
          <p className="text-sm text-slate-700">{finding.description}</p>

          {finding.originalText && (
            <div className="rounded-md bg-white/60 p-3">
              <p className="text-xs font-medium text-slate-500">Original</p>
              <p className={`mt-1 text-sm text-slate-600 ${status === "accepted" ? "line-through" : ""}`}>
                {finding.originalText}
              </p>
            </div>
          )}

          {finding.suggestedText && (
            <div className="rounded-md bg-white/60 p-3">
              <p className="text-xs font-medium text-green-600">Suggested</p>
              <p className={`mt-1 text-sm text-slate-800 ${isRejected ? "line-through" : ""}`}>
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
  const [findingStatuses, setFindingStatuses] = useState<Record<string, "accepted" | "rejected">>({});

  // Clear stale module cache when resumeId changes
  useEffect(() => {
    if (resolvedCritique && resolvedCritique.resumeId !== resumeId) {
      resolvedCritique = null;
    }
    if (pendingCritique && pendingCritique.resumeId !== resumeId) {
      pendingCritique = null;
    }
  }, [resumeId]);

  // Recover pending/resolved critique on mount
  useEffect(() => {
    if (resolvedCritique && resolvedCritique.resumeId === resumeId) {
      setCritique(resolvedCritique.result);
      const initialStatuses: Record<string, "accepted" | "rejected"> = {};
      for (const f of resolvedCritique.result.findings) initialStatuses[f.id] = "accepted";
      setFindingStatuses(initialStatuses);
      onCritiqueComplete?.(resolvedCritique.result.findings.map(f => ({ ...f, status: "accepted" })));
      return;
    }

    if (pendingCritique && pendingCritique.resumeId === resumeId) {
      setIsLoading(true);
      let cancelled = false;

      pendingCritique.promise.then(({ result, error: fetchError }) => {
        if (cancelled) return;
        if (result) {
          resolvedCritique = { resumeId, result };
          setCritique(result);
          const initialStatuses: Record<string, "accepted" | "rejected"> = {};
          for (const f of result.findings) initialStatuses[f.id] = "accepted";
          setFindingStatuses(initialStatuses);
          onCritiqueComplete?.(result.findings.map(f => ({ ...f, status: "accepted" })));
        } else {
          setError(fetchError);
        }
        setIsLoading(false);
        pendingCritique = null;
      });

      return () => { cancelled = true; };
    }
  }, [resumeId]);

  const runCritique = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCritique(null);
    resolvedCritique = null;

    const critiquePromise = (async (): Promise<{ result: CritiqueResult | null; error: string | null }> => {
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

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          return { result: null, error: json?.error?.message ?? `Request failed (${res.status})` };
        }

        const raw = json?.data;
        if (!raw) {
          return { result: null, error: "Empty response from critique API." };
        }

        const result = validateCritiqueResult(raw);

        // Persist to localStorage immediately (outside React lifecycle)
        const findingsWithStatus = result.findings.map(f => ({ ...f, status: "accepted" as const }));
        try {
          localStorage.setItem(RESUME_CRITIQUE_KEY, JSON.stringify(findingsWithStatus));
        } catch { /* localStorage full */ }

        return { result, error: null };
      } catch {
        return { result: null, error: "Network error. Please check your connection and try again." };
      }
    })();

    pendingCritique = { resumeId, promise: critiquePromise };

    const { result, error: fetchError } = await critiquePromise;

    if (result) {
      resolvedCritique = { resumeId, result };
    }
    pendingCritique = null;

    // setState calls — safe if unmounted (React ignores them silently)
    if (result) {
      setCritique(result);
      const initialStatuses: Record<string, "accepted" | "rejected"> = {};
      for (const f of result.findings) initialStatuses[f.id] = "accepted";
      setFindingStatuses(initialStatuses);
      onCritiqueComplete?.(result.findings.map(f => ({ ...f, status: "accepted" })));
    } else {
      setError(fetchError);
    }
    setIsLoading(false);
  }, [resumeId, extractedText, sections, state.profile, onCritiqueComplete]);

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
          {critique.categoryScores.map((cat) => {
            const weight = CATEGORY_WEIGHTS[cat.category];
            const weightPct = weight ? `${Math.round(weight * 100)}%` : "";
            return (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {cat.label}
                  {weightPct && (
                    <span className="ml-1.5 text-xs text-slate-400">({weightPct})</span>
                  )}
                </span>
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
            );
          })}
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
      {critique.findings.length > 0 && (() => {
        const sortedFindings = [...critique.findings].sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.severity] - order[b.severity];
        });
        const withSuggestions = sortedFindings.filter(f => f.suggestedText);
        const acceptedCount = withSuggestions.filter(f => findingStatuses[f.id] === "accepted").length;
        const rejectedCount = withSuggestions.filter(f => findingStatuses[f.id] === "rejected").length;

        const handleAccept = (id: string) => {
          setFindingStatuses(prev => {
            const next = { ...prev, [id]: "accepted" as const };
            onCritiqueComplete?.(critique.findings.map(f => ({ ...f, status: next[f.id] ?? "accepted" })));
            return next;
          });
        };

        const handleReject = (id: string) => {
          setFindingStatuses(prev => {
            const next = { ...prev, [id]: "rejected" as const };
            onCritiqueComplete?.(critique.findings.map(f => ({ ...f, status: next[f.id] ?? "accepted" })));
            return next;
          });
        };

        const handleAcceptAll = () => {
          setFindingStatuses(prev => {
            const next = { ...prev };
            for (const f of withSuggestions) next[f.id] = "accepted";
            onCritiqueComplete?.(critique.findings.map(f => ({ ...f, status: next[f.id] ?? "accepted" })));
            return next;
          });
        };

        const handleRejectAll = () => {
          setFindingStatuses(prev => {
            const next = { ...prev };
            for (const f of withSuggestions) next[f.id] = "rejected";
            onCritiqueComplete?.(critique.findings.map(f => ({ ...f, status: next[f.id] ?? "accepted" })));
            return next;
          });
        };

        return (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Findings ({critique.findings.length})
                {withSuggestions.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {acceptedCount} accepted · {rejectedCount} rejected
                  </span>
                )}
              </h3>
              {withSuggestions.length > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                    data-testid="findings-accept-all"
                  >
                    <Check size={12} />
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                    data-testid="findings-reject-all"
                  >
                    <X size={12} />
                    Reject All
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {sortedFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={{ ...finding, status: findingStatuses[finding.id] ?? "accepted" }}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        );
      })()}

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
