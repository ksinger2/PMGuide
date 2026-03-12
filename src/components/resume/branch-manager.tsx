"use client";

import { useCallback, useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import type { ResumeContent } from "@/lib/resume/docx-builder";
import type { ResumeBranch } from "@/types/resume-branch";
import { useProfile } from "@/stores/profile-context";
import { useBranches } from "@/hooks/use-branches";
import { BranchUrlInput } from "./branch-url-input";
import { BranchTabs } from "./branch-tabs";
import { BranchPanel } from "./branch-panel";

interface BranchManagerProps {
  baseContent: ResumeContent;
}

export function BranchManager({ baseContent }: BranchManagerProps) {
  const { state: profileState } = useProfile();
  const {
    state,
    activeBranch,
    addBranch,
    removeBranch,
    setActive,
    updateSuggestion,
    setSuggestions,
    addChatMessage,
    applyRewrite,
    acceptAll,
    rejectAll,
    updateBranchMeta,
  } = useBranches();

  const [isCreating, setIsCreating] = useState(false);

  const handleBranchCreate = useCallback(
    async (data: {
      jobUrl: string;
      jobTitle: string;
      company: string;
      jobDescriptionText: string;
    }) => {
      setIsCreating(true);

      try {
        // Call the existing fork API to get the initial tailored version
        const res = await fetch("/api/resume/fork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generatedResumeId: `branch-${Date.now()}`,
            baseContent: baseContent.fullText,
            jobDescription: data.jobDescriptionText,
            profile: profileState.profile ?? undefined,
          }),
        });

        if (!res.ok) {
          // Create branch with base content if fork fails
          const branch: ResumeBranch = {
            id: crypto.randomUUID(),
            jobUrl: data.jobUrl,
            jobTitle: data.jobTitle,
            company: data.company,
            jobDescriptionText: data.jobDescriptionText,
            content: baseContent,
            suggestions: [],
            chatHistory: [],
            keywordAlignment: { matched: [], missing: [], added: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          addBranch(branch);
          return;
        }

        // Read SSE stream from fork API
        const reader = res.body?.getReader();
        if (!reader) {
          setIsCreating(false);
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

        // Parse fork result
        let jsonStr = accumulated.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr
            .replace(/^```(?:json)?\n?/, "")
            .replace(/\n?```$/, "");
        }

        let forkContent: ResumeContent = baseContent;
        let keywordAlignment = { matched: [] as string[], missing: [] as string[], added: [] as string[] };
        let resolvedTitle = data.jobTitle;
        let resolvedCompany = data.company;

        try {
          const forkResult = JSON.parse(jsonStr);
          if (forkResult.content) {
            forkContent = forkResult.content as ResumeContent;
          }
          if (forkResult.keywordAlignment) {
            keywordAlignment = forkResult.keywordAlignment;
          }
          if (forkResult.targetRole && resolvedTitle === "Untitled Position") {
            resolvedTitle = forkResult.targetRole;
          }
          if (forkResult.targetCompany && resolvedCompany === "Unknown Company") {
            resolvedCompany = forkResult.targetCompany;
          }
        } catch {
          // Use base content as fallback
        }

        const branch: ResumeBranch = {
          id: crypto.randomUUID(),
          jobUrl: data.jobUrl,
          jobTitle: resolvedTitle,
          company: resolvedCompany,
          jobDescriptionText: data.jobDescriptionText,
          content: forkContent,
          suggestions: [],
          chatHistory: [
            {
              id: `msg-init-${Date.now()}`,
              role: "assistant",
              content: `I've tailored your resume for the ${resolvedTitle} position at ${resolvedCompany}. You can chat with me to make further adjustments, or review suggestions as they come in.`,
            },
          ],
          keywordAlignment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addBranch(branch);
      } catch {
        // Create branch with base content on error
        const branch: ResumeBranch = {
          id: crypto.randomUUID(),
          jobUrl: data.jobUrl,
          jobTitle: data.jobTitle,
          company: data.company,
          jobDescriptionText: data.jobDescriptionText,
          content: baseContent,
          suggestions: [],
          chatHistory: [],
          keywordAlignment: { matched: [], missing: [], added: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addBranch(branch);
      } finally {
        setIsCreating(false);
      }
    },
    [baseContent, profileState.profile, addBranch]
  );

  return (
    <div className="space-y-4" data-testid="branch-manager">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitBranch size={18} className="text-primary-600" />
        <h2 className="text-base font-semibold text-slate-800">
          Resume Branches
        </h2>
        {state.branches.length > 0 && (
          <span className="text-xs text-slate-400">
            {state.branches.length} branch
            {state.branches.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {/* URL Input */}
      <BranchUrlInput
        branchCount={state.branches.length}
        onBranchCreate={handleBranchCreate}
      />

      {/* Creating spinner */}
      {isCreating && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
          <Loader2 size={16} className="animate-spin text-primary-600" />
          <p className="text-sm text-slate-600">
            Creating tailored branch...
          </p>
        </div>
      )}

      {/* Tabs */}
      <BranchTabs
        branches={state.branches}
        activeBranchId={state.activeBranchId}
        onSelect={setActive}
        onClose={removeBranch}
        onRename={(branchId, newTitle) => updateBranchMeta(branchId, { jobTitle: newTitle })}
      />

      {/* Active branch panel */}
      {activeBranch && (
        <BranchPanel
          branch={activeBranch}
          onUpdateSuggestion={(suggestionId, status) =>
            updateSuggestion(activeBranch.id, suggestionId, status)
          }
          onSetSuggestions={(suggestions) =>
            setSuggestions(activeBranch.id, suggestions)
          }
          onAcceptAll={() => acceptAll(activeBranch.id)}
          onRejectAll={() => rejectAll(activeBranch.id)}
          onAddChatMessage={(msg) => addChatMessage(activeBranch.id, msg)}
          onApplyRewrite={(newContent) =>
            applyRewrite(activeBranch.id, newContent)
          }
        />
      )}
    </div>
  );
}
