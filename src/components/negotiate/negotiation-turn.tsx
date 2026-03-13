"use client";

import type { NegotiationTurn } from "@/types/negotiation";

interface NegotiationTurnBubbleProps {
  turn: NegotiationTurn;
  isStreaming?: boolean;
}

export function NegotiationTurnBubble({ turn, isStreaming }: NegotiationTurnBubbleProps) {
  const isUser = turn.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`turn-${turn.role}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white border border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
            {isUser ? "You" : "Recruiter"}
          </span>
          {isStreaming && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          )}
        </div>
        <p className="whitespace-pre-wrap">{turn.content}</p>
      </div>
    </div>
  );
}
