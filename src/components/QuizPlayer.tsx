/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDiagram } from "@/components/ArrowDiagram";
import { fireConfetti } from "@/components/confetti";
import { useToast } from "@/components/Toast";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx } from "@/components/ui";
import { apiFetch, post } from "@/lib/client";
import { emitRefresh } from "@/lib/bus";
import type { Question } from "@/lib/store/types";
import type { QuestionAnswerState, SubmitAnswerResult } from "@/lib/types-api";

type QuestionsResponse = {
  menu: string;
  questions: Question[];
  answers: QuestionAnswerState[];
};

export function QuizPlayer({
  menu,
  icon,
  title,
  subtitle,
  accent,
  description,
  locked,
  lockMessage,
  lockHref,
  lockCta,
  nextHref,
  nextLabel,
}: {
  menu: "misi" | "uji";
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
  description: string;
  locked: boolean;
  lockMessage?: string;
  lockHref?: string;
  lockCta?: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [saved, setSaved] = useState<Record<string, QuestionAnswerState>>({});
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitAnswerResult | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<QuestionsResponse>(`/api/questions?menu=${menu}`)
      .then((res) => {
        if (!active) return;
        setQuestions(res.questions);
        setSaved(Object.fromEntries(res.answers.map((a) => [a.question_id, a])));
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "Gagal memuat soal."));
    return () => {
      active = false;
    };
  }, [menu]);

  const question = questions?.[index];
  const total = questions?.length ?? 0;
  const answeredCount = useMemo(
    () => (questions ? questions.filter((q) => saved[q.id]).length : 0),
    [questions, saved],
  );
  const allDone = total > 0 && answeredCount >= total;
  const currentState = question ? saved[question.id] : undefined;

  useEffect(() => {
    setAnswer(null);
    setReason(null);
    setLastResult(null);
  }, [index]);

  useEffect(() => {
    if (allDone) void fireConfetti("big");
  }, [allDone]);

  const scores = useMemo(() => {
    const rows = questions ? questions.map((q) => saved[q.id]).filter(Boolean) : [];
    const sum = rows.reduce((acc, row) => acc + (row?.score ?? 0), 0);
    const correct = rows.filter((row) => row?.is_correct).length;
    return {
      answered: rows.length,
      average: rows.length ? Math.round(sum / rows.length) : 0,
      correct,
    };
  }, [questions, saved]);

  async function submit() {
    if (!question || !answer || !reason) return;
    setSubmitting(true);
    try {
      const result = await post<SubmitAnswerResult>("/api/answers", {
        question_id: question.id,
        selected_answer: answer,
        selected_reason: reason,
      });
      setSaved((prev) => ({
        ...prev,
        [question.id]: {
          question_id: question.id,
          selected_answer: answer,
          selected_reason: reason,
          is_correct: result.is_correct,
          score: result.score,
          correct_answer: result.correct_answer,
          correct_reason: result.correct_reason,
          explanation: result.explanation,
        },
      }));
      setLastResult(result);
      emitRefresh();
      toast(result.feedback, result.is_correct ? "success" : "error");
      if (result.is_correct) void fireConfetti("small");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Jawaban gagal dikirim.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function go(delta: number) {
    const next = Math.max(0, Math.min(total - 1, index + delta));
    setIndex(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (locked) {
    return (
      <div className="space-y-5">
        <Header icon={icon} title={title} subtitle={subtitle} accent={accent} />
        <Card className="p-8 text-center">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-3 font-display text-xl font-extrabold text-ink">Menu masih terkunci</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">{lockMessage}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {lockHref ? (
              <Link href={lockHref}>
                <Button>{lockCta ?? "Buka Menu Sebelumnya"}</Button>
              </Link>
            ) : null}
            <Link href="/belajar">
              <Button variant="secondary">Kembali ke Beranda</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error) return <EmptyState icon="⚠️" title="Soal tidak dapat dimuat" description={error} />;
  if (!questions) return <Loader label="Memuat soal..." />;
  if (!questions.length || !question)
    return (
      <EmptyState
        icon="📝"
        title="Belum ada soal aktif"
        description="Guru belum mengaktifkan soal pada menu Manajemen Pembelajaran."
      />
    );

  const answerText = (key: string) => question.options.answers.find((a) => a.key === key)?.text ?? key;
  const reasonText = (key: string) => question.options.reasons.find((r) => r.key === key)?.text ?? key;
  const shown = currentState ?? lastResultToState(lastResult, question.id);

  return (
    <div className="space-y-5">
      <Header icon={icon} title={title} subtitle={subtitle} accent={accent} />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-ink/60">
          <span>
            Soal {index + 1} dari {total}
          </span>
          <span>
            {answeredCount}/{total} terjawab · rata-rata skor {scores.average}
          </span>
        </div>
        <ProgressBar value={(answeredCount / total) * 100} className="mt-2" />
        <div className="mt-3 flex gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cx(
                "h-2.5 flex-1 rounded-full transition-all",
                i === index
                  ? "bg-gradient-to-r from-brand to-aqua"
                  : saved[q.id]
                    ? saved[q.id]?.is_correct
                      ? "bg-aqua/60"
                      : "bg-coral/60"
                    : "bg-slate-200",
              )}
              aria-label={`Buka soal ${i + 1}`}
            />
          ))}
        </div>
      </Card>

      <Card key={question.id} className="animate-fade-up overflow-hidden p-0">
        <div className={cx("h-1.5 w-full bg-gradient-to-r", accent)} />
        <div className="p-5 sm:p-7">
          {question.context ? (
            <div className="rounded-3xl bg-cream p-4 ring-1 ring-sun/25 sm:p-5">
              <p className="font-display text-xs font-black uppercase tracking-widest text-amber-700">
                📖 Cerita Penyelidikan
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/80 sm:text-base">{question.context}</p>
            </div>
          ) : null}

          {question.options.pairs?.length ? (
            <div className="mt-4 rounded-3xl bg-brand-soft/60 p-4 ring-1 ring-brand/15 sm:p-5">
              <p className="font-display text-xs font-black uppercase tracking-widest text-brand-dark">
                Himpunan pasangan berurutan
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.pairs.map((pair, i) => (
                  <span
                    key={`${pair}-${i}`}
                    className="rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-bold text-ink shadow-sm sm:text-sm"
                  >
                    {pair}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/60">
                Unsur pertama = domain, unsur kedua = pasangannya di kodomain.
              </p>
            </div>
          ) : null}

          {question.options.image ? (
            <div className="mt-4 overflow-hidden rounded-3xl bg-white ring-1 ring-brand-soft">
              <img
                src={question.options.image}
                alt={question.options.imageAlt ?? "Ilustrasi soal"}
                className="h-auto w-full"
              />
            </div>
          ) : null}

          {question.diagram_data ? (
            <div className="mt-4 rounded-3xl bg-gradient-to-br from-white to-brand-soft/40 p-3 ring-1 ring-brand-soft sm:p-5">
              <ArrowDiagram diagram={question.diagram_data} />
            </div>
          ) : null}

          <h2 className="mt-5 font-display text-lg font-extrabold leading-snug text-ink sm:text-xl">
            {question.question_text}
          </h2>
          <p className="mt-1 text-xs text-ink/55">{description}</p>

          {/* PILIHAN JAWABAN */}
          <div className="mt-5">
            <p className="font-display text-xs font-black uppercase tracking-widest text-ink/50">
              1. Jawaban
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {question.options.answers.map((option) => {
                const active = (shown ? shown.selected_answer : answer) === option.key;
                const isKey = shown?.correct_answer === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={Boolean(shown)}
                    onClick={() => setAnswer(option.key)}
                    className={cx(
                      "rounded-3xl border-2 px-4 py-4 text-left font-display text-sm font-bold transition-all",
                      !shown && "hover:-translate-y-0.5 hover:shadow-md",
                      shown
                        ? isKey
                          ? "border-aqua bg-aqua-soft text-teal-800"
                          : active
                            ? "border-coral bg-coral-soft text-rose-800"
                            : "border-slate-200 bg-white text-ink/45"
                        : active
                          ? "border-brand bg-brand-soft text-brand-dark shadow-md"
                          : "border-slate-200 bg-white text-ink/80",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cx(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                          shown && isKey
                            ? "bg-aqua text-white"
                            : shown && active
                              ? "bg-coral text-white"
                              : active
                                ? "bg-brand text-white"
                                : "bg-slate-100 text-ink/60",
                        )}
                      >
                        {shown && isKey ? "✓" : shown && active ? "✗" : option.key === "fungsi" ? "ƒ" : "?"}
                      </span>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PILIHAN ALASAN */}
          <div className="mt-5">
            <p className="font-display text-xs font-black uppercase tracking-widest text-ink/50">
              2. Alasan
            </p>
            <div className="mt-2 grid gap-2.5">
              {question.options.reasons.map((option) => {
                const active = (shown ? shown.selected_reason : reason) === option.key;
                const isKey = shown?.correct_reason === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={Boolean(shown)}
                    onClick={() => setReason(option.key)}
                    className={cx(
                      "flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition-all",
                      !shown && "hover:-translate-y-0.5 hover:shadow-sm",
                      shown
                        ? isKey
                          ? "border-aqua bg-aqua-soft text-teal-800"
                          : active
                            ? "border-coral bg-coral-soft text-rose-800"
                            : "border-slate-200 bg-white text-ink/45"
                        : active
                          ? "border-brand bg-brand-soft text-brand-dark shadow-sm"
                          : "border-slate-200 bg-white text-ink/80",
                    )}
                  >
                    <span
                      className={cx(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-black",
                        shown && isKey
                          ? "bg-aqua text-white"
                          : shown && active
                            ? "bg-coral text-white"
                            : active
                              ? "bg-brand text-white"
                              : "bg-slate-100 text-ink/60",
                      )}
                    >
                      {option.key}
                    </span>
                    <span className="font-semibold leading-relaxed">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AKSI */}
          {!shown ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                disabled={!answer || !reason}
                loading={submitting}
                onClick={() => void submit()}
              >
                {submitting ? "Mengirim jawaban..." : "Kirim Jawaban ✉️"}
              </Button>
              {!answer || !reason ? (
                <p className="text-xs font-semibold text-ink/50">
                  Pilih jawaban dan alasan terlebih dahulu.
                </p>
              ) : null}
            </div>
          ) : (
            <Feedback
              state={shown}
              answerText={answerText(shown.selected_answer)}
              reasonText={reasonText(shown.selected_reason)}
              correctAnswerText={answerText(shown.correct_answer)}
              correctReasonText={reasonText(shown.correct_reason)}
            />
          )}
        </div>
      </Card>

      {/* NAVIGASI SOAL */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" size="lg" disabled={index === 0} onClick={() => go(-1)}>
          ← Sebelumnya
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/belajar">
            <Button variant="ghost" size="lg">
              Kembali ke Beranda
            </Button>
          </Link>
          {index < total - 1 ? (
            <Button size="lg" onClick={() => go(1)}>
              Soal Berikutnya →
            </Button>
          ) : null}
        </div>
      </div>

      {/* RINGKASAN */}
      {allDone ? (
        <Card className="animate-pop relative overflow-hidden p-0">
          <div className={cx("absolute inset-0 opacity-10 bg-gradient-to-br", accent)} aria-hidden />
          <div className="relative p-6 sm:p-8">
            <Badge tone="sun">🎉 Seluruh soal selesai</Badge>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">
              Ringkasan Hasil {title}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Soal terjawab" value={`${scores.answered}/${total}`} tone="brand" />
              <Stat label="Jawaban tepat" value={`${scores.correct}/${total}`} tone="aqua" />
              <Stat label={menu === "uji" ? "Nilai akhir" : "Rata-rata skor"} value={`${scores.average}`} tone="sun" />
            </div>
            <ul className="mt-5 space-y-2">
              {questions.map((q, i) => {
                const state = saved[q.id];
                return (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/85 px-4 py-2.5 text-xs font-semibold ring-1 ring-brand-soft/70"
                  >
                    <span className="text-ink/75">
                      Soal {i + 1} · {q.question_text.slice(0, 52)}
                      {q.question_text.length > 52 ? "…" : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge tone={state?.is_correct ? "aqua" : "coral"}>
                        {state?.is_correct ? "Tepat" : "Belum tepat"}
                      </Badge>
                      <span className="font-display text-ink">{state?.score ?? 0}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {nextHref ? (
                <Link href={nextHref}>
                  <Button size="lg" variant="success">
                    {nextLabel ?? "Lanjutkan"} →
                  </Button>
                </Link>
              ) : null}
              <Link href="/belajar">
                <Button size="lg" variant="secondary">
                  Kembali ke Beranda
                </Button>
              </Link>
              {menu === "uji" ? (
                <Button size="lg" variant="sun" onClick={() => router.push("/belajar/selesai")}>
                  Lihat Halaman Penyelesaian 🏅
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function lastResultToState(result: SubmitAnswerResult | null, questionId: string): QuestionAnswerState | null {
  if (!result) return null;
  return {
    question_id: questionId,
    selected_answer: "",
    selected_reason: "",
    is_correct: result.is_correct,
    score: result.score,
    correct_answer: result.correct_answer,
    correct_reason: result.correct_reason,
    explanation: result.explanation,
  };
}

function Header({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg",
            accent,
          )}
        >
          {icon}
        </span>
        <div>
          <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">{title}</h1>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/70">{subtitle}</p>
        </div>
      </div>
      <Link href="/belajar">
        <Button variant="secondary" size="sm">
          ← Beranda
        </Button>
      </Link>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    brand: "from-brand to-sky",
    aqua: "from-aqua to-emerald-400",
    sun: "from-sun to-amber-400",
  };
  return (
    <div className={cx("rounded-3xl bg-gradient-to-br p-4 text-white shadow-md", tones[tone] ?? tones.brand)}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Feedback({
  state,
  answerText,
  reasonText,
  correctAnswerText,
  correctReasonText,
}: {
  state: QuestionAnswerState;
  answerText: string;
  reasonText: string;
  correctAnswerText: string;
  correctReasonText: string;
}) {
  return (
    <div
      className={cx(
        "animate-pop mt-6 rounded-3xl border-2 p-5",
        state.is_correct ? "border-aqua/40 bg-aqua-soft" : "border-coral/40 bg-coral-soft",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-2xl text-lg text-white shadow",
            state.is_correct ? "bg-aqua" : "bg-coral",
          )}
        >
          {state.is_correct ? "🎉" : "🤔"}
        </span>
        <div>
          <p className="font-display text-base font-extrabold text-ink">
            {state.is_correct ? "Hebat! Jawaban dan alasanmu tepat." : "Belum tepat."}
          </p>
          <p className="text-xs font-semibold text-ink/60">
            Skor jawaban ini: <strong>{state.score}</strong>
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        {state.is_correct
          ? "Hebat! Jawaban dan alasanmu tepat. Kamu berhasil menemukan ciri-ciri fungsi!"
          : "Belum tepat. Coba perhatikan kembali setiap anggota domain. Apakah semuanya memiliki tepat satu pasangan?"}
      </p>

      <div className="mt-4 grid gap-2 rounded-2xl bg-white/80 p-4 text-xs sm:text-sm">
        <p className="text-ink/70">
          <span className="font-bold text-ink">Jawabanmu:</span> {answerText || "-"} · alasan{" "}
          {reasonText || "-"}
        </p>
        <p className="text-ink/70">
          <span className="font-bold text-teal-700">Kunci jawaban:</span> {correctAnswerText} · alasan{" "}
          {correctReasonText}
        </p>
        {state.explanation ? (
          <p className="mt-1 border-t border-slate-200 pt-2 leading-relaxed text-ink/75">
            <span className="font-bold text-ink">Pembahasan:</span> {state.explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
}
