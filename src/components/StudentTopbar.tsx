"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/client";
import { REFRESH_EVENT } from "@/lib/bus";
import type { SessionResponse } from "@/lib/types-api";
import { ProgressBar } from "./ui";

export function StudentTopbar({
  initial,
}: {
  initial: { name: string; className: string; progress: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [data, setData] = useState(initial);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<SessionResponse>("/api/session");
        if (!active || !res.authenticated) return;
        setData({
          name: res.student.name,
          className: res.student.class_name,
          progress: res.progress,
        });
      } catch {
        /* biarkan data awal dipakai */
      }
    }
    load();
    const handler = () => void load();
    window.addEventListener(REFRESH_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(REFRESH_EVENT, handler);
    };
  }, [pathname]);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/session", { method: "DELETE" });
      toast("Sesi diakhiri. Sampai jumpa lagi!", "info");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal keluar.", "error");
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/belajar" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand via-sky to-aqua font-display text-base font-black text-white shadow-md shadow-brand/25">
            ƒ
          </span>
          <span className="hidden font-display text-base font-extrabold text-ink sm:block">FUNCTIA</span>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-xs font-bold text-ink/80 sm:text-sm">
              {data.name} <span className="text-ink/45">· {data.className}</span>
            </p>
            <p className="shrink-0 font-display text-xs font-extrabold text-brand-dark">
              {data.progress}%
            </p>
          </div>
          <ProgressBar value={data.progress} className="mt-1 h-2" />
        </div>

        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="shrink-0 rounded-xl border-2 border-coral-soft bg-white px-3 py-2 font-display text-xs font-bold text-rose-600 transition hover:bg-coral-soft disabled:opacity-60"
        >
          {loggingOut ? "..." : "Keluar"}
        </button>
      </div>
    </header>
  );
}
