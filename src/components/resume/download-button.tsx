"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { downloadResume, type ResumeContent } from "@/lib/resume/docx-builder";

interface DownloadButtonProps {
  content: ResumeContent;
  filename: string;
  label?: string;
  variant?: "primary" | "secondary";
}

export function DownloadButton({
  content,
  filename,
  label = "Download DOCX",
  variant = "primary",
}: DownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  const handleDownload = useCallback(async () => {
    setStatus("generating");
    try {
      await downloadResume(content, filename);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }, [content, filename]);

  const baseClasses =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses =
    variant === "primary"
      ? "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === "generating"}
      className={`${baseClasses} ${variantClasses} ${status === "generating" ? "cursor-wait opacity-70" : ""}`}
      data-testid="download-docx"
    >
      {status === "idle" && (
        <>
          <Download size={16} />
          {label}
        </>
      )}
      {status === "generating" && (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating...
        </>
      )}
      {status === "done" && (
        <>
          <CheckCircle2 size={16} className="text-green-300" />
          Downloaded
        </>
      )}
    </button>
  );
}
