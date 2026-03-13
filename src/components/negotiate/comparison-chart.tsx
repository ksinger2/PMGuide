"use client";

import type { OfferComparison } from "@/lib/negotiate/calc-utils";
import { formatCurrency } from "@/lib/negotiate/calc-utils";

interface ComparisonChartProps {
  comparisons: OfferComparison[];
}

const COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function ComparisonChart({ comparisons }: ComparisonChartProps) {
  // Find the max value across all years for scaling
  const allValues = comparisons.flatMap((c) => c.yearByYear);
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">4-Year Compensation Trajectory</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {comparisons.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${COLORS[i % COLORS.length]}`} />
            <span className="text-xs text-slate-600">
              {c.label}{c.company ? ` (${c.company})` : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="space-y-6">
        {[0, 1, 2, 3].map((year) => (
          <div key={year}>
            <div className="text-xs text-slate-500 mb-2">Year {year + 1}</div>
            <div className="space-y-1.5">
              {comparisons.map((c, i) => {
                const value = c.yearByYear[year];
                const width = Math.max((value / maxValue) * 100, 2);
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-slate-500 text-right flex-shrink-0">
                      {c.label}
                    </div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all duration-500`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="w-24 text-xs font-medium text-slate-700 text-right flex-shrink-0">
                      {formatCurrency(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
