"use client";

import { Users, Network, ArrowRightLeft } from "lucide-react";
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

      {/* Segment Analysis - NEW */}
      {modelAnswer.segmentAnalysis && (
        <section className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-800">
              User Segmentation Analysis
            </h3>
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            {modelAnswer.segmentAnalysis.segments.map((seg, i) => (
              <div
                key={i}
                className="rounded border border-purple-200 bg-white p-3"
              >
                <p className="text-xs font-semibold text-purple-700">
                  {seg.name}
                </p>
                <p className="mt-1 text-xs text-slate-600">{seg.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">
                    {seg.size}
                  </span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">
                    Pain: {seg.painSeverity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-purple-200 pt-3">
            <div>
              <span className="text-xs font-semibold text-purple-700">
                PRIORITIZED:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.segmentAnalysis.prioritized}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-700">
                TRADE-OFF:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.segmentAnalysis.tradeoff}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700">
                MITIGATION:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.segmentAnalysis.mitigation}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Ecosystem Context - NEW */}
      {modelAnswer.ecosystemContext && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Network size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-800">
              Ecosystem Context
            </h3>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-blue-700">
                PLATFORM FIT:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.ecosystemContext.platformFit}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                DEPENDENCIES:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.ecosystemContext.dependencies}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                NETWORK EFFECTS:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.ecosystemContext.networkEffects}
              </span>
            </div>
          </div>
        </section>
      )}

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
