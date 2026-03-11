"use client";

import { useState, useCallback } from "react";
import {
  GitFork,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { DownloadButton } from "@/components/resume/download-button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ForkSection {
  type: string;
  title: string;
  content: string;
}

interface TailoringNote {
  sectionType: string;
  whatChanged: string;
  why: string;
}

interface KeywordAlignment {
  matched: string[];
  missing: string[];
  added: string[];
}

interface ForkResult {
  targetCompany: string;
  targetRole: string;
  content: {
    sections: ForkSection[];
    fullText: string;
  };
  tailoringNotes: TailoringNote[];
  keywordAlignment: KeywordAlignment;
}

interface GenerateResult {
  content: {
    sections: { type: string; title: string; content: string }[];
    fullText: string;
  };
  changes: {
    sectionType: string;
    original: string;
    improved: string;
    reason: string;
  }[];
}

interface ForkPanelProps {
  generatedResumeId: string;
  generateResult: GenerateResult;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KeywordBadge({
  keyword,
  variant,
}: {
  keyword: string;
  variant: "matched" | "added" | "missing";
}) {
  const styles = {
    matched: "bg-green-100 text-green-700",
    added: "bg-blue-100 text-blue-700",
    missing: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {keyword}
    </span>
  );
}

function TailoringNoteCard({ note }: { note: TailoringNote }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <FileText size={16} className="mt-0.5 shrink-0 text-primary-500" />
          <div>
            <span className="text-sm font-medium text-slate-800">
              {note.sectionType}
            </span>
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              {note.whatChanged}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="mt-0.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={16} className="mt-0.5 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 pl-7">
          <div>
            <p className="text-xs font-medium text-slate-500">What changed</p>
            <p className="mt-1 text-sm text-slate-700">{note.whatChanged}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Why</p>
            <p className="mt-1 text-sm text-slate-700">{note.why}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ForkPanel({
  generatedResumeId,
  generateResult,
}: ForkPanelProps) {
  const { state } = useProfile();
  const [jobDescription, setJobDescription] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [forkResult, setForkResult] = useState<ForkResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [streamLabel, setStreamLabel] = useState("");

  const runFork = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRawText("");
    setForkResult(null);
    setStreamLabel("Tailoring resume...");

    try {
      const res = await fetch("/api/resume/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedResumeId,
          baseContent: generateResult.content,
          jobDescription,
          profile: state.profile ?? undefined,
          userNotes: userNotes || undefined,
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
        jsonStr = jsonStr
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");
      }

      try {
        const result = JSON.parse(jsonStr) as ForkResult;
        setForkResult(result);
        setStreamLabel(
          `Tailoring resume for ${result.targetRole} at ${result.targetCompany}...`
        );
      } catch {
        setError(
          "Failed to parse tailoring results. The AI response was not valid JSON."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [generatedResumeId, generateResult.content, jobDescription, userNotes, state.profile]);

  // -------------------------------------------------------------------------
  // Input state
  // -------------------------------------------------------------------------
  if (!forkResult && !isLoading && !error) {
    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-6"
        data-testid="fork-input"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
            <GitFork size={20} className="text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            Tailor for a Job
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="fork-jd"
              className="block text-sm font-medium text-slate-700"
            >
              Job Description
            </label>
            <textarea
              id="fork-jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="mt-1 w-full min-h-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
            />
          </div>

          <div>
            <label
              htmlFor="fork-notes"
              className="block text-sm font-medium text-slate-700"
            >
              Notes{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="fork-notes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Any specific instructions? e.g., 'emphasize my data skills'"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
              rows={3}
            />
          </div>

          <button
            type="button"
            onClick={runFork}
            disabled={!jobDescription.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="fork-start"
          >
            <GitFork size={16} />
            Generate Tailored Resume
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
        data-testid="fork-loading"
      >
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">{streamLabel}</p>
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
        data-testid="fork-error"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Tailoring failed
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={runFork}
              className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200 transition-colors hover:bg-red-50"
              data-testid="fork-retry"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Results state
  // -------------------------------------------------------------------------
  if (!forkResult) return null;

  const { keywordAlignment, tailoringNotes } = forkResult;

  return (
    <div className="space-y-6" data-testid="fork-results">
      {/* Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
            <GitFork size={20} className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Tailored for {forkResult.targetRole} at{" "}
              {forkResult.targetCompany}
            </h3>
          </div>
        </div>
      </div>

      {/* Keyword Alignment */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-800">
          Keyword Alignment
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Matched */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Matched ({keywordAlignment.matched.length})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywordAlignment.matched.length > 0 ? (
                keywordAlignment.matched.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} variant="matched" />
                ))
              ) : (
                <p className="text-xs text-green-600">No matched keywords</p>
              )}
            </div>
          </div>

          {/* Added */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <PlusCircle size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Added ({keywordAlignment.added.length})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywordAlignment.added.length > 0 ? (
                keywordAlignment.added.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} variant="added" />
                ))
              ) : (
                <p className="text-xs text-blue-600">No keywords added</p>
              )}
            </div>
          </div>

          {/* Missing */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Missing ({keywordAlignment.missing.length})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywordAlignment.missing.length > 0 ? (
                keywordAlignment.missing.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} variant="missing" />
                ))
              ) : (
                <p className="text-xs text-amber-600">
                  All keywords covered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tailored Resume Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Tailored Resume
        </h3>
        {forkResult.content.sections.map((section) => (
          <div
            key={section.type}
            className="rounded-lg border border-slate-200 bg-white p-6"
          >
            <h4 className="text-sm font-semibold text-slate-800">
              {section.title}
            </h4>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Tailoring Notes */}
      {tailoringNotes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Tailoring Notes ({tailoringNotes.length})
          </h3>
          <div className="space-y-3">
            {tailoringNotes.map((note, i) => (
              <TailoringNoteCard key={i} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <DownloadButton
          content={forkResult.content}
          filename={`resume-${forkResult.targetCompany.toLowerCase().replace(/\s+/g, "-")}.docx`}
          label={`Download for ${forkResult.targetCompany}`}
          variant="primary"
        />
        <button
          type="button"
          onClick={() => {
            setForkResult(null);
            setRawText("");
            setStreamLabel("");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          data-testid="fork-new"
        >
          <GitFork size={16} />
          Tailor for Another Job
        </button>
      </div>
    </div>
  );
}
