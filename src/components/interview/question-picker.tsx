"use client";

import { useState, useEffect } from "react";
import type { BankQuestion } from "@/types/interview";
import type { InterviewQuestionType } from "@/lib/prompts/interview";

interface QuestionPickerProps {
  types: InterviewQuestionType[];
  selected: BankQuestion[];
  onSelect: (questions: BankQuestion[]) => void;
  multiSelect?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  "product-design": "Product Design",
  "product-strategy": "Product Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

export function QuestionPicker({
  types,
  selected,
  onSelect,
  multiSelect = true,
}: QuestionPickerProps) {
  const [bankByType, setBankByType] = useState<
    Record<string, BankQuestion[]>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      types.map(async (type) => {
        const res = await fetch(`/api/interview/questions?type=${type}`);
        const json = await res.json();
        return { type, questions: json.data as BankQuestion[] };
      })
    )
      .then((results) => {
        const byType: Record<string, BankQuestion[]> = {};
        for (const r of results) {
          byType[r.type] = r.questions;
        }
        setBankByType(byType);
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false));
  }, [types]);

  const selectedIds = new Set(selected.map((q) => q.id));

  function toggleQuestion(question: BankQuestion) {
    if (multiSelect) {
      if (selectedIds.has(question.id)) {
        onSelect(selected.filter((q) => q.id !== question.id));
      } else {
        onSelect([...selected, question]);
      }
    } else {
      onSelect([question]);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Loading question bank...
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="question-picker">
      {types.map((type) => {
        const questions = bankByType[type] ?? [];
        if (questions.length === 0) return null;

        // Group by sub-category
        const grouped: Record<string, BankQuestion[]> = {};
        for (const q of questions) {
          const cat = q.subCategory || "General";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(q);
        }

        return (
          <div key={type}>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">
              {TYPE_LABELS[type] ?? type}
            </h4>
            {Object.entries(grouped).map(([category, qs]) => (
              <div key={category} className="mb-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {category}
                </p>
                <div className="space-y-1">
                  {qs.map((q) => (
                    <label
                      key={q.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedIds.has(q.id)
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type={multiSelect ? "checkbox" : "radio"}
                        name="question-pick"
                        checked={selectedIds.has(q.id)}
                        onChange={() => toggleQuestion(q)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-slate-700">{q.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
