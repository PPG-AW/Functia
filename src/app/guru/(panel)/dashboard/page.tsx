"use client";

import Link from "next/link";
import { HomeworkSummaryCard } from "@/components/HomeworkSummaryCard";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";
import { MENU_LABEL } from "@/lib/recap";
import type { RecapRow } from "@/lib/recap";
import type { StoreStatus } from "@/lib/store";
import type { StudentReflection } from "@/lib/store/types";

type Overview = {
  storage: StoreStatus;
  stats: {
    totalStudents: number;
    entered: number;
    finished: number;
    inProgress: number;
    totalAnswers: number;
    correctAnswers: number;
    averageMisi: number;
    averageUji: number;
    reflections: number;
  };
  classes: string[];
  recap: RecapRow[];
  reflections: StudentReflection[];
  recentActivity: Array<{
    id: string;
    studentName: string;
    className: string;
    menu: string;
    score: number;
    isCorrect: boolean;
    at: string;
  }>;
};

export default function TeacherDashboard() {
  const { data, loading, error, reload } = useApi<Overview>("/api/teacher/overview");

  if (loading) return <Loader label="Memuat ringkasan aktivitas siswa..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Data tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
        </div>
      </div>
    );

  const { stats } = data;
  const accuracy = stats.totalAnswers ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const perClass = data.classes.map((kelas) => {
    const rows = data.recap.filter((r) => r.student.class_name === kelas);
    return {
      kelas,
      total: rows.length,
      entered: rows.filter((r) => r.session).length,
      finished: rows.filter((r) => r.status === "Selesai").length,
    };
  });

  const cards = [
    { label: "Siswa terdaftar", value: stats.totalStudents, icon: "🧑‍🎓", tone: "from-brand to-sky" },
    { label: "Siswa telah masuk", value: stats.entered, icon: "🚪", tone: "from-aqua to-emerald-400" },
    { label: "Sedang mengerjakan", value: stats.inProgress, icon: "✏️", tone: "from-sun to-amber-400" },
    { label: "Menyelesaikan pembelajaran", value: stats.finished, icon: "🏁", tone: "from-grape to-violet-400" },
    { label: "Jawaban tersimpan", value: stats.totalAnswers, icon: "📨", tone: "from-coral to-rose-400" },
    { label: "Refleksi terkirim", value: stats.reflections, icon: "💬", tone: "from-sky to-brand" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand">Dashboard Guru</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            FUNCTIA – Petualangan Relasi dan Fungsi
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Pembelajaran matematika kelas VIII SMP · Problem Based Learning × Culturally Responsive
            Teaching · Kearifan lokal Kota Salatiga
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/guru/rekap">
            <Button variant="secondary" size="sm">
              📋 Rekap Hasil
            </Button>
          </Link>
          <Link href="/guru/soal">
            <Button variant="secondary" size="sm">
              🛠️ Kelola Soal
            </Button>
          </Link>
        </div>
      </div>

      <div
        className={cx(
          "rounded-3xl px-4 py-3 text-xs font-semibold",
          data.storage.online ? "bg-aqua-soft text-teal-800" : "bg-sun-soft text-amber-800",
        )}
      >
        <span className="mr-1.5">{data.storage.online ? "🟢" : "🟡"}</span>
        {data.storage.message}{" "}
        <Link href="/konfigurasi" className="underline underline-offset-2">
          Detail
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} hover className="overflow-hidden p-0">
            <div className={cx("h-1.5 w-full bg-gradient-to-r", card.tone)} />
            <div className="flex items-center gap-4 p-5">
              <span
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-md",
                  card.tone,
                )}
              >
                {card.icon}
              </span>
              <div>
                <p className="font-display text-3xl font-extrabold text-ink">{card.value}</p>
                <p className="text-xs font-semibold text-ink/60">{card.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <HomeworkSummaryCard />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-base font-extrabold text-ink">Ringkasan aktivitas siswa</h2>
          <p className="text-xs text-ink/55">Sepuluh aktivitas pengiriman jawaban terbaru.</p>
          {data.recentActivity.length ? (
            <ul className="mt-4 space-y-2">
              {data.recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-brand-soft/70"
                >
                  <span className="text-sm font-semibold text-ink">
                    {item.studentName}{" "}
                    <span className="text-xs font-medium text-ink/50">· {item.className}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs">
                    <Badge tone={item.menu === "misi" ? "coral" : "sun"}>
                      {MENU_LABEL[item.menu] ?? item.menu}
                    </Badge>
                    <span className={cx("font-display font-extrabold", item.isCorrect ? "text-teal-600" : "text-rose-500")}>
                      {item.score}
                    </span>
                    <span className="text-ink/45">{formatDate(item.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-ink/50">
              Belum ada aktivitas. Data akan muncul setelah siswa mengerjakan Misi Penyelidikan atau Uji
              Pemahaman.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-extrabold text-ink">Rata-rata hasil</h2>
          <div className="mt-4 space-y-4">
            <ScoreBar label="Misi Penyelidikan" value={stats.averageMisi} tone="from-coral to-rose-400" />
            <ScoreBar label="Uji Pemahaman" value={stats.averageUji} tone="from-sun to-amber-400" />
            <ScoreBar label="Ketepatan jawaban" value={accuracy} tone="from-aqua to-emerald-400" />
          </div>
          <h3 className="mt-6 font-display text-sm font-extrabold text-ink">Distribusi per kelas</h3>
          <div className="mt-3 space-y-2">
            {perClass.length ? (
              perClass.map((row) => (
                <div key={row.kelas} className="rounded-2xl bg-brand-soft/50 px-3 py-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink/70">
                    <span>{row.kelas}</span>
                    <span>
                      {row.entered}/{row.total} masuk · {row.finished} selesai
                    </span>
                  </div>
                  <ProgressBar value={row.total ? (row.entered / row.total) * 100 : 0} className="mt-1.5 h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/50">Belum ada data siswa.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-extrabold text-ink">Rekap cepat</h2>
          <Link href="/guru/rekap">
            <Button size="sm" variant="secondary">
              Lihat rekap lengkap →
            </Button>
          </Link>
        </div>
        {data.recap.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-3">Nama</th>
                  <th className="py-2 pr-3">Kelas</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Misi</th>
                  <th className="py-2 pr-3">Uji</th>
                  <th className="py-2 pr-3">Refleksi</th>
                  <th className="py-2">Progres</th>
                </tr>
              </thead>
              <tbody>
                {data.recap.slice(0, 6).map((row) => (
                  <tr key={row.student.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-semibold text-ink">{row.student.name}</td>
                    <td className="py-2.5 pr-3 text-ink/70">{row.student.class_name}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={row.status === "Selesai" ? "aqua" : row.status === "Sedang Dikerjakan" ? "sun" : "slate"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70">
                      {row.misi.answered}/{row.misi.total} · {row.misi.answered ? row.misi.score : "-"}
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70">
                      {row.uji.answered}/{row.uji.total} · {row.uji.answered ? row.uji.score : "-"}
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70">{row.reflection ? "✓" : "-"}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={row.session?.progress ?? 0} className="h-2 w-24" />
                        <span className="text-xs font-bold text-ink/60">{row.session?.progress ?? 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-ink/50">
            Belum ada siswa yang masuk. Bagikan tautan Portal Siswa kepada kelas Anda.
          </p>
        )}
      </Card>
    </div>
  );
}

function ScoreBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-ink/70">
        <span>{label}</span>
        <span className="font-display text-base text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx("h-full rounded-full bg-gradient-to-r transition-all duration-700", tone)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
