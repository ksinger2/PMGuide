"use client";

interface ScoreBannerProps {
  score: number;
  scoreLabel: string;
  overall: string;
}

function getScoreColor(score: number): {
  bg: string;
  text: string;
  ring: string;
  badge: string;
} {
  if (score >= 4) {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-500",
      badge: "bg-emerald-500",
    };
  }
  if (score >= 3) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-500",
      badge: "bg-amber-500",
    };
  }
  return {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-500",
    badge: "bg-red-500",
  };
}

export function ScoreBanner({ score, scoreLabel, overall }: ScoreBannerProps) {
  const colors = getScoreColor(score);

  return (
    <div
      className={`rounded-xl ${colors.bg} p-6`}
      data-testid="score-banner"
    >
      <div className="flex items-center gap-6">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ring-4 ${colors.ring} bg-white`}
        >
          <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
        </div>
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${colors.badge}`}
          >
            {scoreLabel}
          </span>
          <p className="mt-2 text-sm text-slate-700">{overall}</p>
        </div>
      </div>
    </div>
  );
}

export { getScoreColor };
