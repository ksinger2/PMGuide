"use client";

import type { CoachNote, NegotiationTurn } from "@/types/negotiation";

interface CoachNotesPanelProps {
  notes: CoachNote[];
  turns: NegotiationTurn[];
}

function getEffectivenessColor(effectiveness: string): string {
  switch (effectiveness) {
    case "strong":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "weak":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
}

export function CoachNotesPanel({ notes, turns }: CoachNotesPanelProps) {
  if (notes.length === 0 && turns.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Coach Notes</h3>
        <p className="text-xs text-slate-400">
          Send your first message to start receiving coaching feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 max-h-[60vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-700 sticky top-0 bg-white pb-2">
        Coach Notes
      </h3>
      {notes.length === 0 ? (
        <p className="text-xs text-slate-400">Analyzing your approach...</p>
      ) : (
        notes.map((note, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Turn {note.turnIndex + 1}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getEffectivenessColor(
                  note.effectiveness
                )}`}
              >
                {note.effectiveness}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {note.tactic}
            </div>
            <p className="text-xs text-slate-500">{note.tip}</p>
          </div>
        ))
      )}
    </div>
  );
}
