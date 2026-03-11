"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useProfile } from "@/stores/profile-context";

let messageId = 0;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContainerProps {
  section: "about-me" | "interview";
  storageKey: string;
  welcomeMessage: string;
  interviewConfig?: {
    interviewCompany: string;
    interviewQuestionType: string;
    interviewFeedbackMode: string;
  };
}

export function ChatContainer({
  section,
  storageKey,
  welcomeMessage,
  interviewConfig,
}: ChatContainerProps) {
  const welcomeMsg: Message = {
    id: "welcome",
    role: "assistant",
    content: welcomeMessage,
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMsg]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state: profileState, dispatch: profileDispatch } = useProfile();

  // Hydrate messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          // Restore messageId counter to avoid collisions
          messageId = parsed.length;
        }
      }
    } catch {
      // localStorage unavailable or corrupt — use defaults
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Persist messages to localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // localStorage may be full or unavailable — silently ignore
    }
  }, [messages, isHydrated, storageKey]);

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: `user-${++messageId}`,
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingContent("");

      // Build conversation history — do NOT include the new userMessage here
      // because the API route appends `message` as the final user turn.
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            section,
            conversationHistory,
            profileSnapshot: profileState.profile,
            ...(interviewConfig ?? {}),
          }),
        });

        if (!res.ok) {
          throw new Error(`Chat API error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

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
              const parsed = JSON.parse(data) as {
                type?: string;
                text?: string;
                profileUpdates?: Record<string, unknown>;
              };

              if (parsed.type === "text" && parsed.text) {
                fullContent += parsed.text;
                setStreamingContent(fullContent);
              }

              if (parsed.type === "profileUpdate" && parsed.profileUpdates) {
                console.log("[ChatContainer] Profile update received:", parsed.profileUpdates);
                profileDispatch({
                  type: "UPDATE_PROFILE",
                  payload: parsed.profileUpdates,
                });
              }
            } catch {
              // Non-JSON line — might be a plain text chunk
              if (data && data !== "[DONE]") {
                fullContent += data;
                setStreamingContent(fullContent);
              }
            }
          }
        }

        // Finalize the assistant message
        const assistantMessage: Message = {
          id: `assistant-${++messageId}`,
          role: "assistant",
          content: fullContent,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: `error-${++messageId}`,
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again in a moment.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [messages, profileState.profile, profileDispatch, section, interviewConfig]
  );

  return (
    <div
      data-testid="chat-container"
      className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border border-slate-200 bg-white"
    >
      {/* Messages area */}
      <div
        data-testid="chat-messages"
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 p-4">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
