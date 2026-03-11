"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { VoiceInput } from "./voice-input";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stable callback for voice transcription — only appends to textarea, never sends
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => {
      const separator = prev && !prev.endsWith(" ") ? " " : "";
      return prev + separator + text;
    });
  }, []);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Adjust height whenever input changes (including voice appends)
  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const isEmpty = input.trim().length === 0;

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2">
      <textarea
        ref={textareaRef}
        data-testid="chat-input-field"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        style={{ maxHeight: "120px" }}
      />
      <VoiceInput onTranscript={handleVoiceTranscript} />
      <button
        data-testid="chat-send-button"
        onClick={handleSend}
        disabled={isEmpty || disabled}
        aria-label="Send message"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-opacity disabled:opacity-40"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
