"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  info: <Info size={20} className="text-blue-500" />,
  warning: <AlertTriangle size={20} className="text-yellow-600" />,
};

const styles: Record<ToastType, string> = {
  success: "border-l-green-500 bg-green-50",
  error: "border-l-red-500 bg-red-50",
  info: "border-l-blue-500 bg-blue-50",
  warning: "border-l-yellow-500 bg-yellow-50",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        pointer-events-auto w-full max-w-[420px] rounded-lg border-l-4
        p-3 shadow-lg ${styles[toast.type]}
        animate-slide-in-right
      `}
      data-testid={`toast-${toast.type}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
