"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1" data-testid="typing-indicator">
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const showTyping = isStreaming && !content;

  return (
    <div
      className={`flex motion-safe:animate-message-in ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
      data-testid={`chat-message-${role}`}
    >
      {isAssistant && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
          PM
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "rounded-2xl rounded-bl-sm bg-slate-100 text-slate-800"
            : "rounded-2xl rounded-br-sm bg-primary-600 text-white"
        }`}
      >
        {showTyping ? <TypingIndicator /> : content}
      </div>
    </div>
  );
}
