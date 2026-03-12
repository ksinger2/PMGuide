"use client";

import { Check, X } from "lucide-react";
import type { Suggestion } from "@/types/resume-branch";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
}

const statusStyles = {
  pending: "border-slate-200 bg-white",
  accepted: "border-green-300 bg-green-50",
  rejected: "border-red-200 bg-red-50 opacity-60",
};

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: SuggestionCardProps) {
  const isPending = suggestion.status === "pending";

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${statusStyles[suggestion.status]}`}
      data-testid={`suggestion-${suggestion.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {suggestion.sectionType}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAccept}
            disabled={!isPending}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              suggestion.status === "accepted"
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600 disabled:opacity-40"
            }`}
            aria-label="Accept suggestion"
            data-testid={`suggestion-accept-${suggestion.id}`}
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={!isPending}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              suggestion.status === "rejected"
                ? "bg-red-500 text-white"
                : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-40"
            }`}
            aria-label="Reject suggestion"
            data-testid={`suggestion-reject-${suggestion.id}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Diff view */}
      <div className="mt-3 space-y-2">
        <div className="rounded-md bg-red-50 p-2.5">
          <p className="text-xs font-medium text-red-500 mb-1">Original</p>
          <p className={`text-sm text-slate-700 ${suggestion.status === "accepted" ? "line-through" : ""}`}>
            {suggestion.original}
          </p>
        </div>
        <div className="rounded-md bg-green-50 p-2.5">
          <p className="text-xs font-medium text-green-600 mb-1">Suggested</p>
          <p className={`text-sm text-slate-800 ${suggestion.status === "rejected" ? "line-through" : ""}`}>
            {suggestion.suggested}
          </p>
        </div>
      </div>

      {/* Reason */}
      <p className="mt-2 text-xs text-slate-500 italic">{suggestion.reason}</p>
    </div>
  );
}
