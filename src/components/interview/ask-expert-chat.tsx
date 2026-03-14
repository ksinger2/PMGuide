"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProfile } from "@/stores/profile-context";
import { INTERVIEW_ASK_EXPERT_STORAGE_KEY } from "@/lib/utils/constants";

interface AskExpertChatProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE = `I'm your Interview Expert — paste any PM interview question and I'll walk you through a structured answer using the right framework.

I auto-detect the question type and use the matching approach:
- **Product Design** — user-centered framework (users, pain points, solutions, prioritize, metrics)
- **Strategy** — market analysis, competitive positioning, growth levers
- **Execution** — prioritization frameworks, roadmapping, trade-offs
- **Analytical** — metric decomposition, root cause analysis, data-driven decisions
- **Estimation** — top-down/bottom-up sizing, assumptions, sanity checks
- **Technical** — system design, API decisions, technical trade-offs
- **Behavioral** — STAR format, leadership principles, growth stories

**Try pasting one of these:**
- "Design a product for elderly people to stay connected with family"
- "How would you prioritize features for Instagram Reels?"
- "Estimate the number of piano tuners in Chicago"
- "Tell me about a time you had to make a decision with incomplete data"`;

export function AskExpertChat({ onBack }: AskExpertChatProps) {
  const { state: profileState } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTERVIEW_ASK_EXPERT_STORAGE_KEY);
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
      localStorage.setItem(INTERVIEW_ASK_EXPERT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage full
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    if (isNearBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    isNearBottomRef.current = true;
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          section: "interview-ask-expert",
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
      localStorage.removeItem(INTERVIEW_ASK_EXPERT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4" data-testid="ask-expert-chat">
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
        <h2 className="text-xl font-semibold text-slate-800">Ask the Expert</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste any PM interview question — get a structured expert answer with the right framework.
        </p>
      </div>

      {/* Chat messages */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
        {/* Welcome message */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800">
            <div className="text-xs font-medium text-indigo-600 mb-1">Interview Expert</div>
            <div className="whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: WELCOME_MESSAGE.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-800"
            }`}>
              {msg.role === "assistant" && (
                <div className="text-xs font-medium text-indigo-600 mb-1">Interview Expert</div>
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
          placeholder="Paste any PM interview question..."
          disabled={isLoading}
          rows={2}
          className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
}
