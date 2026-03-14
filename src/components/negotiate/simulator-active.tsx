"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  SimulatorConfig,
  NegotiationTurn,
  CoachNote,
  BudgetCeiling,
} from "@/types/negotiation";
import { NegotiationTurnBubble } from "./negotiation-turn";
import { CoachNotesPanel } from "./coach-notes-panel";
import { MAX_SIMULATOR_TURNS } from "@/lib/utils/constants";

interface SimulatorActiveProps {
  config: SimulatorConfig;
  turns: NegotiationTurn[];
  currentMessage: string;
  coachNotes: CoachNote[];
  scenarioContext: string;
  budgetCeiling: BudgetCeiling | null;
  isLoading: boolean;
  onMessageChange: (msg: string) => void;
  onAddTurn: (turn: NegotiationTurn) => void;
  onAddCoachNote: (note: CoachNote) => void;
  onEndNegotiation: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function SimulatorActive({
  config,
  turns,
  currentMessage,
  coachNotes,
  scenarioContext,
  budgetCeiling,
  isLoading,
  onMessageChange,
  onAddTurn,
  onAddCoachNote,
  onEndNegotiation,
  setLoading,
  setError,
}: SimulatorActiveProps) {
  const [streamingText, setStreamingText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [turns, streamingText]);

  const handleSend = useCallback(async () => {
    const message = currentMessage.trim();
    if (!message || isLoading) return;

    // Add user turn
    const userTurn: NegotiationTurn = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    onAddTurn(userTurn);
    isNearBottomRef.current = true;
    setLoading(true);
    setStreamingText("");

    // Fire recruiter response and coach evaluation in parallel
    const allTurns = [...turns, userTurn];

    const recruiterPromise = fetch("/api/negotiate/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config,
        scenarioContext,
        budgetCeiling,
        recruiterBriefing: "",
        turns: allTurns,
        userMessage: message,
      }),
    });

    const coachPromise = fetch("/api/negotiate/evaluate-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config,
        turns: allTurns,
        latestUserMessage: message,
      }),
    });

    // Handle streamed recruiter response
    try {
      const [recruiterRes, coachRes] = await Promise.all([recruiterPromise, coachPromise]);

      // Process coach response (non-blocking)
      if (coachRes.ok) {
        const coachJson = await coachRes.json();
        if (coachJson.data) {
          onAddCoachNote({
            turnIndex: allTurns.length - 1,
            tactic: coachJson.data.tactic,
            effectiveness: coachJson.data.effectiveness,
            tip: coachJson.data.tip,
          });
        }
      }

      // Process streamed recruiter response
      if (!recruiterRes.ok) {
        const err = await recruiterRes.json().catch(() => ({ error: { message: "Recruiter response failed" } }));
        setError(err.error?.message ?? "Recruiter response failed");
        setLoading(false);
        return;
      }

      const reader = recruiterRes.body?.getReader();
      if (!reader) {
        setError("No response stream");
        setLoading(false);
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
              setStreamingText(fullText);
            }
          } catch {
            // skip malformed events
          }
        }
      }

      // Add recruiter turn
      if (fullText) {
        const recruiterTurn: NegotiationTurn = {
          role: "recruiter",
          content: fullText,
          timestamp: new Date().toISOString(),
        };
        onAddTurn(recruiterTurn);
      }
      setStreamingText("");
    } catch {
      setError("Network error during negotiation");
      setLoading(false);
    }
  }, [currentMessage, isLoading, config, turns, scenarioContext, budgetCeiling, onAddTurn, onAddCoachNote, setLoading, setError]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canEndNegotiation = turns.length >= 2;
  const turnLimitReached = turns.filter((t) => t.role === "user").length >= MAX_SIMULATOR_TURNS;

  return (
    <div className="flex gap-4" data-testid="simulator-active">
      {/* Chat area — 70% */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Scenario context banner */}
        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="text-sm font-semibold text-indigo-800 mb-1">Scenario</h3>
          <p className="text-sm text-indigo-700 whitespace-pre-line">{scenarioContext}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-indigo-600">
            <span>Company: {config.company === "any" ? "Tech Co." : config.company.charAt(0).toUpperCase() + config.company.slice(1)}</span>
            <span>Difficulty: {config.difficulty}</span>
            <span>Role: {config.targetRole}</span>
          </div>
        </div>

        {/* Chat messages */}
        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[50vh] rounded-lg border border-slate-200 bg-slate-50 p-4">
          {turns.map((turn, i) => (
            <NegotiationTurnBubble key={i} turn={turn} />
          ))}
          {streamingText && (
            <NegotiationTurnBubble
              turn={{ role: "recruiter", content: streamingText, timestamp: "" }}
              isStreaming
            />
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={turnLimitReached ? "Turn limit reached — end the negotiation" : "Type your response..."}
            disabled={isLoading || turnLimitReached}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !currentMessage.trim() || turnLimitReached}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
              ) : (
                "Send"
              )}
            </button>
            {canEndNegotiation && (
              <button
                type="button"
                onClick={onEndNegotiation}
                disabled={isLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                End
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Coach panel — 30% */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <CoachNotesPanel notes={coachNotes} turns={turns} />
      </div>
    </div>
  );
}
