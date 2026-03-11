"use client";

import { useState, useCallback } from "react";
import {
  Wand2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { DownloadButton } from "@/components/resume/download-button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateSection {
  type: string;
  title: string;
  content: string;
}

interface Change {
  sectionType: string;
  original: string;
  improved: string;
  reason: string;
}

interface GenerateResult {
  content: {
    sections: GenerateSection[];
    fullText: string;
  };
  changes: Change[];
}

interface Finding {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  sectionRef?: string;
}

interface GeneratePanelProps {
  resumeId: string;
  extractedText: string;
  sections?: Array<{
    type: string;
    title: string;
    content: string;
    startLine: number;
    endLine: number;
  }>;
  critiqueFindings: Finding[];
  onGenerateComplete: (result: GenerateResult) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChangeCard({ change }: { change: Change }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {change.sectionType}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Original</p>
            <p className="mt-1 text-sm text-slate-500 line-through whitespace-pre-wrap">
              {change.original}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight size={14} className="text-slate-300" />
          </div>

          <div className="rounded-md bg-green-50 p-3">
            <p className="text-xs font-medium text-green-600">Improved</p>
            <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">
              {change.improved}
            </p>
          </div>

          <p className="text-xs italic text-slate-500">{change.reason}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GeneratePanel({
  resumeId,
  extractedText,
  sections,
  critiqueFindings,
  onGenerateComplete,
}: GeneratePanelProps) {
  const { state } = useProfile();
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [userFeedback, setUserFeedback] = useState("");
  const [changesExpanded, setChangesExpanded] = useState(false);

  const runGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRawText("");
    setResult(null);

    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          extractedText,
          sections,
          profile: state.profile ?? undefined,
          critiqueFindings,
          userFeedback: userFeedback.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error?.message ?? `Request failed (${res.status})`);
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        setError("Failed to read response stream.");
        setIsLoading(false);
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
              setRawText(accumulated);
            }
          } catch {
            // Partial JSON, skip
          }
        }
      }

      // Parse accumulated JSON — strip markdown code fences if present
      let jsonStr = accumulated.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      try {
        const parsed = JSON.parse(jsonStr) as GenerateResult;
        setResult(parsed);
        onGenerateComplete(parsed);
      } catch {
        setError(
          "Failed to parse generation results. The AI response was not valid JSON."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    resumeId,
    extractedText,
    sections,
    state.profile,
    critiqueFindings,
    userFeedback,
    onGenerateComplete,
  ]);

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  if (!result && !isLoading && !error) {
    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-6"
        data-testid="generate-ready"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Wand2 size={24} className="text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            Generate Improved Resume
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Apply critique findings to produce an improved version of your
            resume.
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="user-feedback"
            className="block text-sm font-medium text-slate-700"
          >
            Additional instructions{" "}
            <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="user-feedback"
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="e.g. Focus on quantifying impact, emphasize leadership experience..."
            rows={3}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            data-testid="generate-feedback"
          />
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={runGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            data-testid="generate-start"
          >
            <Wand2 size={16} />
            Generate Improved Resume
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-6"
        data-testid="generate-loading"
      >
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">
            Generating improved resume with Claude Sonnet 4...
          </p>
        </div>
        {rawText && (
          <div className="mt-4 max-h-32 overflow-hidden rounded-md bg-slate-50 p-3">
            <p className="text-xs text-slate-400 font-mono truncate">
              {rawText.slice(-200)}
            </p>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6"
        data-testid="generate-error"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Generation failed
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={runGenerate}
              className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200 transition-colors hover:bg-red-50"
              data-testid="generate-retry"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Results
  // -------------------------------------------------------------------------
  if (!result) return null;

  return (
    <div className="space-y-6" data-testid="generate-results">
      {/* Improved Resume Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-800">
            Improved Resume
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {result.changes.length} change
          {result.changes.length !== 1 ? "s" : ""} applied based on critique
          findings.
        </p>
      </div>

      {/* Resume Sections */}
      {result.content.sections.map((section, index) => (
        <div
          key={`${section.type}-${index}`}
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <h4 className="text-sm font-semibold text-slate-800">
            {section.title}
          </h4>
          <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
            {section.content}
          </div>
        </div>
      ))}

      {/* Changes Made — expandable */}
      {result.changes.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <button
            type="button"
            onClick={() => setChangesExpanded(!changesExpanded)}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold text-slate-800">
              Changes Made ({result.changes.length})
            </h3>
            {changesExpanded ? (
              <ChevronUp size={16} className="shrink-0 text-slate-400" />
            ) : (
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            )}
          </button>

          {changesExpanded && (
            <div className="mt-4 space-y-3">
              {result.changes.map((change, index) => (
                <ChangeCard key={index} change={change} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <DownloadButton
          content={result.content}
          filename="resume-improved.docx"
          label="Download DOCX"
          variant="primary"
        />
        <button
          type="button"
          onClick={() => onGenerateComplete(result)}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-300 bg-white px-5 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          data-testid="generate-fork"
        >
          <ArrowRight size={16} />
          Fork for a Job
        </button>
        <button
          type="button"
          onClick={runGenerate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          data-testid="generate-rerun"
        >
          <Wand2 size={16} />
          Re-generate
        </button>
      </div>
    </div>
  );
}
