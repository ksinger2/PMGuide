import type { ResumeContent } from "@/lib/resume/docx-builder";

export interface Suggestion {
  id: string;
  sectionType: string;
  original: string;
  suggested: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
}

export interface BranchChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

export interface KeywordAlignment {
  matched: string[];
  missing: string[];
  added: string[];
}

export interface ResumeBranch {
  id: string;
  jobUrl: string;
  jobTitle: string;
  company: string;
  jobDescriptionText: string;
  content: ResumeContent;
  suggestions: Suggestion[];
  chatHistory: BranchChatMessage[];
  keywordAlignment: KeywordAlignment;
  createdAt: string;
  updatedAt: string;
}

export interface BranchesState {
  branches: ResumeBranch[];
  activeBranchId: string | null;
}
