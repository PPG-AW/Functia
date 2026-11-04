"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cx } from "./ui";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; tone: ToastTone; message: string };

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const toneStyles: Record<ToastTone, { wrap: string; icon: string; symbol: string }> = {
  success: { wrap: "bg-emerald-500 text-white", icon: "✓", symbol: "Berhasil" },
  error: { wrap: "bg-rose-500 text-white", icon: "!", symbol: "Gagal" },
  info: { wrap: "bg-brand text-white", icon: "i", symbol: "Info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, tone, message }]);
    setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 3800);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cx(
              "animate-pop pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl",
              toneStyles[item.tone].wrap,
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 font-display text-sm font-black">
              {toneStyles[item.tone].icon}
            </span>
            <p className="text-sm font-semibold leading-snug">{item.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
