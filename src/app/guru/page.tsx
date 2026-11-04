"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { apiFetch, post } from "@/lib/client";
import type { StoreStatus } from "@/lib/store";

type AuthInfo = {
  teacher: { id: string; name: string; email: string; role: string } | null;
  storage: StoreStatus;
};

export default function TeacherLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [info, setInfo] = useState<AuthInfo | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<AuthInfo>("/api/teacher/auth")
      .then((res) => {
        setInfo(res);
        if (res.teacher) router.replace("/guru/dashboard");
      })
      .catch(() => setInfo(null));
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Email wajib diisi.";
    if (!password) next.password = "Kata sandi wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await post("/api/teacher/auth", { action: "login", email, password });
      toast("Berhasil masuk. Selamat bertugas, Guru!", "success");
      router.push("/guru/dashboard");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal masuk.", "error");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="batik-strip pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-aqua/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-6 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:block">
          <Image
            src="/images/mascot-detektif.png"
            alt="Maskot Detektif Fungsi FUNCTIA"
            width={520}
            height={520}
            className="animate-float w-full drop-shadow-2xl"
          />
        </div>

        <Card className="animate-fade-up p-6 sm:p-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Kembali ke Beranda
            </Button>
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-aqua text-xl text-white shadow-lg shadow-brand/30">
              🍎
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold text-ink">Portal Guru</h1>
              <p className="text-xs text-ink/60">FUNCTIA · Relasi dan Fungsi Kelas VIII</p>
            </div>
          </div>

          {info && !info.storage.online ? (
            <div className="mt-4 rounded-2xl bg-sun-soft px-4 py-3 text-xs font-semibold text-amber-800">
              ⚠️ {info.storage.message}{" "}
              <Link href="/konfigurasi" className="underline underline-offset-2">
                Lihat info konfigurasi
              </Link>
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
            <Field label="Email Guru" error={errors.email}>
              <input
                className={inputClass}
                type="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@sekolah.sch.id"
              />
            </Field>
            <Field label="Kata Sandi" error={errors.password}>
              <input
                className={inputClass}
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" size="lg" full loading={loading}>
              {loading ? "Memverifikasi..." : "Masuk Portal Guru"}
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-ink/50">
            Hanya guru yang memiliki akun yang dapat mengakses data siswa.
          </p>
        </Card>
      </div>
    </main>
  );
}
