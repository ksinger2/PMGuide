"use client";

import type { SessionEntry, InterviewMode } from "@/types/interview";
import { getScoreColor } from "./score-banner";

interface InterviewHomeProps {
  history: SessionEntry[];
  onSelectMode: (mode: InterviewMode) => void;
}

const AGENTS = [
  { icon: "🎨", name: "Product Design", type: "product-design" },
  { icon: "♟️", name: "Strategy", type: "product-strategy" },
  { icon: "⚡", name: "Execution", type: "product-execution" },
  { icon: "📊", name: "Analytical", type: "product-analytical" },
  { icon: "🔢", name: "Estimation", type: "product-estimation" },
  { icon: "⚙️", name: "Technical", type: "product-technical" },
  { icon: "💬", name: "Behavioral", type: "behavioral" },
];

const TYPE_LABELS: Record<string, string> = {
  "product-design": "Product Design",
  "product-strategy": "Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

export function InterviewHome({ history, onSelectMode }: InterviewHomeProps) {
  const recentHistory = history.slice(0, 6);

  return (
    <div className="space-y-8" data-testid="interview-home">
      {/* Mode selection */}
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelectMode("interview")}
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-indigo-300 hover:shadow-md"
          data-testid="mode-interview"
        >
          <div className="mb-3 text-3xl">🎙️</div>
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-700">
            Interview Mode
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Multi-question session with category rotation. Claude leads — you
            respond.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("practice")}
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-emerald-300 hover:shadow-md"
          data-testid="mode-practice"
        >
          <div className="mb-3 text-3xl">🎯</div>
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700">
            Practice Mode
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            One focused question at a time. You pick the company and category.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("expert")}
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-amber-300 hover:shadow-md"
          data-testid="mode-expert"
        >
          <div className="mb-3 text-3xl">📖</div>
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-amber-700">
            Watch the Expert
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            See how a model PM structures answers. Learn by example.
          </p>
        </button>
      </div>

      {/* Specialist agents */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-600">
          Specialist Agents
        </h3>
        <div className="flex flex-wrap gap-2">
          {AGENTS.map((agent) => (
            <div
              key={agent.type}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm"
            >
              <span>{agent.icon}</span>
              <span className="text-slate-700">{agent.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent sessions */}
      {recentHistory.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Recent Sessions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentHistory.map((entry, i) => {
              const colors = getScoreColor(entry.score);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        {entry.company}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </span>
                    </div>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${colors.badge}`}
                    >
                      {entry.score}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                    {entry.question}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
