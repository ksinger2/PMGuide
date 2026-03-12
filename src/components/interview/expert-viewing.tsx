"use client";

import type { Question, SessionConfig, ModelAnswer } from "@/types/interview";
import type { InterviewQuestionType } from "@/lib/prompts/interview";
import { ProgressBar } from "./progress-bar";
import { ModelAnswerTab } from "./model-answer-tab";

interface ExpertViewingProps {
  question: Question | null;
  questionIndex: number;
  totalQuestions: number | null;
  config: SessionConfig;
  currentType: InterviewQuestionType | null;
  modelAnswer: ModelAnswer | null;
  isLoading: boolean;
  isSessionComplete: boolean;
  onNextQuestion: () => void;
  onEndSession: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  "product-design": "Product Design",
  "product-strategy": "Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

export function ExpertViewing({
  question,
  questionIndex,
  totalQuestions,
  config,
  currentType,
  modelAnswer,
  isLoading,
  isSessionComplete,
  onNextQuestion,
  onEndSession,
}: ExpertViewingProps) {
  const companyLabel =
    config.company === "any"
      ? "General"
      : config.company.charAt(0).toUpperCase() + config.company.slice(1);

  return (
    <div className="space-y-6" data-testid="expert-viewing">
      {/* Progress */}
      <ProgressBar current={questionIndex} total={totalQuestions} />

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {companyLabel}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          {TYPE_LABELS[currentType ?? ""] ?? currentType}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-lg border-l-4 border-amber-500 bg-white p-6 shadow-sm">
        {!question ? (
          <div className="space-y-3" data-testid="question-loading">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <p className="text-base leading-relaxed text-slate-800">
            {question.text}
          </p>
        )}
      </div>

      {/* Loading state */}
      {isLoading && question && (
        <div className="rounded-lg bg-amber-50 p-6 text-center" data-testid="expert-loading">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="text-sm font-medium text-amber-700">
            The expert PM is crafting their answer...
          </p>
        </div>
      )}

      {/* Model answer */}
      {modelAnswer && <ModelAnswerTab modelAnswer={modelAnswer} />}

      {/* Bottom actions */}
      {modelAnswer && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onEndSession}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            End Session
          </button>
          {!isSessionComplete && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-500"
            >
              Show Me Another →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
