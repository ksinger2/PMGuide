"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProfile } from "@/stores/profile-context";
import { buildNegotiateCoachPrompt } from "@/lib/prompts/negotiate-coach";
import type { UserProfile } from "@/lib/utils/profile";
import { NEGOTIATE_COACH_STORAGE_KEY } from "@/lib/utils/constants";

interface CoachChatProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE = `I'm The Negotiator — your compensation coaching expert. I help Senior/Staff PMs maximize total comp at top tech companies.

I can help you with:
- **Counter-offer strategy** — tell me your offer and I'll build your counter
- **Email templates** — I'll draft the exact words to send
- **Offer comparison** — bring me multiple offers and I'll break them down
- **No-leverage negotiation** — I'll show you how to create BATNA even without competing offers
- **Equity analysis** — RSUs vs options vs profit interest, vesting schedules, refreshers

What are you working with?`;

export function CoachChat({ onBack }: CoachChatProps) {
  const { state: profileState } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NEGOTIATE_COACH_STORAGE_KEY);
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
      localStorage.setItem(NEGOTIATE_COACH_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage full
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          section: "negotiate-coach",
          conversationHistory: messages,
          profileSnapshot: profileState.profile,
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
  }, [input, isLoading, messages, profileState.profile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(NEGOTIATE_COACH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4" data-testid="coach-chat">
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
        <h2 className="text-xl font-semibold text-slate-800">Chat with Coach</h2>
        <p className="mt-1 text-sm text-slate-500">
          Get personalized negotiation advice, email templates, and counter-offer strategy.
        </p>
      </div>

      {/* Chat messages */}
      <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
        {/* Welcome message */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800">
            <div className="text-xs font-medium text-emerald-600 mb-1">The Negotiator</div>
            <div className="whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: WELCOME_MESSAGE.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-800"
            }`}>
              {msg.role === "assistant" && (
                <div className="text-xs font-medium text-emerald-600 mb-1">The Negotiator</div>
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

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your offer, counter strategy, email templates..."
          disabled={isLoading}
          rows={2}
          className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
}
