"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/layout/section-header";
import { UploadZone } from "@/components/resume/upload-zone";
import { CritiquePanel } from "@/components/resume/critique-panel";
import { GeneratePanel } from "@/components/resume/generate-panel";
import { BranchManager } from "@/components/resume/branch-manager";
import { useProfile } from "@/stores/profile-context";
import {
  PROFILE_GATE_THRESHOLD,
  RESUME_UPLOAD_KEY,
  RESUME_CRITIQUE_KEY,
  RESUME_GENERATE_KEY,
} from "@/lib/utils/constants";

interface UploadData {
  resumeId: string;
  extractedText: string;
  pageCount: number;
  sections: Array<{
    type: string;
    title: string;
    content: string;
    startLine: number;
    endLine: number;
  }>;
  metadata: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
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
  status?: "accepted" | "rejected";
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

export default function ResumePage() {
  const { state } = useProfile();
  const isLocked = state.completeness < PROFILE_GATE_THRESHOLD;
  const percentComplete = Math.round(state.completeness * 100);

  // Resume flow state — start null, hydrate from localStorage via useEffect
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [critiqueFindings, setCritiqueFindings] = useState<Finding[] | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const savedUpload = localStorage.getItem(RESUME_UPLOAD_KEY);
      if (savedUpload) setUploadData(JSON.parse(savedUpload));
    } catch { /* corrupted data */ }
    try {
      const savedCritique = localStorage.getItem(RESUME_CRITIQUE_KEY);
      if (savedCritique) setCritiqueFindings(JSON.parse(savedCritique));
    } catch { /* corrupted data */ }
    try {
      const savedGenerate = localStorage.getItem(RESUME_GENERATE_KEY);
      if (savedGenerate) setGenerateResult(JSON.parse(savedGenerate));
    } catch { /* corrupted data */ }
    setHydrated(true);
  }, []);

  // Persist resume flow state to localStorage (skip before hydration to avoid clearing)
  useEffect(() => {
    if (!hydrated) return;
    if (uploadData) {
      localStorage.setItem(RESUME_UPLOAD_KEY, JSON.stringify(uploadData));
    } else {
      localStorage.removeItem(RESUME_UPLOAD_KEY);
    }
  }, [uploadData, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (critiqueFindings) {
      localStorage.setItem(RESUME_CRITIQUE_KEY, JSON.stringify(critiqueFindings));
    } else {
      localStorage.removeItem(RESUME_CRITIQUE_KEY);
    }
  }, [critiqueFindings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (generateResult) {
      localStorage.setItem(RESUME_GENERATE_KEY, JSON.stringify(generateResult));
    } else {
      localStorage.removeItem(RESUME_GENERATE_KEY);
    }
  }, [generateResult, hydrated]);

  const handleCritiqueComplete = useCallback((findings: Finding[]) => {
    setCritiqueFindings(findings);
  }, []);

  const handleGenerateComplete = useCallback((result: GenerateResult) => {
    setGenerateResult(result);
  }, []);

  const handleUploadNew = useCallback(() => {
    setUploadData(null);
    setCritiqueFindings(null);
    setGenerateResult(null);
  }, []);

  // Wait for profile hydration before rendering anything
  if (!state.isLoaded) {
    return null;
  }

  if (isLocked) {
    return (
      <div data-testid="resume-page">
        <SectionHeader
          title="Resume"
          description="Upload your resume for AI-powered critique and tailored generation."
        />
        <div
          className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center"
          data-testid="resume-locked"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Lock size={24} className="text-slate-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Profile incomplete
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Complete at least 70% of your profile in About Me to unlock Resume
            tools. You&apos;re currently at {percentComplete}%.
          </p>
          <Link
            href="/about-me"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            data-testid="resume-locked-link"
          >
            Continue in About Me
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="resume-page">
      <SectionHeader
        title="Resume"
        description="Upload your resume for AI-powered critique and tailored generation."
      />

      <div className="space-y-6">
        {/* Step 1: Upload */}
        <UploadZone onUploadComplete={setUploadData} disabled={false} />

        {/* Post-upload flow */}
        {uploadData && (
          <>
            {/* Upload summary */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {uploadData.metadata.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {uploadData.pageCount} page{uploadData.pageCount !== 1 ? "s" : ""} &middot;{" "}
                    {uploadData.sections.length} sections detected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUploadNew}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  data-testid="upload-new"
                >
                  <ArrowLeft size={14} />
                  Upload different file
                </button>
              </div>
            </div>

            {/* Step 2: Critique */}
            <CritiquePanel
              resumeId={uploadData.resumeId}
              extractedText={uploadData.extractedText}
              sections={uploadData.sections}
              onCritiqueComplete={handleCritiqueComplete}
            />

            {/* Step 4: Generate — appears after critique completes */}
            {critiqueFindings && (
              <GeneratePanel
                resumeId={uploadData.resumeId}
                extractedText={uploadData.extractedText}
                sections={uploadData.sections}
                critiqueFindings={critiqueFindings.filter(f => f.status === "accepted" && f.suggestedText)}
                onGenerateComplete={handleGenerateComplete}
              />
            )}

            {/* Step 5: Branch — available after critique */}
            {critiqueFindings && (
              <BranchManager
                baseContent={
                  generateResult?.content ?? {
                    sections: uploadData.sections.map((s) => ({
                      type: s.type,
                      title: s.title,
                      content: s.content,
                    })),
                    fullText: uploadData.extractedText,
                  }
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
