"use client";

import { useState } from "react";
import type {
  NegotiationCompany,
  ScenarioType,
  DifficultyLevel,
} from "@/types/negotiation";
import { COMPANIES, SCENARIOS, DIFFICULTY_OPTIONS } from "@/lib/negotiate/scenarios";

interface ExpertSetupProps {
  onStart: (company: NegotiationCompany, scenario: ScenarioType, difficulty: DifficultyLevel) => void;
  onBack: () => void;
}

export function ExpertSetup({ onStart, onBack }: ExpertSetupProps) {
  const [company, setCompany] = useState<NegotiationCompany>("google");
  const [scenario, setScenario] = useState<ScenarioType>("initial-offer");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("realistic");
  const [isStarting, setIsStarting] = useState(false);

  return (
    <div className="space-y-6" data-testid="expert-setup">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">Watch the Expert</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick a scenario and watch how an expert negotiator handles it, with annotated tactics.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value as NegotiationCompany)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {COMPANIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Scenario</label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => setScenario(s.type)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                scenario === s.type
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm font-medium text-slate-800">{s.label}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setIsStarting(true); onStart(company, scenario, difficulty); }}
          disabled={isStarting}
          className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStarting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </span>
          ) : (
            "Generate Expert Demo"
          )}
        </button>
      </div>
    </div>
  );
}
