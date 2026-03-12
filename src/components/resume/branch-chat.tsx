"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import type { BranchChatMessage, Suggestion } from "@/types/resume-branch";
import type { UserProfile } from "@/lib/utils/profile";

interface BranchChatProps {
  branchId: string;
  chatHistory: BranchChatMessage[];
  currentResumeText: string;
  jobDescriptionText: string;
  suggestions: Suggestion[];
  profile: Partial<UserProfile>;
  onNewMessage: (message: BranchChatMessage) => void;
  onNewSuggestions: (suggestions: Suggestion[]) => void;
}

const SUGGESTIONS_RE = /<suggestions>\s*([\s\S]*?)\s*<\/suggestions>/;

function extractSuggestions(text: string): Suggestion[] {
  const match = text.match(SUGGESTIONS_RE);
  if (!match) return [];
  try {
    let jsonStr = match[1].trim();
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: Record<string, unknown>, i: number) => ({
      id: String(s.id || `s-${Date.now()}-${i}`),
      sectionType: String(s.sectionType || ""),
      original: String(s.original || ""),
      suggested: String(s.suggested || ""),
      reason: String(s.reason || ""),
      status: "pending" as const,
    }));
  } catch {
    return [];
  }
}

function stripSuggestionsTag(text: string): string {
  return text.replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "").trimEnd();
}

export function BranchChat({
  branchId,
  chatHistory,
  currentResumeText,
  jobDescriptionText,
  suggestions,
  profile,
  onNewMessage,
  onNewSuggestions,
}: BranchChatProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, streamingContent]);

  const handleSend = useCallback(
    async (message: string) => {
      // Add user message immediately
      const userMsg: BranchChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message,
      };
      onNewMessage(userMsg);

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const conversationHistory = chatHistory.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/resume/branch-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            branchId,
            conversationHistory,
            currentResumeText,
            jobDescriptionText,
            suggestions,
            profile: profile ?? undefined,
          }),
        });

        if (!res.ok) {
          const errorMsg: BranchChatMessage = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          };
          onNewMessage(errorMsg);
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.type === "text" && parsed.text) {
                accumulated += parsed.text;
                setStreamingContent(stripSuggestionsTag(accumulated));
              }
            } catch {
              // Partial JSON
            }
          }
        }

        // Extract suggestions from full response
        const newSuggestions = extractSuggestions(accumulated);
        const visibleText = stripSuggestionsTag(accumulated).trim();

        // Add assistant message
        const assistantMsg: BranchChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: visibleText,
          suggestions: newSuggestions.length > 0 ? newSuggestions : undefined,
        };
        onNewMessage(assistantMsg);

        // Emit new suggestions
        if (newSuggestions.length > 0) {
          onNewSuggestions(newSuggestions);
        }
      } catch {
        const errorMsg: BranchChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        };
        onNewMessage(errorMsg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [
      branchId,
      chatHistory,
      currentResumeText,
      jobDescriptionText,
      suggestions,
      profile,
      onNewMessage,
      onNewSuggestions,
    ]
  );

  return (
    <div
      className="flex flex-col rounded-lg border border-slate-200 bg-white"
      data-testid="branch-chat"
    >
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
        style={{ maxHeight: "400px", minHeight: "200px" }}
      >
        {chatHistory.length === 0 && !isStreaming && (
          <p className="text-center text-sm text-slate-400 py-8">
            Ask questions or request changes for this version of your resume.
          </p>
        )}
        {chatHistory.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}
        {isStreaming && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming
          />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-3">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
