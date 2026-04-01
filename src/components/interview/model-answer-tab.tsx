"use client";

import {
  Globe,
  Target,
  Network,
  Users,
  Layers,
  UserCheck,
  AlertTriangle,
  Zap,
  CheckCircle,
  Shield,
  Package,
  FileText,
  Heart,
  Activity,
  Brain,
  RefreshCw,
  AlertCircle,
  Tag,
  Lightbulb,
} from "lucide-react";
import type {
  ModelAnswer,
  GenericModelAnswer,
  ProductDesignModelAnswer,
  SegmentationLens,
  PsychologicalPain,
  BehavioralPain,
  FunctionalPain,
  Risk,
  StakeholderEvaluation,
  SegmentEvaluation,
  PainPointEvaluation,
  SolutionEvaluation,
} from "@/types/interview";
import { isProductDesignModelAnswer } from "@/types/interview";

// ---------------------------------------------------------------------------
// Shared Constants
// ---------------------------------------------------------------------------

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

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

// Score badge colors
function getScoreColor(score: number): string {
  if (score >= 5) return "bg-emerald-500 text-white";
  if (score >= 4) return "bg-emerald-400 text-white";
  if (score >= 3) return "bg-amber-400 text-white";
  if (score >= 2) return "bg-orange-400 text-white";
  return "bg-red-400 text-white";
}

function getTotalScoreColor(score: number): string {
  if (score >= 13) return "bg-emerald-600 text-white";
  if (score >= 10) return "bg-emerald-500 text-white";
  if (score >= 7) return "bg-amber-500 text-white";
  return "bg-orange-500 text-white";
}

// Score badge component
function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
      <span className="mt-0.5 text-[9px] uppercase text-slate-500">{label}</span>
    </div>
  );
}

function TotalScoreBadge({ score, isWinner }: { score: number; isWinner: boolean }) {
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isWinner ? "bg-indigo-600 text-white ring-2 ring-indigo-300" : getTotalScoreColor(score)}`}>
      {score}
    </span>
  );
}

const INTENSITY_COLORS: Record<string, string> = {
  low: "text-green-600",
  medium: "text-amber-600",
  high: "text-red-600",
};

const FREQUENCY_LABELS: Record<string, string> = {
  rare: "Rare",
  occasional: "Occasional",
  frequent: "Frequent",
  constant: "Constant",
};

// ---------------------------------------------------------------------------
// Product Design Model Answer (13-Step)
// ---------------------------------------------------------------------------

function ProductDesignModelAnswerTab({ modelAnswer }: { modelAnswer: ProductDesignModelAnswer }) {
  return (
    <div className="space-y-6" data-testid="model-answer-tab">
      {/* Step 1: Landscape */}
      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white">
            1
          </span>
          <Globe size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">Landscape</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-slate-700">Industry Context: </span>
            <span className="text-slate-600">{modelAnswer.landscape.industryContext}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Why This Company Should Care: </span>
            <span className="text-slate-600">{modelAnswer.landscape.companyBenefit}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Transformative Potential: </span>
            <span className="text-slate-600">{modelAnswer.landscape.transformativePotential}</span>
          </div>
        </div>
      </section>

      {/* Step 2: Mission */}
      <section className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            2
          </span>
          <Target size={16} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-indigo-800">Mission</h3>
        </div>
        <p className="text-sm font-semibold text-indigo-800">{modelAnswer.mission}</p>
      </section>

      {/* Step 3: Ecosystem */}
      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            3
          </span>
          <Network size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-800">Ecosystem</h3>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {modelAnswer.ecosystem.stakeholders.map((sh, i) => (
            <div key={i} className="rounded border border-blue-200 bg-white p-3">
              <p className="text-sm font-semibold text-blue-700">{sh.name}</p>
              <p className="mt-1 text-xs text-slate-600">{sh.role}</p>
              <div className="mt-2 space-y-1">
                <div className="text-xs">
                  <span className="font-semibold text-green-600">Wants: </span>
                  <span className="text-slate-600">{sh.incentives}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-rose-600">Pain: </span>
                  <span className="text-slate-600">{sh.currentPain}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded bg-blue-100 p-2">
          <span className="text-xs font-semibold text-blue-700">ECOSYSTEM DYNAMICS: </span>
          <span className="text-xs text-slate-700">{modelAnswer.ecosystem.ecosystemDynamics}</span>
        </div>
      </section>

      {/* Step 4: Stakeholder Prioritization Matrix */}
      <section className="rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
            4
          </span>
          <Users size={16} className="text-blue-700" />
          <h3 className="text-sm font-semibold text-blue-800">Stakeholder Prioritization Matrix</h3>
        </div>

        {/* Scoring Matrix Table */}
        {modelAnswer.stakeholderPrioritization.evaluations && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="pb-2 text-left font-semibold text-slate-700">Stakeholder</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">TAM</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Underserved</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Mission</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {modelAnswer.stakeholderPrioritization.evaluations.map((ev: StakeholderEvaluation, i: number) => {
                  const isWinner = ev.name === modelAnswer.stakeholderPrioritization.chosen;
                  return (
                    <tr key={i} className={`border-b border-blue-100 ${isWinner ? "bg-indigo-100" : ""}`}>
                      <td className={`py-2 ${isWinner ? "font-semibold text-indigo-700" : "text-slate-700"}`}>
                        {ev.name} {isWinner && "★"}
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.tamScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.underservedScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.missionScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <TotalScoreBadge score={ev.totalScore} isWinner={isWinner} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Winner Details */}
        {modelAnswer.stakeholderPrioritization.evaluations && (
          <div className="mb-3 space-y-2 rounded bg-white p-3">
            <p className="text-xs font-semibold text-indigo-700">
              Winner: {modelAnswer.stakeholderPrioritization.chosen}
            </p>
            {modelAnswer.stakeholderPrioritization.evaluations
              .filter((ev: StakeholderEvaluation) => ev.name === modelAnswer.stakeholderPrioritization.chosen)
              .map((ev: StakeholderEvaluation, i: number) => (
                <div key={i} className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold">TAM ({ev.tamScore}/5):</span> {ev.tamRationale}</p>
                  <p><span className="font-semibold">Underserved ({ev.underservedScore}/5):</span> {ev.underservedRationale}</p>
                  <p><span className="font-semibold">Mission ({ev.missionScore}/5):</span> {ev.missionRationale}</p>
                </div>
              ))}
          </div>
        )}

        <div className="mb-3 rounded bg-blue-100 p-2">
          <span className="text-xs font-semibold text-blue-700">WHY THIS WINS: </span>
          <span className="text-xs text-slate-700">{modelAnswer.stakeholderPrioritization.whyChosen}</span>
        </div>

        <div className="rounded border-l-2 border-amber-400 bg-amber-50 p-2">
          <span className="text-xs font-semibold text-amber-700">TRADE-OFF: </span>
          <span className="text-xs text-slate-600">{modelAnswer.stakeholderPrioritization.tradeoff}</span>
        </div>
      </section>

      {/* Step 5: Segmentation */}
      <section className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            5
          </span>
          <Layers size={16} className="text-purple-600" />
          <h3 className="text-sm font-semibold text-purple-800">User Segmentation</h3>
        </div>

        <div className="mb-4 space-y-3">
          {modelAnswer.segmentation.map((seg, i) => (
            <div key={i} className="rounded border border-purple-200 bg-white p-3">
              <p className="text-sm font-semibold text-purple-700">{seg.name}</p>
              <p className="mt-1 text-xs text-slate-600">{seg.description}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="text-xs">
                  <span className="font-semibold text-purple-600">Key Trait: </span>
                  <span className="text-slate-600">{seg.keyCharacteristic}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-500">Current Behavior: </span>
                  <span className="text-slate-600">{seg.currentBehavior}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 6: Segment Prioritization Matrix */}
      <section className="rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
            6
          </span>
          <UserCheck size={16} className="text-purple-700" />
          <h3 className="text-sm font-semibold text-purple-800">Segment Prioritization Matrix</h3>
        </div>

        {/* Scoring Matrix Table */}
        {modelAnswer.segmentPrioritization.evaluations && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-purple-200">
                  <th className="pb-2 text-left font-semibold text-slate-700">Segment</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">TAM</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Underserved</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Mission</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {modelAnswer.segmentPrioritization.evaluations.map((ev: SegmentEvaluation, i: number) => {
                  const isWinner = ev.name === modelAnswer.segmentPrioritization.chosen;
                  return (
                    <tr key={i} className={`border-b border-purple-100 ${isWinner ? "bg-indigo-100" : ""}`}>
                      <td className={`py-2 ${isWinner ? "font-semibold text-indigo-700" : "text-slate-700"}`}>
                        {ev.name} {isWinner && "★"}
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.tamScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.underservedScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.missionScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <TotalScoreBadge score={ev.totalScore} isWinner={isWinner} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Winner Details */}
        {modelAnswer.segmentPrioritization.evaluations && (
          <div className="mb-3 space-y-2 rounded bg-white p-3">
            <p className="text-xs font-semibold text-indigo-700">
              Winner: {modelAnswer.segmentPrioritization.chosen}
            </p>
            {modelAnswer.segmentPrioritization.evaluations
              .filter((ev: SegmentEvaluation) => ev.name === modelAnswer.segmentPrioritization.chosen)
              .map((ev: SegmentEvaluation, i: number) => (
                <div key={i} className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold">TAM ({ev.tamScore}/5):</span> {ev.tamRationale}</p>
                  <p><span className="font-semibold">Underserved ({ev.underservedScore}/5):</span> {ev.underservedRationale}</p>
                  <p><span className="font-semibold">Mission ({ev.missionScore}/5):</span> {ev.missionRationale}</p>
                </div>
              ))}
          </div>
        )}

        <div className="mb-3 rounded bg-purple-100 p-2">
          <span className="text-xs font-semibold text-purple-700">WHY THIS WINS: </span>
          <span className="text-xs text-slate-700">{modelAnswer.segmentPrioritization.whyChosen}</span>
        </div>

        <div className="rounded border-l-2 border-amber-400 bg-amber-50 p-2">
          <span className="text-xs font-semibold text-amber-700">TRADE-OFF: </span>
          <span className="text-xs text-slate-600">{modelAnswer.segmentPrioritization.tradeoff}</span>
        </div>
      </section>

      {/* Step 7: Pain Points */}
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
            7
          </span>
          <AlertTriangle size={16} className="text-rose-600" />
          <h3 className="text-sm font-semibold text-rose-800">Pain Points</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Psychological */}
          <div className="rounded border border-pink-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Heart size={12} className="text-pink-500" />
              <span className="text-[10px] font-semibold uppercase text-pink-600">Psychological</span>
            </div>
            <ul className="space-y-2">
              {modelAnswer.painPoints.psychological.map((p: PsychologicalPain, i: number) => (
                <li key={i} className="rounded bg-pink-50 p-2 text-xs">
                  <p className="text-slate-700">{p.pain}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] text-pink-700">
                      {p.emotion}
                    </span>
                    <span className={`text-[10px] font-semibold ${INTENSITY_COLORS[p.intensity]}`}>
                      {p.intensity.toUpperCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Behavioral */}
          <div className="rounded border border-amber-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Brain size={12} className="text-amber-500" />
              <span className="text-[10px] font-semibold uppercase text-amber-600">Behavioral</span>
            </div>
            <ul className="space-y-2">
              {modelAnswer.painPoints.behavioral.map((p: BehavioralPain, i: number) => (
                <li key={i} className="rounded bg-amber-50 p-2 text-xs">
                  <p className="text-slate-700">{p.pain}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Workaround: {p.currentWorkaround}
                  </p>
                  <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                    {FREQUENCY_LABELS[p.frequency]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Functional */}
          <div className="rounded border border-blue-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Activity size={12} className="text-blue-500" />
              <span className="text-[10px] font-semibold uppercase text-blue-600">Functional</span>
            </div>
            <ul className="space-y-2">
              {modelAnswer.painPoints.functional.map((p: FunctionalPain, i: number) => (
                <li key={i} className="rounded bg-blue-50 p-2 text-xs">
                  <p className="text-slate-700">{p.pain}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Impact: {p.impact}</p>
                  <p className="mt-0.5 text-[10px] italic text-blue-600">JTBD: {p.jtbd}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Step 8: Pain Point Prioritization Matrix */}
      <section className="rounded-lg border border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-700 text-xs font-bold text-white">
            8
          </span>
          <AlertTriangle size={16} className="text-rose-700" />
          <h3 className="text-sm font-semibold text-rose-800">Pain Point Prioritization Matrix</h3>
        </div>

        {/* Scoring Matrix Table */}
        {modelAnswer.painPointPrioritization.evaluations && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-rose-200">
                  <th className="pb-2 text-left font-semibold text-slate-700">Pain Point</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Type</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Severity</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Frequency</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Mission</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {modelAnswer.painPointPrioritization.evaluations.map((ev: PainPointEvaluation, i: number) => {
                  const isWinner = ev.pain === modelAnswer.painPointPrioritization.chosen;
                  const typeColors: Record<string, string> = {
                    psychological: "bg-pink-100 text-pink-700",
                    behavioral: "bg-amber-100 text-amber-700",
                    functional: "bg-blue-100 text-blue-700",
                  };
                  return (
                    <tr key={i} className={`border-b border-rose-100 ${isWinner ? "bg-indigo-100" : ""}`}>
                      <td className={`py-2 max-w-[200px] truncate ${isWinner ? "font-semibold text-indigo-700" : "text-slate-700"}`} title={ev.pain}>
                        {ev.pain.substring(0, 50)}... {isWinner && "★"}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${typeColors[ev.type]}`}>
                          {ev.type.substring(0, 4)}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.severityScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.frequencyScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.missionScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <TotalScoreBadge score={ev.totalScore} isWinner={isWinner} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Winner Details */}
        {modelAnswer.painPointPrioritization.evaluations && (
          <div className="mb-3 space-y-2 rounded bg-white p-3">
            <p className="text-xs font-semibold text-indigo-700">
              Winner: {modelAnswer.painPointPrioritization.chosen}
            </p>
            {modelAnswer.painPointPrioritization.evaluations
              .filter((ev: PainPointEvaluation) => ev.pain === modelAnswer.painPointPrioritization.chosen)
              .map((ev: PainPointEvaluation, i: number) => (
                <div key={i} className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold">Severity ({ev.severityScore}/5):</span> {ev.severityRationale}</p>
                  <p><span className="font-semibold">Frequency ({ev.frequencyScore}/5):</span> {ev.frequencyRationale}</p>
                  <p><span className="font-semibold">Mission ({ev.missionScore}/5):</span> {ev.missionRationale}</p>
                </div>
              ))}
          </div>
        )}

        <div className="rounded bg-rose-100 p-2">
          <span className="text-xs font-semibold text-rose-700">WHY THIS WINS: </span>
          <span className="text-xs text-slate-700">{modelAnswer.painPointPrioritization.whyChosen}</span>
        </div>
      </section>

      {/* Step 9: Solutions */}
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            9
          </span>
          <Zap size={16} className="text-emerald-600" />
          <h3 className="text-sm font-semibold text-emerald-800">Solution Ideas</h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {modelAnswer.solutions.map((sol, i) => (
            <div key={i} className="rounded border border-emerald-200 bg-white p-3">
              <p className="text-sm font-semibold text-emerald-700">{sol.name}</p>
              <p className="mt-1 text-xs text-slate-600">{sol.description}</p>
              <p className="mt-2 text-[10px] text-emerald-600">
                <span className="font-semibold">Novelty:</span> {sol.novelty}
              </p>
              <p className="mt-1 text-[10px] italic text-slate-500">{sol.prosAndCons}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step 10: Solution Prioritization Matrix */}
      <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
            10
          </span>
          <CheckCircle size={16} className="text-cyan-600" />
          <h3 className="text-sm font-semibold text-cyan-800">Solution Prioritization Matrix</h3>
        </div>

        {/* Scoring Matrix Table */}
        {modelAnswer.solutionPrioritization.evaluations && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyan-200">
                  <th className="pb-2 text-left font-semibold text-slate-700">Solution</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Impact</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Effort</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Diff.</th>
                  <th className="pb-2 text-center font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {modelAnswer.solutionPrioritization.evaluations.map((ev: SolutionEvaluation, i: number) => {
                  const isWinner = ev.name === modelAnswer.solutionPrioritization.chosen;
                  return (
                    <tr key={i} className={`border-b border-cyan-100 ${isWinner ? "bg-indigo-100" : ""}`}>
                      <td className={`py-2 ${isWinner ? "font-semibold text-indigo-700" : "text-slate-700"}`}>
                        {ev.name} {isWinner && "★"}
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.impactScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.effortScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <ScoreBadge score={ev.differentiationScore} label="" />
                      </td>
                      <td className="py-2 text-center">
                        <TotalScoreBadge score={ev.totalScore} isWinner={isWinner} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Winner Details */}
        {modelAnswer.solutionPrioritization.evaluations && (
          <div className="mb-3 space-y-2 rounded bg-white p-3">
            <p className="text-xs font-semibold text-indigo-700">
              Winner: {modelAnswer.solutionPrioritization.chosen}
            </p>
            {modelAnswer.solutionPrioritization.evaluations
              .filter((ev: SolutionEvaluation) => ev.name === modelAnswer.solutionPrioritization.chosen)
              .map((ev: SolutionEvaluation, i: number) => (
                <div key={i} className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold">Impact ({ev.impactScore}/5):</span> {ev.impactRationale}</p>
                  <p><span className="font-semibold">Effort ({ev.effortScore}/5):</span> {ev.effortRationale}</p>
                  <p><span className="font-semibold">Differentiation ({ev.differentiationScore}/5):</span> {ev.differentiationRationale}</p>
                </div>
              ))}
          </div>
        )}

        <div className="rounded bg-cyan-100 p-2">
          <span className="text-xs font-semibold text-cyan-700">WHY THIS WINS: </span>
          <span className="text-xs text-slate-700">{modelAnswer.solutionPrioritization.whyChosen}</span>
        </div>
      </section>

      {/* Step 11: Risks */}
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
            11
          </span>
          <Shield size={16} className="text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-800">Risks & Mitigations</h3>
        </div>

        <div className="space-y-2">
          {modelAnswer.risks.map((r: Risk, i: number) => (
            <div key={i} className="rounded border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${RISK_TYPE_COLORS[r.type] || "bg-slate-100 text-slate-700"}`}>
                  {r.type}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_COLORS[r.severity]}`}>
                  {r.severity}
                </span>
                <span className="text-xs font-medium text-slate-700">{r.risk}</span>
              </div>
              <p className="mt-2 text-xs text-emerald-600">→ {r.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step 12: MVP + Metrics */}
      <section className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
            12
          </span>
          <Package size={16} className="text-violet-600" />
          <h3 className="text-sm font-semibold text-violet-800">MVP + Metrics</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-600">Core Features (IN)</span>
            <ul className="mt-1 space-y-0.5">
              {modelAnswer.mvpAndMetrics.coreFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                  <span className="text-emerald-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-rose-600">Exclusions (OUT)</span>
            <ul className="mt-1 space-y-0.5">
              {modelAnswer.mvpAndMetrics.explicitExclusions.map((e, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                  <span className="text-rose-500">✗</span> {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-violet-200 pt-3">
          <div className="rounded bg-violet-100 p-2">
            <span className="text-xs font-semibold text-violet-700">NORTH STAR METRIC: </span>
            <span className="text-xs text-slate-700">{modelAnswer.mvpAndMetrics.successMetrics.northStar}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-violet-700">Leading Indicators: </span>
            <span className="text-xs text-slate-600">
              {modelAnswer.mvpAndMetrics.successMetrics.leading.join(", ")}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-violet-700">Guardrails: </span>
            <span className="text-xs text-slate-600">
              {modelAnswer.mvpAndMetrics.successMetrics.guardrails.join(", ")}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-violet-700">Learning Goals: </span>
            <span className="text-xs text-slate-600">{modelAnswer.mvpAndMetrics.learningGoals}</span>
          </div>
        </div>
      </section>

      {/* Step 13: Summary */}
      <section className="rounded-lg border border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            13
          </span>
          <FileText size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">Summary</h3>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-700">{modelAnswer.summary.recap}</p>

          <div className="rounded border-l-4 border-indigo-500 bg-indigo-50 p-2">
            <span className="text-xs font-semibold text-indigo-700">KEY INSIGHT: </span>
            <span className="text-xs text-slate-700">{modelAnswer.summary.keyInsight}</span>
          </div>

          <div className="rounded border-l-4 border-amber-500 bg-amber-50 p-2">
            <span className="text-xs font-semibold text-amber-700">WATCH OUT: </span>
            <span className="text-xs text-slate-700">{modelAnswer.summary.watchOut}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic Model Answer (for non-product-design types)
// ---------------------------------------------------------------------------

function GenericModelAnswerTab({ modelAnswer }: { modelAnswer: GenericModelAnswer }) {
  return (
    <div className="space-y-6" data-testid="model-answer-tab">
      {/* Opening Reflection */}
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

      {/* Platform Context */}
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

      {/* Segment Analysis */}
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

      {/* Problem Analysis */}
      {modelAnswer.problemAnalysis && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} className="text-rose-600" />
            <h3 className="text-sm font-semibold text-rose-800">
              Problem Analysis
            </h3>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
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

      {/* Solution Brainstorm */}
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

      {/* Solution Prioritization */}
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

      {/* MVP Design */}
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

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

interface ModelAnswerTabProps {
  modelAnswer: ModelAnswer;
}

export function ModelAnswerTab({ modelAnswer }: ModelAnswerTabProps) {
  if (isProductDesignModelAnswer(modelAnswer)) {
    return <ProductDesignModelAnswerTab modelAnswer={modelAnswer} />;
  }
  return <GenericModelAnswerTab modelAnswer={modelAnswer} />;
}
