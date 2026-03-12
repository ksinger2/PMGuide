"use client";

import { useState } from "react";
import type { Feedback, ModelAnswer } from "@/types/interview";
import { ScoreBanner } from "./score-banner";
import { FeedbackTab } from "./feedback-tab";
import { ModelAnswerTab } from "./model-answer-tab";

interface ResultsScreenProps {
  question: string;
  questionType: string;
  company: string;
  answer: string;
  feedback: Feedback;
  modelAnswer: ModelAnswer;
  isSessionComplete: boolean;
  onNextQuestion: () => void;
  onEndSession: () => void;
}

type TabId = "feedback" | "model-answer" | "my-answer";

const TABS: { id: TabId; label: string }[] = [
  { id: "feedback", label: "Feedback" },
  { id: "model-answer", label: "Model Answer" },
  { id: "my-answer", label: "My Answer" },
];

const TYPE_LABELS: Record<string, string> = {
  "product-design": "Product Design",
  "product-strategy": "Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

export function ResultsScreen({
  question,
  questionType,
  company,
  answer,
  feedback,
  modelAnswer,
  isSessionComplete,
  onNextQuestion,
  onEndSession,
}: ResultsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("feedback");

  return (
    <div className="space-y-6" data-testid="results-screen">
      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {company}
        </span>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          {TYPE_LABELS[questionType] ?? questionType}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-lg border-l-4 border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">{question}</p>
      </div>

      {/* Score banner */}
      <ScoreBanner
        score={feedback.score}
        scoreLabel={feedback.scoreLabel}
        overall={feedback.overall}
      />

      {/* Tab bar */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === "feedback" && <FeedbackTab feedback={feedback} />}
        {activeTab === "model-answer" && (
          <ModelAnswerTab modelAnswer={modelAnswer} />
        )}
        {activeTab === "my-answer" && (
          <div data-testid="my-answer-tab">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {answer}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={onEndSession}
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          End Session
        </button>
        {!isSessionComplete && (
          <button
            type="button"
            onClick={onNextQuestion}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            data-testid="next-question"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
