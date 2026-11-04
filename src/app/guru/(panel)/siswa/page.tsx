"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx, inputClass } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";
import type { RecapRow } from "@/lib/recap";

type Overview = { classes: string[]; recap: RecapRow[] };

export default function DataSiswaPage() {
  const { data, loading, error, reload } = useApi<Overview>("/api/teacher/overview");
  const [query, setQuery] = useState("");
  const [kelas, setKelas] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.recap.filter(
      (row) =>
        (!q || row.student.name.toLowerCase().includes(q) || String(row.student.attendance_number) === q) &&
        (!kelas || row.student.class_name === kelas),
    );
  }, [data, query, kelas]);

  if (loading) return <Loader label="Memuat data siswa..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Data siswa tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand">Data Siswa</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Identitas & Sesi Belajar</h1>
          <p className="text-sm text-ink/60">
            {rows.length} siswa ditampilkan. Data identitas tersimpan otomatis saat siswa menekan “Mulai
            Petualangan”.
          </p>
        </div>
        <Link href="/guru/rekap">
          <Button variant="secondary" size="sm">
            📋 Buka Rekap Hasil
          </Button>
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">
              Cari nama / nomor absen
            </label>
            <input
              className={cx(inputClass, "mt-1")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Budi atau 12"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">Kelas</label>
            <select className={cx(inputClass, "mt-1")} value={kelas} onChange={(e) => setKelas(e.target.value)}>
              <option value="">Semua kelas</option>
              {data.classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <Card key={row.student.id} hover className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-aqua font-display text-sm font-black text-white">
                    {row.student.attendance_number}
                  </span>
                  <div>
                    <p className="font-display text-sm font-extrabold leading-tight text-ink">
                      {row.student.name}
                    </p>
                    <p className="text-xs text-ink/55">Kelas {row.student.class_name}</p>
                  </div>
                </div>
                <Badge
                  tone={row.status === "Selesai" ? "aqua" : row.status === "Sedang Dikerjakan" ? "sun" : "slate"}
                >
                  {row.status}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink/55">
                  <span>Progres</span>
                  <span>{row.session?.progress ?? 0}%</span>
                </div>
                <ProgressBar value={row.session?.progress ?? 0} className="mt-1.5 h-2" />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-brand-soft/50 px-3 py-2">
                  <dt className="text-ink/55">Misi</dt>
                  <dd className="font-display text-sm font-extrabold text-ink">
                    {row.misi.answered}/{row.misi.total}
                  </dd>
                </div>
                <div className="rounded-xl bg-sun-soft/70 px-3 py-2">
                  <dt className="text-ink/55">Uji</dt>
                  <dd className="font-display text-sm font-extrabold text-ink">
                    {row.uji.answered}/{row.uji.total}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-[11px] text-ink/50">
                {row.session ? `Sesi: ${formatDate(row.session.started_at)}` : "Belum pernah masuk"}
                {row.reflection ? " · Refleksi terkirim" : ""}
              </p>

              <Link href={`/guru/siswa/${row.student.id}`} className="mt-4 block">
                <Button size="sm" full variant={row.session ? "primary" : "secondary"}>
                  Detail Jawaban
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🧑‍🎓"
          title="Belum ada data siswa"
          description="Siswa akan otomatis terdaftar setelah mengisi identitas pada Portal Siswa."
        />
      )}
    </div>
  );
}
