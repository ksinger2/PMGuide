"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { ResumeBranch, Suggestion, BranchChatMessage } from "@/types/resume-branch";
import type { ResumeContent } from "@/lib/resume/docx-builder";
import { useProfile } from "@/stores/profile-context";
import { SuggestionList } from "./suggestion-list";
import { BranchChat } from "./branch-chat";
import { DownloadButton } from "./download-button";

interface BranchPanelProps {
  branch: ResumeBranch;
  onUpdateSuggestion: (suggestionId: string, status: "accepted" | "rejected") => void;
  onSetSuggestions: (suggestions: Suggestion[]) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onAddChatMessage: (message: BranchChatMessage) => void;
  onApplyRewrite: (newContent: ResumeContent) => void;
}

export function BranchPanel({
  branch,
  onUpdateSuggestion,
  onSetSuggestions,
  onAcceptAll,
  onRejectAll,
  onAddChatMessage,
  onApplyRewrite,
}: BranchPanelProps) {
  const { state } = useProfile();
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const acceptedSuggestions = branch.suggestions.filter(
    (s) => s.status === "accepted"
  );
  const rejectedSuggestions = branch.suggestions.filter(
    (s) => s.status === "rejected"
  );
  const canApply = acceptedSuggestions.length > 0;

  const handleApplyChanges = useCallback(async () => {
    if (!canApply) return;
    setIsApplying(true);
    setApplyError(null);

    try {
      const res = await fetch("/api/resume/branch-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResumeText: branch.content.fullText,
          acceptedSuggestions: acceptedSuggestions.map((s) => ({
            id: s.id,
            sectionType: s.sectionType,
            original: s.original,
            suggested: s.suggested,
            reason: s.reason,
          })),
          rejectedSuggestions: rejectedSuggestions.map((s) => ({
            id: s.id,
            sectionType: s.sectionType,
            original: s.original,
            suggested: s.suggested,
            reason: s.reason,
          })),
          jobDescriptionText: branch.jobDescriptionText,
          profile: state.profile ?? undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setApplyError(json?.error?.message ?? "Failed to apply changes.");
        setIsApplying(false);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        setApplyError("Failed to read response.");
        setIsApplying(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === "text" && parsed.text) {
              accumulated += parsed.text;
            }
          } catch {
            // Partial JSON
          }
        }
      }

      // Parse the rewritten resume
      let jsonStr = accumulated.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const result = JSON.parse(jsonStr);
      if (result.content) {
        onApplyRewrite(result.content as ResumeContent);
      } else {
        setApplyError("AI response missing content. Please try again.");
      }
    } catch {
      setApplyError("Failed to apply changes. Please try again.");
    } finally {
      setIsApplying(false);
    }
  }, [
    branch,
    canApply,
    acceptedSuggestions,
    rejectedSuggestions,
    state.profile,
    onApplyRewrite,
  ]);

  const handleNewSuggestions = useCallback(
    (newSuggestions: Suggestion[]) => {
      // Merge with existing — replace any with matching IDs, append new ones
      const existingIds = new Set(branch.suggestions.map((s) => s.id));
      const merged = [
        ...branch.suggestions,
        ...newSuggestions.filter((s) => !existingIds.has(s.id)),
      ];
      onSetSuggestions(merged);
    },
    [branch.suggestions, onSetSuggestions]
  );

  return (
    <div className="space-y-4" data-testid={`branch-panel-${branch.id}`}>
      {/* Branch summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {branch.jobTitle}
            </h3>
            <p className="text-sm text-slate-500">{branch.company}</p>
          </div>
          <DownloadButton
            content={branch.content}
            filename={`resume-${branch.company.toLowerCase().replace(/\s+/g, "-")}.docx`}
          />
        </div>

        {/* Keyword alignment */}
        {(branch.keywordAlignment.matched.length > 0 ||
          branch.keywordAlignment.added.length > 0 ||
          branch.keywordAlignment.missing.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {branch.keywordAlignment.matched.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-green-600">
                  {branch.keywordAlignment.matched.length} matched
                </span>
              </div>
            )}
            {branch.keywordAlignment.added.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-blue-500" />
                <span className="text-blue-600">
                  {branch.keywordAlignment.added.length} added
                </span>
              </div>
            )}
            {branch.keywordAlignment.missing.length > 0 && (
              <div className="flex items-center gap-1">
                <XCircle size={12} className="text-amber-500" />
                <span className="text-amber-600">
                  {branch.keywordAlignment.missing.length} missing
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two-column layout: suggestions + chat */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: Suggestions */}
        <div>
          <SuggestionList
            suggestions={branch.suggestions}
            onAccept={(id) => onUpdateSuggestion(id, "accepted")}
            onReject={(id) => onUpdateSuggestion(id, "rejected")}
            onAcceptAll={onAcceptAll}
            onRejectAll={onRejectAll}
          />

          {/* Apply changes button */}
          {branch.suggestions.length > 0 && (
            <div className="mt-4">
              {applyError && (
                <p className="mb-2 text-xs text-red-500">{applyError}</p>
              )}
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={!canApply || isApplying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
                data-testid="branch-apply-changes"
              >
                {isApplying ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Apply {acceptedSuggestions.length} Accepted Change
                    {acceptedSuggestions.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <BranchChat
          branchId={branch.id}
          chatHistory={branch.chatHistory}
          currentResumeText={branch.content.fullText}
          jobDescriptionText={branch.jobDescriptionText}
          suggestions={branch.suggestions}
          profile={(state.profile as Partial<import("@/lib/utils/profile").UserProfile>) ?? {}}
          onNewMessage={(msg) => onAddChatMessage(msg)}
          onNewSuggestions={handleNewSuggestions}
        />
      </div>
    </div>
  );
}
