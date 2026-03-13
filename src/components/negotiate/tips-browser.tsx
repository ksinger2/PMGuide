"use client";

import { FRAMEWORK_CATEGORIES, FRAMEWORKS, getFrameworksByCategory } from "@/lib/negotiate/frameworks";
import { TipCard } from "./tip-card";

interface TipsBrowserProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onBack: () => void;
  onTrySimulator: () => void;
}

export function TipsBrowser({
  activeCategory,
  onCategoryChange,
  onBack,
  onTrySimulator,
}: TipsBrowserProps) {
  const selectedCategory = activeCategory ?? FRAMEWORK_CATEGORIES[0].id;
  const frameworks = getFrameworksByCategory(selectedCategory);

  return (
    <div className="space-y-6" data-testid="tips-browser">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">Tips & Frameworks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Master the tactics, frameworks, and psychology behind successful negotiations.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Category sidebar */}
        <div className="hidden sm:block w-48 flex-shrink-0 space-y-1">
          {FRAMEWORK_CATEGORIES.map((cat) => {
            const count = FRAMEWORKS.filter((f) => f.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
                <span className="ml-auto text-xs text-slate-400"> ({count})</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-200 mt-4">
            <button
              type="button"
              onClick={onTrySimulator}
              className="w-full rounded-lg bg-indigo-50 px-3 py-2 text-left text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              Try in Simulator &rarr;
            </button>
          </div>
        </div>

        {/* Mobile category select */}
        <div className="sm:hidden w-full">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4"
          >
            {FRAMEWORK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Framework cards */}
        <div className="flex-1 space-y-3">
          {frameworks.length === 0 ? (
            <p className="text-sm text-slate-500">No frameworks in this category yet.</p>
          ) : (
            frameworks.map((framework) => (
              <TipCard key={framework.id} framework={framework} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
