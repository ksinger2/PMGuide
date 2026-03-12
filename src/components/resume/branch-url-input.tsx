"use client";

import { useState, useCallback } from "react";
import { Link2, Loader2, ClipboardPaste, AlertTriangle, Pencil } from "lucide-react";
import { MAX_BRANCHES } from "@/lib/utils/constants";

interface FetchResult {
  jobTitle: string;
  company: string;
  jobDescriptionText: string;
}

interface BranchUrlInputProps {
  branchCount: number;
  onBranchCreate: (data: FetchResult & { jobUrl: string }) => void;
}

export function BranchUrlInput({
  branchCount,
  onBranchCreate,
}: BranchUrlInputProps) {
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review step state
  const [reviewData, setReviewData] = useState<(FetchResult & { jobUrl: string }) | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editJd, setEditJd] = useState("");

  const atLimit = branchCount >= MAX_BRANCHES;

  const handleFetchUrl = useCallback(async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/resume/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        const msg = json.error?.message ?? "Failed to fetch job description.";
        setError(msg);
        setShowPaste(true);
        setIsLoading(false);
        return;
      }

      // Show review step instead of creating immediately
      const data = {
        jobUrl: url.trim(),
        jobTitle: json.data.jobTitle,
        company: json.data.company,
        jobDescriptionText: json.data.jobDescriptionText,
      };
      setReviewData(data);
      setEditTitle(data.jobTitle === "Untitled Position" ? "" : data.jobTitle);
      setEditCompany(data.company === "Unknown Company" ? "" : data.company);
      setEditJd(data.jobDescriptionText);
      setError(null);
    } catch {
      setError("Network error. Try pasting the job description instead.");
      setShowPaste(true);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const handlePasteSubmit = useCallback(() => {
    if (!pasteText.trim() || pasteText.trim().length < 50) {
      setError("Please paste at least 50 characters of the job description.");
      return;
    }

    // Show review step for paste too
    const data = {
      jobUrl: url.trim() || "manual-paste",
      jobTitle: "Untitled Position",
      company: "Unknown Company",
      jobDescriptionText: pasteText.trim(),
    };
    setReviewData(data);
    setEditTitle("");
    setEditCompany("");
    setEditJd(data.jobDescriptionText);
    setError(null);
  }, [pasteText, url]);

  const handleConfirmCreate = useCallback(() => {
    if (!reviewData) return;
    if (!editJd.trim() || editJd.trim().length < 50) {
      setError("Job description must be at least 50 characters.");
      return;
    }

    onBranchCreate({
      jobUrl: reviewData.jobUrl,
      jobTitle: editTitle.trim() || "Untitled Position",
      company: editCompany.trim() || "Unknown Company",
      jobDescriptionText: editJd.trim(),
    });

    // Reset all state
    setUrl("");
    setPasteText("");
    setShowPaste(false);
    setReviewData(null);
    setEditTitle("");
    setEditCompany("");
    setEditJd("");
    setError(null);
  }, [reviewData, editTitle, editCompany, editJd, onBranchCreate]);

  const handleCancelReview = useCallback(() => {
    setReviewData(null);
    setEditTitle("");
    setEditCompany("");
    setEditJd("");
    setError(null);
  }, []);

  if (atLimit) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm text-amber-700">
          Maximum {MAX_BRANCHES} branches reached. Remove a branch to add a new one.
        </p>
      </div>
    );
  }

  // Review/edit step
  if (reviewData) {
    return (
      <div
        className="rounded-lg border border-primary-200 bg-primary-50/30 p-5 space-y-4"
        data-testid="branch-url-input"
      >
        <div className="flex items-center gap-2">
          <Pencil size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Review before creating branch
          </h3>
        </div>

        {/* Job Title */}
        <div>
          <label htmlFor="branch-edit-title" className="block text-xs font-medium text-slate-600 mb-1">
            Job Title
          </label>
          <input
            id="branch-edit-title"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="e.g. Senior Product Manager - Growth"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            data-testid="branch-edit-title"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="branch-edit-company" className="block text-xs font-medium text-slate-600 mb-1">
            Company
          </label>
          <input
            id="branch-edit-company"
            type="text"
            value={editCompany}
            onChange={(e) => setEditCompany(e.target.value)}
            placeholder="e.g. Netflix"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            data-testid="branch-edit-company"
          />
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="branch-edit-jd" className="block text-xs font-medium text-slate-600 mb-1">
            Job Description
            <span className="ml-1 text-slate-400 font-normal">
              ({editJd.length.toLocaleString()} chars)
            </span>
          </label>
          <textarea
            id="branch-edit-jd"
            value={editJd}
            onChange={(e) => setEditJd(e.target.value)}
            placeholder="Paste or edit the job description..."
            rows={8}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            data-testid="branch-edit-jd"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelReview}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCreate}
            disabled={editJd.trim().length < 50}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
            data-testid="branch-confirm-create"
          >
            Create Branch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white p-5"
      data-testid="branch-url-input"
    >
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Tailor for a specific job
      </h3>

      {/* URL input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
            placeholder="Paste job posting URL..."
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            data-testid="branch-url-field"
          />
        </div>
        <button
          type="button"
          onClick={handleFetchUrl}
          disabled={isLoading || !url.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
          data-testid="branch-create-btn"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Fetching...
            </>
          ) : (
            "Fetch Job"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}

      {/* Paste fallback toggle */}
      {!showPaste && (
        <button
          type="button"
          onClick={() => setShowPaste(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ClipboardPaste size={12} />
          Or paste the job description
        </button>
      )}

      {/* Paste textarea */}
      {showPaste && (
        <div className="mt-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={6}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            data-testid="branch-paste-field"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowPaste(false);
                setPasteText("");
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={pasteText.trim().length < 50}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-40"
              data-testid="branch-paste-submit"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
