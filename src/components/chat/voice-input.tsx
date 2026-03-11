"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

// Extend Window for vendor-prefixed SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as SpeechRecognitionConstructor | undefined) ??
    (w.webkitSpeechRecognition as SpeechRecognitionConstructor | undefined) ??
    null
  );
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const processedIndexRef = useRef<number>(0);

  useEffect(() => {
    setIsAvailable(getSpeechRecognition() !== null);
  }, []);

  const toggle = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    processedIndexRef.current = 0;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Only process newly finalized results (skip already-processed indices)
      for (let i = processedIndexRef.current; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) {
          const transcript = result[0]?.transcript?.trim();
          if (transcript) {
            onTranscript(transcript);
          }
          processedIndexRef.current = i + 1;
        }
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, onTranscript]);

  // Graceful fallback: hide button if Web Speech API not available
  if (!isAvailable) return null;

  return (
    <>
      {isRecording && (
        <span
          data-testid="voice-recording-indicator"
          className="absolute -top-6 right-0 text-xs font-medium text-error-500"
        >
          Recording...
        </span>
      )}
      <button
        data-testid="voice-input-button"
        onClick={toggle}
        aria-label={isRecording ? "Stop recording" : "Start voice input"}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
          isRecording
            ? "animate-pulse bg-error-500 text-white"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
    </>
  );
}
