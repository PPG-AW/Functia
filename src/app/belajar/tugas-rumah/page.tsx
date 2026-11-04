/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDiagram } from "@/components/ArrowDiagram";
import { fireConfetti } from "@/components/confetti";
import { useToast } from "@/components/Toast";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx } from "@/components/ui";
import { apiFetch, formatDate, patch, post } from "@/lib/client";
import { HOMEWORK_MIN_SELECTED, HOMEWORK_QUESTIONS, HOMEWORK_TOTAL } from "@/lib/homework";
import type { HomeworkState } from "@/lib/store/types";

type AnswerValue = { key: string; text: string };

type HomeworkResponse = {
  authenticated: boolean;
  homework: HomeworkState | null;
  student?: { name: string; attendance_number: number; class_name: string };
  totalQuestions?: number;
  minSelected?: number;
};

export default function TugasRumahPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [student, setStudent] = useState<HomeworkResponse["student"]>();
  const [homework, setHomework] = useState<HomeworkState | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const hydrated = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<HomeworkResponse>("/api/homework");
      setAuthenticated(res.authenticated);
      setStudent(res.student);
      setHomework(res.homework);
      setSelected(res.homework?.selected ?? []);
      setAnswers(res.homework?.answers ?? {});
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat Tugas Rumah.");
    } finally {
      setLoading(false);
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Simpan draf otomatis agar pilihan dan jawaban tidak hilang saat halaman dimuat ulang.
  useEffect(() => {
    if (!hydrated.current || loading || !authenticated) return;
    const timer = setTimeout(() => {
      void patch("/api/homework", { selected, answers }).catch(() => undefined);
    }, 700);
    return () => clearTimeout(timer);
  }, [selected, answers, loading, authenticated]);

  const answeredCount = selected.filter((number) => Boolean(answers[String(number)])).length;
  const canSubmit = selected.length >= HOMEWORK_MIN_SELECTED && answeredCount >= HOMEWORK_MIN_SELECTED;

  function toggleSelect(number: number) {
    setSelected((prev) =>
      prev.includes(number) ? prev.filter((item) => item !== number) : [...prev, number].sort((a, b) => a - b),
    );
    setExpanded((prev) => (prev === number ? null : number));
  }

  function choose(number: number, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [String(number)]: value }));
  }

  async function submit() {
    if (!canSubmit) {
      toast(`Pilih dan jawab minimal ${HOMEWORK_MIN_SELECTED} soal terlebih dahulu.`, "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await post<{ homework: HomeworkState; message: string }>("/api/homework", {
        selected,
        answers,
      });
      setHomework(res.homework);
      await fireConfetti("big");
      toast(res.message, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengumpulkan jawaban.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader label="Menyiapkan Tugas Rumah..." />;
  if (error || !authenticated)
    return (
      <div className="space-y-4">
        <EmptyState
          icon="⚠️"
          title="Tugas Rumah tidak dapat dibuka"
          description={error ?? "Sesi siswa tidak ditemukan. Silakan masuk kembali."}
        />
        <div className="flex justify-center gap-3">
          <Button onClick={() => void load()}>Coba Lagi</Button>
          <Link href="/belajar">
            <Button variant="secondary">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );

  const submitted = homework?.status === "terkumpul";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-grape to-brand text-2xl text-white shadow-lg">
            📝
          </span>
          <div>
            <Badge tone="grape">Menu Tambahan</Badge>
            <h1 className="mt-1 font-display text-xl font-extrabold text-ink sm:text-2xl">
              Tugas Rumah: Relasi dan Fungsi
            </h1>
          </div>
        </div>
        <Link href="/belajar">
          <Button variant="secondary" size="sm">
            ← Kembali ke Beranda
          </Button>
        </Link>
      </div>

      {/* PETUNJUK & STATUS */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-extrabold text-ink">
              Halo{student?.name ? `, ${student.name.split(" ")[0]}!` : "!"} Pilih soalmu sendiri 📌
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">
              Ada <strong>{HOMEWORK_TOTAL} soal</strong>. Kamu <strong>wajib memilih dan mengerjakan
              minimal {HOMEWORK_MIN_SELECTED} soal</strong>, tetapi boleh mengerjakan lebih banyak
              sampai seluruh {HOMEWORK_TOTAL} soal. Tidak ada batas waktu di halaman ini.
            </p>
          </div>
          <Badge tone={submitted ? "aqua" : "sun"}>
            {submitted ? "Sudah Dikumpulkan" : "Belum Dikumpulkan"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Soal dipilih" value={`${selected.length}/${HOMEWORK_TOTAL}`} tone="from-brand to-sky" />
          <Stat label="Soal dijawab" value={`${answeredCount}/${HOMEWORK_TOTAL}`} tone="from-aqua to-emerald-400" />
          <Stat
            label="Minimal wajib"
            value={`${HOMEWORK_MIN_SELECTED} soal`}
            tone="from-sun to-amber-400"
          />
        </div>
        <div className="mt-4">
          <ProgressBar value={(answeredCount / HOMEWORK_TOTAL) * 100} />
        </div>

        {submitted && homework ? (
          <div className="mt-4 rounded-3xl border-2 border-aqua/35 bg-aqua-soft/60 p-4">
            <p className="font-display text-sm font-extrabold text-teal-800">
              ✅ Jawaban berhasil dikumpulkan!
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink/70 sm:text-sm">
              Dikumpulkan pada <strong>{formatDate(homework.submitted_at)}</strong> ·{" "}
              {homework.total_answered} soal dijawab · {homework.correct_count} jawaban tepat · nilai{" "}
              <strong>{homework.score ?? 0}</strong>. Kamu masih boleh memperbarui jawaban lalu
              mengumpulkan kembali.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs font-semibold text-amber-700">
            💡 Pilihan dan jawabanmu tersimpan otomatis sebagai draf. Tekan tombol
            &ldquo;Kumpulkan Jawaban&rdquo; setelah minimal {HOMEWORK_MIN_SELECTED} soal selesai.
          </p>
        )}
      </Card>

      {/* DAFTAR SOAL */}
      <div className="grid gap-4 lg:grid-cols-2">
        {HOMEWORK_QUESTIONS.map((question) => {
          const isSelected = selected.includes(question.number);
          const answer = answers[String(question.number)];
          const isAnswered = Boolean(answer);
          const isOpen = expanded === question.number;
          return (
            <Card
              key={question.number}
              hover
              className={cx("animate-fade-up overflow-hidden p-0", isSelected && "ring-2 ring-brand/30")}
            >
              <div className={cx("h-1.5 w-full bg-gradient-to-r", isAnswered ? "from-aqua to-emerald-400" : "from-brand to-sky")} />
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-display text-sm font-black text-white",
                        isAnswered ? "bg-gradient-to-br from-aqua to-emerald-400" : "bg-gradient-to-br from-brand to-sky",
                      )}
                    >
                      {question.number}
                    </span>
                    <div>
                      <p className="font-display text-sm font-extrabold leading-snug text-ink">
                        {question.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {isSelected ? <Badge tone="brand">Dipilih</Badge> : null}
                        {isAnswered ? <Badge tone="aqua">Sudah dijawab</Badge> : null}
                        {!isSelected ? <Badge tone="slate">Belum dipilih</Badge> : null}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "primary"}
                    onClick={() => toggleSelect(question.number)}
                  >
                    {isSelected ? "Batalkan" : "Pilih"}
                  </Button>
                </div>

                {isSelected ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs leading-relaxed text-ink/70 sm:text-sm">{question.context}</p>

                    {question.pairs?.length ? (
                      <div className="rounded-2xl bg-brand-soft/60 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-widest text-brand-dark">
                          Himpunan pasangan berurutan
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.pairs.map((pair, i) => (
                            <span
                              key={`${pair}-${i}`}
                              className="rounded-xl bg-white px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-sm"
                            >
                              {pair}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {question.image ? (
                      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-soft">
                        <img src={question.image} alt={question.imageAlt ?? "Ilustrasi soal"} className="h-auto w-full" />
                      </div>
                    ) : null}

                    {question.diagram ? (
                      <div className="rounded-2xl bg-gradient-to-br from-white to-brand-soft/40 p-3 ring-1 ring-brand-soft">
                        <ArrowDiagram diagram={question.diagram} showVerdict />
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : question.number)}
                      className="text-xs font-bold text-brand-dark underline underline-offset-2"
                    >
                      {isOpen ? "Sembunyikan pilihan jawaban" : "Tampilkan pilihan jawaban"}
                    </button>

                    {isOpen ? (
                      <div className="grid gap-2">
                        {question.choices.map((choice) => {
                          const active = answer?.key === choice.key;
                          return (
                            <button
                              key={choice.key}
                              type="button"
                              onClick={() => choose(question.number, { key: choice.key, text: choice.text })}
                              className={cx(
                                "flex items-start gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-xs transition-all sm:text-sm",
                                active
                                  ? "border-brand bg-brand-soft text-brand-dark shadow-sm"
                                  : "border-slate-200 bg-white text-ink/80 hover:border-brand/40",
                              )}
                            >
                              <span
                                className={cx(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-black",
                                  active ? "bg-brand text-white" : "bg-slate-100 text-ink/60",
                                )}
                              >
                                {choice.key}
                              </span>
                              <span className="font-semibold leading-relaxed">{choice.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {/* PENGUMPULAN */}
      <Card className="sticky bottom-3 z-20 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-extrabold text-ink">
              {selected.length} soal dipilih · {answeredCount} soal dijawab
            </p>
            <p className="text-xs text-ink/60">
              {canSubmit
                ? "Siap dikumpulkan. Kamu masih boleh menambah soal sebelum menekan tombol."
                : `Minimal ${HOMEWORK_MIN_SELECTED} soal harus dipilih dan dijawab.`}
            </p>
          </div>
          <Button size="lg" variant="success" loading={submitting} disabled={!canSubmit} onClick={() => void submit()}>
            {submitting ? "Mengumpulkan..." : "Kumpulkan Jawaban 📨"}
          </Button>
        </div>
      </Card>

      <p className="text-center text-xs text-ink/50">
        Jawaban Tugas Rumah tersimpan terpisah dari Misi Penyelidikan dan Uji Pemahaman.
      </p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={cx("rounded-3xl bg-gradient-to-br p-4 text-white shadow-md", tone)}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
