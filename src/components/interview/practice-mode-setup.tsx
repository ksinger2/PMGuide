"use client";

import { useState } from "react";
import type { SessionConfig, QuestionMode, BankQuestion } from "@/types/interview";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import { QuestionPicker } from "./question-picker";

interface PracticeModeSetupProps {
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
  description: string;
}[] = [
  { id: "product-design", label: "Product Design", icon: "🎨", description: "Design or improve a product" },
  { id: "product-strategy", label: "Strategy", icon: "♟️", description: "Market, growth, and GTM" },
  { id: "product-execution", label: "Execution", icon: "⚡", description: "Prioritize and ship" },
  { id: "product-analytical", label: "Analytical", icon: "📊", description: "Metrics and data" },
  { id: "product-estimation", label: "Estimation", icon: "🔢", description: "Market sizing and math" },
  { id: "product-technical", label: "Technical", icon: "⚙️", description: "System design and trade-offs" },
  { id: "behavioral", label: "Behavioral", icon: "💬", description: "STAR stories" },
];

export function PracticeModeSetup({ onStart, onBack }: PracticeModeSetupProps) {
  const [company, setCompany] = useState<InterviewCompany | "any">("any");
  const [questionType, setQuestionType] = useState<InterviewQuestionType | null>(null);
  const [questionMode, setQuestionMode] = useState<QuestionMode>("generated");
  const [pickedQuestions, setPickedQuestions] = useState<BankQuestion[]>([]);

  const isValid =
    questionType !== null &&
    (questionMode !== "pick" || pickedQuestions.length > 0);

  const handleStart = () => {
    if (!isValid || !questionType) return;
    onStart({
      company,
      types: [questionType],
      count: questionMode === "pick" ? pickedQuestions.length : 1,
      questionMode,
      pickedQuestions,
    });
  };

  return (
    <div className="space-y-8" data-testid="practice-mode-setup">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to Home
      </button>

      <h2 className="text-xl font-semibold text-slate-800">
        Practice Mode Setup
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
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Question type selector */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Question Type
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.id}
              type="button"
              onClick={() => {
                setQuestionType(qt.id);
                setPickedQuestions([]);
              }}
              className={`rounded-lg border-2 px-3 py-2 text-left transition-all ${
                questionType === qt.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{qt.icon}</span>
                <span
                  className={`text-sm font-medium ${
                    questionType === qt.id ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {qt.label}
                </span>
              </div>
              <p className="mt-0.5 pl-7 text-xs text-slate-500">{qt.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Question source */}
      {questionType && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Question Source
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { id: "generated" as const, label: "AI-Generated", desc: "A fresh question" },
                { id: "bank" as const, label: "From Real Bank", desc: "Random from real interviews" },
                { id: "pick" as const, label: "Pick from Bank", desc: "Choose a specific question" },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setQuestionMode(mode.id);
                  if (mode.id !== "pick") setPickedQuestions([]);
                }}
                className={`rounded-lg border-2 px-4 py-3 text-left transition-all ${
                  questionMode === mode.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    questionMode === mode.id ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {mode.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{mode.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Question picker */}
      {questionMode === "pick" && questionType && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Pick a Question
          </h3>
          <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 p-3">
            <QuestionPicker
              types={[questionType]}
              selected={pickedQuestions}
              onSelect={setPickedQuestions}
              multiSelect={false}
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
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          Generate Question →
        </button>
      </div>
    </div>
  );
}
