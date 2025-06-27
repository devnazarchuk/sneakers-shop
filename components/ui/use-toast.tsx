import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: "default" | "success" | "error" | "info";
}

interface ToastFunction {
  (params: { title: string; description?: string; variant?: "default" | "success" | "error" | "info" }): void;
}

// Toast context and provider
const ToastContext = createContext<ToastFunction | null>(null);

// useToast hook
export function useToast() {
  return useContext(ToastContext);
}

// Safe toast function for non-hook usage
let toastImpl: ToastFunction | null = null;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Internal toast logic renamed to avoid duplicate identifier
  const showToast = ({ title, description, variant = "default" }: { title: string; description?: string; variant?: "default" | "success" | "error" | "info" }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Assign the implementation for non-hook usage
  toastImpl = showToast;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg shadow-lg px-4 py-3 text-sm font-medium transition-all animate-fade-in-up bg-white dark:bg-gray-900 border-l-4 ${
              t.variant === "success"
                ? "border-green-500 text-green-700"
                : t.variant === "error"
                ? "border-red-500 text-red-700"
                : t.variant === "info"
                ? "border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-900 dark:text-gray-100"
            }`}
          >
            <div>{t.title}</div>
            {t.description && <div className="text-xs mt-1 opacity-80">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Export a callable toast function for non-hook usage (throws if used before provider is mounted)
export function toast(params: { title: string; description?: string; variant?: "default" | "success" | "error" | "info" }) {
  if (!toastImpl) throw new Error("ToastProvider is not mounted yet");
  return toastImpl(params);
} 