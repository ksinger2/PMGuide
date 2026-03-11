"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { MAX_FILE_SIZE } from "@/lib/utils/constants";

interface UploadResult {
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

interface UploadZoneProps {
  onUploadComplete: (result: UploadResult) => void;
  disabled?: boolean;
}

export function UploadZone({ onUploadComplete, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are supported. Please upload your resume as a PDF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
      return `File exceeds the ${maxMB}MB limit. Please upload a smaller file.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/resume/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error?.message ?? "Upload failed. Please try again.");
          return;
        }

        setUploadedFile(file.name);
        onUploadComplete(json.data);
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onUploadComplete]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isUploading) setIsDragging(true);
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [disabled, isUploading, uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleClear = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, []);

  // Uploaded state
  if (uploadedFile && !error) {
    return (
      <div
        className="rounded-lg border border-success-500/30 bg-success-50 p-4"
        data-testid="upload-success"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/10">
              <FileText size={20} className="text-success-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {uploadedFile}
              </p>
              <p className="text-xs text-success-700">
                Uploaded successfully
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Remove file"
            data-testid="upload-clear"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging ? "border-primary-400 bg-primary-50" : "border-slate-300 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/50"}
          ${disabled || isUploading ? "cursor-not-allowed opacity-50" : ""}
        `}
        data-testid="upload-zone"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !isUploading) fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="upload-input"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <p className="text-sm font-medium text-slate-600">
              Parsing your resume...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Upload size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Drop your resume here or{" "}
                <span className="text-primary-600">browse files</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PDF only, up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          className="mt-3 flex items-start gap-2 rounded-md bg-error-50 p-3"
          data-testid="upload-error"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-error-500" />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}
    </div>
  );
}
