"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { ResumeBranch } from "@/types/resume-branch";

interface BranchTabsProps {
  branches: ResumeBranch[];
  activeBranchId: string | null;
  onSelect: (branchId: string) => void;
  onClose: (branchId: string) => void;
  onRename?: (branchId: string, newTitle: string) => void;
}

function BranchTab({
  branch,
  isActive,
  onSelect,
  onClose,
  onRename,
}: {
  branch: ResumeBranch;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRename?: (newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(branch.jobTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== branch.jobTitle) {
      onRename?.(trimmed);
    }
    setIsEditing(false);
  };

  const displayTitle =
    branch.jobTitle.length > 25
      ? branch.jobTitle.slice(0, 25) + "..."
      : branch.jobTitle;

  return (
    <div
      className={`group flex shrink-0 items-center gap-2 rounded-t-lg border px-3 py-2 text-sm transition-colors cursor-pointer ${
        isActive
          ? "border-b-primary-600 border-b-2 bg-white text-slate-800 font-medium"
          : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
      onClick={() => !isEditing && onSelect()}
      data-testid={`branch-tab-${branch.id}`}
    >
      <div className="flex flex-col min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setEditValue(branch.jobTitle);
                  setIsEditing(false);
                }
              }}
              onBlur={commitRename}
              className="w-32 rounded border border-primary-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
              data-testid={`branch-rename-input-${branch.id}`}
            />
            <button
              type="button"
              onClick={commitRename}
              className="rounded p-0.5 text-green-600 hover:bg-green-50"
              aria-label="Confirm rename"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <span
            className="truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditValue(branch.jobTitle);
              setIsEditing(true);
            }}
            title="Double-click to rename"
          >
            {displayTitle}
          </span>
        )}
        <span className="text-xs text-slate-400 truncate">
          {branch.company}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-500"
        aria-label={`Close ${branch.jobTitle} branch`}
        data-testid={`branch-close-${branch.id}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function BranchTabs({
  branches,
  activeBranchId,
  onSelect,
  onClose,
  onRename,
}: BranchTabsProps) {
  if (branches.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin"
      data-testid="branch-tabs"
    >
      {branches.map((branch) => (
        <BranchTab
          key={branch.id}
          branch={branch}
          isActive={branch.id === activeBranchId}
          onSelect={() => onSelect(branch.id)}
          onClose={() => onClose(branch.id)}
          onRename={onRename ? (title) => onRename(branch.id, title) : undefined}
        />
      ))}
    </div>
  );
}
