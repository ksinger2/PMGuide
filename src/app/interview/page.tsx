"use client";

import { useState, useCallback } from "react";
import { SectionHeader } from "@/components/layout/section-header";
import { InterviewSetup } from "@/components/interview/interview-setup";
import { ChatContainer } from "@/components/chat/chat-container";
import { INTERVIEW_STORAGE_KEY } from "@/lib/utils/constants";

interface InterviewConfig {
  company: string;
  questionType: string;
  feedbackMode: string;
}

const COMPANY_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  google: "Google",
  meta: "Meta",
  netflix: "Netflix",
  openai: "OpenAI",
  roblox: "Roblox",
  general: "General Practice",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  "product-design": "Product Design",
  "product-strategy": "Product Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

const FEEDBACK_MODE_LABELS: Record<string, string> = {
  "after-each": "coaching after each question",
  "end-of-session": "full simulation with debrief at the end",
};

function buildWelcomeMessage(config: InterviewConfig): string {
  const company = COMPANY_LABELS[config.company] ?? config.company;
  const questionType =
    QUESTION_TYPE_LABELS[config.questionType] ?? config.questionType;
  const feedbackDesc =
    FEEDBACK_MODE_LABELS[config.feedbackMode] ?? config.feedbackMode;

  if (config.company === "general") {
    return `Let's practice a ${questionType} interview. I'll ask you questions and provide ${feedbackDesc}. Ready? Let's begin.`;
  }

  return `Let's practice a ${questionType} interview for ${company}. I'll ask you questions and provide ${feedbackDesc}. Ready? Let's begin.`;
}

export default function InterviewPage() {
  const [mode, setMode] = useState<"setup" | "session">("setup");
  const [config, setConfig] = useState<InterviewConfig | null>(null);

  const handleStart = useCallback((newConfig: InterviewConfig) => {
    // Clear previous interview history when starting a new session
    try {
      localStorage.removeItem(INTERVIEW_STORAGE_KEY);
    } catch {
      // ignore
    }
    setConfig(newConfig);
    setMode("session");
  }, []);

  const handleEndSession = useCallback(() => {
    setMode("setup");
    setConfig(null);
  }, []);

  if (mode === "setup") {
    return (
      <div data-testid="interview-page">
        <SectionHeader
          title="Interview Prep"
          description="Configure your mock interview session, then practice with an AI interviewer."
        />
        <InterviewSetup onStart={handleStart} />
      </div>
    );
  }

  // Session mode
  const companyLabel = COMPANY_LABELS[config!.company] ?? config!.company;
  const questionTypeLabel =
    QUESTION_TYPE_LABELS[config!.questionType] ?? config!.questionType;

  return (
    <div data-testid="interview-page">
      <div className="mb-4 flex items-center justify-between">
        <SectionHeader
          title="Interview Prep"
          description={`${questionTypeLabel} interview${config!.company !== "general" ? ` — ${companyLabel}` : ""}`}
        />
        <button
          type="button"
          onClick={handleEndSession}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          End Session
        </button>
      </div>
      <ChatContainer
        section="interview"
        storageKey={INTERVIEW_STORAGE_KEY}
        welcomeMessage={buildWelcomeMessage(config!)}
        interviewConfig={{
          interviewCompany: config!.company,
          interviewQuestionType: config!.questionType,
          interviewFeedbackMode: config!.feedbackMode,
        }}
      />
    </div>
  );
}
