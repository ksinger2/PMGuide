"use client";

import type { NegotiationMode, NegotiationHistoryEntry } from "@/types/negotiation";

interface NegotiateHomeProps {
  history: NegotiationHistoryEntry[];
  onSelectMode: (mode: NegotiationMode) => void;
}

const MODE_CARDS: Array<{
  mode: NegotiationMode;
  icon: string;
  title: string;
  description: string;
  color: string;
}> = [
  {
    mode: "simulator",
    icon: "🎭",
    title: "Negotiation Simulator",
    description: "Roleplay with an AI recruiter. Hidden budget ceiling. Get scored on outcome.",
    color: "hover:border-indigo-300 hover:shadow-md",
  },
  {
    mode: "expert",
    icon: "📖",
    title: "Watch the Expert",
    description: "See an annotated model negotiation with labeled tactics and explanations.",
    color: "hover:border-amber-300 hover:shadow-md",
  },
  {
    mode: "coach",
    icon: "💬",
    title: "Chat with Coach",
    description: "Get personalized negotiation advice, email templates, and strategy.",
    color: "hover:border-emerald-300 hover:shadow-md",
  },
  {
    mode: "tips",
    icon: "📚",
    title: "Tips & Frameworks",
    description: "Voss techniques, Ackerman model, BATNA, anti-patterns, and email templates.",
    color: "hover:border-purple-300 hover:shadow-md",
  },
  {
    mode: "calculator",
    icon: "🧮",
    title: "Offer Calculator",
    description: "Side-by-side offer comparison with 4-year projections and location adjustment.",
    color: "hover:border-rose-300 hover:shadow-md",
  },
];

function getScoreColor(score: number): string {
  if (score >= 4) return "bg-emerald-500";
  if (score >= 3) return "bg-amber-500";
  return "bg-red-500";
}

const MODE_LABELS: Record<string, string> = {
  simulator: "Simulator",
  expert: "Expert",
  coach: "Coach",
  tips: "Tips",
  calculator: "Calculator",
};

export function NegotiateHome({ history, onSelectMode }: NegotiateHomeProps) {
  const recentHistory = history.slice(0, 6);

  // Quick stats
  const simulatorSessions = history.filter((h) => h.mode === "simulator");
  const avgScore =
    simulatorSessions.length > 0
      ? simulatorSessions.reduce((sum, h) => sum + (h.score ?? 0), 0) / simulatorSessions.length
      : 0;

  return (
    <div className="space-y-8" data-testid="negotiate-home">
      {/* Mode selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODE_CARDS.map((card) => (
          <button
            key={card.mode}
            type="button"
            onClick={() => onSelectMode(card.mode)}
            className={`group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all ${card.color}`}
            data-testid={`mode-${card.mode}`}
          >
            <div className="mb-3 text-3xl">{card.icon}</div>
            <h3 className="text-lg font-semibold text-slate-800">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
          </button>
        ))}
      </div>

      {/* Quick stats */}
      {simulatorSessions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">Your Stats</h3>
          <div className="flex gap-4">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-2xl font-bold text-slate-800">{simulatorSessions.length}</div>
              <div className="text-xs text-slate-500">Negotiations</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-2xl font-bold text-slate-800">{avgScore.toFixed(1)}</div>
              <div className="text-xs text-slate-500">Avg Score</div>
            </div>
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {recentHistory.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">Recent Sessions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {entry.company !== "any" ? entry.company.charAt(0).toUpperCase() + entry.company.slice(1) : "General"}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {MODE_LABELS[entry.mode] ?? entry.mode}
                    </span>
                  </div>
                  {entry.score != null && (
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${getScoreColor(entry.score)}`}
                    >
                      {entry.score}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
