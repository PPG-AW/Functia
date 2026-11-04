"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Loader, cx, inputClass } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";
import type { RecapRow } from "@/lib/recap";
import type { StudentReflection } from "@/lib/store/types";

type Overview = { classes: string[]; recap: RecapRow[]; reflections: StudentReflection[] };

const FEELING_TONE: Record<string, string> = {
  "Sangat senang": "aqua",
  Senang: "brand",
  "Biasa saja": "sun",
  "Masih merasa kesulitan": "coral",
};

export default function RefleksiPage() {
  const { data, loading, error, reload } = useApi<Overview>("/api/teacher/overview");
  const [kelas, setKelas] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const bySession = new Map(data.recap.filter((r) => r.session).map((r) => [r.session!.id, r]));
    return data.reflections
      .map((reflection) => ({ reflection, row: bySession.get(reflection.session_id) }))
      .filter((item) => !kelas || item.row?.student.class_name === kelas)
      .sort(
        (a, b) =>
          new Date(b.reflection.submitted_at).getTime() - new Date(a.reflection.submitted_at).getTime(),
      );
  }, [data, kelas]);

  if (loading) return <Loader label="Memuat refleksi siswa..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Refleksi tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
        </div>
      </div>
    );

  const counts = ["Sangat senang", "Senang", "Biasa saja", "Masih merasa kesulitan"].map((label) => ({
    label,
    total: data.reflections.filter((r) => r.feeling === label).length,
  }));
  const understandingCounts = [
    "Sangat memahami",
    "Cukup memahami",
    "Masih perlu belajar lagi",
    "Belum memahami",
  ].map((label) => ({
    label,
    total: data.reflections.filter((r) => r.understanding === label).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="grape">Data Refleksi</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Refleksi Siswa</h1>
          <p className="text-sm text-ink/60">
            {data.reflections.length} refleksi terkirim dari {data.recap.length} siswa.
          </p>
        </div>
        <select className={cx(inputClass, "max-w-xs")} value={kelas} onChange={(e) => setKelas(e.target.value)}>
          <option value="">Semua kelas</option>
          {data.classes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-sm font-extrabold text-ink">Perasaan siswa</h2>
          <ul className="mt-3 space-y-2">
            {counts.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-ink/75">{item.label}</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-grape to-brand"
                      style={{
                        width: `${data.reflections.length ? (item.total / data.reflections.length) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className="w-6 text-right font-display font-extrabold text-ink">{item.total}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-sm font-extrabold text-ink">Pemahaman materi</h2>
          <ul className="mt-3 space-y-2">
            {understandingCounts.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-ink/75">{item.label}</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-aqua to-sky"
                      style={{
                        width: `${data.reflections.length ? (item.total / data.reflections.length) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className="w-6 text-right font-display font-extrabold text-ink">{item.total}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ reflection, row }) => (
            <Card key={reflection.id} hover className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-extrabold text-ink">
                    {row?.student.name ?? "Siswa"}{" "}
                    <span className="text-xs font-semibold text-ink/50">
                      · absen {row?.student.attendance_number ?? "-"} · {row?.student.class_name ?? "-"}
                    </span>
                  </p>
                  <p className="text-[11px] text-ink/45">{formatDate(reflection.submitted_at)}</p>
                </div>
                <Badge tone={FEELING_TONE[reflection.feeling] ?? "slate"}>{reflection.feeling}</Badge>
              </div>

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-soft/50 px-3 py-2">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-ink/50">Pemahaman</dt>
                  <dd className="text-xs font-bold text-ink">{reflection.understanding}</dd>
                </div>
                <div className="rounded-2xl bg-sun-soft/70 px-3 py-2">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-ink/50">Menu favorit</dt>
                  <dd className="text-xs font-bold text-ink">{reflection.favorite_menu}</dd>
                </div>
              </dl>

              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm italic leading-relaxed text-ink/75 ring-1 ring-brand-soft/70">
                “{reflection.learning_reflection}”
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💬"
          title="Belum ada refleksi"
          description="Refleksi akan muncul di sini setelah siswa mengirim jawaban pada menu Refleksi."
        />
      )}
    </div>
  );
}
