"use client";

import { useState } from "react";

interface InterviewSetupProps {
  onStart: (config: {
    company: string;
    questionType: string;
    feedbackMode: string;
  }) => void;
}

const COMPANIES = [
  { id: "anthropic", label: "Anthropic", emoji: "🤖" },
  { id: "google", label: "Google", emoji: "🔍" },
  { id: "meta", label: "Meta", emoji: "👥" },
  { id: "netflix", label: "Netflix", emoji: "🎬" },
  { id: "openai", label: "OpenAI", emoji: "🧠" },
  { id: "roblox", label: "Roblox", emoji: "🎮" },
  { id: "general", label: "General Practice", emoji: "🎯" },
] as const;

const QUESTION_TYPES = [
  {
    id: "product-design",
    label: "Product Design",
    description: "Design a new product or feature from scratch",
  },
  {
    id: "product-strategy",
    label: "Product Strategy",
    description: "Evaluate market positioning and long-term direction",
  },
  {
    id: "product-execution",
    label: "Execution",
    description: "Prioritize, plan, and ship under constraints",
  },
  {
    id: "product-analytical",
    label: "Analytical",
    description: "Diagnose metrics, interpret data, find root causes",
  },
  {
    id: "product-estimation",
    label: "Estimation",
    description: "Size markets, estimate usage, and do back-of-envelope math",
  },
  {
    id: "product-technical",
    label: "Technical",
    description: "Navigate system design and technical trade-offs",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Share past experiences using STAR format",
  },
] as const;

const FEEDBACK_MODES = [
  {
    id: "after-each",
    label: "Coach after each question",
    description:
      "Get detailed rubric-based feedback after every answer — great for learning.",
  },
  {
    id: "end-of-session",
    label: "Full simulation, debrief at end",
    description:
      "Stay in character for the whole interview — feels like the real thing.",
  },
] as const;

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [company, setCompany] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [feedbackMode, setFeedbackMode] = useState<string>("after-each");

  const isReady = company && questionType && feedbackMode;

  return (
    <div className="space-y-10">
      {/* Company selector */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800">
          Choose a company
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Questions and evaluation style will match the company&apos;s real
          interview process.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCompany(c.id)}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-all ${
                company === c.id
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              <p
                className={`mt-1 text-sm font-medium ${
                  company === c.id ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                {c.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Question type selector */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800">
          Question type
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick the type of PM interview question you want to practice.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.id}
              type="button"
              onClick={() => setQuestionType(qt.id)}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-all ${
                questionType === qt.id
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  questionType === qt.id
                    ? "text-indigo-700"
                    : "text-slate-700"
                }`}
              >
                {qt.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">{qt.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Feedback mode selector */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800">
          Feedback mode
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          How do you want to receive feedback during the session?
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEEDBACK_MODES.map((fm) => (
            <button
              key={fm.id}
              type="button"
              onClick={() => setFeedbackMode(fm.id)}
              className={`rounded-lg border-2 px-4 py-4 text-left transition-all ${
                feedbackMode === fm.id
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    feedbackMode === fm.id
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300"
                  }`}
                >
                  {feedbackMode === fm.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      feedbackMode === fm.id
                        ? "text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {fm.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {fm.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Start button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={!isReady}
          onClick={() =>
            onStart({ company, questionType, feedbackMode })
          }
          className={`rounded-lg px-8 py-3 text-sm font-semibold transition-all ${
            isReady
              ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          Start Mock Interview
        </button>
      </div>
    </div>
  );
}
