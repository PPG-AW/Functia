"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { post } from "@/lib/client";
import { cx } from "./ui";

const LINKS = [
  { href: "/guru/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/guru/siswa", label: "Data Siswa", icon: "🧑‍🎓" },
  { href: "/guru/rekap", label: "Rekap Hasil", icon: "📋" },
  { href: "/guru/refleksi", label: "Refleksi", icon: "💬" },
  { href: "/guru/tugas-rumah", label: "Tugas Rumah", icon: "📝" },
  { href: "/guru/soal", label: "Manajemen Soal", icon: "🛠️" },
];

export function TeacherNav({ teacher }: { teacher: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await post("/api/teacher/auth", { action: "logout" });
      router.push("/guru");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/guru/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-aqua font-display text-base font-black text-white">
            ƒ
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-extrabold">FUNCTIA</span>
            <span className="block text-[10px] font-semibold text-white/60">Portal Guru</span>
          </span>
        </Link>

        <nav className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  "rounded-xl px-3.5 py-2 text-sm font-bold transition",
                  active ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-right text-[11px] leading-tight md:block">
            <span className="block font-display font-bold">{teacher.name}</span>
            <span className="block text-white/55">{teacher.email}</span>
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={busy}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-coral disabled:opacity-60"
          >
            {busy ? "..." : "Keluar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold lg:hidden"
            aria-label="Buka menu navigasi"
          >
            {open ? "Tutup" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="animate-pop grid gap-1 border-t border-white/10 bg-ink px-4 py-3 lg:hidden">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "rounded-xl px-3.5 py-2.5 text-sm font-bold transition",
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
                )}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
