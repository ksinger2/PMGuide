"use client";

import type { CalculatorOffer } from "@/types/negotiation";
import { LOCATIONS } from "@/lib/negotiate/calc-utils";

interface OfferColumnProps {
  offer: CalculatorOffer;
  onChange: (offer: CalculatorOffer) => void;
  onRemove?: () => void;
}

export function OfferColumn({ offer, onChange, onRemove }: OfferColumnProps) {
  const update = (field: keyof CalculatorOffer, value: string | number) => {
    onChange({ ...offer, [field]: value });
  };

  const updateNumber = (field: keyof CalculatorOffer, raw: string) => {
    const val = parseInt(raw, 10);
    update(field, isNaN(val) ? 0 : val);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={offer.label}
          onChange={(e) => update("label", e.target.value)}
          className="text-sm font-semibold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 bg-transparent w-full"
          placeholder="Offer name"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-slate-400 hover:text-red-500 ml-2"
          >
            &times;
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Company</label>
        <input
          type="text"
          value={offer.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="e.g. Google"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Location</label>
        <select
          value={offer.location}
          onChange={(e) => update("location", e.target.value)}
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Base Salary</label>
        <input
          type="number"
          value={offer.base || ""}
          onChange={(e) => updateNumber("base", e.target.value)}
          placeholder="200000"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Total Equity (over vesting period)</label>
        <input
          type="number"
          value={offer.equity || ""}
          onChange={(e) => updateNumber("equity", e.target.value)}
          placeholder="400000"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Vesting Period (years)</label>
        <select
          value={offer.vestingYears}
          onChange={(e) => updateNumber("vestingYears", e.target.value)}
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        >
          <option value={3}>3 years</option>
          <option value={4}>4 years</option>
          <option value={5}>5 years</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Sign-on Bonus</label>
        <input
          type="number"
          value={offer.signOn || ""}
          onChange={(e) => updateNumber("signOn", e.target.value)}
          placeholder="50000"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Annual Bonus</label>
        <input
          type="number"
          value={offer.bonus || ""}
          onChange={(e) => updateNumber("bonus", e.target.value)}
          placeholder="40000"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
