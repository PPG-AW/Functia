"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { post } from "@/lib/client";
import type { LearningSession, Student } from "@/lib/store/types";
import { Button, Card, Field, inputClass } from "./ui";

const CLASS_OPTIONS = ["VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F"];

type CheckResponse = {
  found: boolean;
  student: Student | null;
  session: LearningSession | null;
};

export function StudentEntry() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("");
  const [className, setClassName] = useState("");
  const [customClass, setCustomClass] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<CheckResponse | null>(null);

  const finalClass = className === "Lainnya" ? customClass.trim() : className;

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Nama lengkap tidak boleh kosong.";
    else if (name.trim().length < 3) next.name = "Tuliskan nama lengkap minimal 3 huruf.";
    const absen = Number(attendance);
    if (!attendance.trim()) next.attendance = "Nomor absen wajib diisi.";
    else if (!Number.isInteger(absen) || absen < 1 || absen > 100)
      next.attendance = "Nomor absen harus angka 1–100.";
    if (!finalClass) next.className = "Kelas wajib dipilih atau diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function start(action: "start" | "restart") {
    setLoading(true);
    try {
      await post("/api/session", {
        action,
        name,
        attendance_number: Number(attendance),
        class_name: finalClass,
      });
      toast(
        action === "restart"
          ? "Sesi baru berhasil dibuat. Selamat bertualang!"
          : "Identitas tersimpan. Selamat datang di FUNCTIA!",
        "success",
      );
      setPending(null);
      router.push("/belajar");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal menyimpan data.", "error");
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) {
      toast("Lengkapi dulu identitas kamu ya.", "error");
      return;
    }
    setLoading(true);
    try {
      const check = await post<CheckResponse>("/api/session", {
        action: "check",
        name,
        attendance_number: Number(attendance),
        class_name: finalClass,
      });
      // Bila sesi lama memang menyimpan progres/jawaban, tampilkan pilihan
      // lanjutkan (sesuai ketentuan awal). Bila sesi masih kosong, langsung
      // masuk ke Beranda agar tombol "Mulai Petualangan" benar-benar membuka
      // dashboard tanpa langkah tambahan.
      const previousSession = check.session;
      const hasSavedWork =
        Boolean(previousSession) &&
        ((previousSession?.progress ?? 0) > 0 ||
          previousSession?.status === "selesai" ||
          Object.keys(previousSession?.menu_state ?? {}).length > 0);
      if (check.found && previousSession && hasSavedWork) {
        setPending(check);
        setLoading(false);
        return;
      }
      await start("start");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal menghubungi server.", "error");
      setLoading(false);
    }
  }

  if (pending?.session) {
    return (
      <Card className="animate-pop p-6 sm:p-8">
        <span className="text-3xl">👋</span>
        <h3 className="mt-2 font-display text-xl font-extrabold text-ink">
          Sesi belajar sebelumnya ditemukan!
        </h3>
        <p className="mt-1 text-sm text-ink/70">
          Halo <strong>{pending.student?.name}</strong> (absen {pending.student?.attendance_number}, kelas{" "}
          {pending.student?.class_name}). Kamu sudah memiliki progres{" "}
          <strong>{pending.session.progress}%</strong>. Jawabanmu yang lama tidak akan ditimpa. Tekan{" "}
          <strong>Lanjutkan Petualangan</strong> untuk langsung membuka Beranda belajarmu.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button size="lg" loading={loading} onClick={() => start("start")}>
            Lanjutkan Petualangan
          </Button>
          <Button size="lg" variant="secondary" loading={loading} onClick={() => start("restart")}>
            Mulai Sesi Baru
          </Button>
        </div>
        <button
          type="button"
          className="mt-4 text-xs font-semibold text-ink/50 underline-offset-2 hover:underline"
          onClick={() => setPending(null)}
        >
            Ganti identitas
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-aqua text-xl text-white shadow-lg shadow-brand/30">
          🎒
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold text-ink">Portal Siswa</h3>
          <p className="text-xs text-ink/60">Tanpa email & kata sandi. Cukup isi identitas diri.</p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Field label="Nama Lengkap" error={errors.name}>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Andi Pratama"
            autoComplete="name"
            maxLength={60}
          />
        </Field>

        <Field label="Nomor Absen" error={errors.attendance} hint="Tulis angka, contoh: 12">
          <input
            className={inputClass}
            value={attendance}
            onChange={(e) => setAttendance(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="Contoh: 12"
            maxLength={3}
          />
        </Field>

        <Field label="Kelas" error={errors.className}>
          <select
            className={inputClass}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="">— Pilih kelas —</option>
            {CLASS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="Lainnya">Lainnya (tulis manual)</option>
          </select>
        </Field>

        {className === "Lainnya" ? (
          <Field label="Tulis Kelas" hint="Contoh: VIII-G">
            <input
              className={inputClass}
              value={customClass}
              onChange={(e) => setCustomClass(e.target.value)}
              maxLength={20}
              placeholder="VIII-G"
            />
          </Field>
        ) : null}

        <Button type="submit" size="lg" full loading={loading}>
          {loading ? "Menyimpan data..." : "Mulai Petualangan 🚀"}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-ink/50">
          Dengan menekan tombol di atas, identitas dan aktivitas belajarmu disimpan ke basis data
          pembelajaran agar dapat dipantau oleh guru.
        </p>
      </form>
    </Card>
  );
}
