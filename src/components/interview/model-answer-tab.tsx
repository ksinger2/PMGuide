"use client";

import { Users, Layers, RefreshCw, AlertCircle, Tag, Lightbulb, Target, Shield, Zap, Package, Brain, Heart, Activity } from "lucide-react";
import type { ModelAnswer, SegmentationLens } from "@/types/interview";

const LENS_LABELS: Record<SegmentationLens, string> = {
  skill: "By Skill Level",
  motivation: "By Motivation",
  role: "By Role",
  usage: "By Usage Pattern",
  context: "By Context",
};

const RISK_TYPE_COLORS: Record<string, string> = {
  technical: "bg-blue-100 text-blue-700",
  adoption: "bg-purple-100 text-purple-700",
  competitive: "bg-orange-100 text-orange-700",
  organizational: "bg-slate-100 text-slate-700",
};

interface ModelAnswerTabProps {
  modelAnswer: ModelAnswer;
}

export function ModelAnswerTab({ modelAnswer }: ModelAnswerTabProps) {
  return (
    <div className="space-y-6" data-testid="model-answer-tab">
      {/* Opening Reflection - NEW */}
      {modelAnswer.openingReflection && (
        <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Opening Reflection
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold text-slate-800">The Space: </span>
              {modelAnswer.openingReflection.spaceContext}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-800">Why It Matters: </span>
              {modelAnswer.openingReflection.whyItMatters}
            </p>
            <p className="text-indigo-700 italic">
              <span className="font-semibold">My Angle: </span>
              {modelAnswer.openingReflection.initialAngle}
            </p>
          </div>
        </section>
      )}

      {/* Tagline */}
      <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-800">
          {modelAnswer.tagline}
        </p>
      </div>

      {/* Platform Context - FIRST */}
      {modelAnswer.platformContext && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-800">
              Platform Context
            </h3>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-blue-700">
                WHAT IT DOES TODAY:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.platformContext.whatItDoesToday}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                STRATEGIC PRIORITIES:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.platformContext.strategicPriorities}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                FEATURE FIT:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.platformContext.featureFit}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                DEPENDENCIES:{" "}
              </span>
              <span className="text-xs text-slate-700">
                {modelAnswer.platformContext.dependencies}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Segment Analysis - AFTER Platform Context */}
      {modelAnswer.segmentAnalysis && (
        <section className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-800">
                User Segmentation
              </h3>
            </div>
            {modelAnswer.segmentAnalysis.segmentationLens && (
              <span className="flex items-center gap-1 rounded-full bg-purple-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
                <Tag size={10} />
                {LENS_LABELS[modelAnswer.segmentAnalysis.segmentationLens]}
              </span>
            )}
          </div>

          {/* Why This Lens */}
          {modelAnswer.segmentAnalysis.whyThisLens && (
            <p className="mb-3 text-xs italic text-purple-600">
              {modelAnswer.segmentAnalysis.whyThisLens}
            </p>
          )}

          <div className="mb-4 space-y-3">
            {modelAnswer.segmentAnalysis.segments.map((seg, i) => (
              <div
                key={i}
                className="rounded border border-purple-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-purple-700">
                  {seg.name}
                </p>
                <p className="mt-1 text-xs text-slate-600">{seg.description}</p>

                {/* Key Need & Current Workaround */}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={12} className="mt-0.5 text-orange-400" />
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-orange-600">Key Need</span>
                      <p className="text-xs text-slate-600">{seg.keyNeed}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <RefreshCw size={12} className="mt-0.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500">Current Workaround</span>
                      <p className="text-xs text-slate-600">{seg.currentWorkaround}</p>
                    </div>
                  </div>
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

      {/* Problem Analysis - NEW */}
      {modelAnswer.problemAnalysis && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} className="text-rose-600" />
            <h3 className="text-sm font-semibold text-rose-800">
              Problem Analysis
            </h3>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {/* Psychological - FIRST per user formula */}
            <div className="rounded border border-pink-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Heart size={12} className="text-pink-500" />
                <span className="text-[10px] font-semibold uppercase text-pink-600">Psychological</span>
              </div>
              <ul className="space-y-1">
                {modelAnswer.problemAnalysis.psychologicalProblems.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600">• {p}</li>
                ))}
              </ul>
            </div>

            {/* Functional */}
            <div className="rounded border border-blue-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Activity size={12} className="text-blue-500" />
                <span className="text-[10px] font-semibold uppercase text-blue-600">Functional</span>
              </div>
              <ul className="space-y-1">
                {modelAnswer.problemAnalysis.functionalProblems.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600">• {p}</li>
                ))}
              </ul>
            </div>

            {/* Behavioral */}
            <div className="rounded border border-amber-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Brain size={12} className="text-amber-500" />
                <span className="text-[10px] font-semibold uppercase text-amber-600">Behavioral</span>
              </div>
              <ul className="space-y-1">
                {modelAnswer.problemAnalysis.behavioralProblems.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600">• {p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2 border-t border-rose-200 pt-3">
            <div className="rounded bg-rose-100 p-2">
              <span className="text-xs font-semibold text-rose-700">PRIORITIZED PROBLEM: </span>
              <span className="text-xs text-slate-700">{modelAnswer.problemAnalysis.prioritizedProblem}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-700">HOW I PRIORITIZED: </span>
              <span className="text-xs text-slate-600">{modelAnswer.problemAnalysis.howPrioritized}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-700">WHY THIS MATTERS: </span>
              <span className="text-xs text-slate-600">{modelAnswer.problemAnalysis.whyThisProblem}</span>
            </div>
          </div>
        </section>
      )}

      {/* Solution Brainstorm - NEW */}
      {modelAnswer.solutionBrainstorm && modelAnswer.solutionBrainstorm.length > 0 && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-emerald-800">
              Solution Brainstorm
            </h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {modelAnswer.solutionBrainstorm.map((sol, i) => (
              <div key={i} className="rounded border border-emerald-200 bg-white p-3">
                <p className="text-sm font-semibold text-emerald-700">{sol.name}</p>
                <p className="mt-1 text-xs text-slate-600">{sol.description}</p>
                <p className="mt-2 text-[10px] italic text-slate-500">{sol.prosAndCons}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Solution Prioritization - NEW */}
      {modelAnswer.solutionPrioritization && (
        <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} className="text-cyan-600" />
            <h3 className="text-sm font-semibold text-cyan-800">
              Solution Prioritization
            </h3>
          </div>

          <div className="mb-4 rounded bg-cyan-100 p-3">
            <p className="text-sm font-semibold text-cyan-800">
              Chosen: {modelAnswer.solutionPrioritization.chosenSolution}
            </p>
            <p className="mt-1 text-xs text-cyan-700">
              {modelAnswer.solutionPrioritization.whyThisWins}
            </p>
          </div>

          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-700">CRITERIA USED: </span>
            <span className="text-xs text-slate-600">{modelAnswer.solutionPrioritization.howPrioritized}</span>
          </div>

          {/* Risks */}
          {modelAnswer.solutionPrioritization.risks.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Shield size={12} className="text-red-500" />
                <span className="text-xs font-semibold text-slate-700">RISKS & MITIGATIONS</span>
              </div>
              <div className="space-y-2">
                {modelAnswer.solutionPrioritization.risks.map((r, i) => (
                  <div key={i} className="rounded border border-slate-200 bg-white p-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${RISK_TYPE_COLORS[r.type] || "bg-slate-100 text-slate-700"}`}>
                        {r.type}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{r.risk}</span>
                    </div>
                    <p className="mt-1 text-xs text-emerald-600">→ {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* MVP Design - NEW */}
      {modelAnswer.mvpDesign && (
        <section className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Package size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-violet-800">
              MVP Design
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase text-emerald-600">Core Features (IN)</span>
              <ul className="mt-1 space-y-0.5">
                {modelAnswer.mvpDesign.coreFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-rose-600">Exclusions (OUT)</span>
              <ul className="mt-1 space-y-0.5">
                {modelAnswer.mvpDesign.explicitExclusions.map((e, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className="text-rose-500">✗</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-violet-200 pt-3">
            <div>
              <span className="text-xs font-semibold text-violet-700">SUCCESS CRITERIA: </span>
              <span className="text-xs text-slate-600">{modelAnswer.mvpDesign.successCriteria}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-violet-700">LEARNING GOALS: </span>
              <span className="text-xs text-slate-600">{modelAnswer.mvpDesign.learningGoals}</span>
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
