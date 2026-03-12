"use client";

import type { Feedback } from "@/types/interview";

interface FeedbackTabProps {
  feedback: Feedback;
}

function getRubricScoreColor(score: string): string {
  switch (score) {
    case "Very Strong":
      return "text-emerald-700 bg-emerald-50";
    case "Strong":
      return "text-emerald-600 bg-emerald-50";
    case "Neutral":
      return "text-amber-700 bg-amber-50";
    case "Weak":
      return "text-red-600 bg-red-50";
    case "Very Weak":
      return "text-red-700 bg-red-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
}

export function FeedbackTab({ feedback }: FeedbackTabProps) {
  return (
    <div className="space-y-6" data-testid="feedback-tab">
      {/* Rubric grid */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Rubric Scores
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">Signal</th>
                <th className="px-4 py-2 font-medium text-slate-600">Score</th>
                <th className="px-4 py-2 font-medium text-slate-600">Note</th>
              </tr>
            </thead>
            <tbody>
              {feedback.rubric.map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-700">
                    {row.signal}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getRubricScoreColor(row.score)}`}
                    >
                      {row.score}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What worked */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-emerald-700">
          What Worked
        </h3>
        <ul className="space-y-1">
          {feedback.whatWorked.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 text-emerald-500">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* To improve */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-amber-700">
          To Improve
        </h3>
        <ul className="space-y-1">
          {feedback.toImprove.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 text-amber-500">-</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Hiring signal */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Hiring Signal
        </h3>
        <p className="text-sm text-slate-700">{feedback.hiringSignal}</p>
      </section>

      {/* One change */}
      <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-indigo-800">
          One Thing to Change
        </h3>
        <p className="text-sm text-indigo-700">{feedback.oneChange}</p>
      </section>
    </div>
  );
}
