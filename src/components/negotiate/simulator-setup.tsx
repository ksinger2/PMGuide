"use client";

import { useState, useRef } from "react";
import type {
  SimulatorConfig,
  NegotiationCompany,
  ScenarioType,
  DifficultyLevel,
  BudgetCeiling,
} from "@/types/negotiation";
import {
  COMPANIES,
  SCENARIOS,
  DIFFICULTY_OPTIONS,
  TARGET_ROLES,
} from "@/lib/negotiate/scenarios";

interface SimulatorSetupProps {
  onStart: (config: SimulatorConfig, scenarioContext: string, budgetCeiling: BudgetCeiling) => void;
  onBack: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export function SimulatorSetup({
  onStart,
  onBack,
  setLoading,
  setError,
  isLoading,
}: SimulatorSetupProps) {
  const [company, setCompany] = useState<NegotiationCompany>("google");
  const [scenario, setScenario] = useState<ScenarioType>("initial-offer");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("realistic");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [currentComp, setCurrentComp] = useState("");
  const startingRef = useRef(false);

  const handleStart = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setLoading(true);
    setError(null);

    const config: SimulatorConfig = {
      company,
      scenario,
      difficulty,
      targetRole,
      currentComp: currentComp ? parseInt(currentComp, 10) : undefined,
    };

    try {
      const res = await fetch("/api/negotiate/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to generate scenario" }));
        setError(err.error ?? "Failed to generate scenario");
        return;
      }

      const json = await res.json();
      const data = json.data;

      // Store recruiter briefing in scenarioContext for the chat route
      const fullContext = `${data.scenarioContext}\n\nInitial offer: Base ${data.initialOffer.base}, Equity ${data.initialOffer.equity}/yr, Sign-on ${data.initialOffer.signOn}, Bonus ${data.initialOffer.bonus}/yr, Level: ${data.initialOffer.level}`;

      onStart(config, fullContext, data.budgetCeiling);
    } catch {
      setError("Network error — could not generate scenario");
    } finally {
      startingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="simulator-setup">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">Simulator Setup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure your negotiation scenario. The AI recruiter will have a hidden budget ceiling.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value as NegotiationCompany)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {COMPANIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {TARGET_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Current Comp (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Current Total Comp <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="number"
            value={currentComp}
            onChange={(e) => setCurrentComp(e.target.value)}
            placeholder="e.g. 350000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Scenario */}
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
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm font-medium text-slate-800">{s.label}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{s.description}</p>
              <span className="mt-2 inline-block text-xs text-slate-400">{s.difficulty}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Recruiter Difficulty</label>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                difficulty === d.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-sm font-medium text-slate-800">{d.label}</span>
              <p className="mt-1 text-xs text-slate-500">{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStart}
          disabled={isLoading}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating scenario...
            </span>
          ) : (
            "Start Negotiation"
          )}
        </button>
      </div>
    </div>
  );
}
