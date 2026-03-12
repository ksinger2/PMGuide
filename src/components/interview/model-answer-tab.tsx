"use client";

import type { ModelAnswer } from "@/types/interview";

interface ModelAnswerTabProps {
  modelAnswer: ModelAnswer;
}

export function ModelAnswerTab({ modelAnswer }: ModelAnswerTabProps) {
  return (
    <div className="space-y-6" data-testid="model-answer-tab">
      {/* Tagline */}
      <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-800">
          {modelAnswer.tagline}
        </p>
      </div>

      {/* Steps */}
      <section>
        <h3 className="mb-4 text-sm font-semibold text-slate-800">
          Step-by-Step Model Answer
        </h3>
        <div className="space-y-4">
          {modelAnswer.steps.map((step) => (
            <div
              key={step.number}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {step.number}
                </span>
                <h4 className="text-sm font-semibold text-slate-800">
                  {step.title}
                </h4>
              </div>

              <div className="space-y-2 pl-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                    WHY
                  </span>
                  <p className="mt-0.5 text-sm text-slate-600">{step.why}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    WHAT
                  </span>
                  <p className="mt-0.5 text-sm text-slate-700">{step.what}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    EXAMPLE
                  </span>
                  <p className="mt-0.5 text-sm italic text-slate-600">
                    {step.example}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key insights */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          Key Insights
        </h3>
        <ul className="space-y-1">
          {modelAnswer.keyInsights.map((insight, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <span className="mt-0.5 text-indigo-500">*</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch out */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-amber-700">
          Watch Out For
        </h3>
        <ul className="space-y-1">
          {modelAnswer.watchOut.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <span className="mt-0.5 text-amber-500">!</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
