"use client";

import { CheckCheck, XCircle } from "lucide-react";
import type { Suggestion } from "@/types/resume-branch";
import { SuggestionCard } from "./suggestion-card";

interface SuggestionListProps {
  suggestions: Suggestion[];
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export function SuggestionList({
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
}: SuggestionListProps) {
  if (suggestions.length === 0) return null;

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;
  const rejectedCount = suggestions.filter((s) => s.status === "rejected").length;

  return (
    <div data-testid="suggestion-list">
      {/* Header with batch actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-slate-800">
            Suggestions ({suggestions.length})
          </h4>
          <div className="flex items-center gap-2 text-xs">
            {acceptedCount > 0 && (
              <span className="text-green-600">{acceptedCount} accepted</span>
            )}
            {rejectedCount > 0 && (
              <span className="text-red-500">{rejectedCount} rejected</span>
            )}
            {pendingCount > 0 && (
              <span className="text-slate-400">{pendingCount} pending</span>
            )}
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAcceptAll}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
              data-testid="suggestion-accept-all"
            >
              <CheckCheck size={12} />
              Accept All
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              data-testid="suggestion-reject-all"
            >
              <XCircle size={12} />
              Reject All
            </button>
          </div>
        )}
      </div>

      {/* Suggestion cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {suggestions.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onAccept={() => onAccept(s.id)}
            onReject={() => onReject(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
