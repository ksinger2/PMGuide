"use client";

import { useState } from "react";
import type {
  NegotiationFeedback,
  SimulatorConfig,
  NegotiationTurn,
  CoachNote,
} from "@/types/negotiation";
import { formatCurrency } from "@/lib/negotiate/comp-data";

interface SimulatorResultsProps {
  feedback: NegotiationFeedback;
  config: SimulatorConfig | null;
  turns: NegotiationTurn[];
  coachNotes: CoachNote[];
  onHome: () => void;
  onTryAgain: () => void;
}

type Tab = "overview" | "rubric" | "tactics" | "transcript";

function getScoreColor(score: number) {
  if (score >= 4) return { ring: "text-emerald-500", badge: "bg-emerald-500", bg: "bg-emerald-50" };
  if (score >= 3) return { ring: "text-amber-500", badge: "bg-amber-500", bg: "bg-amber-50" };
  return { ring: "text-red-500", badge: "bg-red-500", bg: "bg-red-50" };
}

function getRubricScoreColor(score: string) {
  switch (score) {
    case "Very Strong": return "bg-emerald-100 text-emerald-700";
    case "Strong": return "bg-emerald-50 text-emerald-600";
    case "Neutral": return "bg-amber-50 text-amber-700";
    case "Weak": return "bg-red-50 text-red-600";
    case "Very Weak": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

export function SimulatorResults({
  feedback,
  config,
  turns,
  coachNotes,
  onHome,
  onTryAgain,
}: SimulatorResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const colors = getScoreColor(feedback.score);
  const { projectedOutcome } = feedback;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "rubric", label: "Rubric" },
    { id: "tactics", label: "Tactics" },
    { id: "transcript", label: "Transcript" },
  ];

  return (
    <div className="space-y-6" data-testid="simulator-results">
      {/* Score + Outcome header */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Score ring */}
        <div className={`rounded-xl border p-6 ${colors.bg}`}>
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="#e2e8f0" strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={`${(feedback.score / 5) * 264} 264`}
                  strokeLinecap="round"
                  className={colors.ring}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{feedback.score}</span>
                <span className="text-xs text-slate-500">/5</span>
              </div>
            </div>
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white ${colors.badge}`}>
                {feedback.scoreLabel}
              </span>
              <p className="mt-2 text-sm text-slate-700">{feedback.overall}</p>
            </div>
          </div>
        </div>

        {/* Outcome reveal */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Outcome Reveal</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Original Offer</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(projectedOutcome.originalOffer)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Your Result</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(projectedOutcome.finalOffer)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
              <span className="text-slate-500">Budget Ceiling</span>
              <span className="font-medium text-indigo-600">
                {formatCurrency(
                  projectedOutcome.budgetCeiling.base.ceiling +
                  projectedOutcome.budgetCeiling.equity.ceiling +
                  projectedOutcome.budgetCeiling.signing.ceiling
                )}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <span className={`text-lg font-bold ${projectedOutcome.deltaDollars > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {projectedOutcome.deltaDollars > 0 ? "+" : ""}
                {formatCurrency(projectedOutcome.deltaDollars)}
              </span>
              <span className="ml-2 text-sm text-slate-500">
                ({projectedOutcome.deltaPercent > 0 ? "+" : ""}
                {projectedOutcome.deltaPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* One Change */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-1">One Change</h4>
        <p className="text-sm text-amber-700">{feedback.oneChange}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Mistakes */}
          {feedback.mistakes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Mistakes</h4>
              <div className="space-y-2">
                {feedback.mistakes.map((m, i) => (
                  <div key={i} className="rounded-lg border border-red-100 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-800">{m.mistake}</p>
                    <p className="text-xs text-red-600 mt-1">Impact: {m.impact}</p>
                    <p className="text-xs text-slate-600 mt-1">Instead: {m.whatInstead}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email template */}
          {feedback.emailTemplate && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Follow-up Email Template</h4>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {feedback.emailTemplate}
                </pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(feedback.emailTemplate ?? "")}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Copy to clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "rubric" && (
        <div className="space-y-2">
          {feedback.rubric.map((row, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-800">{row.signal}</span>
                <p className="text-xs text-slate-500 mt-0.5">{row.note}</p>
              </div>
              <span className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${getRubricScoreColor(row.score)}`}>
                {row.score}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "tactics" && (
        <div className="space-y-2">
          {feedback.tacticsUsed.length === 0 ? (
            <p className="text-sm text-slate-500">No specific tactics identified.</p>
          ) : (
            feedback.tacticsUsed.map((t, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{t.tactic}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.effectiveness === "strong" ? "bg-emerald-100 text-emerald-700" :
                    t.effectiveness === "weak" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {t.effectiveness}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 italic">&quot;{t.example}&quot;</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {turns.map((turn, i) => {
            const note = coachNotes.find((n) => n.turnIndex === i);
            return (
              <div key={i} className={`rounded-lg p-3 ${turn.role === "user" ? "bg-indigo-50 border border-indigo-100" : "bg-white border border-slate-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">
                    {turn.role === "user" ? "You" : "Recruiter"}
                  </span>
                  {note && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      note.effectiveness === "strong" ? "bg-emerald-100 text-emerald-700" :
                      note.effectiveness === "weak" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {note.tactic}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{turn.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onHome}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
