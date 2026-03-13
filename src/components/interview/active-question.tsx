"use client";

import { useState } from "react";
import type { Question, SessionConfig } from "@/types/interview";
import type { InterviewQuestionType } from "@/lib/prompts/interview";
import { ProgressBar } from "./progress-bar";
import { VoiceInput } from "@/components/chat/voice-input";

interface ActiveQuestionProps {
  question: Question | null;
  questionIndex: number;
  totalQuestions: number | null;
  config: SessionConfig;
  currentType: InterviewQuestionType | null;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onDifferentQuestion: () => void;
  isLoading: boolean;
  isAnalyzing: boolean;
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

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function speakingTime(words: number): string {
  const minutes = words / 150;
  if (minutes < 1) return `~${Math.round(minutes * 60)}s`;
  return `~${minutes.toFixed(1)} min`;
}

export function ActiveQuestion({
  question,
  questionIndex,
  totalQuestions,
  config,
  currentType,
  answer,
  onAnswerChange,
  onSubmit,
  onDifferentQuestion,
  isLoading,
  isAnalyzing,
}: ActiveQuestionProps) {
  const [showDifferent, setShowDifferent] = useState(false);
  const [interimText, setInterimText] = useState("");
  const words = wordCount(answer);
  const canSubmit = answer.trim().length > 10 && !isLoading && !isAnalyzing;

  const companyLabel =
    config.company === "any"
      ? "General"
      : config.company.charAt(0).toUpperCase() + config.company.slice(1);

  return (
    <div className="space-y-6" data-testid="active-question">
      {/* Progress */}
      <ProgressBar current={questionIndex} total={totalQuestions} />

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {companyLabel}
        </span>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          {TYPE_LABELS[currentType ?? ""] ?? currentType}
        </span>
      </div>

      {/* Question box */}
      <div className="rounded-lg border-l-4 border-indigo-500 bg-white p-6 shadow-sm">
        {isLoading && !question ? (
          <div className="space-y-3" data-testid="question-loading">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <>
            <p className="text-base leading-relaxed text-slate-800">
              {question?.text}
            </p>
            {config.questionMode !== "pick" && (
              <button
                type="button"
                onClick={() => {
                  setShowDifferent(true);
                  onDifferentQuestion();
                }}
                disabled={isLoading || isAnalyzing}
                className="mt-3 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                ↻ Different question
              </button>
            )}
          </>
        )}
      </div>

      {/* Answer textarea */}
      {question && !isAnalyzing && (
        <div>
          <textarea
            value={answer + (interimText ? (answer && !answer.endsWith(" ") ? " " : "") + interimText : "")}
            onChange={(e) => {
              setInterimText("");
              onAnswerChange(e.target.value);
            }}
            placeholder="Type your answer here..."
            rows={8}
            disabled={isAnalyzing}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            data-testid="answer-textarea"
          />
          <div className="mt-2 flex items-center gap-3">
            <VoiceInput
              onTranscript={(text) => {
                const separator = answer && !answer.endsWith(" ") ? " " : "";
                onAnswerChange(answer + separator + text);
                setInterimText("");
              }}
              onInterim={setInterimText}
            />
            <span className="text-xs text-slate-400">
              Speak your answer — just like a real interview
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>
              {words} words · {speakingTime(words)} speaking time
            </span>
            <span className="text-slate-300">
              Target: 200-400 words (2-3 min)
            </span>
          </div>
        </div>
      )}

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div className="rounded-lg bg-indigo-50 p-6 text-center" data-testid="analyzing-state">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-indigo-700">
            Analyzing your answer...
          </p>
          <p className="mt-1 text-xs text-indigo-500">
            Generating feedback and model answer in parallel
          </p>
        </div>
      )}

      {/* Submit button */}
      {question && !isAnalyzing && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`rounded-lg px-8 py-3 text-sm font-semibold transition-all ${
              canSubmit
                ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
            data-testid="submit-answer"
          >
            Submit for Feedback
          </button>
        </div>
      )}
    </div>
  );
}
