"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, EmptyState, Loader, cx } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";

type AnswerDetail = {
  number: number;
  question_title: string;
  key: string;
  text: string;
  correct_key: string;
  is_correct: boolean;
  explanation: string;
};

type HomeworkRow = {
  student_id: string;
  student_name: string;
  attendance_number: number;
  class_name: string;
  session_id: string;
  selected: number[];
  selected_count: number;
  answered: number[];
  answered_count: number;
  answers: AnswerDetail[];
  submitted_at: string | null;
  status: string;
  score: number | null;
  correct_count: number;
  total_answered: number;
};

type Response = {
  rows: HomeworkRow[];
  totalQuestions: number;
  summary: {
    totalStudents: number;
    working: number;
    submitted: number;
    inProgress: number;
    averageScore: number;
  };
};

export default function GuruTugasRumahPage() {
  const { data, loading, error, reload } = useApi<Response>("/api/teacher/homework");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading) return <Loader label="Memuat rekap Tugas Rumah..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Rekap Tugas Rumah tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
        </div>
      </div>
    );

  const q = query.trim().toLowerCase();
  const rows = data.rows.filter(
    (row) => !q || row.student_name.toLowerCase().includes(q) || row.class_name.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="grape">Rekap Portal Guru</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Tugas Rumah</h1>
          <p className="text-sm text-ink/60">
            Data Tugas Rumah tampil terpisah dari rekap Misi Penyelidikan dan Uji Pemahaman.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/guru/rekap">
            <Button variant="secondary" size="sm">
              📋 Rekap Lama
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => void reload()}>
            🔄 Muat Ulang
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Siswa mengerjakan" value={data.summary.working} tone="from-brand to-sky" />
        <Stat label="Sudah dikumpulkan" value={data.summary.submitted} tone="from-aqua to-emerald-400" />
        <Stat label="Masih draf" value={data.summary.inProgress} tone="from-sun to-amber-400" />
        <Stat label="Rata-rata nilai" value={data.summary.averageScore} tone="from-grape to-violet-400" />
      </div>

      <Card className="p-4 sm:p-5">
        <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">
          Cari nama siswa atau kelas
        </label>
        <input
          className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 sm:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Contoh: Andi atau VIII-A"
        />
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-brand-soft/60 text-[11px] uppercase tracking-wide text-brand-dark">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Absen</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Jumlah Dipilih</th>
                <th className="px-4 py-3">Nomor Dikerjakan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Pengumpulan</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.session_id} className="border-t border-slate-100 align-top hover:bg-brand-soft/20">
                  <td className="px-4 py-3 text-ink/60">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-ink">{row.student_name}</td>
                  <td className="px-4 py-3 text-ink/70">{row.attendance_number}</td>
                  <td className="px-4 py-3 text-ink/70">{row.class_name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{row.selected_count} soal</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/70">
                    {row.answered.length ? row.answered.join(", ") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={row.status === "terkumpul" ? "aqua" : row.status === "menunggu" ? "sun" : "slate"}>
                      {row.status === "terkumpul" ? "Terkumpul" : row.status === "menunggu" ? "Draf" : "Belum"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/65">
                    {row.submitted_at ? formatDate(row.submitted_at) : "Belum dikumpulkan"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display text-sm font-extrabold text-ink">
                      {row.score === null ? "-" : row.score}
                    </span>
                    {row.score !== null ? (
                      <span className="block text-[11px] text-ink/50">{row.correct_count} jawaban tepat</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setOpenId(openId === row.session_id ? null : row.session_id)}
                    >
                      {openId === row.session_id ? "Tutup" : "Lihat"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!rows.length ? (
          <div className="p-6">
            <EmptyState
              icon="📝"
              title="Belum ada data Tugas Rumah"
              description="Data akan muncul setelah siswa memilih dan menjawab soal pada menu Tugas Rumah."
            />
          </div>
        ) : null}
      </Card>

      {openId
        ? rows
            .filter((row) => row.session_id === openId)
            .map((row) => (
              <Card key={`detail-${row.session_id}`} className="animate-fade-up p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-ink">
                      Jawaban {row.student_name}
                    </h2>
                    <p className="text-xs text-ink/60">
                      Absen {row.attendance_number} · Kelas {row.class_name} · {row.selected_count} soal
                      dipilih · {row.answered_count} soal dijawab
                    </p>
                  </div>
                  <Badge tone="grape">Nilai {row.score === null ? "-" : row.score}</Badge>
                </div>

                <ul className="mt-4 space-y-3">
                  {row.answers.map((answer) => (
                    <li
                      key={answer.number}
                      className={cx(
                        "rounded-3xl border-2 p-4",
                        answer.is_correct ? "border-aqua/35 bg-aqua-soft/40" : "border-coral/35 bg-coral-soft/40",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-xs font-black uppercase tracking-widest text-ink/55">
                          Soal {answer.number} · {answer.question_title}
                        </p>
                        <Badge tone={answer.is_correct ? "aqua" : "coral"}>
                          {answer.is_correct ? "Tepat" : "Belum tepat"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">
                        Jawaban siswa ({answer.key}): {answer.text}
                      </p>
                      <p className="mt-1 text-xs text-ink/65">Kunci jawaban: {answer.correct_key}</p>
                      <p className="mt-2 rounded-2xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-ink/70">
                        <strong>Pembahasan:</strong> {answer.explanation}
                      </p>
                    </li>
                  ))}
                </ul>
                {!row.answers.length ? (
                  <p className="mt-4 text-sm text-ink/60">Siswa belum menjawab soal yang dipilih.</p>
                ) : null}
              </Card>
            ))
        : null}

      <p className="text-center text-xs text-ink/50">
        Rekap lama (Misi Penyelidikan, Uji Pemahaman, Refleksi, dan ekspor CSV) tetap tersedia tanpa
        perubahan.
      </p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card hover className="overflow-hidden p-0">
      <div className={cx("h-1.5 w-full bg-gradient-to-r", tone)} />
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink/55">{label}</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-ink">{value}</p>
      </div>
    </Card>
  );
}
