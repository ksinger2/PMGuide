"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { Toast, ToastData, ToastType } from "./toast";

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION = 5000;

interface ToastContextValue {
  toast: (options: Omit<ToastData, "id">) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (options: Omit<ToastData, "id">): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((prev) => {
        const newToasts = [...prev, { ...options, id }];
        // Auto-dismiss oldest if exceeding max
        if (newToasts.length > MAX_VISIBLE_TOASTS) {
          const toRemove = newToasts[0];
          const timer = timersRef.current.get(toRemove.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(toRemove.id);
          }
          return newToasts.slice(1);
        }
        return newToasts;
      });

      // Set auto-dismiss timer
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string) =>
      toast({ type: "success", title, message }),
    [toast]
  );

  const error = useCallback(
    (title: string, message?: string) =>
      toast({ type: "error", title, message, duration: 0 }), // Errors persist until dismissed
    [toast]
  );

  const info = useCallback(
    (title: string, message?: string) => toast({ type: "info", title, message }),
    [toast]
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      toast({ type: "warning", title, message, duration: 0 }), // Warnings persist until dismissed
    [toast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{ toast, success, error, info, warning, dismiss, dismissAll }}
    >
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed right-0 top-0 z-50 flex flex-col gap-2 p-6"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
