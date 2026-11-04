"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, EmptyState, Loader, cx } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";
import { MENU_LABEL } from "@/lib/recap";
import type { LearningSession, Student, StudentReflection } from "@/lib/store/types";

type AnswerDetail = {
  id: string;
  question_id: string;
  selected_answer: string;
  selected_reason: string;
  is_correct: boolean;
  score: number;
  answered_at: string;
  menu_type: string;
  question_text: string;
  context: string;
  correct_answer: string;
  correct_reason: string;
  explanation: string;
  answer_text: string;
  reason_text: string;
};

type Detail = {
  student: Student;
  sessions: Array<{
    session: LearningSession;
    reflection: StudentReflection | null;
    answers: AnswerDetail[];
  }>;
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data, loading, error, reload } = useApi<Detail>(`/api/teacher/students/${id}`);

  if (loading) return <Loader label="Memuat detail jawaban siswa..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Detail tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center gap-3">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
          <Link href="/guru/siswa">
            <Button variant="secondary">Kembali ke Data Siswa</Button>
          </Link>
        </div>
      </div>
    );

  const { student, sessions } = data;
  const latest = sessions[0];
  const answers = latest?.answers ?? [];
  const average = answers.length ? Math.round(answers.reduce((a, b) => a + b.score, 0) / answers.length) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/guru/siswa">
          <Button variant="ghost" size="sm">
            ← Kembali ke Data Siswa
          </Button>
        </Link>
        <Link href="/guru/rekap">
          <Button variant="secondary" size="sm">
            📋 Rekap Hasil
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden p-0">
        <div className="batik-bg absolute inset-0 opacity-[0.1]" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-aqua font-display text-lg font-black text-white shadow-lg">
              {student.attendance_number}
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">{student.name}</h1>
              <p className="text-sm text-ink/60">
                Kelas {student.class_name} · Absen {student.attendance_number} · Terdaftar{" "}
                {formatDate(student.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MiniStat label="Sesi" value={String(sessions.length)} />
            <MiniStat label="Jawaban" value={String(answers.length)} />
            <MiniStat label="Rata-rata" value={String(average)} />
          </div>
        </div>
      </Card>

      {!sessions.length ? (
        <EmptyState icon="📭" title="Siswa belum memiliki sesi belajar" />
      ) : (
        sessions.map((entry, sessionIndex) => (
          <div key={entry.session.id} className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Badge tone={sessionIndex === 0 ? "brand" : "slate"}>
                    {sessionIndex === 0 ? "Sesi terbaru" : "Sesi sebelumnya"}
                  </Badge>
                  <h2 className="mt-2 font-display text-base font-extrabold text-ink">
                    Dimulai {formatDate(entry.session.started_at)}
                  </h2>
                  <p className="text-xs text-ink/55">
                    Status: {entry.session.status} · Menu terakhir: {entry.session.current_menu} · Progres{" "}
                    {entry.session.progress}%
                    {entry.session.completed_at ? ` · Selesai ${formatDate(entry.session.completed_at)}` : ""}
                  </p>
                </div>
              </div>

              <h3 className="mt-5 font-display text-sm font-extrabold text-ink">Jawaban siswa</h3>
              {entry.answers.length ? (
                <ul className="mt-3 space-y-3">
                  {entry.answers.map((answer, i) => (
                    <li
                      key={answer.id}
                      className={cx(
                        "rounded-3xl border-2 p-4",
                        answer.is_correct ? "border-aqua/35 bg-aqua-soft/50" : "border-coral/35 bg-coral-soft/40",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-xs font-black uppercase tracking-widest text-ink/55">
                          {MENU_LABEL[answer.menu_type] ?? answer.menu_type} · Soal {i + 1}
                        </p>
                        <span className="flex items-center gap-2">
                          <Badge tone={answer.is_correct ? "aqua" : "coral"}>
                            {answer.is_correct ? "Tepat" : "Belum tepat"}
                          </Badge>
                          <span className="font-display text-sm font-extrabold text-ink">{answer.score}</span>
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-ink">{answer.question_text}</p>
                      {answer.context ? (
                        <p className="mt-1 text-xs leading-relaxed text-ink/60">{answer.context}</p>
                      ) : null}
                      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/85 px-3 py-2">
                          <dt className="font-bold text-ink/50">Jawaban siswa</dt>
                          <dd className="mt-0.5 font-semibold text-ink">
                            {answer.answer_text} · alasan {answer.selected_reason}: {answer.reason_text}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-white/85 px-3 py-2">
                          <dt className="font-bold text-teal-700">Kunci jawaban</dt>
                          <dd className="mt-0.5 font-semibold text-ink">
                            {answer.correct_answer === "fungsi" ? "Fungsi" : "Bukan fungsi"} · alasan{" "}
                            {answer.correct_reason}
                          </dd>
                        </div>
                      </dl>
                      {answer.explanation ? (
                        <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-ink/70">
                          <strong>Pembahasan:</strong> {answer.explanation}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-ink/45">Dijawab {formatDate(answer.answered_at)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm text-ink/50">
                  Belum ada jawaban pada sesi ini.
                </p>
              )}

              {entry.reflection ? (
                <div className="mt-5 rounded-3xl bg-grape-soft p-5">
                  <h3 className="font-display text-sm font-extrabold text-violet-800">💬 Refleksi siswa</h3>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                    <Info label="Perasaan" value={entry.reflection.feeling} />
                    <Info label="Pemahaman" value={entry.reflection.understanding} />
                    <Info label="Menu favorit" value={entry.reflection.favorite_menu} />
                  </dl>
                  <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm italic leading-relaxed text-ink/75">
                    “{entry.reflection.learning_reflection}”
                  </p>
                  <p className="mt-2 text-[11px] text-ink/50">
                    Dikirim {formatDate(entry.reflection.submitted_at)}
                  </p>
                </div>
              ) : (
                <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-ink/50">
                  Refleksi belum dikirim pada sesi ini.
                </p>
              )}
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/85 px-4 py-2 text-center shadow-sm ring-1 ring-brand-soft">
      <p className="font-display text-lg font-extrabold text-brand-dark">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">{label}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/75 px-3 py-2">
      <dt className="font-bold text-ink/50">{label}</dt>
      <dd className="mt-0.5 font-display font-extrabold text-ink">{value}</dd>
    </div>
  );
}
