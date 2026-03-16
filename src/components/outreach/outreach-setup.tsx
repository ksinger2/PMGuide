"use client";

import { useState, useCallback, useRef } from "react";
import { Link2, Loader2, ClipboardPaste, AlertTriangle } from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import type { AudienceType, MessageFormat, OutreachContext } from "@/types/outreach";

interface OutreachSetupProps {
  audienceType: AudienceType;
  onStart: (context: OutreachContext) => void;
  onBack: () => void;
}

const AUDIENCE_TITLES: Record<AudienceType, string> = {
  "hiring-manager": "Hiring Manager",
  recruiter: "Recruiter",
  referral: "Referral / Connection",
};

export function OutreachSetup({ audienceType, onStart, onBack }: OutreachSetupProps) {
  const { state: profileState } = useProfile();
  const profile = profileState.profile;
  const startingRef = useRef(false);

  // Job info
  const [url, setUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Message config
  const [messageFormat, setMessageFormat] = useState<MessageFormat>("email");
  const [userName, setUserName] = useState(profile?.name ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleFetchUrl = useCallback(async () => {
    if (!url.trim()) return;
    setIsFetching(true);
    setFetchError(null);

    try {
      const res = await fetch("/api/resume/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFetchError(json.error?.message ?? "Failed to fetch job description.");
        setShowPaste(true);
        setIsFetching(false);
        return;
      }

      setJobTitle(json.data.jobTitle === "Untitled Position" ? "" : json.data.jobTitle);
      setCompany(json.data.company === "Unknown Company" ? "" : json.data.company);
      setJobDescriptionText(json.data.jobDescriptionText);
      setFetchError(null);
    } catch {
      setFetchError("Network error. Try pasting the job description instead.");
      setShowPaste(true);
    } finally {
      setIsFetching(false);
    }
  }, [url]);

  const handleStart = () => {
    if (startingRef.current) return;
    startingRef.current = true;

    const context: OutreachContext = {
      audienceType,
      messageFormat,
      userName: userName.trim() || profile?.name || "",
      recipientName: recipientName.trim(),
      purpose: purpose.trim(),
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      jobDescriptionText: jobDescriptionText.trim(),
      jobUrl: url.trim() || "",
    };

    onStart(context);
    startingRef.current = false;
  };

  const canStart = company.trim() || jobTitle.trim() || jobDescriptionText.trim();

  return (
    <div className="space-y-6" data-testid="outreach-setup">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Message to {AUDIENCE_TITLES[audienceType]}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Provide job context so the AI can craft a targeted message.
        </p>
      </div>

      {/* Format toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Message Format
        </label>
        <div className="flex gap-2">
          {(["email", "linkedin"] as MessageFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setMessageFormat(fmt)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                messageFormat === fmt
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {fmt === "email" ? "Email" : "LinkedIn"}
            </button>
          ))}
        </div>
      </div>

      {/* Job URL input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Job Posting URL <span className="text-slate-400">(optional)</span>
        </label>
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
              disabled={isFetching}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              data-testid="outreach-url-field"
            />
          </div>
          <button
            type="button"
            onClick={handleFetchUrl}
            disabled={isFetching || !url.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-40"
          >
            {isFetching ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch"
            )}
          </button>
        </div>

        {fetchError && (
          <div className="mt-2 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">{fetchError}</p>
          </div>
        )}

        {!showPaste && !jobDescriptionText && (
          <button
            type="button"
            onClick={() => setShowPaste(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ClipboardPaste size={12} />
            Or paste the job description
          </button>
        )}
      </div>

      {/* Paste fallback */}
      {showPaste && !jobDescriptionText && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={6}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            data-testid="outreach-paste-field"
          />
        </div>
      )}

      {/* Show fetched JD */}
      {jobDescriptionText && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              Job description loaded ({jobDescriptionText.length.toLocaleString()} chars)
            </span>
            <button
              type="button"
              onClick={() => {
                setJobDescriptionText("");
                setShowPaste(true);
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">
            {jobDescriptionText}
          </p>
        </div>
      )}

      {/* People */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="For the sign-off"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Recipient&apos;s Name <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder={
              audienceType === "referral"
                ? "e.g. Sarah, James"
                : audienceType === "recruiter"
                  ? "e.g. the recruiter's name"
                  : "e.g. the hiring manager's name"
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Job info */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Anthropic, Netflix"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Product Manager - Growth"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Purpose / context */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Context / Angle <span className="text-slate-400">(optional but powerful)</span>
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder={
            audienceType === "referral"
              ? "How do you know them? Mutual connections, shared communities, something they posted that resonated?"
              : audienceType === "recruiter"
                ? "Anything specific about the role that caught your eye? Recent company news you noticed?"
                : "Something specific about their product/team you admire? A recent launch, blog post, or talk they gave?"
          }
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Start button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className="rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="outreach-generate-btn"
        >
          Generate Message
        </button>
      </div>
    </div>
  );
}
