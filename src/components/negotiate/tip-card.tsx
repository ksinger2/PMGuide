"use client";

import { useState } from "react";
import type { Framework } from "@/lib/negotiate/frameworks";

interface TipCardProps {
  framework: Framework;
}

export function TipCard({ framework }: TipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white overflow-hidden transition-all"
      data-testid={`tip-${framework.id}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors"
      >
        <span className="text-xl flex-shrink-0">{framework.icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">{framework.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{framework.summary}</p>
        </div>
        <span className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          &#9660;
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="prose prose-sm max-w-none text-slate-700">
            {framework.content.split("\n\n").map((paragraph, i) => {
              // Handle bold text
              const formatted = paragraph.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>'
              );

              if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                return (
                  <div key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: formatted }} />
                );
              }

              if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
                return (
                  <div key={i} className="mb-2 ml-4 text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
                );
              }

              return (
                <p key={i} className="mb-2 text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
              );
            })}
          </div>

          {framework.examples && framework.examples.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-600 mb-2">Quick Examples</h4>
              <div className="space-y-1">
                {framework.examples.map((example, i) => (
                  <div key={i} className="rounded bg-slate-50 px-3 py-1.5 text-xs text-slate-600 italic">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
