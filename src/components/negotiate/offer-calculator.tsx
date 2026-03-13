"use client";

import { useState, useMemo } from "react";
import type { CalculatorOffer } from "@/types/negotiation";
import { OfferColumn } from "./offer-column";
import { ComparisonChart } from "./comparison-chart";
import { compareOffers, formatCurrency } from "@/lib/negotiate/calc-utils";

interface OfferCalculatorProps {
  offers: CalculatorOffer[];
  onUpdateOffers: (offers: CalculatorOffer[]) => void;
  onBack: () => void;
}

function createEmptyOffer(index: number): CalculatorOffer {
  return {
    id: `offer-${Date.now()}-${index}`,
    label: `Offer ${String.fromCharCode(65 + index)}`,
    company: "",
    base: 0,
    equity: 0,
    vestingYears: 4,
    signOn: 0,
    bonus: 0,
    location: "San Francisco",
  };
}

export function OfferCalculator({ offers, onUpdateOffers, onBack }: OfferCalculatorProps) {
  const [localOffers, setLocalOffers] = useState<CalculatorOffer[]>(
    offers.length >= 2 ? offers : [createEmptyOffer(0), createEmptyOffer(1)]
  );
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasValidOffers = localOffers.every((o) => o.base > 0);
  const comparisons = useMemo(
    () => (hasValidOffers ? compareOffers(localOffers) : []),
    [localOffers, hasValidOffers]
  );

  const updateOffer = (index: number, offer: CalculatorOffer) => {
    const updated = [...localOffers];
    updated[index] = offer;
    setLocalOffers(updated);
    onUpdateOffers(updated);
  };

  const addOffer = () => {
    if (localOffers.length >= 4) return;
    const updated = [...localOffers, createEmptyOffer(localOffers.length)];
    setLocalOffers(updated);
    onUpdateOffers(updated);
  };

  const removeOffer = (index: number) => {
    if (localOffers.length <= 2) return;
    const updated = localOffers.filter((_, i) => i !== index);
    setLocalOffers(updated);
    onUpdateOffers(updated);
  };

  const requestAiAnalysis = async () => {
    if (!hasValidOffers) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const res = await fetch("/api/negotiate/analyze-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers: localOffers, comparisons }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiAnalysis(json.data?.analysis ?? "Analysis could not be generated.");
      } else {
        setAiAnalysis("Failed to generate AI analysis. Try again.");
      }
    } catch {
      setAiAnalysis("Network error. Try again.");
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6" data-testid="offer-calculator">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Offer Calculator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Compare offers side-by-side with 4-year projections and location adjustment.
          </p>
        </div>
        {localOffers.length < 4 && (
          <button
            type="button"
            onClick={addOffer}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            + Add Offer
          </button>
        )}
      </div>

      {/* Offer columns */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${localOffers.length}, 1fr)` }}>
        {localOffers.map((offer, i) => (
          <OfferColumn
            key={offer.id}
            offer={offer}
            onChange={(updated) => updateOffer(i, updated)}
            onRemove={localOffers.length > 2 ? () => removeOffer(i) : undefined}
          />
        ))}
      </div>

      {/* Comparison results */}
      {hasValidOffers && comparisons.length >= 2 && (
        <>
          {/* Summary table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Metric</th>
                  {comparisons.map((c) => (
                    <th key={c.id} className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { label: "Annual TC", key: "annualTC" as const },
                  { label: "Year 1 TC", key: "year1TC" as const },
                  { label: "4-Year Total", key: "fourYearTC" as const },
                  { label: "NPV (8%)", key: "npv" as const },
                  { label: "COL-Adjusted TC", key: "colAdjustedTC" as const },
                  { label: "After-Tax Annual", key: "afterTaxAnnual" as const },
                ].map((row) => {
                  const values = comparisons.map((c) => c[row.key]);
                  const maxVal = Math.max(...values);
                  return (
                    <tr key={row.key}>
                      <td className="px-4 py-3 text-slate-600">{row.label}</td>
                      {comparisons.map((c) => (
                        <td
                          key={c.id}
                          className={`px-4 py-3 text-right font-medium ${
                            c[row.key] === maxVal ? "text-emerald-600" : "text-slate-800"
                          }`}
                        >
                          {formatCurrency(c[row.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <ComparisonChart comparisons={comparisons} />

          {/* AI Analysis */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">AI Analysis</h3>
              <button
                type="button"
                onClick={requestAiAnalysis}
                disabled={isAnalyzing}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? "Analyzing..." : aiAnalysis ? "Re-analyze" : "Get AI Analysis"}
              </button>
            </div>
            {aiAnalysis ? (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiAnalysis}</p>
            ) : (
              <p className="text-xs text-slate-400">
                Click &quot;Get AI Analysis&quot; for a narrative comparison of your offers.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
