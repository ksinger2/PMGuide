"use client";

import { useEffect } from "react";
import type {
  ExpertNegotiation,
  NegotiationCompany,
  ScenarioType,
  DifficultyLevel,
} from "@/types/negotiation";

interface ExpertViewingProps {
  negotiation: ExpertNegotiation | null;
  config: { company: NegotiationCompany; scenario: ScenarioType; difficulty: DifficultyLevel } | null;
  isLoading: boolean;
  setError: (error: string | null) => void;
  setExpertNegotiation: (negotiation: ExpertNegotiation) => void;
  onHome: () => void;
}

function getTacticColor(tactic?: string): string {
  if (!tactic) return "";
  const t = tactic.toLowerCase();
  if (t.includes("mirror")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (t.includes("label")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (t.includes("calibrat")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (t.includes("anchor")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (t.includes("silence")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (t.includes("component") || t.includes("separat")) return "bg-rose-100 text-rose-700 border-rose-200";
  if (t.includes("batna") || t.includes("leverage")) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function ExpertViewing({
  negotiation,
  config,
  isLoading,
  setError,
  setExpertNegotiation,
  onHome,
}: ExpertViewingProps) {
  // Auto-fetch expert demo when entering this screen
  useEffect(() => {
    if (isLoading && config && !negotiation) {
      fetch("/api/negotiate/expert-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: config.company,
          scenario: config.scenario,
          difficulty: config.difficulty,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Expert demo failed" }));
            setError(err.error ?? "Failed to generate expert demo");
            return;
          }
          const json = await res.json();
          setExpertNegotiation(json.data as ExpertNegotiation);
        })
        .catch(() => {
          setError("Network error — could not generate expert demo");
        });
    }
  }, [isLoading, config, negotiation, setError, setExpertNegotiation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600" />
        <p className="mt-4 text-sm text-slate-500">Generating expert negotiation...</p>
      </div>
    );
  }

  if (!negotiation) return null;

  return (
    <div className="space-y-6" data-testid="expert-viewing">
      <button
        type="button"
        onClick={onHome}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      {/* Header */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-lg font-semibold text-amber-800">Expert Negotiation</h2>
        <p className="mt-1 text-sm text-amber-700">{negotiation.scenario}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-amber-600">
          <span>Company: {negotiation.company}</span>
          <span>Difficulty: {negotiation.difficulty}</span>
          {negotiation.totalCompGain && (
            <span className="font-medium">Gained: {negotiation.totalCompGain}</span>
          )}
        </div>
      </div>

      {/* Annotated transcript */}
      <div className="space-y-4">
        {negotiation.transcript.map((turn, i) => {
          const isCandidate = turn.role === "candidate";
          return (
            <div
              key={i}
              className={`rounded-lg p-4 ${
                isCandidate
                  ? "bg-white border-2 border-amber-200"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold ${isCandidate ? "text-amber-700" : "text-slate-500"}`}>
                  {isCandidate ? "Expert Candidate" : "Recruiter"}
                </span>
                {turn.tactic && (
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getTacticColor(turn.tactic)}`}>
                    {turn.tactic}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{turn.content}</p>
              {turn.why && (
                <div className="mt-2 rounded bg-amber-50 border border-amber-100 p-2">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Why this works:</span> {turn.why}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary + Takeaways */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Summary</h3>
          <p className="text-sm text-slate-600">{negotiation.summary}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Key Takeaways</h3>
          <ul className="space-y-1">
            {negotiation.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-amber-500 mt-1 flex-shrink-0">&#9679;</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onHome}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
