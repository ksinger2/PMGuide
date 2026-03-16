"use client";

import { Trash2 } from "lucide-react";
import type { AudienceType, OutreachDraft } from "@/types/outreach";

interface OutreachHomeProps {
  drafts: OutreachDraft[];
  onSelectAudience: (type: AudienceType) => void;
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
}

const AUDIENCE_CARDS: Array<{
  type: AudienceType;
  icon: string;
  title: string;
  description: string;
  color: string;
}> = [
  {
    type: "hiring-manager",
    icon: "👤",
    title: "Hiring Manager",
    description:
      "Lead with product insight. Show you understand their problems and can add value from day one.",
    color: "hover:border-indigo-300 hover:shadow-md",
  },
  {
    type: "recruiter",
    icon: "📋",
    title: "Recruiter",
    description:
      "Concise and scannable. Signal fit quickly with role match, key highlights, and availability.",
    color: "hover:border-emerald-300 hover:shadow-md",
  },
  {
    type: "referral",
    icon: "🤝",
    title: "Referral / Connection",
    description:
      "Warm and respectful. Explain the connection, make it easy to forward, and show appreciation.",
    color: "hover:border-amber-300 hover:shadow-md",
  },
];

const AUDIENCE_LABELS: Record<AudienceType, string> = {
  "hiring-manager": "Hiring Manager",
  recruiter: "Recruiter",
  referral: "Referral",
};

export function OutreachHome({
  drafts,
  onSelectAudience,
  onResumeDraft,
  onDeleteDraft,
}: OutreachHomeProps) {
  return (
    <div className="space-y-8" data-testid="outreach-home">
      {/* Audience selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIENCE_CARDS.map((card) => (
          <button
            key={card.type}
            type="button"
            onClick={() => onSelectAudience(card.type)}
            className={`group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all ${card.color}`}
            data-testid={`audience-${card.type}`}
          >
            <div className="mb-3 text-3xl">{card.icon}</div>
            <h3 className="text-lg font-semibold text-slate-800">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
          </button>
        ))}
      </div>

      {/* Saved drafts */}
      {drafts.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Saved Drafts
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {draft.context.company || "Unknown"}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="text-xs text-slate-500">
                      {AUDIENCE_LABELS[draft.context.audienceType]}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {draft.context.messageFormat}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                  {draft.context.jobTitle || draft.context.purpose || "Untitled draft"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {draft.messages.length} message{draft.messages.length !== 1 ? "s" : ""}
                  {" · "}
                  {new Date(draft.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onResumeDraft(draft.id)}
                    className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDraft(draft.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
