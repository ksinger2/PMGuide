"use client";

interface ProgressBarProps {
  current: number;
  total: number | null; // null = infinite mode
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  if (total === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Question {current + 1}</span>
        <span className="text-slate-300">·</span>
        <span>Infinite mode</span>
      </div>
    );
  }

  const percent = Math.min(((current + 1) / total) * 100, 100);

  return (
    <div className="space-y-1" data-testid="progress-bar">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
