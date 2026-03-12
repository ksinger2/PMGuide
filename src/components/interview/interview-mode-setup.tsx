"use client";

import { useState } from "react";
import type { SessionConfig, QuestionMode, BankQuestion } from "@/types/interview";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import { QuestionPicker } from "./question-picker";

interface InterviewModeSetupProps {
  onStart: (config: SessionConfig) => void;
  onBack: () => void;
}

const COMPANIES: { id: InterviewCompany | "any"; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google" },
  { id: "meta", label: "Meta" },
  { id: "netflix", label: "Netflix" },
  { id: "openai", label: "OpenAI" },
  { id: "roblox", label: "Roblox" },
];

const QUESTION_TYPES: {
  id: InterviewQuestionType;
  label: string;
  icon: string;
}[] = [
  { id: "product-design", label: "Product Design", icon: "🎨" },
  { id: "product-strategy", label: "Strategy", icon: "♟️" },
  { id: "product-execution", label: "Execution", icon: "⚡" },
  { id: "product-analytical", label: "Analytical", icon: "📊" },
  { id: "product-estimation", label: "Estimation", icon: "🔢" },
  { id: "product-technical", label: "Technical", icon: "⚙️" },
  { id: "behavioral", label: "Behavioral", icon: "💬" },
];

const COUNTS: { value: number | "infinite"; label: string }[] = [
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: "infinite", label: "∞" },
];

const QUESTION_MODES: { id: QuestionMode; label: string; description: string }[] = [
  {
    id: "generated",
    label: "AI-Generated",
    description: "Fresh questions tailored to your company",
  },
  {
    id: "bank",
    label: "From Real Bank",
    description: "Questions from real PM interviews",
  },
  {
    id: "pick",
    label: "I'll Pick",
    description: "Browse and select specific questions",
  },
];

export function InterviewModeSetup({ onStart, onBack }: InterviewModeSetupProps) {
  const [company, setCompany] = useState<InterviewCompany | "any">("any");
  const [selectedTypes, setSelectedTypes] = useState<InterviewQuestionType[]>([]);
  const [count, setCount] = useState<number | "infinite">(5);
  const [questionMode, setQuestionMode] = useState<QuestionMode>("generated");
  const [pickedQuestions, setPickedQuestions] = useState<BankQuestion[]>([]);

  const toggleType = (type: InterviewQuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isValid =
    selectedTypes.length > 0 &&
    (questionMode !== "pick" || pickedQuestions.length > 0);

  const handleStart = () => {
    if (!isValid) return;
    onStart({
      company,
      types: selectedTypes,
      count: questionMode === "pick" ? pickedQuestions.length : count,
      questionMode,
      pickedQuestions,
    });
  };

  return (
    <div className="space-y-8" data-testid="interview-mode-setup">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to Home
      </button>

      <h2 className="text-xl font-semibold text-slate-800">
        Interview Mode Setup
      </h2>

      {/* Company selector */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Company</h3>
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCompany(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                company === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Question source */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Question Source
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUESTION_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setQuestionMode(mode.id);
                if (mode.id !== "pick") setPickedQuestions([]);
              }}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-all ${
                questionMode === mode.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  questionMode === mode.id ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                {mode.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{mode.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Category multi-select */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Categories
          {selectedTypes.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({selectedTypes.length} selected)
            </span>
          )}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.id}
              type="button"
              onClick={() => toggleType(qt.id)}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left transition-all ${
                selectedTypes.includes(qt.id)
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span>{qt.icon}</span>
              <span
                className={`text-sm font-medium ${
                  selectedTypes.includes(qt.id) ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                {qt.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Question count (hidden in pick mode) */}
      {questionMode !== "pick" && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Number of Questions
          </h3>
          <div className="flex gap-2">
            {COUNTS.map((c) => (
              <button
                key={String(c.value)}
                type="button"
                onClick={() => setCount(c.value)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  count === c.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Question picker (only for "pick" mode) */}
      {questionMode === "pick" && selectedTypes.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Pick Questions
            {pickedQuestions.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({pickedQuestions.length} selected)
              </span>
            )}
          </h3>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 p-3">
            <QuestionPicker
              types={selectedTypes}
              selected={pickedQuestions}
              onSelect={setPickedQuestions}
              multiSelect
            />
          </div>
        </section>
      )}

      {/* Start button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={handleStart}
          className={`rounded-lg px-8 py-3 text-sm font-semibold transition-all ${
            isValid
              ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          Start Interview →
        </button>
      </div>
    </div>
  );
}
