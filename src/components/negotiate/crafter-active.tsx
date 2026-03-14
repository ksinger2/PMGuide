"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProfile } from "@/stores/profile-context";
import type { CrafterContext } from "@/types/negotiation";
import { NEGOTIATE_CRAFTER_STORAGE_KEY } from "@/lib/utils/constants";

interface CrafterActiveProps {
  crafterContext: CrafterContext;
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function extractResponse(text: string): string | null {
  const start = text.indexOf("---RESPONSE---");
  const end = text.indexOf("---END---");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.substring(start + "---RESPONSE---".length, end).trim();
}

const LEVERAGE_LABELS: Array<{ key: keyof CrafterContext; label: string; detailKey?: keyof CrafterContext }> = [
  { key: "currentlyEmployed", label: "Employed", detailKey: "currentCompany" },
  { key: "hasCompetingOffers", label: "Competing Offers" },
  { key: "hasEquityToLeave", label: "Unvested Equity" },
  { key: "hasTimelinePressure", label: "Deadline" },
  { key: "hasUniqueSkills", label: "Rare Skills" },
  { key: "hasRelocation", label: "Relocation" },
];

export function CrafterActive({ crafterContext, onBack }: CrafterActiveProps) {
  const { state: profileState } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [candidateContext, setCandidateContext] = useState("");
  const [showCandidateContext, setShowCandidateContext] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NEGOTIATE_CRAFTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // start fresh
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(NEGOTIATE_CRAFTER_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage full
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    if (isNearBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    const response = extractResponse(text);
    const toCopy = response ?? text;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback: silent fail
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Format message with candidate context if provided
    const contextText = candidateContext.trim();
    const apiMessage = contextText
      ? `[RECRUITER MESSAGE]\n${text}\n\n[CANDIDATE CONTEXT]\n${contextText}`
      : text;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setCandidateContext("");
    setShowCandidateContext(false);
    isNearBottomRef.current = true;
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: apiMessage,
          section: "negotiate-crafter",
          conversationHistory: messages,
          profileSnapshot: profileState.profile,
          crafterContext,
        }),
      });

      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text") {
              fullText += parsed.text;
              setMessages([...newMessages, { role: "assistant", content: fullText }]);
            }
          } catch {
            // skip
          }
        }
      }

      if (!fullText) {
        setMessages([...newMessages, { role: "assistant", content: "I didn't get a response. Please try again." }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Network error. Please try again." }]);
    }
    setIsLoading(false);
  }, [input, isLoading, messages, profileState.profile, crafterContext, candidateContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(NEGOTIATE_CRAFTER_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Active leverage badges
  const activeLeverage = LEVERAGE_LABELS.filter(
    (l) => crafterContext[l.key] as boolean
  );

  return (
    <div className="space-y-4" data-testid="crafter-active">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; Back to home
        </button>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear chat
          </button>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">Response Crafter</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste what the recruiter said. Get the exact reply to send back.
        </p>
      </div>

      {/* Collapsible context panel */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setContextExpanded(!contextExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
        >
          <span className="font-medium">
            {crafterContext.targetCompany || "Target"} &middot; {crafterContext.communicationChannel} &middot; {crafterContext.tonePreference}
          </span>
          <span className="text-xs text-slate-400">{contextExpanded ? "Hide" : "Show"} details</span>
        </button>
        {contextExpanded && (
          <div className="border-t border-slate-100 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {crafterContext.targetRole && (
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700">
                  {crafterContext.targetRole}
                </span>
              )}
              {activeLeverage.map((l) => (
                <span
                  key={l.key}
                  className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                >
                  {l.label}
                  {l.detailKey && crafterContext[l.detailKey] ? `: ${crafterContext[l.detailKey]}` : ""}
                </span>
              ))}
              {crafterContext.hasOffer && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Offer on table
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4"
      >
        {/* Welcome message */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800">
            <div className="text-xs font-medium text-cyan-600 mb-1">Response Crafter</div>
            <p className="whitespace-pre-wrap">
              Ready to craft your responses for <strong>{crafterContext.targetCompany || "your target company"}</strong> via <strong>{crafterContext.communicationChannel}</strong>.
              {"\n\n"}Paste the recruiter&apos;s message below and I&apos;ll write your reply — ready to copy and send.
            </p>
          </div>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-cyan-600 text-white"
                : "bg-white border border-slate-200 text-slate-800"
            }`}>
              {msg.role === "assistant" && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-cyan-600">Response Crafter</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, i)}
                    className="ml-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {copiedIndex === i ? "Copied!" : "Copy response"}
                  </button>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-white border border-slate-200 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Candidate context toggle */}
      {showCandidateContext && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <label className="block text-xs font-medium text-amber-700 mb-1">
            Your context (optional)
          </label>
          <textarea
            value={candidateContext}
            onChange={(e) => setCandidateContext(e.target.value)}
            placeholder="Add corrections, preferences, or context for your response..."
            disabled={isLoading}
            rows={2}
            className="w-full resize-none rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
          />
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste what the recruiter said..."
            disabled={isLoading}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowCandidateContext(!showCandidateContext)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showCandidateContext ? "Hide context \u25B2" : "Add context \u25BC"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
}
